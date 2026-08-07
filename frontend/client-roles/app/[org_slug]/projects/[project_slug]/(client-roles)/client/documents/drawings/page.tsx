"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  PenTool, Search, Filter, FolderOpen, 
  Download, Eye, MoreVertical, LayoutGrid, 
  List, Layers, FileArchive
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function DrawingsPage() {
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');

  const drawingsData = [
    { id: 'ARC-GF-01', title: 'Ground Floor General Arrangement', rev: 'Rev 4', category: 'Architectural', date: 'Feb 18, 2026', size: '12 MB', thumb: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784538199/3_Bedroom_House_Plan_-_ID_13501_-_CAD_PDF___Architectural_Drawings_2_eihftb.png' },
    { id: 'STR-FD-02', title: 'Foundation Details & Piling Layout', rev: 'Rev 2', category: 'Structural', date: 'Feb 15, 2026', size: '18 MB', thumb: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784499060/Residential_Electrical_Layout_DWG_with_Lighting_Points_1_ynofyf.png' },
    { id: 'MEP-HVAC-01', title: 'HVAC Ducting Layout - Level 1 to 5', rev: 'Rev 1', category: 'MEP', date: 'Jan 30, 2026', size: '24 MB', thumb: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784489053/9x10m_house_plan_is_given_in_this_Autocad_drawing_file__1_itp4pu.png' },
    { id: 'ARC-EL-01', title: 'North & South Elevations', rev: 'Rev 5', category: 'Architectural', date: 'Feb 20, 2026', size: '15 MB', thumb: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784489052/__18_1_qmkang.png' },
    { id: 'CIV-DR-01', title: 'Site Drainage & Grading Plan', rev: 'Rev 3', category: 'Civil', date: 'Jan 10, 2026', size: '8 MB', thumb: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784489051/3_Bedroom_House_Plan_-_ID_13501_-_CAD_PDF___Architectural_Drawings_1_kk7vmz.png' },
    { id: 'STR-SL-03', title: 'Typical Floor Slab Reinforcement', rev: 'Rev 2', category: 'Structural', date: 'Feb 12, 2026', size: '22 MB', thumb: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784489051/__17_1_gjc6ii.png' },
  ];

  return (
    <div className="h-screen bg-[#E3E3E3] text-slate-900 font-sans flex flex-col overflow-hidden">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wider">
            Drawings & Plans
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium">Total: 245 Drawings</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-gray-100">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-6 mb-6 flex-1 w-full flex flex-col overflow-hidden gap-6">
        
        {/* Categories / Quick Filters */}
        <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 shrink-0">
          <button className="px-4 py-2 bg-[#021422] text-white rounded-full text-sm font-bold whitespace-nowrap shadow-md">
            All Drawings
          </button>
          <button className="px-4 py-2 bg-white border border-gray-100 hover:bg-white text-slate-600 rounded-full text-sm font-bold whitespace-nowrap shadow-sm transition-colors">
            Architectural (78)
          </button>
          <button className="px-4 py-2 bg-white border border-gray-100 hover:bg-white text-slate-600 rounded-full text-sm font-bold whitespace-nowrap shadow-sm transition-colors">
            Structural (89)
          </button>
          <button className="px-4 py-2 bg-white border border-gray-100 hover:bg-white text-slate-600 rounded-full text-sm font-bold whitespace-nowrap shadow-sm transition-colors">
            MEP (78)
          </button>
          <button className="px-4 py-2 bg-white border border-gray-100 hover:bg-white text-slate-600 rounded-full text-sm font-bold whitespace-nowrap shadow-sm transition-colors">
            Civil (24)
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search drawings by ID, title, or tags..." 
              className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm cursor-pointer hover:bg-white transition-colors">
            <Layers size={18} className="text-slate-400" />
            <select className="bg-transparent outline-none cursor-pointer">
              <option>Revisions: Latest Only</option>
              <option>All Revisions</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {drawingsData.map((drawing) => (
                <div key={drawing.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                  {/* Thumbnail Area */}
                  <div className="aspect-video relative bg-slate-100 overflow-hidden border-b border-gray-100">
                    {/* Fake blueprint styling overlay for visual flair */}
                    <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply z-10"></div>
                    <img 
                      src={drawing.thumb} 
                      alt={drawing.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 z-20">
                      <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-black uppercase tracking-widest rounded shadow-sm">
                        {drawing.category}
                      </span>
                    </div>
                    {/* Hover Actions Overlay */}
                    <div className="absolute inset-0 bg-black/50 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button className="p-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                        <Eye size={18} />
                      </button>
                      <button className="p-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all delay-75">
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Details Area */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{drawing.id}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{drawing.rev}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 mt-1 flex-1" title={drawing.title}>
                      {drawing.title}
                    </h3>
                    <div className="flex items-center justify-between mt-4 text-xs font-medium text-slate-500">
                      <span>{drawing.date}</span>
                      <span>{drawing.size}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/80 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Drawing ID</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Revision</th>
                    <th className="px-6 py-4">Date Updated</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drawingsData.map((drawing) => (
                    <tr key={drawing.id} className="hover:bg-white/50 transition-colors group">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">{drawing.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{drawing.title}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-500">{drawing.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded">{drawing.rev}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{drawing.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Download size={16} />
                          </button>
                          <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
