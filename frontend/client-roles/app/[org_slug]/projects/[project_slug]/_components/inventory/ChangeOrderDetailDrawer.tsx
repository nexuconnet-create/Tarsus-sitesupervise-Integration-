"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2, AlertTriangle, CheckCircle, Plus, Edit3, Trash2, Send } from "lucide-react";
import toast from "react-hot-toast";
import type { PurchaseOrderChange, PurchaseOrderChangeStatus } from "@/lib/types/purchaseOrderChange";
import {
  PO_CHANGE_STATUS_LABELS,
  PO_CHANGE_STATUS_STYLES,
  canPerformChangeAction,
} from "@/lib/types/purchaseOrderChange";
import { purchaseOrderChangeService } from "@/lib/services/purchaseOrderChangeService";
import { purchaseOrderChangeFromApi } from "@/lib/transforms/purchaseOrderChangeTransforms";
import { getErrorMessage } from "@/lib/error";

interface ChangeOrderDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  changeOrder: PurchaseOrderChange | null;
  projectId: string;
  poId: string;
  userRole: string;
  onStatusChange?: (updated: PurchaseOrderChange) => void;
}

const actionBadge = (action: string) => {
  const styles: Record<string, { bg: string; text: string; icon: typeof Plus }> = {
    ADD:    { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-700", icon: Plus },
    UPDATE: { bg: "bg-blue-50 text-blue-700 border-blue-200", text: "text-blue-700", icon: Edit3 },
    REMOVE: { bg: "bg-red-50 text-red-700 border-red-200", text: "text-red-700", icon: Trash2 },
  };
  const s = styles[action] || { bg: "bg-gray-50 text-gray-600 border-gray-200", text: "text-gray-600", icon: Edit3 };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${s.bg}`}>
      <Icon size={10} />
      {action}
    </span>
  );
};

const statusStepIndex: Record<PurchaseOrderChangeStatus, number> = {
  draft: 0,
  submitted: 1,
  approved: 2,
  applied: 3,
  rejected: -1,
};

export default function ChangeOrderDetailDrawer({
  isOpen,
  onClose,
  changeOrder,
  projectId,
  poId,
  userRole,
  onStatusChange,
}: ChangeOrderDetailDrawerProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);

  if (!isOpen || !changeOrder) return null;

  const co = changeOrder;
  const currentStep = statusStepIndex[co.status];

  const runAction = async (key: string, fn: () => Promise<{ data: unknown }>) => {
    setActionLoading(key);
    try {
      const res = await fn();
      const updated = purchaseOrderChangeFromApi(
        (res.data as { data?: unknown })?.data ?? res.data as Parameters<typeof purchaseOrderChangeFromApi>[0],
      );
      toast.success(`${updated.changeNumber} → ${PO_CHANGE_STATUS_LABELS[updated.status]}`);
      onStatusChange?.(updated);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
      setShowApplyConfirm(false);
    }
  };

  const steps = [
    { key: "draft", label: "Draft" },
    { key: "submitted", label: "Submitted" },
    { key: "approved", label: "Approved" },
    { key: "applied", label: "Applied" },
  ];

  // Group items by action
  const addItems = co.items.filter((i) => i.action === "ADD");
  const updateItems = co.items.filter((i) => i.action === "UPDATE");
  const removeItems = co.items.filter((i) => i.action === "REMOVE");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-[80] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="relative flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-700 px-5 pt-4 pb-5">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  PO_CHANGE_STATUS_STYLES[co.status].bg} ${PO_CHANGE_STATUS_STYLES[co.status].text}`}>
                  {PO_CHANGE_STATUS_LABELS[co.status]}
                </span>
                <button onClick={onClose} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-lg font-bold text-white">{co.changeNumber}</h2>
              <p className="text-xs text-white/70 mt-0.5">PO: {co.poNumber}</p>
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-white rounded-t-xl" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-white p-4 space-y-4">
              {/* Status Stepper */}
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1">
                  {steps.map((step, i) => {
                    const isActive = i === currentStep;
                    const isDone = i < currentStep;
                    const isRejected = co.status === "rejected" && i === 1;
                    return (
                      <div key={step.key} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isRejected
                              ? "bg-red-500 text-white"
                              : isDone
                              ? "bg-emerald-500 text-white"
                              : isActive
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}>
                            {isRejected ? "✕" : isDone ? "✓" : i + 1}
                          </div>
                          <span className={`text-[9px] mt-0.5 font-medium ${
                            isActive ? "text-blue-600" : isDone ? "text-emerald-600" : "text-gray-400"
                          }`}>
                            {step.label}
                          </span>
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`h-0.5 flex-1 mx-1 rounded ${i < currentStep ? "bg-emerald-400" : "bg-gray-200"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {co.status === "rejected" && (
                  <p className="text-[10px] text-red-500 text-center mt-1">Rejected</p>
                )}
              </div>

              {/* Reason */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Reason</h4>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">{co.reason}</p>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Changes ({co.items.length} item{co.items.length !== 1 ? "s" : ""})
                </h4>
                {co.items.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No items on this change order.</p>
                ) : (
                  <div className="space-y-2">
                    {addItems.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-emerald-600 mb-1">Adding</p>
                        {addItems.map((item) => (
                          <div key={item.uuid} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              {actionBadge("ADD")}
                              <span className="text-xs font-medium text-gray-900">{item.inventoryItemName}</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-700">× {item.newQuantity} {item.inventoryItemUnit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {updateItems.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-blue-600 mb-1">Updating</p>
                        {updateItems.map((item) => (
                          <div key={item.uuid} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              {actionBadge("UPDATE")}
                              <span className="text-xs font-medium text-gray-900">{item.inventoryItemName}</span>
                            </div>
                            <span className="text-xs font-bold text-blue-700">
                              {item.oldQuantity} → {item.newQuantity} {item.inventoryItemUnit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {removeItems.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-red-600 mb-1">Removing</p>
                        {removeItems.map((item) => (
                          <div key={item.uuid} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              {actionBadge("REMOVE")}
                              <span className="text-xs font-medium text-gray-900">{item.inventoryItemName}</span>
                            </div>
                            <span className="text-xs font-bold text-red-700">× {item.oldQuantity} {item.inventoryItemUnit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Audit */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Audit</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Requested by</span>
                    <span className="font-medium text-gray-900">{co.requestedByName || "—"}</span>
                  </div>
                  {co.approvedByName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Approved by</span>
                      <span className="font-medium text-gray-900">{co.approvedByName}</span>
                    </div>
                  )}
                  {co.appliedByName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Applied by</span>
                      <span className="font-medium text-gray-900">{co.appliedByName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-600">{new Date(co.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>

              {canPerformChangeAction(co.status, "submit", userRole) && (
                <button
                  onClick={() => runAction("submit", () => purchaseOrderChangeService.submitChange(projectId, poId, co.uuid))}
                  disabled={actionLoading === "submit"}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading === "submit" ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  Submit
                </button>
              )}

              {canPerformChangeAction(co.status, "approve", userRole) && (
                <button
                  onClick={() => runAction("approve", () => purchaseOrderChangeService.approveChange(projectId, poId, co.uuid))}
                  disabled={actionLoading === "approve"}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading === "approve" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                  Approve
                </button>
              )}

              {canPerformChangeAction(co.status, "reject", userRole) && (
                <button
                  onClick={() => runAction("reject", () => purchaseOrderChangeService.rejectChange(projectId, poId, co.uuid))}
                  disabled={actionLoading === "reject"}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading === "reject" ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                  Reject
                </button>
              )}

              {canPerformChangeAction(co.status, "apply", userRole) && !showApplyConfirm && (
                <button
                  onClick={() => setShowApplyConfirm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700"
                >
                  <ArrowRight size={12} />
                  Apply to PO
                </button>
              )}
            </div>

            {/* Apply Confirmation */}
            {showApplyConfirm && (
              <div className="flex-shrink-0 px-4 py-3 border-t-2 border-amber-300 bg-amber-50 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">Apply this change order?</p>
                    <p className="text-[10px] text-amber-700 mt-0.5">
                      This will modify the PO line items. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowApplyConfirm(false)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => runAction("apply", () => purchaseOrderChangeService.applyChange(projectId, poId, co.uuid))}
                    disabled={actionLoading === "apply"}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                  >
                    {actionLoading === "apply" ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                    Confirm Apply
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
