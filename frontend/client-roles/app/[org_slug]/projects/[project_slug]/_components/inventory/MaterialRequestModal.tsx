"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Material, Equipment, PPE, MaterialRequestPriority, MaterialRequest } from "@/lib/types/inventory";

interface MaterialRequestFormData {
  itemId: string;
  itemName: string;
  materialCode: string;
  unit: string;
  quantityRequested: number;
  priority: MaterialRequestPriority;
  notes: string;
}

interface MaterialRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MaterialRequestFormData) => void;
  inventoryItems?: (Material | Equipment | PPE)[];
  prefilledItem?: Material | Equipment | PPE | null;
  editRequest?: MaterialRequest | null;
}

const initialForm: MaterialRequestFormData = {
  itemId: "",
  itemName: "",
  materialCode: "",
  unit: "",
  quantityRequested: 1,
  priority: "medium",
  notes: "",
};

export default function MaterialRequestModal({ isOpen, onClose, onSubmit, inventoryItems = [], prefilledItem = null, editRequest = null }: MaterialRequestModalProps) {
  const getInitialFormData = (): MaterialRequestFormData => {
    if (editRequest) {
      const found = inventoryItems.find((i) => i.id === editRequest.itemId);
      return {
        itemId: editRequest.itemId,
        itemName: editRequest.itemName,
        materialCode: editRequest.materialCode || "",
        unit: editRequest.unit || found?.unit || "",
        quantityRequested: editRequest.quantityRequested,
        priority: editRequest.priority || "medium",
        notes: editRequest.notes || "",
      };
    }
    if (prefilledItem) {
      return {
        itemId: prefilledItem.id || "",
        itemName: prefilledItem.name,
        unit: prefilledItem.unit,
        materialCode:
          "materialCode" in prefilledItem
            ? (prefilledItem.materialCode as string)
            : "ppeCode" in prefilledItem
            ? (prefilledItem.ppeCode as string)
            : "",
        quantityRequested: 1,
        priority: "medium",
        notes: "",
      };
    }
    return initialForm;
  };

  const [formData, setFormData] = useState<MaterialRequestFormData>(getInitialFormData);
  const isEditing = !!editRequest;

  const allInventory = inventoryItems;

  const handleItemSelect = (id: string) => {
    const selected = allInventory.find((item) => item.id === id);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        itemId: id,
        itemName: selected.name,
        unit: selected.unit,
        materialCode:
          "materialCode" in selected
            ? (selected.materialCode as string)
            : "ppeCode" in selected
            ? (selected.ppeCode as string)
            : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, itemId: "", itemName: "", unit: "", materialCode: "" }));
    }
  };

  const handlePrefilledItemSelect = (item: Material | Equipment | PPE) => {
    setFormData({
      itemId: item.id || "",
      itemName: item.name,
      unit: item.unit,
      materialCode:
        "materialCode" in item
          ? (item.materialCode as string)
          : "ppeCode" in item
          ? (item.ppeCode as string)
          : "",
      quantityRequested: 1,
      priority: "medium",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId) return;
    onSubmit(formData);
    setFormData({ itemId: "", itemName: "", materialCode: "", unit: "", quantityRequested: 1, priority: "medium", notes: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">{isEditing ? "Edit Material Request" : "New Material Request"}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Item selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Item *
              </label>
              <select
                required
                value={formData.itemId}
                onChange={(e) => handleItemSelect(e.target.value)}
                disabled={!!prefilledItem || isEditing}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                  prefilledItem || isEditing ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed" : "border-gray-300"
                }`}
              >
                <option value="">Choose an inventory item...</option>
                {allInventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.type})
                  </option>
                ))}
              </select>
              {prefilledItem && (
                <p className="text-xs text-gray-500 mt-1">
                  Item pre-selected from stock alert
                </p>
              )}
            </div>

            {/* Auto-filled read-only fields */}
            {formData.itemId && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.unit}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                  />
                </div>
                {formData.materialCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.materialCode}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm font-mono"
                    />
                  </div>
                )}
              </div>
            )}

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority *
          </label>
          <select
            required
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaterialRequestPriority })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity Requested *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.quantityRequested}
            onChange={(e) =>
              setFormData({ ...formData, quantityRequested: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 50"
          />
        </div>

        {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="e.g., Required for WP-205 foundation work..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.itemId}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isEditing ? "Update Request" : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
