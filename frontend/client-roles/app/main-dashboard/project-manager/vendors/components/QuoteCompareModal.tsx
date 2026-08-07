"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Building2, MapPin, Check, Loader2, TrendingDown, Clock, Star, Timer } from "lucide-react";
import type { Requisition, MerchantResponse } from "@/lib/types/vendor";
import { MOCK_PM_VENDORS } from "@/lib/mockData/vendor";
import toast from "react-hot-toast";

interface QuoteCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: Requisition | null;
  merchantResponses: MerchantResponse[];
  onAcceptQuote?: (reqId: string, vendorId: string) => void;
}

const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const renderStars = (rating: number) => {
  let s = "";
  for (let i = 0; i < Math.floor(rating); i++) s += "\u2605";
  if (rating % 1 >= 0.5) s += "\u00BD";
  for (let i = 0; i < 5 - Math.ceil(rating); i++) s += "\u2606";
  return s;
};

const QuoteCompareModal: React.FC<QuoteCompareModalProps> = ({
  isOpen,
  onClose,
  requisition,
  merchantResponses,
  onAcceptQuote,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<MerchantResponse | null>(null);

  const sorted = useMemo(
    () => [...merchantResponses].sort((a, b) => a.totalAmount - b.totalAmount),
    [merchantResponses]
  );
  const lowestPrice = sorted.length > 0 ? sorted[0].totalAmount : 0;
  const earliestDelivery = useMemo(() => {
    if (sorted.length === 0) return "";
    return sorted.reduce((earliest, mr) =>
      new Date(mr.estimatedDelivery) < new Date(earliest.estimatedDelivery) ? mr : earliest
    ).estimatedDelivery;
  }, [sorted]);

  if (!requisition) return null;

  const getVendorRating = (vendorId: string) => {
    const vendor = MOCK_PM_VENDORS.find((v) => v.id === vendorId);
    return vendor?.rating ?? 0;
  };

  const handleAcceptClick = (mr: MerchantResponse) => {
    setConfirming(mr);
  };

  const handleConfirm = async () => {
    if (!confirming || !onAcceptQuote) return;
    setLoadingId(confirming.id);
    await new Promise((r) => setTimeout(r, 600));
    onAcceptQuote(requisition.id, confirming.vendorId);
    setLoadingId(null);
    setConfirming(null);
    onClose();
    toast.success(`Quote from ${confirming.vendorName} accepted. Purchase order created.`);
  };

  const handleReject = (mr: MerchantResponse) => {
    toast.success(`Quote from ${mr.vendorName} declined`);
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
            className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-[#021422]">Compare Quotes</h2>
                <p className="text-sm text-gray-500 mt-0.5">{requisition.title}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Requisition summary */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-gray-400" />
                    {requisition.projectName}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    {requisition.deliveryAddress}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                    requisition.priority === "urgent" ? "bg-red-100 text-red-700" :
                    requisition.priority === "high" ? "bg-orange-100 text-orange-700" :
                    requisition.priority === "medium" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {requisition.priority}
                  </span>
                  <span className="text-sm font-bold text-[#021422]">
                    {requisition.items.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                </div>
              </div>

              {/* Items requested */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Package size={14} /> Items Requested
                </h3>
                <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100/50">
                      <tr>
                        <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">Item</th>
                        <th className="text-right py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">Qty</th>
                        <th className="text-right py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">Est. Unit</th>
                        <th className="text-right py-2.5 px-4 text-xs font-bold text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requisition.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-0">
                          <td className="py-2.5 px-4 text-gray-700">{item.name}</td>
                          <td className="py-2.5 px-4 text-right text-gray-700">{item.quantity} {item.unit}</td>
                          <td className="py-2.5 px-4 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2.5 px-4 text-right font-medium text-[#021422]">{formatCurrency(item.unitPrice * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Comparison table */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Check size={14} /> {sorted.length} Quote{sorted.length !== 1 ? "s" : ""} Received
                </h3>

                {sorted.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                    <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-bold text-gray-500">No quotes yet</p>
                    <p className="text-sm text-gray-400">Vendors have 24hrs to submit their quotes</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Rank</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Vendor</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Quote</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Delivery</th>
                            <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">On-Time</th>
                            <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Quality</th>
                            <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Response</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sorted.map((mr, idx) => {
                            const isLowestPrice = mr.totalAmount === lowestPrice;
                            const isEarliest = mr.estimatedDelivery === earliestDelivery;
                            const vendorRating = getVendorRating(mr.vendorId);

                            return (
                              <tr key={mr.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-4">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#021422] text-white text-xs font-bold">
                                    {idx + 1}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <div>
                                    <p className="font-bold text-[#021422]">{mr.vendorName}</p>
                                    <p className="text-xs text-amber-500">{renderStars(mr.merchantRating)} {mr.merchantRating.toFixed(1)}</p>
                                    {vendorRating > 0 && (
                                      <p className="text-xs text-gray-400">Vendor rating {vendorRating.toFixed(1)}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="flex flex-col items-end">
                                    <span className="font-bold text-[#021422]">{formatCurrency(mr.totalAmount)}</span>
                                    {isLowestPrice && (
                                      <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                                        <TrendingDown size={12} /> Lowest
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex flex-col">
                                    <span className="text-gray-700">{formatDate(mr.estimatedDelivery)}</span>
                                    {isEarliest && (
                                      <span className="flex items-center gap-1 text-xs font-bold text-blue-600">
                                        <Timer size={12} /> Earliest
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className={`font-bold ${mr.onTimePct >= 95 ? "text-green-600" : mr.onTimePct >= 90 ? "text-amber-600" : "text-red-600"}`}>
                                    {mr.onTimePct}%
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-center text-amber-500 font-bold">
                                  {mr.qualityRating.toFixed(1)} <Star size={12} className="inline -mt-0.5" />
                                </td>
                                <td className="py-4 px-4 text-center text-gray-500 text-xs">
                                  {mr.avgResponseMin}m
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleAcceptClick(mr)}
                                      disabled={loadingId === mr.id}
                                      className="px-3 py-1.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                    >
                                      {loadingId === mr.id ? <Loader2 size={14} className="animate-spin" /> : "Accept"}
                                    </button>
                                    <button
                                      onClick={() => handleReject(mr)}
                                      className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm accept overlay */}
            <AnimatePresence>
              {confirming && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white flex flex-col justify-center px-8"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#021422] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#021422] mb-2">Accept This Quote?</h3>
                    <p className="text-gray-500">
                      Accept quote from <strong>{confirming.vendorName}</strong> for{" "}
                      <strong>{formatCurrency(confirming.totalAmount)}</strong>?
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      This will create a purchase order and close the requisition.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleConfirm}
                      disabled={!!loadingId}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#021422] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {loadingId ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      {loadingId ? "Processing..." : "Confirm Accept"}
                    </button>
                    <button
                      onClick={() => setConfirming(null)}
                      disabled={!!loadingId}
                      className="w-full px-6 py-3 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Go Back
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuoteCompareModal;
