"use client";

const createLocalId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random()}`;

import React, { useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Send,
  Package,
  Calendar,
  MapPin,
  FileText,
  Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { MOCK_PM_REQUISITIONS, MOCK_PM_VENDORS, MOCK_QUOTES } from "@/lib/mockData/vendor";
import type { Quote } from "@/lib/types/vendor";
import { useVendorStore } from "@/store/vendorStore";

export default function NewPurchaseOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-[#021422]">Loading...</div></div>}>
      <NewPurchaseOrderForm />
    </Suspense>
  );
}

function NewPurchaseOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addPurchaseOrder = useVendorStore((s) => s.addPurchaseOrder);
  const requisitionId = searchParams.get("requisition") || "";
  const quoteId = searchParams.get("quote") || "";

  const requisition = MOCK_PM_REQUISITIONS.find((r) => r.id === requisitionId);
  const quote = quoteId ? MOCK_QUOTES.find((q) => q.id === quoteId) : null;
  const vendor = quote ? MOCK_PM_VENDORS.find((v) => v.id === quote.vendorId) : null;

  const [loading, setLoading] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(quote?.estimatedDelivery ? quote.estimatedDelivery.split("T")[0] : "");
  const [deliveryAddress, setDeliveryAddress] = useState(requisition?.deliveryAddress || "");
  const [notes, setNotes] = useState(quote?.notes || "");

  const items = quote?.items || requisition?.items || [];
  const totalAmount = items.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice * item.quantity), 0);

  const poNumber = useMemo(() => {
    const num = crypto.randomUUID()?.slice(0, 3);
    return `PO-2026-${num}`;
  }, []);

  const handleSubmit = async () => {
    if (!deliveryDate || !deliveryAddress) {
      toast.error("Please fill in delivery date and address");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const newPO = {
      id: createLocalId("po"),
      requisitionId: requisitionId || "",
      projectId: requisition?.projectId || "proj-1",
      vendorId: vendor?.id || "",
      poNumber,
      items: items.map((item) => ({ ...item })),
      totalAmount,
      status: "pending" as const,
      deliveryDate: new Date(deliveryDate).toISOString(),
      deliveryAddress,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
      vendorName: vendor?.companyName,
      projectName: requisition?.projectName,
    };

    addPurchaseOrder(newPO);
    toast.success(`Purchase Order ${poNumber} created!`);
    setLoading(false);
    router.push("/main-dashboard/project-manager/vendors/purchase-orders");
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
          <div className="text-2xl font-bold text-[#021422]">Create Purchase Order</div>
        </div>
        <div className="px-4 text-sm text-gray-500">
          {poNumber}
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto space-y-8">
        {/* Requisition + Vendor Info */}
        {requisition || quote ? (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                Order Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400 block text-xs mb-1">Requisition</span>
                  <span className="font-medium text-[#021422]">{requisition?.title || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs mb-1">Vendor</span>
                  <span className="font-medium text-[#021422]">{vendor?.companyName || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs mb-1">Project</span>
                  <span className="font-medium text-[#021422]">{requisition?.projectName || "—"}</span>
                </div>
                {requisition && (
                  <div>
                    <span className="text-gray-400 block text-xs mb-1">Priority</span>
                    <span className="font-medium text-[#021422] uppercase">{requisition.priority}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items (Pre-filled from quote or requisition) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Package size={14} /> Order Items
              </h3>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={item.id || idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-[#021422] text-sm">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                      <div>
                        <span className="text-gray-400 text-xs block">Quantity</span>
                        <span className="font-bold text-[#021422]">{item.quantity} {item.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs block">Unit Price</span>
                        <span className="font-bold text-[#021422]">₦{item.unitPrice.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs block">Total</span>
                        <span className="font-bold text-[#0166B0]">
                          ₦{(item.totalPrice || item.unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Grand Total</span>
                <span className="text-xl font-bold text-[#021422]">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                Delivery Details
              </h3>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Calendar size={14} /> Delivery Date *
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <MapPin size={14} /> Delivery Address *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123 Main Street, Victoria Island, Lagos"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <FileText size={14} /> Notes
                </label>
                <textarea
                  placeholder="Special delivery instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] resize-none"
                />
              </div>
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
                disabled={loading || !deliveryDate || !deliveryAddress}
                className="flex items-center gap-2 px-6 py-3 bg-[#021422] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {loading ? "Creating..." : "Create Purchase Order"}
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-500 mb-1">No requisition or quote selected</p>
            <p className="text-sm text-gray-400 mb-4">
              Go to My Requisitions, find an open requisition with quotes, and click &quot;Review&quot; to accept a quote and create a PO.
            </p>
            <button
              onClick={() => router.push("/main-dashboard/project-manager/vendors/requisitions")}
              className="text-sm font-bold text-[#0166B0] underline"
            >
              Go to Requisitions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
