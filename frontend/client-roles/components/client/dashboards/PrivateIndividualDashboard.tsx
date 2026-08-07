/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { 
  Building2, Calendar, CheckCircle, Clock, 
  DollarSign, MapPin, Activity, Download, Camera, Video,
  FileText, MessageSquare, Bell, ArrowRight, UserCircle, Target, TrendingUp, ShieldCheck, BarChart2
} from 'lucide-react';
import Link from 'next/link';

interface PrivateIndividualDashboardProps {
  user: any;
  project: any;
  orgSlug: string;
  projectSlug: string;
}

export default function PrivateIndividualDashboard({ user, project, orgSlug, projectSlug }: PrivateIndividualDashboardProps) {
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';
  const firstName = user?.first_name || 'John';
  const lastName = user?.last_name || 'Olu';
  const fullName = `${firstName} ${lastName}`;
  const base = orgSlug && projectSlug
    ? `/${orgSlug}/projects/${projectSlug}/private-individual`
    : `/main-dashboard/private-individual`;

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Private-Individual Dashboard
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700 flex items-center gap-1"><UserCircle size={14}/> Client: Mr. {fullName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600"><Building2 size={14}/> Project: {projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"><ShieldCheck size={14} /> Role: Property Owner</span>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* WELCOME MESSAGE */}
        <section className="bg-gradient-to-r from-[#021422] to-[#021422] rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 right-32 w-48 h-48 bg-blue-400 opacity-10 rounded-full blur-2xl translate-y-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                Hello Mr. {lastName}!
              </h2>
              <p className="text-blue-100 text-lg mb-4">
                Your investment in <strong className="text-white">{projectName}</strong> is progressing well.
              </p>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                <Target size={18} className="text-blue-300" />
                <span className="text-sm font-medium text-blue-50">Next milestone:</span>
                <strong className="text-white text-sm">Foundation completion (March 15, 2026)</strong>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm text-center min-w-[140px]">
                <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Days to Next Milestone</p>
                <p className="text-4xl font-black text-white">18</p>
              </div>
            </div>
          </div>
        </section>

        {/* MY PROPERTY PROGRESS */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Activity size={16} className="text-blue-600" /> My Property Progress
          </h2>
          
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Overall Progress</p>
              <p className="text-4xl font-black text-slate-900 mt-1">45.2<span className="text-xl text-slate-400">%</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase">Status</p>
              <p className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block mt-1">On Schedule</p>
            </div>
          </div>
          
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-6 border border-gray-100">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 w-[45.2%] rounded-full relative">
              <div className="absolute inset-0 bg-[url('/images/pattern-stripes.svg')] opacity-20"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6 mt-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={18} /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expected Completion</p>
                <p className="text-sm font-bold text-slate-800">June 2027</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Building2 size={18} /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your Unit Status</p>
                <p className="text-sm font-bold text-slate-800">Foundation Stage</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={18} /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Handover</p>
                <p className="text-sm font-bold text-slate-800">Q3 2027</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CONSTRUCTION PHOTOS */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Camera size={16} className="text-blue-600" /> Construction Photos
              </h2>
              <Link href={`${base}/photos`} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100 cursor-pointer">
                <img src="https://images.unsplash.com/photo-1541888081622-140b0856004b?q=80&w=600&auto=format&fit=crop" alt="Site Overview" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold flex items-center gap-1"><Camera size={12}/> Site Overview</span>
                </div>
              </div>
              <div className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100 cursor-pointer">
                <img src="https://images.unsplash.com/photo-1504307651254-35680f356f12?q=80&w=600&auto=format&fit=crop" alt="Foundation" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold flex items-center gap-1"><Camera size={12}/> Foundation</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100 cursor-pointer">
                <img src="https://images.unsplash.com/photo-1590496793907-474020303da4?q=80&w=400&auto=format&fit=crop" alt="Frame" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <div className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100 cursor-pointer">
                <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=400&auto=format&fit=crop" alt="Latest Update" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <div className="relative group rounded-xl overflow-hidden aspect-square bg-slate-800 cursor-pointer flex items-center justify-center">
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1541888081622-140b0856004b?q=80&w=400&auto=format&fit=crop')] object-cover blur-sm"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2">
                    <Video size={18} className="text-white ml-0.5" />
                  </div>
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider">Video Tour</span>
                </div>
              </div>
            </div>

            <div className="mt-auto flex gap-3">
              <button className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <Camera size={16} /> View All Gallery
              </button>
              <button className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <Download size={16} /> Download ZIP
              </button>
            </div>
          </section>

          {/* KEY MILESTONES */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Target size={16} className="text-blue-600" /> Key Milestones
            </h2>
            
            <div className="flex-1 space-y-6">
              
              {/* Completed */}
              <div className="relative pl-6 border-l-2 border-emerald-500 pb-2">
                <div className="absolute -left-[9px] top-0 bg-white p-0.5">
                  <CheckCircle size={14} className="text-emerald-500 bg-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 line-through text-opacity-70">Site Clearance</h3>
                <p className="text-xs text-slate-500 mt-1">Completed Jan 2026</p>
              </div>

              {/* In Progress */}
              <div className="relative pl-6 border-l-2 border-blue-500 pb-2">
                <div className="absolute -left-[9px] top-0 bg-white p-0.5">
                  <div className="w-3.5 h-3.5 rounded-full border-4 border-blue-500 bg-white relative">
                     <span className="absolute inset-0 w-full h-full bg-blue-500 rounded-full animate-ping opacity-50 scale-150"></span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2">
                  Foundation
                  <span className="text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">In Progress (45%)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Target: Mar 15, 2026</p>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3 max-w-[200px]">
                  <div className="h-full bg-blue-500 w-[45%] rounded-full"></div>
                </div>
              </div>

              {/* Upcoming */}
              <div className="relative pl-6 border-l-2 border-gray-100 pb-2">
                <div className="absolute -left-[9px] top-0 bg-white p-0.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 bg-white"></div>
                </div>
                <h3 className="text-sm font-bold text-slate-600">Superstructure</h3>
                <p className="text-xs text-slate-400 mt-1">Upcoming (Mar 2026)</p>
              </div>

              {/* Upcoming */}
              <div className="relative pl-6 border-l-2 border-gray-100 pb-2">
                <div className="absolute -left-[9px] top-0 bg-white p-0.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 bg-white"></div>
                </div>
                <h3 className="text-sm font-bold text-slate-600">Finishing</h3>
                <p className="text-xs text-slate-400 mt-1">Upcoming (Jan 2027)</p>
              </div>

              {/* Handover */}
              <div className="relative pl-6 border-l-2 border-transparent">
                <div className="absolute -left-[9px] top-0 bg-white p-0.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 bg-white"></div>
                </div>
                <h3 className="text-sm font-bold text-slate-600">Handover</h3>
                <p className="text-xs text-slate-400 mt-1">Expected Q3 2027</p>
              </div>

            </div>
          </section>
        </div>

        {/* INVESTMENT SUMMARY */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-600" /> Investment Summary
            </h2>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
              <CheckCircle size={14} /> Payment Status: Up-to-date
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white p-6 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Investment</p>
              <p className="text-2xl font-black text-slate-900">₦85,000,000</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Value</p>
              <p className="text-2xl font-black text-slate-900">₦92,000,000</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ROI</p>
              <p className="text-2xl font-black text-emerald-600 flex items-center gap-1">
                <TrendingUp size={20} /> +8.2%
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Payment Schedule</h3>
            <div className="space-y-3">
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Deposit (30%)</p>
                    <p className="text-xs text-emerald-600 font-semibold">Paid: Jan 10, 2026</p>
                  </div>
                </div>
                <div className="text-right font-bold text-slate-900">₦25,500,000</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Foundation (30%)</p>
                    <p className="text-xs text-emerald-600 font-semibold">Paid: Feb 20, 2026</p>
                  </div>
                </div>
                <div className="text-right font-bold text-slate-900">₦25,500,000</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-amber-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Superstructure (30%)</p>
                    <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                      Due: Mar 30, 2026 <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] uppercase ml-1">Next Payment</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">₦25,500,000</p>
                  <button className="text-[10px] font-bold text-white bg-amber-600 hover:bg-amber-700 px-2 py-1 rounded mt-1 transition-colors">PAY NOW</button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-slate-400" />
                  <div>
                    <p className="text-sm font-bold text-slate-600">Handover (10%)</p>
                    <p className="text-xs text-slate-500">Due: Jun 15, 2027</p>
                  </div>
                </div>
                <div className="text-right font-bold text-slate-500">₦8,500,000</div>
              </div>

            </div>
          </div>
        </section>

        {/* CLIENT ACTIONS */}
        <section className="bg-[#021422] rounded-2xl shadow-lg p-6 md:p-8 text-white">
          <h2 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Activity size={16} /> Quick Actions
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-400/50 transition-all group">
              <Calendar size={24} className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">Schedule Site Visit</span>
            </button>
            <button className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-400/50 transition-all group">
              <FileText size={24} className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">Request Documents</span>
            </button>
            <button className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-400/50 transition-all group">
              <MessageSquare size={24} className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">Chat with PM</span>
            </button>
            <button className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-400/50 transition-all group">
              <BarChart2 size={24} className="text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">View Financial Report</span>
            </button>
            <button className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-400/50 transition-all group">
              <Bell size={24} className="text-rose-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">Set Alert</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
