'use client';

import React from 'react';
import { 
  DollarSign, TrendingUp, Download, PieChart, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface ExecFinancialOverviewProps {
  user?: any;
  orgSlug: string;
}

export default function ExecFinancialOverview({ user, orgSlug }: ExecFinancialOverviewProps) {
  const developerName = user?.company_name || 'Martins Construction Ltd';

  const budgetData = [
    { name: 'Lagos 12-Storey', budget: '₦1.80B', revised: '₦1.85B', spent: '₦1.20B', variance: '+₦50M', status: 'On Budget' },
    { name: 'Abuja Mall', budget: '₦2.40B', revised: '₦2.40B', spent: '₦1.50B', variance: '₦0M', status: 'On Budget' },
    { name: 'Port Harcourt Bridge', budget: '₦3.20B', revised: '₦3.50B', spent: '₦0.90B', variance: '+₦300M', status: 'Over Budget' },
    { name: 'Ibadan Townhouse Estate', budget: '₦1.20B', revised: '₦1.15B', spent: '₦0.80B', variance: '-₦50M', status: 'Under Budget' },
    { name: 'Enugu Shopping Complex', budget: '₦2.80B', revised: '₦2.80B', spent: '₦0.10B', variance: '₦0M', status: 'On Budget' },
  ];

  const cashFlows = [
    { month: 'Jan', in: 400, out: 240 },
    { month: 'Feb', in: 300, out: 139 },
    { month: 'Mar', in: 200, out: 980 },
    { month: 'Apr', in: 278, out: 390 },
    { month: 'May', in: 189, out: 480 },
    { month: 'Jun', in: 239, out: 380 },
    { month: 'Jul', in: 349, out: 430 },
  ];
  const maxFlow = Math.max(...cashFlows.map(c => Math.max(c.in, c.out)));

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Financial Overview
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Q3 FY2026</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-gray-100 hover:bg-white text-slate-700 text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
            <Download size={16}/> Export Ledger
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={48} className="text-emerald-500"/></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Revenue YTD</p>
            <p className="text-3xl font-black text-slate-800">₦3.2B</p>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-2 bg-emerald-50 w-max px-2 py-0.5 rounded border border-emerald-100"><ArrowUpRight size={12}/> +14.2% vs last year</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={48} className="text-rose-500"/></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Expenses</p>
            <p className="text-3xl font-black text-slate-800">₦2.4B</p>
            <p className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-2 bg-rose-50 w-max px-2 py-0.5 rounded border border-rose-100"><ArrowUpRight size={12}/> +5.1% vs last year</p>
          </div>
          <div className="bg-gradient-to-br from-[#021422] to-[#021422] text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">Net Profit</p>
            <p className="text-3xl font-black">₦0.8B</p>
            <div className="mt-2 text-xs font-bold bg-white/10 w-max px-2 py-0.5 rounded border border-white/20">Margin: 25%</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><PieChart size={48} className="text-blue-500"/></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Portfolio ROI</p>
            <p className="text-3xl font-black text-blue-600">25.3%</p>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-2 bg-emerald-50 w-max px-2 py-0.5 rounded border border-emerald-100">Target: 22.0%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Budget vs Actual Ledger */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Project Ledger (Budget vs Actual)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4 pl-6">Project Name</th>
                    <th className="p-4">Original Budget</th>
                    <th className="p-4">Revised Budget</th>
                    <th className="p-4">Spent to Date</th>
                    <th className="p-4">Variance</th>
                    <th className="p-4 pr-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {budgetData.map((proj, idx) => (
                    <tr key={idx} className="hover:bg-white transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-800 text-sm">{proj.name}</td>
                      <td className="p-4 text-xs font-medium text-slate-500">{proj.budget}</td>
                      <td className="p-4 text-xs font-bold text-slate-700">{proj.revised}</td>
                      <td className="p-4 text-xs font-bold text-slate-800">{proj.spent}</td>
                      <td className="p-4 text-xs font-bold">
                        <span className={proj.variance.startsWith('+') && proj.variance !== '+₦0M' ? 'text-rose-600' : proj.variance.startsWith('-') ? 'text-emerald-600' : 'text-slate-400'}>
                          {proj.variance}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                          proj.status === 'Over Budget' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          proj.status === 'Under Budget' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-slate-100 text-slate-700 border-gray-100'
                        }`}>
                          {proj.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cash Flow Visual & Overrun Alerts */}
          <div className="space-y-6">
            
            {/* Cost Overrun Alert */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-rose-700 font-bold uppercase tracking-wider text-sm mb-4">
                <AlertTriangle size={18} /> Cost Overrun Alert
              </div>
              <p className="text-sm font-semibold text-rose-900 mb-2">Port Harcourt Bridge</p>
              <p className="text-xs text-rose-800 mb-4">Material costs and logistical delays have caused a +₦300M variance from the original budget.</p>
              <button className="w-full py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 shadow-sm transition-colors">
                Review Change Orders
              </button>
            </div>

            {/* Cash Flow Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm mb-6">Cash Flow Trends</h3>
              <div className="space-y-4">
                {cashFlows.map((flow, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-500 w-6 uppercase">{flow.month}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full flex relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-emerald-500 rounded-l-full opacity-80" style={{ width: `${(flow.in / maxFlow) * 50}%` }}></div>
                      <div className="absolute top-0 left-1/2 h-full bg-rose-500 rounded-r-full opacity-80" style={{ width: `${(flow.out / maxFlow) * 50}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6 pt-4 border-t border-slate-100 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Cash In</div>
                <div className="flex items-center gap-1.5 text-rose-600"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Cash Out</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
