"use client";

import { useState, useCallback } from "react";
import { X, Download, Flag, AlertTriangle } from "lucide-react";
import type { ARCapture } from "@/lib/types/capture";
import { captureService } from "@/lib/services/captureService";

interface CapturePreviewProps {
  capture: ARCapture;
  projectUuid?: string;
  sessionUuid?: string;
  onClose: () => void;
}

export default function CapturePreview({
  capture,
  projectUuid,
  sessionUuid,
  onClose,
}: CapturePreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = useCallback(async () => {
    const filename = `capture_${capture.uuid.slice(0, 8)}.jpg`;

    // Same-origin API endpoint honors the download attribute directly.
    if (projectUuid && sessionUuid) {
      const url = captureService.downloadFileUrl(projectUuid, sessionUuid, capture.uuid);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      return;
    }

    // Cross-origin blob URL: the download attribute is ignored, so fetch the
    // image and download it via an object URL to force a save instead of a
    // navigation.
    if (!capture.image_url) return;
    try {
      const res = await fetch(capture.image_url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fall back to opening the image if the fetch is blocked.
      window.open(capture.image_url, "_blank");
    }
  }, [capture, projectUuid, sessionUuid]);

  const imageUrl = capture.image_url || "";
  const timestamp = capture.timestamp
    ? new Date(capture.timestamp).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown";
  const location = capture.location_hint || "Unknown";
  const typeLabel = capture.capture_type === "flag" ? "Flag" : "Screenshot";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 z-10 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="bg-gray-900 flex items-center justify-center" style={{ minHeight: 350 }}>
          {!imageLoaded && !imageError && (
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-700" />
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          )}
          {imageError && (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <AlertTriangle size={36} />
              <p className="text-sm">Failed to load image</p>
            </div>
          )}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={`Capture ${capture.uuid}`}
              className="max-w-full max-h-[70vh] object-contain"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{ display: imageLoaded ? "block" : "none" }}
            />
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {typeLabel} — {location}
              </h3>
              <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                <span>{timestamp}</span>
                {capture.taken_by_name && (
                  <span>{capture.taken_by_name}</span>
                )}
                {capture.file_size_bytes > 0 && (
                  <span>
                    {(capture.file_size_bytes / 1024).toFixed(0)} KB
                  </span>
                )}
              </div>
              {capture.capture_type === "flag" && capture.flag_text && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <Flag size={12} />
                  {capture.flag_text}
                  {capture.flag_measurement && ` — ${capture.flag_measurement}`}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleDownload}
              disabled={!capture.uuid}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-lg transition-colors"
            >
              <Download size={14} />
              Download Image
            </button>
            {capture.capture_type === "flag" && !capture.is_linked_to_issue && (
              <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                <Flag size={14} />
                Create Issue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
