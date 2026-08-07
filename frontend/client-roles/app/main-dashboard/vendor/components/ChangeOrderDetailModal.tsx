"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import type { ChangeOrder } from "@/lib/types/vendor";

interface ChangeOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  changeOrder: ChangeOrder | null;
  onRespond: (id: string, data: { status: string }) => Promise<void>;
}

const ChangeOrderDetailModal: React.FC<ChangeOrderDetailModalProps> = ({
  isOpen,
  onClose,
  changeOrder,
  onRespond,
}) => {
  const [loading, setLoading] = useState(false);

  if (!changeOrder) return null;

  const handleRespond = async (status: "approved" | "rejected") => {
    setLoading(true);
    try {
      await onRespond(changeOrder.id, { status });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const isPending = changeOrder.status === "pending";

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700",
      approved: "bg-green-50 text-green-700",
      rejected: "bg-red-50 text-red-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  const costDiff = changeOrder.costDifference;
  const isIncrease = costDiff > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#0D1B2A]">Change Order</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Title + Status */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#0D1B2A]">{changeOrder.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(changeOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {statusBadge(changeOrder.status)}
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400 block text-xs mb-1">Purchase Order</span>
                  <span className="font-medium text-[#0D1B2A]">
                    {changeOrder.poNumber || changeOrder.purchaseOrderId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs mb-1">Project</span>
                  <span className="font-medium text-[#0D1B2A]">
                    {changeOrder.projectId}
                  </span>
                </div>
              </div>

              {/* Description */}
              {changeOrder.description && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-700">{changeOrder.description}</p>
                </div>
              )}

              {/* Reason */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Reason
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 border border-gray-100">
                  {changeOrder.reason}
                </div>
              </div>

              {/* Items Comparison */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Package size={14} />
                  Item Changes
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Original */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">
                      Original
                    </p>
                    <div className="space-y-2">
                      {changeOrder.originalItems.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="bg-red-50 rounded-lg p-3 border border-red-100"
                        >
                          <p className="font-medium text-[#0D1B2A] text-xs">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.quantity} {item.unit} × ₦{item.unitPrice.toFixed(2)}
                          </p>
                          <p className="text-xs font-bold text-red-600 mt-0.5">
                            ₦{(item.totalPrice || item.quantity * item.unitPrice).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Changed */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">
                      Changed
                    </p>
                    <div className="space-y-2">
                      {changeOrder.changedItems.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="bg-green-50 rounded-lg p-3 border border-green-100"
                        >
                          <p className="font-medium text-[#0D1B2A] text-xs">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.quantity} {item.unit} × ₦{item.unitPrice.toFixed(2)}
                          </p>
                          <p className="text-xs font-bold text-green-600 mt-0.5">
                            ₦{(item.totalPrice || item.quantity * item.unitPrice).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Difference */}
              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Cost Difference
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`text-2xl font-bold ${
                      isIncrease ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {isIncrease ? "+" : ""}₦{costDiff.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <ArrowRight
                    size={20}
                    className={isIncrease ? "text-red-400" : "text-green-400"}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {isPending && (
                <>
                  <button
                    onClick={() => handleRespond("rejected")}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <XCircle size={16} />
                    {loading ? "..." : "Reject"}
                  </button>
                  <button
                    onClick={() => handleRespond("approved")}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle size={16} />
                    {loading ? "..." : "Approve"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChangeOrderDetailModal;
