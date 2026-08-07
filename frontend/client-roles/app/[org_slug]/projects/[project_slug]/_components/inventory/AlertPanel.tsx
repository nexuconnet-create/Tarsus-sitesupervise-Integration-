"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Package } from "lucide-react";
import type { Material, Equipment, PPE } from "@/lib/types/inventory";
import StockBadge from "./StockBadge";

interface AlertPanelProps {
  items: (Material | Equipment | PPE)[];
  onReorder: (item: Material | Equipment | PPE) => void;
}

const AlertPanel = ({ items, onReorder }: AlertPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const alertItems = items;

  const outStockItems = alertItems.filter((item) => item.status === "out");
  const lowStockItems = alertItems.filter((item) => item.status === "low");

  const totalAlerts = alertItems.length;

  if (totalAlerts === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-[#021422]">
              Stock Alerts ({totalAlerts})
            </h3>
            <p className="text-sm text-gray-500">
              {lowStockItems.length} low stock, {outStockItems.length} out of stock
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 divide-y divide-gray-100">
          {lowStockItems.length > 0 && lowStockItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 px-6"
            >
<div className="flex items-center gap-4">
  <Package className="w-5 h-5 text-gray-400" />
  <div>
    <p className="font-medium text-[#021422]">{item.name}</p>
    <p className="text-sm text-gray-500">
      {item.type === "ppe" ? "PPE" : item.category} • {item.currentStock} / {item.minStockLevel} {item.unit}
    </p>
  </div>
</div>
<div className="flex items-center gap-3">
  <StockBadge status="low" size="sm" />
                <button onClick={() => onReorder(item)} className="px-3 py-1.5 text-sm font-medium text-white bg-[#021422] rounded-lg hover:bg-gray-800 transition-colors">
                  Reorder
                </button>
              </div>
            </div>
          ))}

          {outStockItems.length > 0 && outStockItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 px-6 bg-red-50/50"
            >
<div className="flex items-center gap-4">
  <Package className="w-5 h-5 text-red-400" />
  <div>
    <p className="font-medium text-[#021422]">{item.name}</p>
    <p className="text-sm text-gray-500">
      {item.type === "ppe" ? "PPE" : item.category} • {item.currentStock} / {item.minStockLevel} {item.unit}
    </p>
  </div>
</div>
<div className="flex items-center gap-3">
  <StockBadge status="out" size="sm" />
                <button onClick={() => onReorder(item)} className="px-3 py-1.5 text-sm font-medium text-white bg-[#021422] rounded-lg hover:bg-gray-800 transition-colors">
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertPanel;
