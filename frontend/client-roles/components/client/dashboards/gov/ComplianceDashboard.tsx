/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { 
  Building2, Calendar, CheckCircle, Clock, 
  MapPin, ShieldCheck, AlertCircle, AlertTriangle, 
  ShieldAlert, FileText, Camera, Search, Filter,
  ChevronDown, MessageSquare, ArrowRight, Activity
} from 'lucide-react';
import Link from 'next/link';

interface ComplianceDashboardProps {
  user?: any;
  project?: any;
  orgSlug: string;
  projectSlug: string;
}

export default function ComplianceDashboard({ user, project, orgSlug, projectSlug }: ComplianceDashboardProps) {
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';
  const agencyName = user?.agency_name || 'Lagos State Building Control Agency (LASBCA)';
  const base = orgSlug && projectSlug 
    ? `/${orgSlug}/projects/${projectSlug}/government-agencies` 
    : `/main-dashboard/government-agencies`;
  
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wide">
            Compliance Dashboard
          </h1>
          <div className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-3 font-medium">
            <span className="flex items-center gap-1 text-slate-700 font-bold"><MapPin size={12}/> Project: {projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-slate-600"><Building2 size={12}/> Developer: Craneburg Const.</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-100 hover:bg-white text-slate-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
            <FileText size={16}/> Generate Report
          </button>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            <CheckCircle size={16}/> Approve All
          </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Activity size={24}/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Compliance Score</p>
              <p className="text-2xl font-black text-slate-800">82%</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Calendar size={24}/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Last Inspection</p>
              <p className="text-lg font-bold text-slate-800">4 days ago</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><ShieldAlert size={24}/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Open Violations</p>
              <p className="text-2xl font-black text-rose-600">2</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={24}/></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pending Reviews</p>
              <p className="text-2xl font-black text-amber-600">3</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Checklist */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              
              <div className="p-5 border-b border-slate-100 bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-600"/> Regulatory Checklist
                </h2>
                
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {['all', 'pending', 'issues'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors capitalize ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2">
                <div className="divide-y divide-slate-100">
                  
                  {/* Item 1 */}
                  <div className="p-4 hover:bg-white transition-colors rounded-xl flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-full shrink-0"><CheckCircle size={20}/></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">Building Plans & Permits</h3>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">Approved</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">Approved by Engr. Tunde Bakare on Jan 15, 2026</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 sm:ml-4 shrink-0">
                      View Docs <ArrowRight size={14}/>
                    </button>
                  </div>

                  {/* Item 2 */}
                  <div className="p-4 hover:bg-white transition-colors rounded-xl flex flex-col sm:flex-row sm:items-center gap-4 border-l-2 border-blue-500 bg-blue-50/20">
                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-full shrink-0"><Clock size={20}/></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">Structural Compliance Phase 1</h3>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase tracking-wider">Under Review</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span className="text-rose-600 font-semibold">Due: Mar 10, 2026</span>
                        <span>• Inspector assigned: Engr. Femi</span>
                      </p>
                    </div>
                    <div className="flex gap-2 sm:ml-4 shrink-0 mt-3 sm:mt-0">
                      <button className="px-3 py-1.5 bg-white border border-gray-100 text-slate-600 hover:bg-white rounded-lg text-xs font-bold transition-colors">Remind</button>
                      <button className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold transition-colors">Review Now</button>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="p-4 hover:bg-white transition-colors rounded-xl flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="p-2.5 bg-amber-100 text-amber-600 rounded-full shrink-0"><AlertCircle size={20}/></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">Fire Safety Compliance</h3>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase tracking-wider">Pending Test</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Awaiting sprinkler pressure test results.</p>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="p-4 hover:bg-white transition-colors rounded-xl flex flex-col sm:flex-row sm:items-center gap-4 border-l-2 border-rose-500 bg-rose-50/20">
                    <div className="p-2.5 bg-rose-100 text-rose-600 rounded-full shrink-0"><ShieldAlert size={20}/></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">Environmental Impact Assessment</h3>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded uppercase tracking-wider">Action Required</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 text-rose-600 font-medium">Dust mitigation protocols violated on Mar 05.</p>
                    </div>
                    <button className="px-3 py-1.5 bg-white border border-gray-100 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors mt-3 sm:mt-0">
                      View Incident
                    </button>
                  </div>

                  {/* Item 5 */}
                  <div className="p-4 hover:bg-white transition-colors rounded-xl flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-full shrink-0"><CheckCircle size={20}/></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">Occupational Health & Safety</h3>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">Approved</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Site safety protocols verified.</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </section>

          {/* Right Sidebar: Issues & Quick Actions */}
          <section className="space-y-6">
            
            {/* Active Issues Log */}
            <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
              <div className="p-5 border-b border-rose-100 bg-rose-50/50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle size={16}/> Active Violations
                </h3>
              </div>
              
              <div className="p-5 space-y-5">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Rebar spacing violation on Zone B3</h4>
                  <p className="text-xs text-slate-600 mt-1 mb-3">Rebar spacing exceeds maximum allowable 150mm tolerance. Pour halted.</p>
                  
                  <div className="flex gap-2">
                    <div className="w-16 h-12 bg-slate-200 rounded overflow-hidden relative cursor-pointer">
                      <img src="https://images.unsplash.com/photo-1541888081622-140b0856004b?auto=format&fit=crop&q=80&w=200" alt="Evidence" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><Camera size={12} className="text-white"/></div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded transition-colors text-center">Stop Work Order</button>
                    <button className="flex-1 py-1.5 bg-white border border-gray-100 hover:bg-white text-slate-700 text-xs font-bold rounded transition-colors text-center">Message PM</button>
                  </div>
                </div>

                <div className="h-px w-full bg-slate-100"></div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800">Dust Mitigation Failure</h4>
                  <p className="text-xs text-slate-600 mt-1 mb-3">No watering done on site entry points during high wind conditions.</p>
                  
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 py-1.5 bg-white border border-gray-100 hover:bg-white text-slate-700 text-xs font-bold rounded transition-colors text-center">Issue Warning Notice</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Shortcuts */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href={`${base}/documents/drawings`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-100 transition-colors"><FileText size={16}/></div>
                  <span className="text-sm font-bold text-slate-700">View Approved Drawings</span>
                </Link>
                <Link href={`${base}/documents/reports`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md group-hover:bg-emerald-100 transition-colors"><Search size={16}/></div>
                  <span className="text-sm font-bold text-slate-700">Inspection History</span>
                </Link>
                <Link href={`${base}/communication/messages`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md group-hover:bg-purple-100 transition-colors"><MessageSquare size={16}/></div>
                  <span className="text-sm font-bold text-slate-700">Contact Site Manager</span>
                </Link>
              </div>
            </div>

          </section>
        </div>

      </div>
    </div>
  );
}
