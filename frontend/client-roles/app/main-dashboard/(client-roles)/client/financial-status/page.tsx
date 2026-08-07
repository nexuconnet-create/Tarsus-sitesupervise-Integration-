'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { 
  Activity, TrendingUp, AlertTriangle, CheckCircle2, 
  Clock, ShieldCheck, DollarSign, Download
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function FinancialStatusPage() {
    const org_slug = "";
  const project_slug = "";
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3">
            <Activity className="text-blue-600" size={24} />
            EXECUTIVE FINANCIAL STATUS
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Health: GOOD
            </span>
          </div>
        </div>

        <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
          <Download size={16} /> Export Executive Brief
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
          
          {/* Executive Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ROI Forecast</p>
              <p className="text-xl font-black text-emerald-600 font-mono">+12.5%</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cash Runway</p>
              <p className="text-xl font-black text-blue-600 font-sans">4.5 Months</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cost Variance</p>
              <p className="text-xl font-black text-emerald-600 font-mono">-2.1%</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contingency</p>
              <p className="text-xl font-black text-slate-800 font-mono">₦150M Rem.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Overall Comp.</p>
              <p className="text-xl font-black text-slate-800 font-sans text-nowrap">45% <span className="text-xs text-slate-400 font-bold">Cost</span> / 48% <span className="text-xs text-slate-400 font-bold">Time</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* EAC vs BAC Chart */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-8">
                <TrendingUp size={16} /> Projected Final Cost (EAC) vs Budget (BAC)
              </h2>

              <div className="space-y-8">
                
                {/* BAC */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-slate-300"></div> Budget At Completion (BAC)
                    </span>
                    <span className="text-xl font-mono font-black text-slate-800">₦1.80B</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-lg h-8 overflow-hidden relative">
                    <div className="bg-slate-300 h-8 absolute left-0 top-0 w-full"></div>
                  </div>
                </div>

                {/* EAC */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500"></div> Estimate At Completion (EAC)
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider mr-3">
                        Under Budget
                      </span>
                      <span className="text-xl font-mono font-black text-blue-600">₦1.76B</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-lg h-8 overflow-hidden relative border border-slate-200">
                    <div className="bg-blue-500 h-8 absolute left-0 top-0" style={{ width: '97.8%' }}></div>
                    {/* Dotted line showing BAC limit */}
                    <div className="absolute right-0 top-0 bottom-0 w-px border-r-2 border-dashed border-slate-400"></div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-3 text-right">
                    Currently tracking ₦40M under the original baseline budget.
                  </p>
                </div>

              </div>
            </div>

            {/* Risk Factors & Alerts */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-6">
                <ShieldCheck size={16} /> Risk Factors & Alerts
              </h2>

              <div className="flex-1 space-y-4">
                
                {/* Alert 1 */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-amber-600 mt-0.5 shrink-0" size={18} />
                    <div>
                      <h3 className="text-sm font-bold text-amber-900 mb-1">Supply Chain Inflation</h3>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Materials cost rising due to regional supply chain delays. Expecting a +5% impact on Q2 procurement budget for finishing materials.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alert 2 */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-emerald-600 mt-0.5 shrink-0" size={18} />
                    <div>
                      <h3 className="text-sm font-bold text-emerald-900 mb-1">Labor Cost Alignment</h3>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        Labor costs are perfectly aligned with estimates. No overtime surges detected in the past 30 days.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alert 3 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="text-slate-500 mt-0.5 shrink-0" size={18} />
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 mb-1">Upcoming Tax Audit</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Routine Q1 financial compliance audit scheduled for March 10th. Ensure all contractor invoices are finalized.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
