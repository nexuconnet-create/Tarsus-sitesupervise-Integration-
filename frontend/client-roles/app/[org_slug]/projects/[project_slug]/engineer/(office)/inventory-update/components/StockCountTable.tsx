"use client";

import { ClipboardCheck, Eye, CheckCircle, ShieldCheck, Ban, Send } from "lucide-react";
import type { StockCount, StockCountStatus } from "@/lib/types/inventory";

interface StockCountTableProps {
  counts: StockCount[];
  canApprove: boolean;
  actionLoadingId: string | null;
  onSubmit: (id: string) => void;
  onVerify: (id: string) => void;
  onApply: (id: string) => void;
  onVoid: (id: string) => void;
  onView: (count: StockCount) => void;
}

const STATUS_CONFIG: Record<
  StockCountStatus,
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  submitted: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
  verified: { label: "Verified", className: "bg-purple-100 text-purple-700" },
  applied: { label: "Applied", className: "bg-green-100 text-green-700" },
  voided: { label: "Voided", className: "bg-red-100 text-red-700" },
};

function StatusBadge({ status }: { status: StockCountStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}


export default function StockCountTable({
  counts,
  canApprove,
  actionLoadingId,
  onSubmit,
  onVerify,
  onApply,
  onVoid,
  onView,
}: StockCountTableProps) {
  if (counts.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
        <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No stock counts yet.</p>
        <p className="text-gray-400 text-sm mt-1">
          Click &ldquo;New Count&rdquo; to record your first physical inventory count.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-12 bg-gray-100/50">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Item</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Count Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Expected</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actual</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Counted By</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {counts.map((count, idx) => {
              const isActioning = actionLoadingId === count.id;
              return (
                <tr key={count.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-500 text-center w-12 bg-gray-50/50">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {count.inventoryItem.name}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {count.inventoryItem.itemType}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(count.countDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {count.expectedQuantity.toFixed(2)}{" "}
                    <span className="text-gray-400 text-xs">
                      {count.inventoryItem.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {count.actualQuantity.toFixed(2)}{" "}
                    <span className="text-gray-400 text-xs">
                      {count.inventoryItem.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={count.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {count.countedBy}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onView(count)}
                        title="View details"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {count.status === "draft" && (
                        <button
                          onClick={() => onSubmit(count.id)}
                          disabled={isActioning}
                          title="Submit for review"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}

                      {canApprove && count.status === "submitted" && (
                        <button
                          onClick={() => onVerify(count.id)}
                          disabled={isActioning}
                          title="Verify"
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}

                      {canApprove && count.status === "verified" && (
                        <button
                          onClick={() => onApply(count.id)}
                          disabled={isActioning}
                          title="Apply to inventory"
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      {canApprove &&
                        count.status !== "applied" &&
                        count.status !== "voided" && (
                          <button
                            onClick={() => onVoid(count.id)}
                            disabled={isActioning}
                            title="Void"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                      {isActioning && (
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
