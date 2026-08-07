'use client';

import React, { useState } from 'react';
import { 
  GitCompare, AlertTriangle, CheckCircle, Info, Filter, ArrowRight
} from 'lucide-react';

export default function BimComparisonPage() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(1);

  const issues = [
    { id: 1, title: 'HVAC Duct Misalignment', severity: 'High', deviation: '+125mm', location: 'Level 2, Zone B', status: 'Open' },
    { id: 2, column: 'Structural Column C4', title: 'Slab Deflection', severity: 'Medium', deviation: '-42mm', location: 'Level 3, Grid C-4', status: 'Review' },
    { id: 3, title: 'Partition Wall Shift', severity: 'Low', deviation: '+15mm', location: 'Level 1, Lobby', status: 'Accepted' },
    { id: 4, title: 'Missing Pipe Sleeve', severity: 'High', deviation: 'N/A', location: 'Level 2, Core', status: 'Open' },
  ];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans flex flex-col">
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            BIM DEVIATION ANALYSIS
          </h1>
          <div className="text-sm text-slate-500 mt-2">
            AI-powered comparison of As-Built Point Cloud vs. As-Designed BIM.
          </div>
        </div>
      </div>

      <div className="p-8 max-w-[1600px] mx-auto w-full flex-1 grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left: Issues List */}
        <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[700px]">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-sm font-bold text-[#021422] flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-500" /> Detected Anomalies
            </h2>
            <button className="text-slate-400 hover:text-blue-600 transition-colors">
              <Filter size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {issues.map(issue => (
              <button 
                key={issue.id}
                onClick={() => setSelectedIssue(issue.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedIssue === issue.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    issue.severity === 'High' ? 'bg-rose-100 text-rose-700' :
                    issue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {issue.severity}
                  </span>
                  <span className={`text-[10px] font-bold ${issue.status === 'Open' ? 'text-blue-600' : 'text-slate-400'}`}>
                    {issue.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">{issue.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{issue.location}</p>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Deviation:</span>
                  <span className={issue.severity === 'High' ? 'text-rose-600 font-bold' : 'text-slate-700'}>{issue.deviation}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Split Screen Viewer */}
        <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[700px] overflow-hidden relative">
          
          {/* Header */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur border border-gray-200 shadow-lg rounded-full px-6 py-2 flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs font-bold text-slate-700">As-Built (Scan)</span>
            </div>
            <GitCompare size={16} className="text-slate-400" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-slate-400"></div>
              <span className="text-xs font-bold text-slate-700">As-Designed (BIM)</span>
            </div>
          </div>

          {/* Interactive Split Viewport */}
          <div className="relative flex-1 bg-slate-900 overflow-hidden select-none">
            
            {/* Base Image (BIM - Right side conceptually, but it takes full width and gets clipped) */}
            <div className="absolute inset-0 bg-[#1e293b]">
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1)_100%)] bg-[length:20px_20px]"></div>
              
              {/* Mock BIM Structure */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] border-4 border-slate-500 rounded-lg flex items-center justify-center">
                <span className="text-slate-500 font-mono text-4xl">BIM MODEL</span>
              </div>
            </div>

            {/* Overlay Image (Scan - Clipped by slider) */}
            <div 
              className="absolute inset-y-0 left-0 bg-[#0f172a] border-r-4 border-blue-500 shadow-[2px_0_15px_rgba(59,130,246,0.5)]"
              style={{ width: `${sliderPosition}%` }}
            >
              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
              
              {/* Mock Scan Structure */}
              <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-[600px] h-[400px] border-4 border-blue-500/50 rounded-lg flex items-center justify-center bg-blue-500/10 backdrop-blur-sm" style={{ transform: `translateX(calc(-50vw * ${sliderPosition/100}))`, left: '50vw' }}>
                <span className="text-blue-400 font-mono text-4xl">LIDAR SCAN</span>
              </div>
              
              {/* Heatmap Highlights (Only visible in scan view) */}
              {selectedIssue === 1 && (
                <div className="absolute top-[40%] left-[60%] w-32 h-32 bg-rose-500/40 rounded-full blur-2xl animate-pulse" style={{ transform: `translateX(calc(-50vw * ${sliderPosition/100}))`, left: '50vw' }}></div>
              )}
            </div>

            {/* Slider Control */}
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderPosition} 
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            />
            
            {/* Slider Handle Visual */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-8 h-12 bg-blue-600 rounded-full shadow-lg flex items-center justify-center pointer-events-none z-20 border-2 border-white"
              style={{ left: `calc(${sliderPosition}% - 16px)` }}
            >
              <div className="flex flex-col gap-1">
                <div className="w-0.5 h-1.5 bg-white rounded-full"></div>
                <div className="w-0.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>

          </div>

          {/* Bottom Panel: Issue Detail */}
          <div className="bg-white border-t border-gray-100 p-5 flex items-center justify-between">
            {selectedIssue ? (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{issues.find(i => i.id === selectedIssue)?.title}</h3>
                    <p className="text-xs text-slate-500">Deviation detected beyond 50mm tolerance.</p>
                  </div>
                </div>
                <div className="h-10 w-px bg-gray-200"></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Recommended Action</p>
                  <p className="text-sm font-semibold text-[#021422]">Issue RFI to HVAC Contractor</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400">
                <Info size={16} /> Select an issue from the left panel to view details.
              </div>
            )}
            
            <button className="px-6 py-2.5 bg-[#021422] text-white text-sm font-bold rounded-lg hover:bg-[#021422]/90 flex items-center gap-2 transition-colors">
              Create Issue Report <ArrowRight size={16} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
