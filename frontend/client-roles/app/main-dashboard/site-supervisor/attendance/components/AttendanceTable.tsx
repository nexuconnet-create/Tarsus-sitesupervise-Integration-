"use client";

import { Users, Loader2, Pencil } from "lucide-react";
import type { WorkerData, AttendanceStatus } from "../types";

interface AttendanceTableProps {
  workers: WorkerData[];
  loading: boolean;
  selectedDate: string;
  onEditWorker: (worker: WorkerData) => void;
}

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  present: { color: "text-green-600", bgColor: "bg-green-50", label: "Present" },
  early: { color: "text-blue-600", bgColor: "bg-blue-50", label: "Early" },
  late: { color: "text-yellow-600", bgColor: "bg-yellow-50", label: "Late" },
  absent: { color: "text-red-600", bgColor: "bg-red-50", label: "Absent" },
  unmarked: { color: "text-gray-400", bgColor: "bg-gray-50", label: "Unmarked" },
};

export default function AttendanceTable({
  workers,
  loading,
  selectedDate,
  onEditWorker,
}: AttendanceTableProps) {
  const dateDisplay = new Date(selectedDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Attendance Records
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#007AFF]" />
            <span className="ml-3 text-sm text-gray-500">Loading attendance...</span>
          </div>
        </div>
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Attendance Records
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center py-12">
            <Users size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No attendance records for this date</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
        Attendance Records
      </h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#021422] text-white p-4 flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Crew Attendance - {dateDisplay}
          </h3>
          <span className="text-xs opacity-70">{workers.length} workers</span>
        </div>

        <div className="p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 text-left text-xs font-bold uppercase text-[#021422] pl-4">
                  Name
                </th>
                <th className="py-3 text-center text-xs font-bold uppercase text-[#021422]">
                  Crew
                </th>
                <th className="py-3 text-center text-xs font-bold uppercase text-[#021422]">
                  Check In
                </th>
                <th className="py-3 text-center text-xs font-bold uppercase text-[#021422]">
                  Check Out
                </th>
                <th className="py-3 text-center text-xs font-bold uppercase text-[#021422]">
                  Status
                </th>
                <th className="py-3 text-center text-xs font-bold uppercase text-[#021422] w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workers.map((worker) => {
                const cfg = statusConfig[worker.status] || statusConfig.unmarked;

                return (
                  <tr
                    key={worker.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onEditWorker(worker)}
                  >
                    <td className="py-4 pl-4">
                      <div className="font-semibold text-sm text-[#021422]">{worker.name}</div>
                    </td>
                    <td className="py-4 text-center text-xs font-medium text-gray-600">
                      {worker.crewName}
                    </td>
                    <td className="py-4 text-center text-xs font-medium text-gray-600">
                      {worker.checkIn || "â€”"}
                    </td>
                    <td className="py-4 text-center text-xs font-medium text-gray-600">
                      {worker.checkOut || "â€”"}
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase ${cfg.color} ${cfg.bgColor}`}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <Pencil size={14} className="text-gray-400 mx-auto" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
