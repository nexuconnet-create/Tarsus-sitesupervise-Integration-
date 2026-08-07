"use client";

import { FileText, Eye, Download, CheckCircle, RefreshCw } from "lucide-react";
import { formatDateTime } from "@/lib/format/snapshot";
import type { TaskFileListItem, TaskFileMilestoneType } from "@/lib/types/api";

interface MilestoneFileCardProps {
  file: TaskFileListItem;
  onView: (file: TaskFileListItem) => void;
  onDownload: (file: TaskFileListItem) => void;
  isDownloading?: boolean;
}

const MILESTONE_STYLE: Record<
  TaskFileMilestoneType,
  { border: string; badge: string; icon: React.ReactNode }
> = {
  created: {
    border: "border-l-blue-400",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <CheckCircle size={9} />,
  },
  rescheduled: {
    border: "border-l-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <RefreshCw size={9} />,
  },
  completed: {
    border: "border-l-green-400",
    badge: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle size={9} />,
  },
};

export default function MilestoneFileCard({
  file,
  onView,
  onDownload,
  isDownloading,
}: MilestoneFileCardProps) {
  const style = MILESTONE_STYLE[file.milestone_type] ?? MILESTONE_STYLE.created;

  return (
    <div
      className={`bg-white text-[#021422] rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow border-l-4 ${style.border}`}
    >
      <div className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <FileText size={17} className="text-[#021422]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold text-[#021422] bg-gray-100 px-2 py-0.5 rounded font-mono">
                  {file.task_wp_number}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-[#021422] leading-snug">
                {file.task_title}
              </h3>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide shrink-0 border ${style.badge}`}
          >
            {style.icon}
            {file.label}
          </span>
        </div>

        {/* Meta */}
        <div className="pl-12 text-xs text-gray-500">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">
            Generated
          </span>
          {formatDateTime(file.generated_at)}
          {file.generated_by && (
            <>
              {" · "}
              <span className="text-[#021422] font-medium">
                {file.generated_by.first_name} {file.generated_by.last_name}
              </span>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-gray-100">
          <button
            onClick={() => onView(file)}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-[#021422] rounded text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            <Eye size={11} /> View
          </button>
          <button
            onClick={() => onDownload(file)}
            disabled={isDownloading}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-[#021422] rounded text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <Download size={11} /> {isDownloading ? "Preparing…" : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
}
