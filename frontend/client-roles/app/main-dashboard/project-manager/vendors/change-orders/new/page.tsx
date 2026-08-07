"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Plus, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { MOCK_PM_PURCHASE_ORDERS } from "@/lib/mockData/vendor";

interface FormItem {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  quantity: number;
}

export default function NewChangeOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [changedItems, setChangedItems] = useState<FormItem[]>([]);

  const confirmedPOs = MOCK_PM_PURCHASE_ORDERS.filter(
    (po) => po.status === "confirmed" || po.status === "pending",
  );

  const selectedPO = MOCK_PM_PURCHASE_ORDERS.find(
    (p) => p.id === purchaseOrderId,
  );

  const originalTotal =
    selectedPO?.items.reduce(
      (sum, i) => sum + (i.totalPrice || i.quantity * i.unitPrice),
      0,
    ) || 0;
  const changedTotal = changedItems.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice,
    0,
  );
  const costDifference = changedTotal - originalTotal;

  const loadPOItems = (poId: string) => {
    setPurchaseOrderId(poId);
    const po = MOCK_PM_PURCHASE_ORDERS.find((p) => p.id === poId);
    if (po) {
      setChangedItems(
        po.items.map((item) => ({
          id: item.id,
          name: item.name,
          unit: item.unit,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
      );
    }
  };

  const updateItemQty = (id: string, qty: number) => {
    setChangedItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );
  };

  const updateItemPrice = (id: string, price: number) => {
    setChangedItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, unitPrice: price } : i)),
    );
  };

  const removeItem = (id: string) => {
    setChangedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const addItem = () => {
    setChangedItems((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: "New Item",
        unit: "pcs",
        unitPrice: 0,
        quantity: 1,
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!title || !purchaseOrderId || !reason) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Change order submitted!");
    setLoading(false);
    router.push("/main-dashboard/project-manager/vendors/change-orders");
  };

  return (
    <div className="pb-24">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="text-2xl font-bold text-[#021422]">
            New Change Order
          </div>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
            Change Order Details
          </h3>

          <input
            type="text"
            placeholder="Change Order Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422]"
          />

          <select
            value={purchaseOrderId}
            onChange={(e) => loadPOItems(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
          >
            <option value="">Select Purchase Order *</option>
            {confirmedPOs.map((po) => (
              <option key={po.id} value={po.id}>
                {po.poNumber} — {po.vendorName} — ₦
                {po.totalAmount.toLocaleString()}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Reason for change *"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422]"
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] resize-none"
          />
        </div>

        {/* Items */}
        {purchaseOrderId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            {/*<div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Modified Items</h3>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-sm font-bold text-[#0166B0] hover:text-[#014a80]"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>*/}

            {/* Original vs Changed */}
            {selectedPO && (
              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <div className="text-center">Original Items</div>
                <div className="text-center">Changed Items</div>
              </div>
            )}

            {selectedPO && (
              <div className="grid grid-cols-2 gap-4">
                {/* Original */}
                <div className="space-y-2">
                  {selectedPO.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-red-50 rounded-lg p-3 border border-red-100"
                    >
                      <p className="font-medium text-[#021422] text-xs">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.quantity} {item.unit} &times; ₦
                        {item.unitPrice.toLocaleString()}
                      </p>
                      <p className="text-xs font-bold text-red-600 mt-0.5">
                        ₦
                        {(
                          item.totalPrice || item.quantity * item.unitPrice
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Changed */}
                <div className="space-y-2">
                  {changedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-green-50 rounded-lg p-3 border border-green-100"
                    >
                      <p className="font-medium text-[#021422] text-xs mb-2">
                        {item.name}
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={0}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemQty(
                              item.id,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-16 border border-gray-200 rounded px-2 py-1 text-xs text-center bg-white"
                        />
                        <span className="text-xs text-gray-500 self-center">
                          {item.unit}
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItemPrice(
                              item.id,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-24 border border-gray-200 rounded px-2 py-1 text-xs text-center bg-white"
                        />
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={12} className="text-red-500" />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-green-600 mt-1">
                        ₦{(item.quantity * item.unitPrice).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Difference */}
            <div className="bg-gray-50 rounded-xl p-5 text-center">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Cost Difference
              </p>
              <span
                className={`text-2xl font-bold ${costDifference > 0 ? "text-red-600" : costDifference < 0 ? "text-green-600" : "text-gray-600"}`}
              >
                {costDifference > 0 ? "+" : ""}₦
                {costDifference.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title || !purchaseOrderId || !reason}
            className="flex items-center gap-2 px-6 py-3 bg-[#021422] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
            {loading ? "Submitting..." : "Submit Change Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
