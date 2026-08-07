"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { X, Truck, Phone, MessageSquare, MapPin, Clock, Check, Navigation, Loader2, Download, Package } from "lucide-react";
import type { PurchaseOrder } from "@/lib/types/vendor";
import { useVendorStore } from "@/store/vendorStore";
import StatusPill from "./StatusPill";
import toast from "react-hot-toast";

interface DeliveryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder | null;
  onMarkArrived?: (poId: string) => void;
  onUpdateStatus?: (poId: string, status: string) => void;
}

const DELIVERY_FLOW: { label: string; key: string }[] = [
  { label: "Loading", key: "loading" },
  { label: "Dispatched", key: "dispatched" },
  { label: "In Transit", key: "in_transit" },
  { label: "Arrived", key: "arrived" },
  { label: "Awaiting Confirmation", key: "awaiting_confirmation" },
  { label: "Delivered", key: "delivered" },
];

const DeliveryDetailModal: React.FC<DeliveryDetailModalProps> = ({
  isOpen,
  onClose,
  purchaseOrder,
  onMarkArrived,
  onUpdateStatus,
}) => {
  const [loading, setLoading] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [timestamps, setTimestamps] = useState<Record<string, string>>({});
  const qrRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const generateDeliveryQR = useVendorStore((s) => s.generateDeliveryQR);

  if (!purchaseOrder) return null;

  const currentStatus = purchaseOrder.deliveryStatus || "loading";
  const poStatus = purchaseOrder.status;
  const currentIndex = DELIVERY_FLOW.findIndex(
    (s) =>
      s.key === currentStatus ||
      (s.key === "delivered" && poStatus === "delivered")
  );
  const isDelivered = poStatus === "delivered";

  const getStepStatus = (index: number): "done" | "active" | "pending" => {
    if (isDelivered) return "done";
    if (index < currentIndex) return "done";
    if (index === currentIndex) return "active";
    return "pending";
  };

  const advanceStatus = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const now = new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });

    const nextIndex = currentIndex + 1;
    const nextKey = DELIVERY_FLOW[nextIndex]?.key;

    if (nextKey === "awaiting_confirmation") {
      onMarkArrived?.(purchaseOrder.id);
      setTimestamps((prev) => ({ ...prev, arrived: now }));
    } else if (nextKey === "delivered") {
      onUpdateStatus?.(purchaseOrder.id, "delivered");
      setTimestamps((prev) => ({ ...prev, delivered: now }));
    } else if (nextKey) {
      setTimestamps((prev) => ({ ...prev, [nextKey]: now }));
      onUpdateStatus?.(purchaseOrder.id, nextKey);
    }
    setLoading(false);
  };

  const handleCall = () => {
    if (purchaseOrder.driverPhone) window.open(`tel:${purchaseOrder.driverPhone}`, "_self");
  };

  const handleMessage = () => {
    onClose();
    router.push(`/main-dashboard/vendor/deliveries/${purchaseOrder.id}/chat`);
  };

  const handleDownloadQR = () => {
    setGeneratingQR(true);
    if (!purchaseOrder.qrToken) {
      generateDeliveryQR(purchaseOrder.id);
    }
    setTimeout(() => {
      const canvas = qrRef.current;
      if (canvas) {
        const link = document.createElement("a");
        link.download = `QR-${purchaseOrder.poNumber}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
      setGeneratingQR(false);
    }, 300);
  };

  const getNextActionLabel = (): string => {
    if (isDelivered) return "";
    const nextIdx = currentIndex + 1;
    if (nextIdx < DELIVERY_FLOW.length) {
      return `Mark as ${DELIVERY_FLOW[nextIdx].label}`;
    }
    return "";
  };

  const nextLabel = getNextActionLabel();

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
              <div>
                <h2 className="text-xl font-bold text-[#0D1B2A]">Delivery Tracking</h2>
                <p className="text-sm text-gray-500 mt-0.5">{purchaseOrder.poNumber}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Mock Map */}
              <div className="rounded-xl overflow-hidden border border-gray-200 h-48 bg-gradient-to-br from-[#0D1B2A] to-gray-700 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/80">
                    <Navigation size={32} className="mx-auto mb-2" />
                    <p className="text-sm font-medium">Live Tracking Map</p>
                    <p className="text-xs text-white/60 mt-1">{purchaseOrder.deliveryAddress || "Delivery location"}</p>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-white/10 backdrop-blur rounded-lg px-3 py-1.5">
                  <p className="text-white text-xs font-medium">ETA: ~45 min</p>
                </div>
              </div>

              {/* Status Flow Control */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Delivery Progress</h3>
                <div className="space-y-1">
                  {DELIVERY_FLOW.map((step, idx) => {
                    const s = getStepStatus(idx);
                    const ts = timestamps[step.key];
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              s === "done"
                                ? "bg-[#16A34A] text-white"
                                : s === "active"
                                ? "bg-[#0D1B2A] text-white ring-4 ring-gray-200"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {s === "done" ? <Check size={16} /> : s === "active" ? <Truck size={14} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                          </div>
                          {idx < DELIVERY_FLOW.length - 1 && (
                            <div className={`w-0.5 h-7 ${s === "done" ? "bg-[#16A34A]" : "bg-gray-200"}`} />
                          )}
                        </div>
                        <div className={`flex-1 py-1.5 ${s === "pending" ? "text-gray-400" : "text-[#0D1B2A]"}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold">{step.label}</p>
                              {s === "active" && !isDelivered && (
                                <p className="text-xs text-[#2563EB] font-medium">Current</p>
                              )}
                            </div>
                            {ts && <span className="text-xs text-gray-400 font-medium">{ts}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Delivery Docket QR</h3>
                {purchaseOrder.qrToken ? (
                  <>
                    <div className="bg-white rounded-lg p-4 flex justify-center mb-3">
                      <QRCodeCanvas
                        ref={qrRef}
                        value={`po://${purchaseOrder.id}?token=${purchaseOrder.qrToken}`}
                        size={220}
                        level="M"
                        includeMargin
                      />
                    </div>
                    <button
                      onClick={handleDownloadQR}
                      disabled={generatingQR}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {generatingQR ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      {generatingQR ? "Preparing..." : "Download QR Code"}
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Project members scan this on site to confirm delivery.
                    </p>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      generateDeliveryQR(purchaseOrder.id);
                      toast.success("Delivery QR generated");
                    }}
                    disabled={generatingQR}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {generatingQR ? <Loader2 size={16} className="animate-spin" /> : "Generate QR Code"}
                  </button>
                )}
              </div>

              {/* Driver Info */}
              {purchaseOrder.driverName && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Driver Information</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#0D1B2A] flex items-center justify-center text-white font-bold text-lg">
                      {purchaseOrder.driverName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#0D1B2A]">{purchaseOrder.driverName}</p>
                      <p className="text-sm text-gray-500">{purchaseOrder.vehiclePlate}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCall}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
                    >
                      <Phone size={16} /> Call Driver
                    </button>
                    <button
                      onClick={handleMessage}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <MessageSquare size={16} /> Message
                    </button>
                  </div>
                  {purchaseOrder.driverPhone && (
                    <p className="text-xs text-gray-400 mt-2 text-center">{purchaseOrder.driverPhone}</p>
                  )}
                </div>
              )}

              {/* Delivery Details */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Delivery Details</h3>
                <div className="space-y-3">
                  {purchaseOrder.deliveryAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[#0D1B2A]">Delivery Address</p>
                        <p className="text-sm text-gray-500">{purchaseOrder.deliveryAddress}</p>
                      </div>
                    </div>
                  )}
                  {purchaseOrder.deliveryDate && (
                    <div className="flex items-start gap-2">
                      <Clock size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[#0D1B2A]">Scheduled Delivery</p>
                        <p className="text-sm text-gray-500">
                          {new Date(purchaseOrder.deliveryDate).toLocaleDateString("en-NG", {
                            weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Package size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#0D1B2A]">Order Items</p>
                      <p className="text-sm text-gray-500">{purchaseOrder.items.length} item{purchaseOrder.items.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Truck size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#0D1B2A]">Escrow</p>
                      <StatusPill
                        label={purchaseOrder.escrowStatus === "released" ? "Released" : "Held"}
                        variant={purchaseOrder.escrowStatus === "released" ? "success" : "warning"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 space-y-2">
              {isDelivered ? (
                <div className="text-center py-3 text-[#16A34A] font-bold text-sm flex items-center justify-center gap-2">
                  <Check size={16} /> Delivery Completed
                </div>
              ) : currentStatus === "arrived" ? (
                <div className="text-center py-3 text-amber-600 font-bold text-sm">
                  Awaiting QR scan by project member on site
                </div>
              ) : nextLabel ? (
                <button
                  onClick={advanceStatus}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Truck size={16} />}
                  {loading ? "Updating..." : nextLabel}
                </button>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeliveryDetailModal;
