'use client';

import React from 'react';
import { 
  BarChart2, Download, PieChart, Activity, TrendingUp, DollarSign,
  AlertTriangle, Filter
} from 'lucide-react';

interface ExecProjectAnalyticsProps {
  user?: any;
  orgSlug: string;
}

export default function ExecProjectAnalytics({ user, orgSlug }: ExecProjectAnalyticsProps) {
  const developerName = user?.company_name || 'Martins Construction Ltd';

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Project Analytics
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Cross-Portfolio Analytics</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-[#021422] hover:bg-[#021422]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
            <Download size={16}/> Generate Board Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex gap-2">
            <select className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>All Asset Classes</option>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Infrastructure</option>
            </select>
            <select className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>YTD 2026</option>
              <option>Q3 2026</option>
              <option>Q2 2026</option>
              <option>FY 2025</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-100 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-colors flex items-center gap-2">
            <Filter size={16}/> Advanced Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Resource Allocation */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2 mb-6">
              <PieChart size={18} className="text-blue-600"/> Capital Allocation by Phase
            </h3>
            
            <div className="flex items-center gap-8">
              <div className="w-48 h-48 rounded-full border-8 border-slate-100 relative flex items-center justify-center">
                <div className="absolute inset-0 border-8 border-transparent border-t-emerald-500 border-r-emerald-500 rounded-full rotate-45"></div>
                <div className="absolute inset-0 border-8 border-transparent border-b-blue-500 rounded-full -rotate-12"></div>
                <div className="absolute inset-0 border-8 border-transparent border-l-amber-500 rounded-full rotate-90"></div>
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-800">₦15.8B</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Capital</p>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Substructure / Piling</span>
                    <span className="text-slate-800">42%</span>
                  </div>
                  <p className="text-xs text-slate-500 pl-4">₦6.64B allocated across 4 projects</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Superstructure</span>
                    <span className="text-slate-800">35%</span>
                  </div>
                  <p className="text-xs text-slate-500 pl-4">₦5.53B allocated across 3 projects</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> Interior & Finishes</span>
                    <span className="text-slate-800">23%</span>
                  </div>
                  <p className="text-xs text-slate-500 pl-4">₦3.63B allocated across 5 projects</p>
                </div>
              </div>
            </div>
          </div>

          {/* ROI vs Risk Matrix */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2 mb-6">
              <Activity size={18} className="text-purple-600"/> ROI vs. Schedule Risk Matrix
            </h3>
            
            <div className="relative h-48 bg-white rounded-xl border border-slate-100 overflow-hidden p-4">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                <div className="border-t border-dashed border-slate-400 w-full"></div>
                <div className="border-t border-dashed border-slate-400 w-full"></div>
                <div className="border-t border-dashed border-slate-400 w-full"></div>
                <div className="border-t border-dashed border-slate-400 w-full"></div>
              </div>
              
              {/* Dots */}
              <div className="absolute top-[20%] left-[20%] w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm group cursor-pointer">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Abuja Mall (High ROI, Low Risk)</div>
              </div>
              <div className="absolute top-[40%] left-[70%] w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-sm group cursor-pointer">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Port Harcourt Bridge (Med ROI, High Risk)</div>
              </div>
              <div className="absolute top-[60%] left-[30%] w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm group cursor-pointer">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Lagos 12-Storey (Stable)</div>
              </div>

              {/* Axes Labels */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Schedule Risk (Low → High)</div>
              <div className="absolute top-1/2 left-2 -translate-y-1/2 -rotate-90 origin-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Expected ROI</div>
            </div>
          </div>
          
        </div>

        {/* Detailed Metrics Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600"/> Development Metrics Deep-Dive
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Project</th>
                  <th className="p-4">Cost per SqFt</th>
                  <th className="p-4">Labor / Material Ratio</th>
                  <th className="p-4">Estimated ROI</th>
                  <th className="p-4">Compliance Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-white transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-800 text-sm">Lagos 12-Storey</td>
                  <td className="p-4 text-sm font-semibold text-slate-600">₦24,500</td>
                  <td className="p-4 text-sm font-semibold text-slate-600">40% / 60%</td>
                  <td className="p-4 text-sm font-bold text-emerald-600">18.5%</td>
                  <td className="p-4 text-sm font-bold text-blue-600">92/100</td>
                </tr>
                <tr className="hover:bg-white transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-800 text-sm">Abuja Mall</td>
                  <td className="p-4 text-sm font-semibold text-slate-600">₦32,000</td>
                  <td className="p-4 text-sm font-semibold text-slate-600">35% / 65%</td>
                  <td className="p-4 text-sm font-bold text-emerald-600">22.4%</td>
                  <td className="p-4 text-sm font-bold text-blue-600">96/100</td>
                </tr>
                <tr className="hover:bg-white transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-800 text-sm">Port Harcourt Bridge</td>
                  <td className="p-4 text-sm font-semibold text-slate-600">N/A (Infra)</td>
                  <td className="p-4 text-sm font-semibold text-slate-600">55% / 45%</td>
                  <td className="p-4 text-sm font-bold text-amber-600">12.1%</td>
                  <td className="p-4 text-sm font-bold text-rose-600">74/100</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
