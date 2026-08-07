"use client";

import { useState } from "react";
import { X, Clock, ChevronDown, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";

interface Worker {
  id: string;
  memberId: string;
  name: string;
  trade: string;
}

interface OvertimeEntry {
  workerId: string;
  hours: string;
  startTime: string;
  endTime: string;
}

interface ScheduleOption {
  id: string;
  task: string;
  title: string;
  originalDate: string;
  originalStartTime: string;
  originalEndTime: string;
  workers: Worker[];
}

interface OvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: ScheduleOption;
  schedules?: ScheduleOption[];
  onAuthorize: (scheduleId: string, entries: OvertimeEntry[]) => void;
}

export default function OvertimeModal({
  isOpen,
  onClose,
  schedule,
  schedules,
  onAuthorize,
}: OvertimeModalProps) {
  const showDropdown = !!schedules && schedules.length > 0 && !schedule;
  const [dropdownId, setDropdownId] = useState("");
  const selectedSchedule = schedule || schedules?.find((s) => s.id === dropdownId);

  const [entries, setEntries] = useState<Record<string, OvertimeEntry>>({});
  const [bulkHours, setBulkHours] = useState("");
  const [bulkStartTime, setBulkStartTime] = useState("");
  const [bulkEndTime, setBulkEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScheduleSelect = (id: string) => {
    setDropdownId(id);
    setEntries({});
    setBulkHours("");
    setBulkStartTime("");
    setBulkEndTime("");
  };

  const applyToAllWorkers = () => {
    if (!bulkHours && !bulkStartTime && !bulkEndTime) return;
    const newEntries: Record<string, OvertimeEntry> = {};
    workers.forEach((w) => {
      newEntries[w.id] = {
        workerId: w.id,
        hours: bulkHours,
        startTime: bulkStartTime,
        endTime: bulkEndTime,
      };
    });
    setEntries(newEntries);
  };

  const updateEntry = (workerId: string, field: keyof OvertimeEntry, value: string) => {
    setEntries((prev) => ({
      ...prev,
      [workerId]: {
        workerId,
        hours: prev[workerId]?.hours || "",
        startTime: prev[workerId]?.startTime || "",
        endTime: prev[workerId]?.endTime || "",
        [field]: value,
      },
    }));
  };

  const workers = selectedSchedule?.workers || [];
  const hasEntries = Object.values(entries).some((e) => e.hours || e.startTime || e.endTime);

  const totalHours = Object.values(entries).reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0);
  const workersWithOvertime = Object.values(entries).filter((e) => e.hours || e.startTime || e.endTime).length;

  const handleConfirm = async () => {
    if (!hasEntries || !selectedSchedule) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const validEntries = Object.values(entries).filter((e) => e.hours || e.startTime || e.endTime);
    onAuthorize(selectedSchedule.id, validEntries);
    setLoading(false);
    handleClose();
  };

  const handleClose = () => {
    setDropdownId("");
    setEntries({});
    setBulkHours("");
    setBulkStartTime("");
    setBulkEndTime("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#021422]">Authorize Overtime</h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-[#021422]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Schedule Selection */}
          {showDropdown && (
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">Select Schedule</label>
              <div className="relative">
                <select
                  value={dropdownId}
                  onChange={(e) => handleScheduleSelect(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#021422] appearance-none"
                >
                  <option value="">Choose a schedule...</option>
                  {schedules?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.task} - {formatDate(s.originalDate)} ({s.workers.length} workers)
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {selectedSchedule ? (
            <>
              {/* Schedule Info */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-sm font-semibold text-[#021422]">{selectedSchedule.task}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDate(selectedSchedule.originalDate)} • {selectedSchedule.originalStartTime}-{selectedSchedule.originalEndTime}
                </p>
              </div>

              {/* Bulk Overtime */}
              {workers.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block">
                    Set for All Workers
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Hours</label>
                        <input
                          type="number"
                          value={bulkHours}
                          onChange={(e) => setBulkHours(e.target.value)}
                          placeholder="0"
                          min="0"
                          max="24"
                          className="w-full p-2 bg-white border border-gray-200 rounded text-xs font-medium text-center focus:outline-none focus:ring-1 focus:ring-[#021422]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">From</label>
                        <input
                          type="time"
                          value={bulkStartTime}
                          onChange={(e) => setBulkStartTime(e.target.value)}
                          className="w-full p-2 bg-white border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#021422]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">To</label>
                        <input
                          type="time"
                          value={bulkEndTime}
                          onChange={(e) => setBulkEndTime(e.target.value)}
                          className="w-full p-2 bg-white border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#021422]"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={applyToAllWorkers}
                          disabled={!bulkHours && !bulkStartTime && !bulkEndTime}
                          className="w-full p-2 bg-[#021422] text-white rounded text-[10px] font-bold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400">Applies to all {workers.length} workers</p>
                  </div>
                </div>
              )}

              {/* Workers Overtime Inputs */}
              {workers.length > 0 ? (
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block">
                    Set Overtime Per Worker
                  </label>
                  <div className="space-y-3">
                    {workers.map((worker) => {
                      const entry = entries[worker.id] || { workerId: worker.id, hours: "", startTime: "", endTime: "" };
                      return (
                        <div key={worker.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[#021422] flex items-center justify-center text-white text-xs font-bold">
                              {worker.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#021422]">{worker.name}</p>
                               <p className="text-[10px] text-gray-500">{worker.memberId} • {worker.trade}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">Hours</label>
                              <input
                                type="number"
                                value={entry.hours}
                                onChange={(e) => updateEntry(worker.id, "hours", e.target.value)}
                                placeholder="0"
                                min="0"
                                max="24"
                                className="w-full p-2 bg-white border border-gray-200 rounded text-xs font-medium text-center focus:outline-none focus:ring-1 focus:ring-[#021422]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">From</label>
                              <input
                                type="time"
                                value={entry.startTime}
                                onChange={(e) => updateEntry(worker.id, "startTime", e.target.value)}
                                className="w-full p-2 bg-white border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#021422]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">To</label>
                              <input
                                type="time"
                                value={entry.endTime}
                                onChange={(e) => updateEntry(worker.id, "endTime", e.target.value)}
                                className="w-full p-2 bg-white border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#021422]"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <Clock size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No workers assigned to this schedule</p>
                </div>
              )}

              {/* Summary */}
              {hasEntries && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-500">
                    <span className="font-bold">{workersWithOvertime}</span> worker{workersWithOvertime !== 1 ? "s" : ""} •
                    <span className="font-bold"> {totalHours}</span> total overtime hours
                  </p>
                </div>
              )}
            </>
          ) : (
            showDropdown && dropdownId === "" && (
              <div className="text-center py-8 text-gray-400">
                <Clock size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs">Select a schedule to authorize overtime</p>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasEntries || !selectedSchedule || loading}
            className="flex-1 py-2.5 rounded-lg bg-[#021422] text-white text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authorizing..." : "Authorize Overtime"}
          </button>
        </div>
      </div>
    </div>
  );
}
