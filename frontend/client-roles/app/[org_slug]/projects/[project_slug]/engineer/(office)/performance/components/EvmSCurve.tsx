"use client";

import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { Lightbulb } from "lucide-react";
import type { EvmSCurvePoint, MilestoneMarker } from "@/lib/types/miscExpense";

interface Props {
  baselineStartDate: string;
  baselineEndDate: string;
  projectBudget: number;
  data: EvmSCurvePoint[];
  milestones: MilestoneMarker[];
  insights: string[];
  pvTotal?: number;
  evTotal?: number;
  acTotal?: number;
  spi?: number;
  cpi?: number;
}

export default function EvmSCurve({
  projectBudget,
  data,
  milestones,
  insights,
  pvTotal,
  evTotal,
  acTotal,
  spi,
  cpi,
}: Props) {
  const [range, setRange] = useState<"full" | "90d" | "30d">("full");

  const filteredData = useMemo(() => {
    if (range === "full" || data.length === 0) return data;
    const days = range === "90d" ? 90 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return data.filter((d) => new Date(d.date) >= cutoff);
  }, [data, range]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const bacLabel = `BAC ₦${(projectBudget / 1_000_000).toFixed(0)}M`;
  const maxY = projectBudget * 1.15;

  const formatYAxis = (v: number) => {
    if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(0)}M`;
    if (v >= 1_000) return `₦${(v / 1_000).toFixed(0)}K`;
    return `₦${v}`;
  };

  const formatTooltipDate = (label: ReactNode) => {
    const dateValue = typeof label === "string" || typeof label === "number" ? label : "";
    const d = new Date(dateValue);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const visibleMilestones = milestones.filter(
    (m) => new Date(m.date) <= new Date(todayStr),
  );

  const rangeTabs = [
    { key: "full" as const, label: "Full Project" },
    { key: "90d" as const, label: "90 Days" },
    { key: "30d" as const, label: "30 Days" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-[#021422] text-white p-4 flex items-center justify-between">
        <h3 className="font-bold text-sm">EVM S-Curve</h3>
        <div className="flex items-center gap-1">
          {rangeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRange(tab.key)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                range === tab.key
                  ? "bg-white text-[#021422] font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                tickFormatter={(d) => {
                  const dt = new Date(d);
                  return dt.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  });
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
                domain={[0, maxY]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
                formatter={(value: unknown, name: unknown) => {
                  const label = typeof name === "string" ? name : "";
                  if (typeof value !== "number") return ["—", label];
                  return [`₦${value.toLocaleString()}`, label];
                }}
                labelFormatter={formatTooltipDate}
              />

              {/* BAC reference line */}
              <ReferenceLine
                y={projectBudget}
                stroke="#94a3b8"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: bacLabel,
                  position: "right",
                  fill: "#94a3b8",
                  fontSize: 11,
                }}
              />

              {/* Today vertical marker */}
              <ReferenceLine
                x={todayStr}
                stroke="#f59e0b"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{
                  value: "Today",
                  position: "top",
                  fill: "#f59e0b",
                  fontSize: 11,
                }}
              />

              {/* PV area fill — hidden from tooltip & legend */}
              <Area
                type="basis"
                dataKey="pv"
                fill="#0070D4"
                fillOpacity={0.12}
                stroke="none"
                legendType="none"
                tooltipType="none"
              />

              {/* PV line */}
              <Line
                type="basis"
                dataKey="pv"
                name="Planned Value (PV)"
                stroke="#0070D4"
                strokeWidth={2.5}
                dot={false}
              />

              {/* EV line — breaks at today (null values after) */}
              <Line
                type="basis"
                dataKey="ev"
                name="Earned Value (EV)"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
              />

              {/* AC line — breaks at today (null values after) */}
              <Line
                type="basis"
                dataKey="ac"
                name="Actual Cost (AC)"
                stroke="#ef4444"
                strokeWidth={2.5}
                strokeDasharray="4 2"
                dot={false}
                connectNulls={false}
              />

              {/* Milestone dots on PV curve */}
              {visibleMilestones.map((ms) => {
                const point = filteredData.find((d) => d.date === ms.date);
                if (!point) return null;
                return (
                  <ReferenceDot
                    key={ms.label}
                    x={ms.date}
                    y={point.pv}
                    r={6}
                    fill="#0070D4"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              })}

              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value: string) => {
                  if (value === "pv") return "Planned Value (PV)";
                  if (value === "ev") return "Earned Value (EV)";
                  if (value === "ac") return "Actual Cost (AC)";
                  return value;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
            No S-curve data available for this period.
          </div>
        )}

        {/* KPI bar */}
        {(pvTotal !== undefined ||
          evTotal !== undefined ||
          acTotal !== undefined) && (
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-gray-100">
            {pvTotal !== undefined && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-[#0070D4] inline-block" />
                <span className="text-xs text-gray-500">PV:</span>
                <span className="text-xs font-bold text-[#021422]">
                  ₦{pvTotal.toLocaleString()}
                </span>
              </div>
            )}
            {evTotal !== undefined && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-green-500 inline-block" />
                <span className="text-xs text-gray-500">EV:</span>
                <span className="text-xs font-bold text-[#021422]">
                  ₦{evTotal.toLocaleString()}
                </span>
              </div>
            )}
            {acTotal !== undefined && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-red-500 inline-block" />
                <span className="text-xs text-gray-500">AC:</span>
                <span className="text-xs font-bold text-[#021422]">
                  ₦{acTotal.toLocaleString()}
                </span>
              </div>
            )}
            {spi !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">SPI:</span>
                <span
                  className={`text-xs font-bold ${
                    spi >= 1 ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {spi.toFixed(2)}
                </span>
              </div>
            )}
            {cpi !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">CPI:</span>
                <span
                  className={`text-xs font-bold ${
                    cpi >= 1 ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {cpi.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Milestone legend */}
        {visibleMilestones.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-2 pt-2 text-xs text-gray-500">
            {visibleMilestones.map((ms) => (
              <span key={ms.label} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0070D4] inline-block" />
                {ms.label}
              </span>
            ))}
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Lightbulb
                size={16}
                className="text-yellow-600 mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-yellow-800 mb-1">
                  AI Insight
                </p>
                <ul className="space-y-1">
                  {insights.map((insight, i) => (
                    <li key={i} className="text-xs text-yellow-800">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
