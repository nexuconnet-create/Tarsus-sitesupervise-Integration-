"use client";
import BackButton from "@/components/BackButton";

import React, { useState } from "react";
import {
  Loader2,
  Truck,
  MapPin,
  Phone,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { MOCK_PM_PURCHASE_ORDERS } from "@/lib/mockData/vendor";
import type { PurchaseOrder, DeliveryStatus } from "@/lib/types/vendor";

const deliveryTabs: { label: string; value: DeliveryStatus | "all" | "delivered" }[] = [
  { label: "All", value: "all" },
  { label: "Dispatched", value: "dispatched" },
  { label: "In Transit", value: "in_transit" },
  { label: "Arrived", value: "arrived" },
  { label: "Delivered", value: "delivered" },
];

export default function PMDeliveriesPage() {
  const [loading] = useState(false);
  const [deliveries, setDeliveries] = useState<PurchaseOrder[]>(
    MOCK_PM_PURCHASE_ORDERS.filter((po) => po.driverName)
  );
  const [activeFilter, setActiveFilter] = useState<DeliveryStatus | "all" | "delivered">("all");

  const filtered = deliveries.filter((po) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "delivered") return po.status === "delivered";
    return po.deliveryStatus === activeFilter;
  });

  const handleReleaseEscrow = (poId: string) => {
    setDeliveries((prev) =>
      prev.map((po) =>
        po.id === poId ? { ...po, escrowStatus: "released" } : po
      )
    );
    toast.success("Escrow released to vendor");
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="flex items-center gap-3"><BackButton /><div className="text-2xl font-bold text-[#021422]">Vendor Deliveries</div></div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {deliveryTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                activeFilter === tab.value
                  ? "bg-[#021422] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Deliveries Table */}
        {filtered.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">PO Number</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Vendor</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Project</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Driver</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Delivery Status</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Escrow</th>
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
                    <td className="px-6 py-4 font-bold text-[#021422]">{po.poNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{po.vendorName}</td>
                    <td className="px-6 py-4 text-gray-600">{po.projectName || po.projectId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-gray-400" />
                        <span className="text-gray-700">{po.driverName || "—"}</span>
                        {po.driverPhone && (
                          <a
                            href={`tel:${po.driverPhone}`}
                            className="text-[#0166B0] hover:underline flex items-center gap-1"
                          >
                            <Phone size={12} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        po.deliveryStatus === "arrived"
                          ? "bg-green-50 text-green-700"
                          : po.deliveryStatus === "in_transit"
                          ? "bg-blue-50 text-blue-700"
                          : po.deliveryStatus === "dispatched"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {po.deliveryStatus?.replace("_", " ") || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        po.escrowStatus === "released"
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {po.escrowStatus === "released" ? "Released" : "Held"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {po.deliveryAddress && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(po.deliveryAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <MapPin size={12} />
                            Map
                          </a>
                        )}
                        {po.escrowStatus === "held" && po.status === "delivered" && (
                          <button
                            onClick={() => handleReleaseEscrow(po.id)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                          >
                            Release Escrow
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Truck size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-500 mb-1">No deliveries found</p>
            <p className="text-sm text-gray-400">
              {activeFilter === "all"
                ? "No active vendor deliveries at the moment"
                : `No deliveries with status "${activeFilter}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
