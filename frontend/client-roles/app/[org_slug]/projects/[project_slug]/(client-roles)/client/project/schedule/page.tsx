
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Calendar as CalendarIcon, Clock, Filter, ChevronLeft, ChevronRight,
  Truck, HardHat, ShieldCheck, Users, MapPin, Search, CalendarDays, ArrowRight, X
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';
import { Calendar as BigCalendar, momentLocalizer, Views, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface ScheduleEvent {
  title: string;
  start: Date;
  end: Date;
  type: 'construction' | 'delivery' | 'inspection' | 'meeting';
}

export default function ProjectSchedulePage() {
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  // Dynamic Date Logic
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(currentDate.getDate());
  
  const [currentView, setCurrentView] = useState<'Month' | 'Week' | 'Day'>('Day');
  const [isRequestMeetingOpen, setIsRequestMeetingOpen] = useState(false);
  const [isFullCalendarOpen, setIsFullCalendarOpen] = useState(false);

  // Calendar math
  const daysInMonthCount = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startOffsetCount = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const daysInMonth = Array.from({length: daysInMonthCount}, (_, i) => i + 1);
  const startOffset = Array.from({length: startOffsetCount}, (_, i) => i); 
  
  // Format current month string
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const currentMonthName = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  const selectedDayName = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate).toLocaleDateString('en-US', { weekday: 'long' });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(1);
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(1);
  };

  // Mock Events for BigCalendar
  const events: ScheduleEvent[] = [
    {
      title: 'Level 4 Slab Reinforcement Setup',
      start: moment().set({ hour: 8, minute: 0 }).toDate(),
      end: moment().set({ hour: 16, minute: 0 }).toDate(),
      type: 'construction'
    },
    {
      title: 'HVAC Chiller Units Arrival',
      start: moment().set({ hour: 10, minute: 30 }).toDate(),
      end: moment().set({ hour: 11, minute: 30 }).toDate(),
      type: 'delivery'
    },
    {
      title: 'Structural Integrity Check',
      start: moment().set({ hour: 13, minute: 0 }).toDate(),
      end: moment().set({ hour: 14, minute: 0 }).toDate(),
      type: 'inspection'
    },
    {
      title: 'Weekly Progress Update Call',
      start: moment().set({ hour: 15, minute: 0 }).toDate(),
      end: moment().set({ hour: 16, minute: 0 }).toDate(),
      type: 'meeting'
    }
  ];

  const eventStyleGetter = (event: ScheduleEvent) => {
    let backgroundColor = '#3174ad';
    if (event.type === 'construction') backgroundColor = '#3b82f6';
    if (event.type === 'delivery') backgroundColor = '#f59e0b';
    if (event.type === 'inspection') backgroundColor = '#10b981';
    if (event.type === 'meeting') backgroundColor = '#6366f1';
    
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="h-screen bg-[#E3E3E3] text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3">
            PROJECT SCHEDULE
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">Daily Operations & Planning</span>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-gray-100">
            <button 
              onClick={() => setCurrentView('Month')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md ${currentView === 'Month' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >Month</button>
            <button 
              onClick={() => setCurrentView('Week')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md ${currentView === 'Week' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >Week</button>
            <button 
              onClick={() => setCurrentView('Day')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md ${currentView === 'Day' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >Day</button>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white flex items-center gap-2">
            <Filter size={16} /> Filters
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search schedule..." 
              className="pl-9 pr-4 py-2 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto flex-1 w-full flex flex-col overflow-hidden gap-6">

        {/* SPLIT CALENDAR VIEW */}
        <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
          
          {/* Left Panel: Mini Calendar */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 xl:w-[400px] shrink-0 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-slate-800">{currentMonthName}</h2>
              <div className="flex gap-1">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500"><ChevronLeft size={20}/></button>
                <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500"><ChevronRight size={20}/></button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty offsets */}
              {startOffset.map(i => <div key={`empty-${i}`} className="aspect-square"></div>)}
              
              {/* Days */}
              {daysInMonth.map(day => {
                const isSelected = day === selectedDate;
                
                // Deterministic mock logic based on day number so dots look consistent
                const hasDelivery = day % 7 === 2 || day % 7 === 5;
                const hasInspection = day % 10 === 0 || day % 11 === 0;
                const hasMeeting = day % 4 === 1;

                return (
                  <button 
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square rounded-full flex flex-col items-center justify-center relative text-sm font-semibold transition-all
                      ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105' : 'text-slate-700 hover:bg-slate-100'}
                    `}
                  >
                    {day}
                    <div className="flex gap-0.5 mt-0.5">
                      {hasDelivery && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-400'}`}></div>}
                      {hasInspection && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></div>}
                      {hasMeeting && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}></div>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Legend</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div> Deliveries
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Inspections
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Client Meetings
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Construction Tasks
                </div>
              </div>
            </div>
          </section>

          {/* Right Panel: Daily Feed */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-2xl font-extrabold text-[#021422]">
                  {selectedDayName}, {monthNames[currentDate.getMonth()]} {selectedDate}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">4 Events Scheduled</p>
              </div>
              <button 
                onClick={() => setIsRequestMeetingOpen(true)}
                className="px-4 py-2 bg-[#021422] hover:bg-[#03437a] text-white rounded-lg text-sm font-bold transition-colors"
              >
                + Request Meeting
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
              
              {/* Event Card: Construction */}
              <div className="relative pl-8 group">
                <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-slate-100 group-last:bg-transparent"></div>
                <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center z-10 shadow-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md uppercase tracking-wider w-fit">Construction</span>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Clock size={12}/> 08:00 AM - 04:00 PM</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">Level 4 Slab Reinforcement Setup</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1.5"><HardHat size={14} className="text-slate-400"/> Prime Steelworks</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400"/> Zone B, North Tower</span>
                  </div>
                </div>
              </div>

              {/* Event Card: Delivery */}
              <div className="relative pl-8 group">
                <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-slate-100 group-last:bg-transparent"></div>
                <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-amber-100 border-4 border-white flex items-center justify-center z-10 shadow-sm">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider w-fit">Delivery</span>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Clock size={12}/> 10:30 AM (Est)</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">HVAC Chiller Units Arrival</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1.5"><Truck size={14} className="text-slate-400"/> Delta Logistics</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400"/> Loading Bay A</span>
                  </div>
                </div>
              </div>

              {/* Event Card: Inspection */}
              <div className="relative pl-8 group">
                <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-slate-100 group-last:bg-transparent"></div>
                <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-emerald-100 border-4 border-white flex items-center justify-center z-10 shadow-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider w-fit">Inspection</span>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Clock size={12}/> 01:00 PM - 02:00 PM</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">Structural Integrity Check</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-slate-400"/> City Planning Authority</span>
                  </div>
                </div>
              </div>

              {/* Event Card: Meeting */}
              <div className="relative pl-8 group">
                <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-slate-100 group-last:bg-transparent"></div>
                <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-indigo-100 border-4 border-white flex items-center justify-center z-10 shadow-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-wider w-fit">Meeting</span>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Clock size={12}/> 03:00 PM - 04:00 PM</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">Weekly Progress Update Call</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1.5"><Users size={14} className="text-slate-400"/> Project Manager, Site Super</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400"/> Virtual (Teams Link)</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* UPCOMING HIGHLIGHTS */}
        <section className="shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <CalendarDays size={16} /> Look-Ahead (Next 7 Days)
            </h2>
            <button 
              onClick={() => setIsFullCalendarOpen(true)}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Monthly Calendar <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-emerald-300 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><ShieldCheck size={20}/></div>
                <span className="text-[10px] font-bold text-slate-400">IN 3 DAYS</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1">July 25, 2026</p>
              <h3 className="text-sm font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">Electrical Rough-in Inspection</h3>
              <p className="text-xs text-slate-500">Zone B requires full clearance before drywalling begins.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-amber-300 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Truck size={20}/></div>
                <span className="text-[10px] font-bold text-slate-400">IN 6 DAYS</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1">July 28, 2026</p>
              <h3 className="text-sm font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">Curtain Wall Glass Delivery</h3>
              <p className="text-xs text-slate-500">Major delivery of glass panels for North facade. Loading Bay A.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-blue-300 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><HardHat size={20}/></div>
                <span className="text-[10px] font-bold text-slate-400">IN 7 DAYS</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-1">July 29, 2026</p>
              <h3 className="text-sm font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Level 5 Concrete Pour</h3>
              <p className="text-xs text-slate-500">Large continuous pour. May cause noise delays on-site.</p>
            </div>

          </div>
        </section>

      </div>

      {/* Request Meeting Modal */}
      {isRequestMeetingOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsRequestMeetingOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Request a Meeting</h3>
              <button onClick={() => setIsRequestMeetingOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Meeting Title</label>
                <input type="text" className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Weekly Progress Sync" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                  <input type="date" className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Time</label>
                  <input type="time" className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Participants</label>
                <input type="text" className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email addresses..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Agenda / Notes</label>
                <textarea className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="Meeting details..."></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-2">
              <button onClick={() => setIsRequestMeetingOpen(false)} className="px-4 py-2 bg-white border border-gray-100 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors text-sm">Cancel</button>
              <button onClick={() => setIsRequestMeetingOpen(false)} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm">Send Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Full Monthly Calendar Modal */}
      {isFullCalendarOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsFullCalendarOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full h-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><CalendarIcon className="text-blue-600" size={20}/> Full Monthly Calendar</h3>
              <button onClick={() => setIsFullCalendarOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-md"><X size={20}/></button>
            </div>
            <div className="flex-1 p-6 min-h-0 bg-white">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full">
                <BigCalendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  view={Views.MONTH}
                  date={currentDate}
                  onNavigate={(date) => setCurrentDate(date)}
                  eventPropGetter={eventStyleGetter}
                  views={['month']}
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
