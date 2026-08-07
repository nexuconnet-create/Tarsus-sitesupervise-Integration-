"use client";

import { ChevronLeft, ChevronRight, RefreshCw, Loader2 } from "lucide-react";

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
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
      <h1 className="font-bold text-sm text-[#021422] uppercase tracking-wider">
        Time & Attendance
      </h1>
      <div className="flex items-center gap-3">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-gray-600 min-w-[180px] text-center">
          {dateDisplay}
        </span>
        <button
          onClick={() => changeDate(1)}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronRight size={16} className="text-gray-600" />
        </button>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}
