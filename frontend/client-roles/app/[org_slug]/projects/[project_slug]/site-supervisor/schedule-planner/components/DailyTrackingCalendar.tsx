"use client";

import moment from "moment";
import { ChevronRight, CheckCircle2, Clock, XCircle } from "lucide-react";

interface DailyTrackingCalendarProps {
  durationFrom: string;
  durationTo: string;
  dailyLogs: { date: string; workerIds: string[]; status: "confirmed" | "pending" | "rejected"; pendingWorkerIds?: string[] }[];
  onSelectDay: (date: string) => void;
}

export default function DailyTrackingCalendar({
  durationFrom,
  durationTo,
  dailyLogs,
  onSelectDay,
}: DailyTrackingCalendarProps) {
  const start = moment(durationFrom);
  const end = moment(durationTo);
  const totalDays = end.diff(start, "days") + 1;

  const days = Array.from({ length: totalDays }, (_, i) => {
    const date = start.clone().add(i, "days");
    const dateStr = date.format("YYYY-MM-DD");
    const log = dailyLogs.find((l) => l.date === dateStr);
    return {
      date: dateStr,
      dayName: date.format("ddd"),
      dayNum: date.format("D"),
      month: date.format("MMM"),
      workerCount: log?.workerIds?.length || 0,
      status: log?.status || "confirmed",
    };
  });

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "pending") {
      return <Clock size={10} className="text-yellow-600" />;
    }
    if (status === "rejected") {
      return <XCircle size={10} className="text-red-500" />;
    }
    return <CheckCircle2 size={10} className="text-green-600" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Daily Tracking ({totalDays} day{totalDays !== 1 ? "s" : ""})
        </p>
        <div className="flex items-center gap-3 text-[9px] text-gray-400">
          <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-600" /> Confirmed</span>
          <span className="flex items-center gap-1"><Clock size={10} className="text-yellow-600" /> Pending</span>
          <span className="flex items-center gap-1"><XCircle size={10} className="text-red-500" /> Rejected</span>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => {
          const borderClass = day.status === "pending"
            ? "border-yellow-300 bg-yellow-50"
            : day.status === "rejected"
            ? "border-red-200 bg-red-50"
            : "border-gray-200 hover:border-gray-400 hover:bg-gray-50";

          return (
            <button
              key={day.date}
              onClick={() => onSelectDay(day.date)}
              className={`shrink-0 w-16 py-3 px-2 rounded-lg border transition-all text-center group ${borderClass}`}
            >
              <p className="text-[9px] font-medium text-gray-400 uppercase">
                {day.dayName}
              </p>
              <p className="text-xs font-bold text-gray-900 mt-0.5">
                {day.month} {day.dayNum}
              </p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                {day.workerCount}
              </p>
              <p className="text-[8px] text-gray-400">workers</p>
              <div className="flex items-center justify-center mt-1">
                <StatusIcon status={day.status} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
