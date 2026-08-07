"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingCart,
  Calendar,
  FileText,
  User,
  Package,
  Copy,
  Check,
  Truck,
  QrCode,
  Loader2,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import type {
  InventoryPO,
  InventoryPOStatus,
  GRN,
} from "@/lib/types/inventoryPO";
import type { PurchaseOrderChange } from "@/lib/types/purchaseOrderChange";
import {
  PO_CHANGE_STATUS_LABELS,
  PO_CHANGE_STATUS_STYLES,
  canPerformChangeAction,
} from "@/lib/types/purchaseOrderChange";
import { purchaseOrderChangeService } from "@/lib/services/purchaseOrderChangeService";
import { purchaseOrderChangeFromApi } from "@/lib/transforms/purchaseOrderChangeTransforms";
import type { BackendPurchaseOrderChange } from "@/lib/transforms/purchaseOrderChangeTransforms";
import { PO_STATUS_LABELS, PO_STATUS_STYLES } from "@/lib/types/inventoryPO";
import POStatusStepper from "./POStatusStepper";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import { inventoryPOFromApi } from "@/lib/transforms/inventoryPOTransforms";
import { inventoryPOItemFromApi } from "@/lib/transforms/inventoryPOTransforms";
import { grnFromApi } from "@/lib/transforms/grnTransforms";
import type { BackendGRN } from "@/lib/transforms/grnTransforms";
import { getErrorMessage } from "@/lib/error";
import toast from "react-hot-toast";
import {
  Field,
  FieldGrid,
  SectionCard,
  formatDate,
  POLineItemsTable,
  POStatusBadge,
  QRCodeDisplay,
  GRNReceiveForm,
} from "@/components/vendor-pipeline/primitives";
import type { POLineItem } from "@/components/vendor-pipeline/primitives/POLineItemsTable";

interface PODetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  po: InventoryPO | null;
  projectId: string;
  onStatusChange?: (updated: InventoryPO) => void;
  userRole?: string;
  orgSlug?: string;
  projectSlug?: string;
  inventoryItems?: { id: string; name: string; type: string; unit?: string }[];
  onCreateChange?: () => void;
}

export default function PODetailDrawer({
  isOpen,
  onClose,
  po,
  projectId,
  onStatusChange,
  userRole,
  orgSlug,
  projectSlug,
  inventoryItems = [],
  onCreateChange,
}: PODetailDrawerProps) {
  const [items, setItems] = useState<POLineItem[] | "loading">("loading");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [invoiceStatus, setInvoiceStatus] = useState<
    "none" | "submitted" | "approved" | "paid"
  >("none");
  const [invoiceMockData, setInvoiceMockData] = useState<{
    items: {
      name: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      total: number;
    }[];
    total: number;
    notes: string;
    submittedAt: string;
  } | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // GRN history
  const [grns, setGrns] = useState<GRN[] | "loading">("loading");
  const [voidingGrnUuid, setVoidingGrnUuid] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [grnActionLoading, setGrnActionLoading] = useState(false);

  // Line-item editing (draft)
  const [editingItemUuid, setEditingItemUuid] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editItemNotes, setEditItemNotes] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [addItemId, setAddItemId] = useState("");
  const [addItemQty, setAddItemQty] = useState("");
  const [addItemNotes, setAddItemNotes] = useState("");
  const [itemActionLoading, setItemActionLoading] = useState(false);

  // PO metadata editing (draft / confirmed)
  const [editingMeta, setEditingMeta] = useState(false);
  const [editExpectedDelivery, setEditExpectedDelivery] = useState("");
  const [editPoNotes, setEditPoNotes] = useState("");
  const [metaSaving, setMetaSaving] = useState(false);

  // Change orders
  const [changeOrders, setChangeOrders] = useState<PurchaseOrderChange[]>([]);
  const [changeOrdersLoading, setChangeOrdersLoading] = useState(false);
  const [changeActionLoading, setChangeActionLoading] = useState<string | null>(
    null,
  );

  // PO item summary (receipt progress per line item)
  const [itemSummary, setItemSummary] = useState<
    | {
        poItemId: string;
        inventoryItemName: string;
        unit: string;
        quantityOrdered: number;
        quantityConfirmed: number;
        quantityRemaining: number;
        grnCount: number;
      }[]
    | "loading"
  >("loading");

  useEffect(() => {
    if (items === "loading" || !po) return;
    if (po.status === "received" && invoiceStatus === "none") {
      const mockItems = items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      }));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInvoiceMockData({
        items: mockItems,
        total: mockItems.reduce((sum, i) => sum + i.total, 0),
        notes: "Delivery invoice for this order",
        submittedAt: new Date().toISOString(),
      });
      setInvoiceStatus("submitted");
    }
  }, [items, po?.status]);

  useEffect(() => {
    if (!isOpen || !po?.uuid) return;
    const abort = new AbortController();
    purchaseOrderService
      .listItems(projectId, po.uuid)
      .then((res) => {
        if (!abort.signal.aborted) {
          const raw = (res.data?.results ?? res.data ?? []) as Parameters<
            typeof inventoryPOItemFromApi
          >[0][];
          setItems(
            raw.map((d: Parameters<typeof inventoryPOItemFromApi>[0]) => {
              const item = inventoryPOItemFromApi(d);
              return {
                uuid: item.uuid,
                name: item.inventoryItemName,
                quantity: item.quantityOrdered,
                unit: item.inventoryItemUnit,
                unitPrice: item.unitPrice,
              } satisfies POLineItem;
            }),
          );
        }
      })
      .catch((err) => {
        if (!abort.signal.aborted) {
          toast.error(getErrorMessage(err));
          setItems([]);
        }
      });
    return () => {
      abort.abort();
      setItems("loading");
    };
  }, [isOpen, po?.uuid, projectId]);

  // Fetch GRNs
  useEffect(() => {
    if (!isOpen || !po?.uuid) return;
    const loadGrns = async () => {
      try {
        const res = await purchaseOrderService.listGRNs(projectId, po.uuid);
        const raw = (res.data?.results ?? res.data ?? []) as BackendGRN[];
        setGrns(raw.map(grnFromApi));
      } catch {
        setGrns([]);
      }
    };
    loadGrns();
  }, [isOpen, po?.uuid, projectId]);

  // Fetch change orders
  useEffect(() => {
    if (!isOpen || !po?.uuid) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChangeOrdersLoading(true);
    purchaseOrderChangeService
      .listChanges(projectId, po.uuid)
      .then((res) => {
        const raw = (res.data?.results ??
          res.data ??
          []) as BackendPurchaseOrderChange[];
        setChangeOrders(raw.map(purchaseOrderChangeFromApi));
      })
      .catch(() => setChangeOrders([]))
      .finally(() => setChangeOrdersLoading(false));
  }, [isOpen, po?.uuid, projectId]);

  const refreshGrns = async () => {
    if (!po?.uuid) return;
    try {
      const res = await purchaseOrderService.listGRNs(projectId, po.uuid);
      const raw = (res.data?.results ?? res.data ?? []) as BackendGRN[];
      setGrns(raw.map(grnFromApi));
    } catch {
      // silent
    }
  };

  // Fetch PO item summary
  useEffect(() => {
    if (!isOpen || !po?.uuid) return;
    purchaseOrderService
      .getPOItemSummary(projectId, po.uuid)
      .then((res) => {
        const raw = (res.data?.results ?? res.data ?? []) as {
          po_item_id: string;
          inventory_item_name: string;
          unit: string;
          quantity_ordered: string;
          quantity_confirmed: string;
          quantity_remaining: string;
          grn_count: number;
        }[];
        setItemSummary(
          raw.map((d) => ({
            poItemId: d.po_item_id,
            inventoryItemName: d.inventory_item_name,
            unit: d.unit || "",
            quantityOrdered: parseFloat(d.quantity_ordered) || 0,
            quantityConfirmed: parseFloat(d.quantity_confirmed) || 0,
            quantityRemaining: parseFloat(d.quantity_remaining) || 0,
            grnCount: d.grn_count || 0,
          })),
        );
      })
      .catch(() => setItemSummary([]));
  }, [isOpen, po?.uuid, projectId]);

  if (!isOpen) return null;

  const canReceive = po && (po.status === "shipped" || po.status === "partial");

  const handleCopyCode = async () => {
    if (!po?.poNumber) return;
    try {
      await navigator.clipboard.writeText(po.poNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

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
  const showDeliveryTimeline = po && statusRank[po.status] >= 5;

  const deliveryCurrent =
    po?.status === "received"
      ? 2
      : po?.status === "partial"
        ? 1
        : po?.status === "shipped"
          ? 0
          : -1;

  const handleApproveInvoice = async () => {
    setInvoiceLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setInvoiceStatus("approved");
    toast.success("Invoice approved");
    setInvoiceLoading(false);
  };

  const handleMarkPaid = async () => {
    setInvoiceLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setInvoiceStatus("paid");
    toast.success("Invoice marked as paid");
    setInvoiceLoading(false);
  };

  // ─── GRN void ─────────────────────────────────────────────────────────────────
  const handleVoidGrn = async (grnUuid: string) => {
    if (!po?.uuid || !voidReason.trim()) return;
    setGrnActionLoading(true);
    try {
      await purchaseOrderService.voidGRN(projectId, po.uuid, grnUuid, {
        void_reason: voidReason,
      });
      toast.success("GRN voided");
      setVoidingGrnUuid(null);
      setVoidReason("");
      refreshGrns();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGrnActionLoading(false);
    }
  };

  // ─── Line-item editing (draft) ────────────────────────────────────────────────

  const handleEditItem = (item: POLineItem) => {
    setEditingItemUuid(item.uuid);
    setEditQty(String(item.quantity));
    setEditItemNotes("");
  };

  const handleCancelEdit = () => {
    setEditingItemUuid(null);
    setEditQty("");
    setEditItemNotes("");
  };

  const handleSaveEdit = async (itemUuid: string) => {
    if (!po?.uuid) return;
    setItemActionLoading(true);
    try {
      await purchaseOrderService.updateItem(projectId, po.uuid, itemUuid, {
        quantity: editQty || undefined,
        notes: editItemNotes || undefined,
      });
      toast.success("Item updated");
      setEditingItemUuid(null);
      await refreshItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setItemActionLoading(false);
    }
  };

  const handleRemoveItem = async (itemUuid: string) => {
    if (!po?.uuid || !confirm("Remove this line item?")) return;
    setItemActionLoading(true);
    try {
      await purchaseOrderService.removeItem(projectId, po.uuid, itemUuid);
      toast.success("Item removed");
      await refreshItems();
      // Refresh PO to get updated total
      const poRes = await purchaseOrderService.getPO(projectId, po.uuid);
      const updated = inventoryPOFromApi(
        poRes.data as Parameters<typeof inventoryPOFromApi>[0],
      );
      onStatusChange?.(updated);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setItemActionLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!po?.uuid || !addItemId || !addItemQty) return;
    setItemActionLoading(true);
    try {
      await purchaseOrderService.addItem(projectId, po.uuid, {
        inventory_item_id: addItemId,
        quantity: addItemQty,
        unit_price: "0",
        notes: addItemNotes || undefined,
      });
      toast.success("Item added");
      setShowAddItem(false);
      setAddItemId("");
      setAddItemQty("");
      setAddItemNotes("");
      await refreshItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setItemActionLoading(false);
    }
  };

  const refreshItems = async () => {
    if (!po?.uuid) return;
    try {
      const res = await purchaseOrderService.listItems(projectId, po.uuid);
      const raw = (res.data?.results ?? res.data ?? []) as Parameters<
        typeof inventoryPOItemFromApi
      >[0][];
      setItems(
        raw.map((d) => {
          const item = inventoryPOItemFromApi(d);
          return {
            uuid: item.uuid,
            name: item.inventoryItemName,
            quantity: item.quantityOrdered,
            unit: item.inventoryItemUnit,
            unitPrice: item.unitPrice,
          } satisfies POLineItem;
        }),
      );
    } catch {}
  };

  // ─── PO metadata editing ──────────────────────────────────────────────────────

  const startEditMeta = () => {
    if (!po) return;
    setEditExpectedDelivery(po.expectedDeliveryDate || "");
    setEditPoNotes(po.notes || "");
    setEditingMeta(true);
  };

  const cancelEditMeta = () => {
    setEditingMeta(false);
  };

  const saveMeta = async () => {
    if (!po?.uuid) return;
    setMetaSaving(true);
    try {
      const res = await purchaseOrderService.updatePO(projectId, po.uuid, {
        expected_delivery_date: editExpectedDelivery || undefined,
        notes: editPoNotes || undefined,
      });
      const updated = inventoryPOFromApi(
        res.data.data ?? (res.data as Parameters<typeof inventoryPOFromApi>[0]),
      );
      onStatusChange?.(updated);
      toast.success("PO updated");
      setEditingMeta(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setMetaSaving(false);
    }
  };

  const verificationUrl =
    orgSlug && projectSlug && po?.uuid
      ? `/${orgSlug}/projects/${projectSlug}/po-verify/${po.uuid}`
      : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-white z-[80] shadow-2xl flex flex-col"
          >
            {!po ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                No purchase order selected
              </div>
            ) : (
              <>
                {/* Hero Header */}
                <div className="relative flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-700 px-5 pt-4 pb-5">
                  <div className="flex items-center justify-between mb-3">
                    <POStatusBadge status={po.status} />
                    <button
                      onClick={onClose}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-500/30 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-white leading-tight truncate">
                          {po.poNumber || "Purchase Order"}
                        </h2>
                        <p className="text-xs text-white/70 mt-0.5">
                          {po.supplierName}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-white/70">Total</p>
                      <p className="text-lg font-bold text-white">
                        ₦
                        {po.totalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-3 bg-white rounded-t-xl" />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-white p-4 space-y-3">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <POStatusStepper
                      key={po.uuid}
                      po={po}
                      projectId={projectId}
                      userRole={userRole ?? ""}
                      onStatusChange={(updated) => {
                        onStatusChange?.(updated);
                        onClose();
                      }}
                    />
                  </div>

                  <SectionCard
                    title="Order Details"
                    icon={ShoppingCart}
                    accentColor="bg-blue-500"
                  >
                    <FieldGrid>
                      <Field label="PO Number" value={po.poNumber} />
                      <Field label="Supplier" value={po.supplierName} />
                      <Field
                        label="Total Amount"
                        value={`₦${po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                      />
                      <Field label="Items Count" value={po.itemsCount} />
                    </FieldGrid>
                  </SectionCard>

                  <SectionCard
                    title="Dates"
                    icon={Calendar}
                    accentColor="bg-teal-500"
                  >
                    {editingMeta ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                            Expected Delivery
                          </label>
                          <input
                            type="date"
                            value={editExpectedDelivery}
                            onChange={(e) =>
                              setEditExpectedDelivery(e.target.value)
                            }
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                            Notes
                          </label>
                          <textarea
                            value={editPoNotes}
                            onChange={(e) => setEditPoNotes(e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Add notes…"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={saveMeta}
                            disabled={metaSaving}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {metaSaving ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={cancelEditMeta}
                            disabled={metaSaving}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="sr-only">Dates</span>
                          {(po.status === "draft" ||
                            po.status === "confirmed") && (
                            <button
                              onClick={startEditMeta}
                              className="ml-auto flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <FileText size={12} />
                              Edit
                            </button>
                          )}
                        </div>
                        <FieldGrid>
                          <Field
                            label="Order Date"
                            value={formatDate(po.orderDate)}
                          />
                          {po.expectedDeliveryDate && (
                            <Field
                              label="Expected Delivery"
                              value={formatDate(po.expectedDeliveryDate)}
                            />
                          )}
                          {!po.expectedDeliveryDate && (
                            <Field label="Expected Delivery" value="—" />
                          )}
                          {po.actualDeliveryDate && (
                            <Field
                              label="Actual Delivery"
                              value={formatDate(po.actualDeliveryDate)}
                            />
                          )}
                          <Field
                            label="Created"
                            value={formatDate(po.createdAt)}
                          />
                          <Field
                            label="Updated"
                            value={formatDate(po.updatedAt)}
                          />
                        </FieldGrid>
                      </>
                    )}
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
                            {po.poNumber || "—"}
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
                        <QrCode size={14} />
                        {showQR ? "Hide QR Code" : "Show QR Code for printing"}
                      </button>

                      {showQR && verificationUrl && (
                        <QRCodeDisplay
                          value={verificationUrl}
                          poNumber={po.poNumber}
                          size={160}
                          showPrint
                        />
                      )}

                      <p className="text-[10px] text-gray-400 leading-snug">
                        Give this code to the driver. The site supervisor enters
                        this code or scans the QR to verify delivery.
                      </p>
                    </div>
                  </SectionCard>

                  {/* Receive Delivery Section */}
                  {canReceive && (
                    <SectionCard
                      title="Receive Delivery"
                      icon={Package}
                      accentColor="bg-emerald-500"
                    >
                      <GRNReceiveForm
                        key={po.uuid}
                        po={po}
                        projectId={projectId}
                        lineItems={items}
                        onComplete={(updated) => {
                          onStatusChange?.(updated);
                          refreshGrns();
                          onClose();
                        }}
                      />
                    </SectionCard>
                  )}

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
                              className={`w-3 h-3 rounded-full ${deliveryCurrent >= 0 ? "bg-emerald-500" : "bg-gray-200"} ring-2 ${deliveryCurrent >= 0 ? "ring-emerald-200" : "ring-gray-100"}`}
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
                              className={`w-3 h-3 rounded-full ${deliveryCurrent >= 1 ? "bg-emerald-500" : "bg-gray-200"} ring-2 ${deliveryCurrent >= 1 ? "ring-emerald-200" : "ring-gray-100"}`}
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
                              className={`w-3 h-3 rounded-full ${deliveryCurrent >= 2 ? "bg-emerald-500" : "bg-gray-200"} ring-2 ${deliveryCurrent >= 2 ? "ring-emerald-200" : "ring-gray-100"}`}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Received on Site
                            </p>
                            <p className="text-xs text-gray-400">
                              {po.actualDeliveryDate
                                ? `Arrived ${formatDate(po.actualDeliveryDate)}`
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

                  <SectionCard
                    title="Items"
                    icon={Package}
                    accentColor="bg-indigo-500"
                  >
                    {po.status === "draft" && (
                      <>
                        <div className="mb-3 flex items-center gap-2">
                          <button
                            onClick={() => setShowAddItem(!showAddItem)}
                            disabled={itemActionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            {showAddItem ? "Cancel" : "+ Add Item"}
                          </button>
                        </div>
                        {showAddItem && (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                            <div>
                              <label className="block text-[10px] font-medium text-gray-600 mb-0.5">
                                Inventory Item
                              </label>
                              <select
                                value={addItemId}
                                onChange={(e) => setAddItemId(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                              >
                                <option value="">Select item…</option>
                                {inventoryItems.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name} ({item.type})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">
                                  Quantity
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={addItemQty}
                                  onChange={(e) =>
                                    setAddItemQty(e.target.value)
                                  }
                                  placeholder="0"
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">
                                  Notes
                                </label>
                                <input
                                  type="text"
                                  value={addItemNotes}
                                  onChange={(e) =>
                                    setAddItemNotes(e.target.value)
                                  }
                                  placeholder="Optional"
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <button
                              onClick={handleAddItem}
                              disabled={
                                itemActionLoading || !addItemId || !addItemQty
                              }
                              className="w-full px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              {itemActionLoading ? "Adding…" : "Add Line Item"}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {po.status !== "draft" ? (
                      <POLineItemsTable items={items} />
                    ) : items === "loading" ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
                        <Loader2 size={14} className="animate-spin" />
                        Loading items…
                      </div>
                    ) : items.length === 0 ? (
                      <p className="text-sm text-gray-400 py-2">
                        No line items on this PO.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left py-2 pr-2 font-medium text-gray-500">
                                Item
                              </th>
                              <th className="text-right py-2 pr-2 font-medium text-gray-500">
                                Qty
                              </th>
                              <th className="text-right py-2 font-medium text-gray-500 w-16">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item) => (
                              <tr
                                key={item.uuid}
                                className="border-b border-gray-50"
                              >
                                {editingItemUuid === item.uuid ? (
                                  <>
                                    <td className="py-2 pr-2 text-gray-900 font-medium">
                                      {item.name}
                                    </td>
                                    <td className="py-2 pr-2">
                                      <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={editQty}
                                        onChange={(e) =>
                                          setEditQty(e.target.value)
                                        }
                                        className="w-24 px-2 py-1 text-right text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                      />
                                    </td>
                                    <td className="py-2">
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() =>
                                            handleSaveEdit(item.uuid)
                                          }
                                          disabled={itemActionLoading}
                                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                        >
                                          <Check size={14} />
                                        </button>
                                        <button
                                          onClick={handleCancelEdit}
                                          disabled={itemActionLoading}
                                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="py-2 pr-2 text-gray-900 font-medium">
                                      {item.name}
                                    </td>
                                    <td className="py-2 pr-2 text-right text-gray-900">
                                      {item.quantity} {item.unit}
                                    </td>
                                    <td className="py-2">
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleEditItem(item)}
                                          disabled={itemActionLoading}
                                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                          title="Edit"
                                        >
                                          <FileText size={13} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleRemoveItem(item.uuid)
                                          }
                                          disabled={itemActionLoading}
                                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                          title="Remove"
                                        >
                                          <X size={13} />
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Receipt Progress Bars */}
                    {itemSummary !== "loading" &&
                      itemSummary.length > 0 &&
                      itemSummary.some((s) => s.quantityConfirmed > 0) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Receipt Progress
                          </h4>
                          <div className="space-y-2">
                            {itemSummary.map((s) => {
                              const pct =
                                s.quantityOrdered > 0
                                  ? Math.min(
                                      100,
                                      Math.round(
                                        (s.quantityConfirmed /
                                          s.quantityOrdered) *
                                          100,
                                      ),
                                    )
                                  : 0;
                              return (
                                <div key={s.poItemId} className="space-y-0.5">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-medium text-gray-600 truncate mr-2">
                                      {s.inventoryItemName}
                                    </span>
                                    <span className="text-gray-400 whitespace-nowrap">
                                      {s.quantityConfirmed} /{" "}
                                      {s.quantityOrdered} {s.unit}
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        pct >= 100
                                          ? "bg-emerald-500"
                                          : pct > 0
                                            ? "bg-blue-500"
                                            : "bg-gray-200"
                                      }`}
                                      style={{ width: `${pct || 2}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </SectionCard>

                  {/* GRN History */}
                  <SectionCard
                    title="GRN History"
                    icon={ClipboardList}
                    accentColor="bg-teal-500"
                  >
                    {grns === "loading" ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
                        <Loader2 size={14} className="animate-spin" />
                        Loading GRNs…
                      </div>
                    ) : grns.length === 0 ? (
                      <p className="text-sm text-gray-400 py-2">
                        No goods received notes yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {grns.map((grn) => (
                          <div
                            key={grn.uuid}
                            className={`p-3 rounded-lg border ${
                              grn.status === "confirmed"
                                ? "bg-emerald-50 border-emerald-200"
                                : grn.status === "voided"
                                  ? "bg-gray-50 border-gray-200"
                                  : "bg-yellow-50 border-yellow-200"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-gray-700">
                                    {grn.grnNumber || "—"}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      grn.status === "confirmed"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : grn.status === "voided"
                                          ? "bg-gray-200 text-gray-500"
                                          : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {grn.status === "confirmed"
                                      ? "Confirmed"
                                      : grn.status === "voided"
                                        ? "Voided"
                                        : "Draft"}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">
                                  {grn.inventoryItemName}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                                  <span>
                                    Accepted:{" "}
                                    <strong className="text-emerald-700">
                                      {grn.quantityAccepted}
                                    </strong>
                                  </span>
                                  {grn.quantityRejected > 0 && (
                                    <span>
                                      Rejected:{" "}
                                      <strong className="text-red-600">
                                        {grn.quantityRejected}
                                      </strong>
                                    </span>
                                  )}
                                  <span>{formatDate(grn.receivedDate)}</span>
                                </div>
                                {grn.rejectionReason && (
                                  <p className="text-[10px] text-red-600 mt-0.5 truncate">
                                    Rejection: {grn.rejectionReason}
                                  </p>
                                )}
                                {grn.notes && (
                                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                                    {grn.notes}
                                  </p>
                                )}
                                {grn.status === "voided" && grn.voidReason && (
                                  <p className="text-[10px] text-gray-500 mt-0.5">
                                    Voided: {grn.voidReason}
                                    {grn.voidedByName &&
                                      ` by ${grn.voidedByName}`}
                                  </p>
                                )}
                              </div>
                              {grn.status === "confirmed" &&
                              voidingGrnUuid === grn.uuid ? (
                                <div className="flex items-center gap-1 shrink-0">
                                  <input
                                    type="text"
                                    placeholder="Void reason…"
                                    value={voidReason}
                                    onChange={(e) =>
                                      setVoidReason(e.target.value)
                                    }
                                    className="w-28 px-2 py-1 text-[10px] border border-red-300 rounded focus:ring-1 focus:ring-red-500"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleVoidGrn(grn.uuid)}
                                    disabled={
                                      grnActionLoading || !voidReason.trim()
                                    }
                                    className="px-2 py-1 text-[10px] font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                                  >
                                    Void
                                  </button>
                                  <button
                                    onClick={() => {
                                      setVoidingGrnUuid(null);
                                      setVoidReason("");
                                    }}
                                    disabled={grnActionLoading}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : grn.status === "confirmed" ? (
                                <button
                                  onClick={() => setVoidingGrnUuid(grn.uuid)}
                                  className="shrink-0 px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  Void
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>

                  {/* Invoice Section (mock data) */}
                  {po.status === "received" && invoiceMockData && (
                    <SectionCard
                      title="Invoice"
                      icon={FileText}
                      accentColor="bg-blue-600"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">Status</p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              invoiceStatus === "paid"
                                ? "bg-emerald-50 text-emerald-700"
                                : invoiceStatus === "approved"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {invoiceStatus === "paid"
                              ? "Paid"
                              : invoiceStatus === "approved"
                                ? "Approved"
                                : "Submitted"}
                          </span>
                        </div>

                        {/* Invoice status timeline */}
                        <div className="flex gap-2">
                          {(["submitted", "approved", "paid"] as const).map(
                            (step, i) => {
                              const stepIdx = [
                                "submitted",
                                "approved",
                                "paid",
                              ].indexOf(invoiceStatus);
                              const isDone = i <= stepIdx;
                              const isCurrent = i === stepIdx;
                              return (
                                <div
                                  key={step}
                                  className="flex-1 flex flex-col items-center"
                                >
                                  <div
                                    className={`w-full h-1.5 rounded-full ${isDone ? "bg-blue-500" : "bg-gray-200"}`}
                                  />
                                  <span
                                    className={`text-[10px] mt-1 ${isCurrent ? "font-bold text-gray-900" : "text-gray-400"}`}
                                  >
                                    {step.charAt(0).toUpperCase() +
                                      step.slice(1)}
                                  </span>
                                </div>
                              );
                            },
                          )}
                        </div>

                        {/* Invoice items table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left py-2 px-3 font-medium text-gray-500">
                                  Item
                                </th>
                                <th className="text-right py-2 px-3 font-medium text-gray-500">
                                  Qty
                                </th>
                                <th className="text-right py-2 px-3 font-medium text-gray-500">
                                  Price
                                </th>
                                <th className="text-right py-2 px-3 font-medium text-gray-500">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoiceMockData.items.map((item, i) => (
                                <tr
                                  key={i}
                                  className="border-t border-gray-100"
                                >
                                  <td className="py-2 px-3 font-medium text-gray-900">
                                    {item.name}
                                  </td>
                                  <td className="py-2 px-3 text-right text-gray-600">
                                    {item.quantity} {item.unit}
                                  </td>
                                  <td className="py-2 px-3 text-right text-gray-600">
                                    ₦{item.unitPrice.toLocaleString()}
                                  </td>
                                  <td className="py-2 px-3 text-right font-semibold text-gray-900">
                                    ₦{item.total.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-gray-500">Total</span>
                          <span>₦{invoiceMockData.total.toLocaleString()}</span>
                        </div>

                        {invoiceMockData.notes && (
                          <p className="text-xs text-gray-400 italic">
                            {invoiceMockData.notes}
                          </p>
                        )}

                        {invoiceStatus === "submitted" && (
                          <button
                            onClick={handleApproveInvoice}
                            disabled={invoiceLoading}
                            className="w-full py-2.5 bg-[#021422] text-white rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                          >
                            {invoiceLoading ? (
                              <Loader2
                                size={14}
                                className="animate-spin mx-auto"
                              />
                            ) : (
                              "Approve Invoice"
                            )}
                          </button>
                        )}
                        {invoiceStatus === "approved" && (
                          <button
                            onClick={handleMarkPaid}
                            disabled={invoiceLoading}
                            className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          >
                            {invoiceLoading ? (
                              <Loader2
                                size={14}
                                className="animate-spin mx-auto"
                              />
                            ) : (
                              "Mark as Paid"
                            )}
                          </button>
                        )}
                        {invoiceStatus === "paid" && (
                          <div className="text-center py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                            <p className="text-sm font-medium text-emerald-700">
                              Payment Complete
                            </p>
                          </div>
                        )}
                      </div>
                    </SectionCard>
                  )}

                  {/* Change Orders */}
                  <SectionCard
                    title="Change Orders"
                    icon={RefreshCw}
                    accentColor="bg-violet-500"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-500">
                        {changeOrders.length} change order
                        {changeOrders.length !== 1 ? "s" : ""}
                      </p>
                      <button
                        onClick={onCreateChange}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <RefreshCw size={12} />
                        New Change Order
                      </button>
                    </div>
                    {changeOrdersLoading ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
                        <Loader2 size={14} className="animate-spin" />
                        Loading changes…
                      </div>
                    ) : changeOrders.length === 0 ? (
                      <p className="text-sm text-gray-400 py-2">
                        No change orders for this PO.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {changeOrders.map((co) => {
                          const style = PO_CHANGE_STATUS_STYLES[co.status] || {
                            bg: "bg-gray-50",
                            text: "text-gray-600",
                          };
                          return (
                            <div
                              key={co.uuid}
                              className={`${style.bg} border border-gray-200 rounded-lg p-3`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-gray-700">
                                      {co.changeNumber}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${style.bg} ${style.text}`}
                                    >
                                      {PO_CHANGE_STATUS_LABELS[co.status]}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                                    {co.reason}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">
                                    {co.items.length} item
                                    {co.items.length !== 1 ? "s" : ""} ·{" "}
                                    {new Date(
                                      co.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                {canPerformChangeAction(
                                  co.status,
                                  "submit",
                                  userRole ?? "",
                                ) && (
                                  <button
                                    onClick={async () => {
                                      setChangeActionLoading(co.uuid);
                                      try {
                                        const res =
                                          await purchaseOrderChangeService.submitChange(
                                            projectId,
                                            po.uuid,
                                            co.uuid,
                                          );
                                        const updated =
                                          purchaseOrderChangeFromApi(
                                            (res.data as { data?: unknown })
                                              ?.data ??
                                              (res.data as Parameters<
                                                typeof purchaseOrderChangeFromApi
                                              >[0]),
                                          );
                                        setChangeOrders((prev) =>
                                          prev.map((c) =>
                                            c.uuid === updated.uuid
                                              ? updated
                                              : c,
                                          ),
                                        );
                                        toast.success(
                                          `${updated.changeNumber} submitted`,
                                        );
                                      } catch (err) {
                                        toast.error(getErrorMessage(err));
                                      } finally {
                                        setChangeActionLoading(null);
                                      }
                                    }}
                                    disabled={changeActionLoading === co.uuid}
                                    className="px-2 py-1 text-[10px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {changeActionLoading === co.uuid
                                      ? "…"
                                      : "Submit"}
                                  </button>
                                )}
                                {canPerformChangeAction(
                                  co.status,
                                  "approve",
                                  userRole ?? "",
                                ) && (
                                  <button
                                    onClick={async () => {
                                      setChangeActionLoading(co.uuid);
                                      try {
                                        const res =
                                          await purchaseOrderChangeService.approveChange(
                                            projectId,
                                            po.uuid,
                                            co.uuid,
                                          );
                                        const updated =
                                          purchaseOrderChangeFromApi(
                                            (res.data as { data?: unknown })
                                              ?.data ??
                                              (res.data as Parameters<
                                                typeof purchaseOrderChangeFromApi
                                              >[0]),
                                          );
                                        setChangeOrders((prev) =>
                                          prev.map((c) =>
                                            c.uuid === updated.uuid
                                              ? updated
                                              : c,
                                          ),
                                        );
                                        toast.success(
                                          `${updated.changeNumber} approved`,
                                        );
                                      } catch (err) {
                                        toast.error(getErrorMessage(err));
                                      } finally {
                                        setChangeActionLoading(null);
                                      }
                                    }}
                                    disabled={changeActionLoading === co.uuid}
                                    className="px-2 py-1 text-[10px] font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 disabled:opacity-50"
                                  >
                                    {changeActionLoading === co.uuid
                                      ? "…"
                                      : "Approve"}
                                  </button>
                                )}
                                {canPerformChangeAction(
                                  co.status,
                                  "apply",
                                  userRole ?? "",
                                ) && (
                                  <button
                                    onClick={async () => {
                                      if (
                                        !confirm(
                                          `Apply ${co.changeNumber}? This will modify the PO.`,
                                        )
                                      )
                                        return;
                                      setChangeActionLoading(co.uuid);
                                      try {
                                        const res =
                                          await purchaseOrderChangeService.applyChange(
                                            projectId,
                                            po.uuid,
                                            co.uuid,
                                          );
                                        const updated =
                                          purchaseOrderChangeFromApi(
                                            (res.data as { data?: unknown })
                                              ?.data ??
                                              (res.data as Parameters<
                                                typeof purchaseOrderChangeFromApi
                                              >[0]),
                                          );
                                        setChangeOrders((prev) =>
                                          prev.map((c) =>
                                            c.uuid === updated.uuid
                                              ? updated
                                              : c,
                                          ),
                                        );
                                        toast.success(
                                          `${updated.changeNumber} applied`,
                                        );
                                      } catch (err) {
                                        toast.error(getErrorMessage(err));
                                      } finally {
                                        setChangeActionLoading(null);
                                      }
                                    }}
                                    disabled={changeActionLoading === co.uuid}
                                    className="px-2 py-1 text-[10px] font-medium text-white bg-amber-600 rounded hover:bg-amber-700 disabled:opacity-50"
                                  >
                                    {changeActionLoading === co.uuid
                                      ? "…"
                                      : "Apply"}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </SectionCard>

                  {po.notes && (
                    <SectionCard
                      title="Notes"
                      icon={FileText}
                      accentColor="bg-gray-500"
                    >
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-snug">
                        {po.notes}
                      </p>
                    </SectionCard>
                  )}

                  {(po.createdByName || po.approvedByName) && (
                    <SectionCard
                      title="Audit"
                      icon={User}
                      accentColor="bg-violet-500"
                    >
                      <FieldGrid>
                        {po.createdByName && (
                          <Field label="Created By" value={po.createdByName} />
                        )}
                        {po.approvedByName && (
                          <Field
                            label="Approved By"
                            value={po.approvedByName}
                          />
                        )}
                      </FieldGrid>
                    </SectionCard>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
