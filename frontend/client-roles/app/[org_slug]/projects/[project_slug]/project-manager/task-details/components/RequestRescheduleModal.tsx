"use client";

import { useState } from "react";
import { X, Send, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, PendingRescheduleRequest } from "../types";
import { useAuthStore } from "@/lib/stores/authStore";

interface RequestRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSubmit: (taskId: string, request: PendingRescheduleRequest) => void;
}

export default function RequestRescheduleModal({
  isOpen,
  onClose,
  task,
  onSubmit,
}: RequestRescheduleModalProps) {
  const user = useAuthStore((s) => s.user);
  const [newStartDate, setNewStartDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ startDate?: string; dueDate?: string; reason?: string }>({});

  const handleClose = () => {
    setNewStartDate("");
    setNewDueDate("");
    setReason("");
    setErrors({});
    onClose();
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!newStartDate) next.startDate = "New start date is required.";
    if (!newDueDate) next.dueDate = "New end date is required.";
    if (newStartDate && newDueDate && newDueDate < newStartDate)
      next.dueDate = "End date must be after start date.";
    if (!reason.trim()) next.reason = "Please provide a reason for the edit request.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!task || !validate()) return;
    onSubmit(task.id, {
      newStartDate,
      newDueDate,
      reason: reason.trim(),
      requestedBy: user?.fullname ?? user?.username ?? "Engineer",
      requestedAt: new Date().toISOString(),
    });
    handleClose();
  };

  if (!isOpen || !task) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-[#021422]">Request Task Edit</h3>
              <p className="text-xs text-gray-400 mt-0.5">Propose new dates — PM will review &amp; approve</p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={16} className="text-[#021422]" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Task identity */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5">{task.wp ?? task.id}</p>
              <p className="text-sm font-semibold text-[#021422] truncate">{task.title}</p>
            </div>

            {/* Current dates (read-only) */}
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Current Schedule</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar size={10} className="text-gray-400" />
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Start</p>
                  </div>
                  <p className="text-sm font-semibold text-[#021422]">{task.startDate}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar size={10} className="text-gray-400" />
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">End</p>
                  </div>
                  <p className="text-sm font-semibold text-[#021422]">{task.dueDate}</p>
                </div>
              </div>
            </div>

            {/* Proposed dates */}
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Proposed New Schedule</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#021422] mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => { setNewStartDate(e.target.value); setErrors((p) => ({ ...p, startDate: undefined })); }}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent ${errors.startDate ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                  />
                  {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#021422] mb-1.5">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => { setNewDueDate(e.target.value); setErrors((p) => ({ ...p, dueDate: undefined })); }}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent ${errors.dueDate ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                  />
                  {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-[#021422] mb-1.5">
                Reason for Edit <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => { setReason(e.target.value); setErrors((p) => ({ ...p, reason: undefined })); }}
                placeholder="e.g. Delayed material delivery, design change, weather conditions..."
                rows={3}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent ${errors.reason ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-lg bg-[#021422] text-white text-sm font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <Send size={14} />
              Send Request
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
