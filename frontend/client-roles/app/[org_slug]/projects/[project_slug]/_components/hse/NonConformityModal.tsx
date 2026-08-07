"use client";

import { useState } from "react";
import { X, AlertCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ApiNCR, NCRSeverity, NCRStatus, CreateNCRBody } from "@/lib/services/hseService";
import { NCR_SEVERITY_LABELS, NCR_STATUS_LABELS } from "@/lib/services/hseService";

interface NonConformityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateNCRBody) => void;
  record?: ApiNCR | null;
}

export type { CreateNCRBody as NCRFormData };

const SEVERITIES: NCRSeverity[] = ["MINOR", "MAJOR", "CRITICAL"];
const STATUSES: NCRStatus[] = ["OPEN", "IN_PROGRESS", "CLOSED"];

const severityStyle = (s: NCRSeverity, selected: boolean) => {
  if (!selected) return "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100";
  switch (s) {
    case "CRITICAL": return "bg-red-100 border-red-500 text-red-800";
    case "MAJOR": return "bg-orange-100 border-orange-500 text-orange-800";
    case "MINOR": return "bg-yellow-100 border-yellow-500 text-yellow-800";
  }
};

const severityBadge = (s: NCRSeverity) => {
  switch (s) {
    case "CRITICAL": return "bg-red-100 text-red-700 border-red-200";
    case "MAJOR": return "bg-orange-100 text-orange-700 border-orange-200";
    case "MINOR": return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
};

const statusBadge = (s: NCRStatus) => {
  switch (s) {
    case "OPEN": return "bg-red-100 text-red-700";
    case "IN_PROGRESS": return "bg-blue-100 text-blue-700";
    case "CLOSED": return "bg-green-100 text-green-700";
  }
};

const isOverdue = (deadline: string) => deadline && new Date(deadline) < new Date();

export default function NonConformityModal({ isOpen, onClose, onSubmit, record }: NonConformityModalProps) {
  const [formData, setFormData] = useState<CreateNCRBody>({
    description: "",
    severity: "MINOR",
    location: "",
    status: "OPEN",
    deadline: "",
    root_cause: "",
    corrective_action: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
    setFormData({
      description: "",
      severity: "MINOR",
      location: "",
      status: "OPEN",
      deadline: "",
      root_cause: "",
      corrective_action: "",
    });
  };

  // ─── Detail View ──────────────────────────────────────────────────────────
  if (record) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <AnimatePresence>
          <motion.div
            key="ncr-detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle size={24} className="text-[#021422]" />
                  <h2 className="text-2xl font-bold text-[#021422]">NCR Detail</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${severityBadge(record.severity)}`}>
                    {NCR_SEVERITY_LABELS[record.severity]}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${statusBadge(record.status)}`}>
                    {NCR_STATUS_LABELS[record.status]}
                  </span>
                  {isOverdue(record.deadline) && record.status !== "CLOSED" && (
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold border bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                      <Clock size={12} /> Overdue
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-[#021422] bg-gray-50 rounded-lg p-4">{record.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                    <p className="text-sm font-medium text-[#021422]">{record.location}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Deadline</p>
                    <p className={`text-sm font-medium ${isOverdue(record.deadline) && record.status !== "CLOSED" ? "text-red-600" : "text-[#021422]"}`}>
                      {record.deadline ? new Date(record.deadline).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reporter</p>
                    <p className="text-sm font-medium text-[#021422]">{record.reporter}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reported</p>
                    <p className="text-sm font-medium text-[#021422]">{new Date(record.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {record.root_cause && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Root Cause</p>
                    <p className="text-sm text-[#021422] bg-gray-50 rounded-lg p-3">{record.root_cause}</p>
                  </div>
                )}

                {record.corrective_action && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Corrective Action</p>
                    <p className="text-sm text-[#021422] bg-gray-50 rounded-lg p-3">{record.corrective_action}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ─── Create View ──────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <AnimatePresence>
        <motion.div
          key="ncr-create"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle size={24} className="text-[#021422]" />
                <h2 className="text-2xl font-bold text-[#021422]">Log Non-Conformity</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the non-conformity in detail"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Severity</label>
                <div className="grid grid-cols-3 gap-3">
                  {SEVERITIES.map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setFormData({ ...formData, severity: sev })}
                      className={`py-3 px-4 rounded-lg font-semibold border-2 transition-colors text-sm ${severityStyle(sev, formData.severity === sev)}`}
                    >
                      {NCR_SEVERITY_LABELS[sev]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Location</label>
                <input
                  required
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Block A, 3rd Floor Slab"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as NCRStatus })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none bg-white"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{NCR_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Deadline</label>
                  <input
                    required
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Root Cause (optional)</label>
                <textarea
                  value={formData.root_cause ?? ""}
                  onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                  placeholder="Identify the underlying cause"
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Corrective Action (optional)</label>
                <textarea
                  value={formData.corrective_action ?? ""}
                  onChange={(e) => setFormData({ ...formData, corrective_action: e.target.value })}
                  placeholder="Describe the corrective action to be taken"
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none resize-none"
                />
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors"
                >
                  Log NCR
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-4 bg-white border border-gray-200 text-[#021422] rounded-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
