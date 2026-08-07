/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import {
  Building2, Search, Filter, MapPin, Target,
  CheckCircle, AlertTriangle, ShieldCheck, Activity,
  Calendar, MoreVertical, Plus, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

interface ActiveProjectsProps {
  user?: any;
  orgSlug: string;
}

export default function ActiveProjects({ user, orgSlug }: ActiveProjectsProps) {
  const agencyName = user?.agency_name || 'Lagos State Building Control Agency (LASBCA)';
  const [searchQuery, setSearchQuery] = useState('');

  const projects = [
    {
      id: 'PRJ-101',
      name: 'Lagos 12-Storey Mixed-Use Development',
      developer: 'Craneburg Const.',
      location: 'Victoria Island, Lagos',
      status: 'Compliance Review Pending',
      statusColor: 'amber',
      progress: 45,
      lastInspection: '4 days ago',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784072820/__7_1_kvakpz.png'
    },
    {
      id: 'PRJ-102',
      name: 'Abuja Mega Mall Project',
      developer: 'Julius Berger',
      location: 'Central District, Abuja',
      status: 'Approved',
      statusColor: 'emerald',
      progress: 80,
      lastInspection: '12 days ago',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784072832/Transform_Your_Commercial_Space_with_Effective_Maintenance_1_cnu8vl.png'
    },
    {
      id: 'PRJ-103',
      name: 'Port Harcourt Bridge Link',
      developer: 'RCC Nigeria',
      location: 'Obio-Akpor, Rivers',
      status: 'Under Review',
      statusColor: 'blue',
      progress: 25,
      lastInspection: 'Yesterday',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784072833/M3M_Industrial_Plots_Manesar_1_hs45tf.png'
    },
    {
      id: 'PRJ-104',
      name: 'Ibadan Townhouse Estate',
      developer: 'Lekki Gardens',
      location: 'Bodija, Oyo',
      status: 'Compliance Check',
      statusColor: 'purple',
      progress: 60,
      lastInspection: '2 weeks ago',
      image: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784072820/__7_1_kvakpz.png'
    },

  ];

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">

      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wide">
            Active Projects Portfolio
          </h1>
          <div className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-3 font-medium">
            <span className="flex items-center gap-1 text-slate-700 font-bold"><ShieldCheck size={12} /> {agencyName}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-100 hover:bg-white text-slate-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
            <MapPin size={16} /> Map View
          </button>
          <button className="px-4 py-2 bg-[#021422] hover:bg-[#021422]/90 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            <Plus size={16} /> Register Project
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-8 space-y-8">

        {/* Portfolio Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Monitored Projects</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-[#021422]">124</p>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Building2 size={20} /></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Fully Compliant</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-emerald-600">86</p>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={20} /></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-amber-500">
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2">Pending Reviews</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-amber-600">28</p>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Activity size={20} /></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-rose-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><AlertTriangle size={48} className="text-rose-500" /></div>
            <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-2">At-Risk / Flagged</p>
            <div className="flex items-end justify-between relative z-10">
              <p className="text-3xl font-black text-rose-600">10</p>
              <button className="text-[10px] font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-2 py-1 rounded transition-colors">View All &rarr;</button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search projects by name, developer, or ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2.5 bg-white border border-gray-100 hover:bg-white text-slate-700 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
              <Filter size={16} /> Filter: All Regions
            </button>
            <button className="px-4 py-2.5 bg-white border border-gray-100 hover:bg-white text-slate-700 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
              Sort: Priority
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((proj, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col hover:-translate-y-1 duration-300">

              {/* Image & Status Badge */}
              <div className="h-48 relative overflow-hidden bg-slate-100">
                <img src={proj.image} alt={proj.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-2.5 py-1 rounded bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-wider text-${proj.statusColor}-700 border border-${proj.statusColor}-200 shadow-sm flex items-center gap-1`}>
                    {proj.status === 'Approved' && <CheckCircle size={12} />}
                    {proj.status === 'Flagged - Stop Work' && <AlertTriangle size={12} />}
                    {proj.status}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">{proj.id}</p>
                  <h3 className="text-lg font-bold leading-tight">{proj.name}</h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Building2 size={12} /> Developer</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{proj.developer}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin size={12} /> Location</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{proj.location}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Construction Progress</p>
                    <p className="text-xs font-bold text-slate-700">{proj.progress}%</p>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${proj.progress}%` }}></div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white text-slate-400 rounded-md"><Calendar size={14} /></div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Last Inspected</p>
                      <p className="text-xs font-semibold text-slate-700">{proj.lastInspection}</p>
                    </div>
                  </div>

                  <Link href={`/${orgSlug}/projects/lagos-12-storey/government-agencies/project/overview`} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors group/btn">
                    <ArrowUpRight size={16} className="group-hover/btn:scale-110 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <button className="px-6 py-2.5 bg-white border border-gray-100 hover:bg-white text-slate-700 text-sm font-bold rounded-xl transition-colors shadow-sm">
            Load More Projects
          </button>
        </div>

      </div>
    </div>
  );
}
