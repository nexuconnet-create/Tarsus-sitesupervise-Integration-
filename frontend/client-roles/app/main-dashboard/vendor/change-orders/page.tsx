"use client";

import React, { useState } from "react";
import {
  Loader2,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
// import { vendorService } from "@/lib/services";
import { MOCK_CHANGE_ORDERS } from "@/lib/mockData/vendor";
import VendorDashboardSection from "../components/VendorDashboardSection";
import ChangeOrderDetailModal from "../components/ChangeOrderDetailModal";
import type { ChangeOrder, ChangeOrderStatus } from "@/lib/types/vendor";

const filterTabs: { label: string; value: ChangeOrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export default function ChangeOrdersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>(MOCK_CHANGE_ORDERS);
  const [activeFilter, setActiveFilter] = useState<ChangeOrderStatus | "all">("all");
  const [selectedCO, setSelectedCO] = useState<ChangeOrder | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = changeOrders.filter(
    (co) => activeFilter === "all" || co.status === activeFilter
  );

  /* â”€â”€ API version (uncomment when backend is ready) â”€â”€
  const fetchChangeOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (activeFilter !== "all") params.status = activeFilter;
      const res = await vendorService.getChangeOrders(params);
      const data = res.data?.data || res.data?.results || res.data || [];
      setChangeOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load change orders");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => { fetchChangeOrders(); }, [fetchChangeOrders]);
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const handleRespond = async (id: string, data: { status: string }) => {
    setChangeOrders((prev) =>
      prev.map((co) =>
        co.id === id ? { ...co, status: data.status as ChangeOrderStatus } : co
      )
    );
    toast.success(`Change order ${data.status}`);
  };

  /* â”€â”€ API version (uncomment when backend is ready) â”€â”€
  const handleRespond = async (id: string, data: { status: string }) => {
    try {
      await vendorService.respondChangeOrder(id, data);
      toast.success(`Change order ${data.status}`);
      fetchChangeOrders();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to respond");
      throw err;
    }
  };
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

  return (
    <div className="pb-24">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="text-3xl font-bold text-[#0D1B2A]">Change Orders</div>
        <div className="text-sm text-gray-500 font-medium">
          {filtered.length} change order{filtered.length !== 1 ? "s" : ""}
        </div>
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
                  ? "bg-[#0D1B2A] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <VendorDashboardSection title="Change Orders" icon={<RefreshCw size={20} />}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-[#0D1B2A]" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-gray-400">
              <AlertTriangle size={48} className="mx-auto mb-3 opacity-40" />
              <p className="font-bold text-gray-500 mb-1">Failed to load change orders</p>
              <p className="text-sm mb-4">{error}</p>
              <button
                onClick={() => { setError(null); setLoading(true); setTimeout(() => setLoading(false), 800); }}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Title
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      PO #
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Cost Difference
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Actions
                    </th>
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
                          <p className="font-medium text-[#0D1B2A]">{co.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {co.description || co.reason}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-gray-600 font-medium">
                          {co.poNumber || co.purchaseOrderId}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`font-bold ${
                              isIncrease ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {isIncrease ? "+" : ""}₦
                            {co.costDifference.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-4">{statusBadge(co.status)}</td>
                        <td className="py-4 px-4 text-gray-500">
                          {new Date(co.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedCO(co);
                                setModalOpen(true);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} className="text-gray-600" />
                            </button>
                            {co.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleRespond(co.id, { status: "approved" })
                                  }
                                  className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle
                                    size={16}
                                    className="text-green-600"
                                  />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRespond(co.id, { status: "rejected" })
                                  }
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle
                                    size={16}
                                    className="text-red-500"
                                  />
                                </button>
                              </>
                            )}
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
              <p className="font-bold text-gray-500 mb-1">
                No change orders found
              </p>
              <p className="text-sm">
                {activeFilter !== "all"
                  ? `No ${activeFilter} change orders`
                  : "Change order requests will appear here"}
              </p>
            </div>
          )}
        </VendorDashboardSection>
      </div>

      {/* Detail Modal */}
      <ChangeOrderDetailModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCO(null);
        }}
        changeOrder={selectedCO}
        onRespond={handleRespond}
      />
    </div>
  );
}
