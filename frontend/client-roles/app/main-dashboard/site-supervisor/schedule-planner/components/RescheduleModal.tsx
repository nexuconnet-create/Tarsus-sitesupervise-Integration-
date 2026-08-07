"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";

interface ScheduleOption {
  id: string;
  task: string;
  title: string;
  originalStartDate: string;
  originalEndDate: string;
}

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: ScheduleOption;
  schedules?: ScheduleOption[];
  onReschedule: (
    scheduleId: string,
    newStartDate: string,
    newEndDate: string,
  ) => void;
}

export default function RescheduleModal({
  isOpen,
  onClose,
  schedule,
  schedules,
  onReschedule,
}: RescheduleModalProps) {
  const showDropdown = !!schedules && schedules.length > 0 && !schedule;
  const [dropdownId, setDropdownId] = useState("");
  const selectedSchedule =
    schedule || schedules?.find((s) => s.id === dropdownId);

  const [newStartDate, setNewStartDate] = useState(
    selectedSchedule?.originalStartDate || "",
  );
  const [newEndDate, setNewEndDate] = useState(
    selectedSchedule?.originalEndDate || "",
  );
  const [loading, setLoading] = useState(false);

  const handleScheduleSelect = (id: string) => {
    setDropdownId(id);
    const picked = schedules?.find((s) => s.id === id);
    if (picked) {
      setNewStartDate(picked.originalStartDate);
      setNewEndDate(picked.originalEndDate);
    }
  };

  const hasChanges = selectedSchedule
    ? newStartDate !== selectedSchedule.originalStartDate ||
      newEndDate !== selectedSchedule.originalEndDate
    : false;

  const handleConfirm = async () => {
    if (!hasChanges || !selectedSchedule) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    onReschedule(selectedSchedule.id, newStartDate, newEndDate);
    setLoading(false);
    handleClose();
  };

  const handleClose = () => {
    setDropdownId("");
    setNewStartDate("");
    setNewEndDate("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Reschedule</h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Schedule Dropdown */}
          {showDropdown && (
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Select Schedule
              </label>
              <div className="relative">
                <select
                  value={dropdownId}
                  onChange={(e) => handleScheduleSelect(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 appearance-none"
                >
                  <option value="">Choose a schedule...</option>
                  {schedules?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.task || s.title}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          )}

          {selectedSchedule && (
            <>
              {/* Current Schedule Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  INITIAL
                </p>
                <p className="text-xs font-medium text-gray-900">
                  {selectedSchedule.task || selectedSchedule.title}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {formatDate(selectedSchedule.originalStartDate)} -{" "}
                  {formatDate(selectedSchedule.originalEndDate)}
                </p>
              </div>

              {/* New Dates */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                REVISED
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                    Finish Date
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
              </div>

              {/* Hint */}
              {hasChanges && (
                <p className="text-[10px] text-gray-400">
                  Schedule will be moved to {formatDate(newStartDate)} -{" "}
                  {formatDate(newEndDate)}
                </p>
              )}
            </>
          )}

          {!selectedSchedule && showDropdown && dropdownId === "" && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-xs">Select a schedule to reschedule</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasChanges || loading}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Rescheduling..." : "Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
