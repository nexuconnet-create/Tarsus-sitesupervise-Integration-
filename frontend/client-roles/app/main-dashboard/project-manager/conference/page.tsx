"use client";

import React, { useState, useEffect } from "react";
import {
  Phone,
  Calendar,
  Mic,
  Monitor,
  Users,
  FileText,
  Plus,
  BarChart3,
  Disc,
  Clock,
  Shield,
  ScreenShare,
  PenTool,
  UserPlus,
} from "lucide-react";

const scheduledMeetings = [
  { title: "Client Progress Review", time: "Today 3:00 PM", host: "J.Olu (Client)", duration: "15 min" },
  { title: "Design Coordination", time: "Tomorrow 10:00 AM", host: "O.Adeyemi (Arch)", duration: "1hr" },
  { title: "Risk Assessment", time: "Mar 25 2:00 PM", host: "PM Adebayo", duration: "3 days" },
];

const mosaicParticipants = [
  { name: "Engr.", role: "PM" },
  { name: "Client", role: "Client" },
  { name: "Site", role: "Field" },
  { name: "Project", role: "Office" },
];

const participantDetails = [
  { name: "Adebayo", role: "PM" },
  { name: "J.Olu", role: "Client" },
  { name: "Foreman", role: "Field" },
  { name: "Director", role: "Office" },
];

function UserIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const ConferencePage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Connecting to Conference...</div>;
  }

  return (
    <div className="pb-24 text-[#021422]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
            CONFERENCE MEETING HUB
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Project: Lagos 12-Storey Mixed-Use Development</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active Calls: 1
            </span>
            <span className="text-gray-300">|</span>
            <span>Scheduled: 3</span>
            <span className="text-gray-300">|</span>
            <span>Recordings: 12</span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Active Call */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">ACTIVE CALL</h2>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-bold text-[#021422]">LIVE — Project Review Meeting</h3>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">
            <span className="flex items-center gap-1"><Clock size={12} /> Duration: 45:23</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><Users size={12} /> Participants: 8/8</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><Monitor size={12} /> Quality: HD</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><Shield size={12} /> Encrypted</span>
          </div>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            [ENGINEER&apos;S VIEW — Mosaic Layout]
          </div>

          {/* Mosaic Grid */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            {mosaicParticipants.map((p, idx) => (
              <div key={idx} className="aspect-video bg-[#021422] rounded-lg relative overflow-hidden border border-gray-700 flex items-center justify-center">
                <span className="text-white/20 text-3xl font-bold">{p.name}</span>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1.5 px-2 text-center">
                  <span className="text-[10px] font-bold text-white uppercase">{p.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Participant Details Row */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {participantDetails.map((p, idx) => (
              <div key={idx} className="text-center">
                <span className="text-xs font-bold text-gray-700">{p.name}</span>
                <span className="text-[10px] text-gray-400 ml-1">({p.role})</span>
              </div>
            ))}
          </div>

          {/* Call Toolbar */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#021422] rounded hover:bg-gray-800 transition-colors">
              <ScreenShare size={14} /> Share Screen
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors">
              <PenTool size={14} /> Whiteboard
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
              <Disc size={14} /> Record
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <Mic size={14} /> Mute
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <UserPlus size={14} /> MS Invite
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <FileText size={14} /> Share Document
            </button>
          </div>
        </div>

        {/* Scheduled Meetings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">SCHEDULED MEETINGS</h2>
          </div>

          <div className="space-y-0">
            {scheduledMeetings.map((m, idx) => (
              <div key={idx} className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-gray-400 shrink-0" />
                  <span className="text-sm font-bold text-[#021422]">{m.time} — {m.title}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <UserIcon /> {m.host}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Clock size={12} /> {m.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-[10px] font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors">
                    Join
                  </button>
                  <button className="px-3 py-1.5 text-[10px] font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors">
              <Plus size={14} /> Schedule Meeting
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <BarChart3 size={14} /> Meeting Analytics
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <Disc size={14} /> Recordings
            </button>
          </div>
        </div>

        {/* Meeting Analytics */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">MEETING ANALYTICS</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center py-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-[#021422]">8</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Meetings (This Month)</div>
              </div>
              <div className="text-center py-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-[#021422]">45min</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Avg Duration</div>
              </div>
              <div className="text-center py-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-emerald-600">92%</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Attending Rate</div>
              </div>
              <div className="text-center py-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-[#021422]">24</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Action Items</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-3 border-t border-gray-100 text-sm font-medium text-gray-700">
              <span>Most Active: <span className="font-bold text-[#021422]">Client J.Olu (6 meetings)</span></span>
              <span className="text-gray-300">|</span>
              <span>Least Active: <span className="font-bold text-[#021422]">LAGBA (2 meetings)</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConferencePage;
