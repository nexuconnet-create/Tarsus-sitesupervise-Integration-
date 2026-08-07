'use client';

import React from 'react';
import { 
  MapPin, Calendar, Clock, DollarSign, CheckCircle, 
  Activity, BarChart2, Download, Maximize2, Share2, 
  Search, Flag, Target, ArrowRight, X
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { useState } from 'react';
import { useMemberships } from '@/lib/hooks/useMemberships';
import { useParams } from 'next/navigation';

export default function ProjectOverviewPage() {
  const [isMilestonesModalOpen, setIsMilestonesModalOpen] = useState(false);
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);

  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';
  const lastUpdated = '2026-02-19 14:30';

  const progressData = [
    { month: "JAN '26", planned: 0, actual: 0, critical: 0 },
    { month: "MAR", planned: 15, actual: 12, critical: 10 },
    { month: "MAY", planned: 30, actual: 25, critical: 20 },
    { month: "JUL", planned: 45, actual: 45.2, critical: 35 },
    { month: "SEP", planned: 60, actual: null, critical: 50 },
    { month: "NOV", planned: 75, actual: null, critical: 65 },
    { month: "JAN '27", planned: 85, actual: null, critical: 80 },
    { month: "MAR", planned: 95, actual: null, critical: 90 },
    { month: "MAY", planned: 100, actual: null, critical: 100 },
  ];

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3">
            PROJECT OVERVIEW
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1"><Clock size={14} /> Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* TOP GRID: Details & Phases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* PROJECT DETAILS */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <FileTextIcon size={16} /> Project Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
              {/* Left Column (Location & Dates) */}
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                    <MapPin size={12}/> Location
                  </p>
                  <p className="text-sm font-semibold text-slate-800">Victoria Island, Lagos</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                    <Calendar size={12}/> Start Date
                  </p>
                  <p className="text-sm font-semibold text-slate-800">2026-01-15</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                    <Calendar size={12}/> End Date
                  </p>
                  <p className="text-sm font-semibold text-slate-800">2027-06-30</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                    <Clock size={12}/> Days Elapsed
                  </p>
                  <div className="flex items-end gap-2">
                    <p className="text-lg font-bold text-slate-800">45<span className="text-sm text-slate-500 font-medium">/531 Days</span></p>
                    <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full mb-1">(8.5%)</span>
                  </div>
                </div>
              </div>

              {/* Right Column (Financial & Overall) */}
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                    <DollarSign size={12}/> Budget
                  </p>
                  <p className="text-sm font-semibold text-slate-800">₦1,800,000,000</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                    <DollarSign size={12}/> Amount Spent
                  </p>
                  <div className="flex items-end gap-2">
                    <p className="text-sm font-semibold text-slate-800">₦1,200,000,000</p>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">(68%)</span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                    <CheckCircle size={12}/> Milestones Completed
                  </p>
                  <div className="flex items-end gap-2">
                    <p className="text-sm font-semibold text-slate-800">8/24</p>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">(33%)</span>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                    <Activity size={12}/> Overall Progress
                  </p>
                  <p className="text-3xl font-extrabold text-blue-600">45.2%</p>
                </div>
              </div>
            </div>
          </section>

          {/* PROJECT PHASES PROGRESS */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <BarChart2 size={16} /> Project Phases Progress
            </h2>
            
            <div className="space-y-5 flex-1 flex flex-col justify-center">
              {/* Phase 1 */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Phase 1: Substructure</span>
                  <span className="font-bold text-emerald-600">100% Complete</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full rounded-full"></div>
                </div>
              </div>

              {/* Phase 2 */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Phase 2: Superstructure</span>
                  <span className="font-bold text-blue-600">65% Complete</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[65%] rounded-full"></div>
                </div>
              </div>

              {/* Phase 3 */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Phase 3: Enclosure</span>
                  <span className="font-bold text-indigo-600">40% Complete</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[40%] rounded-full"></div>
                </div>
              </div>

              {/* Phase 4 */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Phase 4: MEP Services</span>
                  <span className="font-bold text-amber-500">25% Complete</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 w-[25%] rounded-full"></div>
                </div>
              </div>

              {/* Phase 5 */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Phase 5: Finishes</span>
                  <span className="font-bold text-slate-500">10% Complete</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 w-[10%] rounded-full"></div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* BOTTOM GRID: Chart & Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PROGRESS CHART */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2 flex flex-col">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Activity size={16} /> Progress Chart
            </h2>
            
            {/* Chart Area (Interactive) */}
            <div className="flex-1 bg-white rounded-xl border border-slate-100 relative p-4 sm:p-8 min-h-[350px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={true} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(val) => `${val}%`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                    labelStyle={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="planned" name="Planned" stroke="#93c5fd" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="critical" name="Critical Path" stroke="#ef4444" strokeWidth={1} strokeDasharray="2 2" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Footer / Legend / Controls */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100 pt-6">
              
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-blue-300 border-t-2 border-dashed border-blue-300"></div> Planned
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-blue-600"></div> Actual
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-red-400 border-t border-dashed border-red-400"></div> Critical Path
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Zoom">
                  <Search size={16} />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Download">
                  <Download size={16} />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Full Screen">
                  <Maximize2 size={16} />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Share">
                  <Share2 size={16} />
                </button>
              </div>

            </div>
          </section>

          {/* KEY MILESTONES */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Target size={16} /> Key Milestones
            </h2>
            
            <div className="flex-1 space-y-6">
              
              {/* Milestone Item - Completed */}
              <div className="relative pl-6 border-l-2 border-emerald-500 pb-2">
                <div className="absolute -left-[9px] top-0 bg-white p-0.5">
                  <CheckCircle size={14} className="text-emerald-500 bg-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Foundation Pour</h3>
                <p className="text-xs text-slate-500 mt-1">Feb 05, 2026</p>
              </div>

              {/* Milestone Item - Completed */}
              <div className="relative pl-6 border-l-2 border-emerald-500 pb-2">
                <div className="absolute -left-[9px] top-0 bg-white p-0.5">
                  <CheckCircle size={14} className="text-emerald-500 bg-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Ground Floor Slab</h3>
                <p className="text-xs text-slate-500 mt-1">Mar 12, 2026</p>
              </div>

              {/* Milestone Item - Pending / Next */}
              <div className="relative pl-6 border-l-2 border-gray-100 pb-2">
                <div className="absolute -left-[9px] top-0 bg-white p-0.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 bg-white"></div>
                </div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  Roof Structure <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Next</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Jun 15, 2026 (Est.)</p>
              </div>

              {/* Milestone Item - Pending */}
              <div className="relative pl-6 border-l-2 border-gray-100 pb-2">
                <div className="absolute -left-[9px] top-0 bg-white p-0.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 bg-white"></div>
                </div>
                <h3 className="text-sm font-bold text-slate-600">Building Enclosure</h3>
                <p className="text-xs text-slate-400 mt-1">Aug 14, 2026 (Est.)</p>
              </div>

              {/* Milestone Item - Pending */}
              <div className="relative pl-6 border-l-2 border-transparent">
                <div className="absolute -left-[9px] top-0 bg-white p-0.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 bg-white"></div>
                </div>
                <h3 className="text-sm font-bold text-slate-600">MEP Installation</h3>
                <p className="text-xs text-slate-400 mt-1">Oct 15, 2026 (Est.)</p>
              </div>

            </div>

            <button 
              onClick={() => setIsMilestonesModalOpen(true)}
              className="w-full mt-4 py-2.5 rounded-xl border border-gray-100 text-sm font-semibold text-slate-600 hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              View All 24 Milestones <ArrowRight size={16} />
            </button>
          </section>

        </div>
      </div>

      {/* Milestones Modal */}
      {isMilestonesModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMilestonesModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Target size={18} className="text-blue-600"/> All Project Milestones</h3>
              <button onClick={() => setIsMilestonesModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="relative pl-6 border-l-2 border-emerald-500 pb-2">
                  <div className="absolute -left-[9px] top-0 bg-white p-0.5">
                    <CheckCircle size={14} className="text-emerald-500 bg-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Completed Milestone {i}</h3>
                  <p className="text-xs text-slate-500 mt-1">Past Date</p>
                </div>
              ))}
              <div className="relative pl-6 border-l-2 border-gray-100 pb-2">
                <div className="absolute -left-[9px] top-0 bg-white p-0.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 bg-white"></div>
                </div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  Current Milestone <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Next</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Pending Date</p>
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative pl-6 border-l-2 border-gray-100 pb-2 last:border-transparent">
                  <div className="absolute -left-[9px] top-0 bg-white p-0.5">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 bg-white"></div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-600">Future Milestone {i}</h3>
                  <p className="text-xs text-slate-400 mt-1">Future Date</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
              <button onClick={() => setIsMilestonesModalOpen(false)} className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon wrapper for FileText since it's used as a component
function FileTextIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <line x1="10" y1="9" x2="8" y2="9"></line>
    </svg>
  );
}
