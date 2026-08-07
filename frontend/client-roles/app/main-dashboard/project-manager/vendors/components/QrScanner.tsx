"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface QrScannerProps {
  onScan: (text: string) => void;
  onError?: (message: string) => void;
}

const SCANNER_ELEMENT_ID = "pm-qr-scanner";

const QrScanner: React.FC<QrScannerProps> = ({ onScan, onError }) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let scanner: { render: (onScan: (text: string) => void, onError: (errorMessage: string) => void) => void; clear: () => Promise<void> } | null = null;

    const start = async () => {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        scanner = new Html5QrcodeScanner(
          SCANNER_ELEMENT_ID,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          /* verbose */ false
        );

        await scanner.render(
          (decodedText) => {
            onScan(decodedText);
          },
          (errorMessage) => {
            // html5-qrcode fires many "not found" errors while searching; ignore benign ones
            if (
              errorMessage?.includes("NotFoundException") ||
              errorMessage?.includes("No MultiFormat Readers")
            ) {
              return;
            }
            onError?.(errorMessage);
          }
        );
        setReady(true);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Camera failed to start";
        if (msg.toLowerCase().includes("permission")) {
          setPermissionDenied(true);
        }
        onError?.(msg);
      }
    };

    start();

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [onScan, onError]);

  return (
    <div className="relative w-full">
      {!ready && !permissionDenied && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" />
          Starting camera...
        </div>
      )}
      {permissionDenied && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Camera permission was denied. Please allow camera access and reload, or enter the delivery code manually below.
        </div>
      )}
      <div id={SCANNER_ELEMENT_ID} ref={scannerRef} className="rounded-lg overflow-hidden" />
    </div>
  );
};

export default QrScanner;
