"use client";

import { Calendar, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function DateNavigator({
  selectedDate,
  onDateChange,
  onRefresh,
  loading,
}: DateNavigatorProps) {
  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    onDateChange(d.toISOString().split("T")[0]);
  };

  const dateDisplay = new Date(selectedDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
      <div className="flex items-center gap-3">
        <Calendar size={16} className="text-[#021422] shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wider text-[#021422] shrink-0">
          Date
        </span>

        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => changeDate(-1)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft size={14} className="text-gray-600" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none text-xs font-medium"
          />

          <button
            onClick={() => changeDate(1)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            aria-label="Next day"
          >
            <ChevronRight size={14} className="text-gray-600" />
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw size={14} className={`${loading ? "animate-spin" : ""} text-gray-600`} />
          </button>
        </div>

        <span className="text-xs font-semibold text-gray-600 hidden xl:block shrink-0">
          {dateDisplay}
        </span>
      </div>
    </div>
  );
}
