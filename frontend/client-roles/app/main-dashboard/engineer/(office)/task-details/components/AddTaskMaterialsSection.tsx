"use client";

import { useState } from "react";
import { Plus, Trash2, Package, AlertCircle, PlusCircle } from "lucide-react";
import { useInventory, getStockLevel } from "@/store/inventoryStore";
import type { Material } from "@/lib/types/inventory";
import { INVENTORY_CATEGORIES } from "@/lib/types/inventory";
import type { MaterialResource } from "../types";

interface AddTaskMaterialsSectionProps {
  materials: MaterialResource[];
  onChange: (materials: MaterialResource[]) => void;
  onAddToInventory?: (material: { name: string; category: string; unit: string; quantity: number; price?: number }) => void;
}

export default function AddTaskMaterialsSection({ 
  materials, 
  onChange,
  onAddToInventory 
}: AddTaskMaterialsSectionProps) {
  const { materials: inventoryMaterials, allocateMaterial } = useInventory();
  const [showSelector, setShowSelector] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);
  
  // New material form state
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialCategory, setNewMaterialCategory] = useState("Reinforced Concrete");
  const [newMaterialUnit, setNewMaterialUnit] = useState("pcs");
  const [newMaterialQty, setNewMaterialQty] = useState("1");
  const [newMaterialPrice, setNewMaterialPrice] = useState("");

  const availableMaterials = inventoryMaterials.filter(
    (m) => !materials.find((tm) => tm.id === m.id)
  );

  const handleAddFromInventory = () => {
    if (!selectedMaterial) return;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError("Enter valid quantity");
      return;
    }

    // Check if it will go negative
    const willGoNegative = qty > selectedMaterial.currentStock;
    
    const newMaterial: MaterialResource = {
      id: selectedMaterial.id,
      name: selectedMaterial.name,
      quantity: qty.toString(),
      unit: selectedMaterial.unit,
      status: "pending",
      willGoNegative,
      originalStock: selectedMaterial.currentStock,
      unitCost: selectedMaterial.price,
    };

    // Try to allocate from inventory
    const result = allocateMaterial(selectedMaterial.id, qty);
    
    if (!result.success && !willGoNegative) {
      setError(result.error || "Failed to allocate material");
      return;
    }

    onChange([...materials, newMaterial]);
    setShowSelector(false);
    setSelectedMaterial(null);
    setQuantity("1");
    setError(null);
  };

const handleCreateAndAdd = () => {
		if (!newMaterialName.trim()) {
			setError("Material name is required");
			return;
		}

		const qty = parseInt(newMaterialQty, 10);
		if (isNaN(qty) || qty <= 0) {
			setError("Enter valid quantity (whole number)");
			return;
		}

    const price = newMaterialPrice ? parseFloat(newMaterialPrice) : undefined;

    const tempId = `new-mat-${Date.now()}`;
    const newMaterial: MaterialResource = {
      id: tempId,
      name: newMaterialName.trim(),
      quantity: qty.toString(),
      unit: newMaterialUnit,
      status: "pending",
      isNew: true,
      category: newMaterialCategory,
      unitCost: price,
    };

    // Add to inventory if callback provided
    if (onAddToInventory) {
      onAddToInventory({
        name: newMaterialName.trim(),
        category: newMaterialCategory,
        unit: newMaterialUnit,
        quantity: qty,
        price,
      });
    }

    onChange([...materials, newMaterial]);
    setShowCreateForm(false);
    setNewMaterialName("");
    setNewMaterialCategory("Reinforced Concrete");
    setNewMaterialUnit("pcs");
    setNewMaterialQty("1");
    setNewMaterialPrice("");
    setError(null);
  };

  const handleRemove = (id: string) => {
    onChange(materials.filter((m) => m.id !== id));
  };

  const getMaterialStockInfo = (material: MaterialResource) => {
    const inventoryMat = inventoryMaterials.find((m) => m.id === material.id);
    if (!inventoryMat) return null;
    
    const remaining = inventoryMat.currentStock;
    
    if (remaining < 0) {
      return { text: `${remaining} ${material.unit}`, isNegative: true };
    }
    return { text: `${remaining} ${material.unit} remaining`, isNegative: false };
  };

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
        <Package size={12} />
        Materials {materials.length > 0 && `(${materials.length})`}
      </div>
      {materials.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {materials.map((mat) => {
              const stockInfo = getMaterialStockInfo(mat);
              return (
                <div key={mat.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{mat.name}</p>
                      {mat.isNew && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                          NEW
                        </span>
                      )}
                      {mat.willGoNegative && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                          NEGATIVE STOCK
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500">
                        Need: {mat.quantity} {mat.unit}
                      </p>
                      {stockInfo && (
                        <>
                          <span className="text-gray-300">|</span>
                          <p className={`text-xs ${stockInfo.isNegative ? "text-red-600 font-medium" : "text-gray-400"}`}>
                            {stockInfo.isNegative ? "After use: " : ""}{stockInfo.text}
                          </p>
                        </>
                      )}
</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		)}

      {/* Action Buttons */}
      {!showSelector && !showCreateForm && (
        <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowSelector(true)}
          className="flex-1 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          From Inventory
        </button>
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="flex-1 py-3 border-2 border-dashed border-blue-300 rounded-xl text-sm font-medium text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle size={16} />
          Create New
        </button>
        </div>
      )}

      {/* Select from Inventory */}
      {showSelector && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Select from Inventory</h4>
          <button
            type="button"
            onClick={() => {
              setShowSelector(false);
              setSelectedMaterial(null);
              setError(null);
            }}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          </div>
          
          {availableMaterials.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No materials available in inventory</p>
          ) : (
            <>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {availableMaterials.map((mat) => {
                  const level = getStockLevel(mat);
                  const isLowStock = level === "low" || level === "out";
                  return (
              <button
                type="button"
                key={mat.id}
                onClick={() => {
                  setSelectedMaterial(mat);
                  setError(null);
                }}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedMaterial?.id === mat.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{mat.name}</p>
                          <p className="text-xs text-gray-500">{mat.category}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${isLowStock ? "text-red-600" : "text-gray-900"}`}>
                            {mat.currentStock} {mat.unit}
                          </p>
                          <p className={`text-xs ${
                            level === "out" ? "text-red-500" :
                            level === "low" ? "text-orange-500" :
                            level === "limited" ? "text-yellow-600" : "text-green-600"
                          }`}>
                            {level === "out" ? "Out" : level === "low" ? "Low Stock" : level === "limited" ? "Limited" : "Available"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedMaterial && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Quantity Needed ({selectedMaterial.unit})
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(e.target.value);
                        setError(null);
                      }}
                      min="0.1"
                      step="0.1"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {parseFloat(quantity) > selectedMaterial.currentStock && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={10} />
                        Will create negative stock: -{parseFloat(quantity) - selectedMaterial.currentStock} {selectedMaterial.unit}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-center gap-1.5 text-red-500 text-xs">
                      <AlertCircle size={12} />
                      {error}
                    </div>
                  )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSelector(false);
                      setSelectedMaterial(null);
                      setQuantity("1");
                      setError(null);
                    }}
                    className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddFromInventory}
                    className="flex-1 py-2 bg-[#021422] text-white rounded-lg text-sm font-medium hover:bg-gray-900"
                  >
                    Add Material
                  </button>
                </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Create New Material */}
      {showCreateForm && (
        <div className="bg-white rounded-xl border-2 border-blue-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Create New Material</h4>
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
                Material Name *
              </label>
              <input
                type="text"
                value={newMaterialName}
                onChange={(e) => setNewMaterialName(e.target.value)}
                placeholder="e.g., Special Concrete Mix"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Category
                </label>
<select
  value={newMaterialCategory}
  onChange={(e) => setNewMaterialCategory(e.target.value)}
  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
>
  {INVENTORY_CATEGORIES.map((cat) => (
    <option key={cat} value={cat}>{cat}</option>
  ))}
</select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Unit
                </label>
                <select
                  value={newMaterialUnit}
                  onChange={(e) => setNewMaterialUnit(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="pcs">Pieces</option>
                  <option value="m">Meters</option>
                  <option value="m2">Square Meters</option>
                  <option value="m3">Cubic Meters</option>
                  <option value="kg">Kilograms</option>
                  <option value="tons">Tons</option>
                  <option value="bags">Bags</option>
                </select>
              </div>
            </div>

<div>
								<label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
									Quantity Needed
								</label>
								<input
									type="number"
									value={newMaterialQty}
									onChange={(e) => setNewMaterialQty(e.target.value)}
									min="1"
									step="1"
									className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<p className="text-xs text-gray-400 mt-1">
									This will be added to inventory with negative stock
								</p>
							</div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Unit Price (₦)
              </label>
              <input
                type="number"
                value={newMaterialPrice}
                onChange={(e) => setNewMaterialPrice(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                      setNewMaterialName("");
                      setNewMaterialQty("1");
                      setNewMaterialPrice("");
                      setError(null);
                    }}
                    className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateAndAdd}
                    disabled={!newMaterialName.trim()}
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
