"use client";

import {
  X,
  ClipboardCheck,
  User,
  Calendar,
  ImageIcon,
  FileText,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Send,
  ShieldCheck,
  Ban,
} from "lucide-react";
import type { StockCount, StockCountStatus } from "@/lib/types/inventory";

interface StockCountDetailDrawerProps {
  count: StockCount | null;
  isOpen: boolean;
  onClose: () => void;
  canApprove: boolean;
  actionLoadingId: string | null;
  onSubmit: (id: string) => void;
  onVerify: (id: string) => void;
  onApply: (id: string) => void;
  onVoid: (id: string) => void;
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </h4>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-900 text-right font-medium">{value}</span>
    </div>
  );
}

export default function StockCountDetailDrawer({
  count,
  isOpen,
  onClose,
  canApprove,
  actionLoadingId,
  onSubmit,
  onVerify,
  onApply,
  onVoid,
}: StockCountDetailDrawerProps) {
  if (!isOpen || !count) return null;

  const variance = count.variance;
  const variancePct =
    count.expectedQuantity !== 0
      ? (variance / count.expectedQuantity) * 100
      : 0;
  const isNeg = variance < 0;
  const isZero = variance === 0;
  const varianceColor = isZero
    ? "text-green-600"
    : isNeg
      ? "text-red-600"
      : "text-amber-600";

  const statusCfg = STATUS_CONFIG[count.status];
  const isActioning = actionLoadingId === count.id;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClipboardCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Stock Count
              </h2>
              <p className="text-xs text-gray-500">{count.inventoryItem.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}
            >
              {statusCfg.label}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Count Summary */}
          <Section title="Count Summary">
            <Row label="Count Date" value={formatDate(count.countDate)} />
            <Row
              label="Expected Qty"
              value={`${count.expectedQuantity.toFixed(2)} ${count.inventoryItem.unit}`}
            />
            <Row
              label="Actual Qty"
              value={`${count.actualQuantity.toFixed(2)} ${count.inventoryItem.unit}`}
            />
            <Row
              label="Variance"
              value={
                <span className={varianceColor}>
                  {variance > 0 ? "+" : ""}
                  {variance.toFixed(2)} {count.inventoryItem.unit}{" "}
                  <span className="text-xs font-normal">
                    ({variancePct > 0 ? "+" : ""}
                    {variancePct.toFixed(1)}%)
                  </span>
                </span>
              }
            />
            {Math.abs(variancePct) > 10 && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                {isNeg ? (
                  <TrendingDown className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <TrendingUp className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                Large gap detected — a manager must verify this before stock is updated.
              </div>
            )}
          </Section>

          {/* People */}
          <Section title="People">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Counted by</p>
                <p className="font-medium text-gray-900">{count.countedBy}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Verified by</p>
                <p className="font-medium text-gray-900">
                  {count.verifiedBy ?? "Pending"}
                </p>
              </div>
            </div>
          </Section>

          {/* Photo */}
          {count.imageUrl && (
            <Section title="Verification Photo">
              <a
                href={count.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={count.imageUrl}
                  alt="Stock count verification"
                  className="w-full object-cover max-h-48"
                />
              </a>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <ImageIcon className="w-3 h-3" />
                Click to open full size
              </p>
            </Section>
          )}

          {/* Notes */}
          {count.notes && (
            <Section title="Notes">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{count.notes}</p>
              </div>
            </Section>
          )}

          {/* Adjustment Record */}
          {count.adjustment && (
            <Section title="Stock Adjustment">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Applied — inventory updated
                </div>
                <Row
                  label="Previous stock"
                  value={`${count.adjustment.previousQuantity.toFixed(2)} ${count.inventoryItem.unit}`}
                />
                <Row
                  label="New stock"
                  value={`${count.adjustment.newQuantity.toFixed(2)} ${count.inventoryItem.unit}`}
                />
                <Row
                  label="Adjustment"
                  value={
                    <span className={varianceColor}>
                      {count.adjustment.adjustmentQuantity > 0 ? "+" : ""}
                      {count.adjustment.adjustmentQuantity.toFixed(2)}{" "}
                      {count.inventoryItem.unit}
                    </span>
                  }
                />
                <Row
                  label="Applied by"
                  value={count.adjustment.createdBy}
                />
                {count.appliedAt && (
                  <Row
                    label="Applied at"
                    value={formatDateTime(count.appliedAt)}
                  />
                )}
              </div>
            </Section>
          )}

          {/* Timestamps */}
          <Section title="Timeline">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Created {formatDateTime(count.createdAt)}</span>
            </div>
            {count.updatedAt !== count.createdAt && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Updated {formatDateTime(count.updatedAt)}</span>
              </div>
            )}
          </Section>
        </div>

        {/* Footer — lifecycle actions */}
        {count.status !== "applied" && count.status !== "voided" && (
          <div className="border-t border-gray-200 px-6 py-4 shrink-0 flex items-center justify-end gap-2">
            {isActioning && (
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-auto" />
            )}

            {count.status === "draft" && (
              <button
                onClick={() => onSubmit(count.id)}
                disabled={isActioning}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit for Review
              </button>
            )}

            {canApprove && count.status === "submitted" && (
              <button
                onClick={() => onVerify(count.id)}
                disabled={isActioning}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Verify
              </button>
            )}

            {canApprove && count.status === "verified" && (
              <button
                onClick={() => onApply(count.id)}
                disabled={isActioning}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Apply to Inventory
              </button>
            )}

            {canApprove && (
              <button
                onClick={() => onVoid(count.id)}
                disabled={isActioning}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                <Ban className="w-4 h-4" />
                Void
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
