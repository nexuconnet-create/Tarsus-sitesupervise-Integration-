"use client";

const APP_START_TIME = Date.now();

import React, { useState } from "react";
import {
  Loader2,
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
// import { vendorService } from "@/lib/services";
import { MOCK_STOCK } from "@/lib/mockData/vendor";
import VendorDashboardSection from "../components/VendorDashboardSection";
import StockFormModal from "../components/StockFormModal";
import type { VendorStock } from "@/lib/types/vendor";

export default function StockPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stock, setStock] = useState<VendorStock[]>(MOCK_STOCK.filter((s) => s.vendorId === "vendor-1"));
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VendorStock | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  /* â”€â”€ API version (uncomment when backend is ready) â”€â”€
  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      const res = await vendorService.getStock();
      const data = res.data?.data || res.data?.results || res.data || [];
      setStock(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load stock items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const handleSubmit = async (data: Record<string, unknown>): Promise<void> => {
    if (editingItem) {
      setStock((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                name: (data.name as string) || item.name,
                category: (data.category as string) || item.category,
                unit: (data.unit as string) || item.unit,
                price: (data.price as number) ?? item.price,
                quantity: (data.quantity as number) ?? item.quantity,
                minOrderQty: (data.min_order_qty as number) ?? item.minOrderQty,
                description: (data.description as string) || item.description,
                brand: (data.brand as string) ?? item.brand,
                grade: (data.grade as string) ?? item.grade,
                manufactureDate: (data.manufacture_date as string) ?? item.manufactureDate,
                batchNumber: (data.batch_number as string) ?? item.batchNumber,
                imageUrl: (data.image_url as string) ?? item.imageUrl,
              }
            : item,
        ),
      );
      toast.success("Stock item updated");
    } else {
      const newItem: VendorStock = {
        id: `stock-${Date.now()}`,
        vendorId: "vendor-1",
        name: (data.name as string) || "",
        category: (data.category as string) || "",
        unit: (data.unit as string) || "",
        price: (data.price as number) || 0,
        quantity: (data.quantity as number) || 0,
        minOrderQty: (data.min_order_qty as number) || 1,
        description: (data.description as string) || "",
        brand: (data.brand as string) || undefined,
        grade: (data.grade as string) || undefined,
        manufactureDate: (data.manufacture_date as string) || undefined,
        batchNumber: (data.batch_number as string) || undefined,
        imageUrl: (data.image_url as string) || undefined,
      };
      setStock((prev) => [newItem, ...prev]);
      toast.success("Stock item added");
    }
  };

  /* â”€â”€ API version (uncomment when backend is ready) â”€â”€
  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      if (editingItem) {
        await vendorService.updateStock(editingItem.id, data);
        toast.success("Stock item updated");
      } else {
        await vendorService.createStock(data);
        toast.success("Stock item added");
      }
      fetchStock();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to save item");
      throw err;
    }
  };
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const handleDelete = (id: string) => {
    toast.success("Stock item deleted");
    setStock((prev) => prev.filter((item) => item.id !== id));
    setDeleteConfirm(null);
  };

  /* â”€â”€ API version (uncomment when backend is ready) â”€â”€
  const handleDelete = async (id: string) => {
    try {
      await vendorService.deleteStock(id);
      toast.success("Stock item deleted");
      setStock((prev) => prev.filter((item) => item.id !== id));
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete item");
    }
  };
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const categories = [...new Set(stock.map((item) => item.category))].filter(
    Boolean,
  );

  const filtered = stock.filter((item) => {
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Freshness indicator for dated stock (e.g. cement loses strength after ~3 months).
  const freshness = (dateStr?: string) => {
    if (!dateStr) return null;
    const made = new Date(dateStr).getTime();
    if (Number.isNaN(made)) return null;
    const months = (APP_START_TIME - made) / (1000 * 60 * 60 * 24 * 30);
    const label =
      months < 1 ? "Made <1mo ago" : `Made ${Math.floor(months)}mo ago`;
    const cls =
      months <= 2
        ? "bg-green-50 text-green-700"
        : months <= 3
          ? "bg-amber-50 text-amber-700"
          : "bg-red-50 text-red-700";
    return { label, cls };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#0D1B2A]">
        <Loader2 size={28} className="animate-spin text-[#0D1B2A]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-24">
        <Toaster position="top-right" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
          <div className="text-3xl font-bold text-[#0D1B2A]">Stock Management</div>
        </div>
        <div className="p-8 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <AlertTriangle size={48} className="mx-auto mb-3 text-red-300" />
            <p className="font-bold text-gray-500 mb-1">Failed to load stock</p>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => { setError(null); setLoading(true); setTimeout(() => setLoading(false), 800); }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
          <div className="text-3xl font-bold text-[#0D1B2A]">
            Stock Management
          </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#0D1B2A] text-white px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search stock items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-11 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] flex items-center gap-2 min-w-[180px] justify-between"
            >
              <span
                className={categoryFilter ? "text-gray-900" : "text-gray-400"}
              >
                {categoryFilter || "All Categories"}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter("");
                    setCategoryDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(cat);
                      setCategoryDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stock Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((item) => {
              const isLow = item.quantity <= item.minOrderQty;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow relative group"
                >
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setModalOpen(true);
                      }}
                      className="p-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Pencil size={14} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="p-1.5 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>

                  {/* Item Photo */}
                  {item.imageUrl && (
                    <div className="w-full h-32 -mt-1 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Category Badge */}
                  <span className="text-xs font-bold px-2 py-1 rounded bg-[#0D1B2A] text-white w-fit">
                    {item.category}
                  </span>

                  {/* Name + Brand */}
                  <div>
                    <h3 className="font-bold text-[#0D1B2A] text-base leading-tight">
                      {item.name}
                    </h3>
                    {item.brand && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.brand}</p>
                    )}
                  </div>

                  {/* Grade + Freshness */}
                  {(item.grade || item.manufactureDate) && (
                    <div className="flex flex-wrap items-center gap-1.5 -mt-1">
                      {item.grade && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          Grade {item.grade}
                        </span>
                      )}
                      {(() => {
                        const f = freshness(item.manufactureDate);
                        return f ? (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${f.cls}`}>
                            {f.label}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-xl font-bold text-[#0D1B2A]">
                    ₦{item.price.toLocaleString()}
                    <span className="text-xs text-gray-400 font-normal ml-1">
                      / {item.unit}
                    </span>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-sm text-gray-500">In Stock</span>
                    <div className="flex items-center gap-1.5">
                      {isLow && (
                        <AlertTriangle size={14} className="text-red-500" />
                      )}
                      <span
                        className={`text-sm font-bold ${
                          isLow ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  </div>

                  {/* Min Order */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Min Order</span>
                    <span className="text-sm font-medium text-gray-700">
                      {item.minOrderQty} {item.unit}
                    </span>
                  </div>

                  {/* Low Stock Warning */}
                  {isLow && (
                    <div className="bg-red-50 text-red-700 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-2">
                      <AlertTriangle size={14} />
                      Below minimum stock level
                    </div>
                  )}

                  {/* Delete Confirmation */}
                  {deleteConfirm === item.id && (
                    <div className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center gap-3 p-4">
                      <p className="text-sm font-bold text-[#0D1B2A]">
                        Delete this item?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold uppercase text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <VendorDashboardSection
            title="Stock Inventory"
            icon={<Package size={20} />}
          >
            <div className="text-center py-12 text-gray-400">
              <Package size={48} className="mx-auto mb-3 opacity-40" />
              <p className="font-bold text-gray-500 mb-1">
                No stock items found
              </p>
              <p className="text-sm">
                {search || categoryFilter
                  ? "Try adjusting your search or filter"
                  : 'Click "Add Item" to add your first stock item'}
              </p>
            </div>
          </VendorDashboardSection>
        )}
      </div>

      {/* Modal */}
      <StockFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingItem}
      />
    </div>
  );
}
