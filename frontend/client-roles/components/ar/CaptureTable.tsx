"use client";

import { Camera, Download, Flag } from "lucide-react";
import type { ARCapture } from "@/lib/types/capture";
import { captureService } from "@/lib/services/captureService";

interface CaptureTableProps {
  captures: ARCapture[];
  onSelect: (capture: ARCapture) => void;
  projectUuid?: string;
  sessionUuid?: string;
  loading: boolean;
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(ts: string) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function CaptureTable({
  captures,
  onSelect,
  projectUuid,
  sessionUuid,
  loading,
}: CaptureTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded" />
              <div className="flex-1 h-4 bg-gray-200 rounded" />
              <div className="w-16 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (captures.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
        <Camera size={24} className="text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm font-medium">No captures yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Say &quot;capture&quot; or &quot;take screenshot&quot; on the XR10 headset
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                &nbsp;
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Engineer
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {captures.map((cap) => (
              <tr
                key={cap.uuid}
                onClick={() => onSelect(cap)}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-2.5">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {cap.image_url || cap.thumbnail_url ? (
                      <img
                        src={cap.image_url || cap.thumbnail_url || undefined}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera size={16} className="text-gray-400" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-gray-700 text-xs font-medium">
                  {formatDate(cap.timestamp)}
                </td>
                <td className="px-4 py-2.5 text-gray-700 text-xs">
                  {formatTimestamp(cap.timestamp)}
                </td>
                <td className="px-4 py-2.5 text-gray-700 text-xs">
                  {cap.location_hint || "—"}
                </td>
                <td className="px-4 py-2.5">
                  {cap.capture_type === "flag" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600">
                      <Flag size={10} />
                      Flag
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">
                      Photo
                    </span>
                  )}
                  {cap.is_linked_to_issue && (
                    <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </td>
                <td className="px-4 py-2.5 text-gray-500 text-xs">
                  {cap.taken_by_name || "XR10 Device"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (cap.uuid && projectUuid && sessionUuid) {
                        const url = captureService.downloadFileUrl(projectUuid, sessionUuid, cap.uuid);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `capture_${cap.uuid.slice(0, 8)}.jpg`;
                        link.click();
                      }
                    }}
                    disabled={!cap.uuid || !projectUuid || !sessionUuid}
                    className="p-1.5 text-gray-400 hover:text-blue-600 disabled:text-gray-200 transition-colors"
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
