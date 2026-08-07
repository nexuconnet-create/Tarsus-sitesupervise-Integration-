"use client";

import { useState } from "react";
import { Plus, Trash2, Shield, AlertCircle, PlusCircle } from "lucide-react";
import { useInventory } from "@/store/inventoryStore";
import type { PPE } from "@/lib/types/inventory";
import type { PPEResource } from "../types";

interface AddTaskPPESectionProps {
  ppe: PPEResource[];
  onChange: (ppe: PPEResource[]) => void;
  onAddToInventory?: (ppe: { name: string; unit: string; quantity: number; price?: number; size?: string }) => void;
}

export default function AddTaskPPESection({
  ppe,
  onChange,
  onAddToInventory
}: AddTaskPPESectionProps) {
  const { ppe: inventoryPPE } = useInventory();
  const [showSelector, setShowSelector] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPPE, setSelectedPPE] = useState<PPE | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newPPEName, setNewPPEName] = useState("");
  const [newPPEUnit, setNewPPEUnit] = useState("pcs");
  const [newPPEQty, setNewPPEQty] = useState("1");
  const [newPPEPrice, setNewPPEPrice] = useState("");
  const [newPPESize, setNewPPESize] = useState("");

  const availablePPE = inventoryPPE.filter(
    (p) => !ppe.find((tp) => tp.id === p.id)
  );

  const handleRemove = (id: string) => {
    onChange(ppe.filter((p) => p.id !== id));
  };

const handleCreateAndAdd = () => {
		if (!newPPEName.trim()) {
			setError("PPE name is required");
			return;
		}

		const qty = parseInt(newPPEQty, 10);
		if (isNaN(qty) || qty <= 0) {
			setError("Enter valid quantity (whole number)");
			return;
		}

    const price = newPPEPrice ? parseFloat(newPPEPrice) : undefined;

    const tempId = `new-ppe-${Date.now()}`;
    const newPPEResource: PPEResource = {
      id: tempId,
      name: newPPEName.trim(),
      status: "reserved",
      isNew: true,
      unit: newPPEUnit,
      quantity: newPPEQty,
      size: newPPESize || undefined,
      unitCost: price,
    };

    if (onAddToInventory) {
      onAddToInventory({
        name: newPPEName.trim(),
        unit: newPPEUnit,
        quantity: qty,
        price,
        size: newPPESize || undefined,
      });
    }

    onChange([...ppe, newPPEResource]);
    setShowCreateForm(false);
    setNewPPEName("");
    setNewPPEUnit("pcs");
    setNewPPEQty("1");
    setNewPPEPrice("");
    setNewPPESize("");
    setError(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Shield size={16} className="text-gray-400" />
          Selected PPE ({ppe.length})
        </h4>
      </div>
      <div className="divide-y divide-gray-100">
        {ppe.map((item) => (
          <div key={item.id} className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                {item.isNew && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                    NOT IN INVENTORY
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">Reserved</span>
                {item.size && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-400">Size: {item.size}</span>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {!showSelector && !showCreateForm && (
        <div className="flex gap-3 p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowSelector(true)}
            className="flex-1 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            From Inventory
          </button>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="flex-1 py-2 border-2 border-dashed border-blue-300 rounded-xl text-sm font-medium text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <PlusCircle size={16} />
            Create New
          </button>
        </div>
      )}

      {showSelector && (
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-3">Select PPE from inventory</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availablePPE.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  const newPPEResource: PPEResource = {
                    id: item.id,
                    name: item.name,
                    status: "reserved",
                    size: item.size,
                    unit: item.unit,
                    unitCost: item.price,
                  };
                  onChange([...ppe, newPPEResource]);
                  setShowSelector(false);
                }}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center gap-3"
              >
                <Shield size={16} className="text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    PPE • Stock: {item.currentStock} {item.unit}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowSelector(false)}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white rounded-xl border-2 border-blue-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Create New PPE</h4>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setError(null);
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                PPE Name *
              </label>
              <input
                type="text"
                value={newPPEName}
                onChange={(e) => setNewPPEName(e.target.value)}
                placeholder="e.g., Safety Helmet, Hand Gloves"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Size
                </label>
                <input
                  type="text"
                  value={newPPESize}
                  onChange={(e) => setNewPPESize(e.target.value)}
                  placeholder="e.g., S/M/L, One Size"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Unit *
                </label>
                <input
                  type="text"
                  value={newPPEUnit}
                  onChange={(e) => setNewPPEUnit(e.target.value)}
                  placeholder="e.g., pcs, pairs"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Quantity Needed
                </label>
                <input
                  type="number"
                  value={newPPEQty}
                  onChange={(e) => setNewPPEQty(e.target.value)}
                  min="1"
                  step="1"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Unit Price (₦)
                </label>
                <input
                  type="number"
                  value={newPPEPrice}
                  onChange={(e) => setNewPPEPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-red-500 text-xs">
                <AlertCircle size={12} />
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewPPEName("");
                  setNewPPEPrice("");
                  setError(null);
                }}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateAndAdd}
                disabled={!newPPEName.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Create & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
