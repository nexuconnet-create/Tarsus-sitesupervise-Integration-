'use client';

import React from 'react';
import { 
  BarChart2, ShieldCheck, AlertTriangle, FileText, Download, 
  TrendingUp, Activity, CheckCircle, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function QcDashboardPage() {
  const trendData = [
    { name: 'Week 1', anomalies: 4 },
    { name: 'Week 2', anomalies: 7 },
    { name: 'Week 3', anomalies: 5 },
    { name: 'Week 4', anomalies: 12 },
    { name: 'Week 5', anomalies: 8 },
    { name: 'Week 6', anomalies: 3 },
  ];

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans flex flex-col">
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            QUALITY CONTROL DASHBOARD
          </h1>
          <div className="text-sm text-slate-500 mt-2">
            High-level analytics and automated compliance reporting.
          </div>
        </div>
        <button className="px-5 py-2.5 bg-[#021422] text-white font-bold rounded-lg hover:bg-[#021422]/90 flex items-center gap-2 transition-colors">
          <Download size={18} /> Generate Full Report
        </button>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-blue-100 font-bold uppercase text-xs tracking-wider">Overall Compliance</span>
                <ShieldCheck size={24} className="text-blue-200" />
              </div>
              <div className="text-4xl font-black mb-1">92.4%</div>
              <div className="flex items-center gap-1 text-sm text-blue-200 font-medium">
                <TrendingUp size={14} className="text-emerald-400" /> +2.1% from last month
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 font-bold uppercase text-xs tracking-wider">Critical Anomalies</span>
              <AlertTriangle size={20} className="text-rose-500" />
            </div>
            <div>
              <div className="text-4xl font-black text-[#021422] mb-1">3</div>
              <div className="text-sm text-slate-500 font-medium">Require immediate review</div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 font-bold uppercase text-xs tracking-wider">Scans Processed</span>
              <Activity size={20} className="text-blue-500" />
            </div>
            <div>
              <div className="text-4xl font-black text-[#021422] mb-1">142</div>
              <div className="text-sm text-slate-500 font-medium">Last 30 days</div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 font-bold uppercase text-xs tracking-wider">BIM Accuracy Avg</span>
              <BarChart2 size={20} className="text-emerald-500" />
            </div>
            <div>
              <div className="text-4xl font-black text-[#021422] mb-1">±12mm</div>
              <div className="text-sm text-slate-500 font-medium">Within 15mm tolerance</div>
            </div>
          </div>
        </div>

        {/* Chart & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Trend Chart */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col h-[400px]">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <TrendingUp size={16} /> Anomaly Detection Trend
            </h2>
            <div className="flex-1 w-full h-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '14px', fontWeight: 600, color: '#e11d48' }}
                  />
                  <Area type="monotone" dataKey="anomalies" name="Anomalies Detected" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorAnomalies)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col h-[400px]">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <FileText size={16} /> Recent QC Reports
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {[
                { title: "Weekly Compliance Summary", date: "Aug 07, 2026", status: "Generated" },
                { title: "Level 2 HVAC Deviation Report", date: "Aug 05, 2026", status: "Reviewed" },
                { title: "Structural Core Alignment", date: "Aug 01, 2026", status: "Generated" },
                { title: "Monthly Site Progress", date: "Jul 31, 2026", status: "Reviewed" },
              ].map((report, i) => (
                <div key={i} className="group p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-900 line-clamp-1">{report.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><Clock size={10}/> {report.date}</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download size={16} className="text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2.5 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              View All Reports
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
