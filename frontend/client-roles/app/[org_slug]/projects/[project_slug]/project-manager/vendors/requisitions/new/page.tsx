"use client";
import BackButton from "@/components/BackButton";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import {
  Send,
  Plus,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { MOCK_PM_VENDORS, MOCK_STOCK } from "@/lib/mockData/vendor";
import type { VendorStock } from "@/lib/types/vendor";

const priorities = ["low", "medium", "high", "urgent"];

interface FormItem {
  stockId: string;
  name: string;
  unit: string;
  unitPrice: number;
  quantity: number;
}

export default function NewRequisitionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-[#021422]">Loading...</div></div>}>
      <NewRequisitionForm />
    </Suspense>
  );
}

function NewRequisitionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const base = `/${orgSlug}/projects/${projectSlug}/project-manager`;
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [vendorId, setVendorId] = useState(searchParams.get("vendor") || "");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<FormItem[]>([]);
  const [stockOpen, setStockOpen] = useState<string | null>(null);
  const [broadcastType, setBroadcastType] = useState<"all" | "top_rated" | "specific">("all");

  const verifiedVendors = MOCK_PM_VENDORS.filter((v) => v.verificationStatus === "verified");
  const vendorStock = vendorId
    ? MOCK_STOCK.filter((s) => s.vendorId === vendorId)
    : MOCK_STOCK;

  const addItem = (stock: VendorStock) => {
    if (items.find((i) => i.stockId === stock.id)) {
      setStockOpen(null);
      return;
    }
    setItems((prev) => [
      ...prev,
      { stockId: stock.id, name: stock.name, unit: stock.unit, unitPrice: stock.price, quantity: 1 },
    ]);
    setStockOpen(null);
  };

  const updateItemQty = (stockId: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.stockId === stockId ? { ...i, quantity: qty } : i))
    );
  };

  const removeItem = (stockId: string) => {
    setItems((prev) => prev.filter((i) => i.stockId !== stockId));
  };

  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleSubmit = async () => {
    if (!title || items.length === 0) {
      toast.error("Please add a title and at least one item");
      return;
    }
    if (broadcastType === "specific" && !vendorId) {
      toast.error("Please select the vendor you want to send this RFQ to");
      return;
    }
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Requisition sent to vendor!");
    setLoading(false);
    router.push(`${base}/vendors/requisitions`);
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
          <div className="flex items-center gap-3"><BackButton /><div className="text-2xl font-bold text-[#021422]">New Requisition</div></div>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Requisition Details</h3>

          <input
            type="text"
            placeholder="Requisition Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422]"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} Priority</option>
            ))}
          </select>

          <textarea
            placeholder="Notes for vendor (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] resize-none"
          />
        </div>

        {/* Broadcast Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Broadcast To</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              broadcastType === "all"
                ? "border-[#021422] bg-[#021422]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}>
              <input
                type="radio"
                name="broadcastType"
                value="all"
                checked={broadcastType === "all"}
                onChange={() => {
                  setBroadcastType("all");
                  setVendorId("");
                  setItems([]);
                }}
                className="w-4 h-4 accent-[#021422]"
              />
              <div>
                <p className="font-bold text-[#021422] text-sm">All Vendors</p>
                <p className="text-xs text-gray-500">Sent to every verified vendor</p>
              </div>
            </label>
            <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              broadcastType === "top_rated"
                ? "border-[#021422] bg-[#021422]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}>
              <input
                type="radio"
                name="broadcastType"
                value="top_rated"
                checked={broadcastType === "top_rated"}
                onChange={() => {
                  setBroadcastType("top_rated");
                  setVendorId("");
                  setItems([]);
                }}
                className="w-4 h-4 accent-[#021422]"
              />
              <div>
                <p className="font-bold text-[#021422] text-sm">Top Rated Only</p>
                <p className="text-xs text-gray-500">Sent to vendors rated 4.0+</p>
              </div>
            </label>
            <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              broadcastType === "specific"
                ? "border-[#021422] bg-[#021422]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}>
              <input
                type="radio"
                name="broadcastType"
                value="specific"
                checked={broadcastType === "specific"}
                onChange={() => setBroadcastType("specific")}
                className="w-4 h-4 accent-[#021422]"
              />
              <div>
                <p className="font-bold text-[#021422] text-sm">Specific Vendor</p>
                <p className="text-xs text-gray-500">Send RFQ to one vendor only</p>
              </div>
            </label>
          </div>

          {broadcastType === "specific" && (
            <select
              value={vendorId}
              onChange={(e) => {
                setVendorId(e.target.value);
                setItems([]);
              }}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
            >
              <option value="">Select a vendor *</option>
              {verifiedVendors.map((v) => (
                <option key={v.id} value={v.id}>{v.companyName} — {v.businessType}</option>
              ))}
            </select>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Items</h3>
            <button
              onClick={() => setStockOpen(stockOpen ? null : "open")}
              className="flex items-center gap-1.5 text-sm font-bold text-[#0166B0] hover:text-[#014a80] transition-colors"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          {/* Stock Selector Dropdown */}
          {stockOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto"
            >
              {vendorStock.map((stock) => {
                const alreadyAdded = items.find((i) => i.stockId === stock.id);
                return (
                  <button
                    key={stock.id}
                    onClick={() => addItem(stock)}
                    disabled={!!alreadyAdded}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
                      alreadyAdded ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-[#021422]">{stock.name}</p>
                        <p className="text-xs text-gray-500">{stock.category} — {stock.quantity} {stock.unit} available</p>
                      </div>
                      <p className="text-sm font-bold text-[#021422]">
                        ₦{stock.price.toLocaleString()}/{stock.unit}
                      </p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* Selected Items */}
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.stockId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-1">
                    <p className="font-medium text-[#021422] text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">₦{item.unitPrice.toLocaleString()}/{item.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItemQty(item.stockId, parseInt(e.target.value) || 1)}
                      className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#021422]"
                    />
                    <span className="text-xs text-gray-500 w-10">{item.unit}</span>
                  </div>
                  <p className="text-sm font-bold text-[#021422] w-28 text-right">
                    ₦{(item.quantity * item.unitPrice).toLocaleString()}
                  </p>
                  <button onClick={() => removeItem(item.stockId)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total</span>
                <span className="text-xl font-bold text-[#021422]">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No items added yet. Click &quot;Add Item&quot; to select materials.</p>
            </div>
          )}
        </div>

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
            disabled={loading || !title || !vendorId || items.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-[#021422] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
            {loading ? "Sending..." : "Send Requisition"}
          </button>
        </div>
      </div>
    </div>
  );
}
