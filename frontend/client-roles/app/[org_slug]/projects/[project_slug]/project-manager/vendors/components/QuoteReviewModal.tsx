"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Building2, MapPin, Clock, Check, FileText, Loader2, AlertCircle, MessageSquare, AlertTriangle } from "lucide-react";
import type { Requisition, Quote } from "@/lib/types/vendor";
import VendorRatingDisplay from "@/components/vendor-pipeline/primitives/VendorRatingDisplay";
import { MOCK_PM_VENDORS } from "@/lib/mockData/vendor";

interface QuoteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: Requisition | null;
  onQuoteAccepted: (quoteId: string, reqId: string) => void;
  onCreatePO: (quoteId: string, reqId: string) => void;
  onQuoteCountered?: (quoteId: string, reqId: string, counterData: { counterAmount: number; counterDelivery: string; counterNotes: string }) => void;
}

const QuoteReviewModal: React.FC<QuoteReviewModalProps> = ({
  isOpen,
  onClose,
  requisition,
  onQuoteAccepted,
  onCreatePO,
  onQuoteCountered,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<Quote | null>(null);
  const [rejectedQuoteId, setRejectedQuoteId] = useState<string | null>(null);
  const [counterQuoteId, setCounterQuoteId] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState(0);
  const [counterDelivery, setCounterDelivery] = useState("");
  const [counterNotes, setCounterNotes] = useState("");

  const getVendorRating = (vendorId: string) => {
    const vendor = MOCK_PM_VENDORS.find((v) => v.id === vendorId);
    return vendor ? { rating: vendor.rating ?? 0, ratingCount: vendor.ratingCount ?? 0 } : { rating: 0, ratingCount: 0 };
  };

  if (!requisition) return null;

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleAcceptQuote = async (quote: Quote) => {
    setLoading(quote.id);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(null);
    setShowConfirm(quote);
  };

  const confirmAccept = () => {
    if (!showConfirm) return;
    onQuoteAccepted(showConfirm.id, requisition.id);
    onCreatePO(showConfirm.id, requisition.id);
    setShowConfirm(null);
  };

  const handleRejectQuote = async (quoteId: string) => {
    setLoading(quoteId);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(null);
    setRejectedQuoteId(quoteId);
  };

  const handleCounter = (quote: Quote) => {
    setCounterQuoteId(quote.id);
    setCounterAmount(quote.totalAmount);
    setCounterDelivery(quote.estimatedDelivery);
    setCounterNotes("");
  };

  const handleSubmitCounter = async (quote: Quote) => {
    if (!onQuoteCountered) return;
    setLoading(quote.id);
    await new Promise((r) => setTimeout(r, 600));
    onQuoteCountered(quote.id, requisition.id, {
      counterAmount,
      counterDelivery,
      counterNotes,
    });
    setLoading(null);
    setCounterQuoteId(null);
  };

  const sortedQuotes = [...requisition.quotes]
    .filter((q) => q.status === "submitted" || q.status === "countered" || q.id === rejectedQuoteId)
    .sort((a, b) => a.totalAmount - b.totalAmount);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-[#021422]">Review RFQs</h2>
                <p className="text-sm text-gray-500 mt-0.5">{requisition.title}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Requisition summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Building2 size={14} className="text-gray-400" />
                    {requisition.projectName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package size={14} className="text-gray-400" />
                    {requisition.items.length} items
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    requisition.priority === "urgent" ? "bg-red-50 text-red-700" :
                    requisition.priority === "high" ? "bg-orange-50 text-orange-700" :
                    requisition.priority === "medium" ? "bg-blue-50 text-blue-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {requisition.priority}
                  </span>
                </div>
                {requisition.deliveryAddress && (
                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    {requisition.deliveryAddress}
                  </p>
                )}
              </div>

              {/* Quotes list */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <FileText size={14} />
                  {sortedQuotes.length} RFQ{sortedQuotes.length !== 1 ? "s" : ""} Received
                </h3>

                {sortedQuotes.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-bold text-gray-500 mb-1">No quotes yet</p>
                    <p className="text-sm text-gray-400">Vendors have 24hrs to submit their quotes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedQuotes.map((quote) => {
                      const vendorRating = getVendorRating(quote.vendorId);
                      const isCountered = quote.status === "countered";
                      const isCounterFormOpen = counterQuoteId === quote.id;

                      return (
                      <div
                        key={quote.id}
                        className={`bg-white rounded-xl border p-5 hover:border-gray-300 transition-colors ${
                          isCountered ? "border-orange-200 bg-orange-50/30" : "border-gray-200"
                        }`}
                      >
                        {/* Quote header */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-[#021422]">{quote.vendorName}</p>
                              <VendorRatingDisplay rating={vendorRating.rating} ratingCount={vendorRating.ratingCount} size="sm" />
                              {isCountered && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase">
                                  Countered
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <Clock size={12} />
                              Submitted {getTimeAgo(quote.submittedAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-[#021422]">
                              ₦{isCountered && quote.counterAmount ? quote.counterAmount.toLocaleString() : quote.totalAmount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">
                              Est. delivery: {formatDate(isCountered && quote.counterDelivery ? quote.counterDelivery : quote.estimatedDelivery)}
                            </p>
                          </div>
                        </div>

                        {/* Items summary */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                          {quote.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.quantity} {item.unit} × {item.name}
                              </span>
                              <span className="font-medium text-[#021422]">
                                ₦{(item.unitPrice * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          {quote.deliveryFee && quote.deliveryFee > 0 && (
                            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                              <span className="text-gray-500">Delivery Fee</span>
                              <span className="font-medium text-[#021422]">
                                ₦{quote.deliveryFee.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Counter notes */}
                        {isCountered && quote.counterNotes && (
                          <div className="bg-orange-50 rounded-lg p-3 mb-4 border border-orange-100">
                            <p className="text-xs font-bold text-orange-700 uppercase mb-1">Counter Notes</p>
                            <p className="text-sm text-orange-800">{quote.counterNotes}</p>
                          </div>
                        )}

                        {/* Notes */}
                        {quote.notes && !isCountered && (
                          <p className="text-sm text-gray-600 italic mb-4">&quot;{quote.notes}&quot;</p>
                        )}

                        {/* Counter form */}
                        {isCounterFormOpen ? (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200 space-y-3">
                            <p className="text-xs font-bold text-gray-500 uppercase">Counter Offer</p>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">Counter Price (₦)</label>
                              <input
                                type="number"
                                value={counterAmount}
                                onChange={(e) => setCounterAmount(Number(e.target.value))}
                                className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#021422]"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">Counter Delivery Date</label>
                              <input
                                type="datetime-local"
                                value={counterDelivery}
                                onChange={(e) => setCounterDelivery(e.target.value)}
                                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#021422]"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">Notes</label>
                              <textarea
                                value={counterNotes}
                                onChange={(e) => setCounterNotes(e.target.value)}
                                rows={2}
                                placeholder="Reason for counter..."
                                className="w-full border border-gray-200 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#021422]"
                              />
                            </div>
                          </div>
                        ) : null}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          {isCounterFormOpen ? (
                            <>
                              <button
                                onClick={() => handleSubmitCounter(quote)}
                                disabled={!!loading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-orange-700 disabled:opacity-50 transition-colors"
                              >
                                {loading === quote.id ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
                                Send Counter
                              </button>
                              <button
                                onClick={() => setCounterQuoteId(null)}
                                disabled={!!loading}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleAcceptQuote(quote)}
                                disabled={!!loading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#021422] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
                              >
                                {loading === quote.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                Accept RFQ
                              </button>
                              <button
                                onClick={() => handleCounter(quote)}
                                disabled={!!loading}
                                className="px-4 py-2.5 border border-orange-300 rounded-lg text-sm font-bold text-orange-700 hover:bg-orange-50 disabled:opacity-50 transition-colors flex items-center gap-1"
                              >
                                <MessageSquare size={14} />
                                Counter
                              </button>
                              <button
                                onClick={() => handleRejectQuote(quote.id)}
                                disabled={!!loading}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );})}
                  </div>
                )}
              </div>
            </div>

            {/* Confirm accept dialog */}
            <AnimatePresence>
              {showConfirm && (
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
                    <h3 className="text-xl font-bold text-[#021422] mb-2">Accept This RFQ?</h3>
                    <p className="text-gray-500">
                      Accept quote from <strong>{showConfirm.vendorName}</strong> for{" "}
                      <strong>₦{showConfirm.totalAmount.toLocaleString()}</strong>?
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={confirmAccept}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#021422] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                    >
                      <Check size={16} />
                      Accept & Create PO
                    </button>
                    <button
                      onClick={() => setShowConfirm(null)}
                      className="w-full px-6 py-3 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
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

export default QuoteReviewModal;
