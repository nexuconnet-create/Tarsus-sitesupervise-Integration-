"use client";

import { useState } from "react";
import { Plus, Trash2, Wrench, AlertCircle, PlusCircle, ClipboardList } from "lucide-react";
import { useInventory } from "@/store/inventoryStore";
import type { Equipment } from "@/lib/types/inventory";
import type { EquipmentResource } from "../types";

interface AddTaskEquipmentSectionProps {
  equipment: EquipmentResource[];
  onChange: (equipment: EquipmentResource[]) => void;
  onAddToInventory?: (equipment: { name: string; category: string; condition: string; price?: number }) => void;
  onCreateRequest?: (item: { itemId: string; itemName: string; unit: string; quantityRequested: number }) => void;
}

export default function AddTaskEquipmentSection({
  equipment,
  onChange,
  onAddToInventory,
  onCreateRequest
}: AddTaskEquipmentSectionProps) {
  const { equipment: inventoryEquipment } = useInventory();
  const [showSelector, setShowSelector] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [plannedDays, setPlannedDays] = useState("");
  // Demurrage — only meaningful for RENTED/LEASED equipment; the backend
  // rejects these on OWNED items. The picker doesn't track per-item
  // ownership, so both fields stay optional and are only sent if filled in
  // (same pattern as plannedDays above).
  const [plannedIdleDays, setPlannedIdleDays] = useState("");
  const [demurrageDailyRate, setDemurrageDailyRate] = useState("");
  const [error, setError] = useState<string | null>(null);

  // New equipment form state
  const [newEquipmentName, setNewEquipmentName] = useState("");
  const [newEquipmentCategory, setNewEquipmentCategory] = useState("Heavy Equipment");
  const [newEquipmentCondition, setNewEquipmentCondition] = useState("good");
  const [newEquipmentPrice, setNewEquipmentPrice] = useState("");

  const availableEquipment = inventoryEquipment.filter(
    (e) => e.status !== "low" && !equipment.find((te) => te.id === e.id)
  );

  const handleAdd = () => {
    if (!selectedEquipment) return;

    const qty = parseInt(quantity, 10) || 1;
    const willGoNegative = selectedEquipment.currentStock !== undefined && qty > selectedEquipment.currentStock;

    const newEquipment: EquipmentResource = {
      id: selectedEquipment.id,
      name: selectedEquipment.name,
      status: willGoNegative ? "pending" : "reserved",
      quantity: String(qty),
      plannedDays: plannedDays ? parseInt(plannedDays, 10) : undefined,
      plannedIdleDays: plannedIdleDays ? parseInt(plannedIdleDays, 10) : undefined,
      demurrageDailyRate: demurrageDailyRate ? parseFloat(demurrageDailyRate) : undefined,
      willGoNegative,
      originalStock: selectedEquipment.currentStock,
      unitCost: selectedEquipment.price,
    };

    onChange([...equipment, newEquipment]);
    setShowSelector(false);
    setSelectedEquipment(null);
    setQuantity("1");
    setPlannedDays("");
    setPlannedIdleDays("");
    setDemurrageDailyRate("");
  };

  const handleRemove = (id: string) => {
    onChange(equipment.filter((e) => e.id !== id));
  };

  const handleCreateAndAdd = () => {
    if (!newEquipmentName.trim()) {
      setError("Equipment name is required");
      return;
    }

    const price = newEquipmentPrice ? parseFloat(newEquipmentPrice) : undefined;

    const tempId = `new-eq-${Date.now()}`;
    const newEquipment: EquipmentResource = {
      id: tempId,
      name: newEquipmentName.trim(),
      status: "reserved",
      isNew: true,
      category: newEquipmentCategory,
      condition: newEquipmentCondition,
      unitCost: price,
      plannedDays: plannedDays ? parseInt(plannedDays, 10) : undefined,
    };

    if (onAddToInventory) {
      onAddToInventory({
        name: newEquipmentName.trim(),
        category: newEquipmentCategory,
        condition: newEquipmentCondition,
        price,
      });
    }

    onChange([...equipment, newEquipment]);
    setShowCreateForm(false);
    setNewEquipmentName("");
    setNewEquipmentCategory("Heavy Equipment");
    setNewEquipmentCondition("good");
    setNewEquipmentPrice("");
    setError(null);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent": return "text-green-600 bg-green-50";
      case "good": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
        <Wrench size={12} />
        Equipment {equipment.length > 0 && `(${equipment.length})`}
      </div>
      {equipment.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {equipment.map((eq) => (
              <div key={eq.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{eq.name}</p>
                    {eq.isNew && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                        NOT IN INVENTORY
                      </span>
                    )}
                    {eq.willGoNegative || eq.status === "pending" ? (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                        NEGATIVE STOCK
                      </span>
                    ) : eq.status === "requested" ? (
                      <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                        REQUESTED
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">Qty: {eq.quantity || "1"}</span>
                    {eq.plannedDays != null && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span className="text-xs text-gray-500">{eq.plannedDays} day{eq.plannedDays !== 1 ? "s" : ""}</span>
                      </>
                    )}
                    {eq.plannedIdleDays != null && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span className="text-xs text-amber-600">
                          {eq.plannedIdleDays} idle day{eq.plannedIdleDays !== 1 ? "s" : ""}
                          {eq.demurrageDailyRate != null && ` @ ₦${eq.demurrageDailyRate.toLocaleString()}/day`}
                        </span>
                      </>
                    )}
                    {eq.category && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span className="text-xs text-gray-400">{eq.category}</span>
                      </>
                    )}
                    {eq.condition && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getConditionColor(eq.condition)}`}>
                          {eq.condition}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(eq.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
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
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Select Equipment</h4>

          {availableEquipment.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No equipment available</p>
          ) : (
            <>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {availableEquipment.map((eq) => (
              <button
                type="button"
                key={eq.id}
                onClick={() => setSelectedEquipment(eq)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedEquipment?.id === eq.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{eq.name}</p>
                        <p className="text-xs text-gray-500">{eq.category}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getConditionColor(eq.condition)}`}>
                        {eq.condition}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {selectedEquipment && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Quantity Needed
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                      step="1"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Planned Days (optional)
                    </label>
                    <input
                      type="number"
                      value={plannedDays}
                      onChange={(e) => setPlannedDays(e.target.value)}
                      min="1"
                      max="3650"
                      step="1"
                      placeholder="e.g., 10"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Demurrage — rented/leased equipment only. The backend
                      rejects these on OWNED equipment; leave both blank for
                      owned items. */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Idle Days (optional)
                      </label>
                      <input
                        type="number"
                        value={plannedIdleDays}
                        onChange={(e) => setPlannedIdleDays(e.target.value)}
                        min="0"
                        max="3650"
                        step="1"
                        placeholder="Rented/leased only"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Standby Rate/Day (optional)
                      </label>
                      <input
                        type="number"
                        value={demurrageDailyRate}
                        onChange={(e) => setDemurrageDailyRate(e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="e.g., 5000"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {selectedEquipment.currentStock !== undefined && parseInt(quantity) > selectedEquipment.currentStock && (
                    <div className="border border-red-200 bg-red-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-red-700">Insufficient Stock</p>
                          <p className="text-xs text-red-600 mt-0.5">
                            Need: {quantity} | Available: {selectedEquipment.currentStock} | Short: {parseInt(quantity) - selectedEquipment.currentStock}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        {onCreateRequest && (
                          <button
                            type="button"
                            onClick={() => {
                              onCreateRequest({
                                itemId: selectedEquipment.id,
                                itemName: selectedEquipment.name,
                                unit: "pcs",
                                quantityRequested: parseInt(quantity) - selectedEquipment.currentStock,
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
                            handleAdd();
                            setQuantity("1");
                            setPlannedDays("");
                            setPlannedIdleDays("");
                            setDemurrageDailyRate("");
                          }}
                          className="flex-1 px-3 py-1.5 border border-red-300 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {!(selectedEquipment.currentStock !== undefined && parseInt(quantity) > selectedEquipment.currentStock) && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSelector(false);
                          setSelectedEquipment(null);
                          setQuantity("1");
                          setPlannedDays("");
                          setPlannedIdleDays("");
                          setDemurrageDailyRate("");
                        }}
                        className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!selectedEquipment}
                        className="flex-1 py-2 bg-[#021422] text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
                      >
                        Add Equipment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Create New Equipment */}
      {showCreateForm && (
        <div className="bg-white rounded-xl border-2 border-blue-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Create New Equipment</h4>
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
                Equipment Name *
              </label>
              <input
                type="text"
                value={newEquipmentName}
                onChange={(e) => setNewEquipmentName(e.target.value)}
                placeholder="e.g., Concrete Mixer 500L"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Category
                </label>
                <select
                  value={newEquipmentCategory}
                  onChange={(e) => setNewEquipmentCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="Heavy Equipment">Heavy Equipment</option>
                  <option value="Power Tools">Power Tools</option>
                  <option value="Measuring">Measuring</option>
                  <option value="Safety Equipment">Safety Equipment</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Condition
                </label>
                <select
                  value={newEquipmentCondition}
                  onChange={(e) => setNewEquipmentCondition(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="excellent">New</option>
                  <option value="good">Used</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Unit Price (₦)
              </label>
              <input
                type="number"
                value={newEquipmentPrice}
                onChange={(e) => setNewEquipmentPrice(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Planned Days (optional)
              </label>
              <input
                type="number"
                value={plannedDays}
                onChange={(e) => setPlannedDays(e.target.value)}
                min="1"
                max="3650"
                step="1"
                placeholder="e.g., 10"
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
                      setNewEquipmentName("");
                      setNewEquipmentPrice("");
                      setPlannedDays("");
                      setError(null);
                    }}
                    className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateAndAdd}
                    disabled={!newEquipmentName.trim()}
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
