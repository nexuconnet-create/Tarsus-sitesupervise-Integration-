"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Eye, AlertTriangle, RefreshCw, Clock } from "lucide-react";

function NairaIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20V4" />
      <path d="M4 4L14 16V4" />
      <path d="M14 4V20" />
      <path d="M20 4V20" />
      <path d="M2 12H22" />
    </svg>
  );
}
import StatusPill from "../components/StatusPill";
import { MOCK_INVOICES, MOCK_PURCHASE_ORDERS } from "@/lib/mockData/vendor";
import PODetailModal from "../components/PODetailModal";
import type { Invoice, InvoiceStatus } from "@/lib/types/vendor";

const tabs: { label: string; value: InvoiceStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Approved", value: "approved" },
  { label: "Paid", value: "paid" },
];

const invoiceStatusPill = (status: InvoiceStatus) => {
  const map: Record<string, "success" | "danger" | "warning" | "info" | "default"> = {
    submitted: "warning",
    approved: "info",
    paid: "success",
  };
  return <StatusPill label={status} variant={map[status] || "default"} />;
};

export default function InvoicesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices] = useState<Invoice[]>(MOCK_INVOICES.filter((inv) => inv.vendorId === "vendor-1"));
  const [activeTab, setActiveTab] = useState<InvoiceStatus | "all">("all");
  const [selectedPO, setSelectedPO] = useState<(typeof MOCK_PURCHASE_ORDERS)[number] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = invoices.filter((inv) => activeTab === "all" || inv.status === activeTab);

  const totalOutstanding = invoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const openDetail = (inv: Invoice) => {
    const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === inv.purchaseOrderId) || null;
    if (po) {
      setSelectedPO(po);
      setModalOpen(true);
    }
  };

  const po = selectedPO;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="text-3xl font-bold text-[#0D1B2A]">Invoices</div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-[#FEF3C7] rounded-lg">
                <Clock size={20} className="text-[#D97706]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0D1B2A]">₦{totalOutstanding.toLocaleString()}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">Outstanding</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-[#DCFCE7] rounded-lg">
                <NairaIcon size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0D1B2A]">₦{totalPaid.toLocaleString()}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">Total Paid</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-[#DBEAFE] rounded-lg">
                <FileText size={20} className="text-[#2563EB]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0D1B2A]">{invoices.length}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">Total Invoices</p>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? "bg-[#0D1B2A] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <AlertTriangle size={48} className="mx-auto mb-3 text-red-300" />
            <p className="font-bold text-gray-500 mb-1">Failed to load invoices</p>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => { setError(null); setLoading(true); setTimeout(() => setLoading(false), 800); }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">PO #</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Total</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Submitted</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Paid</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, idx) => {
                  const poRef = MOCK_PURCHASE_ORDERS.find((p) => p.id === inv.purchaseOrderId);
                  return (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-[#0D1B2A]">{poRef?.poNumber || inv.purchaseOrderId}</td>
                      <td className="px-6 py-4 font-bold text-[#0D1B2A]">₦{inv.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">{invoiceStatusPill(inv.status)}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(inv.submittedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-500">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : "—"}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDetail(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0D1B2A] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-500 mb-1">No invoices found</p>
            <p className="text-sm text-gray-400">
              {activeTab !== "all" ? `No ${activeTab} invoices` : "Invoices will appear here once orders are delivered."}
            </p>
          </div>
        )}
      </div>

      {/* PO Detail Modal */}
      {po && (
        <PODetailModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedPO(null); }}
          po={po}
          onUpdateStatus={async () => {}}
        />
      )}
    </div>
  );
}
