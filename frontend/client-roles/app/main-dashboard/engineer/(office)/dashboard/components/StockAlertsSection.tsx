"use client";

import { useMemo } from "react";
import { Package, Wrench, Shield } from "lucide-react";
import Link from "next/link";
import { useInventory } from "@/store/inventoryStore";
import type { Material, Equipment, PPE } from "@/lib/types/inventory";

type AlertItem = {
  item: Material | Equipment | PPE;
  type: "material" | "equipment" | "ppe";
};

export default function StockAlertsSection() {
  const { materials, equipment, ppe } = useInventory();

  const allAlerts = useMemo(() => {
    const materialAlerts: AlertItem[] = materials
      .filter((m) => m.status === "out" || m.status === "low")
      .map((m) => ({ item: m, type: "material" as const }));

    const equipmentAlerts: AlertItem[] = equipment
      .filter((e) => e.status === "out" || e.status === "low")
      .map((e) => ({ item: e, type: "equipment" as const }));

    const ppeAlerts: AlertItem[] = ppe
      .filter((p) => p.status === "out" || p.status === "low")
      .map((p) => ({ item: p, type: "ppe" as const }));

    return [...materialAlerts, ...equipmentAlerts, ...ppeAlerts]
      .sort((a, b) => {
        if (a.item.status === "out" && b.item.status !== "out") return -1;
        if (b.item.status === "out" && a.item.status !== "out") return 1;
        return a.item.currentStock - b.item.currentStock;
      })
      .slice(0, 5);
  }, [materials, equipment, ppe]);

  const getIcon = (type: "material" | "equipment" | "ppe") => {
    switch (type) {
      case "material":
        return <Package size={14} className="text-gray-500" />;
      case "equipment":
        return <Wrench size={14} className="text-gray-500" />;
      case "ppe":
        return <Shield size={14} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type: "material" | "equipment" | "ppe") => {
    switch (type) {
      case "material":
        return "Material";
      case "equipment":
        return "Equipment";
      case "ppe":
        return "PPE";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-[#021422] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-white">Inventory Alerts</h3>
        </div>
        <span className="text-xs text-gray-200">
          {allAlerts.length} alert{allAlerts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {allAlerts.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-gray-500">
          All items sufficiently stocked
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {allAlerts.map(({ item, type }) => (
            <Link
              key={item.id}
              href="/main-dashboard/engineer/(office)/inventory-update"
              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    item.status === "out" ? "bg-red-500" : "bg-yellow-500"
                  }`}
                />
                <div className="flex items-center gap-2">
                  {getIcon(type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {type !== "ppe" && "category" in item
                        ? `${item.category} â€¢ `
                        : ""}
                      {getTypeLabel(type)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 tabular-nums">
                  {item.currentStock} / {item.minStockLevel} {item.unit}
                </span>
                <span
                  className={`text-xs font-medium ${
                    item.status === "out" ? "text-red-600" : "text-yellow-600"
                  }`}
                >
                  {item.status === "out" ? "Out of Stock" : "Low Stock"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {allAlerts.length > 0 && (
        <Link
          href="/main-dashboard/engineer/inventory-update"
          className="block px-4 py-3 text-center text-xs font-medium text-blue-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
        >
          View All Inventory â†’
        </Link>
      )}
    </div>
  );
}
