"use client";

import { FileText, MapPin, Calendar, User, Eye, Download, RefreshCw } from "lucide-react";
import type { ProjectFileDocument } from "../../task-details/types";
import { STATUS_CONFIG, QUEUE_LABELS, TASK_TYPE_LABELS, VERSION_TYPE_CONFIG } from "../../task-details/types";

interface TaskFileCardProps {
  doc: ProjectFileDocument;
  onView: (doc: ProjectFileDocument) => void;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function TaskFileCard({ doc, onView }: TaskFileCardProps) {
  const statusConfig = doc.task_status ? STATUS_CONFIG[doc.task_status] : null;
  const queueLabel = doc.task_queue ? QUEUE_LABELS[doc.task_queue] : null;
  const taskTypeLabel = doc.task_type ? TASK_TYPE_LABELS[doc.task_type] : null;
  const vCfg = doc.version_type ? VERSION_TYPE_CONFIG[doc.version_type] : null;
  const createdDate = fmt(doc.created_at);

  const borderColor =
    doc.version_type === "completed"
      ? "border-l-green-400"
      : doc.version_type === "rescheduled"
        ? "border-l-amber-400"
        : doc.version_type === "updated"
          ? "border-l-yellow-400"
          : doc.version_type === "created"
            ? "border-l-blue-400"
            : doc.is_rescheduled
              ? "border-l-amber-400"
              : "border-l-[#021422]";

  return (
    <div className={`bg-white text-[#021422] rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow border-l-4 ${borderColor}`}>
      <div className="p-5 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <FileText size={17} className="text-[#021422]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold text-[#021422] bg-gray-100 px-2 py-0.5 rounded font-mono">
                  {doc.wp ?? doc.task_id}
                </span>
                {taskTypeLabel && (
                  <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded">
                    {taskTypeLabel}
                  </span>
                )}
                {statusConfig && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                    {statusConfig.label}
                  </span>
                )}
                {queueLabel && (
                  <span className="text-xs text-gray-400 border border-gray-100 px-2 py-0.5 rounded">
                    {queueLabel}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm text-[#021422] leading-snug">
                {doc.task_title}
                {doc.is_rescheduled && <span className="ml-1 text-amber-500 font-bold">*</span>}
              </h3>
            </div>
          </div>

          {(doc.version_type || doc.is_rescheduled) && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide shrink-0 ${
                doc.version_type
                  ? `${vCfg?.bg ?? "bg-gray-100"} ${vCfg?.text ?? "text-gray-700"} border ${vCfg?.bg ?? "border-gray-200"}`
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {doc.is_rescheduled && !doc.version_type && <RefreshCw size={9} />}
              {doc.version_type
                ? `v${doc.version_number} · ${vCfg?.label ?? "File"}`
                : "Rescheduled"}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-500 pl-12">
          <div className="flex items-center gap-1.5">
            <MapPin size={11} className="text-gray-400 shrink-0" />
            <span>Grid {doc.grid} · {doc.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User size={11} className="text-gray-400 shrink-0" />
            <span>Project Engineer: <span className="text-[#021422] font-medium">{doc.created_by_pm}</span></span>
          </div>
          <div className="flex items-start gap-1.5 col-span-2">
            <Calendar size={11} className="text-gray-400 shrink-0 mt-0.5" />
            {doc.is_rescheduled ? (
              <span className="leading-relaxed">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Schedule</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                    <RefreshCw size={8} /> Rescheduled
                  </span>
                </div>
                <span className="line-through text-gray-300 mr-1">{doc.original_start_date} – {doc.original_end_date}</span>
                <span className="text-red-500 text-[10px] font-semibold ml-1">Original Schedule</span>
                <br className="sm:hidden" />
                <span className="text-[#021422] font-medium ml-0 sm:ml-2">{doc.new_start_date} – {doc.new_end_date}</span>
                <span className="text-green-600 text-[10px] font-semibold ml-1">Revised Reschedule</span>
              </span>
            ) : (
              <span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Schedule</span>
                {doc.scheduled_start_date} – {doc.scheduled_end_date}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {doc.progress != null && (
          <div className="pl-12 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-[#021422] transition-all"
                style={{ width: `${doc.progress}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">{doc.progress}%</span>
          </div>
        )}

        {/* Crew count */}
        {doc.crews && doc.crews.length > 0 && (
          <div className="pl-12 text-xs text-gray-500 mt-[-6px]">
            {doc.crews.map((c) => c.name).join(", ")}
            {" · "}
            {doc.crews.reduce((s, c) => s + (c.size ?? 0), 0)} workers
          </div>
        )}

        {/* Reschedule reason */}
        {doc.is_rescheduled && doc.reschedule_reason && (
          <div className="ml-12 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
            <span className="font-semibold text-gray-700">Reason: </span>
            {doc.reschedule_reason}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 pt-3 border-t border-gray-100">
          <span className="text-[10px] text-gray-400">
            {vCfg ? `${vCfg.label} ${createdDate}` : `File created ${createdDate}`}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onView(doc)}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-[#021422] rounded text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              <Eye size={11} /> View
            </button>
            <button className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-[#021422] rounded text-xs font-semibold hover:bg-gray-50 transition-colors">
              <Download size={11} /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
