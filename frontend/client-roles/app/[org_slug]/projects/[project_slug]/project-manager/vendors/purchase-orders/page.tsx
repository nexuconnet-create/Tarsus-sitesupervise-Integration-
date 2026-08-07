"use client";
import BackButton from "@/components/BackButton";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ShoppingCart, Eye, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { getErrorMessage } from "@/lib/error";
import type { InventoryPOStatus } from "@/lib/types/inventoryPO";
import { POStatusBadge } from "@/components/vendor-pipeline/primitives";

interface BackendPO {
  id: string;
  po_number: string;
  supplier: { id: string; name: string } | null;
  project: { id: string; name: string };
  status: InventoryPOStatus;
  total_amount: string;
  order_date: string;
  expected_delivery_date: string | null;
  created_by: { fullname: string } | null;
}

const filterTabs: { label: string; value: InventoryPOStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Approved", value: "approved" },
  { label: "Sent", value: "sent" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Received", value: "received" },
  { label: "Cancelled", value: "cancelled" },
];

export default function PMPurchaseOrdersPage() {
  const router = useRouter();
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const base = `/${orgSlug}/projects/${projectSlug}/project-manager`;
  const { data: projectId } = useProjectUuid(orgSlug, projectSlug);

  const [loading, setLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState<BackendPO[]>([]);
  const [activeFilter, setActiveFilter] = useState<InventoryPOStatus | "all">("all");

  const fetchPOs = useCallback(
    async (status?: InventoryPOStatus | "all") => {
      if (!projectId) return;
      try {
        setLoading(true);
        const res = await purchaseOrderService.listPOs(projectId, {
          status: status && status !== "all" ? status : undefined,
        });
        const raw = res.data;
        setPurchaseOrders(Array.isArray(raw) ? raw : (raw?.results ?? []));
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [projectId],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPOs(activeFilter);
  }, [activeFilter, fetchPOs]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#0166B0]" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="flex items-center gap-3"><BackButton /><div className="text-2xl font-bold text-[#021422]">Purchase Orders</div></div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 font-medium">
            {purchaseOrders.length} order{purchaseOrders.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => router.push(`${base}/vendors/purchase-orders/new`)}
            className="flex items-center gap-2 bg-[#021422] text-white px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} />
            New Purchase Order
          </button>
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
          {purchaseOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">PO #</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Supplier</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Total</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Expected Delivery</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po, idx) => (
                    <motion.tr
                      key={po.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-[#021422]">{po.po_number}</td>
                      <td className="py-4 px-4 text-gray-600">{po.supplier?.name ?? "—"}</td>
                      <td className="py-4 px-4 font-bold text-[#021422]">
                        ₦{parseFloat(po.total_amount || "0").toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <POStatusBadge status={po.status} />
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        {po.expected_delivery_date
                          ? new Date(po.expected_delivery_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => router.push(`${base}/vendors/purchase-orders/${po.id}`)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={16} className="text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart size={48} className="mx-auto mb-3 opacity-40" />
              <p className="font-bold text-gray-500 mb-1">No purchase orders found</p>
              <p className="text-sm">Create a new purchase order to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
