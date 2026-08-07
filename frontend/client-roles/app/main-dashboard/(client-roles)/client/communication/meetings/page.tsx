"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Calendar as CalendarIcon, Video, Users, Clock, 
  Search, Filter, Plus, ChevronLeft, ChevronRight,
  MoreVertical, CalendarPlus, CalendarDays, Link as LinkIcon
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function MeetingsPage() {
    const org_slug = "";
  const project_slug = "";
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  const [view, setView] = useState<'upcoming'|'past'>('upcoming');

  const meetings = [
    { id: 1, title: 'Weekly Progress Review', type: 'Video', date: 'Today, 2:00 PM', duration: '60 min', attendees: 8, host: 'Project Manager', status: 'upcoming' },
    { id: 2, title: 'Structural Design Sync', type: 'In-Person', date: 'Tomorrow, 10:00 AM', duration: '90 min', attendees: 4, host: 'Lead Engineer', status: 'upcoming' },
    { id: 3, title: 'Client Budget Update', type: 'Video', date: 'Jul 26, 2026, 11:00 AM', duration: '45 min', attendees: 3, host: 'Finance', status: 'upcoming' },
    { id: 4, title: 'Site Inspection Walkthrough', type: 'In-Person', date: 'Jul 20, 2026, 9:00 AM', duration: '120 min', attendees: 6, host: 'Site Supervisor', status: 'past' },
    { id: 5, title: 'Vendor Kickoff - MEP', type: 'Video', date: 'Jul 18, 2026, 3:00 PM', duration: '60 min', attendees: 5, host: 'Procurement', status: 'past' },
  ];

  const displayedMeetings = meetings.filter(m => m.status === view);

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col overflow-hidden">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wider">
            <CalendarIcon className="text-indigo-500" size={24} />
            Meetings
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-emerald-600">3 Upcoming Meetings</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm">
            <CalendarDays size={16} /> Connect Calendar
          </button>
          <button className="px-4 py-2 bg-[#021422] text-white hover:bg-[#03437a] rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-md">
            <Plus size={16} /> Schedule Meeting
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-6 mb-6 flex-1 w-full flex flex-col overflow-hidden gap-6">
        
        {/* Toggle & Search */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm shrink-0">
            <button 
              onClick={() => setView('upcoming')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${view === 'upcoming' ? 'bg-[#021422] text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setView('past')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${view === 'past' ? 'bg-[#021422] text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              Past Meetings
            </button>
          </div>
          
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search meetings by title or host..." 
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm h-full"
            />
          </div>
        </div>

        {/* Meeting List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid gap-4">
            {displayedMeetings.map(meeting => (
              <div key={meeting.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div className="flex items-start sm:items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    meeting.type === 'Video' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {meeting.type === 'Video' ? <Video size={24} /> : <Users size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors cursor-pointer">{meeting.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-1.5 text-slate-700"><Clock size={14} className="text-slate-400"/> {meeting.date} ({meeting.duration})</span>
                      <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="flex items-center gap-1.5"><Users size={14} className="text-slate-400"/> {meeting.attendees} Attendees</span>
                      <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>Host: <span className="text-slate-700">{meeting.host}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  {view === 'upcoming' ? (
                    <>
                      <button className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                        <Video size={16} /> Join Call
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                        <CalendarPlus size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                        View Summary
                      </button>
                    </>
                  )}
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {displayedMeetings.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-600">No {view} meetings</h3>
                <p className="text-slate-500 mt-1">Check back later or schedule a new one.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
