"use client";

import { Package, Wrench, Shield } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { inventoryService } from "@/lib/services/inventoryService";
import { engineerKeys } from "@/lib/queryKeys";
import type { BackendStockAlertItem } from "@/lib/services/inventoryService";

export default function StockAlertsSection() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const base = `/${orgSlug}/projects/${projectSlug}/engineer`;

  const { data: projectUuid } = useProjectUuid(orgSlug, projectSlug);
  const alertsQuery = useQuery({
    queryKey: engineerKeys.inventoryAlerts(projectUuid ?? ""),
    queryFn: () => inventoryService.getAlerts(projectUuid!).then((r) => r.data),
    enabled: !!projectUuid,
  });

  const alerts = alertsQuery.data?.alerts.slice(0, 5) ?? [];

  const getIcon = (type: BackendStockAlertItem["item_type"]) => {
    switch (type) {
      case "material":
        return <Package size={14} className="text-gray-500" />;
      case "equipment":
        return <Wrench size={14} className="text-gray-500" />;
      case "ppe":
        return <Shield size={14} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type: BackendStockAlertItem["item_type"]) => {
    switch (type) {
      case "material":
        return "Material";
      case "equipment":
        return "Equipment";
      case "ppe":
        return "PPE";
    }
  };

  const isOut = (status: BackendStockAlertItem["status"]) =>
    status === "out_of_stock";

  const statusLabel = (status: BackendStockAlertItem["status"]) => {
    switch (status) {
      case "out_of_stock":
        return "Out of Stock";
      case "critically_low":
        return "Critically Low";
      default:
        return "Low Stock";
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
          {alertsQuery.data?.total_items ?? 0} alert
          {(alertsQuery.data?.total_items ?? 0) !== 1 ? "s" : ""}
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-gray-500">
          {alertsQuery.isLoading ? "Loading..." : "All items sufficiently stocked"}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {alerts.map((item) => (
            <Link
              key={item.id}
              href={`${base}/inventory-update`}
              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isOut(item.status) ? "bg-red-500" : "bg-yellow-500"
                  }`}
                />
                <div className="flex items-center gap-2">
                  {getIcon(item.item_type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.category ? `${item.category} • ` : ""}
                      {getTypeLabel(item.item_type)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 tabular-nums">
                  {item.stock_display.current} {item.stock_display.unit}
                </span>
                <span
                  className={`text-xs font-medium ${
                    isOut(item.status) ? "text-red-600" : "text-yellow-600"
                  }`}
                >
                  {statusLabel(item.status)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {alerts.length > 0 && (
        <Link
          href={`${base}/inventory-update`}
          className="block px-4 py-3 text-center text-xs font-medium text-blue-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
        >
          View All Inventory →
        </Link>
      )}
    </div>
  );
}
