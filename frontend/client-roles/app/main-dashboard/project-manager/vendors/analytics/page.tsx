"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  TrendingDown,
  TrendingUp,
  Package,
  ShoppingCart,
  AlertTriangle,
  Clock,
  Star,
  Truck,
  Zap,
  Calendar,
  BarChart3,
  Search,
  Plus,
  CheckCircle,
  Target,
  Activity,
} from "lucide-react";
import { MOCK_PM_ANALYTICS } from "@/lib/mockData/vendor";

const vendorScores = [
  { vendor: "First Materials", onTime: "92.5%", quality: 4.8, costVsBudget: "+2.3%", delivery: "95%", response: "2.3 min", overallScore: 4.7, trend: "Improving" },
  { vendor: "SteelCo Nig", onTime: "90.0%", quality: 4.6, costVsBudget: "+1.5%", delivery: "98%", response: "4.1 min", overallScore: 4.5, trend: "Stable" },
  { vendor: "PillingPro Ltd", onTime: "85.0%", quality: 4.2, costVsBudget: "-5.0%", delivery: "85%", response: "5.8 min", overallScore: 4.2, trend: "Declining" },
  { vendor: "ElectraTech", onTime: "90.0%", quality: 4.5, costVsBudget: "+3.0%", delivery: "88%", response: "3.8 min", overallScore: 4.5, trend: "Stable" },
];

const spendData = [
  { vendor: "First Materials", amount: "N45.0M", percent: 52 },
  { vendor: "SteelCo Nig", amount: "N22.0M", percent: 25 },
  { vendor: "PillingPro Ltd", amount: "N12.0M", percent: 14 },
  { vendor: "ElectraTech", amount: "N8.5M", percent: 9 },
];

const COLORS = ["#021422", "#0166B0", "#64748b", "#94a3b8"];

export default function PMAnalyticsPage() {
  const [data] = useState(MOCK_PM_ANALYTICS);

  return (
    <div className="pb-24 text-[#021422]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
            VENDOR ANALYTICS — Performance & Insights
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Project: Lagos 12-Storey Mixed-Use Development</span>
            <span className="text-gray-300">|</span>
            <span>Period: Feb 2026</span>
            <span className="text-gray-300">|</span>
            <span>Updated: Today 14:30</span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Original Analytics Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: data.totalOrders, icon: ShoppingCart, color: "text-[#0166B0]" },
            { label: "Active Vendors", value: data.activeVendors, icon: Package, color: "text-[#021422]" },
            { label: "Avg Delivery", value: `${data.avgDeliveryDays} days`, icon: Truck, color: "text-amber-600" },
            { label: "Pending Issues", value: data.pendingIssues, icon: AlertTriangle, color: "text-red-500" },
          ].map((card, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <card.icon size={16} className={card.color} />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{card.label}</span>
              </div>
              <div className="text-xl font-bold text-[#021422]">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Original Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">ORDER DISTRIBUTION BY VENDOR</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.vendorDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {data.vendorDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Original Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">MONTHLY SPEND TREND</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlySpend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#021422" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Performance Scorecard */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">VENDOR PERFORMANCE SCORECARD</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left py-2 pr-2">Vendor</th>
                  <th className="text-left py-2 pr-2">On-Time %</th>
                  <th className="text-left py-2 pr-2">Quality</th>
                  <th className="text-left py-2 pr-2">Cost vs Budget</th>
                  <th className="text-left py-2 pr-2">Delivery</th>
                  <th className="text-left py-2 pr-2">Response</th>
                  <th className="text-left py-2 pr-2">Overall Score</th>
                  <th className="text-left py-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                {vendorScores.map((v, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 pr-2 font-bold text-[#021422]">{v.vendor}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{v.onTime}</td>
                    <td className="py-3 pr-2">
                      <span className="flex items-center gap-1 font-bold text-amber-600">{v.quality} <Star size={12} fill="currentColor" /></span>
                    </td>
                    <td className="py-3 pr-2">
                      <span className={`font-bold ${v.costVsBudget.startsWith("+") ? "text-emerald-600" : v.costVsBudget.startsWith("-") ? "text-red-600" : "text-gray-500"}`}>{v.costVsBudget}</span>
                    </td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{v.delivery}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{v.response}</td>
                    <td className="py-3 pr-2">
                      <span className="flex items-center gap-1 font-bold text-[#021422]">{v.overallScore} <Star size={12} fill="currentColor" className="text-amber-500" /></span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        v.trend === "Improving" ? "text-emerald-700 bg-emerald-50" : v.trend === "Declining" ? "text-red-700 bg-red-50" : "text-gray-700 bg-gray-100"
                      }`}>
                        {v.trend === "Improving" && <TrendingUp size={10} />}
                        {v.trend === "Declining" && <TrendingDown size={10} />}
                        {v.trend === "Stable" && <Activity size={10} />}
                        {v.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spend Analysis */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">SPEND ANALYSIS</h2>
          </div>
          <div className="mb-4 py-3 border-b border-gray-100">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Top Spenders (This Month):</span>
          </div>
          <div className="space-y-4">
            {spendData.map((s, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-700 w-6">{idx + 1}.</span>
                <span className="text-sm font-bold text-[#021422] w-48">{s.vendor}:</span>
                <span className="text-sm font-bold text-gray-700 w-20">{s.amount}</span>
                <span className="text-xs font-bold text-gray-500 w-12">({s.percent}%)</span>
                <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                  <div className="h-full bg-[#021422] rounded" style={{ width: `${s.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-amber-500" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">AI INSIGHTS — Vendor Recommendations</h2>
          </div>
          <div className="mb-4 py-3 border-b border-gray-100">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Search size={14} /> Reorder Recommendations:</span>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-gray-50">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0166B0] shrink-0" />
                <span className="font-bold text-[#021422]">First Materials</span> — Order cement (Stock: 450/500 bags)
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors">
                <Plus size={12} /> Create PO
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-gray-50">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0166B0] shrink-0" />
                <span className="font-bold text-[#021422]">SteelCo Nig</span> — Order rebar (Stock: 120/200 pcs)
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors">
                <Plus size={12} /> Create PO
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              <span className="font-bold text-amber-600">Vendor Risk Alert:</span> PillingPro ltd declining performance (4.2 ★ → 3.8 ★)
            </div>
            <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <AlertTriangle size={12} /> Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
