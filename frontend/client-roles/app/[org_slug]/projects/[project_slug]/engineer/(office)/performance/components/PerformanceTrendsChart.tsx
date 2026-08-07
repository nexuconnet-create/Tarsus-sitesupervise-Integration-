"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Lightbulb } from "lucide-react";

export interface TrendDataPoint {
  date: string;
  pv: number;  // Planned Value
  ev: number;  // Earned Value
  ac: number;  // Actual Cost
}

interface Props {
  data: TrendDataPoint[];
  insights: string[];
  pvTotal?: number;
  evTotal?: number;
  acTotal?: number;
}

export default function PerformanceTrendsChart({ data, insights, pvTotal, evTotal, acTotal }: Props) {
  const hasData = data.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-[#021422] text-white p-4 flex items-center justify-between">
        <h3 className="font-bold text-sm">Performance Trends — Last 30 Days</h3>
        <span className="text-xs text-gray-400">Planned vs Actual Progress</span>
      </div>

      <div className="p-6">
        {hasData ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="pv" name="Planned Value (PV)" stroke="#0070D4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ev" name="Earned Value (EV)" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ac" name="Actual Cost (AC)" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
            No trend data available for this period.
          </div>
        )}

        {/* EVM Summary */}
        {(pvTotal !== undefined || evTotal !== undefined || acTotal !== undefined) && (
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-gray-100">
            {pvTotal !== undefined && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-[#0070D4] inline-block" />
                <span className="text-xs text-gray-500">Planned Value (PV):</span>
                <span className="text-xs font-bold text-[#021422]">₦{pvTotal.toLocaleString()}</span>
              </div>
            )}
            {evTotal !== undefined && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-green-500 inline-block" />
                <span className="text-xs text-gray-500">Earned Value (EV):</span>
                <span className="text-xs font-bold text-[#021422]">₦{evTotal.toLocaleString()}</span>
              </div>
            )}
            {acTotal !== undefined && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-red-500 inline-block" />
                <span className="text-xs text-gray-500">Actual Cost (AC):</span>
                <span className="text-xs font-bold text-[#021422]">₦{acTotal.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* AI Insights */}
        {insights.length > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Lightbulb size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-yellow-800 mb-1">AI Insight</p>
                <ul className="space-y-1">
                  {insights.map((insight, i) => (
                    <li key={i} className="text-xs text-yellow-800">{insight}</li>
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
