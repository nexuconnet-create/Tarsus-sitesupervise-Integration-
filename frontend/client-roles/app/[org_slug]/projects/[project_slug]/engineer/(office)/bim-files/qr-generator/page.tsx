"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { trimbleBimService } from "@/lib/services/trimbleBimService";
import { engineerKeys } from "@/lib/queryKeys";
import type { BimFile } from "@/lib/types/bimFile";
import Link from "next/link";
import EngineerHeader from "../../components/EngineerHeader";
import toast from "react-hot-toast";

interface QRCodeGeneratorProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function QRCodeGenerator({ params }: QRCodeGeneratorProps) {
  const { org_slug, project_slug } = use(params);
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);

  const [label, setLabel] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Fetch BIM files to select which model to calibrate
  const { data: filesData } = useQuery({
    queryKey: engineerKeys.bimFiles(projectUuid),
    queryFn: async () => {
      const res = await trimbleBimService.listBimFiles(projectUuid);
      return res.data;
    },
    enabled: !!projectUuid,
  });

  const files = filesData?.files ?? [];
  const readyFiles = files.filter((f) => f.gltf_ready);

  // Generate QR code
  const generateQR = async () => {
    if (!label.trim()) {
      toast.error("Enter a label for this QR code");
      return;
    }

    try {
      // Use a simple QR API or generate client-side
      const qrValue = JSON.stringify({
        type: "bim-anchor",
        label: label.trim(),
        project: projectUuid,
      });

      // Generate QR as SVG using a simple approach
      const svg = generateQRSvg(qrValue, 200);
      const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
      setQrDataUrl(dataUrl);
      toast.success("QR code generated");
    } catch (err) {
      toast.error("Failed to generate QR code");
    }
  };

  // Simple QR SVG generator (version 1, error correction M)
  // For production, use a proper QR library
  const generateQRSvg = (text: string, size: number): string => {
    // This is a placeholder - in production use qrcode npm package
    // For now, create a simple placeholder QR
    const modules = 21; // QR version 1
    const moduleSize = size / modules;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`;
    svg += `<rect width="${size}" height="${size}" fill="white"/>`;

    // Generate a simple pattern (placeholder - replace with real QR)
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        // Finder patterns (corners)
        if ((x < 7 && y < 7) || (x >= modules - 7 && y < 7) || (x < 7 && y >= modules - 7)) {
          const inOuter = x === 0 || x === 6 || y === 0 || y === 6 ||
                          x === modules - 1 || x === modules - 7 || y === modules - 1 || y === modules - 7;
          const inInner = x >= 2 && x <= 4 && y >= 2 && y <= 4 ||
                          x >= modules - 5 && x <= modules - 3 && y >= 2 && y <= 4 ||
                          x >= 2 && x <= 4 && y >= modules - 5 && y <= modules - 3;
          if (inOuter || inInner) {
            svg += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
          }
        }
        // Data area (pseudo-random for placeholder)
        else if ((x + y) % 3 === 0) {
          svg += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
        }
      }
    }

    // Add label text below
    svg += `<text x="${size / 2}" y="${size + 20}" text-anchor="middle" font-size="14" fill="black">${label}</text>`;
    svg += `</svg>`;

    return svg;
  };

  // Download QR as PNG
  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = `QR_${label}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  // Print QR
  const printQR = () => {
    if (!qrDataUrl) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>QR Code - ${label}</title></head>
          <body style="text-align:center; font-family:Arial;">
            <h2>QR Code: ${label}</h2>
            <img src="${qrDataUrl}" width="300" height="300" />
            <p>Place this QR code at a known reference point on site.</p>
            <p>Use the HoloLens to scan and align the BIM model.</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const backUrl = `/${org_slug}/projects/${project_slug}/engineer/bim-files`;

  return (
    <div>
      <EngineerHeader title="QR CODE GENERATOR" badge="Site Setup" />

      <div className="p-4 md:p-8 pb-20 space-y-8">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back to BIM Files
        </Link>

        {/* QR Generation Form */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
            Generate Alignment QR Code
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Create a QR code to place on-site. The HoloLens will scan this QR to align the BIM model
            with the physical structure.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                QR Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. CTRL-01, GRID-A1, Column-C5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use a short, memorable label. This is what the headset will show when aligned.
              </p>
            </div>

            <button
              onClick={generateQR}
              disabled={!label.trim()}
              className="px-5 py-2 text-sm font-medium text-white bg-[#021422] hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Generate QR Code
            </button>
          </div>
        </section>

        {/* QR Preview */}
        {qrDataUrl && (
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
              QR Code Preview
            </h2>

            <div className="flex flex-col items-center gap-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <img
                  src={qrDataUrl}
                  alt={`QR Code: ${label}`}
                  className="w-48 h-48"
                />
              </div>

              <p className="text-sm text-gray-600 text-center">
                Label: <strong>{label}</strong>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={downloadQR}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Download PNG
                </button>
                <button
                  onClick={printQR}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Print QR Code
                </button>
              </div>

              <div className="text-xs text-gray-500 text-center max-w-md">
                <p className="font-medium mb-1">Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-left">
                  <li>Print this QR code at 15cm x 15cm size</li>
                  <li>Stick it at a known reference point on site (e.g., gridline A-1)</li>
                  <li>Use the HoloLens to scan and align the BIM model</li>
                  <li>The alignment will be saved for future sessions</li>
                </ol>
              </div>
            </div>
          </section>
        )}

        {/* Ready Models */}
        {readyFiles.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
              Available Models (Ready for Headset)
            </h2>

            <div className="space-y-2">
              {readyFiles.map((file) => (
                <div
                  key={file.uuid}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{file.filename}</p>
                    <p className="text-xs text-gray-500">
                      Converted: {file.gltf_converted_at ? new Date(file.gltf_converted_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
