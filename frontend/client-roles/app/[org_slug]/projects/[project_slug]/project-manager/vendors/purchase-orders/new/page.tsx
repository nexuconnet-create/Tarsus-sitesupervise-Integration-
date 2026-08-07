"use client";
import BackButton from "@/components/BackButton";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { getErrorMessage } from "@/lib/error";

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const base = `/${orgSlug}/projects/${projectSlug}/project-manager`;
  const { data: projectId } = useProjectUuid(orgSlug, projectSlug);

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    supplier_name: "",
    order_date: new Date().toISOString().split("T")[0],
    expected_delivery_date: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplier_name.trim()) {
      toast.error("Supplier name is required");
      return;
    }
    try {
      setSubmitting(true);
      const res = await purchaseOrderService.createPO(projectId, {
        supplier_name: form.supplier_name.trim(),
        order_date: form.order_date,
        expected_delivery_date: form.expected_delivery_date || undefined,
        notes: form.notes.trim() || undefined,
      });
      const created = res.data?.data ?? res.data;
      const createdId = created.id;
      toast.success(`Purchase order ${created.po_number} created`);
      router.push(`${base}/vendors/purchase-orders/${createdId}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white py-7 px-4 border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-3"><BackButton /><div className="text-2xl font-bold text-[#021422]">New Purchase Order</div></div>
      </div>

      <div className="p-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          {/* Supplier */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Supplier Name <span className="text-red-500">*</span>
            </label>
            <input
              name="supplier_name"
              value={form.supplier_name}
              onChange={handleChange}
              placeholder="e.g. ABC Cement Supplies"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0166B0]"
              required
            />
            <p className="text-xs text-gray-400 mt-1">A new supplier will be created if this name doesn&apos;t exist yet.</p>
          </div>

          {/* Order Date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Order Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="order_date"
              value={form.order_date}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0166B0]"
              required
            />
          </div>

          {/* Expected Delivery */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Expected Delivery Date</label>
            <input
              type="date"
              name="expected_delivery_date"
              value={form.expected_delivery_date}
              onChange={handleChange}
              min={form.order_date}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0166B0]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any additional notes for this order..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0166B0] resize-none"
            />
          </div>

          <p className="text-xs text-gray-400">
            The PO will be created as a <strong>Draft</strong>. You can add line items on the next page before submitting for approval.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.supplier_name.trim() || !form.order_date}
              className="flex-1 bg-[#021422] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Create Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
