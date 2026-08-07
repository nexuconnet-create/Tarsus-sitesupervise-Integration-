"use client";

import { useState } from "react";
import { Plus, Trash2, Shield, AlertCircle, PlusCircle, ClipboardList } from "lucide-react";
import { useInventory } from "@/store/inventoryStore";
import type { PPE } from "@/lib/types/inventory";
import type { PPEResource } from "../types";

interface AddTaskPPESectionProps {
  ppe: PPEResource[];
  onChange: (ppe: PPEResource[]) => void;
  onAddToInventory?: (ppe: { name: string; unit: string; quantity: number; price?: number; size?: string }) => void;
  onCreateRequest?: (item: { itemId: string; itemName: string; unit: string; quantityRequested: number }) => void;
}

export default function AddTaskPPESection({
  ppe,
  onChange,
  onAddToInventory,
  onCreateRequest
}: AddTaskPPESectionProps) {
  const { ppe: inventoryPPE } = useInventory();
  const [showSelector, setShowSelector] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPPE, setSelectedPPE] = useState<PPE | null>(null);
  const [ppeQty, setPpeQty] = useState("1");
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
                <span className="text-xs text-gray-500">Qty: {item.quantity ?? "—"}{item.unit ? ` ${item.unit}` : ""}</span>
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
        <div className="p-4 border-t border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Select PPE from inventory</p>
            <button
              type="button"
              onClick={() => { setShowSelector(false); setSelectedPPE(null); }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availablePPE.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => { setSelectedPPE(item); setPpeQty("1"); setError(null); }}
                className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                  selectedPPE?.id === item.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <Shield size={16} className="text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    Stock: {item.currentStock} {item.unit}
                  </p>
                </div>
                <span className="text-xs text-gray-500">{item.size}</span>
              </button>
            ))}
          </div>

          {selectedPPE && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Quantity Needed
                </label>
                <input
                  type="number"
                  value={ppeQty}
                  onChange={(e) => setPpeQty(e.target.value)}
                  min="1"
                  step="1"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {parseInt(ppeQty) > selectedPPE.currentStock && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">Insufficient Stock</p>
                      <p className="text-xs text-red-600 mt-0.5">
                        Need: {ppeQty} | Available: {selectedPPE.currentStock} | Short: {parseInt(ppeQty) - selectedPPE.currentStock}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    {onCreateRequest && (
                      <button
                        type="button"
                        onClick={() => {
                          onCreateRequest({
                            itemId: selectedPPE.id,
                            itemName: selectedPPE.name,
                            unit: selectedPPE.unit || "pcs",
                            quantityRequested: parseInt(ppeQty) - selectedPPE.currentStock,
                          });
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
                      >
                        <ClipboardList size={12} />
                        Create Material Request
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const qty = parseInt(ppeQty, 10) || 1;
                        const newPPEResource: PPEResource = {
                          id: selectedPPE.id,
                          name: selectedPPE.name,
                          status: "reserved",
                          size: selectedPPE.size,
                          unit: selectedPPE.unit,
                          quantity: String(qty),
                          willGoNegative: true,
                          originalStock: selectedPPE.currentStock,
                          unitCost: selectedPPE.price,
                        };
                        onChange([...ppe, newPPEResource]);
                        setShowSelector(false);
                        setSelectedPPE(null);
                        setPpeQty("1");
                      }}
                      className="flex-1 px-3 py-1.5 border border-red-300 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {!(parseInt(ppeQty) > selectedPPE.currentStock) && (
                <button
                  type="button"
                  onClick={() => {
                    const qty = parseInt(ppeQty, 10) || 1;
                    const newPPEResource: PPEResource = {
                      id: selectedPPE.id,
                      name: selectedPPE.name,
                      status: "reserved",
                      size: selectedPPE.size,
                      unit: selectedPPE.unit,
                      quantity: String(qty),
                      unitCost: selectedPPE.price,
                    };
                    onChange([...ppe, newPPEResource]);
                    setShowSelector(false);
                    setSelectedPPE(null);
                    setPpeQty("1");
                  }}
                  className="w-full py-2 bg-[#021422] text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
                >
                  Add PPE
                </button>
              )}
            </div>
          )}
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
