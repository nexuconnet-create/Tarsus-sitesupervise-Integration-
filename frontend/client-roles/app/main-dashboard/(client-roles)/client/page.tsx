'use client';

import React, { useState } from 'react';
import {
  Search, MapPin, Smartphone, Globe, Calendar, DollarSign,
  Clock, CheckCircle, Activity, Camera, Video, Bell,
  ChevronRight, ZoomIn, ZoomOut, Rotate3D, Share2,
  PlaySquare, FileText, Briefcase, Users, MessageSquare,
  Settings, Building2
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMemberships } from '@/lib/hooks/useMemberships';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ClientDashboardHome() {
    const org_slug = "";
  const project_slug = "";
  const searchParams = useSearchParams();
  const clientType = searchParams.get('clientType') || 'Client';
  const querySuffix = `?clientType=${encodeURIComponent(clientType)}`;

  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const user = useAuthStore(s => s.user);

  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';
  const basePath = `/main-dashboard/client`;

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans selection:bg-blue-100">

      {/* 1. Header Section */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-sm font-bold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
            <Building2 className="text-blue-600" size={22} />
            SITESUPERVISE — CLIENT DASHBOARD
            <span className="ml-4 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-normal capitalize border border-blue-100">
              {user?.name || 'John Olu'} ({clientType})
            </span>
          </h1>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-3 font-medium">
            <span className="text-slate-700 font-bold">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1"><MapPin size={12} className="text-rose-500" /> Victoria Island, Lagos</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1"><Smartphone size={12} className="text-slate-400" /> Mobile</span>
            <span className="flex items-center gap-1"><Globe size={12} className="text-slate-400" /> Web</span>
          </div>
        </div>

        {/* Quick Access Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={16} />
          </div>
          <input
            type="text"
            placeholder="Search projects, reports, documents..."
            className="w-full pl-9 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">Ctrl K</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-6 space-y-6">

        {/* 2. PROJECT SNAPSHOT KPI GRID */}
        <section>
          <div className="bg-[#021422] text-white p-3 flex items-center gap-2 rounded-t-xl mb-3">
            <Activity size={18} className="text-blue-400" />
            <h2 className="text-sm font-bold">Project Snapshot</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

            {/* Progress */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Calendar size={48} className="text-blue-600" /></div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar size={12} className="text-blue-500" /> Progress
              </p>
              <p className="text-xl font-bold text-[#021422]">45.2%</p>
              <p className="text-xs font-bold text-emerald-500 mt-1 uppercase">Complete</p>
            </div>

            {/* Budget */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign size={48} className="text-emerald-600" /></div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <DollarSign size={12} className="text-emerald-500" /> Budget
              </p>
              <p className="text-lg font-bold text-[#021422]">₦1.2B<span className="text-sm text-slate-400 font-medium">/1.8B</span></p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full w-[68%]"></div>
              </div>
              <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">68% Used</p>
            </div>

            {/* Timeline */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-colors">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Clock size={48} className="text-amber-600" /></div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock size={12} className="text-amber-500" /> Timeline
              </p>
              <p className="text-lg font-bold text-[#021422]">45<span className="text-sm text-slate-400 font-medium">/531</span></p>
              <p className="text-xs font-bold text-amber-600 mt-1 uppercase bg-amber-50 inline-block px-1.5 rounded">46 Days Elapsed</p>
            </div>

            {/* Milestones */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><CheckCircle size={48} className="text-indigo-600" /></div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle size={12} className="text-indigo-500" /> Milestones
              </p>
              <p className="text-lg font-bold text-[#021422]">8<span className="text-sm text-slate-400 font-medium">/24</span></p>
              <p className="text-xs font-bold text-indigo-600 mt-1 uppercase">33% Done</p>
            </div>

            {/* Health */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={48} className="text-emerald-600" /></div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity size={12} className="text-emerald-500" /> Health
              </p>
              <p className="text-xl font-bold text-[#021422]">82<span className="text-sm text-slate-400 font-medium">/100</span></p>
              <p className="text-xs font-bold text-emerald-600 mt-1 uppercase flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Good</p>
            </div>

          </div>
        </section>

        {/* MIDDLE ROW: Digital Twin & Updates */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* 3. LIVE SITE VIEW — 3D Model & Progress */}
          <section className="xl:col-span-2 flex flex-col bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800 relative">

            {/* Top Bar inside View */}
            <div className="bg-[#021422] text-white p-4 flex items-center justify-between z-10">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <MapPin size={16} className="text-blue-400" /> Live Site View — 3D Model & Progress
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live Connection
              </div>
            </div>

            {/* Fake 3D Digital Twin Environment */}
            <div className="flex-1 min-h-[400px] relative flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black p-6">

              {/* ASCII / CSS Mockup of Building */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

              <div className="z-10 text-center select-none flex flex-col items-center">
                <h3 className="text-xl font-bold text-blue-400 tracking-[0.2em] mb-8 font-mono opacity-80 border-b border-blue-400/30 pb-2">3D DIGITAL TWIN — LIVE CONSTRUCTION PROGRESS</h3>

                {/* Visual Fake Model */}
                <div className="relative group perspective-1000">
                  <div className="transform transition-transform duration-700 hover:rotate-y-12 hover:rotate-x-12 cursor-move">
                    <img 
                      src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784873592/2025_is_your_year_to_build___Go_to_our_website_and_fvgl14.jpg" 
                      alt="3D Digital Twin Model" 
                      className="w-full max-w-lg rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-slate-700 object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Progress Floating Card */}
              <div className="absolute bottom-6 right-6 w-80 bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-4 rounded-xl z-20 shadow-2xl">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-white uppercase tracking-wider mb-1">
                      <span>Phase 1: Substructure</span>
                      <span className="text-emerald-400">100%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-white uppercase tracking-wider mb-1">
                      <span>Phase 2: Superstructure</span>
                      <span className="text-blue-400">65%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[65%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-white uppercase tracking-wider mb-1">
                      <span>Phase 3: Finishes</span>
                      <span className="text-slate-400">25%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-500 w-[25%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Toolbar */}
            <div className="bg-slate-950 p-3 border-t border-slate-800 flex items-center justify-center sm:justify-start gap-2 overflow-x-auto">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors whitespace-nowrap"><ZoomIn size={14} /> Zoom In</button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors whitespace-nowrap"><ZoomOut size={14} /> Zoom Out</button>
              <div className="w-px h-4 bg-slate-700 mx-1"></div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors whitespace-nowrap"><Rotate3D size={14} /> Rotate</button>
              <div className="w-px h-4 bg-slate-700 mx-1"></div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors whitespace-nowrap"><Camera size={14} /> Capture</button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors whitespace-nowrap"><PlaySquare size={14} /> Start Tour</button>
              <div className="flex-1"></div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors whitespace-nowrap"><Share2 size={14} /> Share View</button>
            </div>
          </section>

          {/* 4. PROJECT UPDATES & ALERTS */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[500px] xl:h-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Bell size={14} className="text-amber-500" /> Alerts & Updates
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* Alert Items */}
              <div className="flex gap-3 items-start group cursor-pointer">
                <div className="mt-0.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50"></div></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase mb-0.5 flex items-center justify-between">
                    <span>Project Update</span>
                    <span className="font-medium normal-case text-[10px]">2 min ago</span>
                  </p>
                  <p className="text-sm text-slate-700 font-medium group-hover:text-blue-600 transition-colors">Foundation pouring complete for Sector A. </p>
                </div>
              </div>

              <div className="flex gap-3 items-start group cursor-pointer">
                <div className="mt-0.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-amber-50"></div></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase mb-0.5 flex items-center justify-between">
                    <span>Progress Note</span>
                    <span className="font-medium normal-case text-[10px]">1h ago</span>
                  </p>
                  <p className="text-sm text-slate-700 font-medium group-hover:text-amber-600 transition-colors">Piling & Foundation currently behind schedule by 3 weeks due to weather.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start group cursor-pointer">
                <div className="mt-0.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase mb-0.5 flex items-center justify-between">
                    <span>Milestone Achieved</span>
                    <span className="font-medium normal-case text-[10px]">2h ago</span>
                  </p>
                  <p className="text-sm text-slate-700 font-medium group-hover:text-emerald-600 transition-colors">Ground Floor Slab fully cured and inspected.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start group cursor-pointer">
                <div className="mt-0.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-50"></div></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase mb-0.5 flex items-center justify-between">
                    <span>Critical Update</span>
                    <span className="font-medium normal-case text-[10px]">4h ago</span>
                  </p>
                  <p className="text-sm text-slate-700 font-medium group-hover:text-red-600 transition-colors">Material delivery delay for structural steel (Supplier B).</p>
                </div>
              </div>

            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-2">
              <button className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 py-2 rounded hover:bg-slate-100 transition-colors">View All</button>
              <button className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 py-2 rounded hover:bg-slate-100 transition-colors">Timeline</button>
              <button className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 py-2 rounded hover:bg-slate-100 transition-colors">Share</button>
            </div>
          </section>

        </div>

        {/* 5. QUICK ACCESS — Client Menu */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-[#021422] text-white p-4 flex items-center gap-2">
            <Briefcase size={16} className="text-blue-400" />
            <h2 className="text-sm font-bold">Quick Access Menu</h2>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-3">

            <Link href={`${basePath}/project/overview${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group">
              <Activity size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-center">Project Overview</span>
            </Link>

            <Link href={`${basePath}/project/reports${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group">
              <FileText size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-center">Progress Reports</span>
            </Link>

            <Link href={`${basePath}/project/media${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group">
              <Camera size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-center">Site Photos</span>
            </Link>

            <Link href={`${basePath}/live-site-view${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group">
              <Video size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-center">Live Site View</span>
            </Link>

            <Link href={`${basePath}/documents/all${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group">
              <Briefcase size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-center">Documents</span>
            </Link>

            <Link href={`${basePath}/project/schedule${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group">
              <Calendar size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-center">Schedule</span>
            </Link>

            <Link href={`${basePath}/financial/budget${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group">
              <DollarSign size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-center">Financial</span>
            </Link>

            <Link href={`${basePath}/team/project-team${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group">
              <Users size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-center">Team</span>
            </Link>

            <Link href={`${basePath}/communication/messages${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group">
              <MessageSquare size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-center">Messages</span>
            </Link>

            <Link href={`${basePath}/settings/profile${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group">
              <Settings size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-center">Settings</span>
            </Link>

          </div>
        </section>

      </div>
    </div>
  );
}
