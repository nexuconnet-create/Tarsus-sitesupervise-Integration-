'use client';

import React, { useState } from 'react';
import { 
  Building2, Search, Filter, LayoutGrid, List, MapPin, 
  Calendar, AlertTriangle, ArrowRight, Video, Phone
} from 'lucide-react';

interface ExecActiveProjectsProps {
  user?: any;
  orgSlug: string;
}

export default function ExecActiveProjects({ user, orgSlug }: ExecActiveProjectsProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const developerName = user?.company_name || 'Martins Construction Ltd';

  const projects = [
    { 
      id: 1, 
      name: 'Lagos 12-Storey Mixed-Use', 
      location: 'Victoria Island, Lagos', 
      phase: 'Superstructure', 
      progress: 45, 
      budget: '₦1.8B', 
      spent: '₦1.2B', 
      status: 'On Track',
      manager: 'Engr. Tunde Bakare',
      image: 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 2, 
      name: 'Abuja Luxury Mall', 
      location: 'Central Business District, Abuja', 
      phase: 'Interior Finishes', 
      progress: 62, 
      budget: '₦2.4B', 
      spent: '₦1.5B', 
      status: 'Ahead',
      manager: 'Sarah Ojo',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 3, 
      name: 'Port Harcourt Bridge', 
      location: 'GRA Phase 2, Port Harcourt', 
      phase: 'Piling & Foundation', 
      progress: 28, 
      budget: '₦3.2B', 
      spent: '₦0.9B', 
      status: 'Delayed',
      manager: 'Chief Emeka Nzeribe',
      image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 4, 
      name: 'Ibadan Townhouse Estate', 
      location: 'Bodija, Ibadan', 
      phase: 'Landscaping', 
      progress: 75, 
      budget: '₦1.2B', 
      spent: '₦0.8B', 
      status: 'On Track',
      manager: 'Engr. Wale Johnson',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'On Track': return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider rounded-md">{status}</span>;
      case 'Ahead': return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider rounded-md">{status}</span>;
      case 'Delayed': return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-wider rounded-md">{status}</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Active Projects
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Total: {projects.length} Ongoing</span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-gray-100">
            <button 
              onClick={() => setView('grid')}
              className={`p-1.5 rounded transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <LayoutGrid size={16}/>
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-1.5 rounded transition-colors ${view === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <List size={16}/>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search active projects..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-gray-100 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            <Filter size={16}/> Filter & Sort
          </button>
        </div>

        {/* Projects Grid View */}
        {view === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
                {/* Image Header */}
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  <img src={proj.image} alt={proj.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight">{proj.name}</h3>
                      <p className="text-white/80 text-xs font-medium flex items-center gap-1 mt-1"><MapPin size={12}/> {proj.location}</p>
                    </div>
                    {getStatusBadge(proj.status)}
                  </div>
                </div>
                
                {/* Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-500 uppercase tracking-wider">Overall Progress</span>
                      <span className="text-blue-600">{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${proj.progress}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3 bg-white rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Budget</p>
                      <p className="text-sm font-black text-slate-800">{proj.budget}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Spent</p>
                      <p className="text-sm font-black text-slate-800">{proj.spent}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-5">
                    <Calendar size={14} className="text-slate-400"/> Current Phase: <span className="text-slate-800">{proj.phase}</span>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <button className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors text-center border border-blue-100">
                      Dashboard
                    </button>
                    <button className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl transition-colors border border-gray-100" title="Live Site Camera">
                      <Video size={16}/>
                    </button>
                    <button className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl transition-colors border border-gray-100" title={`Call Site Manager: ${proj.manager}`}>
                      <Phone size={16}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add New Project Card */}
            <div className="bg-white/50 rounded-2xl border-2 border-dashed border-gray-100 hover:bg-white hover:border-blue-300 transition-colors flex flex-col items-center justify-center p-8 cursor-pointer group min-h-[400px]">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="text-blue-500" size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">Start New Project</h3>
              <p className="text-xs text-slate-500 text-center max-w-[200px]">Initialize a new development and allocate initial budgets.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
