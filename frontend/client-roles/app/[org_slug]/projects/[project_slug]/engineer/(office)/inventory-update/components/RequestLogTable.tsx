"use client";

import { useState, useMemo } from "react";
import { Eye, Clock, CheckCircle, XCircle, Package, ShoppingCart, ExternalLink } from "lucide-react";
import type { MaterialRequest, MaterialRequestStatus } from "@/lib/types/inventory";
import { MATERIAL_REQUEST_STATUS_LABELS, MATERIAL_REQUEST_PRIORITY_LABELS } from "@/lib/types/inventory";

interface RequestLogTableProps {
  requests: MaterialRequest[];
  onViewDetails?: (request: MaterialRequest) => void;
  onApprove?: (request: MaterialRequest) => void;
  onReject?: (request: MaterialRequest) => void;
  onEdit?: (request: MaterialRequest) => void;
  onDelete?: (request: MaterialRequest) => void;
  onCreatePO?: (request: MaterialRequest) => void;
  onViewPO?: (request: MaterialRequest) => void;
  canApprove?: boolean;
  currentUserId?: string;
}

const STATUS_FILTERS: { label: string; value: MaterialRequestStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Delivered", value: "delivered" },
  { label: "Rejected", value: "rejected" },
];

const statusStyles: Record<MaterialRequestStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: <Clock className="w-3 h-3" />,
  },
  approved: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  delivered: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    icon: <Package className="w-3 h-3" />,
  },
  rejected: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    icon: <XCircle className="w-3 h-3" />,
  },
  cancelled: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const priorityStyles: Record<string, string> = {
  urgent: "bg-rose-100 text-rose-700",
  high: "bg-amber-100 text-amber-700",
  medium: "bg-yellow-50 text-yellow-800",
  low: "bg-emerald-50 text-emerald-700",
};

export default function RequestLogTable({
  requests,
  onViewDetails,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onCreatePO,
  onViewPO,
  canApprove = false,
  currentUserId,
}: RequestLogTableProps) {
  const [activeFilter, setActiveFilter] = useState<MaterialRequestStatus | "all">("all");
  
  const filteredRequests = useMemo(() => {
    if (activeFilter === "all") return requests;
    return requests.filter((req) => req.status === activeFilter);
  }, [requests, activeFilter]);
  
  const stats = useMemo(() => {
    return {
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
      delivered: requests.filter((r) => r.status === "delivered").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    };
  }, [requests]);

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
          <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
          <p className="text-xs font-medium text-amber-600">Pending</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
          <p className="text-2xl font-bold text-emerald-700">{stats.approved}</p>
          <p className="text-xs font-medium text-emerald-600">Approved</p>
        </div>
        <div className="bg-sky-50 rounded-lg p-3 border border-sky-100">
          <p className="text-2xl font-bold text-sky-700">{stats.delivered}</p>
          <p className="text-xs font-medium text-sky-600">Delivered</p>
        </div>
        <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
          <p className="text-2xl font-bold text-rose-700">{stats.rejected}</p>
          <p className="text-xs font-medium text-rose-600">Rejected</p>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter.value
                ? "bg-[#021422] text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      
      {/* Table */}
      {filteredRequests.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest w-12 bg-gray-100/50">#</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Request
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Quantity
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Priority
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
              {filteredRequests.map((request, idx) => {
                const statusStyle = statusStyles[request.status];
                return (
                  <tr
                    key={request.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("button")) return;
                      onViewDetails?.(request);
                    }}
                  >
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500 text-center w-12 bg-gray-50/50">
                      {idx + 1}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-[#021422]">{request.itemName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {request.requestedByName}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {request.quantityRequested}{request.unit ? ` ${request.unit}` : ""}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityStyles[request.priority || "medium"]}`}>
                        {request.priority ? MATERIAL_REQUEST_PRIORITY_LABELS[request.priority] : "Medium"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.icon}
                        {MATERIAL_REQUEST_STATUS_LABELS[request.status]}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {onApprove && request.status === "pending" && canApprove && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onApprove(request);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>
                        )}
                        {onReject && request.status === "pending" && canApprove && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onReject(request);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        )}
                        {onEdit && request.status === "pending" && currentUserId === request.requestedBy && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit?.(request);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                        )}
                        {onDelete && request.status === "pending" && currentUserId === request.requestedBy && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete?.(request);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16m0 0H2" />
                            </svg>
                            Delete
                          </button>
                        )}
                        {onCreatePO && request.status === "approved" && !request.hasPo && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreatePO(request);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <ShoppingCart size={14} />
                            Create PO
                          </button>
                        )}
                        {onViewPO && request.hasPo && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewPO(request);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <ExternalLink size={14} />
                            View PO
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails?.(request);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">No requests found</p>
          <p className="text-sm text-gray-400 mt-1">
            {activeFilter !== "all"
              ? `No ${activeFilter} requests`
              : "Create a new request using the button above"}
          </p>
        </div>
      )}
    </div>
  );
}