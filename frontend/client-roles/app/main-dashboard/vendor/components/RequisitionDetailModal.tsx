"use client";

/* eslint-disable react-hooks/immutability -- the modal intentionally opens the quote form from an effect. */
/* eslint-disable react-hooks/set-state-in-effect -- recalculate derived quote totals after edits. */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Calendar, Building2, MapPin, Clock, FileText, Loader2, Upload, Image as ImageIcon, CheckCircle, XCircle, ArrowLeft, Eye } from "lucide-react";
import { calculateDistance, formatDistance, DEFAULT_VENDOR_LOCATION } from "@/lib/distance";
import toast from "react-hot-toast";
import type { Requisition, RequisitionItem } from "@/lib/types/vendor";
import { useVendorStore } from "@/store/vendorStore";

interface RequisitionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: Requisition | null;
  onSubmitQuote?: (id: string, quoteData: {
    items: RequisitionItem[];
    totalAmount: number;
    notes?: string;
    estimatedDelivery: string;
    deliveryFee?: number;
    batchCertificates?: string[];
    stockPhotos?: string[];
  }) => Promise<void>;
  role?: "vendor" | "pm";
  startInQuoteMode?: boolean;
}

  const VENDOR_ID = "vendor-1";

  const RequisitionDetailModal: React.FC<RequisitionDetailModalProps> = ({
  isOpen,
  onClose,
  requisition,
  onSubmitQuote,
  role = "vendor",
  startInQuoteMode = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [countdown, setCountdown] = useState<string>("");
  const [quoteItems, setQuoteItems] = useState<RequisitionItem[]>([]);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoteDelivery, setQuoteDelivery] = useState("");
  const [quoteSubtotal, setQuoteSubtotal] = useState(0);
  const [quoteTotal, setQuoteTotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [batchCerts, setBatchCerts] = useState<File[]>([]);
  const [stockPhotos, setStockPhotos] = useState<File[]>([]);
  const certInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const setQuoteStatus = useVendorStore((s) => s.setQuoteStatus);

  useEffect(() => {
    if (!requisition) return;
    const updateCountdown = () => {
      if (requisition.status !== "open") {
        setCountdown("");
        return;
      }
      const expiry = new Date(requisition.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;
      if (diff <= 0) {
        setCountdown("Expired");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 0) setCountdown(`${hours}h ${mins}m left`);
      else setCountdown(`${mins}m left`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [requisition]);

  useEffect(() => {
    if (isOpen && startInQuoteMode && requisition && !requisition.quotes.some((q) => q.vendorId === VENDOR_ID)) {
      handleOpenQuoteForm();
    }
  }, [isOpen, startInQuoteMode, requisition]);

  const recalcTotal = (items: RequisitionItem[], fee: number) => {
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    setQuoteSubtotal(subtotal);
    setQuoteTotal(subtotal + fee);
  };

  useEffect(() => {
    recalcTotal(quoteItems, deliveryFee);
  }, [quoteItems, deliveryFee]);

  const handleOpenQuoteForm = () => {
    setQuoteItems(requisition!.items.map((item) => ({ ...item })));
    setQuoteNotes("");
    setQuoteDelivery("");
    setDeliveryFee(0);
    setBatchCerts([]);
    setStockPhotos([]);
    setShowQuoteForm(true);
  };

  const handlePriceChange = (index: number, unitPrice: number) => {
    const updated = [...quoteItems];
    updated[index] = { ...updated[index], unitPrice, totalPrice: unitPrice * updated[index].quantity };
    setQuoteItems(updated);
  };

  const handleSubmit = async () => {
    if (!requisition || !onSubmitQuote) return;
    if (!quoteDelivery) return;
    setLoading(true);
    try {
      await onSubmitQuote(requisition.id, {
        items: quoteItems,
        totalAmount: quoteTotal,
        notes: quoteNotes || undefined,
        estimatedDelivery: quoteDelivery,
        deliveryFee: deliveryFee || undefined,
        batchCertificates: batchCerts.length > 0 ? batchCerts.map((f) => f.name) : undefined,
        stockPhotos: stockPhotos.length > 0 ? stockPhotos.map((f) => f.name) : undefined,
      });
      setShowQuoteForm(false);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (!requisition) return null;

  const distance = requisition.deliveryLatitude && requisition.deliveryLongitude
    ? calculateDistance(
        DEFAULT_VENDOR_LOCATION.latitude,
        DEFAULT_VENDOR_LOCATION.longitude,
        requisition.deliveryLatitude,
        requisition.deliveryLongitude
      )
    : null;

  const isRequisitionOpen = requisition.status === "open";
  const isExpired = requisition.status === "expired";
  const hasSubmittedQuote = requisition.quotes.some((q) => q.vendorId === VENDOR_ID);
  const myQuote = requisition.quotes.find((q) => q.vendorId === VENDOR_ID);
  const isCountered = myQuote?.status === "countered";
  const isAccepted = myQuote?.status === "accepted";
  const isRejected = myQuote?.status === "rejected";
  const baseTotal = requisition.items.reduce((sum, item) => sum + (item.totalPrice || item.quantity * item.unitPrice), 0);

  const handleCounterResponse = (action: "accepted" | "rejected") => {
    if (!requisition || !myQuote) return;
    if (action === "accepted") {
      setQuoteStatus(requisition.id, myQuote.id, "accepted");
      toast.success("Counter-offer accepted! The PM will proceed with the PO.");
    } else {
      setQuoteStatus(requisition.id, myQuote.id, "rejected");
      toast.error("Counter-offer declined");
    }
  };

  return (
    <AnimatePresence>
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
                {showQuoteForm ? "Submit RFQ" : "Order Details"}
              </h2>
              <button
                onClick={() => {
                  if (showQuoteForm) setShowQuoteForm(false);
                  else onClose();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Title + Status + Countdown */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#0D1B2A]">{requisition.title}</h3>
                  <p className="text-sm text-gray-500">{requisition.projectName || requisition.projectId}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    requisition.priority === "urgent" ? "bg-red-50 text-red-700" :
                    requisition.priority === "high" ? "bg-orange-50 text-orange-700" :
                    requisition.priority === "medium" ? "bg-blue-50 text-blue-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {requisition.priority}
                  </span>
                  <span className="text-xs font-medium uppercase text-gray-500">{requisition.status}</span>
                </div>
              </div>

              {/* Countdown Banner */}
              {isRequisitionOpen && countdown && (
                <div className={`rounded-lg p-3 flex items-center gap-2 ${isExpired ? "bg-red-50 border border-red-100" : "bg-[#0D1B2A]"}`}>
                  <Clock size={16} className={isExpired ? "text-red-600" : "text-white"} />
                  <span className={`text-sm font-bold ${isExpired ? "text-red-700" : "text-white"}`}>
                    {isExpired ? "This requisition has expired" : `Expires in ${countdown}`}
                  </span>
                </div>
              )}

              {/* Quote Form */}
              {showQuoteForm ? (
                <>
                  {/* Items with editable prices */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Package size={14} />
                      Your Pricing
                    </h4>
                    <div className="space-y-3">
                      {quoteItems.map((item, idx) => (
                        <div key={item.id || idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <p className="font-bold text-[#0D1B2A] text-sm mb-3">{item.name}</p>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-gray-400 text-xs block">Quantity</span>
                              <span className="font-bold text-[#0D1B2A]">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-xs block">Your Price</span>
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                                className="w-full border border-gray-200 rounded px-2 py-1 text-sm font-bold text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#0D1B2A]"
                              />
                            </div>
                            <div>
                              <span className="text-gray-400 text-xs block">Total</span>
                              <span className="font-bold text-[#2563EB]">
                                ₦{(item.unitPrice * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-bold text-[#0D1B2A]">₦{quoteSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Delivery Fee</span>
                        <span className="font-bold text-[#0D1B2A]">₦{deliveryFee.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">RFQ Total</span>
                        <span className="text-xl font-bold text-[#0D1B2A]">₦{quoteTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Estimated Delivery Date
                    </label>
                    <input
                      type="datetime-local"
                      value={quoteDelivery}
                      onChange={(e) => setQuoteDelivery(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      placeholder="Delivery notes, conditions, etc."
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] resize-none"
                    />
                  </div>

                  {/* Delivery Fee */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Delivery Fee
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₦</span>
                      <input
                        type="number"
                        value={deliveryFee}
                        onChange={(e) => setDeliveryFee(Number(e.target.value))}
                        placeholder="0"
                        className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm font-bold text-[#0D1B2A] focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                      />
                    </div>
                  </div>

                  {/* Batch Certificate Upload */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Batch Certificate
                    </label>
                    <input
                      ref={certInputRef}
                      type="file"
                      accept="image/*,.docx"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setBatchCerts((prev) => [...prev, ...files]);
                      }}
                      className="hidden"
                    />
                    <div className="space-y-2">
                      {batchCerts.length > 0 && (
                        <div className="space-y-1.5">
                          {batchCerts.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                              <div className="flex items-center gap-2 min-w-0">
                                {file.type.startsWith("image/") ? (
                                  <img src={URL.createObjectURL(file)} alt={file.name} className="w-8 h-8 rounded object-cover shrink-0" />
                                ) : (
                                  <FileText size={18} className="text-green-600 shrink-0" />
                                )}
                                <span className="text-sm font-medium text-green-800 truncate">{file.name}</span>
                                <span className="text-xs text-green-500 shrink-0">({(file.size / 1024).toFixed(0)} KB)</span>
                              </div>
                              <button
                                onClick={() => setBatchCerts((prev) => prev.filter((_, i) => i !== idx))}
                                className="p-1 hover:bg-green-100 rounded transition-colors shrink-0"
                              >
                                <X size={14} className="text-green-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => certInputRef.current?.click()}
                        className="w-full border-2 border-dashed rounded-lg p-4 flex items-center justify-center gap-2 transition-colors hover:border-gray-400 text-gray-500 border-gray-200"
                      >
                        <Upload size={18} />
                        <span className="text-sm">{batchCerts.length > 0 ? "Add More Files" : "Upload Batch Certificate (images or .docx)"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Stock Photos Upload */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Stock Photos
                    </label>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setStockPhotos((prev) => [...prev, ...files]);
                      }}
                      className="hidden"
                    />
                    <div className="space-y-2">
                      {stockPhotos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {stockPhotos.map((file, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-20 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                onClick={() => setStockPhotos((prev) => prev.filter((_, i) => i !== idx))}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="w-full border-2 border-dashed rounded-lg p-4 flex items-center justify-center gap-2 transition-colors hover:border-gray-400 text-gray-500 border-gray-200"
                      >
                        <ImageIcon size={18} />
                        <span className="text-sm">{stockPhotos.length > 0 ? "Add More Photos" : "Upload Stock Photos"}</span>
                      </button>
                    </div>
                  </div>

                </>
              ) : (
                <>
                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 size={16} className="text-gray-400" />
                      <span>{requisition.projectName || requisition.projectId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{new Date(requisition.createdAt).toLocaleDateString()}</span>
                    </div>
                    {distance !== null && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{formatDistance(distance)} away</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} className="text-gray-400" />
                      <span>Posted {new Date(requisition.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {requisition.deliveryAddress && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Delivery Location</p>
                      <p className="text-sm text-[#0D1B2A]">{requisition.deliveryAddress}</p>
                    </div>
                  )}

                  {/* RFQ Count (for PM view) */}
                  {role === "pm" && requisition.quotes.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <FileText size={12} />
                        {requisition.quotes.length} RFQ{requisition.quotes.length !== 1 ? "s" : ""} Submitted
                      </p>
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Package size={14} />
                      Requested Items
                    </h4>
                    <div className="space-y-3">
                      {requisition.items.map((item, idx) => (
                        <div key={item.id || idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <p className="font-bold text-[#0D1B2A] text-sm">{item.name}</p>
                          <div className="grid grid-cols-3 gap-3 mt-2 text-sm">
                            <div>
                              <span className="text-gray-400 text-xs block">Quantity</span>
                              <span className="font-bold text-[#0D1B2A]">{item.quantity} {item.unit}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-xs block">Unit Price</span>
                              <span className="font-bold text-[#0D1B2A]">₦{item.unitPrice.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-xs block">Total</span>
                              <span className="font-bold text-[#2563EB]">₦{(item.totalPrice || item.quantity * item.unitPrice).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Order Total</span>
                      <span className="text-xl font-bold text-[#0D1B2A]">₦{baseTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {requisition.notes && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Notes from PM</h4>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 border border-gray-100">
                        {requisition.notes}
                      </div>
                    </div>
                  )}

                  {/* PM Attachments */}
                  {requisition.attachments && requisition.attachments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Attachments from PM</h4>
                      <div className="space-y-2">
                        {requisition.attachments.map((att, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              {att.type === "image" ? (
                                <img src={att.url} alt={att.name} className="w-10 h-10 rounded object-cover shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center shrink-0">
                                  <FileText size={18} className="text-blue-600" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate">{att.name}</p>
                                <p className="text-xs text-gray-400 uppercase">{att.type}</p>
                              </div>
                            </div>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-gray-200 rounded transition-colors shrink-0"
                            >
                              <Eye size={14} className="text-gray-500" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quote Status Section */}
                  {role === "vendor" && hasSubmittedQuote && (
                    <>
                      {isCountered && myQuote ? (
                        <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock size={18} className="text-[#D97706]" />
                            <h4 className="text-sm font-bold text-[#0D1B2A]">Counter Offer from PM</h4>
                          </div>
                          <div className="space-y-2 mb-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Your Price:</span>
                              <span className="font-bold text-[#0D1B2A]">₦{myQuote.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Counter Amount:</span>
                              <span className="font-bold text-[#D97706]">₦{myQuote.counterAmount?.toLocaleString()}</span>
                            </div>
                            {myQuote.counterDelivery && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Counter Delivery:</span>
                                <span className="font-bold text-[#0D1B2A]">{new Date(myQuote.counterDelivery).toLocaleDateString()}</span>
                              </div>
                            )}
                            {myQuote.counterNotes && (
                              <div className="bg-white rounded-lg p-3 mt-2 text-gray-600 text-sm border border-amber-100">
                                &ldquo;{myQuote.counterNotes}&rdquo;
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCounterResponse("rejected")}
                              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-red-200 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <XCircle size={16} /> Decline
                            </button>
                            <button
                              onClick={handleOpenQuoteForm}
                              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <ArrowLeft size={16} /> Counter
                            </button>
                            <button
                              onClick={() => handleCounterResponse("accepted")}
                              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#16A34A] text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle size={16} /> Accept
                            </button>
                          </div>
                        </div>
                      ) : isAccepted ? (
                        <div className="bg-[#DCFCE7] rounded-xl p-5 border border-[#16A34A]/30">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={20} className="text-[#16A34A]" />
                            <h4 className="text-sm font-bold text-[#0D1B2A]">Quote Accepted</h4>
                          </div>
                          <p className="text-sm text-gray-600">Your quote was accepted. The PM will create a purchase order shortly.</p>
                        </div>
                      ) : isRejected ? (
                        <div className="bg-[#FEE2E2] rounded-xl p-5 border border-[#DC2626]/30">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle size={20} className="text-[#DC2626]" />
                            <h4 className="text-sm font-bold text-[#0D1B2A]">Quote Declined</h4>
                          </div>
                          <p className="text-sm text-gray-600">Your quote was not selected. Keep an eye out for new requisitions.</p>
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-xl p-5 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText size={18} className="text-[#2563EB]" />
                            <h4 className="text-sm font-bold text-[#0D1B2A]">RFQ Submitted</h4>
                          </div>
                          <p className="text-sm text-gray-600">Your RFQ is under review. The PM will respond soon.</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              {showQuoteForm ? (
                <>
                  <button
                    onClick={() => setShowQuoteForm(false)}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !quoteDelivery}
                    className="flex items-center gap-2 px-8 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                    {loading ? "Submitting..." : "Submit RFQ"}
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
                  {role === "vendor" && isRequisitionOpen && !isExpired && !hasSubmittedQuote && onSubmitQuote && (
                    <button
                      onClick={handleOpenQuoteForm}
                      className="flex items-center gap-2 px-8 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                    >
                      Submit RFQ
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
    </AnimatePresence>
  );
};

export default RequisitionDetailModal;
