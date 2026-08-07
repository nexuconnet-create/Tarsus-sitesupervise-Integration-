"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Scale,
  Search,
  ChevronRight,
  Building2,
} from "lucide-react";
import { MOCK_DISPUTES } from "@/lib/mockData/vendor";
import type { DisputeStatus } from "@/lib/types/vendor";

const statusTabs: { label: string; value: DisputeStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "filed" },
  { label: "Responded", value: "responded" },
  { label: "Resolved", value: "resolved" },
];

const statusStyles: Record<string, string> = {
  filed: "bg-amber-50 text-amber-700 border-amber-200",
  responded: "bg-blue-50 text-blue-700 border-blue-200",
  mediation: "bg-purple-50 text-purple-700 border-purple-200",
  arbitration: "bg-orange-50 text-orange-700 border-orange-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
};

export default function VendorDisputesPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<DisputeStatus | "all">("all");
  const [search, setSearch] = useState("");

  const vendorDisputes = MOCK_DISPUTES.filter((d) => d.vendorName === "ABC Cement Supplies");

  const filtered = vendorDisputes.filter((d) => {
    if (activeFilter !== "all" && d.status !== activeFilter) return false;
    if (search && !d.disputeNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="pb-24">
      <div className="bg-white py-7 px-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#0D1B2A]">Disputes</h1>
          <p className="text-sm text-gray-500 mt-1">{vendorDisputes.length} dispute{vendorDisputes.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  activeFilter === tab.value
                    ? "bg-[#0D1B2A] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search disputes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] w-full sm:w-64"
            />
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((dispute) => (
              <div
                key={dispute.id}
                onClick={() => router.push(`/main-dashboard/vendor/disputes/${dispute.id}`)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          {dispute.severity === "critical" && <AlertTriangle size={16} className="text-red-500" />}
                          <span className="font-bold text-[#0D1B2A]">{dispute.disputeNumber}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-sm text-gray-600">{dispute.poNumber}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{dispute.projectName}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${statusStyles[dispute.status] || "bg-gray-100 text-gray-600"}`}>
                        {dispute.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{dispute.reason}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Filed {new Date(dispute.filedAt).toLocaleDateString()}
                      </span>
                      <span className="font-medium text-[#0D1B2A]">
                        ₦{dispute.amountHeld.toLocaleString()} held
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Scale size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-500 mb-1">No disputes found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}