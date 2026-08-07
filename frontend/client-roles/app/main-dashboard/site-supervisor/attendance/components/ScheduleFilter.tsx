"use client";

import type { ScheduleSummaryData } from "../types";

interface ScheduleFilterProps {
  schedules: ScheduleSummaryData[];
  selectedScheduleId: string;
  onScheduleChange: (id: string) => void;
}

export default function ScheduleFilter({
  schedules,
  selectedScheduleId,
  onScheduleChange,
}: ScheduleFilterProps) {
  return (
    <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        Schedule
      </label>
      <select
        value={selectedScheduleId}
        onChange={(e) => onScheduleChange(e.target.value)}
        className="flex-1 md:max-w-xs p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-[#021422] focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
      >
        <option value="">All Schedules</option>
        {schedules.map((sched) => (
          <option key={sched.id} value={sched.id}>
            {sched.taskName}
          </option>
        ))}
      </select>
    </div>
  );
}
