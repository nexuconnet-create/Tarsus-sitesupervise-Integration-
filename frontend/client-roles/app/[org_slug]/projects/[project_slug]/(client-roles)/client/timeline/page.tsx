'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  CalendarDays, Calendar, CheckCircle2, CircleDashed,
  Clock, Activity, ArrowRight, CheckCircle, Clock3, Loader2, Building, PenTool
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function ProgressTimelinePage() {
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;

  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  // Dynamic Today Marker Calculation
  const [todayPosition, setTodayPosition] = useState(35); // Default to 35%
  const [todayLabel, setTodayLabel] = useState('TODAY');
  const [currentDateFormatted, setCurrentDateFormatted] = useState('');

  useEffect(() => {
    // Project timeline: Jan 1, 2026 to Jun 30, 2027
    const startDate = new Date('2026-01-01').getTime();
    const endDate = new Date('2027-06-30').getTime();
    const now = new Date();
    
    let percentage = ((now.getTime() - startDate) / (endDate - startDate)) * 100;
    // Cap between 0 and 100
    percentage = Math.max(0, Math.min(100, percentage));
    setTodayPosition(percentage);
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    setTodayLabel(`TODAY (${now.toLocaleDateString('en-US', options)})`);
    setCurrentDateFormatted(now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
  }, []);

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">

      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3">
            PROGRESS TIMELINE
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">Chronological Phase Tracking</span>
          </div>
        </div>

        {/* Top Summary Stats */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="bg-white border border-gray-100 rounded-lg px-4 py-2 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Current Date</span>
            <span className="text-sm font-bold text-slate-800">{currentDateFormatted || 'Loading...'}</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-4 py-2 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Est. Completion</span>
            <span className="text-sm font-bold text-slate-800">Jun 30, 2027</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-4 py-2 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Current Phase</span>
            <span className="text-sm font-bold text-blue-600">Superstructure</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-emerald-600">Schedule Variance</span>
            <span className="text-sm font-bold text-emerald-700">On Track</span>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* GANTT-LITE VISUAL CHART */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden relative">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            Phase Timeline
          </h2>

          <div className="relative overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[800px]">

              {/* Months Header row */}
              <div className="grid grid-cols-12 gap-0 border-b border-gray-100 pb-2 mb-4 text-[10px] font-bold text-slate-400">
                <div className="col-span-2">Jan &apos;26</div>
                <div className="col-span-2">Mar &apos;26</div>
                <div className="col-span-2">Jul &apos;26</div>
                <div className="col-span-2">Oct &apos;26</div>
                <div className="col-span-2">Feb &apos;27</div>
                <div className="col-span-2">Jun &apos;27</div>
              </div>

              {/* Grid Background Lines */}
              <div className="absolute top-[3.5rem] bottom-0 left-0 right-0 grid grid-cols-12 gap-0 pointer-events-none opacity-50 z-0">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="border-l border-slate-100 h-full"></div>
                ))}
              </div>

              {/* The "Today" Marker */}
              <div 
                className="absolute top-[3rem] bottom-0 w-px bg-red-400 border-l-2 border-dashed border-red-400 z-20 flex flex-col items-center shadow-[0_0_10px_rgba(248,113,113,0.5)] transition-all duration-1000 ease-in-out"
                style={{ left: `${todayPosition}%` }}
              >
                <div className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full absolute -top-3 whitespace-nowrap">{todayLabel}</div>
              </div>

              {/* Tracks */}
              <div className="space-y-4 relative z-10">

                {/* Track 1: Substructure */}
                <div className="h-10 relative flex items-center group cursor-pointer" title="Phase 1: Substructure (Jan 15, 2026 - Apr 10, 2026)">
                  <div className="absolute left-0 w-[20%] h-8 bg-emerald-100 border border-emerald-300 rounded-lg flex items-center overflow-hidden transition-all group-hover:h-9 group-hover:shadow-md">
                    {/* Inner Progress */}
                    <div className="h-full w-full bg-emerald-500/20 absolute inset-0"></div>
                    <span className="relative z-10 text-[10px] font-bold text-emerald-700 px-3 truncate">1. Substructure (100%)</span>
                  </div>
                </div>

                {/* Track 2: Superstructure */}
                <div className="h-10 relative flex items-center group cursor-pointer" title="Phase 2: Superstructure (Apr 15, 2026 - Sep 30, 2026)">
                  <div className="absolute left-[18%] w-[40%] h-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center overflow-hidden shadow-sm transition-all group-hover:h-9 group-hover:shadow-md">
                    {/* Inner Progress - 65% of this bar */}
                    <div className="h-full w-[65%] bg-blue-500/20 absolute inset-0 border-r border-blue-300">
                      {/* Animated stripes effect for active */}
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-50"></div>
                    </div>
                    <span className="relative z-10 text-[10px] font-bold text-blue-700 px-3 truncate">2. Superstructure (65%)</span>
                  </div>
                </div>

                {/* Track 3: Enclosure */}
                <div className="h-10 relative flex items-center group cursor-pointer" title="Phase 3: Enclosure (Jul 01, 2026 - Dec 15, 2026)">
                  <div className="absolute left-[40%] w-[30%] h-8 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center overflow-hidden shadow-sm transition-all group-hover:h-9 group-hover:shadow-md">
                    <div className="h-full w-[40%] bg-indigo-500/20 absolute inset-0 border-r border-indigo-300"></div>
                    <span className="relative z-10 text-[10px] font-bold text-indigo-700 px-3 truncate">3. Enclosure (40%)</span>
                  </div>
                </div>

                {/* Track 4: MEP Services */}
                <div className="h-10 relative flex items-center group cursor-pointer" title="Phase 4: MEP Services (Sep 15, 2026 - Mar 30, 2027)">
                  <div className="absolute left-[50%] w-[35%] h-8 bg-white border border-gray-100 border-dashed rounded-lg flex items-center overflow-hidden transition-all group-hover:h-9 group-hover:shadow-md hover:border-amber-300">
                    <div className="h-full w-[25%] bg-amber-500/10 absolute inset-0 border-r border-amber-200"></div>
                    <span className="relative z-10 text-[10px] font-bold text-slate-500 px-3 truncate">4. MEP Services (25%)</span>
                  </div>
                </div>

                {/* Track 5: Finishes */}
                <div className="h-10 relative flex items-center group cursor-pointer" title="Phase 5: Finishes (Jan 10, 2027 - Jun 30, 2027)">
                  <div className="absolute left-[65%] w-[35%] h-8 bg-white border border-gray-100 border-dashed rounded-lg flex items-center overflow-hidden transition-all group-hover:h-9 group-hover:shadow-md hover:border-slate-400">
                    <div className="h-full w-[10%] bg-slate-400/10 absolute inset-0 border-r border-slate-300"></div>
                    <span className="relative z-10 text-[10px] font-bold text-slate-500 px-3 truncate">5. Finishes (10%)</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* DETAILED PHASE BREAKDOWN */}
        <section>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            Detailed Phase Breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {/* Substructure */}
            <div className="bg-white rounded-xl border-t-4 border-emerald-500 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Completed</span>
                  <h3 className="text-lg font-bold text-slate-800 mt-1">Phase 1: Substructure</h3>
                </div>
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-xs text-slate-500">
                  <Calendar size={14} className="mr-2 text-slate-400" /> Jan 15, 2026 – Apr 10, 2026
                </div>
                <div className="flex items-center text-xs text-slate-500">
                  <Building size={14} className="mr-2 text-slate-400" /> Apex Foundations Ltd
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 space-y-2">
                <p className="text-xs font-bold text-slate-700 mb-2">Key Activities</p>
                <div className="flex items-center gap-2 text-xs text-slate-600"><CheckCircle size={12} className="text-emerald-500" /> Site Excavation</div>
                <div className="flex items-center gap-2 text-xs text-slate-600"><CheckCircle size={12} className="text-emerald-500" /> Pile Installation</div>
                <div className="flex items-center gap-2 text-xs text-slate-600"><CheckCircle size={12} className="text-emerald-500" /> Foundation Pour</div>
              </div>
            </div>

            {/* Superstructure (Active) */}
            <div className="bg-white rounded-xl border-t-4 border-blue-500 shadow-lg p-5 ring-1 ring-blue-500/20 transform scale-[1.02]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase animate-pulse">In Progress</span>
                  <h3 className="text-lg font-bold text-slate-800 mt-1">Phase 2: Superstructure</h3>
                </div>
                <Loader2 size={24} className="text-blue-500 animate-spin-slow" />
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-xs text-slate-500">
                  <Calendar size={14} className="mr-2 text-slate-400" /> Apr 15, 2026 – Sep 30, 2026
                </div>
                <div className="flex items-center text-xs text-slate-500">
                  <Building size={14} className="mr-2 text-slate-400" /> Prime Steelworks Inc
                </div>
              </div>
              <div className="bg-blue-50/50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-bold text-slate-700 mb-2">Key Activities</p>
                <div className="flex items-center gap-2 text-xs text-slate-600"><CheckCircle size={12} className="text-emerald-500" /> Lower Level Columns</div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700"><Clock3 size={12} className="text-blue-500" /> Mid-level Floor Slabs (Active)</div>
                <div className="flex items-center gap-2 text-xs text-slate-400"><CircleDashed size={12} /> Roof Structure</div>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 w-[65%] h-full rounded-full"></div>
              </div>
            </div>

            {/* Enclosure (Active) */}
            <div className="bg-white rounded-xl border-t-4 border-indigo-500 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">In Progress</span>
                  <h3 className="text-lg font-bold text-slate-800 mt-1">Phase 3: Enclosure</h3>
                </div>
                <Loader2 size={24} className="text-indigo-500" />
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-xs text-slate-500">
                  <Calendar size={14} className="mr-2 text-slate-400" /> Jul 01, 2026 – Dec 15, 2026
                </div>
                <div className="flex items-center text-xs text-slate-500">
                  <Building size={14} className="mr-2 text-slate-400" /> ClearView Glazing
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 space-y-2">
                <p className="text-xs font-bold text-slate-700 mb-2">Key Activities</p>
                <div className="flex items-center gap-2 text-xs text-slate-600"><CheckCircle size={12} className="text-emerald-500" /> Exterior Framing</div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700"><Clock3 size={12} className="text-indigo-500" /> Curtain Wall Installation</div>
                <div className="flex items-center gap-2 text-xs text-slate-400"><CircleDashed size={12} /> Waterproofing</div>
              </div>
              <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 w-[40%] h-full rounded-full"></div>
              </div>
            </div>

            {/* MEP Services (Pending) */}
            <div className="bg-white rounded-xl border border-gray-100 border-t-4 border-t-slate-300 shadow-sm p-5 hover:shadow-md transition-shadow opacity-75">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">Pending</span>
                  <h3 className="text-lg font-bold text-slate-800 mt-1">Phase 4: MEP</h3>
                </div>
                <PenTool size={24} className="text-slate-400" />
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-xs text-slate-500">
                  <Calendar size={14} className="mr-2 text-slate-400" /> Sep 15, 2026 – Mar 30, 2027
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 space-y-2">
                <p className="text-xs font-bold text-slate-700 mb-2">Key Activities</p>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700"><Clock3 size={12} className="text-amber-500" /> Rough-ins (Active)</div>
                <div className="flex items-center gap-2 text-xs text-slate-400"><CircleDashed size={12} /> HVAC Installation</div>
                <div className="flex items-center gap-2 text-xs text-slate-400"><CircleDashed size={12} /> Electrical Fixtures</div>
              </div>
            </div>

            {/* Finishes (Pending) */}
            <div className="bg-white rounded-xl border border-gray-100 border-t-4 border-t-slate-300 shadow-sm p-5 hover:shadow-md transition-shadow opacity-60">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">Pending</span>
                  <h3 className="text-lg font-bold text-slate-800 mt-1">Phase 5: Finishes</h3>
                </div>
                <PenTool size={24} className="text-slate-400" />
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-xs text-slate-500">
                  <Calendar size={14} className="mr-2 text-slate-400" /> Jan 10, 2027 – Jun 30, 2027
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 space-y-2">
                <p className="text-xs font-bold text-slate-700 mb-2">Key Activities</p>
                <div className="flex items-center gap-2 text-xs text-slate-400"><CircleDashed size={12} /> Drywall & Paint</div>
                <div className="flex items-center gap-2 text-xs text-slate-400"><CircleDashed size={12} /> Flooring</div>
                <div className="flex items-center gap-2 text-xs text-slate-400"><CircleDashed size={12} /> Final Inspections</div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
