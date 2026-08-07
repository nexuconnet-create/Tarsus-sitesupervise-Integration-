"use client";

import { useState } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import type { WorkerData, AttendanceStatus } from "../types";

interface EditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: WorkerData | null;
  selectedDate: string;
  onSave: (data: { status: AttendanceStatus; checkIn: string; checkOut: string; notes: string }) => void;
  onDelete?: () => void;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string; bgColor: string }[] = [
  { value: "present", label: "Present", color: "text-green-600", bgColor: "bg-green-50" },
  { value: "early", label: "Early", color: "text-blue-600", bgColor: "bg-blue-50" },
  { value: "late", label: "Late", color: "text-yellow-600", bgColor: "bg-yellow-50" },
  { value: "absent", label: "Absent", color: "text-red-600", bgColor: "bg-red-50" },
];

export default function EditRecordModal({
  isOpen,
  onClose,
  worker,
  selectedDate,
  onSave,
  onDelete,
}: EditRecordModalProps) {
  const [status, setStatus] = useState<AttendanceStatus>(worker?.status as AttendanceStatus || "present");
  const [checkIn, setCheckIn] = useState(worker?.checkIn || "");
  const [checkOut, setCheckOut] = useState(worker?.checkOut || "");
  const [notes, setNotes] = useState(worker?.notes || "");

  if (!isOpen || !worker) return null;

  const dateDisplay = new Date(selectedDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleSave = () => {
    if (checkIn && checkOut && checkIn > checkOut) {
      toast.error("Check out time must be after check in time");
      return;
    }
    onSave({ status, checkIn, checkOut, notes });
    toast.success(`Attendance updated for ${worker.name}`);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      toast.success("Attendance record removed");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Edit Attendance</h3>
            <p className="text-xs text-gray-500 mt-0.5">{worker.name} â€” {dateDisplay}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Crew:</span>
                <span className="ml-2 font-semibold text-[#021422]">{worker.crewName}</span>
              </div>
              <div>
                <span className="text-gray-500">Schedule:</span>
                <span className="ml-2 font-semibold text-[#021422]">{worker.scheduleName}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Status
            </label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    status === opt.value
                      ? `${opt.bgColor} ${opt.color} ring-2 ring-offset-1 ring-current`
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                Check In
              </label>
              <input
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                Check Out
              </label>
              <input
                type="time"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] resize-none"
              rows={2}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between">
          {onDelete && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
            >
              <XCircle size={14} />
              Remove
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <CheckCircle2 size={14} />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
