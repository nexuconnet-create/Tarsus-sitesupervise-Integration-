'use client';

import React from 'react';
import { 
  Building2, TrendingUp, TrendingDown, DollarSign, Activity, 
  AlertTriangle, ShieldAlert, ShieldCheck, CheckCircle2, 
  Briefcase, Download, Plus, Star, Phone, Mail, Clock, LayoutGrid, FileText
} from 'lucide-react';

interface ExecutiveDeveloperDashboardProps {
  user?: any;
  orgSlug: string;
}

export default function ExecutiveDeveloperDashboard({ user, orgSlug }: ExecutiveDeveloperDashboardProps) {
  const developerName = user?.company_name || 'Martins Construction Ltd';
  const executiveName = user?.first_name ? `Engr. ${user.first_name}` : 'Engr. Martins';

  const portfolioProjects = [
    { name: 'Lagos 12-Storey', location: 'VI, Lagos', status: 'Active', progress: 45.2, budget: '₦1.8B', spent: '₦1.2B', timeline: 'Jun 2027', risk: 'Medium' },
    { name: 'Abuja Mall', location: 'Abuja', status: 'Active', progress: 62.8, budget: '₦2.4B', spent: '₦1.5B', timeline: 'Dec 2026', risk: 'Low' },
    { name: 'Port Harcourt Bridge', location: 'PH', status: 'At Risk', progress: 28.1, budget: '₦3.2B', spent: '₦0.9B', timeline: 'May 2028', risk: 'High' },
    { name: 'Ibadan Townhouse Estate', location: 'Ibadan', status: 'Active', progress: 75.3, budget: '₦1.2B', spent: '₦0.8B', timeline: 'Mar 2027', risk: 'Low' },
    { name: 'Enugu Shopping Complex', location: 'Enugu', status: 'Planning', progress: 5.0, budget: '₦2.8B', spent: '₦0.1B', timeline: 'Sep 2028', risk: 'Medium' },
  ];

  const vendors = [
    { name: 'First Materials', projects: 5, rating: 4.8, onTime: 98, quality: 4.9, costVsBudget: '+2.3' },
    { name: 'SteelCo Nigeria', projects: 4, rating: 4.6, onTime: 92, quality: 4.5, costVsBudget: '+1.5' },
    { name: 'PilingPro Ltd', projects: 3, rating: 4.2, onTime: 85, quality: 4.0, costVsBudget: '-5.0' },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-emerald-500';
      case 'At Risk': return 'text-amber-500';
      case 'Planning': return 'text-blue-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Executive Developer Dashboard
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700 flex items-center gap-1">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Projects: 12 Active</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Portfolio Value: ₦15.8B</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-[#021422] hover:bg-[#021422]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
            <Download size={16}/> Export Board Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">

        {/* 1. EXECUTIVE OVERVIEW */}
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Welcome back, {executiveName}!</h2>
              <p className="text-blue-200 mt-1 font-medium">Your portfolio is performing well. Here is your daily strategic brief.</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl">
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Portfolio Health</p>
                <p className="text-2xl font-black text-emerald-400 flex items-center gap-2">82% <TrendingUp size={16} className="text-emerald-400"/></p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl">
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Total Revenue YTD</p>
                <p className="text-2xl font-black text-white">₦3.2B</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-6 text-sm font-bold">
            <div className="flex items-center gap-2 text-rose-400"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div> 2 projects behind schedule</div>
            <div className="flex items-center gap-2 text-amber-400"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> 3 projects at risk</div>
            <div className="flex items-center gap-2 text-emerald-400"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> 7 projects on track</div>
          </div>
        </div>

        {/* 2. PORTFOLIO DASHBOARD TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50">
            <div className="flex items-center gap-2">
              <LayoutGrid size={18} className="text-slate-400"/>
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Portfolio Dashboard</h3>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-white border border-gray-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-white transition-colors flex items-center gap-1.5 shadow-sm"><Activity size={14}/> Analytics</button>
              <button className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5"><Plus size={14}/> New Project</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6 font-bold">Project Name</th>
                  <th className="p-4 font-bold">Location</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Progress</th>
                  <th className="p-4 font-bold">Budget</th>
                  <th className="p-4 font-bold">Spent</th>
                  <th className="p-4 font-bold">Timeline</th>
                  <th className="p-4 pr-6 font-bold text-right">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {portfolioProjects.map((proj, idx) => (
                  <tr key={idx} className="hover:bg-white transition-colors cursor-pointer group">
                    <td className="p-4 pl-6 font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{proj.name}</td>
                    <td className="p-4 text-xs text-slate-500 font-medium">{proj.location}</td>
                    <td className="p-4 text-xs font-bold flex items-center gap-1.5 mt-1">
                      <div className={`w-2 h-2 rounded-full bg-current ${getStatusColor(proj.status)}`}></div>
                      <span className={getStatusColor(proj.status)}>{proj.status}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${proj.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-8">{proj.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-700">{proj.budget}</td>
                    <td className="p-4 text-xs font-bold text-slate-700">{proj.spent}</td>
                    <td className="p-4 text-xs text-slate-500 font-medium">{proj.timeline}</td>
                    <td className="p-4 pr-6 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getRiskColor(proj.risk)}`}>
                        {proj.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. FINANCIAL & PERFORMANCE TRENDS (BI Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Financial Overview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <DollarSign size={18} className="text-emerald-500"/>
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Financial Overview</h3>
            </div>
            
            <div className="flex-1 space-y-5">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Portfolio Value</span>
                <span className="text-lg font-black text-slate-800">₦15.8B</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Total Revenue YTD</span>
                  <span className="text-xl font-black text-emerald-700">₦3.2B</span>
                </div>
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">Total Expenses</span>
                  <span className="text-xl font-black text-rose-700">₦2.4B</span>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-700">Net Profit</span>
                  <span className="font-black text-emerald-600">₦0.8B <span className="text-[10px] text-emerald-500 ml-1">(+14% YoY)</span></span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-700">ROI</span>
                  <span className="font-black text-blue-600">25.3%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700">Cash Flow</span>
                  <span className="font-black text-slate-800">₦1.2B</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Trends */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500"/>
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Performance Trends</h3>
              </div>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-800">Full Report</button>
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Project Completion Rate</span>
                  <span className="text-slate-800">78% <span className="text-slate-400 font-medium">(Target: 85%)</span> <span className="text-rose-500 ml-1">↓</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Profit Margin</span>
                  <span className="text-slate-800">22.5% <span className="text-slate-400 font-medium">(Target: 25%)</span> <span className="text-amber-500 ml-1">↓</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Cost Overrun</span>
                  <span className="text-rose-600">3.2% <span className="text-slate-400 font-medium">(Target: &lt;2%)</span> <span className="text-rose-500 ml-1">↑</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full w-[20%] bg-emerald-100 border-r-2 border-emerald-500"></div>
                  <div className="bg-rose-500 h-full rounded-full relative z-10" style={{ width: '32%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-white border border-slate-100 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Client Satisfaction</span>
                  <span className="text-lg font-black text-slate-800">4.7 <span className="text-amber-400">★</span></span>
                  <p className="text-[9px] text-emerald-600 font-bold mt-1">Above Target (4.5)</p>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Safety Index</span>
                  <span className="text-lg font-black text-slate-800">92%</span>
                  <p className="text-[9px] text-rose-500 font-bold mt-1">Below Target (95%)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. VENDOR PERFORMANCE & PROCUREMENT */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-purple-600"/>
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Vendor Performance & Procurement</h3>
            </div>
            <div className="flex gap-2">
              <button className="text-xs font-bold text-purple-600 hover:text-purple-800">Full Analytics</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Vendor Name</th>
                  <th className="p-4">Active Projects</th>
                  <th className="p-4">Global Rating</th>
                  <th className="p-4">On-Time %</th>
                  <th className="p-4">Quality Score</th>
                  <th className="p-4">Cost vs Budget</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vendors.map((vendor, idx) => (
                  <tr key={idx} className="hover:bg-white transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-800 text-sm">{vendor.name}</td>
                    <td className="p-4 text-xs font-bold text-slate-600"><span className="bg-slate-100 px-2 py-0.5 rounded">{vendor.projects}</span></td>
                    <td className="p-4 text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">{vendor.rating} <Star size={12} className="text-amber-400 fill-amber-400"/></td>
                    <td className="p-4 text-xs font-bold text-emerald-600">{vendor.onTime}%</td>
                    <td className="p-4 text-xs font-bold text-slate-800">{vendor.quality} <Star size={12} className="text-amber-400 fill-amber-400"/></td>
                    <td className="p-4 text-xs font-bold">
                      <span className={vendor.costVsBudget.startsWith('+') ? 'text-rose-600' : 'text-emerald-600'}>
                        {vendor.costVsBudget}%
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded transition-colors" title="View Profile"><FileText size={14}/></button>
                        <button className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded transition-colors" title="Call Vendor"><Phone size={14}/></button>
                        <button className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded transition-colors" title="Email Vendor"><Mail size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. EXECUTIVE ALERTS & RECOMMENDATIONS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert size={18} className="text-rose-600"/>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Executive Alerts & Recommendations</h3>
          </div>
          
          <div className="space-y-4">
            {/* Critical */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-rose-100 text-rose-600 rounded mt-0.5"><AlertTriangle size={16}/></div>
                <div>
                  <h4 className="text-sm font-bold text-rose-900 uppercase tracking-wider">Critical</h4>
                  <p className="text-sm text-rose-800 mt-1 font-semibold">Port Harcourt Bridge behind schedule (3 months) — Escalate to Board immediately.</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-50 shadow-sm">Create Task</button>
                <button className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 shadow-sm">Escalate</button>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-amber-100 text-amber-600 rounded mt-0.5"><AlertTriangle size={16}/></div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wider">Warning</h4>
                  <p className="text-sm text-amber-800 mt-1 font-semibold">Cost overrun on Lagos Tower (3.2%) — Review budget adjustments.</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="px-3 py-1.5 bg-white border border-amber-200 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-50 shadow-sm">Review Budget</button>
              </div>
            </div>

            {/* Insight */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded mt-0.5"><ShieldCheck size={16}/></div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Insight</h4>
                  <p className="text-sm text-blue-800 mt-1 font-semibold">Ibadan Townhouse Estate ahead of schedule — Document lessons for other projects.</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-50 shadow-sm">Best Practices</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
