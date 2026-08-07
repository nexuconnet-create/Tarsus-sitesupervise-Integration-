'use client';

import React from 'react';
import {
  Trophy, Star, AlertCircle, ShieldAlert, ArrowUpRight, ArrowDownRight, Award, History, BarChart2
} from 'lucide-react';

interface ExecVendorPerformanceProps {
  user?: any;
  orgSlug: string;
}

export default function ExecVendorPerformance({ user, orgSlug }: ExecVendorPerformanceProps) {
  const developerName = user?.company_name || 'Martins Construction Ltd';

  const topVendors = [
    { rank: 1, name: 'Dangote Cement Plc', category: 'Materials', score: 4.8, change: '+0.2', projects: 12 },
    { rank: 2, name: 'Structuracore Eng.', category: 'Consultant', score: 4.7, change: '0.0', projects: 4 },
    { rank: 3, name: 'Julius Berger', category: 'General', score: 4.6, change: '+0.1', projects: 3 },
  ];

  const recentIncidents = [
    {
      id: 1,
      vendor: 'Oceanic Logistics',
      date: '12 Oct 2026',
      type: 'Safety Violation',
      severity: 'High',
      description: 'Failure to comply with site PPE requirements resulting in minor injury.'
    },
    {
      id: 2,
      vendor: 'BrightSpark Electricals',
      date: '04 Oct 2026',
      type: 'Timeline Delay',
      severity: 'Medium',
      description: 'Late delivery of high-voltage cabling by 14 days, delaying phase 3.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">

      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Vendor Performance
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Q3 FY2026 Ratings</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Vendor Leaderboard */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                <h3 className="font-black uppercase tracking-wider text-sm flex items-center gap-2">
                  <Award size={18} /> Top Performing Partners
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topVendors.map((vendor) => (
                    <div key={vendor.rank} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-amber-200 hover:bg-amber-50/30 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-black shadow-sm shrink-0">
                        #{vendor.rank}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800">{vendor.name}</h4>
                        <p className="text-xs text-slate-500">{vendor.category} &bull; {vendor.projects} Active Projects</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-black text-slate-800">
                          {vendor.score} <Star size={16} className="text-amber-500 fill-amber-500" />
                        </div>
                        <p className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                          {vendor.change} <ArrowUpRight size={12} />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Scorecards */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2 mb-6">
                <BarChart2 size={18} className="text-blue-600" /> Category Averages
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quality of Work</p>
                    <p className="font-black text-slate-800">4.5</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timeline Adherence</p>
                    <p className="font-black text-slate-800">3.8</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '76%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Safety Compliance</p>
                    <p className="font-black text-slate-800">4.1</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Reports */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                  <ShieldAlert size={18} className="text-rose-600" /> Recent Incidents
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {recentIncidents.map((incident) => (
                  <div key={incident.id} className="p-4 rounded-xl border border-rose-100 bg-rose-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-rose-900 text-sm">{incident.vendor}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${incident.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mb-2">{incident.type} &bull; {incident.date}</p>
                    <p className="text-sm text-slate-700">{incident.description}</p>

                    <button className="mt-3 w-full py-2 bg-white border border-gray-100 hover:bg-white text-slate-700 text-xs font-bold rounded-lg transition-colors">
                      View Audit Log
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
