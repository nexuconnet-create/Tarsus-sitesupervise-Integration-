'use client';

import React from 'react';
import { 
  TrendingUp, MapPin, Building2, Download, 
  DollarSign, Activity, PieChart, ArrowUpRight 
} from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';

export default function InvestmentSummaryPage() {
    const searchParams = useSearchParams();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-12 font-sans selection:bg-blue-100">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
            <TrendingUp className="text-emerald-600" size={22} />
            Investment Summary
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            <MapPin size={12} className="text-rose-500" />
            Lagos 12-Storey Mixed-Use Development
          </p>
        </div>
        <div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#021422] text-white text-sm font-bold rounded-lg hover:bg-[#0A4B7D] transition-colors">
            <Download size={16}/> Export Report
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-8 space-y-8">
        
        {/* High-Level Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Initial Investment</p>
              <DollarSign size={16} className="text-slate-300"/>
            </div>
            <p className="text-3xl font-black text-slate-800">₦85,000,000</p>
            <div className="mt-3 bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">Unit 12B Price</span>
              <span className="text-slate-800">₦85,000,000</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={100}/></div>
            <div className="flex items-center justify-between mb-2 relative z-10">
              <p className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">Current Estimated Value</p>
            </div>
            <p className="text-3xl font-black text-white relative z-10">₦92,000,000</p>
            <div className="mt-3 bg-white/10 backdrop-blur rounded-lg p-2.5 flex justify-between items-center text-xs font-bold relative z-10">
              <span className="text-emerald-50">Market Appreciation</span>
              <span className="text-white flex items-center gap-1"><ArrowUpRight size={14}/> +₦7,000,000</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated ROI</p>
              <Activity size={16} className="text-emerald-500"/>
            </div>
            <p className="text-3xl font-black text-emerald-600">+8.2%</p>
            <div className="mt-3 bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">Since Purchase</span>
              <span className="text-slate-800">6 Months</span>
            </div>
          </div>
        </div>

        {/* Visual Breakdown & Asset Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Activity size={18} className="text-blue-500" /> Value Appreciation
              </h2>
            </div>
            
            <div className="flex-1 flex flex-col justify-end min-h-[300px] relative pb-8">
              {/* Fake Graph */}
              <div className="absolute inset-x-0 bottom-8 top-0 border-l border-b border-slate-200 flex items-end">
                {/* Y-Axis Labels */}
                <div className="absolute -left-12 bottom-0 top-0 flex flex-col justify-between text-[10px] font-bold text-slate-400 py-2">
                  <span>95M</span>
                  <span>90M</span>
                  <span>85M</span>
                  <span>80M</span>
                </div>
                
                {/* X-Axis Labels */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Jan '26</span>
                  <span>Feb '26</span>
                  <span>Mar '26</span>
                  <span>Apr '26</span>
                  <span>May '26</span>
                  <span>Jun '26</span>
                </div>

                {/* Graph Area */}
                <div className="w-full h-full relative flex items-end justify-between px-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    <div className="border-t border-slate-100 w-full h-0"></div>
                    <div className="border-t border-slate-100 w-full h-0"></div>
                    <div className="border-t border-slate-100 w-full h-0"></div>
                    <div className="border-t border-slate-100 w-full h-0"></div>
                  </div>

                  {/* SVG Line Graph Simulation */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <polyline 
                      points="0,150 150,140 300,100 450,90 600,40 800,20" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="4"
                      className="drop-shadow-[0_4px_6px_rgba(16,185,129,0.3)]"
                    />
                    {/* Points */}
                    <circle cx="0" cy="150" r="6" fill="#fff" stroke="#10b981" strokeWidth="3" />
                    <circle cx="150" cy="140" r="6" fill="#fff" stroke="#10b981" strokeWidth="3" />
                    <circle cx="300" cy="100" r="6" fill="#fff" stroke="#10b981" strokeWidth="3" />
                    <circle cx="450" cy="90" r="6" fill="#fff" stroke="#10b981" strokeWidth="3" />
                    <circle cx="600" cy="40" r="6" fill="#fff" stroke="#10b981" strokeWidth="3" />
                    <circle cx="800" cy="20" r="6" fill="#fff" stroke="#10b981" strokeWidth="3" />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="bg-[#021422] rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-sm font-bold text-blue-200 uppercase tracking-wider flex items-center gap-2 mb-6">
                <Building2 size={18} /> Asset Details
              </h2>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Property</p>
                  <p className="text-lg font-bold">Lagos 12-Storey</p>
                </div>
                <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Unit</p>
                  <p className="text-lg font-bold">12B (Penthouse Level)</p>
                </div>
                <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Type</p>
                  <p className="text-lg font-bold">3-Bedroom Apartment</p>
                </div>
                <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Floor Area</p>
                  <p className="text-lg font-bold">145 sqm</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-6">
                <PieChart size={18} className="text-blue-500" /> Equity Breakdown
              </h2>
              <div className="flex items-center justify-center mb-6">
                {/* Fake Pie Chart */}
                <div className="relative w-32 h-32 rounded-full conic-gradient-equity border-4 border-white shadow-lg flex items-center justify-center" style={{ background: 'conic-gradient(#3b82f6 60%, #e2e8f0 60% 100%)' }}>
                  <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                    <p className="text-xs font-bold text-slate-400">Equity</p>
                    <p className="text-lg font-black text-blue-600">60%</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Paid Equity</span>
                  <span className="text-slate-800">₦51,000,000</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200"></div> Remaining Balance</span>
                  <span className="text-slate-800">₦34,000,000</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
