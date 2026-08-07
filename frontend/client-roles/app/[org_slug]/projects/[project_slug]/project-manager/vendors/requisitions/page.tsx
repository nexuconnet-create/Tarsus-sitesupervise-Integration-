"use client";
import BackButton from "@/components/BackButton";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  Inbox,
  Plus,
  Eye,
  FileText,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { MOCK_PM_REQUISITIONS } from "@/lib/mockData/vendor";
import QuoteReviewModal from "../components/QuoteReviewModal";
import type { Requisition, RequisitionStatus } from "@/lib/types/vendor";

const filterTabs: { label: string; value: RequisitionStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
  { label: "Expired", value: "expired" },
];

export default function PMRequisitionsPage() {
  const router = useRouter();
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const base = `/${orgSlug}/projects/${projectSlug}/project-manager`;
  const [loading, setLoading] = useState(false);
  const [requisitions, setRequisitions] = useState<Requisition[]>(MOCK_PM_REQUISITIONS);
  const [activeFilter, setActiveFilter] = useState<RequisitionStatus | "all">("all");
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRequisitions((prev) =>
        prev.map((r) => {
          if (r.status === "open" && new Date(r.expiresAt) < new Date()) {
            return { ...r, status: "expired" as RequisitionStatus };
          }
          return r;
        })
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const filtered = requisitions.filter(
    (r) => activeFilter === "all" || r.status === activeFilter
  );

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

  const handleQuoteAccepted = () => {
    if (selectedRequisition) {
      setRequisitions((prev) =>
        prev.map((r) =>
          r.id === selectedRequisition.id ? { ...r, status: "closed" as RequisitionStatus } : r
        )
      );
    }
    setModalOpen(false);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: "bg-[#021422] text-white",
      closed: "bg-blue-50 text-blue-700",
      expired: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  const priorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: "bg-gray-100 text-gray-600",
      medium: "bg-blue-50 text-blue-700",
      high: "bg-orange-50 text-orange-700",
      urgent: "bg-red-50 text-red-700",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${styles[priority] || "bg-gray-100 text-gray-600"}`}>
        {priority}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#021422]">
        <Loader2 size={28} className="animate-spin text-[#0166B0]" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="flex items-center gap-3"><BackButton /><div className="text-2xl font-bold text-[#021422]">My Requisitions</div></div>
        <button
          onClick={() => router.push(`${base}/vendors/requisitions/new`)}
          className="flex items-center gap-2 bg-[#021422] text-white px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          New Requisition
        </button>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                activeFilter === tab.value
                  ? "bg-[#021422] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Title</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Project</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Priority</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Quotes</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Expiry</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req, idx) => (
                    <motion.tr
                      key={req.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <p className="font-medium text-[#021422]">{req.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{req.items.length} item{req.items.length !== 1 ? "s" : ""}</p>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{req.projectName}</td>
                      <td className="py-4 px-4">{priorityBadge(req.priority)}</td>
                      <td className="py-4 px-4">{statusBadge(req.status)}</td>
                      <td className="py-4 px-4">
                        {req.quotes.length > 0 ? (
                          <span className="flex items-center gap-1 text-sm font-medium text-[#0166B0]">
                            <FileText size={14} />
                            {req.quotes.length}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {req.status === "open" ? (
                          <span className="flex items-center gap-1 text-sm text-[#021422] font-medium">
                            <Clock size={14} className="text-gray-400" />
                            {getExpiryCountdown(req.expiresAt)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedRequisition(req);
                              setModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} className="text-gray-600" />
                          </button>
                          {req.quotes.length > 0 && req.status === "open" && (
                            <button
                              onClick={() => {
                                setSelectedRequisition(req);
                                setModalOpen(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#0166B0] text-white rounded-lg text-xs font-bold uppercase hover:bg-[#014a80] transition-colors"
                              title="Review RFQs"
                            >
                              <FileText size={14} />
                              Review
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Inbox size={48} className="mx-auto mb-3 opacity-40" />
              <p className="font-bold text-gray-500 mb-1">No requisitions found</p>
              <p className="text-sm">
                {activeFilter !== "all" ? `No ${activeFilter} requisitions` : 'Click "New Requisition" to create one'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quote Review Modal */}
      <QuoteReviewModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedRequisition(null);
        }}
        requisition={selectedRequisition}
        onQuoteAccepted={handleQuoteAccepted}
        onCreatePO={(quoteId, reqId) => {
          router.push(`${base}/vendors/purchase-orders/new?quote=${quoteId}&requisition=${reqId}`);
        }}
      />
    </div>
  );
}
