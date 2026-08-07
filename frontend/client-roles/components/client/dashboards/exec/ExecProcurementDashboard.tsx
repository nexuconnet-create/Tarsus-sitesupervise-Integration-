'use client';

import React from 'react';
import {
  ShoppingCart, AlertTriangle, PieChart, CheckSquare, Clock, XCircle, Package, CheckCircle
} from 'lucide-react';

interface ExecProcurementDashboardProps {
  user?: any;
  orgSlug: string;
}

export default function ExecProcurementDashboard({ user, orgSlug }: ExecProcurementDashboardProps) {
  const developerName = user?.company_name || 'Martins Construction Ltd';

  const poQueue = [
    { id: 'PO-2026-894', vendor: 'Dangote Cement Plc', amount: '₦125,000,000', project: 'Lagos 12-Storey', status: 'Pending Approval' },
    { id: 'PO-2026-895', vendor: 'Structuracore Eng.', amount: '₦45,500,000', project: 'Abuja Mall', status: 'Pending Approval' },
    { id: 'PO-2026-891', vendor: 'BrightSpark Electricals', amount: '₦8,200,000', project: 'Port Harcourt Bridge', status: 'Approved' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">

      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Procurement Dashboard
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Global Supply Chain</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Material Spend YTD</p>
            <p className="text-3xl font-black text-slate-800">₦1.4B</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pending POs</p>
            <p className="text-3xl font-black text-slate-800">24</p>
            <p className="text-xs font-bold text-amber-600 mt-2">Valued at ₦284M</p>
          </div>
          <div className="bg-gradient-to-br from-[#021422] to-[#021422] text-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">Supply Chain Risk Level</p>
            <p className="text-3xl font-black text-amber-400">Elevated</p>
            <p className="text-xs text-blue-200 mt-2">Due to local cement shortages.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Material Spend Analytics */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2 mb-6">
              <PieChart size={18} className="text-blue-600" /> Spend by Category
            </h3>

            <div className="flex items-center gap-8">
              <div className="w-40 h-40 rounded-full border-[12px] border-slate-100 relative flex items-center justify-center">
                <div className="absolute inset-0 border-[12px] border-transparent border-t-slate-800 border-r-slate-800 rounded-full rotate-45"></div>
                <div className="absolute inset-0 border-[12px] border-transparent border-b-blue-500 rounded-full -rotate-12"></div>
                <div className="absolute inset-0 border-[12px] border-transparent border-l-emerald-500 rounded-full rotate-90"></div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-800 rounded-sm"></div> Concrete & Cement</span>
                    <span className="text-slate-800">45%</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Steel & Rebar</span>
                    <span className="text-slate-800">30%</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> MEP Equipment</span>
                    <span className="text-slate-800">15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supply Chain Alerts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50">
              <h3 className="font-bold text-amber-900 uppercase tracking-wider text-sm flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600" /> Supply Chain Alerts
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-white border border-gray-100 rounded-xl flex gap-4">
                <Package className="text-slate-400 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Cement Scarcity Expected</h4>
                  <p className="text-xs text-slate-600 mt-1">Market intelligence indicates a 15% price hike in cement due to factory maintenance at major suppliers starting next week. Recommend pre-ordering stock for Abuja Mall.</p>
                </div>
              </div>
              <div className="p-4 bg-white border border-gray-100 rounded-xl flex gap-4">
                <Package className="text-slate-400 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Port Congestion Delay</h4>
                  <p className="text-xs text-slate-600 mt-1">Shipment of HVAC units for Lagos 12-Storey is currently delayed by 7 days at Apapa port.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Purchase Order Approval Queue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
              <CheckSquare size={18} className="text-blue-600" /> High-Value PO Approval Queue
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">PO Number</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {poQueue.map((po, idx) => (
                  <tr key={idx} className="hover:bg-white transition-colors">
                    <td className="p-4 pl-6 font-bold text-blue-600 text-sm cursor-pointer hover:underline">{po.id}</td>
                    <td className="p-4 font-semibold text-slate-700 text-sm">{po.vendor}</td>
                    <td className="p-4 text-xs font-medium text-slate-500">{po.project}</td>
                    <td className="p-4 text-sm font-black text-slate-800">{po.amount}</td>
                    <td className="p-4">
                      {po.status === 'Pending Approval' ? (
                        <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 w-max px-2.5 py-1 rounded-md border border-amber-100 text-[10px] font-bold uppercase tracking-wider">
                          <Clock size={12} /> Pending
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 w-max px-2.5 py-1 rounded-md border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle size={12} /> Approved
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {po.status === 'Pending Approval' && (
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 bg-white" title="Reject">
                            <XCircle size={16} />
                          </button>
                          <button className="p-2 text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm" title="Approve">
                            <CheckSquare size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
