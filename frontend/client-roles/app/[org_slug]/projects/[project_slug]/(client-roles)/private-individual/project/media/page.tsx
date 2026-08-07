'use client';

import React, { useState } from 'react';
import { 
  Camera, Download, MapPin, Calendar, 
  Search, Filter, PlayCircle, Maximize2 
} from 'lucide-react';

const DUMMY_PHOTOS = [
  { id: 1, type: 'photo', url: 'https://images.unsplash.com/photo-1541888081622-3861218204b4?auto=format&fit=crop&q=80&w=800', title: 'Site Overview from Drone', date: 'Mar 12, 2026', tag: 'Aerial' },
  { id: 2, type: 'photo', url: 'https://images.unsplash.com/photo-1504307651254-35680f356f12?auto=format&fit=crop&q=80&w=800', title: 'Foundation Concrete Pour', date: 'Mar 10, 2026', tag: 'Foundation' },
  { id: 3, type: 'photo', url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800', title: 'Steel Reinforcement', date: 'Mar 08, 2026', tag: 'Structural' },
  { id: 4, type: 'video', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800', title: 'Weekly Progress Walkthrough', date: 'Mar 05, 2026', tag: 'Video Tour' },
  { id: 5, type: 'photo', url: 'https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?auto=format&fit=crop&q=80&w=800', title: 'Trenching Completed', date: 'Mar 01, 2026', tag: 'Excavation' },
  { id: 6, type: 'photo', url: 'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&q=80&w=800', title: 'Equipment Delivery', date: 'Feb 25, 2026', tag: 'Logistics' },
];

export default function ConstructionPhotosPage() {
  const [activeTab, setActiveTab] = useState('All');

  const filteredMedia = activeTab === 'All' 
    ? DUMMY_PHOTOS 
    : DUMMY_PHOTOS.filter(p => p.tag === activeTab || (activeTab === 'Videos' && p.type === 'video'));

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans selection:bg-blue-100">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
            Construction Photos
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            <MapPin size={12} className="text-rose-500" />
            Lagos 12-Storey Mixed-Use Development
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-100 transition-colors">
            <Filter size={16}/> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#021422] text-white text-sm font-bold rounded-lg hover:bg-[#021422]/90 transition-colors">
            <Download size={16}/> Download Selected
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-8 space-y-6">
        
        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['All', 'Foundation', 'Structural', 'Aerial', 'Videos'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-transparent text-slate-500 hover:bg-white border border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-slate-400" size={14} />
            </div>
            <input 
              type="text" 
              placeholder="Search media..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((media) => (
            <div key={media.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 cursor-pointer">
                <img 
                  src={media.url} 
                  alt={media.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                  <div className="flex justify-end">
                    <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                      <Maximize2 size={16}/>
                    </button>
                  </div>
                  {media.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle size={48} className="text-white opacity-80 group-hover:scale-110 transition-transform"/>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur px-2 py-1 rounded">
                      {media.tag}
                    </span>
                    <button className="text-white hover:text-blue-300 transition-colors">
                      <Download size={18}/>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-800 truncate mb-1">{media.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <Calendar size={12}/> {media.date}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {filteredMedia.length === 0 && (
          <div className="text-center py-20">
            <Camera className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500 font-bold">No photos found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
