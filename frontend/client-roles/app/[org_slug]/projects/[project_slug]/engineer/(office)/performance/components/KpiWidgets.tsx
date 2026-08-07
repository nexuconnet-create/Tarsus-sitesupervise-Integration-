"use client";

import { AlertTriangle, CheckCircle, Minus } from "lucide-react";

interface KpiWidgetProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  target?: string;
  status: "good" | "monitor" | "critical";
  subtitle?: string;
  badgeLabel: string; // contextual per metric
}

function statusStyles(status: KpiWidgetProps["status"]) {
  if (status === "good")    return { badge: "bg-green-100 text-green-700" };
  if (status === "monitor") return { badge: "bg-yellow-100 text-yellow-700" };
  return                           { badge: "bg-red-100 text-red-700" };
}

function KpiWidget({ label, value, unit, delta, target, status, subtitle, badgeLabel }: KpiWidgetProps) {
  const styles = statusStyles(status);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${styles.badge}`}>
          {badgeLabel}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[#021422]">{value}</span>
        {unit && <span className="text-xs text-gray-400">{unit}</span>}
      </div>
      {subtitle && <p className="text-[11px] text-gray-400 leading-tight">{subtitle}</p>}
      <div className="flex items-center justify-between text-[11px] text-gray-400">
        {delta && (
          <span className={`font-medium ${status === "good" ? "text-green-600" : status === "monitor" ? "text-yellow-600" : "text-red-600"}`}>
            {delta}
          </span>
        )}
        {target && <span>Target: {target}</span>}
      </div>
    </div>
  );
}

export interface KpiData {
  spi: number | null;
  cpi: number | null;
  qualityPassRate: number | null;
  safetyScore: number | null;
  ltiFreeDays: number | null;       // count of days without a Lost Time Injury
  costOverrun: number | null;
  scheduleVarianceDays: number | null;
}

function scoreSpi(spi: number | null): KpiWidgetProps["status"] {
  if (spi === null) return "monitor";
  if (spi >= 1.0)   return "good";
  if (spi >= 0.9)   return "monitor";
  return "critical";
}

function spiBadge(spi: number | null): string {
  if (spi === null) return "Monitor";
  if (spi >= 1.0)   return "Ahead";
  if (spi >= 0.9)   return "Behind";
  return "Critical";
}

function scoreCpi(cpi: number | null): KpiWidgetProps["status"] {
  if (cpi === null) return "monitor";
  if (cpi >= 1.0)   return "good";
  if (cpi >= 0.9)   return "monitor";
  return "critical";
}

function cpiBadge(cpi: number | null): string {
  if (cpi === null) return "Monitor";
  if (cpi >= 1.0)   return "On Budget";
  if (cpi >= 0.9)   return "Over";
  return "Over Budget";
}

function scoreQuality(rate: number | null): KpiWidgetProps["status"] {
  if (rate === null) return "monitor";
  if (rate >= 95)    return "good";
  if (rate >= 85)    return "monitor";
  return "critical";
}

function qualityBadge(rate: number | null): string {
  if (rate === null) return "Monitor";
  if (rate >= 95)    return "Good";
  if (rate >= 85)    return "Monitor";
  return "Review";
}

function scoreSafety(days: number | null): KpiWidgetProps["status"] {
  if (days === null) return "monitor";
  if (days >= 100)   return "good";
  if (days >= 30)    return "monitor";
  return "critical";
}

function safetyBadge(days: number | null): string {
  if (days === null) return "Monitor";
  if (days >= 100)   return "Good";
  if (days >= 30)    return "Monitor";
  return "Review";
}

export default function KpiWidgets({ data }: { data: KpiData }) {
  const { spi, cpi, qualityPassRate, ltiFreeDays, costOverrun, scheduleVarianceDays } = data;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiWidget
        label="Schedule"
        value={spi !== null ? spi.toFixed(2) : "N/A"}
        subtitle="Schedule Performance Index"
        delta={scheduleVarianceDays !== null ? `${scheduleVarianceDays > 0 ? "+" : ""}${scheduleVarianceDays.toFixed(1)} days` : undefined}
        target="SPI ≥ 1.0"
        status={scoreSpi(spi)}
        badgeLabel={spiBadge(spi)}
      />
      <KpiWidget
        label="Cost"
        value={cpi !== null ? cpi.toFixed(2) : "N/A"}
        subtitle="Cost Performance Index"
        delta={costOverrun !== null && costOverrun !== 0 ? `+₦${Math.abs(costOverrun).toLocaleString()}` : undefined}
        target="CPI ≥ 1.0"
        status={scoreCpi(cpi)}
        badgeLabel={cpiBadge(cpi)}
      />
      <KpiWidget
        label="Quality"
        value={qualityPassRate !== null ? qualityPassRate.toFixed(0) : "N/A"}
        unit="%"
        subtitle="Task completion pass rate"
        target="95%"
        status={scoreQuality(qualityPassRate)}
        badgeLabel={qualityBadge(qualityPassRate)}
      />
      <KpiWidget
        label="Safety"
        value={ltiFreeDays !== null ? ltiFreeDays : "N/A"}
        unit="days"
        subtitle="LTI-Free days"
        target="100 days"
        status={scoreSafety(ltiFreeDays)}
        badgeLabel={safetyBadge(ltiFreeDays)}
      />
    </div>
  );
}
