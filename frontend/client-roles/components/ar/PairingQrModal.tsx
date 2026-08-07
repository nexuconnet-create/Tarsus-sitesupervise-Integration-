"use client";

import { useState, useEffect } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { trimbleDeviceService } from "@/lib/services/trimbleDeviceService";

interface PairingQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectUuid: string;
  deviceUuid: string;
  deviceName: string;
}

/**
 * Project-context pairing QR (AR Hub → Devices on Site).
 * Shows the QR on screen and downloads the printable A4 sheet rendered by the
 * backend (ReportLab) — print it and place it on the wall on site to scan.
 */
const PairingQrModal = ({
  isOpen,
  onClose,
  projectUuid,
  deviceUuid,
  deviceName,
}: PairingQrModalProps) => {
  // The parent remounts this modal per device (via `key`), so initial state is
  // always fresh — no need to reset synchronously inside the effect.
  const [qrData, setQrData] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!projectUuid || !deviceUuid) return;
    let cancelled = false;
    trimbleDeviceService
      .getProjectDeviceQr(projectUuid, deviceUuid)
      .then((res) => {
        if (!cancelled) setQrData(res.data.qr_data);
      })
      .catch((err: unknown) => {
        const e = err as { response?: { data?: { error?: string } } };
        toast.error(e.response?.data?.error || "Failed to generate QR code");
        if (!cancelled) onClose();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectUuid, deviceUuid, onClose]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await trimbleDeviceService.downloadPairingPdf(
        projectUuid,
        deviceUuid,
      );
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pairing-${deviceName.replace(/[^a-z0-9-_]+/gi, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download pairing PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-1">Pairing QR Code</h2>
        <p className="text-sm text-gray-500 mb-6">
          {deviceName} (UUID: {deviceUuid.slice(0, 8)}...)
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 flex items-center justify-center min-h-[252px]">
          {loading ? (
            <Loader2 className="animate-spin text-gray-400" size={28} />
          ) : qrData ? (
            <QRCodeSVG value={qrData} size={220} level="H" includeMargin />
          ) : (
            <p className="text-sm text-gray-400">No QR data available</p>
          )}
        </div>

        <p className="text-xs text-gray-400 mb-6">
          Scan with the XR10 headset to pair. Download the PDF to print and place
          the code on the wall on site.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={!qrData || downloading}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#021422] hover:bg-gray-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PairingQrModal;
