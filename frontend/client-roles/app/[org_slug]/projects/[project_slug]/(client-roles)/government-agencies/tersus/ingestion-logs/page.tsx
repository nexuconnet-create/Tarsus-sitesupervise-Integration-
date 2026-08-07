'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, Database, Activity, Server, FileBox, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function IngestionLogsPage() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const mockLogs = [
      '[14:02:45] INFO: Handshake established with Tersus MVP S1 (ID: TS1-8902)',
      '[14:02:46] AUTH: Token verified. Session started for Project Lagos 12-Storey.',
      '[14:02:48] UPLOAD: Receiving thermal scan chunks (32/128)',
      '[14:02:51] UPLOAD: Thermal scan payload complete.',
      '[14:02:55] UPLOAD: Initiating LiDAR point cloud transfer...',
      '[14:03:02] UPLOAD: LiDAR chunks received (128/1024)',
      '[14:03:08] UPLOAD: LiDAR chunks received (512/1024)',
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < mockLogs.length) {
        setLogs(prev => [...prev, mockLogs[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3">
          SCAN INGESTION LOGS
        </h1>
        <div className="text-sm text-slate-500 mt-2">
          Monitor real-time edge scanner uploads and metadata from the Tersus MVP S1.
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Scans</span>
              <Database size={16} className="text-blue-500" />
            </div>
            <span className="text-3xl font-extrabold text-[#021422]">142</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Uploads</span>
              <RefreshCw size={16} className="text-emerald-500 animate-spin-slow" />
            </div>
            <span className="text-3xl font-extrabold text-[#021422]">1</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Avg Data Size</span>
              <FileBox size={16} className="text-indigo-500" />
            </div>
            <span className="text-3xl font-extrabold text-[#021422]">8.4 GB</span>
          </div>
          <div className="bg-[#021422] rounded-xl shadow-sm border border-[#021422] p-5 flex flex-col text-white">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-blue-200 uppercase">Edge Connection</span>
              <Activity size={16} className="text-emerald-400 animate-pulse" />
            </div>
            <span className="text-xl font-bold text-emerald-400 flex items-center gap-2 mt-1">
              <Server size={20} /> Connected
            </span>
          </div>
        </div>

        {/* Live Terminal & Recent Sessions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Live Terminal */}
          <div className="lg:col-span-2 bg-[#0a0a0a] rounded-xl shadow-lg border border-gray-800 overflow-hidden flex flex-col h-[500px]">
            <div className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-gray-400" />
                <span className="text-xs font-mono text-gray-400">tersus-edge-proxy.log</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs sm:text-sm text-green-400 space-y-2">
              {logs.map((log, i) => (
                <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {log?.includes?.('INFO') ? <span className="text-blue-400">{log}</span> : 
                   log?.includes?.('ERROR') ? <span className="text-red-400">{log}</span> :
                   log?.includes?.('AUTH') ? <span className="text-amber-400">{log}</span> : log}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-4 text-gray-500">
                <span className="animate-pulse">_</span>
              </div>
            </div>
          </div>

          {/* Recent Sessions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[500px]">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Database size={16} /> Recent Scans
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {[
                { id: "SCAN-004", status: "Uploading", size: "---", time: "Just now", icon: <RefreshCw size={14} className="text-blue-500 animate-spin" /> },
                { id: "SCAN-003", status: "Completed", size: "12.4 GB", time: "2 hours ago", icon: <CheckCircle size={14} className="text-emerald-500" /> },
                { id: "SCAN-002", status: "Failed", size: "1.2 GB", time: "5 hours ago", icon: <XCircle size={14} className="text-rose-500" /> },
                { id: "SCAN-001", status: "Completed", size: "8.1 GB", time: "1 day ago", icon: <CheckCircle size={14} className="text-emerald-500" /> },
              ].map((scan, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-md">
                      {scan.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{scan.id}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><Clock size={10}/>{scan.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      scan.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                      scan.status === 'Uploading' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                    }`}>{scan.status}</span>
                    <p className="text-[10px] font-semibold text-slate-500 mt-1">{scan.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
