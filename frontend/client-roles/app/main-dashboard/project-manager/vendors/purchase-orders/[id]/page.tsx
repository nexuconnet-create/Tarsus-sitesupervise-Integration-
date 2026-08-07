"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ChevronLeft,
  Package,
  MapPin,
  Calendar,
  Building2,
  Check,
  Clock,
  FileText,
  ShieldCheck,
  Truck,
  MessageSquare,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { MOCK_PM_PURCHASE_ORDERS } from "@/lib/mockData/vendor";
import type { PurchaseOrder, InvoiceStatus } from "@/lib/types/vendor";
import { useVendorStore } from "@/store/vendorStore";

const statusSteps = ["pending", "confirmed", "in_transit", "delivered"];
const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_transit: "In Transit",
  delivered: "Delivered",
};

const invoiceSteps: InvoiceStatus[] = ["submitted", "approved", "paid"];
const invoiceLabels: Record<InvoiceStatus, string> = {
  submitted: "Submitted",
  approved: "Approved",
  paid: "Paid",
};

export default function PMPODetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const purchaseOrders = useVendorStore((s) => s.purchaseOrders);
  const setInvoiceStatus = useVendorStore((s) => s.setInvoiceStatus);
  const setEscrowStatus = useVendorStore((s) => s.setEscrowStatus);
  const po = purchaseOrders.find((p) => p.id === params.id) || null;
  const [actionLoading, setActionLoading] = useState(false);

  const handleApproveInvoice = async () => {
    if (!po) return;
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setInvoiceStatus(po.id, "approved");
    toast.success("Invoice approved");
    setActionLoading(false);
  };

  const handleMarkPaid = async () => {
    if (!po) return;
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setInvoiceStatus(po.id, "paid");
    toast.success("Marked as paid");
    setActionLoading(false);
  };

  const handleReleaseEscrow = async () => {
    if (!po) return;
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setEscrowStatus(po.id, "released");
    toast.success("Escrow payment released to vendor");
    setActionLoading(false);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700",
      confirmed: "bg-green-50 text-green-700",
      in_transit: "bg-blue-50 text-blue-700",
      delivered: "bg-emerald-50 text-emerald-700",
      cancelled: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || "bg-gray-100 text-gray-600"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const invoiceStatusBadge = (status: InvoiceStatus) => {
    const styles: Record<InvoiceStatus, string> = {
      submitted: "bg-yellow-50 text-yellow-700",
      approved: "bg-blue-50 text-blue-700",
      paid: "bg-emerald-50 text-emerald-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#021422]">
        <Loader2 size={28} className="animate-spin text-[#0166B0]" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#021422]">
        <p className="font-bold mb-4">Purchase Order not found</p>
        <button onClick={() => router.back()} className="text-sm text-[#0166B0] underline">Go back</button>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(po.status);
  const invoiceStepIndex = po.invoiceStatus ? invoiceSteps.indexOf(po.invoiceStatus) : -1;

  return (
    <div className="pb-24">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="text-2xl font-bold text-[#021422]">{po.poNumber}</div>
          {statusBadge(po.status)}
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto space-y-8">
        {/* Status Timeline */}
        {po.status !== "cancelled" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Status Timeline</h3>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCompleted ? isCurrent ? "bg-[#0166B0] text-white ring-4 ring-blue-100" : "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                      }`}>
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      <span className={`text-xs font-medium ${isCurrent ? "text-[#021422]" : "text-gray-400"}`}>
                        {statusLabels[step]}
                      </span>
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${idx < currentStepIndex ? "bg-green-400" : "bg-gray-200"}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Invoice Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <FileText size={14} /> Invoice
            </h3>
            {po.invoiceStatus && invoiceStatusBadge(po.invoiceStatus)}
          </div>

          {po.invoice ? (
            <>
              {/* Invoice details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold text-[#021422]">₦{po.invoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Submitted</span>
                  <span className="text-gray-500">{new Date(po.invoice.submittedAt).toLocaleDateString()}</span>
                </div>
                {po.invoice.notes && (
                  <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
                    <span className="font-medium">Notes: </span>{po.invoice.notes}
                  </div>
                )}
              </div>

              {/* Invoice status timeline */}
              {po.invoiceStatus && invoiceStepIndex >= 0 && (
                <div className="flex items-center justify-between mb-6">
                  {invoiceSteps.map((step, idx) => {
                    const isCompleted = idx <= invoiceStepIndex;
                    const isCurrent = idx === invoiceStepIndex;
                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted ? isCurrent ? "bg-[#021422] text-white" : "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                          }`}>
                            {isCompleted ? <Check size={14} /> : idx + 1}
                          </div>
                          <span className={`text-xs font-medium ${isCurrent ? "text-[#021422]" : "text-gray-400"}`}>
                            {invoiceLabels[step]}
                          </span>
                        </div>
                        {idx < invoiceSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-2 ${idx < invoiceStepIndex ? "bg-green-400" : "bg-gray-200"}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {/* Invoice actions */}
              {po.invoiceStatus === "submitted" && (
                <button
                  onClick={handleApproveInvoice}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#021422] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Approve Invoice
                </button>
              )}

              {po.invoiceStatus === "approved" && (
                <button
                  onClick={handleMarkPaid}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Mark as Paid
                </button>
              )}

              {po.invoiceStatus === "paid" && (
                <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold">
                  <Check size={16} />
                  Payment Complete
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <Clock size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">
                {po.status === "delivered"
                  ? "Invoice not yet submitted by vendor"
                  : "Invoice will be submitted after delivery"}
              </p>
            </div>
          )}
        </div>

        {/* Escrow Payment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} /> Escrow Payment
            </h3>
            {po.escrowStatus && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                po.escrowStatus === "released"
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                {po.escrowStatus === "released" ? "Released" : "Held"}
              </span>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-2">
                <Truck size={14} className="text-gray-400" />
                Escrow Amount
              </span>
              <span className="font-bold text-[#021422]">
                ₦{po.totalAmount.toLocaleString()}
              </span>
            </div>
            {po.driverName && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Driver</span>
                <span className="font-medium text-[#021422]">{po.driverName}</span>
              </div>
            )}
            {po.vehiclePlate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vehicle</span>
                <span className="font-medium text-[#021422]">{po.vehiclePlate}</span>
              </div>
            )}
            {po.driverName && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Driver Chat</span>
                <button
                  onClick={() => router.push(`/main-dashboard/vendor/deliveries/${po.id}/chat`)}
                  className="flex items-center gap-1 text-xs font-bold text-[#0166B0] hover:underline"
                >
                  <MessageSquare size={12} />
                  View Conversation
                </button>
              </div>
            )}
            {po.qualityVerified !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Quality Verified</span>
                <span className={`font-bold ${po.qualityVerified ? "text-green-700" : "text-amber-700"}`}>
                  {po.qualityVerified ? "Yes" : "Pending"}
                </span>
              </div>
            )}
          </div>

          {po.escrowStatus === "held" && (
            <button
              onClick={handleReleaseEscrow}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {actionLoading ? "Releasing..." : "Release Escrow Payment"}
            </button>
          )}

          {po.escrowStatus === "released" && (
            <div className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 rounded-lg text-sm font-bold">
              <Check size={16} />
              Escrow Released to Vendor
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Order Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 size={16} className="text-gray-400" />
              <span>{po.vendorName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 size={16} className="text-gray-400" />
              <span>{po.projectName}</span>
            </div>
            {po.deliveryDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span>Delivery: {new Date(po.deliveryDate).toLocaleDateString()}</span>
              </div>
            )}
            {po.deliveryAddress && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-gray-400" />
                <span>{po.deliveryAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Package size={14} /> Order Items
          </h3>
          <div className="space-y-3">
            {po.items.map((item, idx) => (
              <div key={item.id || idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-start justify-between">
                  <p className="font-bold text-[#021422] text-sm">{item.name}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-2 text-sm">
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
                    <span className="font-bold text-[#0166B0]">₦{(item.totalPrice || item.quantity * item.unitPrice).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Grand Total</span>
            <span className="text-xl font-bold text-[#021422]">₦{po.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Notes */}
        {po.notes && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Notes</h3>
            <p className="text-sm text-gray-700">{po.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
