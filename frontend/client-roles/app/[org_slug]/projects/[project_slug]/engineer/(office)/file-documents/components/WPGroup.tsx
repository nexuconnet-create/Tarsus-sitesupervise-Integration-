"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Eye, Circle } from "lucide-react";
import type { ProjectFileDocument } from "../../task-details/types";
import { STATUS_CONFIG, TASK_TYPE_LABELS, VERSION_TYPE_CONFIG } from "../../task-details/types";

interface WPGroupProps {
  docs: ProjectFileDocument[];
  defaultOpen?: boolean;
  onView?: (doc: ProjectFileDocument) => void;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function VersionDot({ type }: { type: string }) {
  const cfg = VERSION_TYPE_CONFIG[type as keyof typeof VERSION_TYPE_CONFIG] ?? VERSION_TYPE_CONFIG.created;
  return <Circle size={10} className={`shrink-0 ${cfg.dot} fill-current`} />;
}

export default function WPGroup({ docs, defaultOpen = true, onView }: WPGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  if (!docs.length) return null;

  const sorted = [...docs].sort((a, b) => (a.version_number ?? 0) - (b.version_number ?? 0));
  const first = sorted[0];
  const taskTypeLabel = first.task_type ? TASK_TYPE_LABELS[first.task_type] : null;
  const hasRescheduled = sorted.some((d) => d.version_type === "rescheduled");

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-gray-400 shrink-0">
            {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </span>
          <span className="text-xs font-bold font-mono text-[#021422] bg-gray-100 px-2 py-0.5 rounded shrink-0">
            {first.wp ?? first.task_id}
          </span>
          <span className="text-sm font-semibold text-[#021422] truncate">{first.task_title}</span>
          {hasRescheduled && <span className="text-amber-500 font-bold text-sm shrink-0">*</span>}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          {taskTypeLabel && (
            <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded hidden md:block">
              {taskTypeLabel}
            </span>
          )}
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
            {sorted.length} version{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>
      </button>

      {/* Timeline */}
      {isOpen && (
        <div className="border-t border-gray-100">
          {sorted.map((doc, idx) => {
            const isLast = idx === sorted.length - 1;
            const statusConfig = doc.task_status ? STATUS_CONFIG[doc.task_status] : null;
            const vCfg = VERSION_TYPE_CONFIG[doc.version_type ?? "created"];
            const date = fmt(doc.created_at);

            return (
              <div key={doc.id} className="flex">
                {/* Timeline spine */}
                <div className="flex flex-col items-center pt-4 pb-1 ml-6 w-8 shrink-0">
                  <VersionDot type={doc.version_type ?? "created"} />
                  {!isLast && <div className="w-0.5 flex-1 min-h-[24px] bg-gray-200" />}
                </div>

                {/* Version node content */}
                <div className={`flex-1 min-w-0 py-3 pr-4 ${!isLast ? "pb-4" : ""}`}>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${vCfg.bg} ${vCfg.text}`}
                    >
                      v{doc.version_number} · {vCfg.label}
                    </span>
                    {statusConfig && (
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {statusConfig.label}
                      </span>
                    )}
                    {doc.version_type === "rescheduled" && doc.reschedule_reason && (
                      <span
                        className="text-[10px] text-amber-600 italic truncate max-w-[200px] hidden sm:inline"
                        title={doc.reschedule_reason}
                      >
                        — {doc.reschedule_reason}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {doc.progress != null && (
                    <div className="flex items-center gap-2 mt-1 mb-1">
                      <div className="flex-1 max-w-[200px] bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-[#021422] transition-all"
                          style={{ width: `${doc.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">{doc.progress}%</span>
                    </div>
                  )}

                  {/* Date row */}
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                    {doc.is_rescheduled ? (
                      <span>
                        <span className="line-through mr-1">
                          {doc.original_start_date} – {doc.original_end_date}
                        </span>
                        <span className="text-[#021422] font-medium">
                          {doc.new_start_date} – {doc.new_end_date}
                        </span>
                      </span>
                    ) : (
                      <span>
                        {doc.scheduled_start_date} – {doc.scheduled_end_date}
                      </span>
                    )}
                    <span className="text-gray-300">·</span>
                    <span>{date}</span>
                  </div>

                  {/* View button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(doc);
                    }}
                    className="mt-2 flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-[#021422] border border-[#021422] rounded hover:bg-gray-800 transition-colors"
                  >
                    <Eye size={11} /> View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
