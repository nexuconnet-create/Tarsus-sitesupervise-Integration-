"use client";

import { Users, Package, Wrench, Shield, Receipt, Lock, AlertTriangle, Loader2 } from "lucide-react";
import type { Task, Crew } from "../types";
import {
  getCostBreakdown,
  formatCurrency,
  type CostLineItem,
} from "../utils/costCalculator";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { useMilestoneExpenses } from "@/lib/hooks/useMiscExpenses";
import { taskService } from "@/lib/services/taskService";
import type { ApiCostComparison, CostDataQualityFlag } from "@/lib/types/api";

interface CostTabProps {
  task: Task;
  crews?: Crew[];
}

const num = (v: string | null | undefined): number => parseFloat(v ?? "0") || 0;

const FLAG_LABELS: Record<CostDataQualityFlag, string> = {
  cost_not_locked: "Planned cost is a draft — task not yet approved.",
  missing_planned_days: "A daily-worker crew has no planned days; planned crew cost may be understated.",
  missing_actual_worker_count: "No actual headcount recorded on any crew.",
  no_attendance_data: "No attendance data — actual crew cost fell back to days-worked.",
  missing_equipment_cost: "Equipment with no cost rate configured contributes zero.",
};

/** Authoritative planned-vs-actual breakdown from the cost-comparison endpoint. */
function CostComparisonPanel({ data }: { data: ApiCostComparison }) {
  const { planned, actual, variance, data_quality } = data;
  const varTotal = num(variance.total_cost);
  const overrunPct = variance.cost_overrun_pct;

  const varColor = (v: number) =>
    v > 0 ? "text-red-600" : v < 0 ? "text-green-600" : "text-gray-500";
  const fmtVar = (v: number) => `${v > 0 ? "+" : ""}${formatCurrency(v)}`;

  // Equipment cost ALREADY INCLUDES demurrage for rented/leased items — the
  // demurrage row below is a breakdown of that figure, not an addition to it.
  // Only show it when there's actually something to break down.
  const hasDemurrage =
    num(planned.equipment_demurrage_cost) !== 0 || num(actual.equipment_demurrage_cost) !== 0;

  const rows: { label: string; p: string; a: string; v: string; sub?: boolean }[] = [
    { label: "Crew", p: planned.crew_cost, a: actual.crew_cost, v: variance.crew_cost },
    { label: "Materials", p: planned.material_cost, a: actual.material_cost, v: variance.material_cost },
    { label: "Equipment", p: planned.equipment_cost, a: actual.equipment_cost, v: variance.equipment_cost },
    ...(hasDemurrage
      ? [{
          label: "— of which demurrage (idle standby)",
          p: planned.equipment_demurrage_cost,
          a: actual.equipment_demurrage_cost,
          v: variance.equipment_demurrage_cost,
          sub: true,
        }]
      : []),
    { label: "PPE", p: planned.ppe_cost, a: actual.ppe_cost, v: variance.ppe_cost },
  ];

  return (
    <div className="space-y-4">
      {/* Headline: planned vs actual */}
      <div className="bg-[#021422] rounded-xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-300 uppercase tracking-wider">
            Planned vs Actual
          </p>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              planned.is_locked ? "bg-green-500/20 text-green-300" : "bg-amber-500/20 text-amber-300"
            }`}
          >
            <Lock size={10} />
            {planned.is_locked ? "Locked" : "Draft"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Planned</p>
            <p className="text-xl font-bold">{formatCurrency(num(planned.total_cost))}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Actual</p>
            <p className="text-xl font-bold">{formatCurrency(num(actual.total_cost))}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Variance</p>
            <p className={`text-xl font-bold ${varTotal > 0 ? "text-red-400" : varTotal < 0 ? "text-green-400" : ""}`}>
              {fmtVar(varTotal)}
            </p>
            {overrunPct != null && (
              <p className="text-[10px] text-gray-400">
                {overrunPct > 0 ? "+" : ""}{overrunPct}% vs plan
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Per-category comparison table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-4 gap-2 px-4 py-2 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <span>Category</span>
          <span className="text-right">Planned</span>
          <span className="text-right">Actual</span>
          <span className="text-right">Variance</span>
        </div>
        <div className="divide-y divide-gray-50">
          {rows.map((r) => {
            const v = num(r.v);
            return (
              <div
                key={r.label}
                className={`grid grid-cols-4 gap-2 px-4 py-2.5 text-sm ${r.sub ? "bg-gray-50/50" : ""}`}
              >
                <span className={r.sub ? "pl-3 text-xs italic text-gray-500" : "font-medium text-gray-900"}>
                  {r.label}
                </span>
                <span className={`text-right ${r.sub ? "text-xs text-gray-500" : "text-gray-600"}`}>
                  {formatCurrency(num(r.p))}
                </span>
                <span className={`text-right ${r.sub ? "text-xs text-gray-500" : "text-gray-600"}`}>
                  {formatCurrency(num(r.a))}
                </span>
                <span className={`text-right ${r.sub ? "text-xs" : "font-semibold"} ${varColor(v)}`}>
                  {fmtVar(v)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-2 px-4 py-2.5 border-t border-gray-200 text-sm font-bold">
          <span className="text-[#021422]">Total</span>
          <span className="text-right text-[#021422]">{formatCurrency(num(planned.total_cost))}</span>
          <span className="text-right text-[#021422]">{formatCurrency(num(actual.total_cost))}</span>
          <span className={`text-right ${varColor(varTotal)}`}>{fmtVar(varTotal)}</span>
        </div>
      </div>

      {/* Worker count + attendance basis */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>
          Workers — planned {planned.worker_count} · actual {actual.worker_count}
        </span>
        {actual.attendance_based && (
          <span className="text-gray-400">Actual crew cost from attendance</span>
        )}
      </div>

      {/* Data-quality flags */}
      {!data_quality.is_complete && data_quality.flags.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-1.5">
          {data_quality.flags.map((f) => (
            <p key={f} className="flex items-start gap-2 text-xs text-amber-700">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              {FLAG_LABELS[f] ?? f}
            </p>
          ))}
        </div>
      )}
    </div>
  );
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
          <div
            key={idx}
            className="px-4 py-3 flex items-center justify-between"
          >
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
  const params = useParams();
  const { data: projectUuid } = useProjectUuid(
    params?.org_slug as string,
    params?.project_slug as string,
  );
  const { data: storeMiscExpenses = [] } = useMilestoneExpenses(projectUuid, task.milestoneId || undefined);
  const breakdown = getCostBreakdown(task, crews, storeMiscExpenses);
  const hasAnyCosts = breakdown.grandTotal > 0;

  // Authoritative planned-vs-actual comparison from the backend.
  const { data: comparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ["task-cost-comparison", projectUuid, task.id],
    queryFn: async () => {
      const res = await taskService.getCostComparison(projectUuid!, task.id);
      return res.data.data;
    },
    enabled: !!projectUuid && !!task.id,
    staleTime: 30_000,
  });

  if (!hasAnyCosts && !comparison && !comparisonLoading) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          ₦
        </div>
        <h3 className="text-sm font-semibold text-gray-600 mb-1">
          No Cost Data
        </h3>
        <p className="text-xs text-gray-400">
          No costs have been assigned to this task. Add crew prices or inventory
          unit costs during task creation.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Authoritative planned-vs-actual comparison (backend) */}
      {comparisonLoading && !comparison && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" />
          Loading cost comparison…
        </div>
      )}
      {comparison && <CostComparisonPanel data={comparison} />}

      {/* Itemized estimate (client-side breakdown of allocated resources) */}
      {hasAnyCosts && (
        <p className="text-xs font-bold uppercase text-gray-400 tracking-wider pt-2">
          Estimated breakdown
        </p>
      )}

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
        <CostSection
          title="Miscellaneous"
          icon={Receipt}
          items={breakdown.miscellaneous}
          total={breakdown.miscTotal}
        />
      </div>

      {/* Summary */}
      {hasAnyCosts && (
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
        {breakdown.miscTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Miscellaneous</span>
            <span className="font-medium text-[#021422]">
              {formatCurrency(breakdown.miscTotal)}
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
      )}
    </div>
  );
}
