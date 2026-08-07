"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  Eye,
  MessageSquare,
  Edit,
  Plus,
  BarChart3,
  Download,
  Layers,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  ChevronDown,
  Trophy,
  TrendingDown,
} from "lucide-react";

const vendors = [
  { id: 1, name: "First Materials ltd", category: "Ready-Mix", rating: 4.8, orders: 45, onTime: "98%", avgResponse: "2.3 min", status: "Active" },
  { id: 2, name: "SteelCo Nigeria", category: "Steel", rating: 4.6, orders: 28, onTime: "92%", avgResponse: "4.1 min", status: "Active" },
  { id: 3, name: "PillingPro Ltd", category: "Foundation", rating: 4.2, orders: 12, onTime: "85%", avgResponse: "5.8 min", status: "Pending" },
  { id: 4, name: "ElectraTech", category: "MEP", rating: 4.5, orders: 8, onTime: "90%", avgResponse: "3.8 min", status: "Active" },
];

const VendorDirectoryPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Vendor Directory...</div>;
  }

  return (
    <div className="pb-24 text-[#021422]">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
            VENDOR DIRECTORY — Approved Suppliers
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Project: Lagos 12-Storey Mixed-Use Development</span>
            <span className="text-gray-300">|</span>
            <span>Total: 24</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> Active: 18</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><Clock size={12} className="text-amber-500" /> Pending: 3</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><XCircle size={12} className="text-red-500" /> Inactive: 3</span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Search by name, category, rating..." className="flex-1 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none" />
            <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-gray-500 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <Filter size={12} /> Filters: All Categories <ChevronDown size={10} />
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">VENDOR LIST</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left py-2 pr-2">#</th>
                  <th className="text-left py-2 pr-2">Vendor Name</th>
                  <th className="text-left py-2 pr-2">Category</th>
                  <th className="text-left py-2 pr-2">Rating</th>
                  <th className="text-left py-2 pr-2">Orders</th>
                  <th className="text-left py-2 pr-2">On-Time</th>
                  <th className="text-left py-2 pr-2">Avg Response</th>
                  <th className="text-left py-2 pr-2">Status</th>
                  <th className="text-left py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 pr-2 font-bold text-gray-500">{v.id}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{v.name}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{v.category}</td>
                    <td className="py-3 pr-2"><span className="flex items-center gap-1 font-bold text-amber-600">{v.rating} <Star size={12} fill="currentColor" /></span></td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{v.orders}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{v.onTime}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{v.avgResponse}</td>
                    <td className="py-3 pr-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${v.status === "Active" ? "text-emerald-700 bg-emerald-50" : v.status === "Pending" ? "text-amber-700 bg-amber-50" : "text-red-700 bg-red-50"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${v.status === "Active" ? "bg-emerald-500" : v.status === "Pending" ? "bg-amber-500" : "bg-red-500"}`} />
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><Eye size={14} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-[#0166B0] hover:bg-blue-50 rounded transition-colors"><MessageSquare size={14} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><Edit size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors"><Plus size={14} /> Add Vendor</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><BarChart3 size={14} /> Vendor Analytics</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Download size={14} /> Export</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Layers size={14} /> Bulk Actions</button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">VENDOR PERFORMANCE METRICS</h2>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-700 py-2 border-b border-gray-50">
              <span className="flex items-center gap-1"><Trophy size={14} className="text-amber-500" /> Top Performers: <span className="font-bold text-[#021422]">First Materials</span></span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1"><TrendingDown size={14} className="text-red-500" /> Underperformers: <span className="font-bold text-red-600">PillingPro Ltd</span></span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1"><Star size={14} className="text-amber-500" /> Average Rating: <span className="font-bold text-[#021422]">4.5 ★</span></span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1"><Clock size={14} className="text-gray-400" /> Avg Response: <span className="font-bold text-[#021422]">4.2 min</span></span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-700 py-2">
              <span>Total Orders: <span className="font-bold text-[#021422]">93</span></span>
              <span className="text-gray-300">|</span>
              <span>On-Time Delivery: <span className="font-bold text-emerald-600">91%</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDirectoryPage;
