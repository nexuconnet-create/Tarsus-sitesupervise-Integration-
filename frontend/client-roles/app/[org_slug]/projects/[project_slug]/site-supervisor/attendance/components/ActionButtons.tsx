"use client";

import { Plus, CheckCircle2, Bell, Download, Loader2 } from "lucide-react";

interface ActionButtonsProps {
  onAddRecord: () => void;
  onBulkMark: () => void;
  onNotify: () => void;
  onExport: () => void;
  onSubmitAttendance: () => void;
  onMarkScheduleAttendance?: () => void;
  showMarkScheduleButton?: boolean;
  bulkMarking: boolean;
  notifying: boolean;
  exporting: boolean;
}

export default function ActionButtons({
  onAddRecord,
  onBulkMark,
  onNotify,
  onExport,
  onSubmitAttendance,
  onMarkScheduleAttendance,
  showMarkScheduleButton,
  bulkMarking,
  notifying,
  exporting,
}: ActionButtonsProps) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
        Actions
      </h2>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onAddRecord}
          className="px-6 py-3 bg-[#007AFF] text-white text-xs font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus size={14} />
          Add Record
        </button>

        <button
          onClick={onBulkMark}
          disabled={bulkMarking}
          className="px-6 py-3 bg-[#021422] text-white text-xs font-bold uppercase rounded shadow hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {bulkMarking ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <CheckCircle2 size={14} />
          )}
          Bulk Mark Attendance
        </button>

        {showMarkScheduleButton && onMarkScheduleAttendance && (
          <button
            onClick={onMarkScheduleAttendance}
            className="px-6 py-3 bg-green-600 text-white text-xs font-bold uppercase rounded shadow hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle2 size={14} />
            Mark Schedule Attendance
          </button>
        )}

        <button
          onClick={onNotify}
          disabled={notifying}
          className="px-6 py-3 bg-[#007AFF] text-white text-xs font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {notifying ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Bell size={14} />
          )}
          Notify Absent Workers
        </button>

        <button
          onClick={onSubmitAttendance}
          className="px-6 py-3 bg-[#007AFF] text-white text-xs font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          Submit Attendance
        </button>

        <button
          onClick={onExport}
          disabled={exporting}
          className="px-6 py-3 bg-[#021422] text-white text-xs font-bold uppercase rounded shadow hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {exporting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          Export Attendance
        </button>
      </div>
    </div>
  );
}
