/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { 
  Archive, Search, Filter, Lock, Calendar, 
  Building2, FileText, Download, ShieldCheck, 
  Eye, History, User
} from 'lucide-react';

interface RegulatoryArchiveProps {
  user?: any;
  orgSlug: string;
}

export default function RegulatoryArchive({ user, orgSlug }: RegulatoryArchiveProps) {
  const agencyName = user?.agency_name || 'Lagos State Building Control Agency (LASBCA)';
  const [searchQuery, setSearchQuery] = useState('');
  
  const documents = [
    {
      id: 'ARCH-2023-0142',
      title: 'Foundation Inspection Report - Block A',
      project: 'Ikoyi Luxury Towers Phase 1',
      developer: 'Cappa & D\'Alberto',
      archivedDate: 'Dec 12, 2023',
      originalStatus: 'Approved',
      type: 'Inspection',
      inspector: 'Engr. Olatunji'
    },
    {
      id: 'ARCH-2023-0891',
      title: 'Stop-Work Order Notice #12',
      project: 'Lekki Commercial Hub',
      developer: 'Lekki Gardens',
      archivedDate: 'Oct 05, 2023',
      originalStatus: 'Resolved',
      type: 'Enforcement',
      inspector: 'Arch. Nnamdi'
    },
    {
      id: 'ARCH-2024-0022',
      title: 'Structural Compliance Sign-off Phase 3',
      project: 'Eko Atlantic Tower 2',
      developer: 'Eko Pearl Nig.',
      archivedDate: 'Jan 22, 2024',
      originalStatus: 'Approved',
      type: 'Approval',
      inspector: 'Engr. Sarah'
    },
    {
      id: 'ARCH-2022-1104',
      title: 'Environmental Impact Audit',
      project: 'Victoria Island Mall',
      developer: 'Craneburg Const.',
      archivedDate: 'Aug 14, 2022',
      originalStatus: 'Flagged',
      type: 'Audit',
      inspector: 'Engr. Femi'
    },
    {
      id: 'ARCH-2021-0442',
      title: 'Final Occupancy Certificate',
      project: 'Banana Island Residential Estate',
      developer: 'Julius Berger',
      archivedDate: 'Nov 30, 2021',
      originalStatus: 'Approved',
      type: 'Certificate',
      inspector: 'Arch. Tunde'
    },
  ];

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wide">
            Regulatory Archive
          </h1>
          <div className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-3 font-medium">
            <span className="flex items-center gap-1 text-slate-700 font-bold"><ShieldCheck size={12}/> Historical Records</span>
            <span className="text-slate-300">|</span>
            <span>{agencyName}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[#021422] hover:bg-[#021422]/90 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            <Download size={16}/> Export Archive Log
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Banner Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-4">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0 mt-0.5">
            <Lock size={16}/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-900">Immutable Record Storage</h3>
            <p className="text-xs text-blue-700 mt-1">All documents in the Regulatory Archive are permanently locked and read-only to comply with LASBCA historical retention policies. Any modifications require elevated super-admin privileges.</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search archives by ID, title, project, or developer..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Filters:</span>
            <select className="px-3 py-1.5 bg-white border border-gray-100 text-slate-600 text-xs font-bold rounded cursor-pointer hover:bg-white">
              <option>Any Year</option>
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
              <option>2022 & Older</option>
            </select>
            <select className="px-3 py-1.5 bg-white border border-gray-100 text-slate-600 text-xs font-bold rounded cursor-pointer hover:bg-white">
              <option>Any Document Type</option>
              <option>Inspection Report</option>
              <option>Enforcement Notice</option>
              <option>Approval Certificate</option>
            </select>
            <select className="px-3 py-1.5 bg-white border border-gray-100 text-slate-600 text-xs font-bold rounded cursor-pointer hover:bg-white">
              <option>Any Status</option>
              <option>Approved</option>
              <option>Resolved</option>
              <option>Flagged</option>
            </select>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6 font-bold w-12 text-center"></th>
                  <th className="p-4 font-bold">Document Details</th>
                  <th className="p-4 font-bold">Project / Developer</th>
                  <th className="p-4 font-bold">Archived Date</th>
                  <th className="p-4 font-bold">Orig. Status</th>
                  <th className="p-4 pr-6 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-white transition-colors group">
                    <td className="p-4 pl-6 text-center">
                      <Lock size={14} className="text-slate-300 mx-auto" />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <FileText size={14} className="text-slate-400"/>
                          {doc.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{doc.id}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded">{doc.type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Building2 size={12} className="text-slate-400"/> {doc.project}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><User size={12} className="text-slate-400"/> {doc.developer}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-600 font-medium flex items-center gap-1.5 h-full mt-3">
                      <History size={14} className="text-slate-400"/> {doc.archivedDate}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        doc.originalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        doc.originalStatus === 'Resolved' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        doc.originalStatus === 'Flagged' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-slate-100 text-slate-700 border border-gray-100'
                      }`}>
                        {doc.originalStatus}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Document"><Eye size={16}/></button>
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Download Record"><Download size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-white text-xs font-bold text-slate-500 flex justify-between items-center">
            <span>Showing 1 to 5 of 12,402 archived entries</span>
            <div className="flex gap-1">
              <button className="px-2.5 py-1 bg-white border border-gray-100 rounded hover:bg-slate-100 disabled:opacity-50" disabled>&larr; Prev</button>
              <button className="px-2.5 py-1 bg-[#021422] text-white rounded hover:bg-[#021422]/90">1</button>
              <button className="px-2.5 py-1 bg-white border border-gray-100 rounded hover:bg-slate-100">2</button>
              <button className="px-2.5 py-1 bg-white border border-gray-100 rounded hover:bg-slate-100">3</button>
              <button className="px-2.5 py-1 bg-white border border-gray-100 rounded hover:bg-slate-100">...</button>
              <button className="px-2.5 py-1 bg-white border border-gray-100 rounded hover:bg-slate-100">Next &rarr;</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
