"use client";

import { useState } from "react";
import { Edit2, Trash2, ShoppingCart, Eye, Package, Wrench } from "lucide-react";
import type { Material, Equipment, PPE } from "@/lib/types/inventory";
import StockBadge from "./StockBadge";
import StockLevelBar from "./StockLevelBar";

interface InventoryTableProps {
  items: (Material | Equipment | PPE)[];
  onEdit: (item: Material | Equipment | PPE) => void;
  onDelete: (id: string) => void;
  onReorder: (item: Material | Equipment | PPE) => void;
  onViewAR?: (item: Material | Equipment | PPE) => void;
}

type SortField = "name" | "category" | "currentStock" | "status";
type SortDirection = "asc" | "desc";

const InventoryTable = ({ items, onEdit, onDelete, onReorder, onViewAR }: InventoryTableProps) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "category":
        const aCategory = a.type === "ppe" ? "" : a.category;
        const bCategory = b.type === "ppe" ? "" : b.category;
        comparison = aCategory.localeCompare(bCategory);
        break;
      case "currentStock":
        comparison = a.currentStock - b.currentStock;
        break;
      case "status":
        const statusOrder: Record<string, number> = { out: 0, low: 1, good: 2 };
        comparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <span className="text-gray-400 ml-1">↕</span>;
    }
    return sortDirection === "asc" ? (
      <span className="text-blue-600 ml-1">↑</span>
    ) : (
      <span className="text-blue-600 ml-1">↓</span>
    );
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
        <p className="text-gray-500">Try adjusting your filters or add new items.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.size === items.length && items.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("name")}
              >
                <span className="flex items-center">
                  Item
                  {getSortIcon("name")}
                </span>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("category")}
              >
                <span className="flex items-center">
                  Category
                  {getSortIcon("category")}
                </span>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("currentStock")}
              >
                <span className="flex items-center">
                  Stock Level
                  {getSortIcon("currentStock")}
                </span>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("status")}
              >
                <span className="flex items-center">
                  Status
                  {getSortIcon("status")}
                </span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedItems.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 transition-colors ${
                  selectedItems.has(item.id) ? "bg-blue-50" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleSelectItem(item.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      {item.type === "material" ? (
                        <Package className="w-4 h-4 text-[#021422]" />
                      ) : item.type === "ppe" ? (
                        <Package className="w-4 h-4 text-[#021422]" />
                      ) : (
                        <Wrench className="w-4 h-4 text-[#021422]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[#021422]">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.type === "material" ? "Material" : item.type === "ppe" ? "PPE" : "Equipment"}
                        {item.type === "equipment" && (item as Equipment).serialNumber && (
                          <span> • S/N: {(item as Equipment).serialNumber}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.type === "ppe" ? "PPE" : item.category}
                    </span>
                    {item.type === "equipment" && (item as Equipment).ownershipType && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit ${
                        (item as Equipment).ownershipType === "rented"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {(item as Equipment).ownershipType === "rented" ? "Rented" : "Owned"}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StockLevelBar
                    currentStock={item.currentStock}
                    minStockLevel={item.minStockLevel}
                    unit={item.unit}
                    status={item.status}
                  />
                </td>
                <td className="px-4 py-3">
                  <StockBadge status={item.status} size="sm" />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.supplier || "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {item.status !== "good" && (
                      <button
                        onClick={() => onReorder(item)}
                        className="p-1.5 text-gray-500 hover:text-[#021422] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Reorder"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    )}
                    {item.type === "material" && onViewAR && (
                      <button
                        onClick={() => onViewAR(item)}
                        className="p-1.5 text-gray-500 hover:text-[#021422] hover:bg-gray-100 rounded-lg transition-colors"
                        title="View in AR"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-gray-500 hover:text-[#021422] hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedItems.size > 0 && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
          <span className="text-sm text-blue-700 font-medium">
            {selectedItems.size} item(s) selected
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Bulk Reorder
            </button>
            <button
              onClick={() => setSelectedItems(new Set())}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
