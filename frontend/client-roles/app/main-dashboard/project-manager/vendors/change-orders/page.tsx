"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Eye,
  X,
  MoreHorizontal,
  Plus,
  BarChart3,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  Shield,
  Users,
  Edit,
} from "lucide-react";

const changeOrders = [
  { id: 1, coNumber: "CO-015", type: "Scope Change", vendor: "First Materials", amount: "+N12.0M", status: "Pending", impactSchedule: "+15 days" },
  { id: 2, coNumber: "CO-014", type: "Price Adj.", vendor: "Steelco Nig", amount: "+N8.5M", status: "Approved", impactSchedule: "+7 days" },
  { id: 3, coNumber: "CO-013", type: "Schedule Adj.", vendor: "PillingPro Ltd", amount: "N0", status: "Approved", impactSchedule: "-5 days" },
  { id: 4, coNumber: "CO-012", type: "Scope Change", vendor: "ElectraTech", amount: "+N18.0M", status: "Rejected", impactSchedule: "+30 days" },
];

const ChangeOrdersPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedCO, setSelectedCO] = useState(changeOrders[0]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Change Orders...</div>;
  }

  return (
    <div className="pb-24 text-[#021422]">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
            CHANGE ORDER CONTROL — Vendor Changes
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Project: Lagos 12-Storey Mixed-Use Development</span>
            <span className="text-gray-300">|</span>
            <span>Total: 15</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><Clock size={12} className="text-amber-500" /> Pending: 4</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> Approved: 8</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><XCircle size={12} className="text-red-500" /> Rejected: 3</span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">CHANGE ORDER REGISTER</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left py-2 pr-2">#</th>
                  <th className="text-left py-2 pr-2">CO Number</th>
                  <th className="text-left py-2 pr-2">Type</th>
                  <th className="text-left py-2 pr-2">Vendor</th>
                  <th className="text-left py-2 pr-2">Amount</th>
                  <th className="text-left py-2 pr-2">Status</th>
                  <th className="text-left py-2 pr-2">Impact Schedule</th>
                  <th className="text-left py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {changeOrders.map((co) => (
                  <tr key={co.id} onClick={() => setSelectedCO(co)} className={`border-b border-gray-50 cursor-pointer transition-colors ${selectedCO?.id === co.id ? "bg-blue-50/50" : "hover:bg-gray-50/50"}`}>
                    <td className="py-3 pr-2 font-bold text-gray-500">{co.id}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{co.coNumber}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{co.type}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{co.vendor}</td>
                    <td className="py-3 pr-2">
                      <span className={`font-bold ${co.amount.startsWith("+") ? "text-red-600" : co.amount === "N0" ? "text-gray-500" : "text-emerald-600"}`}>{co.amount}</span>
                    </td>
                    <td className="py-3 pr-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${co.status === "Approved" ? "text-emerald-700 bg-emerald-50" : co.status === "Rejected" ? "text-red-700 bg-red-50" : "text-amber-700 bg-amber-50"}`}>
                        {co.status === "Approved" && <CheckCircle size={10} />}
                        {co.status === "Rejected" && <XCircle size={10} />}
                        {co.status === "Pending" && <Clock size={10} />}
                        {co.status}
                      </span>
                    </td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{co.impactSchedule}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><Eye size={14} /></button>
                        {co.status === "Pending" && <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><X size={14} /></button>}
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><MoreHorizontal size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors"><Plus size={14} /> Create Change Order</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><BarChart3 size={14} /> Impact Analysis</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Download size={14} /> Export</button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">CHANGE ORDER IMPACT ANALYSIS</h2>
          </div>
          <div className="mb-4 py-3 border-b border-gray-100">
            <span className="text-sm font-bold text-[#021422]">{selectedCO?.coNumber}: {selectedCO?.type} — Additional Material Order</span>
          </div>
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 py-2">
              <CheckCircle size={16} className="text-[#0166B0] mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Justification:</span>
                <p className="text-sm font-medium text-gray-700">Client request for additional cement supply</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2">
              <DollarSign size={16} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Budget Impact:</span>
                <p className="text-sm font-medium text-gray-700">+N12,000,000 (4.1% of BAC)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2">
              <Calendar size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Schedule Impact:</span>
                <p className="text-sm font-medium text-gray-700">+15 days</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2">
              <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Risk Impact:</span>
                <p className="text-sm font-medium text-gray-700">Additional material procurement, extended delivery timeline</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2">
              <Users size={16} className="text-[#0166B0] mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stakeholder:</span>
                <p className="text-sm font-medium text-gray-700">Client J.Olu, PM Adebayo</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2">
              <Shield size={16} className="text-[#021422] mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Decision:</span>
                <p className="text-sm font-medium text-gray-700 flex items-center gap-1"><Clock size={14} className="text-amber-500" /> Awaiting Approval</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors"><CheckCircle size={14} /> Approve</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors"><XCircle size={14} /> Reject</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Edit size={14} /> Request Revision</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><FileText size={14} /> View Full Impact</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeOrdersPage;
