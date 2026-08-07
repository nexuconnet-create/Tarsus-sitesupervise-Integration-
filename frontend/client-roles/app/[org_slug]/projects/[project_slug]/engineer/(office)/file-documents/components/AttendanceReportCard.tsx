"use client";

import { ClipboardList, Calendar, User, Eye, Share2 } from "lucide-react";
import type { AttendanceReportFile } from "../../task-details/types";

interface AttendanceReportCardProps {
  doc: AttendanceReportFile;
  onView?: (doc: AttendanceReportFile) => void;
}

export default function AttendanceReportCard({ doc, onView }: AttendanceReportCardProps) {
  const formattedDate = new Date(doc.report_date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const createdTime = new Date(doc.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const total = doc.present_count + doc.absent_count + doc.late_count;
  const attendanceRate = total > 0 ? Math.round((doc.present_count / total) * 100) : 0;

  return (
    <div className="bg-white text-[#021422] rounded-xl border border-gray-200 border-l-4 border-l-[#021422] overflow-hidden hover:shadow-sm transition-shadow">
      <div className="p-5 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <ClipboardList size={17} className="text-[#021422]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-200 px-2 py-0.5 rounded">
                  Attendance Report
                </span>
              </div>
              <h3 className="font-semibold text-sm text-[#021422]">Daily Attendance Report</h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                <Calendar size={11} className="text-gray-400" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-[#021422]">{attendanceRate}%</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Attendance Rate</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="pl-12 flex items-center gap-0 divide-x divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
          <div className="flex-1 px-4 py-3 text-center">
            <p className="text-base font-bold text-[#021422]">{doc.present_count}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Present</p>
          </div>
          <div className="flex-1 px-4 py-3 text-center">
            <p className="text-base font-bold text-[#021422]">{doc.absent_count}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Absent</p>
          </div>
          <div className="flex-1 px-4 py-3 text-center">
            <p className="text-base font-bold text-[#021422]">{doc.late_count}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Late</p>
          </div>
          <div className="flex-1 px-4 py-3 text-center">
            <p className="text-base font-bold text-[#021422]">{total}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Total</p>
          </div>
        </div>

        {/* Rate bar */}
        <div className="pl-12 space-y-1">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-[#021422] transition-all"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="pl-12 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <User size={11} className="text-gray-400" />
            <span>Crew Manager: <span className="font-medium text-[#021422]">{doc.crew_manager_name}</span></span>
          </div>
          {doc.linked_task_wps && doc.linked_task_wps.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-gray-400">Linked tasks:</span>
              {doc.linked_task_wps.map((wp: string) => (
                <span key={wp} className="font-mono text-[10px] font-bold text-[#021422] bg-gray-100 px-1.5 py-0.5 rounded">
                  {wp}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-[10px] text-gray-400 pl-12">Filed at {createdTime}</span>
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
