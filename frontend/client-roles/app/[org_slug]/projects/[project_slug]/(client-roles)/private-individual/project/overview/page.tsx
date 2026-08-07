'use client';

import React from 'react';
import { 
  Activity, Calendar, CheckCircle, Clock, FileText, 
  Target, AlertTriangle, ArrowRight, Building2, MapPin
} from 'lucide-react';

export default function MyPropertyProgressPage() {
  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans selection:bg-blue-100">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-20 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
            My Property Progress
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            <MapPin size={12} className="text-rose-500" />
            Lagos 12-Storey Mixed-Use Development
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-8 space-y-8">
        
        {/* Overall Progress Hero */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 w-full space-y-6">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Overall Completion</p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-black text-[#021422]">45.2%</p>
                <p className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">On Schedule</p>
              </div>
            </div>

            <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
              <div className="h-full bg-blue-600 w-[45.2%] relative overflow-hidden transition-all duration-1000">
                <div className="absolute inset-0 bg-white/20 w-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600">
              <div className="bg-white px-4 py-2.5 rounded-lg border border-slate-100 flex-1 min-w-[150px]">
                <p className="text-slate-400 mb-0.5">Start Date</p>
                <p className="text-slate-800 text-sm">Jan 10, 2026</p>
              </div>
              <div className="bg-white px-4 py-2.5 rounded-lg border border-slate-100 flex-1 min-w-[150px]">
                <p className="text-slate-400 mb-0.5">Target Completion</p>
                <p className="text-blue-600 text-sm">June 15, 2027</p>
              </div>
              <div className="bg-white px-4 py-2.5 rounded-lg border border-slate-100 flex-1 min-w-[150px]">
                <p className="text-slate-400 mb-0.5">Time Elapsed</p>
                <p className="text-amber-600 text-sm">45 Days</p>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-64 bg-[#021422] rounded-xl p-6 text-white text-center shadow-lg relative overflow-hidden">
            <Target size={80} className="absolute -top-4 -right-4 opacity-10" />
            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2 relative z-10">Current Phase</p>
            <p className="text-2xl font-black relative z-10 mb-4">Foundation & Substructure</p>
            <button className="bg-white text-[#021422] text-xs font-bold px-4 py-2 rounded-lg w-full hover:bg-slate-100 transition-colors">
              View Phase Details
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Phase Breakdown */}
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={18} className="text-blue-500" /> Phase Breakdown
            </h2>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-800">1. Site Clearance & Preparation</span>
                  <span className="text-emerald-500 flex items-center gap-1"><CheckCircle size={14}/> 100%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-blue-600">2. Foundation & Substructure</span>
                  <span className="text-blue-600">45%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[45%]"></div>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Currently pouring concrete for Sector A footings.</p>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-500">3. Superstructure (Floors 1-12)</span>
                  <span className="text-slate-400">0%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-200 w-0"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-500">4. Exterior Finishes (Cladding & Glazing)</span>
                  <span className="text-slate-400">0%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-200 w-0"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-500">5. Interior Fit-out & MEP</span>
                  <span className="text-slate-400">0%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-200 w-0"></div>
                </div>
              </div>

            </div>
          </section>

          {/* Recent Activity Feed */}
          <section className="space-y-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock size={18} className="text-amber-500" /> Recent Activity
            </h2>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative">
              <div className="absolute left-10 top-8 bottom-8 w-px bg-slate-100 z-0"></div>
              
              <div className="space-y-6 relative z-10">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center flex-shrink-0 mt-1">
                    <Activity size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Concrete Pour - Sector A</p>
                    <p className="text-xs text-slate-500 mt-0.5">Completed the first major concrete pour for the foundation.</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">2 days ago</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Site Inspection Passed</p>
                    <p className="text-xs text-slate-500 mt-0.5">Local authorities approved the initial trenching.</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">1 week ago</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center flex-shrink-0 mt-1">
                    <AlertTriangle size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Weather Delay</p>
                    <p className="text-xs text-slate-500 mt-0.5">Heavy rainfall paused excavation for 48 hours.</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">2 weeks ago</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 py-3 border border-gray-100 rounded-lg text-xs font-bold text-slate-600 hover:bg-white transition-colors flex items-center justify-center gap-2">
                View Full Log <ArrowRight size={14}/>
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
