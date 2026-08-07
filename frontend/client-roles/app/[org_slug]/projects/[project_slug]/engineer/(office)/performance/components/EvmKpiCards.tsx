"use client";

import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Target, Activity } from "lucide-react";

type KpiColor = "green" | "amber" | "red" | "blue" | "gray";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: KpiColor;
}

function KpiCard({ title, value, subtitle, color = "gray" }: KpiCardProps) {
  // Compact dashboard-summary style: small round icon chip, tight padding,
  // status carried by a colored dot + text rather than a full-card tint or
  // a sticker-style pill. Card height is intrinsic (no stretch) so it
  // doesn't balloon to match a taller sibling in the grid.
  const chipMap: Record<KpiColor, string> = {
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    gray: "bg-gray-100 text-gray-500",
  };

  const dotMap: Record<KpiColor, string> = {
    green: "bg-green-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    gray: "bg-gray-400",
  };

  const textMap: Record<KpiColor, string> = {
    green: "text-green-700",
    amber: "text-amber-700",
    red: "text-red-700",
    blue: "text-blue-700",
    gray: "text-gray-500",
  };

  const iconMap: Record<KpiColor, ReactNode> = {
    green: <TrendingUp size={13} />,
    amber: <TrendingDown size={13} />,
    red: <TrendingDown size={13} />,
    blue: <Activity size={13} />,
    gray: <Target size={13} />,
  };

  return (
    <div className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${chipMap[color]}`}>
          {iconMap[color]}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 truncate">{title}</span>
      </div>
      <div className="text-base font-bold leading-tight text-[#021422]">{value}</div>
      {subtitle && (
        <div className="flex items-center gap-1 mt-1">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotMap[color]}`} />
          <span className={`text-[11px] font-medium truncate ${textMap[color]}`}>{subtitle}</span>
        </div>
      )}
    </div>
  );
}

interface EvmKpiCardsProps {
  pv: string;
  ev: string;
  ac: string;
  /** Budget at Completion — the whole project's budget, NOT what PV shows.
   * PV is only the cumulative plan up to the "as of" date; conflating the
   * two mislabels a partial figure as the full project budget. Optional
   * only because not every caller has it wired up yet. */
  bac?: string;
  spi: string;
  cpi: string;
  scheduleStatusTag: string;
  costStatusTag: string;
}

function formatCurrency(val: string): string {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  if (num >= 1_000_000) return `₦${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `₦${(num / 1_000).toFixed(0)}K`;
  return `₦${num.toFixed(0)}`;
}

// Maps the backend's status tags to a card color.
// Backend vocabulary (evm_service.derive_schedule_tag / derive_cost_tag):
//   schedule: "Ahead of Schedule" | "On Schedule" | "Behind Schedule" | "Critical"
//   cost:     "Under Budget"      | "On Budget"    | "Over Budget"     | "Critical Overrun"
// Bands are anchored at 1.00 with a 0.80 warn floor (amber), below which is red.
function getStatusColor(tag: string): KpiColor {
  switch (tag) {
    case "Ahead of Schedule":
    case "On Schedule":
    case "Under Budget":
    case "On Budget":
      return "green";
    case "Behind Schedule":
    case "Over Budget":
      return "amber";
    case "Critical":
    case "Critical Overrun":
      return "red";
    default:
      return "gray";
  }
}

// Numeric SPI/CPI color uses the same 1.00 anchor / 0.80 warn floor as the
// backend so the index figure never contradicts its status tag.
function indexColor(val: number): KpiColor {
  if (val >= 1) return "green";
  if (val >= 0.8) return "amber";
  return "red";
}

const INDEX_TEXT: Record<KpiColor, string> = {
  green: "text-green-600",
  amber: "text-amber-600",
  red: "text-red-600",
  blue: "text-blue-600",
  gray: "text-gray-600",
};

export default function EvmKpiCards({
  pv,
  ev,
  ac,
  bac,
  spi,
  cpi,
  scheduleStatusTag,
  costStatusTag,
}: EvmKpiCardsProps) {
  const spiVal = parseFloat(spi);
  const cpiVal = parseFloat(cpi);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-start">
      <KpiCard
        title="Planned Value"
        value={formatCurrency(pv)}
        subtitle={bac ? `of ${formatCurrency(bac)} total budget` : "Cumulative plan to date"}
        color="gray"
      />
      <KpiCard
        title="Earned Value"
        value={formatCurrency(ev)}
        subtitle={scheduleStatusTag}
        color={getStatusColor(scheduleStatusTag)}
      />
      <KpiCard
        title="Actual Cost"
        value={formatCurrency(ac)}
        subtitle={costStatusTag}
        color={getStatusColor(costStatusTag)}
      />
      <div className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
          Performance Indices
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-500">SPI</span>
          <span className={`text-sm font-bold ${INDEX_TEXT[indexColor(spiVal)]}`}>
            {spiVal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[11px] text-gray-500">CPI</span>
          <span className={`text-sm font-bold ${INDEX_TEXT[indexColor(cpiVal)]}`}>
            {cpiVal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
