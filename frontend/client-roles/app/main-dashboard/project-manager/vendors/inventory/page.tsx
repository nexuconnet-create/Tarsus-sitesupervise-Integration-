"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Camera,
  X,
  Paperclip,
  Plus,
  Search,
  Package,
  Wrench,
} from "lucide-react";
import type { Material, Equipment, PPE, InventoryFilters, InventoryItem } from "@/lib/types/inventory";
import {
  INVENTORY_CATEGORIES,
  EQUIPMENT_CATEGORIES,
} from "@/lib/types/inventory";
import {
  getAllInventory,
  getLowStockItems,
} from "@/lib/mockData/inventory";

import AlertPanel from "./components/AlertPanel";
import AddInventoryModal from "./components/AddInventoryModal";
import InventoryTable from "./components/InventoryTable";

export default function PMInventoryPage() {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isARScanOpen, setIsARScanOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<(Material | Equipment | PPE) | null>(null);
  const [inventoryItems, setInventoryItems] = useState<(Material | Equipment | PPE)[]>([]);
  const [loading, setLoading] = useState(true);
  const [project] = useState(() => {
    try {
      if (typeof window === "undefined") return null;
      const storedProject = localStorage.getItem("selected_project");
      return storedProject ? JSON.parse(storedProject) : null;
    } catch { return null; }
  });
const [filters, setFilters] = useState<InventoryFilters>({
  type: undefined,
  category: undefined,
  searchQuery: "",
});

  useEffect(() => {
    const loadInventory = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setInventoryItems(getAllInventory());
      setLoading(false);
    };
    loadInventory();
  }, []);

const filteredItems = useMemo(() => {
let items = inventoryItems;

  if (filters.type) {
    items = items.filter((item) => item.type === filters.type);
  }

  if (filters.category) {
    items = items.filter((item) => {
      if (item.type === "ppe") return false;
      return item.category === filters.category;
    });
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    items = items.filter((item) => item.name.toLowerCase().includes(query));
  }

  return items;
  }, [inventoryItems, filters]);

  const lowStockItems = useMemo(() => getLowStockItems(), [inventoryItems]);

  const stats = useMemo(() => {
    const total = inventoryItems.length;
    const materials = inventoryItems.filter((i) => i.type === "material").length;
    const equipment = inventoryItems.filter((i) => i.type === "equipment").length;
    const outOfStock = inventoryItems.filter((i) => i.status === "out").length;
    const lowStock = inventoryItems.filter((i) => i.status === "low").length;
    return { total, materials, equipment, outOfStock, lowStock };
  }, [inventoryItems]);

  const handleAddItem = (item: InventoryItem) => {
    setInventoryItems((prev) => [...prev, item as Material | Equipment]);
  };

  const handleUpdateItem = (updatedItem: InventoryItem) => {
    setInventoryItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem as Material | Equipment : item))
    );
  };

const handleEditItem = (item: InventoryItem) => {
  setEditingItem(item as Material | Equipment | PPE);
  setIsAddModalOpen(true);
};

  const handleDeleteItem = (id: string) => {
    setInventoryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReorderItem = (item: InventoryItem) => {
    console.log("Reorder item:", item);
  };

  const handleViewAR = (item: InventoryItem) => {
    setIsARScanOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-between bg-white py-7 px-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#021422]">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track materials and equipment across all locations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-right">
            <div className="flex flex-col">
              <span className="font-bold text-[#021422]">Project Manager</span>
              <span className="text-xs text-gray-500 uppercase">PM</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pb-20 p-4 md:p-8 pt-16 md:pt-8">
        <div className="-mt-2">
          <h2 className="text-lg text-gray-600">Project: {project?.name || "N/A"}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#021422]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#021422]">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Items</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#021422]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#021422]">{stats.materials}</p>
                <p className="text-xs text-gray-500">Materials</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-[#021422]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#021422]">{stats.equipment}</p>
                <p className="text-xs text-gray-500">Equipment</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5 text-[#021422]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#021422]">{stats.outOfStock}</p>
                <p className="text-xs text-gray-500">Out of Stock</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <AlertBadge />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#021422]">{stats.lowStock}</p>
                <p className="text-xs text-gray-500">Low Stock</p>
              </div>
            </div>
          </div>
        </div>

        <AlertPanel items={lowStockItems} />

        {/* Row 1: Filters */}
<div className="flex items-center gap-4 flex-wrap">
<div className="flex gap-2">
<FilterButton
  active={!filters.type}
  onClick={() => setFilters({ ...filters, type: undefined })}
>
  All
</FilterButton>
<FilterButton
  active={filters.type === "material"}
  onClick={() => setFilters({ ...filters, type: "material" })}
>
  Materials
</FilterButton>
<FilterButton
  active={filters.type === "equipment"}
  onClick={() => setFilters({ ...filters, type: "equipment" })}
>
  Equipment
</FilterButton>
<FilterButton
  active={filters.type === "ppe"}
  onClick={() => setFilters({ ...filters, type: "ppe" })}
>
  PPE
</FilterButton>
</div>
</div>

{/* Subcategory Filters */}
{filters.type && (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-sm text-gray-500 mr-2">Category:</span>
    <FilterButton
      active={!filters.category}
      onClick={() => setFilters({ ...filters, category: undefined })}
    >
      All
    </FilterButton>
    {filters.type === "material" && INVENTORY_CATEGORIES.map((cat) => (
      <FilterButton
        key={cat}
        active={filters.category === cat}
        onClick={() => setFilters({ ...filters, category: cat })}
      >
        {cat}
      </FilterButton>
    ))}
{filters.type === "equipment" && EQUIPMENT_CATEGORIES.map((cat) => (
  <FilterButton
    key={cat}
    active={filters.category === cat}
    onClick={() => setFilters({ ...filters, category: cat })}
  >
    {cat}
  </FilterButton>
))}
</div>
)}

        {/* Row 2: Actions */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Inventory
            </button>

            <button
              onClick={() => setIsARScanOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#021422] text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              <Camera className="w-4 h-4" />
              AR Scan
            </button>
          </div>
        </div>

        <InventoryTable
          items={filteredItems}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onReorder={handleReorderItem}
          onViewAR={handleViewAR}
        />

        <AnimatePresence>
          {isAddModalOpen && (
            <AddInventoryModal
              isOpen={isAddModalOpen}
              onClose={() => {
                setIsAddModalOpen(false);
                setEditingItem(null);
              }}
              onAdd={editingItem ? handleUpdateItem : handleAddItem}
              editItem={editingItem}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isRequestModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsRequestModalOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative z-10 p-8"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-[#021422]">Material Request Form</h2>
                  <button
                    onClick={() => setIsRequestModalOpen(false)}
                    className="bg-red-400 p-1.5 rounded text-white hover:bg-red-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#021422]">
                        Requested Material
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0070D4]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#021422]">
                        Quantity Needed
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0070D4]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#021422]">
                        Priority Level
                      </label>
                      <select className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0070D4]">
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#021422]">
                      Reason for Request
                    </label>
                    <textarea className="w-full px-4 py-3 rounded-lg border border-gray-200 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#0070D4]" />
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#0070D4] text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors">
                      <Paperclip size={18} /> Attach File
                    </button>
                    <button className="px-8 py-3 bg-[#021422] text-white rounded-lg font-bold text-sm hover:bg-gray-900 transition-colors">
                      Send Request to Manager
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isARScanOpen && (
            <div className="fixed inset-0 z-[60] bg-[#F4F6F8] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-5xl aspect-video relative z-10 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200"
              >
                <button
                  onClick={() => setIsARScanOpen(false)}
                  className="absolute top-6 right-6 z-20 bg-white/10 hover:bg-white/20 p-2 rounded-full text-[#021422] transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center">
                  <div className="relative w-[60%] h-[60%] border-2 border-blue-400 rounded-lg flex flex-col items-center justify-center">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1" />

                    <Camera size={64} className="text-gray-400 mb-4" />
                    <p className="text-gray-500 font-medium">Camera Feed Simulation</p>
                    <p className="text-gray-400 text-sm mt-1">Scanning: T-25 Rebar</p>
                  </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md">
                  <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#021422]">T-25 Rebar</h3>
                        <p className="text-gray-500 text-sm">Block B, South Yard</p>
                      </div>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        In Stock
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-xs font-bold uppercase">Qty Detected:</p>
                        <p className="text-[#021422] font-bold text-lg">150 pcs</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs font-bold uppercase">Allocated to:</p>
                        <p className="text-[#021422] font-bold text-lg">Pile Cap #5</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#021422] text-white py-3 rounded-lg font-bold text-sm hover:bg-gray-900 shadow-lg">
                      Check-Out 50 pcs
                    </button>
                    <button className="flex-1 bg-white text-[#021422] py-3 rounded-lg font-bold text-sm hover:bg-gray-50 shadow-md">
                      Report Damage
                    </button>
                    <button className="flex-1 bg-white text-[#021422] py-3 rounded-lg font-bold text-sm hover:bg-gray-50 shadow-md text-nowrap px-3">
                      Advice Site Manager
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? "bg-[#021422] text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function AlertBadge() {
  return (
    <svg
      className="w-5 h-5 text-yellow-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}
