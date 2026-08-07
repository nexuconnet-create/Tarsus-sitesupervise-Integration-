"use client";

import { useState, useMemo } from "react";
import {
  Eye,
  ShoppingCart,
  Calendar,
  Loader2,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import type { InventoryPO, InventoryPOStatus } from "@/lib/types/inventoryPO";
import { PO_STATUS_LABELS, canPerformPOAction } from "@/lib/types/inventoryPO";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import {
  inventoryPOFromApi,
  inventoryPOItemFromApi,
} from "@/lib/transforms/inventoryPOTransforms";
import { getErrorMessage } from "@/lib/error";
import {
  POStatusBadge,
  GRNReceiveForm,
} from "@/components/vendor-pipeline/primitives";
import type { POLineItem } from "@/components/vendor-pipeline/primitives/GRNReceiveForm";

interface POFilterState {
  searchQuery: string;
  dateAfter: string;
  dateBefore: string;
}

interface POTableProps {
  purchaseOrders: InventoryPO[];
  projectId: string;
  userRole?: string;
  canReceiveGoods?: boolean;
  onStatusChange?: (updatedPO: InventoryPO) => void;
  onViewDetails?: (po: InventoryPO) => void;
  onCreatePO?: () => void;
  filters?: POFilterState;
  onFiltersChange?: (filters: POFilterState) => void;
  page?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

type FilterValue = InventoryPOStatus | "all";

const STATUS_FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "submitted" },
  { label: "Approved", value: "approved" },
  { label: "Sent", value: "sent" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Partial", value: "partial" },
  { label: "Received", value: "received" },
  { label: "Cancelled", value: "cancelled" },
];

function ActionButton({
  label,
  onClick,
  variant = "default",
  loading,
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger" | "success" | "warning";
  loading?: boolean;
}) {
  const styles = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
  };
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={loading}
      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 ${styles[variant]}`}
    >
      {loading ? "..." : label}
    </button>
  );
}

export default function POTable({
  purchaseOrders,
  projectId,
  userRole = "",
  canReceiveGoods = false,
  onStatusChange,
  onViewDetails,
  onCreatePO,
  filters,
  onFiltersChange,
  page = 1,
  totalCount = 0,
  pageSize = 20,
  onPageChange,
}: POTableProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );

  // GRN receive modal
  const [grnModal, setGrnModal] = useState<{
    open: boolean;
    po: InventoryPO | null;
    items: POLineItem[] | "loading";
  }>({
    open: false,
    po: null,
    items: "loading",
  });

  const filteredPOs = useMemo(() => {
    if (activeFilter === "all") return purchaseOrders;
    return purchaseOrders.filter((po) => po.status === activeFilter);
  }, [purchaseOrders, activeFilter]);

  const stats = useMemo(
    () => ({
      pendingApproval: purchaseOrders.filter(
        (p) => p.status === "draft" || p.status === "submitted",
      ).length,
      active: purchaseOrders.filter((p) =>
        ["approved", "sent", "confirmed", "shipped"].includes(p.status),
      ).length,
      partial: purchaseOrders.filter((p) => p.status === "partial").length,
      received: purchaseOrders.filter((p) => p.status === "received").length,
    }),
    [purchaseOrders],
  );

  const runAction = async (
    po: InventoryPO,
    key: string,
    fn: () => Promise<{ data: unknown }>,
  ) => {
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fn();
      const updated = inventoryPOFromApi(
        res.data as Parameters<typeof inventoryPOFromApi>[0],
      );
      onStatusChange?.(updated);
      toast.success(
        `${PO_STATUS_LABELS[updated.status]} — ${updated.poNumber}`,
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const renderActions = (po: InventoryPO) => {
    const k = (suffix: string) => `${po.uuid}-${suffix}`;
    const can = (action: Parameters<typeof canPerformPOAction>[1]) => {
      if (action === "receive-delivery" && canReceiveGoods) {
        return po.status === "shipped" || po.status === "partial";
      }
      return canPerformPOAction(po.status, action, userRole);
    };

    return (
      <div className="flex items-center gap-1.5 justify-end flex-wrap">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(po);
          }}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          title="View details"
        >
          <Eye size={15} className="text-gray-500" />
        </button>

        {can("submit") && (
          <ActionButton
            label="Submit"
            variant="default"
            loading={actionLoading[k("submit")]}
            onClick={() =>
              runAction(po, k("submit"), () =>
                purchaseOrderService.submitPO(projectId, po.uuid),
              )
            }
          />
        )}
        {can("approve") && (
          <ActionButton
            label="Approve"
            variant="success"
            loading={actionLoading[k("approve")]}
            onClick={() =>
              runAction(po, k("approve"), () =>
                purchaseOrderService.approvePO(projectId, po.uuid),
              )
            }
          />
        )}
        {can("reject") && (
          <ActionButton
            label="Reject"
            variant="danger"
            loading={actionLoading[k("reject")]}
            onClick={() =>
              runAction(po, k("reject"), () =>
                purchaseOrderService.rejectPO(projectId, po.uuid),
              )
            }
          />
        )}
        {can("mark-sent") && (
          <ActionButton
            label="Mark Sent"
            variant="default"
            loading={actionLoading[k("sent")]}
            onClick={() =>
              runAction(po, k("sent"), () =>
                purchaseOrderService.markSent(projectId, po.uuid),
              )
            }
          />
        )}
        {can("confirm-vendor-receipt") && (
          <ActionButton
            label="Confirm Receipt"
            variant="default"
            loading={actionLoading[k("confirm")]}
            onClick={() =>
              runAction(po, k("confirm"), () =>
                purchaseOrderService.confirmVendorReceipt(projectId, po.uuid),
              )
            }
          />
        )}
        {can("mark-shipped") && (
          <ActionButton
            label="Mark Shipped"
            variant="warning"
            loading={actionLoading[k("shipped")]}
            onClick={() =>
              runAction(po, k("shipped"), () =>
                purchaseOrderService.markShipped(projectId, po.uuid),
              )
            }
          />
        )}
        {can("receive-delivery") && (
          <ActionButton
            label="Receive"
            variant="success"
            loading={actionLoading[k("receive")]}
            onClick={() => {
              setGrnModal({ open: true, po, items: "loading" });
              purchaseOrderService
                .listItems(projectId, po.uuid)
                .then((res) => {
                  const raw = (res.data?.results ??
                    res.data ??
                    []) as Parameters<typeof inventoryPOItemFromApi>[0][];
                  const mapped = raw.map(
                    (d: Parameters<typeof inventoryPOItemFromApi>[0]) => {
                      const item = inventoryPOItemFromApi(d);
                      return {
                        uuid: item.uuid,
                        name: item.inventoryItemName,
                        quantity: item.quantityOrdered,
                        unit: item.inventoryItemUnit,
                        unitPrice: item.unitPrice,
                      } satisfies POLineItem;
                    },
                  );
                  setGrnModal((p) => ({ ...p, items: mapped }));
                })
                .catch(() => setGrnModal((p) => ({ ...p, items: [] })));
            }}
          />
        )}
        {can("cancel") && (
          <ActionButton
            label="Cancel"
            variant="danger"
            loading={actionLoading[k("cancel")]}
            onClick={() =>
              runAction(po, k("cancel"), () =>
                purchaseOrderService.cancelPO(projectId, po.uuid),
              )
            }
          />
        )}
        {can("delete") && (
          <ActionButton
            label="Delete"
            variant="danger"
            loading={actionLoading[k("delete")]}
            onClick={() =>
              runAction(po, k("delete"), () =>
                purchaseOrderService.deletePO(projectId, po.uuid),
              )
            }
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
          <p className="text-2xl font-bold text-yellow-700">
            {stats.pendingApproval}
          </p>
          <p className="text-xs font-medium text-yellow-600">
            Pending Approval
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-2xl font-bold text-blue-700">{stats.active}</p>
          <p className="text-xs font-medium text-blue-600">Active</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
          <p className="text-2xl font-bold text-amber-700">{stats.partial}</p>
          <p className="text-xs font-medium text-amber-600">Partial Delivery</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
          <p className="text-2xl font-bold text-emerald-700">
            {stats.received}
          </p>
          <p className="text-xs font-medium text-emerald-600">Received</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeFilter === f.value
                ? "bg-[#021422] text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search + Date Filters */}
      {filters && onFiltersChange && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search PO number or supplier…"
              value={filters.searchQuery}
              onChange={(e) =>
                onFiltersChange({ ...filters, searchQuery: e.target.value })
              }
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateAfter}
              onChange={(e) =>
                onFiltersChange({ ...filters, dateAfter: e.target.value })
              }
              className="px-2 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
              title="Order date from"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={filters.dateBefore}
              onChange={(e) =>
                onFiltersChange({ ...filters, dateBefore: e.target.value })
              }
              className="px-2 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
              title="Order date to"
            />
          </div>
        </div>
      )}

      {/* Table */}
      {filteredPOs.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest w-12 bg-gray-100/50">#</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  PO Number
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Supplier
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Quantity
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Items
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Delivery Date
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.map((po, idx) => (
                <tr
                  key={po.uuid}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("button")) return;
                    onViewDetails?.(po);
                  }}
                >
                  <td className="py-3 px-4 text-sm font-semibold text-gray-500 text-center w-12 bg-gray-50/50">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#021422]">
                    {po.poNumber || "—"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {po.supplierName || "—"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                      {po.items?.length ?? po.itemsCount}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {po.items && po.items.length > 0 ? (
                      <div className="space-y-0.5">
                        {po.items.slice(0, 2).map((item) => (
                          <div
                            key={item.uuid}
                            className="text-sm text-gray-700 truncate max-w-[200px]"
                            title={item.inventoryItemName}
                          >
                            {item.inventoryItemName}
                          </div>
                        ))}
                        {po.items.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{po.items.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        {po.itemsCount} item{po.itemsCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <POStatusBadge status={po.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {po.expectedDeliveryDate
                      ? new Date(po.expectedDeliveryDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td
                    className="py-3 px-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderActions(po)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ShoppingCart size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">No purchase orders found</p>
          <p className="text-sm text-gray-400 mt-1">
            {activeFilter !== "all"
              ? `No ${PO_STATUS_LABELS[activeFilter as InventoryPOStatus]?.toLowerCase()} orders`
              : "Purchase orders will appear here once created"}
          </p>
          {onCreatePO && (
            <button
              onClick={onCreatePO}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First PO
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalCount > pageSize && onPageChange && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {Math.min((page - 1) * pageSize + 1, totalCount)}–
            {Math.min(page * pageSize, totalCount)} of {totalCount}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-xs font-medium">{page}</span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page * pageSize >= totalCount}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* GRN Receive Modal */}
      {grnModal.open && grnModal.po && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() =>
              setGrnModal({ open: false, po: null, items: "loading" })
            }
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Receive — {grnModal.po.poNumber}
              </h3>
              <button
                onClick={() =>
                  setGrnModal({ open: false, po: null, items: "loading" })
                }
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <GRNReceiveForm
              key={grnModal.po?.uuid}
              po={grnModal.po}
              projectId={projectId}
              lineItems={grnModal.items}
              onComplete={(updated) => {
                setGrnModal({ open: false, po: null, items: "loading" });
                onStatusChange?.(updated);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
