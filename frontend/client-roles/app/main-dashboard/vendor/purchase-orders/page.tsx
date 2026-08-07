"use client";

import React, { useState } from "react";
import {
  ShoppingCart,
  Eye,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
// import { vendorService } from "@/lib/services";
import { MOCK_PURCHASE_ORDERS } from "@/lib/mockData/vendor";
import VendorDashboardSection from "../components/VendorDashboardSection";
import PODetailModal from "../components/PODetailModal";
import StatusPill from "../components/StatusPill";
import type { PurchaseOrder, POStatus } from "@/lib/types/vendor";
import { useVendorStore } from "@/store/vendorStore";

const filterTabs: { label: string; value: POStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "In Transit", value: "in_transit" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const nextActions: Record<string, { label: string; value: string } | null> = {
  pending: { label: "Confirm", value: "confirmed" },
  confirmed: { label: "In Transit", value: "in_transit" },
  in_transit: { label: "Delivered", value: "delivered" },
  delivered: null,
  cancelled: null,
};

export default function PurchaseOrdersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const purchaseOrders = useVendorStore((s) => s.purchaseOrders);
  const setPOStatus = useVendorStore((s) => s.setPOStatus);
  const submitInvoice = useVendorStore((s) => s.submitInvoice);
  const [activeFilter, setActiveFilter] = useState<POStatus | "all">("all");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = purchaseOrders.filter(
    (po) => activeFilter === "all" || po.status === activeFilter
  );

  /* â”€â”€ API version (uncomment when backend is ready) â”€â”€
  const fetchPOs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (activeFilter !== "all") params.status = activeFilter;
      const res = await vendorService.getPurchaseOrders(params);
      const data = res.data?.data || res.data?.results || res.data || [];
      setPurchaseOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => { fetchPOs(); }, [fetchPOs]);
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const handleUpdateStatus = async (id: string, data: { status: string }) => {
    setPOStatus(id, data.status as POStatus);
    toast.success(`Status updated to ${statusLabels[data.status]}`);
  };

  const handleSubmitInvoice = async (poId: string, invoice: { items: import("@/lib/types/vendor").RequisitionItem[]; totalAmount: number; notes?: string }) => {
    submitInvoice(poId, {
      id: `inv-${Date.now()}`,
      purchaseOrderId: poId,
      vendorId: "vendor-1",
      items: invoice.items,
      totalAmount: invoice.totalAmount,
      notes: invoice.notes,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
    toast.success("Invoice submitted successfully!");
  };

  /* â”€â”€ API version (uncomment when backend is ready) â”€â”€
  const handleUpdateStatus = async (id: string, data: { status: string }) => {
    try {
      await vendorService.updatePOStatus(id, data);
      toast.success(`Status updated to ${statusLabels[data.status]}`);
      fetchPOs();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to update status");
      throw err;
    }
  };
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const statusPill = (status: string) => {
    const map: Record<string, "success" | "danger" | "warning" | "info" | "default"> = {
      pending: "warning",
      confirmed: "success",
      in_transit: "info",
      delivered: "success",
      cancelled: "default",
    };
    return <StatusPill label={status.replace("_", " ")} variant={map[status] || "default"} />;
  };

  return (
    <div className="pb-24">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="text-3xl font-bold text-[#0D1B2A]">Purchase Orders</div>
        <div className="text-sm text-gray-500 font-medium">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
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
        <VendorDashboardSection title="Orders" icon={<ShoppingCart size={20} />}>
          {loading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-gray-400">
              <AlertTriangle size={48} className="mx-auto mb-3 opacity-40" />
              <p className="font-bold text-gray-500 mb-1">Failed to load purchase orders</p>
              <p className="text-sm mb-4">{error}</p>
              <button
                onClick={() => { setError(null); setLoading(true); setTimeout(() => setLoading(false), 800); }}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                <RefreshCw size={16} /> Retry
              </button>
            </div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">PO #</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Project</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Items</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Total</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Delivery</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((po, idx) => {
                    const action = nextActions[po.status];
                    return (
                      <motion.tr
                        key={po.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-[#0D1B2A]">{po.poNumber}</td>
                        <td className="py-4 px-4 text-gray-600">{po.projectName || po.projectId}</td>
                        <td className="py-4 px-4 text-gray-500 text-xs">{po.items.length} item{po.items.length !== 1 ? "s" : ""}</td>
                        <td className="py-4 px-4 font-bold text-[#0D1B2A]">₦{po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-4 px-4">{statusPill(po.status)}</td>
                        <td className="py-4 px-4 text-gray-500">
                          {po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setSelectedPO(po); setModalOpen(true); }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} className="text-gray-600" />
                            </button>
                            {action && (
                              <button
                                onClick={() => handleUpdateStatus(po.id, { status: action.value })}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#0D1B2A] text-white rounded-lg text-xs font-bold uppercase hover:bg-gray-800 transition-colors"
                              >
                                {action.label}
                                <ChevronRight size={14} />
                              </button>
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
              <ShoppingCart size={48} className="mx-auto mb-3 opacity-40" />
              <p className="font-bold text-gray-500 mb-1">No purchase orders found</p>
              <p className="text-sm">
                {activeFilter !== "all" ? `No ${activeFilter.replace("_", " ")} orders` : "Purchase orders will appear here once a PM creates them"}
              </p>
            </div>
          )}
        </VendorDashboardSection>
      </div>

      {/* Detail Modal */}
      <PODetailModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPO(null);
        }}
        po={selectedPO}
        onUpdateStatus={handleUpdateStatus}
        onSubmitInvoice={handleSubmitInvoice}
      />
    </div>
  );
}
