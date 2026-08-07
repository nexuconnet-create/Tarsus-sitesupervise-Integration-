"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import { inventoryPOFromApi } from "@/lib/transforms/inventoryPOTransforms";
import { getErrorMessage } from "@/lib/error";
import type { InventoryPO } from "@/lib/types/inventoryPO";
import type { Material, Equipment, PPE } from "@/lib/types/inventory";

interface LineItemDraft {
  key: number;
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: string;
  notes: string;
}

export interface PrefilledLineItem {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  notes?: string;
}

interface CreatePOModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  inventoryItems: (Material | Equipment | PPE)[];
  onCreated: (po: InventoryPO) => void;
  prefilledItems?: PrefilledLineItem[];
}

let keyCounter = 0;
const nextKey = () => ++keyCounter;

export default function CreatePOModal({
  isOpen,
  onClose,
  projectId,
  inventoryItems,
  onCreated,
  prefilledItems,
}: CreatePOModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const wasOpen = useRef(isOpen);

  const [form, setForm] = useState({
    supplierName: "",
    priority: "medium",
    orderDate: today,
    expectedDeliveryDate: "",
    notes: "",
  });
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!wasOpen.current && isOpen) {
      if (prefilledItems && prefilledItems.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLineItems(
          prefilledItems.map((item) => ({
            key: nextKey(),
            inventoryItemId: item.inventoryItemId,
            inventoryItemName: item.inventoryItemName,
            quantity: String(item.quantity),
            notes: item.notes || "",
          })),
        );
        setForm({
          supplierName: "",
          priority: "medium",
          orderDate: today,
          expectedDeliveryDate: "",
          notes: "",
        });
      } else {
        setForm({
          supplierName: "",
          priority: "medium",
          orderDate: today,
          expectedDeliveryDate: "",
          notes: "",
        });
        setLineItems([]);
      }
    }
    wasOpen.current = isOpen;
  }, [isOpen, prefilledItems, today]);

  const addLine = () =>
    setLineItems((prev) => [
      ...prev,
      {
        key: nextKey(),
        inventoryItemId: "",
        inventoryItemName: "",
        quantity: "",
        notes: "",
      },
    ]);

  const removeLine = (key: number) =>
    setLineItems((prev) => prev.filter((l) => l.key !== key));

  const updateLine = (key: number, field: keyof LineItemDraft, value: string) =>
    setLineItems((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        if (field === "inventoryItemId") {
          const item = inventoryItems.find((i) => i.id === value);
          return {
            ...l,
            inventoryItemId: value,
            inventoryItemName: item?.name ?? "",
          };
        }
        return { ...l, [field]: value };
      }),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplierName.trim()) {
      toast.error("Supplier name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: Parameters<typeof purchaseOrderService.createPO>[1] = {
        supplier_name: form.supplierName.trim(),
        priority: form.priority,
        order_date: form.orderDate,
        expected_delivery_date: form.expectedDeliveryDate || undefined,
        notes: form.notes.trim() || undefined,
      };

      const validLines = lineItems.filter(
        (l) => l.inventoryItemId && l.quantity,
      );
      if (validLines.length > 0) {
        payload.items = validLines.map((l) => ({
          inventory_item_id: l.inventoryItemId,
          quantity: l.quantity,
          unit_price: "",
          notes: l.notes || undefined,
        }));
      }

      const res = await purchaseOrderService.createPO(projectId, payload);
      const newPO = inventoryPOFromApi(
        res.data as Parameters<typeof inventoryPOFromApi>[0],
      );
      onCreated(newPO);
      toast.success(`PO created: ${newPO.poNumber || "Draft"}`);
      setForm({
        supplierName: "",
        priority: "medium",
        orderDate: today,
        expectedDeliveryDate: "",
        notes: "",
      });
      setLineItems([]);
      onClose();
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
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">
              Create Purchase Order
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
            <div className="p-6 space-y-5">
              {/* Supplier + Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.supplierName}
                    onChange={(e) =>
                      setForm({ ...form, supplierName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Dangote Industries Ltd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.orderDate}
                    onChange={(e) =>
                      setForm({ ...form, orderDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Delivery
                  </label>
                  <input
                    type="date"
                    value={form.expectedDeliveryDate}
                    min={form.orderDate}
                    onChange={(e) =>
                      setForm({ ...form, expectedDeliveryDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Items{" "}
                  </label>
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                {lineItems.length === 0 && (
                  <p className="text-xs text-gray-400 py-2">
                    No items added. You can add items to a draft PO after
                    creation.
                  </p>
                )}

                {lineItems.map((line) => (
                  <div key={line.key} className="flex items-end gap-2 mb-2">
                    <div className="flex-1">
                      <select
                        value={line.inventoryItemId}
                        onChange={(e) =>
                          updateLine(
                            line.key,
                            "inventoryItemId",
                            e.target.value,
                          )
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select item…</option>
                        {inventoryItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.type})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24 shrink-0">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Qty *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(line.key, "quantity", e.target.value)
                        }
                        placeholder="0"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors mb-0.5 shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="e.g., Urgent — site running low on rebar."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Creating…" : "Create Draft PO"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
