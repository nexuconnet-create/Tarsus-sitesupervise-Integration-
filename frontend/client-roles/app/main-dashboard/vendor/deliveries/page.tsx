"use client";

import React, { useState } from "react";
import {
  Truck,
  Eye,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { MOCK_PURCHASE_ORDERS } from "@/lib/mockData/vendor";
import DeliveryDetailModal from "../components/DeliveryDetailModal";
import StatusPill from "../components/StatusPill";
import type { PurchaseOrder, DeliveryStatus } from "@/lib/types/vendor";
import { useVendorStore } from "@/store/vendorStore";

const VENDOR_ID = "vendor-1";

const deliveryTabs: { label: string; value: DeliveryStatus | "all" | "delivered" }[] = [
  { label: "All", value: "all" },
  { label: "Dispatched", value: "dispatched" },
  { label: "In Transit", value: "in_transit" },
  { label: "Arrived", value: "arrived" },
  { label: "Delivered", value: "delivered" },
];

export default function VendorDeliveriesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const purchaseOrders = useVendorStore((s) => s.purchaseOrders);
  const setDeliveryStatus = useVendorStore((s) => s.setDeliveryStatus);
  const setPOStatus = useVendorStore((s) => s.setPOStatus);
  const deliveries = purchaseOrders.filter((po) => po.vendorId === VENDOR_ID && po.driverName);
  const [activeFilter, setActiveFilter] = useState<DeliveryStatus | "all" | "delivered">("all");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = deliveries.filter((po) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "delivered") return po.status === "delivered";
    return po.deliveryStatus === activeFilter;
  });

  const handleMarkArrived = (poId: string) => {
    setDeliveryStatus(poId, "arrived");
    toast.success("Marked as Arrived!");
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (status === "delivered") {
      setPOStatus(id, "delivered");
    } else {
      setDeliveryStatus(id, status as DeliveryStatus);
    }
  };

  const deliveryStatusPill = (status: string | undefined) => {
    const map: Record<string, "success" | "danger" | "warning" | "info" | "default"> = {
      loading: "warning",
      dispatched: "info",
      en_route: "info",
      arrived: "success",
    };
    return <StatusPill label={status?.replace("_", " ") || "Pending"} variant={map[status || ""] || "default"} />;
  };

  const poStatusPill = (status: string) => {
    const map: Record<string, "success" | "danger" | "warning" | "info" | "default"> = {
      pending: "warning",
      confirmed: "success",
      in_transit: "info",
      delivered: "success",
      cancelled: "default",
    };
    return <StatusPill label={status.replace("_", " ")} variant={map[status] || "default"} />;
  };

  const openDetail = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setModalOpen(true);
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="text-3xl font-bold text-[#0D1B2A]">Deliveries</div>
      </div>

      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {deliveryTabs.map((tab) => (
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

        {/* Loading */}
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
            <p className="font-bold text-gray-500 mb-1">Failed to load deliveries</p>
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
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">PO Number</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Project</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Driver</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Vehicle</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Delivery Status</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">PO Status</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((po, idx) => (
                  <motion.tr
                    key={po.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4 font-bold text-[#0D1B2A]">{po.poNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{po.projectName || po.projectId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-gray-400" />
                        <span className="text-gray-700">{po.driverName || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{po.vehiclePlate || "—"}</td>
                    <td className="px-6 py-4">{deliveryStatusPill(po.deliveryStatus)}</td>
                    <td className="px-6 py-4">{poStatusPill(po.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDetail(po)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0D1B2A] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                      >
                        <Eye size={14} /> Track
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Truck size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-500 mb-1">No deliveries found</p>
            <p className="text-sm text-gray-400">
              {activeFilter === "all"
                ? "You have no active deliveries at the moment"
                : `No deliveries with status "${activeFilter}"`}
            </p>
          </div>
        )}
      </div>

      {/* Delivery Detail Modal */}
      <DeliveryDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        purchaseOrder={selectedPO}
        onMarkArrived={handleMarkArrived}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
