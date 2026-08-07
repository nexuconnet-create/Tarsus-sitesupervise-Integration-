"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock } from "lucide-react";

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
import { MOCK_PAYOUTS } from "@/lib/mockData/kyc";
import type { PayoutRecord, VendorPayoutStatus } from "@/lib/types/vendor";

const statusPill = (status: VendorPayoutStatus) => {
  const map: Record<string, "success" | "danger" | "warning" | "info" | "default"> = {
    paid: "success",
    processing: "info",
    pending: "warning",
    failed: "danger",
  };
  return <StatusPill label={status} variant={map[status] || "default"} />;
};

export default function PayoutsPage() {
  const [payouts] = useState<PayoutRecord[]>(MOCK_PAYOUTS);

  const totalPaid = payouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.netAmount, 0);

  const pendingAmount = payouts
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + p.netAmount, 0);

  const totalCommission = payouts.reduce((sum, p) => sum + p.commission, 0);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="text-3xl font-bold text-[#0D1B2A]">Payouts & Earnings</div>
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
              <div className="p-2.5 bg-[#DCFCE7] rounded-lg">
                <CheckCircle size={20} className="text-[#16A34A]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0D1B2A]">₦{totalPaid.toLocaleString()}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">Total Paid Out</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-[#FEF3C7] rounded-lg">
                <Clock size={20} className="text-[#D97706]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0D1B2A]">₦{pendingAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">Pending Settlement</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-gray-100 rounded-lg">
                <NairaIcon size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0D1B2A]">₦{totalCommission.toLocaleString()}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">Total Commission (5%)</p>
          </motion.div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">PO #</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Project</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Total</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Commission</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Net Amount</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length > 0 ? (
                payouts.map((p, idx) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#0D1B2A]">{p.poNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{p.projectName}</td>
                    <td className="px-6 py-4 text-right font-bold text-[#0D1B2A]">₦{p.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-gray-500">₦{p.commission.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-[#0D1B2A]">₦{p.netAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">{statusPill(p.status)}</td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString()
                        : new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <NairaIcon size={48} />
                    <p className="font-bold text-gray-500 mb-1">No payouts yet</p>
                    <p className="text-sm">Payouts will appear here once orders are completed and settled.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
