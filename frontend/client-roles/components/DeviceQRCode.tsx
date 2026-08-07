"use client";

import React, { useRef, useCallback } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

interface DeviceQRCodeProps {
  deviceName: string;
  qrPayload: Record<string, unknown>;
  onDownloadPdf?: () => void;
}

export default function DeviceQRCode({
  deviceName,
  qrPayload,
  onDownloadPdf,
}: DeviceQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!canvasRef.current) return;

    const jsonPayload = JSON.stringify(qrPayload);

    QRCode.toCanvas(canvasRef.current, jsonPayload, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then(() => {
        setQrDataUrl(canvasRef.current!.toDataURL("image/png"));
      })
      .catch((err: Error) => {
        console.error("QR generation failed:", err);
      });
  }, [qrPayload]);

  const handleDownloadPdf = useCallback(() => {
    if (!qrDataUrl) return;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Title
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("XR10 Device Pairing QR Code", pageWidth / 2, 20, {
      align: "center",
    });

    // Device name
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Device: ${deviceName}`, pageWidth / 2, 30, { align: "center" });

    // Instructions
    pdf.setFontSize(10);
    pdf.text(
      "Scan this QR code with the HoloLens headset to pair the device.",
      pageWidth / 2,
      40,
      { align: "center" }
    );

    // QR code image
    const qrSize = 80;
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = 50;
    pdf.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    // QR payload info
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    const infoY = qrY + qrSize + 10;
    pdf.text("QR Payload contains:", pageWidth / 2, infoY, { align: "center" });

    const payload = qrPayload as Record<string, string>;
    const infoLines = [
      `Device UUID: ${payload.device_uuid || "N/A"}`,
      `Device Name: ${payload.device_name || deviceName}`,
      `Project ID: ${payload.trimble_project_id || "N/A"}`,
      `Platform URL: ${payload.platform_url || "N/A"}`,
    ];

    infoLines.forEach((line, index) => {
      pdf.text(line, pageWidth / 2, infoY + 5 + index * 4, { align: "center" });
    });

    // Footer
    pdf.setFontSize(7);
    pdf.setTextColor(128);
    pdf.text(
      "This QR code contains sensitive authentication data. Handle with care.",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    // Download
    pdf.save(`XR10_Pairing_QR_${deviceName.replace(/\s+/g, "_")}.pdf`);

    onDownloadPdf?.();
  }, [qrDataUrl, deviceName, qrPayload, onDownloadPdf]);

  const handleDownloadPng = useCallback(() => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = `XR10_Pairing_QR_${deviceName.replace(/\s+/g, "_")}.png`;
    link.href = qrDataUrl;
    link.click();
  }, [qrDataUrl, deviceName]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="hidden" />

      {qrDataUrl && (
        <>
          <div className="border rounded-lg p-4 bg-white">
            <img
              src={qrDataUrl}
              alt={`QR Code for ${deviceName}`}
              width={300}
              height={300}
            />
          </div>

          <div className="text-sm text-gray-500 text-center">
            <p className="font-medium">{deviceName}</p>
            <p className="text-xs mt-1">
              Scan with HoloLens headset to pair
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </button>

            <button
              onClick={handleDownloadPng}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Download PNG
            </button>
          </div>
        </>
      )}
    </div>
  );
}
