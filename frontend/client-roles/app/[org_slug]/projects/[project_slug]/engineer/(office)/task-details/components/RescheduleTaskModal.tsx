"use client";

import { useState } from "react";
import { X, RefreshCw, Calendar, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "../types";
import { QUEUE_LABELS, STATUS_CONFIG, RESCHEDULE_BADGE_CONFIG } from "../types";
import { useAuthStore } from "@/lib/stores/authStore";

interface RescheduleTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (taskId: string, rescheduleData: ReschedulePayload) => void;
}

export interface ReschedulePayload {
  startDate: string;
  dueDate: string;
  reschedule_reason: string;
  is_rescheduled: true;
  original_start_date: string;
  original_end_date: string;
  rescheduled_at: string;
  rescheduled_by: string;
  reschedule_approved_by_pm: true;
}

export default function RescheduleTaskModal({
  isOpen,
  onClose,
  task,
  onSave,
}: RescheduleTaskModalProps) {
  const user = useAuthStore((s) => s.user);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ startDate?: string; endDate?: string; reason?: string }>({});

  const handleClose = () => {
    setNewStartDate("");
    setNewEndDate("");
    setReason("");
    setErrors({});
    onClose();
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!newStartDate) next.startDate = "New start date is required.";
    if (!newEndDate) next.endDate = "New end date is required.";
    if (newStartDate && newEndDate && newEndDate < newStartDate)
      next.endDate = "End date must be after start date.";
    if (!reason.trim()) next.reason = "Reschedule reason is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!task || !validate()) return;

    const payload: ReschedulePayload = {
      startDate: newStartDate,
      dueDate: newEndDate,
      reschedule_reason: reason.trim(),
      is_rescheduled: true,
      original_start_date: task.original_start_date ?? task.startDate,
      original_end_date: task.original_end_date ?? task.dueDate,
      rescheduled_at: new Date().toISOString(),
      rescheduled_by: user?.fullname ?? user?.username ?? "Project Manager",
      reschedule_approved_by_pm: true,
    };

    onSave(task.id, payload);
    handleClose();
  };

  if (!isOpen || !task) return null;

  const statusConfig = STATUS_CONFIG[task.status];
  const isAlreadyRescheduled = task.is_rescheduled;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#021422]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                <RefreshCw size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reschedule Task</h3>
                <p className="text-xs text-gray-400">PM approval — same Task ID &amp; WP</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Task Identity Card */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#021422] bg-white border border-gray-200 px-2 py-0.5 rounded">
                    {task.wp ?? task.id}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                    {statusConfig.label}
                  </span>
                  <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded">
                    {QUEUE_LABELS[task.queue]}
                  </span>
                  {isAlreadyRescheduled && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${RESCHEDULE_BADGE_CONFIG.bg} ${RESCHEDULE_BADGE_CONFIG.text} ${RESCHEDULE_BADGE_CONFIG.border}`}>
                      <RefreshCw size={9} />
                      RESCHEDULED
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-[#021422]">{task.title}</p>
                <p className="text-xs text-gray-500">{task.location} · Grid {task.grid}</p>
              </div>
            </div>
          </div>

          {/* Already-rescheduled warning */}
          {isAlreadyRescheduled && (
            <div className="mx-6 mt-4 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
              <AlertTriangle size={14} className="text-orange-500 mt-0.5 shrink-0" />
              <p className="text-xs text-orange-700 font-medium">
                This task has been rescheduled before. Saving will update the reschedule record.
              </p>
            </div>
          )}

          {/* Current Schedule */}
          <div className="px-6 pt-4">
            <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Current Schedule</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar size={11} className="text-gray-400" />
                  <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Start Date</p>
                </div>
                <p className="text-sm font-semibold text-[#021422]">{task.startDate}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar size={11} className="text-gray-400" />
                  <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">End Date</p>
                </div>
                <p className="text-sm font-semibold text-[#021422]">{task.dueDate}</p>
              </div>
            </div>
          </div>

          {/* New Schedule Inputs */}
          <div className="px-6 pt-4 space-y-4">
            <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">New Schedule</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#021422] mb-1.5">
                  New Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => {
                    setNewStartDate(e.target.value);
                    setErrors((p) => ({ ...p, startDate: undefined }));
                  }}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${errors.startDate ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                />
                {errors.startDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-[#021422] mb-1.5">
                  New End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => {
                    setNewEndDate(e.target.value);
                    setErrors((p) => ({ ...p, endDate: undefined }));
                  }}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${errors.endDate ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                />
                {errors.endDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#021422] mb-1.5">
                Reason for Rescheduling <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setErrors((p) => ({ ...p, reason: undefined }));
                }}
                placeholder="e.g. Delayed material delivery, weather conditions, site access issues..."
                rows={3}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${errors.reason ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              {errors.reason && (
                <p className="text-xs text-red-500 mt-1">{errors.reason}</p>
              )}
            </div>
          </div>

          {/* Notice */}
          <div className="mx-6 mt-3 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
            <RefreshCw size={13} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 font-medium">
              Task ID <strong>{task.wp ?? task.id}</strong> and Work Package remain unchanged. A reschedule file will be auto-saved to Files &amp; Documents.
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 mt-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              Confirm Reschedule
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
