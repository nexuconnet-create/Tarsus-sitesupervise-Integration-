"use client";

import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";

interface QRCodeDisplayProps {
  value: string;
  poNumber?: string;
  size?: number;
  showPrint?: boolean;
}

export default function QRCodeDisplay({
  value,
  poNumber,
  size = 200,
  showPrint = true,
}: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
      {poNumber && (
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {poNumber}
        </p>
      )}

      <QRCodeSVG
        value={value}
        size={size}
        bgColor="#ffffff"
        fgColor="#021422"
        level="M"
      />

      <p className="text-[10px] text-gray-400 text-center break-all max-w-[260px] leading-snug">
        {value}
      </p>

      {showPrint && (
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Printer size={14} />
          Print QR
        </button>
      )}
    </div>
  );
}
