"use client";

import { CalendarDays, Eye, Share2, RefreshCw } from "lucide-react";
import type { ScheduleReportFile } from "../../task-details/types";

interface ScheduleReportCardProps {
  doc: ScheduleReportFile;
  onView?: (doc: ScheduleReportFile) => void;
}

export default function ScheduleReportCard({ doc, onView }: ScheduleReportCardProps) {
  const createdDate = new Date(doc.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
  const total = doc.on_schedule_count + doc.rescheduled_count + doc.delayed_count;
  const weekRange = `${new Date(doc.week_start).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${new Date(doc.week_end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="bg-white text-[#021422] rounded-xl border border-gray-200 border-l-4 border-l-[#021422] overflow-hidden hover:shadow-sm transition-shadow">
      <div className="p-5 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <CalendarDays size={17} className="text-[#021422]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-200 px-2 py-0.5 rounded">
                  Schedule Report
                </span>
                {doc.rescheduled_count > 0 && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <RefreshCw size={8} />
                    {doc.rescheduled_count} rescheduled *
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm text-[#021422]">{doc.week_label} Schedule Report</h3>
              <p className="text-xs text-gray-500 mt-0.5">{weekRange}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-[#021422]">{total}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Tasks tracked</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="pl-12 flex items-center gap-0 divide-x divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
          <div className="flex-1 px-4 py-3 text-center">
            <p className="text-base font-bold text-[#021422]">{doc.on_schedule_count}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">On Schedule</p>
          </div>
          <div className="flex-1 px-4 py-3 text-center">
            <p className="text-base font-bold text-[#021422]">
              {doc.rescheduled_count}
              {doc.rescheduled_count > 0 && <span className="text-amber-500 ml-0.5 text-xs">*</span>}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Rescheduled</p>
          </div>
          <div className="flex-1 px-4 py-3 text-center">
            <p className="text-base font-bold text-[#021422]">{doc.delayed_count}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Delayed</p>
          </div>
        </div>

        {/* Progress bar — single tone, segmented */}
        {total > 0 && (
          <div className="pl-12 space-y-1.5">
            <div className="w-full bg-gray-100 rounded-full h-1.5 flex overflow-hidden">
              <div className="h-1.5 bg-[#021422] transition-all" style={{ width: `${(doc.on_schedule_count / total) * 100}%` }} />
              <div className="h-1.5 bg-amber-300 transition-all" style={{ width: `${(doc.rescheduled_count / total) * 100}%` }} />
              <div className="h-1.5 bg-gray-400 transition-all" style={{ width: `${(doc.delayed_count / total) * 100}%` }} />
            </div>
            <div className="flex gap-4 text-[10px] text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-1.5 rounded-sm bg-[#021422] inline-block" />On schedule</span>
              <span className="flex items-center gap-1"><span className="w-2 h-1.5 rounded-sm bg-amber-300 inline-block" />Rescheduled</span>
              <span className="flex items-center gap-1"><span className="w-2 h-1.5 rounded-sm bg-gray-400 inline-block" />Delayed</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-[10px] text-gray-400 pl-12">Generated {createdDate}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView?.(doc)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-[#021422] rounded text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              <Eye size={12} /> View
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-[#021422] rounded text-xs font-semibold hover:bg-gray-50 transition-colors">
              <Share2 size={12} /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
