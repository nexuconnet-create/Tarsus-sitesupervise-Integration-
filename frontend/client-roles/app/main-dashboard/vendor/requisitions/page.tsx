"use client";

/* eslint-disable react-hooks/set-state-in-effect -- subscribe to the external vendor store on mount. */
/* eslint-disable react-hooks/refs -- keep a latest-value ref for the interval callback. */

import React, { useState, useEffect, useRef } from "react";
import {
  Eye,
  MapPin,
  Clock,
  Package,
  FileText,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { MOCK_REQUISITIONS } from "@/lib/mockData/vendor";
import { calculateDistance, formatDistance, DEFAULT_VENDOR_LOCATION } from "@/lib/distance";
import RequisitionDetailModal from "../components/RequisitionDetailModal";
import StatusPill from "../components/StatusPill";
import type { Requisition, RequisitionItem, RequisitionStatus, RequisitionPriority, RequisitionType, Quote } from "@/lib/types/vendor";
import { useVendorStore } from "@/store/vendorStore";

const VENDOR_ID = "vendor-1";

type FilterValue = RequisitionStatus | "all" | "quoted" | "direct";

const filterTabs: { label: string; value: FilterValue }[] = [
  { label: "Live Feed", value: "open" },
  { label: "Direct Orders", value: "direct" },
  { label: "RFQs", value: "quoted" },
  { label: "Closed", value: "closed" },
  { label: "Expired", value: "expired" },
  { label: "All", value: "all" },
];

export default function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const addQuote = React.useRef<((id: string, q: Quote) => void) | null>(null);
  const setRequisitionStatusRef = React.useRef<((id: string, status: RequisitionStatus) => void) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("open");
  const [priorityFilter, setPriorityFilter] = useState<RequisitionPriority | "all">("all");
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [startInQuoteMode, setStartInQuoteMode] = useState(false);

  useEffect(() => {
    setRequisitions(useVendorStore.getState().requisitions);
    addQuote.current = useVendorStore.getState().addQuote;
    setRequisitionStatusRef.current = useVendorStore.getState().setRequisitionStatus;
    const unsub = useVendorStore.subscribe((state) => {
      setRequisitions([...state.requisitions]);
    });
    return unsub;
  }, []);

  const requisitionsRef = React.useRef(requisitions);
  requisitionsRef.current = requisitions;

  useEffect(() => {
    const interval = setInterval(() => {
      const reqs = requisitionsRef.current;
      if (setRequisitionStatusRef.current) {
        reqs.forEach((r) => {
          if (r.status === "open" && new Date(r.expiresAt) < new Date()) {
            setRequisitionStatusRef.current!(r.id, "expired");
          }
        });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const filtered = requisitions.filter((r) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "quoted") {
      return r.quotes.some((q) => q.vendorId === VENDOR_ID);
    }
    if (activeFilter === "direct") {
      return r.type === "direct" && r.status === "open";
    }
    return r.status === activeFilter;
  }).filter((r) => {
    if (priorityFilter === "all") return true;
    return r.priority === priorityFilter;
  });

  const handleSubmitQuote = async (id: string, quoteData: {
    items: RequisitionItem[];
    totalAmount: number;
    notes?: string;
    estimatedDelivery: string;
    deliveryFee?: number;
    batchCertificates?: string[];
    stockPhotos?: string[];
  }) => {
    const req = requisitions.find((r) => r.id === id);
    if (!req || req.status !== "open") {
      toast.error("This requisition is no longer available");
      return;
    }
    if (new Date(req.expiresAt) < new Date()) {
      toast.error("This requisition has expired");
      return;
    }
    if (req.quotes.some((q) => q.vendorId === VENDOR_ID)) {
      toast.error("You have already submitted an RFQ for this requisition");
      return;
    }

    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      requisitionId: id,
      vendorId: VENDOR_ID,
      vendorName: "ABC Cement Supplies",
      items: quoteData.items,
      totalAmount: quoteData.totalAmount,
      deliveryFee: quoteData.deliveryFee || 0,
      notes: quoteData.notes,
      estimatedDelivery: quoteData.estimatedDelivery,
      batchCertificates: quoteData.batchCertificates,
      stockPhotos: quoteData.stockPhotos,
      submittedAt: new Date().toISOString(),
      status: "submitted",
    };

    addQuote.current?.(id, newQuote);
    const fileMsg = [
      quoteData.batchCertificates?.length ? `${quoteData.batchCertificates.length} certificate(s)` : "",
      quoteData.stockPhotos?.length ? `${quoteData.stockPhotos.length} photo(s)` : "",
    ].filter(Boolean).join(", ");
    toast.success(`RFQ submitted successfully!${fileMsg ? ` (${fileMsg} attached)` : ""}`);
    setModalOpen(false);

    /* â”€â”€ API version (uncomment when backend is ready) â”€â”€
    try {
      await vendorService.submitQuote(id, quoteData);
      toast.success("RFQ submitted successfully!");
      const res = await vendorService.getRequisitions();
      setRequisitions(res.data || []);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to submit RFQ");
    }
    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  };

  const handleAccept = (id: string) => {
    setRequisitionStatusRef.current?.(id, "accepted");
    toast.success("Order accepted!");
  };

  const handleDecline = (id: string) => {
    setRequisitionStatusRef.current?.(id, "declined");
    toast.success("Order declined");
  };

  const getResponseCountdown = (hours: number, seed?: string) => {
    const minute = seed ? (seed.charCodeAt(seed.length - 1) % 60) : 0;
    return `${hours}h ${minute}m left`;
  };

  const getDistance = (req: Requisition) => {
    if (!req.deliveryLatitude || !req.deliveryLongitude) return null;
    return calculateDistance(
      DEFAULT_VENDOR_LOCATION.latitude,
      DEFAULT_VENDOR_LOCATION.longitude,
      req.deliveryLatitude,
      req.deliveryLongitude
    );
  };

  const getTimeOpen = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diff = now - created;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getExpiryCountdown = (expiresAt: string) => {
    const expiry = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  const hasSubmittedQuote = (req: Requisition) => {
    return req.quotes.some((q) => q.vendorId === VENDOR_ID);
  };

  const getMyQuoteStatus = (req: Requisition): { label: string; variant: "success" | "danger" | "warning" | "info" | "default" } | null => {
    const quote = req.quotes.find((q) => q.vendorId === VENDOR_ID);
    if (!quote) return null;
    switch (quote.status) {
      case "accepted": return { label: "Accepted", variant: "success" };
      case "rejected": return { label: "Rejected", variant: "danger" };
      case "countered": return { label: "Countered", variant: "warning" };
      default: return { label: "Submitted", variant: "info" };
    }
  };

  const priorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: "text-gray-400",
      medium: "text-gray-500",
      high: "text-gray-700",
      urgent: "text-[#0D1B2A] font-bold",
    };
    return (
      <span className={`text-xs uppercase ${styles[priority] || "text-gray-400"}`}>
        {priority}
      </span>
    );
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: "text-gray-500",
      expired: "text-gray-400",
      closed: "text-gray-400",
    };
    return (
      <span className={`text-xs font-medium uppercase ${styles[status] || "text-gray-400"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="pb-24">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="text-2xl font-bold text-[#0D1B2A]">Order Feed</div>
        <div className="text-sm text-gray-500 font-medium">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                  activeFilter === tab.value
                    ? "bg-[#0D1B2A] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as RequisitionPriority | "all")}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] min-w-[140px]"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-5 bg-gray-200 rounded w-48" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-100 rounded w-24" />
                  <div className="h-4 bg-gray-100 rounded w-32" />
                  <div className="h-4 bg-gray-100 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <AlertTriangle size={48} className="mx-auto mb-3 text-red-300" />
            <p className="font-bold text-gray-500 mb-1">Failed to load requisitions</p>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => { setError(null); setLoading(true); setTimeout(() => setLoading(false), 800); }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((req, idx) => {
              const distance = getDistance(req);
              const isOpen = req.status === "open";
              const isExpired = req.status === "expired";
              const submitted = hasSubmittedQuote(req);
              const countdown = isOpen ? getExpiryCountdown(req.expiresAt) : null;
              const isAcceptedOrDeclined = req.status === "accepted" || req.status === "declined";
              const isDirect = req.type === "direct";

              if (isDirect && isOpen) {
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-red-50 text-red-700">
                                Urgent
                              </span>
                              <p className="text-xs text-gray-400 font-mono">ORDER #{req.id.toUpperCase()}</p>
                            </div>
                            <h3 className="font-bold text-[#0D1B2A]">{req.title}</h3>
                            <p className="text-sm text-gray-500">{req.projectName || req.projectId}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
                          <span className="flex items-center gap-1">
                            <Package size={14} className="text-gray-400" />
                            {req.items.length} item{req.items.length !== 1 ? "s" : ""}
                          </span>
                          {distance !== null && (
                            <span className="flex items-center gap-1">
                              <MapPin size={14} className="text-gray-400" />
                              {formatDistance(distance)}
                            </span>
                          )}
                          {req.deliveryAddress && (
                            <span className="flex items-center gap-1">
                              <MapPin size={14} className="text-gray-400" />
                              <span className="truncate max-w-[200px]">{req.deliveryAddress}</span>
                            </span>
                          )}
                          {countdown && (
                            <span className="flex items-center gap-1 font-medium text-red-600">
                              <Clock size={14} />
                              {countdown}
                            </span>
                          )}
                          {req.responseTimeHours && (
                            <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                              <Clock size={12} />
                              {getResponseCountdown(req.responseTimeHours, req.id)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedRequisition(req);
                            setModalOpen(true);
                          }}
                          className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleAccept(req.id)}
                          className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(req.id)}
                          className="px-6 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              if (isDirect && isAcceptedOrDeclined) {
                return null;
              }

              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-[#0D1B2A]">{req.title}</h3>
                          <p className="text-sm text-gray-500">{req.projectName || req.projectId}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {priorityBadge(req.priority)}
                          <span className="text-gray-300">|</span>
                          {statusBadge(req.status)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Package size={14} className="text-gray-400" />
                          {req.items.length} item{req.items.length !== 1 ? "s" : ""}
                        </span>
                        {distance !== null && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-400" />
                            {formatDistance(distance)}
                          </span>
                        )}
                        {req.deliveryAddress && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="truncate max-w-[200px]">{req.deliveryAddress}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={14} className="text-gray-400" />
                          {getTimeOpen(req.createdAt)}
                        </span>
                        {countdown && (
                          <span className={`flex items-center gap-1 font-medium ${isExpired ? "text-red-500" : "text-[#0D1B2A]"}`}>
                            <Clock size={14} />
                            {countdown}
                          </span>
                        )}
                        {req.quotes.length > 0 && (
                          <span className="flex items-center gap-1 text-gray-500">
                            <FileText size={14} className="text-gray-400" />
                            {req.quotes.length} RFQ{req.quotes.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {submitted && (() => {
                        const qs = getMyQuoteStatus(req);
                        return qs ? <StatusPill label={qs.label} variant={qs.variant} /> : null;
                      })()}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedRequisition(req);
                          setModalOpen(true);
                        }}
                        className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} className="text-gray-600" />
                      </button>

                      {isOpen && !submitted && (
                        <button
                          onClick={() => {
                            setSelectedRequisition(req);
                            setStartInQuoteMode(true);
                            setModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-6 py-3 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                        >
                          Submit RFQ
                        </button>
                      )}

                      {submitted && (
                        <span className="px-4 py-2.5 text-[#0D1B2A] rounded-lg text-sm font-bold border border-gray-200 bg-gray-50">
                          RFQ Submitted
                        </span>
                      )}

                      {isExpired && (
                        <span className="px-4 py-2.5 text-gray-500 rounded-lg text-sm font-bold border border-gray-200">
                          Expired
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-500 mb-1">
              {activeFilter === "open" ? "No open orders right now" : activeFilter === "direct" ? "No direct orders" : activeFilter === "quoted" ? "No RFQs submitted yet" : "No requisitions found"}
            </p>
            <p className="text-sm text-gray-400">
              {activeFilter === "open"
                ? "New orders from project managers will appear here. Check back soon!"
                : activeFilter === "direct"
                ? "Direct orders from project managers will appear here"
                : activeFilter === "quoted"
                ? "Submit RFQs on open orders to see them here"
                : "Try adjusting your filters"}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <RequisitionDetailModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedRequisition(null);
          setStartInQuoteMode(false);
        }}
        requisition={selectedRequisition}
        onSubmitQuote={handleSubmitQuote}
        startInQuoteMode={startInQuoteMode}
      />
    </div>
  );
}
