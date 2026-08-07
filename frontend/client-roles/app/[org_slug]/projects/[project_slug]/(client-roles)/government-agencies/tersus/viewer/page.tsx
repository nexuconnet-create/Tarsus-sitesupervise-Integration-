'use client';

import React, { useState } from 'react';
import { 
  Box, Layers, Maximize, Minus, Plus, Eye, EyeOff, 
  Settings, MousePointer2, Ruler, Download, Share2
} from 'lucide-react';

export default function LidarViewerPage() {
  const [layers, setLayers] = useState([
    { id: 'l1', name: 'Raw LiDAR (Point Cloud)', visible: true, color: 'text-blue-400' },
    { id: 'l2', name: 'Thermal Overlay', visible: false, color: 'text-rose-400' },
    { id: 'l3', name: '48MP RGB Texture', visible: true, color: 'text-emerald-400' },
    { id: 'l4', name: '3DGS Rendered Output', visible: false, color: 'text-amber-400' },
  ]);

  const toggleLayer = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans flex flex-col">
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            3DGS & LiDAR VIEWER
          </h1>
          <div className="text-sm text-slate-500 mt-2">
            Fused sensor data visualization (LiDAR + RGB + Thermal) from Tersus MVP S1.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm font-semibold transition-colors">
            <Share2 size={16} /> Share View
          </button>
          <button className="px-4 py-2 bg-[#021422] text-white rounded-lg hover:bg-[#021422]/90 flex items-center gap-2 text-sm font-semibold transition-colors">
            <Download size={16} /> Export Asset
          </button>
        </div>
      </div>

      <div className="p-8 max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
        
        {/* Viewer Container */}
        <div className="relative flex-1 bg-black rounded-2xl shadow-xl border border-gray-800 overflow-hidden min-h-[700px] flex">
          
          {/* Mock Viewport Background (CSS Grid/Gradient) */}
          <div className="absolute inset-0 bg-[#0a0a0a] z-0 overflow-hidden">
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom opacity-30"></div>
            
            {/* Simulated Point Cloud / Model Silhouette */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[600px] h-[400px] relative">
                {/* Mock Building Shape */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-gradient-to-t from-blue-500/20 to-transparent border border-blue-500/30 rounded-t-xl backdrop-blur-[2px]">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 mix-blend-overlay"></div>
                  
                  {layers.find(l => l.id === 'l2')?.visible && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/40 via-amber-500/40 to-transparent mix-blend-screen rounded-t-xl animate-pulse"></div>
                  )}
                  {layers.find(l => l.id === 'l4')?.visible && (
                    <div className="absolute inset-0 bg-amber-500/10 mix-blend-color-dodge rounded-t-xl"></div>
                  )}
                </div>
                
                {/* Mock Points */}
                {layers.find(l => l.id === 'l1')?.visible && (
                  <>
                    <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_#60a5fa]"></div>
                    <div className="absolute top-[30%] left-[60%] w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]"></div>
                    <div className="absolute top-[50%] left-[40%] w-1 h-1 bg-blue-300 rounded-full shadow-[0_0_8px_#93c5fd]"></div>
                    <div className="absolute top-[70%] left-[70%] w-2 h-2 bg-rose-400 rounded-full shadow-[0_0_12px_#fb7185]"></div>
                    <div className="absolute top-[80%] left-[30%] w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]"></div>
                  </>
                )}
              </div>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10 font-bold text-4xl uppercase tracking-[1rem] pointer-events-none select-none">
              Viewport Active
            </div>
          </div>

          {/* Left Sidebar: Layers & Assets (Glassmorphism) */}
          <div className="relative z-10 w-72 m-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col h-[calc(100%-32px)]">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers size={16} className="text-blue-400"/> Data Layers
            </h3>
            
            <div className="space-y-2 flex-1">
              {layers.map(layer => (
                <button 
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    layer.visible 
                      ? 'bg-white/10 border-white/20 text-white shadow-inner' 
                      : 'bg-transparent border-transparent text-white/50 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${layer.visible ? layer.color.replace('text-', 'bg-') : 'bg-gray-600'}`}></div>
                    <span className="text-xs font-semibold">{layer.name}</span>
                  </div>
                  {layer.visible ? <Eye size={14} className="text-white/80"/> : <EyeOff size={14} className="text-white/30"/>}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <h3 className="text-white/50 font-bold text-[10px] uppercase tracking-wider mb-3">Model Properties</h3>
              <div className="space-y-2 text-xs text-white/80">
                <div className="flex justify-between"><span className="text-white/50">Points:</span> <span className="font-mono">14,284,921</span></div>
                <div className="flex justify-between"><span className="text-white/50">Bounds:</span> <span className="font-mono">120m x 85m x 42m</span></div>
                <div className="flex justify-between"><span className="text-white/50">Density:</span> <span className="font-mono">High (2cm)</span></div>
              </div>
            </div>
          </div>

          {/* Floating Toolbar (Bottom Center) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
            <button className="p-3 hover:bg-white/10 rounded-full text-white transition-colors" title="Select">
              <MousePointer2 size={18} />
            </button>
            <button className="p-3 hover:bg-white/10 rounded-full text-white transition-colors" title="Measure (Distance)">
              <Ruler size={18} />
            </button>
            <div className="w-px h-6 bg-white/20 mx-2"></div>
            <button className="p-3 hover:bg-white/10 rounded-full text-white transition-colors" title="Zoom Out">
              <Minus size={18} />
            </button>
            <button className="p-3 hover:bg-white/10 rounded-full text-white transition-colors" title="Zoom In">
              <Plus size={18} />
            </button>
            <button className="p-3 hover:bg-white/10 rounded-full text-white transition-colors" title="Fit to Screen">
              <Maximize size={18} />
            </button>
            <div className="w-px h-6 bg-white/20 mx-2"></div>
            <button className="p-3 hover:bg-white/10 rounded-full text-white transition-colors" title="Settings">
              <Settings size={18} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
