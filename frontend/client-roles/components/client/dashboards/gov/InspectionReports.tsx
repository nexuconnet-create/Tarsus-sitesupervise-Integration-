/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { 
  FileText, Search, Filter, Download, Eye, 
  Calendar, CheckCircle, AlertTriangle, User,
  MoreVertical, ShieldCheck, MapPin, Share2, Clock
} from 'lucide-react';

interface InspectionReportsProps {
  user?: any;
  project?: any;
  orgSlug: string;
  projectSlug: string;
}

export default function InspectionReports({ user, project, orgSlug, projectSlug }: InspectionReportsProps) {
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';
  const [searchQuery, setSearchQuery] = useState('');
  
  const reports = [
    { id: 'REP-001', name: 'Foundation Inspection', date: 'Mar 02, 2026', inspector: 'Engr. Femi', status: 'Approved', statusColor: 'emerald' },
    { id: 'REP-002', name: 'Rebar Placement', date: 'Feb 28, 2026', inspector: 'Engr. Tunde', status: 'Flagged', statusColor: 'rose' },
    { id: 'REP-003', name: 'Concrete Quality', date: 'Feb 25, 2026', inspector: 'Engr. Femi', status: 'Approved', statusColor: 'emerald' },
    { id: 'REP-004', name: 'Beam Installation', date: 'Feb 20, 2026', inspector: 'Arch. Nnamdi', status: 'Approved', statusColor: 'emerald' },
    { id: 'REP-005', name: 'Site Safety Audit', date: 'Feb 15, 2026', inspector: 'Engr. Sarah', status: 'Reviewing', statusColor: 'amber' },
  ];

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wide">
            Inspection Reports
          </h1>
          <div className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-3 font-medium">
            <span className="flex items-center gap-1 text-slate-700 font-bold"><MapPin size={12}/> Project: {projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-slate-600"><ShieldCheck size={12}/> Lagos State Building Control Agency</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[#021422] hover:bg-[#021422]/90 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            <Download size={16}/> Export Logs
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><FileText size={64}/></div>
            <div className="relative z-10">
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Total Reports</p>
              <p className="text-3xl font-black">24</p>
            </div>
            <p className="text-blue-100 text-xs font-medium mt-4 relative z-10">Updated today at 09:41 AM</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><AlertTriangle size={14} className="text-rose-500"/> Flagged Reports</p>
              <p className="text-3xl font-black text-rose-600">3</p>
            </div>
            <button className="text-rose-600 text-xs font-bold flex items-center gap-1 mt-4 hover:text-rose-800 transition-colors">
              Review Now &rarr;
            </button>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><CheckCircle size={14} className="text-emerald-500"/> Approved</p>
              <p className="text-3xl font-black text-emerald-600">18</p>
            </div>
            <p className="text-slate-400 text-xs font-medium mt-4">75% Approval Rate</p>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Controls */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search reports by ID, name, or inspector..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 bg-white border border-gray-100 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                <Filter size={16}/> Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6 font-bold">Report ID</th>
                  <th className="p-4 font-bold">Inspection Type</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Inspector</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 pr-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report, idx) => (
                  <tr key={idx} className="hover:bg-white transition-colors group">
                    <td className="p-4 pl-6 text-sm font-bold text-slate-700">{report.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors"/>
                        <span className="text-sm font-bold text-slate-800">{report.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500 font-medium flex items-center gap-1.5"><Calendar size={14}/> {report.date}</td>
                    <td className="p-4 text-sm text-slate-600 font-medium flex items-center gap-1.5"><User size={14}/> {report.inspector}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${report.statusColor}-100 text-${report.statusColor}-700`}>
                        {report.status === 'Approved' && <CheckCircle size={10}/>}
                        {report.status === 'Flagged' && <AlertTriangle size={10}/>}
                        {report.status === 'Reviewing' && <Clock size={10}/>}
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View"><Eye size={16}/></button>
                        <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Download"><Download size={16}/></button>
                        <button className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Share"><Share2 size={16}/></button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"><MoreVertical size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-white text-xs font-bold text-slate-500 flex justify-between items-center">
            <span>Showing 1 to 5 of 24 entries</span>
            <div className="flex gap-1">
              <button className="px-2.5 py-1 bg-white border border-gray-100 rounded hover:bg-slate-100 disabled:opacity-50" disabled>&larr; Prev</button>
              <button className="px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">1</button>
              <button className="px-2.5 py-1 bg-white border border-gray-100 rounded hover:bg-slate-100">2</button>
              <button className="px-2.5 py-1 bg-white border border-gray-100 rounded hover:bg-slate-100">3</button>
              <button className="px-2.5 py-1 bg-white border border-gray-100 rounded hover:bg-slate-100">Next &rarr;</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
