"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Inbox,
  ShoppingCart,
  Package,
  AlertTriangle,
  ArrowRight,
  Check,
  FileText,
} from "lucide-react";

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
// import { vendorService } from "@/lib/services";
import { MOCK_DASHBOARD_STATS } from "@/lib/mockData/vendor";
import VendorMetricCard from "./components/VendorMetricCard";
import VendorDashboardSection from "./components/VendorDashboardSection";
import StatusPill from "./components/StatusPill";
import type {
  Requisition,
  PurchaseOrder,
  VendorStock,
} from "@/lib/types/vendor";

export default function VendorDashboardPage() {
  const router = useRouter();
  const [loading] = useState(false);
  const vendorName = "ABC Cement Supplies";
  const stats = MOCK_DASHBOARD_STATS;

  /* â”€â”€ API version (uncomment when backend is ready) â”€â”€
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await vendorService.getDashboardStats();
      const data = res.data?.data || res.data;
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#0D1B2A]">
        <Loader2 size={28} className="animate-spin text-[#0D1B2A]" />
      </div>
    );
  }

  const openOrders = stats?.openRequisitions || [];
  const activePOs = stats?.activePurchaseOrders || [];
  const lowStock = stats?.lowStockAlerts || [];

  const priorityPill = (priority: string) => {
    const map: Record<string, "danger" | "warning" | "info" | "default"> = {
      urgent: "danger",
      high: "warning",
      medium: "info",
      low: "default",
    };
    return <StatusPill label={priority} variant={map[priority] || "default"} />;
  };

  const statusPill = (status: string) => {
    const map: Record<string, "success" | "danger" | "warning" | "info" | "default"> = {
      open: "info",
      confirmed: "success",
      in_transit: "info",
      delivered: "success",
      pending: "warning",
      cancelled: "default",
      claimed: "info",
      closed: "default",
    };
    return <StatusPill label={status.replace("_", " ")} variant={map[status] || "default"} />;
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="text-2xl font-bold text-[#0D1B2A]">
          Dashboard — {vendorName}
        </div>
        <div className="flex items-center gap-3">
          {stats?.openFeedCount ? (
            <span className="flex items-center gap-1 px-3 py-1 border border-gray-200 rounded-full text-xs font-bold text-gray-600">
              {stats.openFeedCount} open orders
            </span>
          ) : null}
          <span className="font-bold text-[#0D1B2A]">Status: Active</span>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <VendorMetricCard
            title="Active RFQs"
            value={stats?.activeQuotes ?? 0}
            icon={<FileText size={18} />}
            trend="Awaiting review"
            trendUp={false}
          />
          <VendorMetricCard
            title="RFQs Accepted"
            value={stats?.quotesAccepted ?? 0}
            icon={<Check size={18} />}
            trend="Won this month"
            trendUp={true}
          />
          <VendorMetricCard
            title="Active Orders"
            value={stats?.activeOrders ?? 0}
            icon={<ShoppingCart size={18} />}
            trend="In progress"
            trendUp={false}
          />
          <VendorMetricCard
            title="Revenue MTD"
            value={`₦${((stats?.revenue ?? 0) / 1000000).toFixed(1)}M`}
            icon={<NairaIcon size={18} />}
            trend="This month"
            trendUp={true}
          />
        </div>

        {/* Open Orders Feed */}
        <VendorDashboardSection
          title="Open Orders Feed"
          icon={<Inbox size={20} />}
          action={
            <button
              onClick={() => router.push("/main-dashboard/vendor/requisitions")}
              className="flex items-center gap-1 text-sm font-bold text-[#0D1B2A] hover:text-gray-600 transition-colors"
            >
              View Feed <ArrowRight size={16} />
            </button>
          }
        >
          {openOrders.length > 0 ? (
            <div className="space-y-3">
              {openOrders.slice(0, 3).map((req: Requisition) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-green-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-[#0D1B2A] text-sm">{req.title}</p>
                      <p className="text-xs text-gray-500">{req.projectName} — {req.items.length} items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {priorityPill(req.priority)}
                    <button
                      onClick={() => router.push("/main-dashboard/vendor/requisitions")}
                      className="px-3 py-1.5 bg-[#16A34A] text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Inbox size={32} className="mx-auto mb-2 opacity-50" />
              <p className="font-medium">No open orders right now</p>
            </div>
          )}
        </VendorDashboardSection>

        {/* Active Purchase Orders */}
        <VendorDashboardSection
          title="Active Purchase Orders"
          icon={<ShoppingCart size={20} />}
          action={
            <button
              onClick={() => router.push("/main-dashboard/vendor/purchase-orders")}
              className="flex items-center gap-1 text-sm font-bold text-[#0D1B2A] hover:text-gray-600 transition-colors"
            >
              View All <ArrowRight size={16} />
            </button>
          }
        >
          {activePOs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">PO #</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Project</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Total</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {activePOs.map((po: PurchaseOrder) => (
                    <tr key={po.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-[#0D1B2A]">{po.poNumber}</td>
                      <td className="py-3 px-4 text-gray-600">{po.projectName || po.projectId}</td>
                      <td className="py-3 px-4 font-bold text-[#0D1B2A]">₦{po.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4">{statusPill(po.status)}</td>
                      <td className="py-3 px-4 text-gray-500">
                        {po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
              <p className="font-medium">No active purchase orders</p>
            </div>
          )}
        </VendorDashboardSection>

        {/* Low Stock Alerts */}
        <VendorDashboardSection
          title="Low Stock Alerts"
          icon={<AlertTriangle size={20} />}
          action={
            <button
              onClick={() => router.push("/main-dashboard/vendor/stock")}
              className="flex items-center gap-1 text-sm font-bold text-[#0D1B2A] hover:text-gray-600 transition-colors"
            >
              Manage Stock <ArrowRight size={16} />
            </button>
          }
        >
          {lowStock.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-right py-2.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Current Stock</th>
                    <th className="text-right py-2.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Min Order</th>
                    <th className="text-right py-2.5 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((item: VendorStock) => (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className="text-red-500 shrink-0" />
                          <span className="font-medium text-[#0D1B2A]">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{item.category}</td>
                      <td className="py-3 px-4 text-right font-bold text-red-600">{item.quantity} {item.unit}</td>
                      <td className="py-3 px-4 text-right text-gray-500">{item.minOrderQty} {item.unit}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => router.push("/main-dashboard/vendor/stock")}
                          className="text-xs font-bold text-[#0D1B2A] hover:text-gray-600 transition-colors"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Package size={32} className="mx-auto mb-2 opacity-50" />
              <p className="font-medium">All stock levels are healthy</p>
            </div>
          )}
        </VendorDashboardSection>
      </div>
    </div>
  );
}
