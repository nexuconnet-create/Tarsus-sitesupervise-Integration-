"use client";

import { Users, Loader2, CalendarDays, Clock } from "lucide-react";
import type { WorkerData, ScheduleData } from "../types";

interface AttendanceTableProps {
  workers: WorkerData[];
  schedules: ScheduleData[];
  loading: boolean;
  selectedDate: string;
  selectedScheduleId: string;
}

const statusConfig: Record<string, { color: string; bgColor: string; label: string; dot: string }> = {
  present: { color: "text-green-700", bgColor: "bg-green-50", label: "Present", dot: "bg-green-500" },
  early: { color: "text-blue-700", bgColor: "bg-blue-50", label: "Early", dot: "bg-blue-500" },
  late: { color: "text-amber-700", bgColor: "bg-amber-50", label: "Late", dot: "bg-amber-500" },
  absent: { color: "text-red-700", bgColor: "bg-red-50", label: "Absent", dot: "bg-red-500" },
  unmarked: { color: "text-gray-500", bgColor: "bg-gray-50", label: "Unmarked", dot: "bg-gray-400" },
};

const cardColors = [
  "border-l-blue-500",
  "border-l-purple-500",
  "border-l-cyan-500",
  "border-l-orange-500",
  "border-l-green-500",
  "border-l-pink-500",
];

export default function AttendanceTable({
  workers,
  schedules,
  loading,
  selectedDate,
  selectedScheduleId,
}: AttendanceTableProps) {
  const dateDisplay = new Date(selectedDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[#007AFF]" />
          <span className="ml-3 text-sm text-gray-500">Loading attendance...</span>
        </div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center py-12">
          <Users size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">No active schedules for this date</p>
          <p className="text-xs text-gray-400 mt-1">Select a different date to view attendance</p>
        </div>
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center py-12">
          <Users size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">No workers assigned</p>
        </div>
      </div>
    );
  }

  const showScheduleColumn = selectedScheduleId === "all";
  const groupedWorkers = showScheduleColumn 
    ? schedules.map(schedule => ({
        schedule,
        workers: workers.filter(w => w.scheduleId === schedule.id)
      })).filter(group => group.workers.length > 0)
    : [{ schedule: null, workers }];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#021422]">Attendance Records</h2>
          <p className="text-xs text-gray-500 mt-0.5">{dateDisplay} • {schedules.length} active schedules • {workers.length} total workers</p>
        </div>
      </div>

      {/* Schedule Cards */}
      {groupedWorkers.map((group, groupIdx) => {
        const schedule = group.schedule;
        const scheduleWorkers = group.workers;
        const cardColor = cardColors[groupIdx % cardColors.length];
        
        return (
          <div 
            key={schedule?.id || "all"} 
            className={`bg-white rounded-lg shadow-sm border border-gray-100 border-l-4 ${cardColor} overflow-hidden`}
          >
            {/* Card Header */}
            {schedule && (
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#021422] truncate">{schedule.taskName}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded shrink-0">
                        {schedule.crewName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <CalendarDays size={12} />
                        <span>{schedule.durationFrom} - {schedule.durationTo}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{scheduleWorkers.length} workers</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats Pills */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span className="text-[11px] font-bold">{schedule.present} Present</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      <span className="text-[11px] font-bold">{schedule.absent} Absent</span>
                    </div>
                    {(schedule.late > 0 || schedule.early > 0) && (
                      <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full">
                        <span className="text-[11px] font-bold">
                          {schedule.late > 0 && `${schedule.late} Late`}
                          {schedule.late > 0 && schedule.early > 0 && " • "}
                          {schedule.early > 0 && `${schedule.early} Early`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Workers Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 pl-5 w-[30%]">
                      Name
                    </th>
                    {showScheduleColumn && (
                      <th className="py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 w-[15%]">
                        Crew
                      </th>
                    )}
                    <th className="py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 w-[20%]">
                      Trade
                    </th>
                    <th className="py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 w-[12%]">
                      Scheduled
                    </th>
                    <th className="py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 w-[12%]">
                      Clock In
                    </th>
                    <th className="py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 w-[11%]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {scheduleWorkers.map((worker) => {
                    const cfg = statusConfig[worker.status] || statusConfig.unmarked;

                    return (
                      <tr
                        key={worker.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 pl-5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#021422] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              {worker.name.split(' ').map(n => n[0]).slice(-2).join('')}
                            </div>
                            <div className="font-semibold text-xs text-[#021422]">{worker.name}</div>
                          </div>
                        </td>
                        {showScheduleColumn && (
                          <td className="py-3 text-xs font-medium text-gray-500">
                            {worker.crewName}
                          </td>
                        )}
                        <td className="py-3 text-xs text-gray-500">
                          {worker.trade}
                        </td>
                        <td className="py-3 text-center text-xs text-gray-500">
                          {worker.scheduled || "07:00 - 15:30"}
                        </td>
                        <td className="py-3 text-center text-xs text-gray-500">
                          {worker.checkIn || "—"}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cfg.color} ${cfg.bgColor}`}
                          >
                            <span className={`w-1 h-1 rounded-full ${cfg.dot}`}></span>
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
