"use client";

import { useState } from "react";
import { X, Plus, Trash2, Loader2, Minus } from "lucide-react";
import toast from "react-hot-toast";
import type { InventoryPO, InventoryPOItem } from "@/lib/types/inventoryPO";
import type {
  PurchaseOrderChange,
  PurchaseOrderChangeItem,
} from "@/lib/types/purchaseOrderChange";
import { purchaseOrderChangeService } from "@/lib/services/purchaseOrderChangeService";
import { purchaseOrderChangeFromApi } from "@/lib/transforms/purchaseOrderChangeTransforms";
import { getErrorMessage } from "@/lib/error";

interface CreateChangeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrders: InventoryPO[];
  projectId: string;
  inventoryItems: { id: string; name: string; type: string; unit: string }[];
  onCreated: (change: PurchaseOrderChange) => void;
}

type Step = "select-po" | "editing" | "submitting";

export default function CreateChangeOrderModal({
  isOpen,
  onClose,
  purchaseOrders,
  projectId,
  inventoryItems,
  onCreated,
}: CreateChangeOrderModalProps) {
  const [step, setStep] = useState<Step>("select-po");
  const [selectedPOId, setSelectedPOId] = useState("");
  const [reason, setReason] = useState("");
  const [createdChange, setCreatedChange] =
    useState<PurchaseOrderChange | null>(null);
  const [changeItems, setChangeItems] = useState<PurchaseOrderChangeItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [addItemId, setAddItemId] = useState("");
  const [addItemQty, setAddItemQty] = useState("");
  const [itemActionLoading, setItemActionLoading] = useState<string | null>(
    null,
  );

  const selectedPO = purchaseOrders.find((po) => po.uuid === selectedPOId);

  const eligiblePOs = purchaseOrders.filter((po) =>
    ["approved", "sent", "confirmed", "shipped", "partial"].includes(po.status),
  );

  // Items on the PO (for UPDATE/REMOVE context)
  const poItems = selectedPO?.items ?? [];

  // Inventory items NOT already on the PO (for ADD dropdown)
  const addableItems = inventoryItems.filter(
    (inv) =>
      !poItems.some((po) => po.inventoryItemId === inv.id) &&
      !changeItems.some(
        (ci) => ci.action === "ADD" && ci.inventoryItemId === inv.id,
      ),
  );

  const resetState = () => {
    setStep("select-po");
    setSelectedPOId("");
    setReason("");
    setCreatedChange(null);
    setChangeItems([]);
    setAddItemId("");
    setAddItemQty("");
    setIsSubmitting(false);
    setIsCreating(false);
    setItemActionLoading(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleCreateDraft = async () => {
    if (!selectedPOId || !reason.trim()) return;
    setIsCreating(true);
    try {
      const res = await purchaseOrderChangeService.createChange(
        projectId,
        selectedPOId,
        {
          reason: reason.trim(),
        },
      );
      const change = purchaseOrderChangeFromApi(res.data?.data ?? res.data);
      setCreatedChange(change);
      setChangeItems(change.items);
      setStep("editing");
      toast.success("Draft change order created");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddItem = async () => {
    if (!createdChange || !addItemId || !addItemQty) return;
    setItemActionLoading("add");
    try {
      const res = await purchaseOrderChangeService.addItem(
        projectId,
        createdChange.poUuid,
        createdChange.uuid,
        { inventory_item_id: addItemId, quantity: addItemQty },
      );
      const newItem = res.data?.data ?? res.data;
      setChangeItems((prev) => [...prev, newItem]);
      setAddItemId("");
      setAddItemQty("");
      toast.success("Item added");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setItemActionLoading(null);
    }
  };

  const handleUpdateQuantity = async (
    item: PurchaseOrderChangeItem,
    newQty: string,
  ) => {
    if (!createdChange || !newQty) return;
    setItemActionLoading(item.uuid);
    try {
      await purchaseOrderChangeService.updateItem(
        projectId,
        createdChange.poUuid,
        createdChange.uuid,
        item.uuid,
        { new_quantity: newQty },
      );
      setChangeItems((prev) =>
        prev.map((ci) =>
          ci.uuid === item.uuid
            ? { ...ci, newQuantity: parseFloat(newQty) || 0 }
            : ci,
        ),
      );
      toast.success("Quantity updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setItemActionLoading(null);
    }
  };

  const handleRemoveItem = async (item: PurchaseOrderChangeItem) => {
    if (!createdChange) return;
    if (item.action === "ADD") {
      // Remove an added item — no confirmation needed
      setItemActionLoading(item.uuid);
      try {
        await purchaseOrderChangeService.removeItem(
          projectId,
          createdChange.poUuid,
          createdChange.uuid,
          item.uuid,
        );
        setChangeItems((prev) => prev.filter((ci) => ci.uuid !== item.uuid));
        toast.success("Item removed");
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setItemActionLoading(null);
      }
    } else {
      // UPDATE/REMOVE — queue for removal
      if (!confirm(`Remove "${item.inventoryItemName}" from the PO?`)) return;
      setItemActionLoading(item.uuid);
      try {
        await purchaseOrderChangeService.removeItem(
          projectId,
          createdChange.poUuid,
          createdChange.uuid,
          item.uuid,
        );
        setChangeItems((prev) => prev.filter((ci) => ci.uuid !== item.uuid));
        toast.success("Item queued for removal");
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setItemActionLoading(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!createdChange) return;
    setIsSubmitting(true);
    try {
      const res = await purchaseOrderChangeService.submitChange(
        projectId,
        createdChange.poUuid,
        createdChange.uuid,
      );
      const updated = purchaseOrderChangeFromApi(res.data?.data ?? res.data);
      onCreated(updated);
      toast.success(`Change order ${updated.changeNumber} submitted`);
      handleClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {step === "select-po"
                  ? "New Change Order"
                  : `Edit ${createdChange?.changeNumber || "Change"}`}
              </h2>
              {step === "editing" && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Add, update, or remove items on this draft change order
                </p>
              )}
            </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Step 1: Select PO + Reason */}
            {step === "select-po" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Purchase Order <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPOId}
                    onChange={(e) => setSelectedPOId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select a purchase order...</option>
                    {eligiblePOs.map((po) => (
                      <option key={po.uuid} value={po.uuid}>
                        {po.poNumber} — {po.supplierName} ({po.status})
                      </option>
                    ))}
                  </select>
                  {eligiblePOs.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      No eligible POs. POs must be approved, sent, confirmed,
                      shipped, or partial.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why is this change needed?"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </>
            )}

            {/* Step 2: Edit Items */}
            {step === "editing" && createdChange && (
              <>
                {/* Current PO items — editable quantities */}
                {poItems.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Existing PO Items
                    </h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-medium text-gray-500">
                              Item
                            </th>
                            <th className="text-center py-2 px-2 font-medium text-gray-500">
                              Current Qty
                            </th>
                            <th className="text-center py-2 px-2 font-medium text-blue-600">
                              New Qty
                            </th>
                            <th className="text-right py-2 px-2 font-medium text-gray-500 w-20">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {poItems.map((poItem) => {
                            const changeItem = changeItems.find(
                              (ci) =>
                                ci.action === "UPDATE" &&
                                ci.poItemUuid === poItem.uuid,
                            );
                            const removeItem = changeItems.find(
                              (ci) =>
                                ci.action === "REMOVE" &&
                                ci.poItemUuid === poItem.uuid,
                            );
                            const isRemoved = !!removeItem;
                            const isEditing = !!changeItem;
                            const currentQty = changeItem
                              ? changeItem.newQuantity
                              : poItem.quantityOrdered;
                            const isLoading =
                              itemActionLoading === changeItem?.uuid ||
                              itemActionLoading === removeItem?.uuid;

                            return (
                              <tr
                                key={poItem.uuid}
                                className={`border-b border-gray-100 last:border-0 ${isRemoved ? "bg-red-50 opacity-60" : ""}`}
                              >
                                <td className="py-2.5 px-3">
                                  <p className="font-medium text-gray-900">
                                    {poItem.inventoryItemName}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {poItem.inventoryItemUnit}
                                  </p>
                                </td>
                                <td className="py-2.5 px-2 text-center text-gray-600 tabular-nums">
                                  {poItem.quantityOrdered}{" "}
                                  {poItem.inventoryItemUnit}
                                </td>
                                <td className="py-2.5 px-2">
                                  {isRemoved ? (
                                    <span className="text-red-500 text-[10px] font-medium">
                                      Removing...
                                    </span>
                                  ) : (
                                    <input
                                      type="number"
                                      min="0"
                                      step="1"
                                      defaultValue={poItem.quantityOrdered}
                                      onBlur={(e) => {
                                        const val = e.target.value;
                                        if (
                                          parseFloat(val) !==
                                          poItem.quantityOrdered
                                        ) {
                                          handleUpdateQuantity(
                                            {
                                              ...poItem,
                                              uuid:
                                                changeItem?.uuid || poItem.uuid,
                                              action: "UPDATE",
                                              inventoryItemId:
                                                poItem.inventoryItemId,
                                              inventoryItemName:
                                                poItem.inventoryItemName,
                                              inventoryItemUnit:
                                                poItem.inventoryItemUnit,
                                              poItemUuid: poItem.uuid,
                                              oldQuantity:
                                                poItem.quantityOrdered,
                                              newQuantity: parseFloat(val),
                                              createdAt: "",
                                            },
                                            val,
                                          );
                                        }
                                      }}
                                      className="w-20 text-center px-1.5 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                                    />
                                  )}
                                </td>
                                <td className="py-2.5 px-2 text-right">
                                  {!isRemoved && (
                                    <button
                                      onClick={() =>
                                        handleRemoveItem(
                                          changeItem || {
                                            uuid: poItem.uuid,
                                            action: "UPDATE",
                                            inventoryItemId:
                                              poItem.inventoryItemId,
                                            inventoryItemName:
                                              poItem.inventoryItemName,
                                            inventoryItemUnit:
                                              poItem.inventoryItemUnit,
                                            poItemUuid: poItem.uuid,
                                            oldQuantity: poItem.quantityOrdered,
                                            newQuantity: poItem.quantityOrdered,
                                            createdAt: "",
                                          },
                                        )
                                      }
                                      disabled={isLoading}
                                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                      title="Remove from PO"
                                    >
                                      {isLoading ? (
                                        <Loader2
                                          size={12}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Minus size={12} />
                                      )}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Add new item */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Add New Item
                  </h4>
                  {addableItems.length === 0 ? (
                    <p className="text-xs text-gray-400">
                      No more items available to add.
                    </p>
                  ) : (
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <select
                          value={addItemId}
                          onChange={(e) => setAddItemId(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Select item...</option>
                          {addableItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({item.type})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={addItemQty}
                          onChange={(e) => setAddItemQty(e.target.value)}
                          placeholder="Qty"
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={handleAddItem}
                        disabled={
                          !addItemId ||
                          !addItemQty ||
                          itemActionLoading === "add"
                        }
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {itemActionLoading === "add" ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Plus size={12} />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Items added to this change */}
                {changeItems.filter((ci) => ci.action === "ADD").length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Added Items
                    </h4>
                    <div className="space-y-1">
                      {changeItems
                        .filter((ci) => ci.action === "ADD")
                        .map((ci) => (
                          <div
                            key={ci.uuid}
                            className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"
                          >
                            <div>
                              <span className="text-xs font-medium text-emerald-800">
                                {ci.inventoryItemName}
                              </span>
                              <span className="text-[10px] text-emerald-600 ml-2">
                                × {ci.newQuantity} {ci.inventoryItemUnit}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(ci)}
                              disabled={itemActionLoading === ci.uuid}
                              className="p-1 text-emerald-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                            >
                              {itemActionLoading === ci.uuid ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Trash2 size={12} />
                              )}
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            {step === "select-po" && (
              <button
                onClick={handleCreateDraft}
                disabled={!selectedPOId || !reason.trim() || isCreating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? "Creating…" : "Create Draft"}
              </button>
            )}
            {step === "editing" && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || changeItems.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting…" : "Submit for Approval"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
