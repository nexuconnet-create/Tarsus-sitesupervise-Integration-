'use client';

import React from 'react';
import { 
  Calendar, MapPin, CheckCircle, Activity, 
  Hourglass, Flag, ArrowRight, Download 
} from 'lucide-react';

const MILESTONES = [
  {
    id: 1,
    title: 'Site Clearance & Preparation',
    date: 'Jan 15, 2026',
    status: 'completed',
    description: 'Initial grading, debris removal, and setting up the site perimeter and temporary facilities.',
    photos: 2,
    documents: 1,
  },
  {
    id: 2,
    title: 'Foundation & Substructure',
    date: 'Mar 15, 2026',
    status: 'in-progress',
    description: 'Pouring of concrete footings, slab on grade, and initial substructure structural elements.',
    photos: 5,
    documents: 2,
  },
  {
    id: 3,
    title: 'Superstructure (Floors 1-6)',
    date: 'Expected: Jun 2026',
    status: 'upcoming',
    description: 'Erection of steel framework, concrete columns, and floor slabs for the lower half of the building.',
    photos: 0,
    documents: 0,
  },
  {
    id: 4,
    title: 'Superstructure (Floors 7-12)',
    date: 'Expected: Sep 2026',
    status: 'upcoming',
    description: 'Completion of the main structural frame, reaching the roof level.',
    photos: 0,
    documents: 0,
  },
  {
    id: 5,
    title: 'Exterior Finishes (Cladding & Glazing)',
    date: 'Expected: Dec 2026',
    status: 'upcoming',
    description: 'Installation of the glass curtain walls and exterior weatherproofing.',
    photos: 0,
    documents: 0,
  },
  {
    id: 6,
    title: 'Interior Fit-out & MEP',
    date: 'Expected: Mar 2027',
    status: 'upcoming',
    description: 'Mechanical, Electrical, and Plumbing rough-ins followed by drywall and interior finishes.',
    photos: 0,
    documents: 0,
  },
  {
    id: 7,
    title: 'Final Inspections & Handover',
    date: 'Expected: Q3 2027',
    status: 'upcoming',
    description: 'Final quality checks, deep cleaning, and official handover of the property to owners.',
    photos: 0,
    documents: 0,
  },
];

export default function KeyMilestonesPage() {
  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans selection:bg-blue-100">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
            Key Milestones
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            <MapPin size={12} className="text-rose-500" />
            Lagos 12-Storey Mixed-Use Development
          </p>
        </div>
        <div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-100 transition-colors">
            <Download size={16}/> Download Schedule
          </button>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 mt-8 space-y-8">
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Flag size={18} className="text-indigo-500" /> Project Timeline
            </h2>
            <div className="text-xs font-bold text-slate-500 flex gap-4">
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500"/> Completed</span>
              <span className="flex items-center gap-1.5"><Activity size={14} className="text-blue-500"/> In Progress</span>
              <span className="flex items-center gap-1.5"><Hourglass size={14} className="text-slate-400"/> Upcoming</span>
            </div>
          </div>

          <div className="relative pl-4 md:pl-0">
            {/* Vertical Line */}
            <div className="absolute left-[19px] md:left-[120px] top-4 bottom-12 w-[3px] bg-slate-100 rounded-full z-0"></div>

            <div className="space-y-12 relative z-10">
              {MILESTONES.map((milestone, index) => {
                
                const isCompleted = milestone.status === 'completed';
                const isInProgress = milestone.status === 'in-progress';
                const isUpcoming = milestone.status === 'upcoming';

                return (
                  <div key={milestone.id} className={`flex flex-col md:flex-row gap-6 md:gap-12 relative ${isUpcoming ? 'opacity-60' : 'opacity-100'}`}>
                    
                    {/* Date Block (Desktop) */}
                    <div className="hidden md:block w-24 text-right pt-1.5">
                      <p className={`text-xs font-bold uppercase tracking-widest ${isCompleted ? 'text-emerald-600' : isInProgress ? 'text-blue-600' : 'text-slate-400'}`}>
                        {milestone.date.replace('Expected: ', '')}
                      </p>
                      {isUpcoming && <p className="text-[10px] text-slate-400 mt-1 uppercase">Expected</p>}
                    </div>

                    {/* Icon Node */}
                    <div className="absolute -left-1 md:relative md:left-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm
                        ${isCompleted ? 'bg-emerald-500 text-white' : 
                          isInProgress ? 'bg-blue-500 text-white animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 
                          'bg-slate-200 text-slate-400'}
                      `}>
                        {isCompleted && <CheckCircle size={18} />}
                        {isInProgress && <Activity size={18} />}
                        {isUpcoming && <Hourglass size={18} />}
                      </div>
                    </div>

                    {/* Content Block */}
                    <div className={`flex-1 bg-white p-6 rounded-xl border ml-12 md:ml-0 transition-colors
                      ${isInProgress ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100'}
                    `}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className={`text-lg font-bold ${isInProgress ? 'text-blue-900' : 'text-slate-800'}`}>
                            {milestone.title}
                          </h3>
                          {/* Date Block (Mobile) */}
                          <p className={`md:hidden text-xs font-bold uppercase tracking-wider mt-1 ${isCompleted ? 'text-emerald-600' : isInProgress ? 'text-blue-600' : 'text-slate-400'}`}>
                            {milestone.date}
                          </p>
                        </div>
                        {isInProgress && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider self-start whitespace-nowrap">
                            Current Phase
                          </span>
                        )}
                        {isCompleted && (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider self-start whitespace-nowrap">
                            Completed
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4">
                        {milestone.description}
                      </p>

                      {(milestone.photos > 0 || milestone.documents > 0) && (
                        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100/60">
                          {milestone.photos > 0 && (
                            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5">
                              View {milestone.photos} Photos <ArrowRight size={14}/>
                            </button>
                          )}
                          {milestone.documents > 0 && (
                            <button className="text-xs font-bold text-slate-600 hover:text-slate-700 flex items-center gap-1.5">
                              View {milestone.documents} Documents <ArrowRight size={14}/>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
