"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { X, Package, ArrowRightLeft, Camera, Shield } from "lucide-react";
import type { Material, Equipment, PPE, MovementType } from "@/lib/types/inventory";

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMovement: (
    itemType: "material" | "equipment" | "ppe",
    itemId: string,
    movementType: MovementType,
    quantity: number,
    data?: {
      fromLocation?: string;
      toLocation?: string;
      workerId?: string;
      workerName?: string;
      authorizedBy?: string;
      notes?: string;
      arVerificationUrl?: string;
    }
  ) => void;
  allItems: (Material | Equipment | PPE)[];
}

export default function StockMovementModal({
  isOpen,
  onClose,
  onCreateMovement,
  allItems,
}: StockMovementModalProps) {
  const [selectedType, setSelectedType] = useState<"material" | "equipment" | "ppe" | "">("");
  const [selectedItem, setSelectedItem] = useState("");
  const [movementType, setMovementType] = useState<MovementType>("receipt");
  const [quantity, setQuantity] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onCreateMovement(
      selectedType as any,
      selectedItem,
      movementType,
      movementType === "issue" || movementType === "adjustment" ? -parseFloat(quantity) : parseFloat(quantity),
      {
        fromLocation: fromLocation || undefined,
        toLocation: toLocation || undefined,
        authorizedBy: authorizedBy || "Site Manager",
        notes: notes || undefined,
      }
    );
    
    setIsSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    setSelectedType("");
    setSelectedItem("");
    setMovementType("receipt");
    setQuantity("");
    setFromLocation("");
    setToLocation("");
    setAuthorizedBy("");
    setNotes("");
    onClose();
  };

  const filteredItems = allItems.filter(item => item.type === selectedType);
  const selectedItemData = allItems.find(item => item.id === selectedItem);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />
        
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowRightLeft className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Record Stock Movement</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {(["material", "equipment", "ppe"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setSelectedType(type); setSelectedItem(""); }}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    selectedType === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {selectedType && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Item *
                  </label>
                  <select
                    required
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose {selectedType}...</option>
                    {filteredItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - Stock: {item.currentStock} {item.unit}
                      </option>
                    ))}
                  </select>
                  {selectedItemData && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-500">Code:</span>{" "}
                          {"materialCode" in selectedItemData ? selectedItemData.materialCode :
                           "equipmentCode" in selectedItemData ? selectedItemData.equipmentCode :
                           selectedItemData.ppeCode}
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>{" "}
                          {"storageLocation" in selectedItemData ? selectedItemData.storageLocation :
                           "currentLocation" in selectedItemData ? selectedItemData.currentLocation :
                           "N/A"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Movement Type *
                  </label>
                  <select
                    required
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value as MovementType)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="receipt">Receipt (Stock In)</option>
                    <option value="issue">Issue (Stock Out)</option>
                    <option value="transfer">Transfer</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="return">Return</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {(movementType === "transfer" || movementType === "receipt") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Location
                      </label>
                      <input
                        type="text"
                        value={fromLocation}
                        onChange={(e) => setFromLocation(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={movementType === "transfer" ? "Source location" : "e.g., Vendor"}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={movementType === "transfer" ? "Destination" : "e.g., Grid B5"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authorized By
                  </label>
                  <input
                    type="text"
                    value={authorizedBy}
                    onChange={(e) => setAuthorizedBy(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Site Manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder="Additional details..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedType || !selectedItem || !quantity}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    {isSubmitting ? "Recording..." : "Record Movement"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
