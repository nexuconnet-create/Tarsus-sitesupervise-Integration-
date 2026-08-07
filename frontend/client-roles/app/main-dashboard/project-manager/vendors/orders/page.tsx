"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  Clock,
  Package,
  Eye,
  MessageSquare,
  ScanLine,
  CheckCircle,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePmOrders, type OrderStage, type OrderListItem } from "@/lib/hooks/usePmOrders";
import type { Requisition } from "@/lib/types/vendor";
import StatusPill from "@/app/main-dashboard/vendor/components/StatusPill";
import QuoteCompareModal from "../components/QuoteCompareModal";
import DeliveryVerifyModal from "../components/DeliveryVerifyModal";
import toast from "react-hot-toast";

const stageTabs: { label: string; value: OrderStage }[] = [
  { label: "All", value: "all" },
  { label: "RFQ / Bidding", value: "rfq" },
  { label: "Confirmed", value: "confirmed" },
  { label: "In Transit", value: "in_transit" },
  { label: "At Site", value: "at_site" },
  { label: "Delivered", value: "delivered" },
];

const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

const getDeadline = (item: OrderListItem) => {
  if (item.kind === "requisition") {
    return item.data.requiredByDate || new Date(item.data.expiresAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" });
  }
  return item.data.deliveryDate
    ? new Date(item.data.deliveryDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })
    : "—";
};

const getRowTitle = (item: OrderListItem) => {
  if (item.kind === "requisition") return item.data.title.replace(/^Urgent\s+/i, "");
  return item.data.poNumber;
};

const getRowSubtitle = (item: OrderListItem) => {
  if (item.kind === "requisition") return item.data.projectName;
  return `${item.data.projectName || item.data.projectId} • ${item.data.vendorName || item.data.vendorId}`;
};

const getTotalAmount = (item: OrderListItem) => {
  if (item.kind === "purchaseOrder") return item.data.totalAmount;
  return item.data.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
};

const getItemCount = (item: OrderListItem) => {
  if (item.kind === "purchaseOrder") return item.data.items.length;
  return item.data.items.length;
};

const getStatusPill = (item: OrderListItem) => {
  if (item.kind === "requisition") {
    return <StatusPill label="Bidding Open" variant="info" />;
  }
  const po = item.data;
  if (po.status === "delivered" || po.deliveryStatus === "delivered") {
    return <StatusPill label="Delivered" variant="success" />;
  }
  if (po.deliveryStatus === "arrived" || po.deliveryStatus === "awaiting_confirmation") {
    return <StatusPill label="At Site" variant="warning" />;
  }
  if (po.deliveryStatus === "in_transit" || po.deliveryStatus === "dispatched" || po.deliveryStatus === "loading") {
    return <StatusPill label="In Transit" variant="info" />;
  }
  if (po.status === "pending" || po.status === "confirmed") {
    return <StatusPill label="Confirmed" variant="default" />;
  }
  return <StatusPill label={po.status} variant="default" />;
};

export default function PMOrdersDashboardPage() {
  const router = useRouter();
  const { counts, filterItems, acceptQuoteAndCreatePO, getRequisitionResponses } = usePmOrders();
  const [activeStage, setActiveStage] = useState<OrderStage>("all");
  const [compareRequisition, setCompareRequisition] = useState<Requisition | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const visibleItems = filterItems(activeStage);

  const openCompare = (requisition: Requisition) => {
    setCompareRequisition(requisition);
    setCompareModalOpen(true);
  };

  const handleAcceptQuote = (reqId: string, vendorId: string) => {
    const requisition = visibleItems.find(
      (i) => i.kind === "requisition" && i.data.id === reqId
    )?.data as Requisition | undefined;
    if (!requisition) return;
    acceptQuoteAndCreatePO(requisition, vendorId);
  };

  const openVerify = () => {
    setVerifyModalOpen(true);
  };

  const renderAction = (item: OrderListItem) => {
    if (item.kind === "requisition") {
      return (
        <button
          onClick={() => openCompare(item.data)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0D1B2A] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
        >
          <Eye size={14} /> Compare Quotes
        </button>
      );
    }

    const po = item.data;
    const atSite = po.deliveryStatus === "arrived" || po.deliveryStatus === "awaiting_confirmation";
    const inTransit = po.deliveryStatus === "in_transit" || po.deliveryStatus === "dispatched";
    const delivered = po.status === "delivered" || po.deliveryStatus === "delivered";

    if (delivered) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600">
          <CheckCircle size={14} /> Completed
        </span>
      );
    }

    if (atSite) {
      return (
        <button
          onClick={openVerify}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
        >
          <ScanLine size={14} /> Verify Delivery
        </button>
      );
    }

    if (inTransit) {
      return (
        <button
          onClick={() => toast("Tracking view coming soon")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
        >
          <Truck size={14} /> Track
        </button>
      );
    }

    return (
      <button
        onClick={() => toast("Messaging driver coming soon")}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
      >
        <MessageSquare size={14} /> Message
      </button>
    );
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white py-7 px-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1B2A]">Orders Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Track requisitions, deliveries, and payments in one place.</p>
          </div>
          <button
            onClick={() => router.push("/main-dashboard/project-manager/vendors/requisitions/new")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
          >
            <Zap size={16} /> New Order
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stage Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {stageTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStage(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                activeStage === tab.value
                  ? "bg-[#0D1B2A] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab.label} {counts[tab.value] > 0 && `(${counts[tab.value]})`}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {visibleItems.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Order</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Project / Vendor</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Items</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Total</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item, idx) => (
                    <motion.tr
                      key={`${item.kind}-${item.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[#0D1B2A]">{getRowTitle(item)}</span>
                            {item.kind === "requisition" && item.data.priority === "urgent" && (
                              <StatusPill label="Urgent" variant="danger" size="sm" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">#{item.id.toUpperCase()}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{getRowSubtitle(item)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Package size={14} className="text-gray-400" />
                          {getItemCount(item)} item{getItemCount(item) !== 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-[#0D1B2A]">
                        {formatCurrency(getTotalAmount(item))}
                      </td>
                      <td className="py-4 px-4">{getStatusPill(item)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock size={14} className="text-gray-400" />
                          {getDeadline(item)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">{renderAction(item)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Truck size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-500 mb-1">No orders found</p>
            <p className="text-sm text-gray-400">Create a new order to get started</p>
          </div>
        )}
      </div>

      {/* Quote Compare Modal */}
      <QuoteCompareModal
        isOpen={compareModalOpen}
        onClose={() => {
          setCompareModalOpen(false);
          setCompareRequisition(null);
        }}
        requisition={compareRequisition}
        merchantResponses={compareRequisition ? getRequisitionResponses(compareRequisition.id) : []}
        onAcceptQuote={handleAcceptQuote}
      />

      {/* Delivery Verify Modal */}
      <DeliveryVerifyModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
      />
    </div>
  );
}
