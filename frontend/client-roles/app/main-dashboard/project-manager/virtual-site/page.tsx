"use client";

import React, { useState, useEffect } from "react";
import {
  Camera,
  Battery,
  Signal,
  Monitor,
  Square,
  ZoomIn,
  AlertTriangle,
  Radio,
  RefreshCw,
  MessageSquare,
  Phone,
  Plus,
  FileText,
  Download,
  Share2,
  Eye,
  CheckCircle,
  Clock,
  MapPin,
  Target,
  Activity,
} from "lucide-react";

const anomalies = [
  { id: 1, issue: "Rebar Spacing 220mm", type: "FAIL", typeColor: "bg-red-600", location: "Zone B3", detected: "Today", status: "Pending", evidence: "1 Photo", evidenceCount: 1, action: "Create Task", actionColor: "bg-[#0166B0]" },
  { id: 2, issue: "Concrete Cover 35mm", type: "WARNING", typeColor: "bg-amber-500", location: "Zone B3", detected: "Today", status: "Acknowledged", evidence: "2 Photos", evidenceCount: 2, action: "View", actionColor: "bg-[#021422]" },
  { id: 3, issue: "Formwork Alignment", type: "PASS", typeColor: "bg-emerald-500", location: "Zone A1", detected: "Today", status: "Verified", evidence: "1 Photo", evidenceCount: 1, action: "View", actionColor: "bg-[#021422]" },
];

const participants = [
  { name: "Engr. Adebayo (PM)", status: "Online", statusColor: "bg-emerald-500" },
  { name: "Engr. Adebayo (Site)", status: "Online", statusColor: "bg-emerald-500" },
  { name: "Client J.Olu", status: "Away", statusColor: "bg-amber-500" },
];

const VirtualSite = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Establishing AR Uplink...</div>;
  }

  return (
    <div className="pb-24 text-[#021422]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
            VIRTUAL SITE — Digital Twin & Remote Collaboration
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Project: Lagos 12-Storey Mixed-Use Development</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live: Yes
            </span>
            <span className="text-gray-300">|</span>
            <span>Connected: 8 Users</span>
            <span className="text-gray-300">|</span>
            <span>Sync: Active</span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Session Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Radio size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">SESSION STATUS</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-bold">LIVE</span> — Site Supervisor Online
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Signal size={14} className="text-emerald-600 shrink-0" />
              TRIMBLE XR10 — Connected | Signal: Strong
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Session ID: VS-2026-02-19-001</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              <Battery size={12} className="text-emerald-600" />
              Battery: 85%
            </span>
            <span className="text-gray-300">|</span>
            <span>FPS: 30</span>
            <span className="text-gray-300">|</span>
            <span>Latency: 120ms</span>
          </div>
        </div>

        {/* Live 3D View */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Monitor size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">LIVE 3D VIEW — Digital Twin Model</h2>
          </div>

          {/* 3D Viewport */}
          <div className="bg-[#021422] rounded-lg aspect-[21/9] relative overflow-hidden border border-gray-700 mb-4">
            <div className="absolute top-6 left-6 border-l-2 border-t-2 border-cyan-400 w-12 h-12 opacity-70" />
            <div className="absolute top-6 right-6 border-r-2 border-t-2 border-cyan-400 w-12 h-12 opacity-70" />
            <div className="absolute bottom-6 left-6 border-l-2 border-b-2 border-cyan-400 w-12 h-12 opacity-70" />
            <div className="absolute bottom-6 right-6 border-r-2 border-b-2 border-cyan-400 w-12 h-12 opacity-70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border border-cyan-400/30 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-cyan-400 rounded-full" />
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/30 text-sm font-bold uppercase tracking-widest">
              [3D DIGITAL TWIN — BIM Overlay]
            </div>
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            </div>
          </div>

          {/* BIM Inspection Results */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
              REBAR SPACING: 220mm <span className="text-red-600 font-bold">(FAIL)</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              BEAM ALIGNMENT: <span className="text-emerald-600 font-bold">PASS</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              CONCRETE COVER: 35mm <span className="text-amber-600 font-bold">(WARNING)</span>
            </div>
          </div>

          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 py-2 border-t border-gray-100">
            BIM Model Overlay — Green = PASS, Red = FAIL, Yellow = Warning
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#021422] rounded hover:bg-gray-800 transition-colors">
              <Camera size={14} /> Capture
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
              <Square size={14} /> Record
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors">
              <ZoomIn size={14} /> Zoom
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-amber-600 rounded hover:bg-amber-700 transition-colors">
              <AlertTriangle size={14} /> Mark Anomaly
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-600 border border-emerald-200 rounded hover:bg-emerald-50 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Indicator
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <RefreshCw size={14} /> Sync
            </button>
          </div>
        </div>

        {/* Detected Anomalies */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">DETECTED ANOMALIES</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left py-2 pr-2">#</th>
                  <th className="text-left py-2 pr-2">Issue</th>
                  <th className="text-left py-2 pr-2">Type</th>
                  <th className="text-left py-2 pr-2">Location</th>
                  <th className="text-left py-2 pr-2">Detected</th>
                  <th className="text-left py-2 pr-2">Status</th>
                  <th className="text-left py-2 pr-2">Evidence</th>
                  <th className="text-left py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 pr-2 font-bold text-gray-500">{a.id}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{a.issue}</td>
                    <td className="py-3 pr-2">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold text-white ${a.typeColor} rounded uppercase`}>{a.type}</span>
                    </td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{a.location}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{a.detected}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{a.status}</td>
                    <td className="py-3 pr-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Camera size={12} /> {a.evidence}
                      </span>
                    </td>
                    <td className="py-3">
                      <button className={`px-2 py-0.5 text-[10px] font-bold text-white ${a.actionColor} rounded hover:opacity-90 transition-colors`}>
                        {a.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors">
              <Plus size={14} /> Start New Session
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <FileText size={14} /> Compliance Report
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <Download size={14} /> Export Data
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <Share2 size={14} /> Share Live
            </button>
          </div>
        </div>

        {/* Remote Participants */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">REMOTE PARTICIPANTS</h2>
          </div>

          <div className="space-y-0">
            {participants.map((p, idx) => (
              <div key={idx} className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${p.statusColor}`} />
                  {p.name}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-500 uppercase">{p.status}</span>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-white bg-[#021422] rounded hover:bg-gray-800 transition-colors">
                      <Eye size={12} /> View
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors">
                      <MessageSquare size={12} /> Chat
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                      <Phone size={12} /> Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors">
              <Plus size={14} /> Invite
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <Share2 size={14} /> MS Share Link
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <Eye size={14} /> View All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualSite;
