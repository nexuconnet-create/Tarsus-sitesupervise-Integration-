"use client";
import BackButton from "@/components/BackButton";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  RefreshCw,
  Plus,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { MOCK_PM_CHANGE_ORDERS } from "@/lib/mockData/vendor";
import type { ChangeOrder, ChangeOrderStatus } from "@/lib/types/vendor";

const filterTabs: { label: string; value: ChangeOrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export default function PMChangeOrdersPage() {
  const router = useRouter();
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const base = `/${orgSlug}/projects/${projectSlug}/project-manager`;
  const [loading] = useState(false);
  const [changeOrders] = useState<ChangeOrder[]>(MOCK_PM_CHANGE_ORDERS);
  const [activeFilter, setActiveFilter] = useState<ChangeOrderStatus | "all">("all");

  const filtered = changeOrders.filter(
    (co) => activeFilter === "all" || co.status === activeFilter
  );

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
        <div className="flex items-center gap-3"><BackButton /><div className="text-2xl font-bold text-[#021422]">Change Orders</div></div>
        <button
          onClick={() => router.push(`${base}/vendors/change-orders/new`)}
          className="flex items-center gap-2 bg-[#021422] text-white px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          New Change Order
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
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">PO #</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Cost Diff</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((co, idx) => {
                    const isIncrease = co.costDifference > 0;
                    return (
                      <motion.tr
                        key={co.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <p className="font-medium text-[#021422]">{co.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{co.reason}</p>
                        </td>
                        <td className="py-4 px-4 text-gray-600 font-medium">{co.poNumber}</td>
                        <td className="py-4 px-4">
                          <span className={`font-bold ${isIncrease ? "text-red-600" : "text-green-600"}`}>
                            {isIncrease ? "+" : ""}₦{co.costDifference.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">{statusBadge(co.status)}</td>
                        <td className="py-4 px-4 text-gray-500">{new Date(co.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                              <Eye size={16} className="text-gray-600" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <RefreshCw size={48} className="mx-auto mb-3 opacity-40" />
              <p className="font-bold text-gray-500 mb-1">No change orders found</p>
              <p className="text-sm">
                {activeFilter !== "all" ? `No ${activeFilter} change orders` : 'Click "New Change Order" to create one'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
