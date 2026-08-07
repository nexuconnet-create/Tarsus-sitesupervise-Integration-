"use client";

import { useState } from "react";
import { X, FileText, Clock, Plus, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { ApiPermit, PTWType, CreatePermitBody, ApiPTWDailyLog } from "@/lib/services/hseService";
import { PTW_TYPE_LABELS, hseService } from "@/lib/services/hseService";
import { hseKeys } from "@/lib/queryKeys";

interface PTWModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreatePermitBody) => void;
  record?: ApiPermit | null;
  projectUuid: string;
}

export type { CreatePermitBody as PTWFormData };

const PTW_TYPES: PTWType[] = ["HOT_WORK", "EXCAVATION", "ELECTRICAL", "WORKING_AT_HEIGHT", "CONFINED_SPACE"];

const statusBadge = (s: string) => {
  switch (s?.toUpperCase()) {
    case "ACTIVE":  return "bg-green-100 text-green-700 border-green-200";
    case "EXPIRED": return "bg-red-100 text-red-700 border-red-200";
    case "REVOKED": return "bg-orange-100 text-orange-700 border-orange-200";
    case "CLOSED":  return "bg-gray-100 text-gray-700 border-gray-200";
    default:        return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const logStatusBadge = (s: string) =>
  s === "CONFIRMED"
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-red-100 text-red-700 border-red-200";

const isExpired = (validUntil: string) => validUntil && new Date(validUntil) < new Date();

const emptyForm = (): CreatePermitBody => ({
  type: "HOT_WORK",
  location: "",
  task_reference: "",
  validUntil: "",
});

export default function PTWModal({ isOpen, onClose, onSubmit, record, projectUuid }: PTWModalProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreatePermitBody>(emptyForm());
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({
    date: new Date().toISOString().split("T")[0],
    status: "CONFIRMED" as "CONFIRMED" | "REVOKED",
    notes: "",
  });

  const { data: allLogs = [] } = useQuery<ApiPTWDailyLog[]>({
    queryKey: hseKeys.dailyLogs(projectUuid ?? ""),
    queryFn: async () => {
      const res = await hseService.getDailyLogs(projectUuid);
      return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
    },
    enabled: !!record && !!projectUuid,
  });

  // Match logs to this permit. Backend ptw field may be UUID or numeric PK.
  const permitLogs = record
    ? allLogs.filter((log) => String(log.ptw) === record.uuid)
    : [];

  const createLogMutation = useMutation({
    mutationFn: (data: { ptw: string; date: string; status: "CONFIRMED" | "REVOKED"; notes?: string }) =>
      hseService.createDailyLog(projectUuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hseKeys.dailyLogs(projectUuid ?? "") });
      setShowLogForm(false);
      setLogForm({ date: new Date().toISOString().split("T")[0], status: "CONFIRMED", notes: "" });
      toast.success("Daily log recorded");
    },
    onError: () => toast.error("Failed to record daily log"),
  });

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure validUntil is sent as ISO datetime string
    const validUntil = formData.validUntil.includes("T")
      ? `${formData.validUntil}:00`
      : `${formData.validUntil}T23:59:00`;
    onSubmit?.({ ...formData, validUntil });
    onClose();
    setFormData(emptyForm());
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;
    createLogMutation.mutate({ ptw: record.uuid, ...logForm });
  };

  // ─── Detail View ─────────────────────────────────────────────────────────────
  if (record) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <AnimatePresence>
          <motion.div
            key="ptw-detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText size={24} className="text-[#021422]" />
                  <h2 className="text-2xl font-bold text-[#021422]">Permit to Work</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                    {PTW_TYPE_LABELS[record.type]}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${statusBadge(record.status)}`}>
                    {record.status}
                  </span>
                  {isExpired(record.validUntil) && record.status === "ACTIVE" && (
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold border bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                      <Clock size={12} /> Expired
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-sm font-bold text-[#021422]">{record.location}</p>
                </div>

                {record.task_reference && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Task Reference</p>
                    <p className="text-sm font-bold text-[#021422]">{record.task_reference}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Issued To</p>
                    <p className="text-sm font-medium text-[#021422]">{record.issued_to_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Valid Until</p>
                    <p className={`text-sm font-medium ${isExpired(record.validUntil) && record.status === "ACTIVE" ? "text-red-600" : "text-[#021422]"}`}>
                      {record.validUntil ? new Date(record.validUntil).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Issued</p>
                  <p className="text-sm font-medium text-[#021422]">{new Date(record.created_at).toLocaleDateString()}</p>
                </div>

                {/* ── Daily Confirmation Logs ──────────────────────────────── */}
                <div className="border-t pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-[#021422]">Daily Confirmation Logs</p>
                    {projectUuid && (
                      <button
                        type="button"
                        onClick={() => setShowLogForm((v) => !v)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#002b4d] hover:text-[#001f38]"
                      >
                        <Plus size={14} />
                        Log Today
                      </button>
                    )}
                  </div>

                  {showLogForm && (
                    <form
                      onSubmit={handleLogSubmit}
                      className="bg-gray-50 rounded-xl p-4 mb-3 space-y-3 border border-gray-200"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Date</label>
                          <input
                            type="date"
                            required
                            value={logForm.date}
                            onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#021422]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">Status</label>
                          <select
                            value={logForm.status}
                            onChange={(e) =>
                              setLogForm({ ...logForm, status: e.target.value as "CONFIRMED" | "REVOKED" })
                            }
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#021422] bg-white"
                          >
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="REVOKED">Revoked</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Notes (optional)</label>
                        <textarea
                          value={logForm.notes}
                          onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                          rows={2}
                          placeholder="Any observations..."
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#021422] resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={createLogMutation.isPending}
                          className="flex-1 py-2 bg-[#002b4d] text-white rounded-lg text-sm font-bold hover:bg-[#001f38] disabled:opacity-50 transition-colors"
                        >
                          {createLogMutation.isPending ? "Saving…" : "Save Log"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowLogForm(false)}
                          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {permitLogs.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No daily logs recorded</p>
                  ) : (
                    <div className="space-y-2">
                      {permitLogs.map((log) => (
                        <div
                          key={log.uuid}
                          className="flex items-start justify-between gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
                        >
                          <div className="flex items-start gap-2">
                            {log.status === "CONFIRMED" ? (
                              <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="text-xs font-semibold text-[#021422]">
                                {new Date(log.date).toLocaleDateString()}
                              </p>
                              {log.confirmed_by_name && (
                                <p className="text-xs text-gray-500">By {log.confirmed_by_name}</p>
                              )}
                              {log.notes && (
                                <p className="text-xs text-gray-500 mt-0.5">{log.notes}</p>
                              )}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${logStatusBadge(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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

  // ─── Create View ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <AnimatePresence>
        <motion.div
          key="ptw-create"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-[#021422]" />
                <h2 className="text-2xl font-bold text-[#021422]">Issue Permit to Work</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Permit Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as PTWType })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none bg-white"
                >
                  {PTW_TYPES.map((t) => (
                    <option key={t} value={t}>{PTW_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Location</label>
                <input
                  required
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter work location"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Task Reference (optional)</label>
                <input
                  type="text"
                  value={formData.task_reference ?? ""}
                  onChange={(e) => setFormData({ ...formData, task_reference: e.target.value })}
                  placeholder="e.g., WP-201, Steel Beam Connection"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Valid Until</label>
                <input
                  required
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                />
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors"
                >
                  Issue Permit
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
