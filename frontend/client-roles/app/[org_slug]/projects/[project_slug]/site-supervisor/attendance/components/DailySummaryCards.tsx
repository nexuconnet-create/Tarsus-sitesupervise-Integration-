"use client";

import { Users, UserCheck, UserX, Clock } from "lucide-react";
import type { DailySummaryData } from "../types";

interface DailySummaryCardsProps {
  summary: DailySummaryData;
  loading: boolean;
}

export default function DailySummaryCards({ summary, loading }: DailySummaryCardsProps) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
        Daily Summary
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col items-center">
          <div className="bg-[#021422] text-white w-full py-1.5 text-center text-[10px] font-bold tracking-wide">
            Total assigned workers
          </div>
          <div className="p-2 flex flex-col items-center justify-center flex-1">
            <Users size={16} className="text-gray-400 mb-1" />
            <span className="text-2xl font-bold text-[#021422]">
              {loading ? "—" : summary.totalWorkers}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col items-center">
          <div className="bg-[#021422] text-white w-full py-1.5 text-center text-[10px] font-bold tracking-wide">
            Onsite (present)
          </div>
          <div className="p-2 flex flex-col items-center justify-center flex-1">
            <UserCheck size={16} className="text-green-500 mb-1" />
            <span className="text-2xl font-bold text-[#22C55E]">
              {loading ? "—" : summary.present}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col items-center">
          <div className="bg-[#021422] text-white w-full py-1.5 text-center text-[10px] font-bold tracking-wide">
            Early
          </div>
          <div className="p-2 flex flex-col items-center justify-center flex-1">
            <UserCheck size={16} className="text-blue-500 mb-1" />
            <span className="text-2xl font-bold text-[#3B82F6]">
              {loading ? "—" : summary.early}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col items-center">
          <div className="bg-[#021422] text-white w-full py-1.5 text-center text-[10px] font-bold tracking-wide">
            Late
          </div>
          <div className="p-2 flex flex-col items-center justify-center flex-1">
            <Clock size={16} className="text-yellow-500 mb-1" />
            <span className="text-2xl font-bold text-[#F59E0B]">
              {loading ? "—" : summary.late}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col items-center">
          <div className="bg-[#021422] text-white w-full py-1.5 text-center text-[10px] font-bold tracking-wide">
            Offsite (absent)
          </div>
          <div className="p-2 flex flex-col items-center justify-center flex-1">
            <UserX size={16} className="text-red-500 mb-1" />
            <span className="text-2xl font-bold text-[#EF4444]">
              {loading ? "—" : summary.absent}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
