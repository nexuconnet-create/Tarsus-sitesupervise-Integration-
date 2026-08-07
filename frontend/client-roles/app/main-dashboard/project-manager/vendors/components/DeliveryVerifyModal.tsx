"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertTriangle, Loader2, Camera, Truck, MapPin } from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { useAuthStore } from "@/lib/stores/authStore";
import type { PurchaseOrder } from "@/lib/types/vendor";
import QrScanner from "./QrScanner";
import StatusPill from "@/app/main-dashboard/vendor/components/StatusPill";
import toast from "react-hot-toast";

interface DeliveryVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const parseQrPayload = (text: string) => {
  if (text.startsWith("po://")) {
    const [poId, query] = text.replace("po://", "").split("?");
    const params = new URLSearchParams(query || "");
    return { poId, token: params.get("token") || "" };
  }
  // Fallback: treat the whole text as a PO id
  return { poId: text.trim(), token: "" };
};

const DeliveryVerifyModal: React.FC<DeliveryVerifyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const purchaseOrders = useVendorStore((s) => s.purchaseOrders);
  const scanDeliveryQR = useVendorStore((s) => s.scanDeliveryQR);
  const reportDeliveryIssue = useVendorStore((s) => s.reportDeliveryIssue);
  const user = useAuthStore((s) => s.user);

  const [scannedPo, setScannedPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [issueReason, setIssueReason] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [manualCode, setManualCode] = useState("");

  const reset = () => {
    setScannedPo(null);
    setLoading(false);
    setReportOpen(false);
    setIssueReason("");
    setIssueDescription("");
    setManualCode("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleScan = (text: string) => {
    const { poId } = parseQrPayload(text);
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) {
      toast.error("Purchase order not found");
      return;
    }
    if (po.status === "delivered" || po.deliveryStatus === "delivered") {
      toast.error("This delivery has already been confirmed");
      return;
    }
    setScannedPo(po);
  };

  const handleManualLookup = () => {
    if (!manualCode.trim()) return;
    handleScan(manualCode.trim());
  };

  const handleConfirm = async () => {
    if (!scannedPo) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    scanDeliveryQR(scannedPo.id, {
      userId: user?.uuid || user?.email || "unknown",
      name: user?.name || user?.fullname || user?.username || "Project Member",
      role: user?.role_name || user?.role || "project_member",
    });
    setLoading(false);
    toast.success("Delivery confirmed. Escrow released automatically.");
    handleClose();
  };

  const handleReportIssue = async () => {
    if (!scannedPo || !issueReason) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    reportDeliveryIssue(scannedPo.id, {
      reason: issueReason,
      description: issueDescription,
      reportedBy: user?.name || user?.fullname || user?.username || "Project Member",
    });
    setLoading(false);
    toast.success("Issue reported. Escrow release paused pending review.");
    handleClose();
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-[#0D1B2A]">Verify Delivery</h2>
                <p className="text-sm text-gray-500 mt-0.5">Scan the vendor QR code on site</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {!scannedPo ? (
                <>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Camera size={14} /> Camera Scan
                    </h3>
                    <QrScanner onScan={handleScan} onError={(msg) => toast.error(msg)} />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-400 font-bold">Or enter code</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="e.g. po://po-6?token=..."
                      className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                    />
                    <button
                      onClick={handleManualLookup}
                      disabled={!manualCode.trim()}
                      className="px-4 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      Look up
                    </button>
                  </div>
                </>
              ) : reportOpen ? (
                <div className="space-y-5">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                      <AlertTriangle size={16} /> Report Delivery Issue
                    </h3>
                    <p className="text-xs text-amber-700 mt-1">{scannedPo.poNumber}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                    <select
                      value={issueReason}
                      onChange={(e) => setIssueReason(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                    >
                      <option value="">Select an issue...</option>
                      <option value="Wrong quantity">Wrong quantity</option>
                      <option value="Damaged materials">Damaged materials</option>
                      <option value="Wrong material">Wrong material</option>
                      <option value="Quality concern">Quality concern</option>
                      <option value="Late delivery">Late delivery</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] resize-none"
                      placeholder="Describe the issue..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setReportOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleReportIssue}
                      disabled={!issueReason || loading}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Submit Issue"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0D1B2A]">QR Code Matched</h3>
                    <p className="text-sm text-gray-500">Review the delivery details before confirming.</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase">PO Number</span>
                      <span className="font-bold text-[#0D1B2A]">{scannedPo.poNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase">Vendor</span>
                      <span className="font-medium text-gray-700">{scannedPo.vendorName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase">Total</span>
                      <span className="font-bold text-[#0D1B2A]">{formatCurrency(scannedPo.totalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase">Items</span>
                      <span className="text-sm text-gray-600">{scannedPo.items.length} item{scannedPo.items.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      {scannedPo.deliveryAddress || "—"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck size={14} className="text-gray-400" />
                      {scannedPo.driverName || "—"} {scannedPo.vehiclePlate ? `• ${scannedPo.vehiclePlate}` : ""}
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <StatusPill
                        label={scannedPo.deliveryStatus?.replace("_", " ") || "Pending"}
                        variant={scannedPo.deliveryStatus === "arrived" ? "warning" : "info"}
                      />
                    </div>
                  </div>

                  {scannedPo.deliveryIssue && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-sm font-bold text-red-700">Previous issue reported</p>
                      <p className="text-xs text-red-600 mt-1">{scannedPo.deliveryIssue.reason}</p>
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleConfirm}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      {loading ? "Confirming..." : "Confirm Delivery"}
                    </button>
                    <button
                      onClick={() => setReportOpen(true)}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      <AlertTriangle size={16} /> Report Issue
                    </button>
                    <button
                      onClick={reset}
                      disabled={loading}
                      className="w-full px-6 py-3 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Scan Another
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeliveryVerifyModal;
