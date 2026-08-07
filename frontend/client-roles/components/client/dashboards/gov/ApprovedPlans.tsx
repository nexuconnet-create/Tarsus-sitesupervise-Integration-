/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import {
  FileText, Search, Filter, Download, Eye,
  MapPin, ShieldCheck, Maximize2, LayoutGrid, List,
  Calendar, Building2, CheckCircle2, History
} from 'lucide-react';

interface ApprovedPlansProps {
  user?: any;
  orgSlug: string;
}

export default function ApprovedPlans({ user, orgSlug }: ApprovedPlansProps) {
  const agencyName = user?.agency_name || 'Lagos State Building Control Agency (LASBCA)';
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const plans = [
    {
      id: 'PLN-2026-088',
      title: 'Architectural Ground Floor Plan',
      project: 'Lagos 12-Storey Mixed-Use Development',
      developer: 'Craneburg Const.',
      approvalDate: 'Jan 15, 2026',
      version: 'v2.1',
      type: 'Architectural',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784489051/3_Bedroom_House_Plan_-_ID_13501_-_CAD_PDF___Architectural_Drawings_1_kk7vmz.png'
    },
    {
      id: 'PLN-2026-082',
      title: 'Structural Core Layout Phase 1',
      project: 'Lagos 12-Storey Mixed-Use Development',
      developer: 'Craneburg Const.',
      approvalDate: 'Jan 10, 2026',
      version: 'v1.0',
      type: 'Structural',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784489052/__18_1_qmkang.png'
    },
    {
      id: 'PLN-2026-075',
      title: 'MEP Routing Schematic',
      project: 'Abuja Mega Mall Project',
      developer: 'Julius Berger',
      approvalDate: 'Dec 05, 2025',
      version: 'v1.4',
      type: 'MEP',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784538199/3_Bedroom_House_Plan_-_ID_13501_-_CAD_PDF___Architectural_Drawings_2_eihftb.png'
    },
    {
      id: 'PLN-2026-060',
      title: 'Fire Exit and Evacuation Plan',
      project: 'Eko Atlantic Tower 5',
      developer: 'Eko Pearl Nig.',
      approvalDate: 'Nov 22, 2025',
      version: 'v3.0',
      type: 'Safety',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784499060/Residential_Electrical_Layout_DWG_with_Lighting_Points_1_ynofyf.png'
    },
    {
      id: 'PLN-2026-042',
      title: 'Site Layout and Hoarding',
      project: 'Port Harcourt Bridge Link',
      developer: 'RCC Nigeria',
      approvalDate: 'Oct 14, 2025',
      version: 'v1.1',
      type: 'Civil',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784489053/9x10m_house_plan_is_given_in_this_Autocad_drawing_file__1_itp4pu.png'
    }
  ];

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">

      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wide">
            Approved Plans & Drawings
          </h1>
          <div className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-3 font-medium">
            <span className="flex items-center gap-1 text-slate-700 font-bold"><ShieldCheck size={12} /> Official Document Repository</span>
            <span className="text-slate-300">|</span>
            <span>{agencyName}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">

        {/* Navigation & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search drawings by title, ID, or project..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 bg-white border border-gray-100 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shrink-0">
              <Filter size={16} /> Filter Categories
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col hover:-translate-y-1 duration-300">

                {/* Image & Watermark */}
                <div className="h-48 relative overflow-hidden bg-slate-100 border-b border-slate-100">
                  <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply z-10 pointer-events-none"></div>

                  {/* Schematic styling effect */}
                  <img src={plan.image} alt={plan.title} className="w-full h-full object-cover opacity-80 contrast-125 grayscale-[50%] group-hover:scale-105 transition-transform duration-700" />

                  {/* Watermark Badge */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-80 rotate-[-15deg] pointer-events-none">
                    <div className="border-4 border-emerald-500/70 rounded-lg p-2 backdrop-blur-sm">
                      <p className="text-xl font-black text-emerald-600/90 tracking-widest uppercase text-center border-t-2 border-b-2 border-emerald-500/50 py-1">
                        APPROVED
                      </p>
                      <p className="text-[8px] font-bold text-emerald-700/80 tracking-widest text-center mt-1">LASBCA • {plan.approvalDate}</p>
                    </div>
                  </div>

                  {/* Hover Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button className="p-3 bg-white text-slate-900 rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors shadow-lg" title="View Fullscreen">
                      <Maximize2 size={20} />
                    </button>
                    <button className="p-3 bg-white text-slate-900 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-lg" title="Download PDF">
                      <Download size={20} />
                    </button>
                  </div>
                </div>

                {/* Meta Data */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">{plan.type}</span>
                    <span className="text-[10px] font-bold text-slate-400">{plan.id}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 leading-tight mb-3 group-hover:text-emerald-700 transition-colors">{plan.title}</h3>

                  <div className="space-y-2 mt-auto">
                    <div className="flex items-start gap-2">
                      <Building2 size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-slate-600 line-clamp-1" title={plan.project}>{plan.project}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        <CheckCircle2 size={12} />
                        {plan.approvalDate}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        <History size={12} />
                        {plan.version}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
