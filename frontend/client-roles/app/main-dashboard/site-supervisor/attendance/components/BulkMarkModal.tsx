"use client";

import { X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import type {
  ScheduleSummaryData,
  GrandTotalData,
  CumulativeTotalData,
} from "../types";

interface BulkMarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: ScheduleSummaryData[];
  subTotal: GrandTotalData;
  cumulativeTotal: CumulativeTotalData;
  selectedDate: string;
  onSubmit: () => void;
}

export default function BulkMarkModal({
  isOpen,
  onClose,
  schedules,
  subTotal,
  cumulativeTotal,
  selectedDate,
  onSubmit,
}: BulkMarkModalProps) {
  if (!isOpen) return null;

  const dateDisplay = new Date(selectedDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleSubmit = () => {
    toast.success("Attendance marked successfully");
    onSubmit();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Bulk Mark Attendance
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Set status for each crew member â€” {dateDisplay}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="border border-gray-100 rounded-lg overflow-hidden"
            >
              <div className="bg-gray-50 px-4 py-2.5 flex items-center border-b border-gray-100">
                <span className="text-xs font-bold text-[#021422]">
                  {schedule.taskName}
                </span>
              </div>
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-4 py-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400 w-1/2">
                      Crew
                    </th>
                    <th className="text-center px-4 py-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400 w-1/4">
                      Present
                    </th>
                    <th className="text-center px-4 py-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400 w-1/4">
                      Absent
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {schedule.crews.map((crew) => (
                    <tr key={crew.id}>
                      <td className="px-4 py-1.5 text-xs font-medium text-gray-700 truncate">
                        {crew.name}
                      </td>
                      <td className="px-4 py-1.5 text-center text-xs font-semibold text-green-600">
                        {crew.present}
                      </td>
                      <td className="px-4 py-1.5 text-center text-xs font-semibold text-red-500">
                        {crew.absent}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-4 py-1.5 text-xs text-gray-700">
                      Sub Total
                    </td>
                    <td className="px-4 py-1.5 text-center text-xs font-semibold text-green-600">
                      {schedule.subtotalPresent}
                    </td>
                    <td className="px-4 py-1.5 text-center text-xs font-semibold text-red-500">
                      {schedule.subtotalAbsent}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}

          <div className="border-t-2 border-gray-200 pt-3">
            <div className="flex items-center">
              <div className="w-1/2 px-4">
                <span className="text-xs font-bold text-[#021422]">
                  Sub Total
                </span>
                <span className="text-[9px] text-gray-500 block">
                  Today&apos;s total
                </span>
              </div>
              <div className="w-1/4 text-center">
                <span className="text-lg font-bold text-green-600">
                  {subTotal.present}
                </span>
              </div>
              <div className="w-1/4 text-center">
                <span className="text-lg font-bold text-red-500">
                  {subTotal.absent}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3 bg-blue-50 -mx-6 px-6 -mb-4 pb-4 rounded-b-lg">
            <div className="flex items-center">
              <div className="w-1/2 px-4">
                <span className="text-xs font-bold text-blue-700">
                  Cumulative Total
                </span>
                {/*<span className="text-[9px] text-gray-500 block">Project-to-date</span>*/}
              </div>
              <div className="w-1/4 text-center">
                <span className="text-lg font-bold text-green-600">
                  {cumulativeTotal.present}
                </span>
              </div>
              <div className="w-1/4 text-center">
                <span className="text-lg font-bold text-red-500">
                  {cumulativeTotal.absent}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            Submit Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
