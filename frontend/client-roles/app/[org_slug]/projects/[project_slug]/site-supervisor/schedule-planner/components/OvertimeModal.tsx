"use client";

/* eslint-disable react-hooks/set-state-in-effect -- hydrate the edit form from the selected entry. */

import { useState, useMemo, useEffect } from "react";
import { X, Clock } from "lucide-react";

interface Worker {
  id: string;
  memberId: string;
  name: string;
  trade: string;
}

interface ScheduleOption {
  id: string;
  task: string;
  title: string;
  originalDate: string;
  workers: Worker[];
}

interface OvertimePayload {
  workers: string[];
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

interface OvertimeEntry {
  id: string;
  worker_id: string;
  date: string;
  hours: string;
  start_time: string;
  end_time: string;
  notes: string;
}

interface OvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: ScheduleOption;
  onAuthorize: (
    scheduleId: string,
    payload: OvertimePayload,
  ) => Promise<boolean>;
  editEntry?: OvertimeEntry | null;
  onUpdate?: (
    scheduleId: string,
    overtimeId: string,
    payload: { date?: string; start_time?: string; end_time?: string; notes?: string },
  ) => Promise<boolean>;
}

export default function OvertimeModal({
  isOpen,
  onClose,
  schedule,
  onAuthorize,
  editEntry = null,
  onUpdate,
}: OvertimeModalProps) {
  const isEditMode = !!editEntry;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [date, setDate] = useState(schedule?.originalDate || "");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill form when editing
  useEffect(() => {
    if (editEntry) {
      setSelected(new Set([editEntry.worker_id]));
      setDate(editEntry.date);
      setStartTime(editEntry.start_time?.slice(0, 5) || "");
      setEndTime(editEntry.end_time?.slice(0, 5) || "");
      setNotes(editEntry.notes || "");
    }
  }, [editEntry]);

  const workers = schedule?.workers || [];

  const previewHours = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const mins = eh * 60 + em - (sh * 60 + sm);
    return mins > 0 ? +(mins / 60).toFixed(2) : 0;
  }, [startTime, endTime]);

  const toggleWorker = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === workers.length
        ? new Set()
        : new Set(workers.map((w) => w.id)),
    );

  const canSubmit =
    !!schedule &&
    selected.size > 0 &&
    !!date &&
    !!startTime &&
    !!endTime &&
    previewHours > 0;

  const handleConfirm = async () => {
    if (!schedule || !canSubmit) return;
    setError("");
    setLoading(true);

    if (isEditMode && onUpdate && editEntry) {
      const ok = await onUpdate(schedule.id, editEntry.id, {
        date,
        start_time: startTime,
        end_time: endTime,
        notes: notes || undefined,
      });
      setLoading(false);
      if (ok) handleClose();
      else setError("Could not update overtime.");
    } else {
      const ok = await onAuthorize(schedule.id, {
        workers: Array.from(selected),
        date,
        start_time: startTime,
        end_time: endTime,
        notes: notes || undefined,
      });
      setLoading(false);
      if (ok) handleClose();
      else setError("Could not authorize overtime. Check the time window.");
    }
  };

  const handleClose = () => {
    setSelected(new Set());
    setStartTime("");
    setEndTime("");
    setNotes("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#021422]">
            {isEditMode ? "Edit Overtime" : "Authorize Overtime"}
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-[#021422]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!schedule ? (
            <div className="text-center py-8 text-gray-400">
              <Clock size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">Open a schedule to authorize overtime</p>
            </div>
          ) : (
            <>
              {/* Schedule Info */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-sm font-semibold text-[#021422]">
                  {schedule.task}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{schedule.title}</p>
              </div>

              {/* Date + window */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#021422]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">
                    From
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#021422]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">
                    To
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#021422]"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 -mt-3">
                Hours are calculated automatically and must not overlap regular
                working hours.
              </p>

              {/* Workers */}
              {workers.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500">
                      Select Workers
                    </label>
                    <button
                      type="button"
                      onClick={toggleAll}
                      className="text-[10px] font-bold text-[#021422] hover:text-gray-600"
                    >
                      {selected.size === workers.length
                        ? "Clear all"
                        : "Select all"}
                    </button>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {workers.map((w) => {
                      const isSel = selected.has(w.id);
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => toggleWorker(w.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-colors ${
                            isSel
                              ? "border-[#021422] bg-[#021422]/5"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                              isSel
                                ? "border-[#021422] bg-[#021422]"
                                : "border-gray-300"
                            }`}
                          >
                            {isSel && (
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                fill="none"
                              >
                                <path
                                  d="M2 5L4 7L8 3"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="w-7 h-7 rounded-full bg-[#021422] flex items-center justify-center text-white text-xs font-bold">
                            {w.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#021422]">
                              {w.name}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {w.memberId} • {w.trade}
                            </p>
                          </div>
                        </button>
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

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for overtime..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                />
              </div>

              {/* Summary */}
              {selected.size > 0 && previewHours > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-500">
                    <span className="font-bold">{selected.size}</span> worker
                    {selected.size !== 1 ? "s" : ""} •
                    <span className="font-bold"> {previewHours}</span> h each
                  </p>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-600 font-medium">{error}</p>
              )}
            </>
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
            disabled={!canSubmit || loading}
            className="flex-1 py-2.5 rounded-lg bg-[#021422] text-white text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? isEditMode ? "Updating..." : "Authorizing..."
              : isEditMode ? "Update Overtime" : "Authorize Overtime"}
          </button>
        </div>
      </div>
    </div>
  );
}
