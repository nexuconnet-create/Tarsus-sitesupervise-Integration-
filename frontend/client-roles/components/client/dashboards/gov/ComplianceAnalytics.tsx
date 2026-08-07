/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { 
  BarChart3, Activity, ShieldCheck, AlertTriangle, 
  TrendingUp, TrendingDown, Clock, Building2, Calendar,
  ArrowUpRight, Target
} from 'lucide-react';

interface ComplianceAnalyticsProps {
  user?: any;
  orgSlug: string;
}

export default function ComplianceAnalytics({ user, orgSlug }: ComplianceAnalyticsProps) {
  const agencyName = user?.agency_name || 'Lagos State Building Control Agency (LASBCA)';

  const violationsByCategory = [
    { name: 'Structural Safety', count: 45, percentage: 35, color: 'rose' },
    { name: 'Fire Codes', count: 32, percentage: 25, color: 'orange' },
    { name: 'Environmental', count: 28, percentage: 22, color: 'amber' },
    { name: 'Occupational Health', count: 14, percentage: 11, color: 'blue' },
    { name: 'Zoning & Usage', count: 9, percentage: 7, color: 'purple' },
  ];

  const topDevelopers = [
    { name: 'Craneburg Construction', score: 98, projects: 12 },
    { name: 'Julius Berger', score: 95, projects: 8 },
    { name: 'Cappa & D\'Alberto', score: 92, projects: 5 },
    { name: 'Eko Pearl Nig.', score: 88, projects: 4 },
  ];

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wide">
            Compliance Analytics
          </h1>
          <div className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-3 font-medium">
            <span className="flex items-center gap-1 text-slate-700 font-bold"><ShieldCheck size={12}/> Regulatory Oversight</span>
            <span className="text-slate-300">|</span>
            <span>{agencyName}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 bg-white border border-gray-100 text-slate-700 text-sm font-bold rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm">
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <button className="px-4 py-2 bg-[#021422] hover:bg-[#021422]/90 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            Download Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Compliance</p>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Target size={18}/></div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800">84.2%</p>
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-2">
                <TrendingUp size={14}/> +2.4% vs last month
              </p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Approval Time</p>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={18}/></div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800">4.5 <span className="text-lg text-slate-400">days</span></p>
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-2">
                <TrendingDown size={14}/> -1.2 days vs last month
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Stop-Work</p>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><AlertTriangle size={18}/></div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800">12</p>
              <p className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-2">
                <TrendingUp size={14}/> +3 vs last month
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inspections Completed</p>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity size={18}/></div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800">428</p>
              <p className="text-xs font-bold text-slate-400 mt-2">Target: 500/month</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Violations By Category (Horizontal Bar Chart) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Violations by Category</h3>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">View Detailed &rarr;</button>
            </div>

            <div className="space-y-5">
              {violationsByCategory.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                    <span className="text-xs font-bold text-slate-500">{cat.count} cases ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-2.5 rounded-full bg-${cat.color}-500`} style={{ width: `${cat.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Developer Performance Leaderboard */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Top Performing Developers</h3>
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-white border border-gray-100 text-xs font-bold rounded shadow-sm">Top 10</button>
                <button className="px-2 py-1 bg-slate-100 text-slate-500 hover:text-slate-700 text-xs font-bold rounded">Worst</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <div className="divide-y divide-slate-100">
                {topDevelopers.map((dev, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-4 hover:bg-white transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800">{dev.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Building2 size={10}/> {dev.projects} Active Projects</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-emerald-600">{dev.score}</div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trend Graph Placeholder */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#021422] to-[#021422] rounded-2xl shadow-md p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Activity size={120}/></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="text-sm font-bold text-blue-100 uppercase tracking-wider mb-1">Compliance Growth Trend</h3>
                <p className="text-2xl font-black text-white">YTD Performance</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold backdrop-blur-sm transition-colors">Weekly</button>
                <button className="px-3 py-1.5 bg-white text-[#021422] rounded-lg text-xs font-bold shadow-sm">Monthly</button>
              </div>
            </div>

            {/* Stylized CSS Bar Chart for Trends */}
            <div className="relative z-10 h-48 flex items-end justify-between gap-2 pt-4 border-b border-blue-400/30">
              {[45, 52, 48, 65, 72, 68, 85, 82, 90, 88, 95, 98].map((val, i) => (
                <div key={i} className="relative w-full flex flex-col items-center group cursor-pointer">
                  <div className="absolute -top-8 bg-white text-[#021422] text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                    {val}%
                  </div>
                  <div className="w-full bg-blue-400/20 hover:bg-blue-400/40 rounded-t-sm transition-colors relative overflow-hidden h-full flex items-end">
                    <div className="w-full bg-blue-400 group-hover:bg-blue-300 transition-colors rounded-t-sm" style={{ height: `${val}%` }}></div>
                  </div>
                  <span className="text-[10px] text-blue-200 mt-2 block font-medium">
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
