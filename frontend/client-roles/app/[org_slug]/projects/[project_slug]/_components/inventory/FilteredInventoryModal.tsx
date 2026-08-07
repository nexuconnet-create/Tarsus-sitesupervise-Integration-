"use client";

import { useState, useMemo } from "react";
import { X, Search, Package, Wrench, Shield, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { Material, Equipment, PPE, MaterialRequest, MaterialRequestStatus } from "@/lib/types/inventory";
import StockBadge from "./StockBadge";

type FilterType =
  | "all"
  | "material"
  | "equipment"
  | "ppe"
  | "out_of_stock"
  | "critically_low"
  | "low_stock"
  | "reorder"
  | "pending_requests";

// critically_low isn't tracked as its own StockStatus value client-side — it's
// derived here from the same current/min ratio the backend uses, so this stays
// in sync with InventoryItem.inventory_status without widening StockStatus.
const isCriticallyLow = (item: Material | Equipment | PPE) =>
  item.currentStock > 0 && item.currentStock <= item.minStockLevel * 0.5;

interface FilteredInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterType: FilterType;
  items: (Material | Equipment | PPE)[];
  requests: MaterialRequest[];
  onRowClick?: (item: Material | Equipment | PPE) => void;
  onViewRequest?: (request: MaterialRequest) => void;
}

const filterConfig: Record<FilterType, { title: string; icon: React.ElementType; color: string }> = {
  all: { title: "All Items", icon: Package, color: "bg-gray-600" },
  material: { title: "Materials", icon: Package, color: "bg-blue-600" },
  equipment: { title: "Equipment", icon: Wrench, color: "bg-amber-600" },
  ppe: { title: "PPE Items", icon: Shield, color: "bg-emerald-600" },
  out_of_stock: { title: "Out of Stock", icon: AlertTriangle, color: "bg-red-600" },
  critically_low: { title: "Critically Low", icon: AlertTriangle, color: "bg-orange-600" },
  low_stock: { title: "Low Stock", icon: AlertTriangle, color: "bg-amber-600" },
  reorder: { title: "Reorder Needed", icon: AlertTriangle, color: "bg-orange-500" },
  pending_requests: { title: "Pending Requests", icon: Clock, color: "bg-purple-600" },
};

const statusStyles: Record<MaterialRequestStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", icon: <Clock className="w-3 h-3" /> },
  approved: { bg: "bg-emerald-50", text: "text-emerald-700", icon: <CheckCircle className="w-3 h-3" /> },
  delivered: { bg: "bg-sky-50", text: "text-sky-700", icon: <Package className="w-3 h-3" /> },
  rejected: { bg: "bg-rose-50", text: "text-rose-700", icon: <XCircle className="w-3 h-3" /> },
  cancelled: { bg: "bg-slate-50", text: "text-slate-600", icon: <XCircle className="w-3 h-3" /> },
};

const typeIcons: Record<string, React.ElementType> = {
  material: Package,
  equipment: Wrench,
  ppe: Shield,
};

export default function FilteredInventoryModal({
  isOpen,
  onClose,
  filterType,
  items,
  requests,
  onRowClick,
  onViewRequest,
}: FilteredInventoryModalProps) {
  const [search, setSearch] = useState("");

  const config = filterConfig[filterType];
  const Icon = config.icon;

  const filteredItems = useMemo(() => {
    let result = items;
    switch (filterType) {
      case "material":
        result = items.filter((i) => i.type === "material");
        break;
      case "equipment":
        result = items.filter((i) => i.type === "equipment");
        break;
      case "ppe":
        result = items.filter((i) => i.type === "ppe");
        break;
      case "out_of_stock":
        result = items.filter((i) => i.status === "out");
        break;
      case "critically_low":
        result = items.filter((i) => i.status === "low" && isCriticallyLow(i));
        break;
      case "low_stock":
        result = items.filter((i) => i.status === "low" && !isCriticallyLow(i));
        break;
      case "reorder":
        result = items.filter((i) => i.status === "low" || i.status === "out");
        break;
      case "pending_requests":
        result = [];
        break;
      default:
        result = items;
    }

    if (search && filterType !== "pending_requests") {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.supplier && i.supplier.toLowerCase().includes(q))
      );
    }

    return result;
  }, [items, filterType, search]);

  const filteredRequests = useMemo(() => {
    if (filterType !== "pending_requests") return [];
    let result = requests.filter((r) => r.status === "pending");
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.itemName.toLowerCase().includes(q) ||
          r.requestedByName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [requests, filterType, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${config.color} flex items-center justify-center`}>
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{config.title}</h2>
                <p className="text-xs text-gray-500">
                  {filterType === "pending_requests"
                    ? `${filteredRequests.length} pending request${filteredRequests.length !== 1 ? "s" : ""}`
                    : `${filteredItems.length} item${filteredItems.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-gray-100">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={filterType === "pending_requests" ? "Search requests..." : "Search items..."}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
            {filterType === "pending_requests" ? (
              /* ── Pending Requests Table ──────────────────────── */
              filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Clock className="w-10 h-10 mb-3" />
                  <p className="text-sm font-medium">No pending requests</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 bg-gray-100/50">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((req, idx) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-500 text-center w-12 bg-gray-50/50">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{req.itemName}</p>
                            {req.materialCode && (
                              <p className="text-xs text-gray-500 font-mono">{req.materialCode}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{req.requestedByName || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {req.quantityRequested} {req.unit || ""}
                        </td>
                        <td className="px-6 py-4">
                          {req.priority ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              req.priority === "urgent" ? "bg-rose-100 text-rose-700" :
                              req.priority === "high" ? "bg-amber-100 text-amber-700" :
                              req.priority === "medium" ? "bg-yellow-50 text-yellow-800" :
                              "bg-emerald-50 text-emerald-700"
                            }`}>
                              {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {onViewRequest && (
                            <button
                              onClick={() => onViewRequest(req)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : (
              /* ── Inventory Items Table ───────────────────────── */
              filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Package className="w-10 h-10 mb-3" />
                  <p className="text-sm font-medium">No items found</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 bg-gray-100/50">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item, idx) => {
                      const TypeIcon = typeIcons[item.type] || Package;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => onRowClick?.(item)}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-gray-500 text-center w-12 bg-gray-50/50">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <TypeIcon className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  {item.type === "material" ? "Material" : item.type === "ppe" ? "PPE" : "Equipment"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {item.type === "ppe" ? "PPE" : item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.currentStock} {item.unit}
                          </td>
                          <td className="px-6 py-4">
                            <StockBadge status={item.status} size="sm" />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.supplier || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
