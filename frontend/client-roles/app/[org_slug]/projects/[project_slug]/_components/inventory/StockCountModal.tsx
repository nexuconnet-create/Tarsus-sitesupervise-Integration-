"use client";

import { useState, useRef } from "react";
import { X, ClipboardCheck, Upload, Image as ImageIcon, TrendingUp, TrendingDown } from "lucide-react";
import type { Material, Equipment, PPE } from "@/lib/types/inventory";
import { inventoryService } from "@/lib/services/inventoryService";
import { getErrorMessage } from "@/lib/error";
import toast from "react-hot-toast";

interface StockCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  allItems: (Material | Equipment | PPE)[];
  projectUuid: string;
}

export default function StockCountModal({
  isOpen,
  onClose,
  onCreated,
  allItems,
  projectUuid,
}: StockCountModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [selectedItemId, setSelectedItemId] = useState("");
  const [actualQuantity, setActualQuantity] = useState("");
  const [countDate, setCountDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedItem = allItems.find((i) => i.id === selectedItemId);
  const expectedQty = selectedItem ? selectedItem.currentStock : 0;
  const actual = parseFloat(actualQuantity || "0");
  const variance = selectedItemId && actualQuantity ? actual - expectedQty : null;
  const variancePct =
    variance !== null && expectedQty !== 0
      ? (variance / expectedQty) * 100
      : null;
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB.");
      return;
    }
    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !actualQuantity || !countDate) return;
    setIsSubmitting(true);
    try {
      let payload: FormData | { inventory_item_id: string; actual_quantity: string; count_date: string; notes?: string };
      if (imageFile) {
        const fd = new FormData();
        fd.append("inventory_item_id", selectedItemId);
        fd.append("actual_quantity", parseFloat(actualQuantity).toFixed(2));
        fd.append("count_date", countDate);
        if (notes) fd.append("notes", notes);
        fd.append("image", imageFile);
        payload = fd;
      } else {
        payload = {
          inventory_item_id: selectedItemId,
          actual_quantity: parseFloat(actualQuantity).toFixed(2),
          count_date: countDate,
          ...(notes ? { notes } : {}),
        };
      }
      await inventoryService.createStockCount(projectUuid, payload);
      toast.success("Stock count recorded successfully.");
      onCreated();
      handleClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedItemId("");
    setActualQuantity("");
    setCountDate(today);
    setNotes("");
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  if (!isOpen) return null;

  // Equipment items are blocked by the backend — filter them out for clarity
  const countableItems = allItems.filter((i) => i.type !== "equipment");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={handleClose}
        />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClipboardCheck className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Physical Stock Count
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Item selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Item <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedItemId}
                onChange={(e) => {
                  setSelectedItemId(e.target.value);
                  setActualQuantity("");
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Choose item to count…</option>
                {countableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — Current stock: {item.currentStock} {item.unit}
                  </option>
                ))}
              </select>

              {selectedItem && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">Type:</span>{" "}
                    <span className="font-medium capitalize">
                      {selectedItem.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Unit:</span>{" "}
                    <span className="font-medium">{selectedItem.unit}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Count date + actual quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Count Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={countDate}
                  max={today}
                  onChange={(e) => setCountDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Qty (System)
                </label>
                <input
                  type="number"
                  readOnly
                  value={selectedItemId ? expectedQty : ""}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="—"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Quantity (Physical Count){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                step="1"
                min="0"
                value={actualQuantity}
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => setActualQuantity(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="0"
              />
              {variance !== null && (
                <span className={`mt-2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold ${
                  variance === 0
                    ? "bg-green-100 text-green-700"
                    : Math.abs(variancePct ?? 0) > 10
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                }`}>
                  {variance === 0 ? (
                    "✓ quantity matches"
                  ) : variance < 0 ? (
                    <><TrendingDown className="w-3.5 h-3.5" />{Math.abs(variance)} {selectedItem?.unit ?? ""} short</>
                  ) : (
                    <><TrendingUp className="w-3.5 h-3.5" />+{variance} {selectedItem?.unit ?? ""} surplus</>
                  )}
                </span>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                placeholder="e.g. End-of-month physical count, counted with site manager present."
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Photo{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-purple-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imageFile ? (
                  <>
                    <ImageIcon className="w-6 h-6 text-purple-500" />
                    <p className="text-sm font-medium text-gray-700">
                      {imageFile.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(imageFile.size / 1024).toFixed(0)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Click to upload JPG or PNG (max 5 MB)
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Footer */}
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
                disabled={
                  isSubmitting ||
                  !selectedItemId ||
                  !actualQuantity ||
                  !countDate
                }
                className="px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <ClipboardCheck className="w-4 h-4" />
                {isSubmitting ? "Recording…" : "Record Count"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
