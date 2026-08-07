"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, RefreshCw, Plus } from "lucide-react";
import toast from "react-hot-toast";
import type { PurchaseOrderChange, PurchaseOrderChangeStatus } from "@/lib/types/purchaseOrderChange";
import {
  PO_CHANGE_STATUS_LABELS,
  PO_CHANGE_STATUS_STYLES,
  canPerformChangeAction,
} from "@/lib/types/purchaseOrderChange";
import { purchaseOrderChangeService } from "@/lib/services/purchaseOrderChangeService";
import { purchaseOrderChangeFromApi } from "@/lib/transforms/purchaseOrderChangeTransforms";
import { getErrorMessage } from "@/lib/error";
import ChangeOrderDetailDrawer from "./ChangeOrderDetailDrawer";

interface ChangeOrderTableProps {
  changeOrders: PurchaseOrderChange[];
  projectId: string;
  poId: string;
  userRole: string;
  onStatusChange: (updated: PurchaseOrderChange) => void;
  onCreate: () => void;
}

const STATUS_FILTERS: { label: string; value: PurchaseOrderChangeStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Approved", value: "approved" },
  { label: "Applied", value: "applied" },
  { label: "Rejected", value: "rejected" },
];

const statusBadge = (status: PurchaseOrderChangeStatus) => {
  const style = PO_CHANGE_STATUS_STYLES[status] || { bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
      {PO_CHANGE_STATUS_LABELS[status]}
    </span>
  );
};

export default function ChangeOrderTable({
  changeOrders,
  projectId,
  poId,
  userRole,
  onStatusChange,
  onCreate,
}: ChangeOrderTableProps) {
  const [activeFilter, setActiveFilter] = useState<PurchaseOrderChangeStatus | "all">("all");
  const [selectedCO, setSelectedCO] = useState<PurchaseOrderChange | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filtered = useMemo(
    () => (activeFilter === "all" ? changeOrders : changeOrders.filter((co) => co.status === activeFilter)),
    [changeOrders, activeFilter],
  );

  const stats = useMemo(
    () => ({
      draft: changeOrders.filter((co) => co.status === "draft").length,
      submitted: changeOrders.filter((co) => co.status === "submitted").length,
      approved: changeOrders.filter((co) => co.status === "approved").length,
      applied: changeOrders.filter((co) => co.status === "applied").length,
      rejected: changeOrders.filter((co) => co.status === "rejected").length,
    }),
    [changeOrders],
  );

  const runAction = async (
    change: PurchaseOrderChange,
    key: string,
    fn: () => Promise<{ data: unknown }>,
  ) => {
    setActionLoading(key);
    try {
      const res = await fn();
      const updated = purchaseOrderChangeFromApi(
        (res.data as { data?: unknown })?.data ?? res.data as Parameters<typeof purchaseOrderChangeFromApi>[0],
      );
      onStatusChange(updated);
      toast.success(`${updated.changeNumber} → ${PO_CHANGE_STATUS_LABELS[updated.status]}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const renderActions = (co: PurchaseOrderChange) => {
    const k = (suffix: string) => `${co.uuid}-${suffix}`;
    const isLoading = (key: string) => actionLoading === key;

    return (
      <div className="flex items-center gap-1 justify-end">
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedCO(co); setDrawerOpen(true); }}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          title="View details"
        >
          <Eye size={14} className="text-gray-500" />
        </button>

        {canPerformChangeAction(co.status, "submit", userRole) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              runAction(co, k("submit"), () => purchaseOrderChangeService.submitChange(projectId, poId, co.uuid));
            }}
            disabled={isLoading(k("submit"))}
            className="px-2 py-1 text-[10px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading(k("submit")) ? "…" : "Submit"}
          </button>
        )}

        {canPerformChangeAction(co.status, "approve", userRole) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              runAction(co, k("approve"), () => purchaseOrderChangeService.approveChange(projectId, poId, co.uuid));
            }}
            disabled={isLoading(k("approve"))}
            className="px-2 py-1 text-[10px] font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            {isLoading(k("approve")) ? "…" : "Approve"}
          </button>
        )}

        {canPerformChangeAction(co.status, "reject", userRole) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              runAction(co, k("reject"), () => purchaseOrderChangeService.rejectChange(projectId, poId, co.uuid));
            }}
            disabled={isLoading(k("reject"))}
            className="px-2 py-1 text-[10px] font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading(k("reject")) ? "…" : "Reject"}
          </button>
        )}

        {canPerformChangeAction(co.status, "apply", userRole) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCO(co);
              setDrawerOpen(true);
            }}
            className="px-2 py-1 text-[10px] font-medium text-white bg-amber-600 rounded hover:bg-amber-700"
          >
            Apply
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        {(["draft", "submitted", "approved", "applied", "rejected"] as PurchaseOrderChangeStatus[]).map((s) => (
          <div key={s} className={`${PO_CHANGE_STATUS_STYLES[s].bg} border border-gray-200 rounded-lg p-2 text-center`}>
            <p className={`text-lg font-bold ${PO_CHANGE_STATUS_STYLES[s].text}`}>{stats[s]}</p>
            <p className="text-[10px] font-medium text-gray-500">{PO_CHANGE_STATUS_LABELS[s]}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeFilter === tab.value
                ? "bg-[#021422] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-2.5 px-3 font-medium text-gray-500 uppercase tracking-wider">Change #</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-right py-2.5 px-3 font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((co, idx) => (
                <motion.tr
                  key={co.uuid}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => { setSelectedCO(co); setDrawerOpen(true); }}
                >
                  <td className="py-2.5 px-3 font-mono font-medium text-[#021422]">
                    {co.changeNumber}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 max-w-[200px] truncate">
                    {co.reason}
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-500">
                    {co.items.length}
                  </td>
                  <td className="py-2.5 px-3 text-center">{statusBadge(co.status)}</td>
                  <td className="py-2.5 px-3 text-gray-500">
                    {new Date(co.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                    {renderActions(co)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 py-12 text-center">
          <RefreshCw size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500 mb-1">No change orders</p>
          <p className="text-xs text-gray-400 mb-4">
            Raise a change order when you need to modify this purchase order
          </p>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
          >
            <Plus size={14} />
            New Change Order
          </button>
        </div>
      )}

      {/* Detail Drawer */}
      <ChangeOrderDetailDrawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedCO(null); }}
        changeOrder={selectedCO}
        projectId={projectId}
        poId={poId}
        userRole={userRole}
        onStatusChange={(updated) => {
          onStatusChange(updated);
          setDrawerOpen(false);
          setSelectedCO(null);
        }}
      />
    </div>
  );
}
