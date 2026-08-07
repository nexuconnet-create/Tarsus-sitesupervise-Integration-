"use client";

import { useState, useCallback } from "react";
import { Camera, Download, LayoutGrid, List } from "lucide-react";
import type { ARCapture } from "@/lib/types/capture";
import CaptureTable from "./CaptureTable";
import CapturePreview from "./CapturePreview";
import { captureService } from "@/lib/services/captureService";

type ViewMode = "table" | "gallery";

interface CaptureGalleryProps {
  captures: ARCapture[];
  projectUuid?: string;
  sessionUuid?: string;
  loading: boolean;
}

export default function CaptureGallery({
  captures,
  projectUuid,
  sessionUuid,
  loading,
}: CaptureGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedCapture, setSelectedCapture] = useState<ARCapture | null>(null);

  const handleSelect = useCallback((cap: ARCapture) => {
    setSelectedCapture(cap);
  }, []);

  const handleClosePreview = useCallback(() => {
    setSelectedCapture(null);
  }, []);

  const handleDownloadAll = useCallback(() => {
    if (!projectUuid || !sessionUuid) return;
    const url = captureService.downloadZipUrl(projectUuid, sessionUuid);
    const link = document.createElement("a");
    link.href = url;
    link.download = `captures_${sessionUuid.slice(0, 8)}.zip`;
    link.click();
  }, [projectUuid, sessionUuid]);

  const count = captures.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide">
          AR Captures ({count})
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Table view"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("gallery")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "gallery"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Gallery view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
          {count > 0 && projectUuid && sessionUuid && (
            <button
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Download all as ZIP"
            >
              <Download size={14} />
              Download All
            </button>
          )}
        </div>
      </div>

      {viewMode === "table" ? (
        <CaptureTable
          captures={captures}
          onSelect={handleSelect}
          projectUuid={projectUuid}
          sessionUuid={sessionUuid}
          loading={loading}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : captures.length === 0 ? (
            <div className="p-8 text-center">
              <Camera size={24} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">No captures yet</p>
              <p className="text-xs text-gray-400 mt-1">Say &quot;capture&quot; on the headset</p>
            </div>
          ) : (
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {captures.map((cap) => (
                  <button
                    key={cap.uuid}
                    onClick={() => handleSelect(cap)}
                    className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
                  >
                    {cap.image_url || cap.thumbnail_url ? (
                      <img
                        src={cap.image_url || cap.thumbnail_url || undefined}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera size={28} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1.5">
                      <p className="text-[10px] font-medium truncate">
                        {cap.location_hint || "Unknown"}
                      </p>
                      <p className="text-[9px] text-gray-300">
                        {new Date(cap.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {cap.capture_type === "flag" && (
                      <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedCapture && (
        <CapturePreview
          capture={selectedCapture}
          projectUuid={projectUuid}
          sessionUuid={sessionUuid}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
}
