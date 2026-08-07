"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { 
  FileBarChart, Search, Filter, Calendar, 
  Download, Eye, MoreVertical, CheckCircle2, 
  User, Activity, ShieldCheck, HardHat, Clock
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function ReportsPage() {
    const org_slug = "";
  const project_slug = "";
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  const reportsData = [
    { id: 'REP-DPR-0219', title: 'Daily Progress Report - Feb 19', author: 'Engr. Samuel (Site Super)', type: 'Daily Log', date: 'Feb 19, 2026', status: 'Reviewed', icon: <HardHat size={16}/>, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'REP-WPR-08', title: 'Weekly Executive Summary - Week 8', author: 'Project Manager', type: 'Progress', date: 'Feb 15, 2026', status: 'Reviewed', icon: <Activity size={16}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'REP-QAQC-042', title: 'Concrete Pour Inspection - Level 3', author: 'QA/QC Team', type: 'Quality', date: 'Feb 14, 2026', status: 'Pending Review', icon: <CheckCircle2 size={16}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'REP-HSE-015', title: 'Weekly HSE Audit Report', author: 'Safety Officer', type: 'Safety', date: 'Feb 12, 2026', status: 'Reviewed', icon: <ShieldCheck size={16}/>, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'REP-DPR-0218', title: 'Daily Progress Report - Feb 18', author: 'Engr. Samuel (Site Super)', type: 'Daily Log', date: 'Feb 18, 2026', status: 'Reviewed', icon: <HardHat size={16}/>, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col overflow-hidden">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wider">
            <FileBarChart className="text-indigo-500" size={24} />
            Project Reports
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium">Total: 312 Reports</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm">
            <Calendar size={16} /> Filter by Month
          </button>
          <button className="px-4 py-2 bg-[#021422] text-white hover:bg-[#03437a] rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-md">
            <Download size={16} /> Batch Export
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-6 mb-6 flex-1 w-full flex flex-col overflow-hidden gap-6">
        
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reports by title, ID, or author..." 
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
            <Filter size={18} className="text-slate-400" />
            <select className="bg-transparent outline-none cursor-pointer">
              <option>Category: All Reports</option>
              <option>Daily Logs</option>
              <option>Progress Reports</option>
              <option>QA/QC</option>
              <option>Safety / HSE</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4">Report Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Date Submitted</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportsData.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg ${report.bg} ${report.color}`}>
                          {report.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{report.title}</span>
                          <span className="text-xs font-mono text-slate-500 mt-0.5">{report.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{report.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User size={14} className="text-slate-400" />
                        <span className="font-medium">{report.author}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{report.date}</td>
                    <td className="px-6 py-4">
                      {report.status === 'Reviewed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={12} /> Reviewed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                          <Clock size={12} /> Pending Review
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Report">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download PDF">
                          <Download size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
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
