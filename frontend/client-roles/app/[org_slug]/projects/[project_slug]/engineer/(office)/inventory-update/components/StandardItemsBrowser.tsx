"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react";
import { X, Search, Package, Wrench, Shield, Plus } from "lucide-react";
import type { Material, Equipment, PPE } from "@/lib/types/inventory";
import { itemTemplates, type ItemTemplate } from "@/lib/templates/itemTemplates";
import { useInventory } from "@/store/inventoryStore";

interface StandardItemsBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (template: ItemTemplate) => void;
  existingInventory?: (Material | Equipment | PPE)[];
}

type FilterType = "all" | "material" | "equipment" | "ppe";

export default function StandardItemsBrowser({
  isOpen,
  onClose,
  onAddItem,
  existingInventory = [],
}: StandardItemsBrowserProps) {
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const customTemplates = useInventory((state) => state.customTemplates);

  const allTemplates = useMemo(() => {
    const custom = customTemplates.map((t) => ({ ...t, isCustom: true }));
    const standard = itemTemplates.map((t) => ({ ...t, isCustom: false }));
    return [...custom, ...standard];
  }, [customTemplates]);

  const categories = useMemo(() => {
    const filtered =
      filterType === "all"
        ? allTemplates
        : allTemplates.filter((t) => t.type === filterType);

    const cats = Array.from(new Set(filtered.map((t) => t.category)));
    return ["all", ...cats.sort()];
  }, [allTemplates, filterType]);

  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.supplier?.toLowerCase().includes(query) ||
          t.materialCode?.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => {
      if (a.isCustom && !b.isCustom) return -1;
      if (!a.isCustom && b.isCustom) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [allTemplates, filterType, filterCategory, searchQuery]);

  const isInInventory = (template: ItemTemplate) => {
    return existingInventory.some(
      (item) =>
        item.name.toLowerCase() === template.name.toLowerCase() ||
        ("materialCode" in item && item.materialCode === template.materialCode) ||
        ("equipmentCode" in item && item.equipmentCode === template.materialCode) ||
        ("ppeCode" in item && item.ppeCode === template.materialCode)
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "material":
        return Package;
      case "equipment":
        return Wrench;
      case "ppe":
        return Shield;
      default:
        return Package;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "material":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "equipment":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "ppe":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Standard Items Library
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {allTemplates.length} pre-configured items for quick inventory addition
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, category, supplier, or code..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFilterCategory("all");
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-2">
              <FilterChip
                active={filterType === "all"}
                onClick={() => {
                  setFilterType("all");
                  setFilterCategory("all");
                }}
                label="All Items"
                count={allTemplates.length}
              />
              <FilterChip
                active={filterType === "material"}
                onClick={() => {
                  setFilterType("material");
                  setFilterCategory("all");
                }}
                label="Materials"
                count={allTemplates.filter((t) => t.type === "material").length}
                icon={Package}
              />
              <FilterChip
                active={filterType === "equipment"}
                onClick={() => {
                  setFilterType("equipment");
                  setFilterCategory("all");
                }}
                label="Equipment"
                count={allTemplates.filter((t) => t.type === "equipment").length}
                icon={Wrench}
              />
              <FilterChip
                active={filterType === "ppe"}
                onClick={() => {
                  setFilterType("ppe");
                  setFilterCategory("all");
                }}
                label="PPE"
                count={allTemplates.filter((t) => t.type === "ppe").length}
                icon={Shield}
              />
            </div>

            {/* Category Filters */}
            {filterType !== "all" && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 mr-2">Category:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      filterCategory === cat
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat === "all" ? "All" : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Package className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-900">
                  No matching items found
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTemplates.map((template) => {
                  const Icon = getTypeIcon(template.type);
                  const badgeColor = getTypeBadgeColor(template.type);
                  const exists = isInInventory(template);

                  return (
                    <div
                      key={template.id}
                      className={`relative border rounded-xl p-4 transition-all hover:shadow-md ${
                        exists
                          ? "bg-gray-50 border-gray-200"
                          : "bg-white border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {/* Custom Badge */}
                      {template.isCustom && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                          ⭐ Your Template
                        </span>
                      )}

                      {/* Type Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${badgeColor}`}
                        >
                          <Icon className="w-3 h-3" />
                          {getTypeLabel(template.type)}
                        </span>
                      </div>

                      {/* Item Name */}
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {template.name}
                      </h3>

                      {/* Code */}
                      {template.materialCode && (
                        <p className="text-xs font-mono text-gray-500 mb-3">
                          {template.materialCode}
                        </p>
                      )}

                      {/* Details */}
                      <div className="space-y-1.5 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📦</span>
                          <span>{template.unit}</span>
                        </div>
                        {template.minStockLevel && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">⚠️</span>
                            <span>Min: {template.minStockLevel}</span>
                          </div>
                        )}
                        {template.storageLocation && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">📍</span>
                            <span className="truncate">
                              {template.storageLocation}
                            </span>
                          </div>
                        )}
                        {template.supplier && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">🏭</span>
                            <span className="truncate">{template.supplier}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => !exists && onAddItem(template)}
                        disabled={exists}
                        className={`w-full mt-4 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                          exists
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {exists ? (
                          <>
                            <Package className="w-4 h-4" />
                            Already in Inventory
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add to Inventory
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredTemplates.length} of {allTemplates.length} items
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: any;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
        active
          ? "bg-gray-900 text-white shadow-sm"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          active ? "bg-white/25 text-white" : "bg-gray-200 text-gray-700"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
