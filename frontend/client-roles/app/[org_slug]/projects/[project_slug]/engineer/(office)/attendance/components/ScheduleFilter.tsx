"use client";

import type { ScheduleData } from "../types";

interface ScheduleFilterProps {
  schedules: ScheduleData[];
  selectedScheduleId: string;
  onScheduleChange: (id: string) => void;
  loading: boolean;
}

export default function ScheduleFilter({
  schedules,
  selectedScheduleId,
  onScheduleChange,
  loading,
}: ScheduleFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
      <div className="flex items-center gap-3">
        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap shrink-0">
          Schedule:
        </label>
        <select
          value={selectedScheduleId}
          onChange={(e) => onScheduleChange(e.target.value)}
          disabled={loading}
          className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-medium text-[#021422] focus:outline-none focus:ring-2 focus:ring-[#021422] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="all">All Schedules ({schedules.reduce((sum, s) => sum + s.totalWorkers, 0)} workers)</option>
          {schedules.map((schedule) => (
            <option key={schedule.id} value={schedule.id}>
              {schedule.taskName} - {schedule.crewName} ({schedule.totalWorkers} workers)
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
