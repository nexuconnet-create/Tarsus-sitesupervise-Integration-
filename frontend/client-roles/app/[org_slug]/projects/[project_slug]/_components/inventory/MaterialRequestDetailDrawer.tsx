"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ClipboardList, Clock, CheckCircle, XCircle, Package, User, Calendar, FileText, AlertTriangle, Hash } from "lucide-react";
import type { MaterialRequest } from "@/lib/types/inventory";
import {
  MATERIAL_REQUEST_STATUS_LABELS,
  MATERIAL_REQUEST_PRIORITY_LABELS,
} from "@/lib/types/inventory";

interface MaterialRequestDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request: MaterialRequest | null;
  loading?: boolean;
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  approved: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
  rejected: { bg: "bg-rose-50", text: "text-rose-700", icon: XCircle },
  delivered: { bg: "bg-sky-50", text: "text-sky-700", icon: Package },
  cancelled: { bg: "bg-slate-50", text: "text-slate-600", icon: XCircle },
};

const priorityConfig: Record<string, { bg: string; text: string }> = {
  urgent: { bg: "bg-rose-100", text: "text-rose-700" },
  high: { bg: "bg-amber-100", text: "text-amber-700" },
  medium: { bg: "bg-yellow-50", text: "text-yellow-800" },
  low: { bg: "bg-emerald-50", text: "text-emerald-700" },
};

function extractApproverEmail(raw: string): string | null {
  const first = raw.split(/\n{2,}/)[0];
  const match = first?.match(/^(.+?)\s*\(/);
  return match ? match[1].trim() : null;
}

function cleanNotes(raw: string): string {
  if (!raw) return raw;
  const entries = raw.split(/\n{2,}/);
  const cleaned = entries.map((entry) => {
    const match = entry.match(/^.*?:\s(.+)\s\([^)]+\)$/);
    return match ? match[1].trim() : entry;
  });
  return cleaned.join("\n\n");
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Field({ label, value, fullWidth = false }: { label: string; value: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <div className="text-sm font-medium text-gray-900">{value || "—"}</div>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-4">{children}</div>;
}

function SectionCard({ title, icon: Icon, accentColor = "bg-gray-500", children }: { title: string; icon: React.ElementType; accentColor?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className={`w-6 h-6 rounded-md ${accentColor} flex items-center justify-center`}>
          <Icon className="w-3 h-3 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function MaterialRequestDetailDrawer({
  isOpen,
  onClose,
  request,
  loading,
}: MaterialRequestDetailDrawerProps) {
  if (!isOpen) return null;

  const statusCfg = request ? statusConfig[request.status] || statusConfig.pending : statusConfig.pending;
  const StatusIcon = statusCfg.icon;
  const priorityCfg = request ? priorityConfig[request.priority || "medium"] : priorityConfig.medium;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-white z-[80] shadow-2xl flex flex-col"
          >
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading request details…</p>
              </div>
            ) : !request ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                No request selected
              </div>
            ) : (
              <>
                {/* Hero Header */}
                <div className="relative flex-shrink-0 bg-gradient-to-br from-indigo-600 to-indigo-700 px-5 pt-4 pb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                      <StatusIcon className="w-3 h-3" />
                      {MATERIAL_REQUEST_STATUS_LABELS[request.status]}
                    </span>
                    <button
                      onClick={onClose}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-500/30 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-white leading-tight truncate">
                          {request.itemName}
                        </h2>
                        <p className="text-xs text-white/70 mt-0.5">
                          Requested by {request.requestedByName}
                        </p>
                      </div>
                    </div>

                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${priorityCfg.bg} ${priorityCfg.text}`}>
                      {request.priority ? MATERIAL_REQUEST_PRIORITY_LABELS[request.priority] : "Medium"}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-3 bg-white rounded-t-xl" />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-white p-4 space-y-3">
                  <SectionCard title="Item Details" icon={Package} accentColor="bg-indigo-500">
                    <FieldGrid>
                      <Field label="Item Name" value={request.itemName} />
                      <Field label="Material Code" value={<span className="font-mono">{request.materialCode || "—"}</span>} />
                      <Field label="Quantity Requested" value={request.unit ? request.quantityRequested + " (" + request.unit + ")" : String(request.quantityRequested)} />
                      {request.quantity !== undefined && <Field label="Quantity Delivered" value={request.unit ? request.quantity + " (" + request.unit + ")" : String(request.quantity)} />}
                    </FieldGrid>
                  </SectionCard>

                  <SectionCard title="Request Info" icon={User} accentColor="bg-violet-500">
                    <FieldGrid>
                      <Field label="Requested By" value={request.requestedByName} />
                      <Field label="Priority" value={
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${priorityCfg.bg} ${priorityCfg.text}`}>
                          {request.priority ? MATERIAL_REQUEST_PRIORITY_LABELS[request.priority] : "Medium"}
                        </span>
                      } />
                      <Field label="Status" value={
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {MATERIAL_REQUEST_STATUS_LABELS[request.status]}
                        </span>
                      } />
                      {(() => {
                        const raw = request.approvedBy;
                        const notes = request.notes;
                        if (!raw && !notes) return null;
                        const label = (raw && /^[a-zA-Z]/.test(raw))
                          ? raw
                          : notes
                            ? extractApproverEmail(notes)
                            : null;
                        return label ? <Field label="Approved By" value={label} /> : null;
                      })()}
                    </FieldGrid>
                  </SectionCard>

                  <SectionCard title="Dates" icon={Calendar} accentColor="bg-teal-500">
                    <FieldGrid>
                      <Field label="Created" value={formatDate(request.createdAt)} />
                      <Field label="Updated" value={formatDate(request.updatedAt)} />
                    </FieldGrid>
                  </SectionCard>

                  {request.notes && (
                    <SectionCard title="Notes" icon={FileText} accentColor="bg-gray-500">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-snug">{cleanNotes(request.notes)}</p>
                    </SectionCard>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
