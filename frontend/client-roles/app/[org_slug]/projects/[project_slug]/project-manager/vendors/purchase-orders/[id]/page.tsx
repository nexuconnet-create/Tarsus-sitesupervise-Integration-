"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ChevronLeft,
  Package,
  Calendar,
  Building2,
  Check,
  Plus,
  Trash2,
  XCircle,
  Copy,
  Truck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import { inventoryService } from "@/lib/services/inventoryService";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { getErrorMessage } from "@/lib/error";
import type { InventoryPOStatus } from "@/lib/types/inventoryPO";
import { inventoryPOFromApi } from "@/lib/transforms/inventoryPOTransforms";
import {
  Field,
  FieldGrid,
  SectionCard,
  formatDate,
  POStatusTimeline,
  POStatusBadge,
  QRCodeDisplay,
  GRNReceiveForm,
} from "@/components/vendor-pipeline/primitives";
import type { StepDef } from "@/components/vendor-pipeline/primitives/POStatusTimeline";
import type { POLineItem } from "@/components/vendor-pipeline/primitives/GRNReceiveForm";

interface POItem {
  uuid: string;
  id?: string;
  inventory_item_uuid: string;
  inventory_item_id?: string;
  inventory_item_name: string;
  quantity_ordered: string;
  unit_price: string;
  notes?: string;
}

interface BackendPO {
  uuid: string;
  id?: string;
  po_number: string;
  supplier: {
    uuid?: string;
    id?: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  project: { uuid?: string; id?: string; name: string };
  status: InventoryPOStatus;
  order_date: string;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  total_amount: string;
  created_by: {
    uuid?: string;
    id?: string;
    fullname: string;
    email: string;
  } | null;
  approved_by: { uuid?: string; id?: string; fullname: string } | null;
  notes?: string;
  items: POItem[];
}

interface InventoryOption {
  uuid: string;
  name: string;
  unit: string;
}

const STEPS: StepDef[] = [
  { key: "draft", label: "Draft" },
  { key: "submitted", label: "Submitted" },
  { key: "approved", label: "Approved" },
  { key: "sent", label: "Sent" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "received", label: "Received" },
];

const STEP_ORDER = STEPS.map((s) => s.key);

const statusRank: Record<InventoryPOStatus, number> = {
  draft: 0,
  submitted: 1,
  approved: 2,
  sent: 3,
  confirmed: 4,
  shipped: 5,
  partial: 5.5,
  received: 6,
  cancelled: -1,
  rejected: -1,
};

export default function PMPODetailPage() {
  const params = useParams();
  const router = useRouter();
  const poId = params.id as string;
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const { data: projectId } = useProjectUuid(orgSlug, projectSlug);

  const [loading, setLoading] = useState(true);
  const [po, setPo] = useState<BackendPO | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showGRN, setShowGRN] = useState(false);
  const [grnPO, setGrnPO] = useState<ReturnType<
    typeof inventoryPOFromApi
  > | null>(null);

  // Add item form state
  const [showAddItem, setShowAddItem] = useState(false);
  const [inventoryOptions, setInventoryOptions] = useState<InventoryOption[]>(
    [],
  );
  const [addItemForm, setAddItemForm] = useState({
    inventory_item_id: "",
    quantity: "",
    unit_price: "",
    notes: "",
  });
  const [addingItem, setAddingItem] = useState(false);

  const fetchPO = useCallback(async () => {
    if (!projectId || !poId) return;
    try {
      const res = await purchaseOrderService.getPO(projectId, poId);
      setPo(res.data as BackendPO);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [projectId, poId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPO();
  }, [fetchPO]);

  const runTransition = async (
    label: string,
    action: () => Promise<unknown>,
  ) => {
    setActionLoading(label);
    try {
      await action();
      await fetchPO();
      toast.success(`${label} successful`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleLoadInventory = async () => {
    if (inventoryOptions.length > 0) {
      setShowAddItem(true);
      return;
    }
    try {
      const res = await inventoryService.listInventory(projectId);
      const items = res.data?.results ?? [];
      setInventoryOptions(
        items.map((i: { id?: string; name?: string; unit?: string }) => ({
          uuid: i.id ?? "",
          name: i.name ?? "",
          unit: i.unit ?? "",
        })),
      );
    } catch {
      toast.error("Failed to load inventory items");
    }
    setShowAddItem(true);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !addItemForm.inventory_item_id ||
      !addItemForm.quantity ||
      !addItemForm.unit_price
    )
      return;
    setAddingItem(true);
    try {
      await purchaseOrderService.addItem(projectId, poId, {
        inventory_item_id: addItemForm.inventory_item_id,
        quantity: addItemForm.quantity,
        unit_price: addItemForm.unit_price,
        notes: addItemForm.notes || undefined,
      });
      setAddItemForm({
        inventory_item_id: "",
        quantity: "",
        unit_price: "",
        notes: "",
      });
      setShowAddItem(false);
      await fetchPO();
      toast.success("Item added");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingItem(false);
    }
  };

  const handleRemoveItem = async (itemUuid: string) => {
    if (!confirm("Remove this item from the PO?")) return;
    try {
      await purchaseOrderService.removeItem(projectId, poId, itemUuid);
      await fetchPO();
      toast.success("Item removed");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCopyCode = async () => {
    if (!po?.po_number) return;
    try {
      await navigator.clipboard.writeText(po.po_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#0166B0]" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#021422]">
        <p className="font-bold mb-4">Purchase Order not found</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-[#0166B0] underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const currentStepIndex =
    po.status === "partial"
      ? STEP_ORDER.indexOf("shipped")
      : STEP_ORDER.indexOf(po.status);
  const isDraft = po.status === "draft";
  const isCancelled = po.status === "cancelled";
  const isTerminal = po.status === "cancelled" || po.status === "rejected";
  const showDeliveryTimeline = statusRank[po.status] >= 5 && !isTerminal;

  const verificationUrl =
    orgSlug && projectSlug && po.uuid
      ? `/${orgSlug}/projects/${projectSlug}/po-verify/${po.uuid}`
      : null;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="text-2xl font-bold text-[#021422]">
            {po.po_number}
          </div>
          <POStatusBadge status={po.status} />
        </div>

        {/* Cancel / Delete actions */}
        <div className="flex gap-2">
          {isDraft && (
            <button
              onClick={() =>
                runTransition("Delete", () =>
                  purchaseOrderService
                    .deletePO(projectId, poId)
                    .then(() => router.back()),
                )
              }
              disabled={!!actionLoading}
              className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} />
              Delete Draft
            </button>
          )}
          {!isCancelled &&
            !["shipped", "received", "cancelled", "rejected"].includes(
              po.status,
            ) && (
              <button
                onClick={() =>
                  runTransition("Cancel", () =>
                    purchaseOrderService.cancelPO(projectId, poId),
                  )
                }
                disabled={!!actionLoading}
                className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <XCircle size={14} />
                Cancel PO
              </button>
            )}
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto space-y-8">
        {/* Status Timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">
              Status Timeline
            </h3>
            <POStatusTimeline
              steps={STEPS}
              currentStepIndex={currentStepIndex}
              isTerminal={isTerminal}
            />

            {/* Transition actions */}
            <div className="mt-6 flex gap-3 flex-wrap">
              {po.status === "draft" && (
                <button
                  onClick={() =>
                    runTransition("Submit", () =>
                      purchaseOrderService.submitPO(projectId, poId),
                    )
                  }
                  disabled={!!actionLoading || po.items.length === 0}
                  className="flex items-center gap-2 bg-[#021422] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  title={
                    po.items.length === 0
                      ? "Add at least one item before submitting"
                      : undefined
                  }
                >
                  {actionLoading === "Submit" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Submit for Approval
                </button>
              )}
              {po.status === "submitted" && (
                <>
                  <button
                    onClick={() =>
                      runTransition("Approve", () =>
                        purchaseOrderService.approvePO(projectId, poId),
                      )
                    }
                    disabled={!!actionLoading}
                    className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === "Approve" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      runTransition("Reject", () =>
                        purchaseOrderService.rejectPO(projectId, poId),
                      )
                    }
                    disabled={!!actionLoading}
                    className="flex items-center gap-2 border border-red-200 text-red-600 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === "Reject" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <XCircle size={14} />
                    )}
                    Reject (back to Draft)
                  </button>
                </>
              )}
              {po.status === "approved" && (
                <button
                  onClick={() =>
                    runTransition("Mark Sent", () =>
                      purchaseOrderService.markSent(projectId, poId),
                    )
                  }
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === "Mark Sent" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Mark as Sent to Supplier
                </button>
              )}
              {po.status === "sent" && (
                <button
                  onClick={() =>
                    runTransition("Confirm Receipt", () =>
                      purchaseOrderService.confirmVendorReceipt(
                        projectId,
                        poId,
                      ),
                    )
                  }
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === "Confirm Receipt" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Confirm Vendor Receipt
                </button>
              )}
              {po.status === "confirmed" && (
                <button
                  onClick={() =>
                    runTransition("Mark Shipped", () =>
                      purchaseOrderService.markShipped(projectId, poId),
                    )
                  }
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === "Mark Shipped" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Mark as Shipped
                </button>
              )}
              {(po.status === "shipped" || po.status === "partial") && (
                <button
                  onClick={async () => {
                    const mapped: ReturnType<typeof inventoryPOFromApi> =
                      inventoryPOFromApi({
                        id: po.uuid,
                        po_number: po.po_number,
                        supplier: po.supplier
                          ? {
                              id: po.supplier.uuid || po.supplier.id,
                              name: po.supplier.name,
                            }
                          : null,
                        status: po.status,
                        order_date: po.order_date,
                        expected_delivery_date:
                          po.expected_delivery_date ?? undefined,
                        actual_delivery_date:
                          po.actual_delivery_date ?? undefined,
                        total_amount: po.total_amount,
                        created_by: po.created_by,
                        approved_by: po.approved_by,
                        notes: po.notes,
                        items_count: po.items.length,
                        items: po.items,
                        created_at: "",
                        updated_at: "",
                      });
                    setGrnPO(mapped);
                    setShowGRN(true);
                  }}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {po.status === "partial"
                    ? "Complete Delivery"
                    : "Record Delivery"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Order Details */}
        <SectionCard
          title="Order Details"
          icon={Building2}
          accentColor="bg-blue-500"
        >
          <FieldGrid>
            <Field label="Supplier" value={po.supplier?.name ?? "—"} />
            <Field label="Project" value={po.project.name} />
            <Field
              label="Order Date"
              value={po.order_date ? formatDate(po.order_date) : "—"}
            />
            <Field
              label="Expected Delivery"
              value={
                po.expected_delivery_date
                  ? formatDate(po.expected_delivery_date)
                  : "—"
              }
            />
            {po.actual_delivery_date && (
              <Field
                label="Delivered"
                value={formatDate(po.actual_delivery_date)}
              />
            )}
            <Field label="Created By" value={po.created_by?.fullname ?? "—"} />
            {po.approved_by && (
              <Field label="Approved By" value={po.approved_by.fullname} />
            )}
          </FieldGrid>
        </SectionCard>

        {/* Delivery Ticket Section */}
        <SectionCard
          title="Delivery Ticket"
          icon={Truck}
          accentColor="bg-amber-500"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Delivery Code
                </p>
                <p className="text-xl font-bold text-[#021422] tracking-wider font-mono mt-0.5">
                  {po.po_number || "—"}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Truck size={14} />
              {showQR ? "Hide QR Code" : "Show QR Code for printing"}
            </button>

            {showQR && verificationUrl && (
              <QRCodeDisplay
                value={verificationUrl}
                poNumber={po.po_number}
                size={160}
                showPrint
              />
            )}

            <p className="text-[10px] text-gray-400 leading-snug">
              Give this code to the driver. The site supervisor enters this code
              or scans the QR to verify delivery.
            </p>
          </div>
        </SectionCard>

        {/* Delivery Timeline */}
        {showDeliveryTimeline && (
          <SectionCard
            title="Delivery Progress"
            icon={Truck}
            accentColor="bg-orange-500"
          >
            <div className="space-y-0">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${statusRank[po.status] >= 5 ? "bg-emerald-500" : "bg-gray-200"} ring-2 ${statusRank[po.status] >= 5 ? "ring-emerald-200" : "ring-gray-100"}`}
                  />
                  <div className="w-0.5 h-8 bg-gray-200" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-gray-900">
                    Shipped from Supplier
                  </p>
                  <p className="text-xs text-gray-400">
                    The supplier has dispatched the order
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${statusRank[po.status] >= 6 ? "bg-emerald-500" : statusRank[po.status] >= 5 ? "bg-gray-200" : "bg-gray-200"} ring-2 ${statusRank[po.status] >= 6 ? "ring-emerald-200" : "ring-gray-100"}`}
                  />
                  <div className="w-0.5 h-8 bg-gray-200" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-gray-900">
                    In Transit
                  </p>
                  <p className="text-xs text-gray-400">
                    Materials on the way to site
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${po.status === "received" ? "bg-emerald-500" : "bg-gray-200"} ring-2 ${po.status === "received" ? "ring-emerald-200" : "ring-gray-100"}`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Received on Site
                  </p>
                  <p className="text-xs text-gray-400">
                    {po.actual_delivery_date
                      ? `Arrived ${formatDate(po.actual_delivery_date)}`
                      : "Awaiting arrival"}
                  </p>
                  {po.status === "partial" && (
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Partial delivery — more expected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Line Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Package size={14} /> Line Items
            </h3>
            {isDraft && (
              <button
                onClick={handleLoadInventory}
                className="flex items-center gap-2 text-sm font-bold text-[#0166B0] hover:underline"
              >
                <Plus size={14} />
                Add Item
              </button>
            )}
          </div>

          {/* Add item form */}
          {showAddItem && isDraft && (
            <form
              onSubmit={handleAddItem}
              className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3 border border-gray-200"
            >
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Inventory Item
                </label>
                <select
                  value={addItemForm.inventory_item_id}
                  onChange={(e) =>
                    setAddItemForm((p) => ({
                      ...p,
                      inventory_item_id: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0166B0]"
                  required
                >
                  <option value="">Select an item...</option>
                  {inventoryOptions.map((opt) => (
                    <option key={opt.uuid} value={opt.uuid}>
                      {opt.name} ({opt.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={addItemForm.quantity}
                    onChange={(e) =>
                      setAddItemForm((p) => ({
                        ...p,
                        quantity: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0166B0]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Unit Price (₦)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={addItemForm.unit_price}
                    onChange={(e) =>
                      setAddItemForm((p) => ({
                        ...p,
                        unit_price: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0166B0]"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="flex-1 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingItem}
                  className="flex-1 bg-[#021422] text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addingItem && <Loader2 size={12} className="animate-spin" />}
                  Add
                </button>
              </div>
            </form>
          )}

          {po.items.length > 0 ? (
            <div className="space-y-3">
              {po.items.map((item) => (
                <div
                  key={item.uuid}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <p className="font-bold text-[#021422] text-sm">
                      {item.inventory_item_name}
                    </p>
                    <div className="grid grid-cols-3 gap-3 mt-2 text-sm">
                      <div>
                        <span className="text-gray-400 text-xs block">
                          Quantity
                        </span>
                        <span className="font-bold text-[#021422]">
                          {item.quantity_ordered}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs block">
                          Unit Price
                        </span>
                        <span className="font-bold text-[#021422]">
                          ₦{parseFloat(item.unit_price).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs block">
                          Total
                        </span>
                        <span className="font-bold text-[#0166B0]">
                          ₦
                          {(
                            parseFloat(item.quantity_ordered) *
                            parseFloat(item.unit_price)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isDraft && (
                    <button
                      onClick={() => handleRemoveItem(item.uuid)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  Grand Total
                </span>
                <span className="text-xl font-bold text-[#021422]">
                  ₦{parseFloat(po.total_amount || "0").toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Package size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">
                No items yet. Add inventory items to this PO.
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        {po.notes && (
          <SectionCard title="Notes" icon={Package} accentColor="bg-gray-500">
            <p className="text-sm text-gray-700">{po.notes}</p>
          </SectionCard>
        )}
      </div>

      {/* GRN Receive Modal */}
      {showGRN && grnPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => {
              setShowGRN(false);
              setGrnPO(null);
            }}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Receive — {po.po_number}
              </h3>
              <button
                onClick={() => {
                  setShowGRN(false);
                  setGrnPO(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XCircle size={16} />
              </button>
            </div>
            <GRNReceiveForm
              key={grnPO?.uuid}
              po={grnPO}
              projectId={projectId}
              lineItems={
                grnPO.items?.map((i) => ({
                  uuid: i.uuid || "",
                  name: i.inventoryItemName,
                  quantity: i.quantityOrdered,
                  unit: i.inventoryItemUnit,
                  unitPrice: i.unitPrice,
                })) ?? "loading"
              }
              onComplete={() => {
                setShowGRN(false);
                setGrnPO(null);
                fetchPO();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
