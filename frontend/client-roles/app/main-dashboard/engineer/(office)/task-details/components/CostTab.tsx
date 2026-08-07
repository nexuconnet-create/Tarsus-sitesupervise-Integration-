"use client";

import { Users, Package, Wrench, Shield, DollarSign } from "lucide-react";
import type { Task, Crew } from "../types";
import { getCostBreakdown, formatCurrency, type CostLineItem } from "../utils/costCalculator";

interface CostTabProps {
  task: Task;
  crews?: Crew[];
}

function CostSection({
  title,
  icon: Icon,
  items,
  total,
}: {
  title: string;
  icon: React.ElementType;
  items: CostLineItem[];
  total: number;
}) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#021422] flex items-center gap-2">
          <Icon size={16} className="text-gray-400" />
          {title}
        </h4>
        <span className="text-sm font-bold text-[#021422]">
          {formatCurrency(total)}
        </span>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item, idx) => (
          <div key={idx} className="px-4 py-3 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">
                {item.quantity} {item.unit}
                {item.detail && ` \u00B7 ${item.detail}`}
                {item.unitCost > 0 && (
                  <span className="text-gray-400">
                    {" "}
                    @ {formatCurrency(item.unitCost)}/{item.unit}
                  </span>
                )}
              </p>
            </div>
            <span className="text-sm font-semibold text-[#021422] ml-3">
              {formatCurrency(item.total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CostTab({ task, crews = [] }: CostTabProps) {
  const breakdown = getCostBreakdown(task, crews);
  const hasAnyCosts = breakdown.grandTotal > 0;

  if (!hasAnyCosts) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <DollarSign size={28} className="text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-600 mb-1">
          No Cost Data
        </h3>
        <p className="text-xs text-gray-400">
          No costs have been assigned to this task. Add crew prices or
          inventory unit costs during task creation.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Grand Total Header */}
      <div className="bg-[#021422] rounded-xl p-5 text-white">
        <p className="text-xs font-medium text-gray-300 uppercase tracking-wider mb-1">
          Estimated Task Cost
        </p>
        <p className="text-3xl font-bold">{formatCurrency(breakdown.grandTotal)}</p>
      </div>

      {/* Cost Breakdown by Category */}
      <div className="space-y-4">
        <CostSection
          title="Crews"
          icon={Users}
          items={breakdown.crews}
          total={breakdown.crewTotal}
        />
        <CostSection
          title="Materials"
          icon={Package}
          items={breakdown.materials}
          total={breakdown.materialTotal}
        />
        <CostSection
          title="Equipment"
          icon={Wrench}
          items={breakdown.equipment}
          total={breakdown.equipmentTotal}
        />
        <CostSection
          title="PPE"
          icon={Shield}
          items={breakdown.ppe}
          total={breakdown.ppeTotal}
        />
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        {breakdown.crewTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Crews</span>
            <span className="font-medium text-[#021422]">
              {formatCurrency(breakdown.crewTotal)}
            </span>
          </div>
        )}
        {breakdown.materialTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Materials</span>
            <span className="font-medium text-[#021422]">
              {formatCurrency(breakdown.materialTotal)}
            </span>
          </div>
        )}
        {breakdown.equipmentTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Equipment</span>
            <span className="font-medium text-[#021422]">
              {formatCurrency(breakdown.equipmentTotal)}
            </span>
          </div>
        )}
        {breakdown.ppeTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">PPE</span>
            <span className="font-medium text-[#021422]">
              {formatCurrency(breakdown.ppeTotal)}
            </span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-[#021422]">Total</span>
          <span className="text-lg font-bold text-[#021422]">
            {formatCurrency(breakdown.grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
