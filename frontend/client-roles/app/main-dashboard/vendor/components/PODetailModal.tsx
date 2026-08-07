"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, MapPin, Calendar, Building2, ChevronRight, Check, FileText, Loader2, Download } from "lucide-react";
import type { PurchaseOrder, RequisitionItem } from "@/lib/types/vendor";
import StatusPill from "./StatusPill";

interface PODetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  po: PurchaseOrder | null;
  onUpdateStatus: (id: string, data: { status: string }) => Promise<void>;
  onSubmitInvoice?: (poId: string, invoice: { items: RequisitionItem[]; totalAmount: number; notes?: string }) => Promise<void>;
}

const statusSteps = ["pending", "confirmed", "in_transit", "delivered"];
const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_transit: "In Transit",
  delivered: "Delivered",
};

const invoiceSteps = ["submitted", "approved", "paid"];
const invoiceLabels: Record<string, string> = {
  submitted: "Submitted",
  approved: "Approved",
  paid: "Paid",
};

const PODetailModal: React.FC<PODetailModalProps> = ({
  isOpen,
  onClose,
  po,
  onUpdateStatus,
  onSubmitInvoice,
}) => {
  const [loading, setLoading] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<RequisitionItem[]>([]);
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [showQR, setShowQR] = useState(false);

  if (!po) return null;

  const currentStepIndex = statusSteps.indexOf(po.status);
  const isTerminal = po.status === "cancelled" || po.status === "delivered";
  const nextStatus = !isTerminal && currentStepIndex < statusSteps.length - 1
    ? statusSteps[currentStepIndex + 1]
    : null;

  const handleStatusUpdate = async () => {
    if (!nextStatus) return;
    setLoading(true);
    try {
      await onUpdateStatus(po.id, { status: nextStatus });
      onClose();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const openInvoiceForm = () => {
    if (!po) return;
    setInvoiceItems(po.items.map((item) => ({ ...item })));
    setInvoiceNotes("");
    setInvoiceTotal(po.totalAmount);
    setShowInvoiceForm(true);
  };

  const recalcInvoiceTotal = (items: RequisitionItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    setInvoiceTotal(total);
  };

  const handleItemPriceChange = (index: number, unitPrice: number) => {
    const updated = [...invoiceItems];
    updated[index] = { ...updated[index], unitPrice, totalPrice: unitPrice * updated[index].quantity };
    setInvoiceItems(updated);
    recalcInvoiceTotal(updated);
  };

  const handleItemQtyChange = (index: number, quantity: number) => {
    const updated = [...invoiceItems];
    updated[index] = { ...updated[index], quantity, totalPrice: quantity * updated[index].unitPrice };
    setInvoiceItems(updated);
    recalcInvoiceTotal(updated);
  };

  const handleSubmitInvoice = async () => {
    if (!po || !onSubmitInvoice) return;
    setLoading(true);
    try {
      await onSubmitInvoice(po.id, { items: invoiceItems, totalAmount: invoiceTotal, notes: invoiceNotes || undefined });
      setShowInvoiceForm(false);
      onClose();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const statusPill = (status: string) => {
    const map: Record<string, "success" | "danger" | "warning" | "info" | "default"> = {
      pending: "warning",
      confirmed: "success",
      in_transit: "info",
      delivered: "success",
      cancelled: "default",
    };
    return <StatusPill label={status.replace("_", " ")} variant={map[status] || "default"} />;
  };

  const invoiceStepIndex = po.invoiceStatus ? invoiceSteps.indexOf(po.invoiceStatus) : -1;

  const handleDownloadQR = () => {
    setShowQR(true);
    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 300, 300);
        ctx.fillStyle = "#0D1B2A";
        ctx.font = "bold 14px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(po.poNumber, 150, 40);
        ctx.font = "12px Inter, sans-serif";
        ctx.fillText("SiteSupervise Delivery Docket", 150, 65);
        ctx.strokeStyle = "#0D1B2A";
        ctx.lineWidth = 2;
        const size = 160;
        const x = (300 - size) / 2;
        const y = 85;
        ctx.strokeRect(x, y, size, size);
        ctx.font = "10px Inter, sans-serif";
        ctx.fillStyle = "#6B7280";
        ctx.fillText("QR placeholder — real QR on production", 150, 265);
        const link = document.createElement("a");
        link.download = `QR-${po.poNumber}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
      setShowQR(false);
    }, 500);
  };

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
              <h2 className="text-xl font-bold text-[#0D1B2A]">
                {showInvoiceForm ? "Submit Invoice" : `Purchase Order ${po.poNumber}`}
              </h2>
              <button
                onClick={() => {
                  if (showInvoiceForm) setShowInvoiceForm(false);
                  else onClose();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {showInvoiceForm ? (
                <>
                  {/* Invoice items with editable prices */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Package size={14} />
                      Invoice Items
                    </h4>
                    <div className="space-y-3">
                      {invoiceItems.map((item, idx) => (
                        <div key={item.id || idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <p className="font-bold text-[#0D1B2A] text-sm mb-3">{item.name}</p>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-gray-400 text-xs block">Quantity</span>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemQtyChange(idx, Number(e.target.value))}
                                className="w-full border border-gray-200 rounded px-2 py-1 text-sm font-bold text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#0D1B2A]"
                              />
                            </div>
                            <div>
                              <span className="text-gray-400 text-xs block">Unit Price</span>
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handleItemPriceChange(idx, Number(e.target.value))}
                                className="w-full border border-gray-200 rounded px-2 py-1 text-sm font-bold text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#0D1B2A]"
                              />
                            </div>
                            <div>
                              <span className="text-gray-400 text-xs block">Total</span>
                              <span className="font-bold text-[#0D1B2A]">
                                ₦{(item.unitPrice * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Invoice Total</span>
                      <span className="text-xl font-bold text-[#0D1B2A]">
                        ₦{invoiceTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={invoiceNotes}
                      onChange={(e) => setInvoiceNotes(e.target.value)}
                      placeholder="Final notes, adjustments, etc."
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] resize-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Status + Meta */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#0D1B2A]">{po.vendorName || "Vendor"}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(po.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {statusPill(po.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 size={16} className="text-gray-400" />
                      <span>{po.projectName || po.projectId}</span>
                    </div>
                    {po.deliveryDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{new Date(po.deliveryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {po.deliveryAddress && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{po.deliveryAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Timeline */}
                  {po.status !== "cancelled" && (
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                        Status Timeline
                      </h4>
                      <div className="flex items-center justify-between">
                        {statusSteps.map((step, idx) => {
                          const isCompleted = idx <= currentStepIndex;
                          const isCurrent = idx === currentStepIndex;
                          return (
                            <React.Fragment key={step}>
                              <div className="flex flex-col items-center gap-1.5">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                    isCompleted
                                      ? isCurrent
                                        ? "bg-[#0D1B2A] text-white ring-4 ring-gray-200"
                                        : "bg-green-500 text-white"
                                      : "bg-gray-200 text-gray-500"
                                  }`}
                                >
                                  {isCompleted ? "✓" : idx + 1}
                                </div>
                                <span className={`text-xs font-medium ${isCurrent ? "text-[#0D1B2A]" : "text-gray-400"}`}>
                                  {statusLabels[step]}
                                </span>
                              </div>
                              {idx < statusSteps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 ${idx < currentStepIndex ? "bg-green-400" : "bg-gray-200"}`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* QR Code Section */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Delivery Docket QR</h4>
                    <p className="text-sm text-gray-500 mb-3">Download the QR code for this delivery docket. The site supervisor scans it on delivery.</p>
                    <button
                      onClick={handleDownloadQR}
                      disabled={showQR}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {showQR ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      {showQR ? "Generating..." : "View / Download QR"}
                    </button>
                  </div>

                  {/* Invoice Section */}
                  {po.status === "delivered" && (
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText size={14} /> Invoice
                      </h4>

                      {po.invoice ? (
                        <>
                          {/* Invoice submitted */}
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Total Amount</span>
                              <span className="font-bold text-[#0D1B2A]">₦{po.invoice.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Status</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                po.invoiceStatus === "submitted" ? "bg-yellow-50 text-yellow-700" :
                                po.invoiceStatus === "approved" ? "bg-blue-50 text-blue-700" :
                                "bg-emerald-50 text-emerald-700"
                              }`}>
                                {po.invoiceStatus}
                              </span>
                            </div>
                          </div>

                          {/* Invoice status timeline */}
                          {invoiceStepIndex >= 0 && (
                            <div className="flex items-center justify-between mt-4">
                              {invoiceSteps.map((step, idx) => {
                                const isCompleted = idx <= invoiceStepIndex;
                                const isCurrent = idx === invoiceStepIndex;
                                return (
                                  <React.Fragment key={step}>
                                    <div className="flex flex-col items-center gap-1.5">
                                      <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                          isCompleted
                                            ? isCurrent
                                              ? "bg-[#0D1B2A] text-white"
                                              : "bg-green-500 text-white"
                                            : "bg-gray-200 text-gray-500"
                                        }`}
                                      >
                                        {isCompleted ? <Check size={12} /> : idx + 1}
                                      </div>
                                      <span className={`text-xs font-medium ${isCurrent ? "text-[#0D1B2A]" : "text-gray-400"}`}>
                                        {invoiceLabels[step]}
                                      </span>
                                    </div>
                                    {idx < invoiceSteps.length - 1 && (
                                      <div className={`flex-1 h-0.5 mx-1 ${idx < invoiceStepIndex ? "bg-green-400" : "bg-gray-200"}`} />
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-3">
                            Submit your invoice for this delivered order
                          </p>
                          <button
                            onClick={openInvoiceForm}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                          >
                            <FileText size={16} />
                            Submit Invoice
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Package size={14} />
                      Order Items
                    </h4>
                    <div className="space-y-3">
                      {po.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                        >
                          <p className="font-bold text-[#0D1B2A] text-sm">{item.name}</p>
                          <div className="grid grid-cols-3 gap-3 mt-2 text-sm">
                            <div>
                              <span className="text-gray-400 text-xs block">Quantity</span>
                              <span className="font-bold text-[#0D1B2A]">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-xs block">Unit Price</span>
                              <span className="font-bold text-[#0D1B2A]">
                                ₦{item.unitPrice.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-xs block">Total</span>
                              <span className="font-bold text-[#0D1B2A]">
                                ₦{(item.totalPrice || item.quantity * item.unitPrice).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                        Grand Total
                      </span>
                      <span className="text-xl font-bold text-[#0D1B2A]">
                        ₦{po.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {po.notes && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Notes
                      </h4>
                      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-900 border border-blue-100">
                        {po.notes}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              {showInvoiceForm ? (
                <>
                  <button
                    onClick={() => setShowInvoiceForm(false)}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitInvoice}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                    {loading ? "Submitting..." : "Submit Invoice"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  {nextStatus && (
                    <button
                      onClick={handleStatusUpdate}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {loading ? (
                        "Updating..."
                      ) : (
                        <>
                          Mark as {statusLabels[nextStatus]}
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PODetailModal;
