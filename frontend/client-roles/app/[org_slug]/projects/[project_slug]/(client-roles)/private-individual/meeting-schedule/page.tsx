'use client';

import React, { useState } from 'react';
import { 
  Calendar, MapPin, Plus, Clock, 
  User, CheckCircle, Video, FileText 
} from 'lucide-react';

const VISITS = [
  { id: 1, date: 'October 20, 2026', time: '10:00 AM - 11:30 AM', type: 'In-Person', status: 'upcoming', pm: 'Sarah Jenkins', notes: 'Scheduled walk-through of the superstructure phase.' },
  { id: 2, date: 'June 15, 2026', time: '02:00 PM - 03:00 PM', type: 'Virtual (Video Call)', status: 'upcoming', pm: 'Sarah Jenkins', notes: 'Virtual tour of the floor framing progress.' },
  { id: 3, date: 'March 15, 2026', time: '09:00 AM - 10:30 AM', type: 'In-Person', status: 'completed', pm: 'Sarah Jenkins', notes: 'Foundation inspection and review.' },
];

export default function SiteVisitSchedulePage() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans selection:bg-blue-100 relative">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
            Site Visit Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            <MapPin size={12} className="text-rose-500" />
            Lagos 12-Storey Mixed-Use Development
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#021422] text-white text-sm font-bold rounded-lg hover:bg-[#021422]/90 transition-colors shadow-sm"
          >
            <Plus size={16}/> Schedule New Visit
          </button>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 mt-8 space-y-8">
        
        {/* Next Visit Banner */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Calendar size={120} />
          </div>
          
          <div className="relative z-10 space-y-2">
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest bg-white/10 backdrop-blur w-max px-3 py-1 rounded-full">Next Upcoming Visit</p>
            <h2 className="text-3xl font-black">{VISITS[0].date}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-blue-100 mt-2">
              <span className="flex items-center gap-1.5"><Clock size={16}/> {VISITS[0].time}</span>
              <span className="flex items-center gap-1.5"><MapPin size={16}/> {VISITS[0].type}</span>
              <span className="flex items-center gap-1.5"><User size={16}/> {VISITS[0].pm}</span>
            </div>
            <p className="text-sm font-medium text-blue-100/80 mt-3 max-w-md">{VISITS[0].notes}</p>
          </div>
          
          <div className="relative z-10">
            <button className="w-full md:w-auto bg-white text-blue-700 px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-white transition-colors">
              Manage Appointment
            </button>
          </div>
        </div>

        {/* Schedule Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-8">All Visits</h3>
          
          <div className="space-y-6 relative">
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-slate-200 z-0 hidden sm:block"></div>
            
            {VISITS.map((visit) => {
              const isUpcoming = visit.status === 'upcoming';
              const isVirtual = visit.type.includes('Virtual');

              return (
                <div key={visit.id} className="flex gap-4 sm:gap-6 relative z-10 group">
                  <div className={`hidden sm:flex w-10 h-10 rounded-full items-center justify-center border-4 border-white shadow-sm flex-shrink-0 ${
                    isUpcoming ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {isUpcoming ? <Clock size={16}/> : <CheckCircle size={16}/>}
                  </div>
                  
                  <div className={`flex-1 p-5 rounded-xl border transition-all ${
                    isUpcoming ? 'bg-white border-gray-100 hover:border-blue-300' : 'bg-white border-slate-100 opacity-70 hover:opacity-100'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                          {visit.date} 
                          {isVirtual && <Video size={16} className="text-blue-500"/>}
                        </h4>
                        <p className="text-xs font-bold text-slate-500 mt-0.5">{visit.time}</p>
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider whitespace-nowrap ${
                          isUpcoming ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {visit.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-slate-600 mb-4">{visit.notes}</p>
                    
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><User size={14}/> Guide: {visit.pm}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={14}/> Type: {visit.type}</span>
                    </div>

                    {!isUpcoming && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5">
                          <FileText size={14}/> View Visit Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Schedule Modal Placeholder */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold text-[#021422] flex items-center gap-2">
                <Calendar className="text-blue-600" size={20} /> Request Site Visit
              </h2>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Preferred Date</label>
                  <input type="date" className="w-full bg-white border border-gray-100 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Time</label>
                  <select className="w-full bg-white border border-gray-100 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option>Morning (9AM - 12PM)</option>
                    <option>Afternoon (1PM - 4PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Visit Type</label>
                <div className="flex gap-4">
                  <label className="flex-1 border border-gray-100 rounded-lg p-3 flex items-center gap-2 cursor-pointer hover:bg-white">
                    <input type="radio" name="visitType" className="text-blue-600" defaultChecked/>
                    <span className="text-sm font-bold text-slate-700">In-Person</span>
                  </label>
                  <label className="flex-1 border border-gray-100 rounded-lg p-3 flex items-center gap-2 cursor-pointer hover:bg-white">
                    <input type="radio" name="visitType" className="text-blue-600"/>
                    <span className="text-sm font-bold text-slate-700">Virtual (Video)</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Notes / Specific Areas to See</label>
                <textarea 
                  className="w-full bg-white border border-gray-100 rounded-lg p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                  rows={3}
                  placeholder="e.g. I want to check the progress of the living room..."
                ></textarea>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md"
                >
                  Confirm Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
