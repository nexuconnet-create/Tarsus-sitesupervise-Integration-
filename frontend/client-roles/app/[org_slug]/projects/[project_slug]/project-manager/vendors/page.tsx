"use client";
import BackButton from "@/components/BackButton";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  Store,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  ShoppingCart,
} from "lucide-react";
import { motion } from "framer-motion";
import { MOCK_PM_VENDORS } from "@/lib/mockData/vendor";
import type { Vendor } from "@/lib/types/vendor";

const businessTypeFilters = [
  "All",
  "Cement & Concrete",
  "Steel & Rebar",
  "Electrical Supplies",
  "Plumbing Supplies",
  "Lumber & Timber",
  "Paint & Coatings",
  "General Supplies",
];

export default function PMVendorsPage() {
  const router = useRouter();
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const base = `/${orgSlug}/projects/${projectSlug}/project-manager`;
  const [loading] = useState(false);
  const [vendors] = useState<Vendor[]>(MOCK_PM_VENDORS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "pending" | "rejected">("all");

  const filtered = vendors.filter((v) => {
    const matchesSearch =
      !search ||
      v.companyName.toLowerCase().includes(search.toLowerCase()) ||
      v.businessType.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || v.businessType === typeFilter;
    const matchesStatus = statusFilter === "all" || v.verificationStatus === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const verificationBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      verified: { bg: "bg-green-50", text: "text-green-700", icon: <CheckCircle size={14} /> },
      pending: { bg: "bg-yellow-50", text: "text-yellow-700", icon: <Clock size={14} /> },
      rejected: { bg: "bg-red-50", text: "text-red-700", icon: <XCircle size={14} /> },
    };
    const c = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
        {c.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
        <div className="flex items-center gap-3"><BackButton /><div className="text-2xl font-bold text-[#021422]">Vendor Directory</div></div>
        <div className="text-sm text-gray-500 font-medium">
          {filtered.length} vendor{filtered.length !== 1 ? "s" : ""} found
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Search + Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-11 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
          >
            {businessTypeFilters.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Vendor Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((vendor, idx) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#021422] flex items-center justify-center text-white font-bold text-lg">
                      {vendor.companyName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#021422] text-sm">{vendor.companyName}</h3>
                      <p className="text-xs text-gray-500">{vendor.businessType}</p>
                    </div>
                  </div>
                  {verificationBadge(vendor.verificationStatus)}
                </div>

                <div className="text-sm text-gray-600 line-clamp-2">
                  {vendor.description || "No description provided."}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{vendor.contactEmail}</span>
                </div>

                {vendor.verificationStatus === "verified" && (
                  <div className="flex gap-2 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => router.push(`${base}/vendors/purchase-orders/new`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#021422] text-white rounded-lg text-xs font-bold uppercase hover:bg-gray-800 transition-colors"
                    >
                      <ShoppingCart size={14} />
                      Create PO
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Store size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-500 mb-1">No vendors found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
