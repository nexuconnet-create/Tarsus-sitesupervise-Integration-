'use client';

import React from 'react';
import { 
  FileText, Download, FilePlus, Calendar, CheckCircle, Clock, Zap
} from 'lucide-react';

interface ExecBoardReportsProps {
  user?: any;
  orgSlug: string;
}

export default function ExecBoardReports({ user, orgSlug }: ExecBoardReportsProps) {
  const developerName = user?.company_name || 'Martins Construction Ltd';

  const archives = [
    { id: 'Q3-26', title: 'Q3 2026 Board Update', date: 'Oct 1, 2026', size: '2.4 MB', type: 'Quarterly' },
    { id: 'SEP-26', title: 'September 2026 Ops Report', date: 'Sep 30, 2026', size: '1.1 MB', type: 'Monthly' },
    { id: 'AUG-26', title: 'August 2026 Ops Report', date: 'Aug 31, 2026', size: '1.2 MB', type: 'Monthly' },
    { id: 'Q2-26', title: 'Q2 2026 Board Update', date: 'Jul 1, 2026', size: '3.1 MB', type: 'Quarterly' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Board Reports
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Executive Briefings & Archives</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Report Generator & Highlights */}
          <div className="space-y-6">
            
            {/* Auto Generator */}
            <div className="bg-gradient-to-br from-[#021422] to-[#021422] rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><FilePlus size={64}/></div>
              <h3 className="font-black uppercase tracking-wider text-sm flex items-center gap-2 mb-4 relative z-10">
                <Zap className="text-amber-400" size={16}/> Auto-Generate Deck
              </h3>
              <p className="text-sm text-blue-200 mb-6 relative z-10 leading-relaxed">
                Compile real-time financials, timeline analytics, and vendor performance into a standardized PDF deck for your next board meeting.
              </p>
              <button className="w-full py-3 bg-white hover:bg-white text-[#021422] text-sm font-black rounded-xl transition-colors shadow-sm relative z-10 flex items-center justify-center gap-2">
                <FilePlus size={18}/> Generate October 2026 Report
              </button>
            </div>

            {/* Key Highlights */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-white">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Key Highlights (Current Month)</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex gap-3 items-start">
                  <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16}/>
                  <p className="text-sm text-slate-600 leading-tight">Portfolio ROI is currently <strong className="text-slate-800">25.3%</strong>, exceeding the 22.0% board target.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <Clock className="text-amber-500 shrink-0 mt-0.5" size={16}/>
                  <p className="text-sm text-slate-600 leading-tight">Port Harcourt Bridge is experiencing a <strong className="text-slate-800">+₦300M variance</strong> due to material delays.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16}/>
                  <p className="text-sm text-slate-600 leading-tight">Vendor compliance is at <strong className="text-slate-800">92%</strong> across 12 active projects.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Archive Grid */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                <Calendar size={18} className="text-blue-600"/> Report Archive
              </h3>
            </div>
            <div className="p-6 flex-1 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {archives.map((report) => (
                  <div key={report.id} className="bg-white p-5 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                        <FileText size={20} />
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        report.type === 'Quarterly' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {report.type}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{report.title}</h4>
                    <p className="text-xs font-medium text-slate-500 mb-4">{report.date} &bull; {report.size}</p>
                    <button className="mt-auto w-full py-2 bg-white text-slate-700 text-xs font-bold rounded-lg border border-gray-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors flex items-center justify-center gap-2">
                      <Download size={14}/> Download PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
