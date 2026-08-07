"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Check, X, Calendar, Package, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import { inventoryPOFromApi } from "@/lib/transforms/inventoryPOTransforms";
import { getErrorMessage } from "@/lib/error";
import type { InventoryPO } from "@/lib/types/inventoryPO";

export interface POLineItem {
  uuid: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface GRNResponse {
  id: string;
  grn_number: string;
  po_item: {
    id: string;
    inventory_item_name: string;
    quantity_ordered: string;
  } | null;
  inventory_item: {
    id: string;
    name: string;
    unit: string;
  } | null;
  quantity_accepted: string;
  quantity_received: string;
  quantity_rejected: string;
  status: "draft" | "confirmed" | "voided";
}

interface GRNListResponse {
  po_item?: { id: string };
  quantity_accepted?: string;
}

interface LineItemForm {
  poItemUuid: string;
  itemName: string;
  quantityOrdered: number;
  unit: string;
  alreadyReceived: number;
  quantityReceived: string;
  quantityAccepted: string;
  rejectionReason: string;
}

interface GRNReceiveFormProps {
  po: InventoryPO;
  projectId: string;
  lineItems: POLineItem[] | "loading";
  onComplete: (updatedPO: InventoryPO) => void;
}

export default function GRNReceiveForm({ po, projectId, lineItems, onComplete }: GRNReceiveFormProps) {
  const [step, setStep] = useState<"enter" | "creating" | "confirming" | "done">("enter");
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [verificationPhoto, setVerificationPhoto] = useState<File | null>(null);
  const [verificationPreview, setVerificationPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [itemForms, setItemForms] = useState<LineItemForm[]>([]);
  const [createdGRNs, setCreatedGRNs] = useState<GRNResponse[]>([]);
  const [confirmingIdx, setConfirmingIdx] = useState(-1);
  const [markingReceived, setMarkingReceived] = useState(false);

  useEffect(() => {
    if (lineItems === "loading") return;

    const loadExisting = async () => {
      try {
        const res = await purchaseOrderService.listGRNs(projectId, po.uuid, { status: "confirmed" });
        const existingGRNs = (res.data?.results ?? res.data ?? []) as GRNListResponse[];
        const receivedMap: Record<string, number> = {};
        for (const g of existingGRNs) {
          const itemUuid = g.po_item?.id;
          if (itemUuid) {
            receivedMap[itemUuid] = (receivedMap[itemUuid] || 0) + parseFloat(g.quantity_accepted || "0");
          }
        }
        setItemForms(
          lineItems.map((li) => ({
            poItemUuid: li.uuid,
            itemName: li.name,
            quantityOrdered: li.quantity,
            unit: li.unit,
            alreadyReceived: receivedMap[li.uuid] || 0,
            quantityReceived: "",
            quantityAccepted: "",
            rejectionReason: "",
          })),
        );
      } catch {
        setItemForms(
          lineItems.map((li) => ({
            poItemUuid: li.uuid,
            itemName: li.name,
            quantityOrdered: li.quantity,
            unit: li.unit,
            alreadyReceived: 0,
            quantityReceived: "",
            quantityAccepted: "",
            rejectionReason: "",
          })),
        );
      }
    };
    loadExisting();

    return () => {
      if (verificationPreview) URL.revokeObjectURL(verificationPreview);
    };
  }, [lineItems, projectId, po.uuid]);

  const updateField = (idx: number, field: keyof LineItemForm, value: string) => {
    setItemForms((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === "quantityReceived") {
        const received = parseFloat(value) || 0;
        const accepted = parseFloat(next[idx].quantityAccepted) || 0;
        if (accepted > received) {
          next[idx].quantityAccepted = value;
        }
      }
      if (field === "quantityAccepted") {
        const received = parseFloat(next[idx].quantityReceived) || 0;
        const accepted = parseFloat(value) || 0;
        if (accepted > received) {
          next[idx].quantityAccepted = next[idx].quantityReceived;
        }
      }
      return next;
    });
  };

  const getRemaining = (form: LineItemForm) => form.quantityOrdered - form.alreadyReceived;
  const getRejected = (form: LineItemForm) => {
    const r = parseFloat(form.quantityReceived) || 0;
    const a = parseFloat(form.quantityAccepted) || 0;
    return Math.max(0, r - a);
  };

  const allValid = itemForms
    .filter((f) => (parseFloat(f.quantityReceived) || 0) > 0)
    .every((f) => {
      const r = parseFloat(f.quantityReceived) || 0;
      const remaining = getRemaining(f);
      if (r > remaining) return false;
      const rejected = r - (parseFloat(f.quantityAccepted) || 0);
      if (rejected > 0 && !f.rejectionReason.trim()) return false;
      return true;
    });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return; }

    setVerificationPhoto(file);
    const preview = URL.createObjectURL(file);
    setVerificationPreview(preview);
  };

  const handleRemovePhoto = () => {
    if (verificationPreview) URL.revokeObjectURL(verificationPreview);
    setVerificationPhoto(null);
    setVerificationPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateAndConfirm = async () => {
    setStep("creating");

    // Seed placeholder rows immediately so the user sees pending items
    const placeholders: GRNResponse[] = itemForms
      .filter((f) => (parseFloat(f.quantityReceived) || 0) > 0)
      .map((f) => ({
        id: "",
        grn_number: "",
        po_item: { id: f.poItemUuid, inventory_item_name: f.itemName, quantity_ordered: String(f.quantityOrdered) },
        inventory_item: null,
        quantity_accepted: f.quantityAccepted,
        quantity_received: f.quantityReceived,
        quantity_rejected: "0",
        status: "draft",
      }));
    setCreatedGRNs(placeholders);

    const created: GRNResponse[] = [];

    for (let i = 0; i < itemForms.length; i++) {
      const f = itemForms[i];
      const received = parseFloat(f.quantityReceived) || 0;
      const accepted = parseFloat(f.quantityAccepted) || 0;
      const rejected = received - accepted;

      if (received <= 0) continue;

      try {
        // Send as FormData if a photo is attached (backend handles Azure upload)
        if (verificationPhoto) {
          const fd = new FormData();
          fd.append("po_item_id", f.poItemUuid);
          fd.append("received_date", receivedDate);
          fd.append("quantity_received", String(received));
          fd.append("quantity_accepted", String(accepted));
          fd.append("quantity_rejected", String(rejected));
          if (rejected > 0) fd.append("rejection_reason", f.rejectionReason);
          if (notes) fd.append("notes", notes);
          fd.append("file", verificationPhoto);
          const res = await purchaseOrderService.createGRN(projectId, po.uuid, fd);
          created.push(res.data as GRNResponse);
        } else {
          const res = await purchaseOrderService.createGRN(projectId, po.uuid, {
            po_item_id: f.poItemUuid,
            received_date: receivedDate,
            quantity_received: received,
            quantity_accepted: accepted,
            quantity_rejected: rejected,
            rejection_reason: rejected > 0 ? f.rejectionReason : undefined,
            notes: notes || undefined,
          });
          created.push(res.data as GRNResponse);
        }
      } catch (err) {
        toast.error(`Failed to create GRN for ${f.itemName}: ${getErrorMessage(err)}`);
      }
    }

    setCreatedGRNs(created);
    if (created.length === 0) { setStep("enter"); return; }

    setStep("confirming");
    let allConfirmed = true;
    for (let i = 0; i < created.length; i++) {
      setConfirmingIdx(i);
      try {
        const res = await purchaseOrderService.confirmGRN(projectId, po.uuid, created[i].id);
        created[i] = res.data as GRNResponse;
      } catch (err) {
        toast.error(`Failed to confirm GRN ${created[i].grn_number}: ${getErrorMessage(err)}`);
        allConfirmed = false;
      }
    }

    setCreatedGRNs([...created]);
    setConfirmingIdx(-1);

    if (allConfirmed) {
      toast.success(`${created.length} GRN(s) confirmed — stock updated`);
      setStep("done");
    } else {
      toast.error("Some GRNs failed to confirm");
      setStep("enter");
    }
  };

  // alreadyReceived is re-fetched from listGRNs on mount, so the remaining comparison is fresh
  const handleMarkReceived = async () => {
    setMarkingReceived(true);
    try {
      const res = await purchaseOrderService.receiveDelivery(projectId, po.uuid, {
        item_receipts: itemForms
          .filter((f) => (parseFloat(f.quantityReceived) || 0) > 0)
          .map((f) => ({
            po_item_id: f.poItemUuid,
            quantity_received: f.quantityReceived,
          })),
        actual_delivery_date: receivedDate || undefined,
      });
      const updated = inventoryPOFromApi(res.data as Parameters<typeof inventoryPOFromApi>[0]);
      onComplete(updated);
      toast.success(`PO ${updated.poNumber} marked as received`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setMarkingReceived(false);
    }
  };

  if (lineItems === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
        <Loader2 size={14} className="animate-spin" />
        Loading line items…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex gap-2">
        {["enter", "creating", "confirming", "done"].map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === s ? "bg-blue-600 text-white" : createdGRNs.length > 0 || step === "done" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {createdGRNs.length > 0 || step === "done" ? <Check size={12} /> : i + 1}
            </div>
            <span className={`text-[10px] font-medium ${step === s ? "text-blue-600" : "text-gray-400"}`}>
              {s === "enter" ? "Enter" : s === "creating" ? "Create" : s === "confirming" ? "Confirm" : "Done"}
            </span>
            {i < 3 && <div className="w-4 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* All items already fully received — just mark PO as received */}
      {step === "enter" && itemForms.length > 0 && itemForms.every((f) => getRemaining(f) <= 0) && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-800">All items fully received</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                No more items to receive on this PO. Mark it as received to complete this delivery.
              </p>
            </div>
          </div>
          <button
            onClick={handleMarkReceived}
            disabled={markingReceived}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {markingReceived ? <Loader2 size={14} className="animate-spin" /> : <Package size={16} />}
            {markingReceived ? "Updating..." : "Mark PO as Received"}
          </button>
        </div>
      )}

      {/* Step: Enter quantities */}
      {step === "enter" && itemForms.some((f) => getRemaining(f) > 0) && (
        <>
          {/* Global fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Received Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Photo</label>
              {verificationPreview ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img src={verificationPreview} alt="Delivery photo" className="w-full h-24 object-cover" />
                  <button onClick={handleRemovePhoto} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded text-[10px] hover:bg-red-700">
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                >
                  <Upload size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-500">Choose image</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Per-item cards */}
          <div className="space-y-2">
            {itemForms.map((f, i) => {
              const remaining = getRemaining(f);
              const rejected = getRejected(f);
              const received = parseFloat(f.quantityReceived) || 0;
              return (
                <div key={f.poItemUuid} className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{f.itemName}</p>
                      <p className="text-[10px] text-gray-400">
                        Ordered: {f.quantityOrdered} {f.unit}
                        {f.alreadyReceived > 0 && ` · Already received: ${f.alreadyReceived}`}
                        · Remaining: {remaining}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400">Unit: {f.unit}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Qty Received *</label>
                      <input
                        type="number"
                        min="0"
                        max={remaining}
                        step="0.01"
                        value={f.quantityReceived}
                        onChange={(e) => updateField(i, "quantityReceived", e.target.value)}
                        placeholder="0"
                        className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${received > remaining ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                      />
                      {received > remaining && (
                        <p className="text-[10px] text-red-500 mt-0.5">Exceeds remaining ({remaining})</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Qty Accepted</label>
                      <input
                        type="number"
                        min="0"
                        max={received}
                        step="0.01"
                        value={f.quantityAccepted}
                        onChange={(e) => updateField(i, "quantityAccepted", e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                        Rejected
                        {rejected > 0 && <span className="text-red-500"> ({rejected})</span>}
                      </label>
                      <div className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-500">
                        {rejected > 0 ? rejected : "0"}
                      </div>
                    </div>
                  </div>

                  {rejected > 0 && (
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                        Rejection Reason *
                      </label>
                      <input
                        type="text"
                        value={f.rejectionReason}
                        onChange={(e) => updateField(i, "rejectionReason", e.target.value)}
                        placeholder="e.g. Damaged in transit"
                        className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${rejected > 0 && !f.rejectionReason.trim() ? "border-red-300" : "border-gray-300"}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Any notes about this delivery..."
            />
          </div>

          <button
            onClick={handleCreateAndConfirm}
            disabled={!allValid}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Create & Confirm GRNs ({itemForms.filter((f) => (parseFloat(f.quantityReceived) || 0) > 0).length} items)
          </button>
        </>
      )}

      {/* Step: Creating / Confirming */}
      {(step === "creating" || step === "confirming") && (
        <div className="space-y-3 py-4">
          {createdGRNs.map((grn, i) => {
            const isPending = step === "creating" || (step === "confirming" && i >= createdGRNs.length);
            const isConfirming = step === "confirming" && i === confirmingIdx;
            const isDone = step === "confirming" && i < confirmingIdx;
            return (
              <div key={grn.id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  {isDone ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check size={12} className="text-emerald-600" />
                    </div>
                  ) : isConfirming ? (
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                  ) : isPending ? (
                    <div className="w-6 h-6 rounded-full bg-gray-200" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <X size={12} className="text-red-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {grn.po_item?.inventory_item_name
                        || grn.inventory_item?.name
                        || grn.grn_number
                        || "Creating..."}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {grn.id ? `GRN: ${grn.grn_number}` : "Processing..."}
                    </p>
                  </div>
                </div>
                {isDone && (
                  <span className="text-xs font-medium text-emerald-700">
                    {parseFloat(grn.quantity_accepted).toLocaleString()} accepted
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Step: Done — mark PO as received */}
      {step === "done" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800">All GRNs confirmed</p>
              <p className="text-xs text-emerald-600">{createdGRNs.length} GRN(s) created. Stock updated.</p>
            </div>
          </div>

          {/* Created GRNs summary */}
          {createdGRNs.length > 0 && (
            <div className="space-y-1">
              {createdGRNs.map((grn) => (
                <div key={grn.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">
                    {grn.po_item?.inventory_item_name
                      || grn.inventory_item?.name
                      || grn.grn_number}
                  </span>
                  <span className="text-gray-900 font-medium">
                    {parseFloat(grn.quantity_accepted).toLocaleString()} accepted
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleMarkReceived}
            disabled={markingReceived}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {markingReceived ? <Loader2 size={14} className="animate-spin" /> : <Package size={16} />}
            {markingReceived ? "Updating..." : "Mark PO as Received"}
          </button>
        </div>
      )}
    </div>
  );
}
