"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Download,
  Plus,
  BarChart3,
  Layers,
  Eye,
  X,
  MoreHorizontal,
  Filter,
  CheckCircle,
  Clock,
  ChevronDown,
} from "lucide-react";

const requisitions = [
  { id: 1, prNumber: "PR-2026-045", items: "Cement", amount: "N45.0M", requested: "Mar 02", dueDate: "Mar 12", status: "Pending" },
  { id: 2, prNumber: "PR-2026-044", items: "Rebar", amount: "N22.0M", requested: "Mar 01", dueDate: "Mar 10", status: "Approved" },
  { id: 3, prNumber: "PR-2026-043", items: "Equipment", amount: "N8.5M", requested: "Feb 28", dueDate: "Mar 05", status: "Approved" },
  { id: 4, prNumber: "PR-2026-042", items: "Concrete", amount: "N12.0M", requested: "Feb 27", dueDate: "Mar 15", status: "Pending" },
];

const MyRequisitionsPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Requisitions...</div>;
  }

  return (
    <div className="pb-24 text-[#021422]">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
            MY REQUISITIONS — Purchase Requests
          </h1>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Project: Lagos 12-Storey Mixed-Use Development</span>
            <span className="text-gray-300">|</span>
            <span>Total: 45</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><Clock size={12} className="text-amber-500" /> Pending: 12</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> Approved: 28</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><X size={12} className="text-red-500" /> Rejected: 5</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <Filter size={14} /> Filter Requisitions
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Date:</span>
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                This Month <ChevronDown size={12} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Status:</span>
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                All <ChevronDown size={12} />
              </button>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 text-xs font-medium text-gray-700 placeholder-gray-400 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#0166B0]/20 focus:border-[#0166B0]" />
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">REQUISITION LIST</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left py-2 pr-2">#</th>
                  <th className="text-left py-2 pr-2">PR Number</th>
                  <th className="text-left py-2 pr-2">Items</th>
                  <th className="text-left py-2 pr-2">Amount</th>
                  <th className="text-left py-2 pr-2">Requested</th>
                  <th className="text-left py-2 pr-2">Due Date</th>
                  <th className="text-left py-2 pr-2">Status</th>
                  <th className="text-left py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 pr-2 font-bold text-gray-500">{r.id}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{r.prNumber}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{r.items}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{r.amount}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{r.requested}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{r.dueDate}</td>
                    <td className="py-3 pr-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${r.status === "Approved" ? "text-emerald-700 bg-emerald-50" : r.status === "Rejected" ? "text-red-700 bg-red-50" : "text-amber-700 bg-amber-50"}`}>
                        {r.status === "Approved" && <CheckCircle size={10} />}
                        {r.status === "Pending" && <Clock size={10} />}
                        {r.status === "Rejected" && <X size={10} />}
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><Eye size={14} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><X size={14} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><MoreHorizontal size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors"><Plus size={14} /> Create Requisition</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><BarChart3 size={14} /> Analytics</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Download size={14} /> Export</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Layers size={14} /> Bulk Actions</button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">REQUISITION SUMMARY</h2>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-700 py-2 border-b border-gray-50">
              <span>Total Value: <span className="font-bold text-[#021422]">N87.5M</span></span>
              <span className="text-gray-300">|</span>
              <span>Average Value: <span className="font-bold text-[#021422]">N1.9M</span></span>
              <span className="text-gray-300">|</span>
              <span>Approval Rate: <span className="font-bold text-emerald-600">62%</span></span>
              <span className="text-gray-300">|</span>
              <span>Avg Approval Time: <span className="font-bold text-[#021422]">2.3 days</span></span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-700 py-2">
              <span>Urgent Requisitions: <span className="font-bold text-amber-600">3</span></span>
              <span className="text-gray-300">|</span>
              <span>Overdue: <span className="font-bold text-red-600">2</span></span>
              <span className="text-gray-300">|</span>
              <span>This Month: <span className="font-bold text-[#021422]">N45.0M</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRequisitionsPage;
