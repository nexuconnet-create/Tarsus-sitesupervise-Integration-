'use client';

import React from 'react';
import { 
  TrendingUp, Calendar, AlertCircle, CheckCircle, ShieldAlert, 
  BarChart2, Target, Download, Star
} from 'lucide-react';

interface ExecPerformanceTrendsProps {
  user?: any;
  orgSlug: string;
}

export default function ExecPerformanceTrends({ user, orgSlug }: ExecPerformanceTrendsProps) {
  const developerName = user?.company_name || 'Martins Construction Ltd';

  const timelines = [
    { name: 'Lagos 12-Storey', phase: 'Superstructure', progress: 45.2, expectedEnd: 'Jun 2027', status: 'On Track' },
    { name: 'Abuja Mall', phase: 'Interior Finishes', progress: 62.8, expectedEnd: 'Dec 2026', status: 'Ahead' },
    { name: 'Port Harcourt Bridge', phase: 'Piling & Foundation', progress: 28.1, expectedEnd: 'May 2028', status: 'Delayed' },
    { name: 'Ibadan Townhouse Estate', phase: 'Landscaping', progress: 75.3, expectedEnd: 'Mar 2027', status: 'On Track' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Performance Trends
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Cross-Portfolio Analytics</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-gray-100 hover:bg-white text-slate-700 text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
            <Download size={16}/> Export Full Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">

        {/* Global Trend Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[#021422] to-[#021422] text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><Target size={48}/></div>
            <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">Avg. Completion Rate</p>
            <p className="text-4xl font-black mb-1">78.5%</p>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '78.5%' }}></div>
            </div>
            <p className="text-xs text-blue-200 mt-2">Target: 85.0%</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Client Satisfaction</p>
                <p className="text-3xl font-black text-slate-800 flex items-center gap-2">4.7 <Star size={24} className="text-amber-400 fill-amber-400"/></p>
              </div>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Star size={20}/></div>
            </div>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 w-max px-2 py-0.5 rounded border border-emerald-100">Exceeding 4.5 Target</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Portfolio Safety Index</p>
                <p className="text-3xl font-black text-slate-800 flex items-center gap-2">92.0%</p>
              </div>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><ShieldAlert size={20}/></div>
            </div>
            <div className="text-xs font-bold text-rose-600 flex items-center gap-1 bg-rose-50 w-max px-2 py-0.5 rounded border border-rose-100">Below 95.0% Target</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Portfolio Timeline Tracking */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                <Calendar size={18} className="text-blue-600"/> Timeline Adherence
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {timelines.map((proj, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-xl hover:bg-white transition-colors">
                  <div className="w-1/3">
                    <h4 className="text-sm font-bold text-slate-800">{proj.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">Current Phase: <span className="font-semibold text-slate-700">{proj.phase}</span></p>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-600">Progress</span>
                      <span className="text-blue-600">{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${proj.status === 'Delayed' ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${proj.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="w-32 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border mb-1 ${
                      proj.status === 'Delayed' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      proj.status === 'Ahead' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {proj.status}
                    </span>
                    <p className="text-[10px] font-bold text-slate-500">Est: {proj.expectedEnd}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Matrix & Analytics */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2 mb-6">
                <BarChart2 size={18} className="text-purple-600"/> Risk Matrix
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <span className="text-xs font-bold text-rose-900 uppercase">High Risk</span>
                  </div>
                  <span className="text-lg font-black text-rose-700">1</span>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-xs font-bold text-amber-900 uppercase">Medium Risk</span>
                  </div>
                  <span className="text-lg font-black text-amber-700">2</span>
                </div>
                
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-emerald-900 uppercase">Low Risk</span>
                  </div>
                  <span className="text-lg font-black text-emerald-700">9</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl shadow-sm p-6 text-white">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2 mb-2">
                <AlertCircle size={18} className="text-blue-400"/> AI Recommendation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your portfolio indicates a recurring delay pattern during the <strong className="text-white">Piling & Foundation</strong> phase across coastal projects. Re-evaluating vendor contracts for this phase could improve overall timeline adherence by ~8%.
              </p>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
