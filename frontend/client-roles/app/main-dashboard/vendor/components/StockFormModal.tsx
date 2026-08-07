"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus, Trash2 } from "lucide-react";
import type { VendorStock } from "@/lib/types/vendor";

interface StockFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  initialData?: VendorStock | null;
}

const categories = [
  "Cement & Concrete",
  "Steel & Rebar",
  "Lumber & Timber",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Roofing",
  "Paint & Coatings",
  "Flooring & Tiles",
  "Glass & Windows",
  "Equipment",
  "Safety & PPE",
  "General Supplies",
  "Other",
];

// Categories where grade + manufacture date + batch matter (dated/graded materials).
const TRACKED_CATEGORIES = ["Cement & Concrete", "Steel & Rebar", "Paint & Coatings"];

const units = ["pcs", "kg", "ton", "bag", "box", "roll", "meter", "sqm", "cu.m", "liter", "gallon", "set", "pair"];

const GRADE_HINTS: Record<string, string> = {
  "Cement & Concrete": "e.g. 42.5R, 32.5N",
  "Steel & Rebar": "e.g. Y12, Y16",
  "Paint & Coatings": "e.g. matte, satin",
};

const StockFormModal: React.FC<StockFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const getDefaultFormData = (data?: VendorStock | null) => ({
    name: data?.name || "",
    category: data?.category || "",
    unit: data?.unit || "",
    price: String(data?.price ?? ""),
    quantity: String(data?.quantity ?? ""),
    minOrderQty: String(data?.minOrderQty ?? ""),
    description: data?.description || "",
    brand: data?.brand || "",
    grade: data?.grade || "",
    manufactureDate: data?.manufactureDate || "",
    batchNumber: data?.batchNumber || "",
  });

  const [formData, setFormData] = useState(() => getDefaultFormData(initialData));
  const [loading, setLoading] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialData?.imageUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!initialData;
  const showTracked = TRACKED_CATEGORIES.includes(formData.category);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        price: parseFloat(formData.price) || 0,
        quantity: parseInt(formData.quantity) || 0,
        min_order_qty: parseInt(formData.minOrderQty) || 1,
        description: formData.description,
        brand: formData.brand || undefined,
        // Only send tracked fields when relevant to the category.
        grade: showTracked ? formData.grade || undefined : undefined,
        manufacture_date: showTracked ? formData.manufactureDate || undefined : undefined,
        batch_number: showTracked ? formData.batchNumber || undefined : undefined,
        // File for real upload; preview data URL kept for immediate display / mock.
        image: imageFile,
        image_url: imagePreview,
      });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#0D1B2A] uppercase tracking-tight">
                {isEdit ? "Edit Stock Item" : "Add Stock Item"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
            >
              {/* Item Photo */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                  Item Photo
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Item preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
                      aria-label="Remove photo"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#0D1B2A] hover:text-[#0D1B2A] transition-colors"
                  >
                    <ImagePlus size={28} />
                    <span className="text-sm font-medium">Upload item photo</span>
                    <span className="text-xs">Helps buyers trust what they&apos;re ordering</span>
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                  Item Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Portland Cement 50kg"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                  required
                />
              </div>

              {/* Brand */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                  Brand / Manufacturer
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dangote, BUA, Lafarge"
                  value={formData.brand}
                  onChange={(e) => updateField("brand", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                />
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] flex items-center justify-between"
                >
                  <span
                    className={formData.category ? "text-gray-900" : "text-gray-400"}
                  >
                    {formData.category || "Select category"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {categoryOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          updateField("category", cat);
                          setCategoryOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Unit Dropdown */}
              <div className="relative">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                  Unit *
                </label>
                <button
                  type="button"
                  onClick={() => setUnitOpen(!unitOpen)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] flex items-center justify-between"
                >
                  <span
                    className={formData.unit ? "text-gray-900" : "text-gray-400"}
                  >
                    {formData.unit || "Select unit"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${unitOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {unitOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                    {units.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => {
                          updateField("unit", u);
                          setUnitOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price + Quantity Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                    Price (₦) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => updateField("quantity", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                  Min Order Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.minOrderQty}
                  onChange={(e) => updateField("minOrderQty", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                />
              </div>

              {/* Batch & Freshness — only for dated/graded materials (cement, steel, paint) */}
              {showTracked && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">
                      Batch &amp; Freshness
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Buyers see this before ordering. Fresh, dated stock builds trust.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Grade
                    </label>
                    <input
                      type="text"
                      placeholder={GRADE_HINTS[formData.category] || "e.g. grade / spec"}
                      value={formData.grade}
                      onChange={(e) => updateField("grade", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                        Manufacture Date
                      </label>
                      <input
                        type="date"
                        value={formData.manufactureDate}
                        onChange={(e) => updateField("manufactureDate", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                        Batch / Lot No.
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. B-2026-0417"
                        value={formData.batchNumber}
                        onChange={(e) => updateField("batchNumber", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                  Description
                </label>
                <textarea
                  placeholder="Item description..."
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] resize-none"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !formData.name ||
                  !formData.category ||
                  !formData.unit ||
                  !formData.price ||
                  !formData.quantity
                }
                className="px-6 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Saving..." : isEdit ? "Update Item" : "Add Item"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StockFormModal;
