'use client';

import React from 'react';
import { 
  Building2, MapPin, Handshake, Calendar, Target, 
  Activity, Camera, Clock, CheckCircle, Hourglass, 
  DollarSign, TrendingUp, Download, PlayCircle, 
  FileText, MessageSquare, Bell, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMemberships } from '@/lib/hooks/useMemberships';
import { useAuthStore } from '@/lib/stores/authStore';

export default function PrivateIndividualHome() {
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;
  const searchParams = useSearchParams();
  const clientType = searchParams.get('clientType') || 'Private-Individual';
  const querySuffix = `?clientType=${encodeURIComponent(clientType)}`;
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const user = useAuthStore(s => s.user);

  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';
  const basePath = `/${org_slug}/projects/${project_slug}/private-individual`;

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans selection:bg-blue-100">
      
      {/* 1. Header Section */}
      <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-sm font-bold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
            PRIVATE-INDIVIDUAL DASHBOARD
          </h1>
          <div className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-3 font-medium">
            <span className="flex items-center gap-1 text-slate-700 font-bold">
              Client: {user?.name || 'Mr. John Olu'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700 font-bold flex items-center gap-1">
              Project: {projectName}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              <Handshake size={12}/> Role: Property Owner
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-8 space-y-8">
        
        {/* 2. Welcome Message */}
        <section className="bg-gradient-to-r from-[#021422] to-[#021422] rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Building2 size={120} />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              Hello {user?.name?.split(' ')[0] || 'Mr. Olu'}!
            </h2>
            <p className="text-blue-100 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
              Your investment in <span className="text-white font-bold">{projectName}</span> is progressing well. 
              Stay updated with construction progress and key milestones right here.
            </p>
            <div className="mt-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2.5">
              <Target className="text-emerald-400" size={20}/>
              <div>
                <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider mb-0.5">Next Milestone</p>
                <p className="text-sm font-bold text-white">Foundation Completion (March 15, 2026)</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. My Property Progress */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-[#021422] text-white p-4 flex items-center gap-2 mb-6">
            <Activity size={18} className="text-blue-400" />
            <h2 className="text-sm font-bold">My Property Progress</h2>
          </div>
          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Overall Progress</p>
                <p className="text-2xl font-bold text-[#021422]">45.2%</p>
              </div>
              <div className="flex gap-4 text-xs font-bold text-slate-600 bg-white px-4 py-2.5 rounded-lg border border-slate-100">
                <p>Expected Completion: <span className="text-blue-600">June 2027</span></p>
                <span className="text-slate-300">|</span>
                <p>Unit Status: <span className="text-emerald-600">Foundation Stage</span></p>
                <span className="text-slate-300">|</span>
                <p>Handover: <span className="text-indigo-600">Q3 2027</span></p>
              </div>
            </div>

            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
              <div className="h-full bg-blue-500 w-[45.2%] relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 w-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}></div>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* 4. Split View: Photos & Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Construction Photos */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#021422] text-white p-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Camera size={16} className="text-rose-400" /> Construction Photos
              </h2>
              <Link href={`${basePath}/project/media${querySuffix}`} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View All <ChevronRight size={14}/>
              </Link>
            </div>
            <div className="p-6 flex-1 flex flex-col">
            
            <div className="grid grid-cols-2 gap-3 flex-1 mb-4">
              <div className="bg-slate-100 rounded-xl aspect-[4/3] relative overflow-hidden group cursor-pointer border border-gray-100">
                <img src="https://images.unsplash.com/photo-1541888081622-3861218204b4?auto=format&fit=crop&q=80&w=600" alt="Site Overview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5"><Camera size={12}/> Site Overview</p>
                </div>
              </div>
              <div className="bg-slate-100 rounded-xl aspect-[4/3] relative overflow-hidden group cursor-pointer border border-gray-100">
                <img src="https://images.unsplash.com/photo-1504307651254-35680f356f12?auto=format&fit=crop&q=80&w=600" alt="Foundation" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5"><Camera size={12}/> Foundation</p>
                </div>
              </div>
              <div className="bg-slate-100 rounded-xl aspect-[4/3] relative overflow-hidden group cursor-pointer border border-gray-100">
                <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=600" alt="Frame" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5"><Camera size={12}/> Frame</p>
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl aspect-[4/3] relative overflow-hidden group cursor-pointer flex items-center justify-center border border-slate-700">
                <div className="text-center z-10">
                  <PlayCircle size={32} className="text-white/80 mx-auto mb-2 group-hover:text-blue-400 transition-colors"/>
                  <p className="text-xs font-bold text-white">Latest Video Tour</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 bg-white border border-gray-100 text-xs font-bold text-slate-600 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                <Download size={14}/> Download Latest
              </button>
            </div>
            </div>
          </section>

          {/* Key Milestones */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#021422] text-white p-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Calendar size={16} className="text-indigo-400" /> Key Milestones
              </h2>
              <Link href={`${basePath}/timeline${querySuffix}`} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Full Timeline <ChevronRight size={14}/>
              </Link>
            </div>
            <div className="p-6">

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="mt-0.5"><CheckCircle size={18} className="text-emerald-500"/></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Site Clearance</p>
                  <p className="text-xs font-medium text-emerald-600 mt-0.5 bg-emerald-50 inline-block px-1.5 rounded">Completed Jan 2026</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 relative">
                  <Activity size={18} className="text-blue-500 animate-pulse"/>
                  <div className="absolute top-5 left-1/2 w-0.5 h-6 bg-slate-200 -translate-x-1/2"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Foundation</p>
                  <p className="text-xs font-medium text-blue-600 mt-0.5 bg-blue-50 inline-block px-1.5 rounded">In Progress (45%)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 relative">
                  <Hourglass size={18} className="text-amber-500"/>
                  <div className="absolute top-5 left-1/2 w-0.5 h-6 bg-slate-200 -translate-x-1/2"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-600">Superstructure</p>
                  <p className="text-xs font-medium text-amber-600 mt-0.5">Upcoming (Mar 2026)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 relative">
                  <Hourglass size={18} className="text-slate-300"/>
                  <div className="absolute top-5 left-1/2 w-0.5 h-6 bg-slate-200 -translate-x-1/2"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">Finishing</p>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">Upcoming (Jan 2027)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5"><CheckCircle size={18} className="text-slate-300"/></div>
                <div>
                  <p className="text-sm font-bold text-slate-500">Handover</p>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">Expected Q3 2027</p>
                </div>
              </div>
            </div>
            </div>
          </section>

        </div>

        {/* 5. Investment Summary */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-[#021422] text-white p-4 flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-400" /> Investment Summary
            </h2>
            <Link href={`${basePath}/financial/reports${querySuffix}`} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Full Report <ChevronRight size={14}/>
            </Link>
          </div>
          <div className="p-6 sm:p-8">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Investment</p>
              <p className="text-lg font-bold text-[#021422]">₦85,000,000</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Value</p>
              <p className="text-lg font-bold text-[#021422]">₦92,000,000</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp size={12}/> Est. ROI</p>
              <p className="text-lg font-extrabold text-emerald-700">+8.2%</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Payment Status</p>
              <p className="text-sm font-extrabold text-blue-700 flex items-center gap-1 mt-1"><CheckCircle size={16}/> Up-to-date</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Payment Schedule:</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
                <div>
                  <p className="text-sm font-bold text-slate-800">Deposit</p>
                  <p className="text-xs text-slate-500">₦25.5M (30%)</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <CheckCircle size={16}/> Paid
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
                <div>
                  <p className="text-sm font-bold text-slate-800">Foundation</p>
                  <p className="text-xs text-slate-500">₦25.5M (30%)</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <CheckCircle size={16}/> Paid
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/50">
                <div>
                  <p className="text-sm font-bold text-slate-800">Superstructure</p>
                  <p className="text-xs text-slate-500">₦25.5M (30%)</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                  <Hourglass size={16}/> Due Mar 2026
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white">
                <div>
                  <p className="text-sm font-bold text-slate-600">Handover</p>
                  <p className="text-xs text-slate-500">₦8.5M (10%)</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <Hourglass size={16}/> Due Jun 2027
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* 6. Client Actions */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-[#021422] text-white p-4 flex items-center gap-2">
            <Handshake size={16} className="text-blue-400" />
            <h2 className="text-sm font-bold">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            
            <Link href={`${basePath}/meeting-schedule${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group text-center">
              <Calendar size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors"/>
              <span className="text-[11px] font-bold uppercase tracking-wider">Schedule Site Visit</span>
            </Link>
            
            <Link href={`${basePath}/documents/all${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group text-center">
              <FileText size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors"/>
              <span className="text-[11px] font-bold uppercase tracking-wider">Request Documents</span>
            </Link>
            
            <Link href={`${basePath}/communication/messages${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group text-center">
              <MessageSquare size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors"/>
              <span className="text-[11px] font-bold uppercase tracking-wider">Chat with PM</span>
            </Link>
            
            <Link href={`${basePath}/financial/reports${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group text-center">
              <Activity size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors"/>
              <span className="text-[11px] font-bold uppercase tracking-wider">View Financials</span>
            </Link>
            
            <Link href={`${basePath}/settings/notifications${querySuffix}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group text-center">
              <Bell size={24} className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors"/>
              <span className="text-[11px] font-bold uppercase tracking-wider">Set Alert</span>
            </Link>

          </div>
        </section>

      </div>
    </div>
  );
}
