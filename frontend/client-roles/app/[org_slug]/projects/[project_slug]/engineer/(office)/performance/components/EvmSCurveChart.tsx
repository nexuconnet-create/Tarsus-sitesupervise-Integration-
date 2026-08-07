"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { EvmTrendPoint } from "@/lib/types/evm";

export type EvmTrendGranularity = "daily" | "weekly" | "monthly";

interface EvmSCurveChartProps {
  data: EvmTrendPoint[];
  range?: EvmTrendGranularity;
  onRangeChange?: (range: EvmTrendGranularity) => void;
  projectBudget?: string;
  /** The pinned "as of" date — where EV/AC data stops. Defaults to today's
   * real date only when the caller doesn't pass one (mock callers always
   * should, since "today" here means the mock's pinned date, not wall-clock). */
  asOfDate?: string;
}

const GRANULARITY_LABELS: Record<EvmTrendGranularity, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

function formatCurrency(val: number): string {
  if (!Number.isFinite(val)) return "—";
  if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `₦${(val / 1_000).toFixed(0)}K`;
  return `₦${val.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

/** A compact tooltip — the default recharts one renders every series with
 * generous padding and looked oversized. Same three PV/EV/AC values, just
 * tighter spacing and smaller type. */
function CompactTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs space-y-0.5">
      <p className="font-semibold text-[#021422] mb-1">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            {item.name}
          </span>
          <span className="font-semibold text-gray-700">{formatCurrency(item.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function EvmSCurveChart({
  data,
  range = "weekly",
  onRangeChange,
  projectBudget,
  asOfDate,
}: EvmSCurveChartProps) {
  const [activeRange, setActiveRange] = useState(range);

  const handleRangeChange = (r: EvmTrendGranularity) => {
    setActiveRange(r);
    onRangeChange?.(r);
  };

  const chartData = data.map((d) => ({
    ...d,
    pv: parseFloat(d.pv),
    // null (not NaN) so recharts renders a gap past the as-of date instead
    // of a broken/zero-valued point once EV/AC stop being provided.
    ev: d.ev !== undefined ? parseFloat(d.ev) : null,
    ac: d.ac !== undefined ? parseFloat(d.ac) : null,
    dateLabel: formatDate(d.date),
  }));

  const today = asOfDate ?? new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#021422]">EVM S-Curve</h3>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(["daily", "weekly", "monthly"] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleRangeChange(r)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeRange === r
                  ? "bg-[#021422] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {GRANULARITY_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-400">
          No trend data available. Snapshots will appear after the first daily run.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <Tooltip content={<CompactTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {projectBudget && (
              <ReferenceLine
                y={parseFloat(projectBudget)}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                label={{ value: "BAC", position: "right", fontSize: 11 }}
              />
            )}
            <ReferenceLine
              x={chartData.findIndex((d) => d.date >= today) >= 0
                ? chartData[chartData.findIndex((d) => d.date >= today)]?.dateLabel
                : undefined}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{ value: "Today", position: "top", fontSize: 11, fill: "#ef4444" }}
            />
            <Line
              type="monotone"
              dataKey="pv"
              stroke="#94a3b8"
              strokeWidth={2}
              dot={false}
              name="PV (Planned Value)"
            />
            <Line
              type="monotone"
              dataKey="ev"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name="EV (Earned Value)"
            />
            <Line
              type="monotone"
              dataKey="ac"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="AC (Actual Cost)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
