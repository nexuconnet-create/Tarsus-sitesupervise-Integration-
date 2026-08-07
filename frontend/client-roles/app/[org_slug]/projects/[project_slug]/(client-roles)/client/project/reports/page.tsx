'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ClipboardList, Calendar, Filter, Download, Share2,
  Plus, FileText, FileBarChart, ShieldCheck, CheckCircle2,
  AlertTriangle, ArrowRight, Eye, MoreVertical, X
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';
import toast from 'react-hot-toast';

export default function ProgressReportsPage() {
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;

  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  // Mock Report Data
  const reportsData = [
    { id: 1, title: 'Weekly Progress Report W8', date: '2026-02-19', type: 'Weekly', status: 'Ready', pages: 12 },
    { id: 2, title: 'Monthly Progress Report 2', date: '2026-02-01', type: 'Monthly', status: 'Ready', pages: 24 },
    { id: 3, title: 'Foundation Completion', date: '2026-02-05', type: 'Milestone', status: 'Ready', pages: 8 },
    { id: 4, title: 'Quality Inspection (Level 2)', date: '2026-02-15', type: 'Inspection', status: 'Ready', pages: 15 },
    { id: 5, title: 'Weekly Progress Report W7', date: '2026-02-12', type: 'Weekly', status: 'Ready', pages: 11 },
  ];

  const [selectedReportId, setSelectedReportId] = useState<number>(1);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isShareSidepopOpen, setIsShareSidepopOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(reportsData.length / 5);
  const paginatedReports = reportsData.slice((currentPage - 1) * 5, currentPage * 5);

  const selectedReport = reportsData.find(r => r.id === selectedReportId);

  return (
    <div className="h-screen bg-[#E3E3E3] text-slate-900 font-sans flex flex-col overflow-hidden">

      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3">
            PROGRESS REPORTS
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">Period: February 2026</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600">
            <Calendar size={16} className="text-slate-400" />
            <select className="bg-transparent outline-none cursor-pointer">
              <option>This Month</option>
              <option>Last Month</option>
              <option>Q1 2026</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600">
            <Filter size={16} className="text-slate-400" />
            <select className="bg-transparent outline-none cursor-pointer">
              <option>Type: All</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Inspection</option>
            </select>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Download All">
            <Download size={20} />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Share Reports">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-6 mb-6 flex-1 w-full flex flex-col overflow-hidden">
        <div className="flex flex-col xl:flex-row gap-8 flex-1 min-h-0">

          {/* LEFT PANEL: Report List */}
          <div className="flex-1 flex flex-col gap-6 min-h-0">
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} /> Report List
                </h2>
                <button 
                  onClick={() => setIsGenerateModalOpen(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <Plus size={14} /> Generate New Report
                </button>
              </div>

              {/* Table Container */}
              <div className="overflow-y-auto custom-scrollbar flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">#</th>
                      <th className="px-6 py-4">Report Title</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Pages</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedReports.map((report) => (
                      <tr
                        key={report.id}
                        onClick={() => setSelectedReportId(report.id)}
                        className={`cursor-pointer transition-colors group ${selectedReportId === report.id ? 'bg-blue-50/50' : 'hover:bg-white'}`}
                      >
                        <td className="px-6 py-4 text-slate-400 font-mono">{report.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {report.title}
                          {selectedReportId === report.id && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{report.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                            ${report.type === 'Weekly' ? 'bg-blue-100 text-blue-700' : ''}
                            ${report.type === 'Monthly' ? 'bg-indigo-100 text-indigo-700' : ''}
                            ${report.type === 'Milestone' ? 'bg-purple-100 text-purple-700' : ''}
                            ${report.type === 'Inspection' ? 'bg-amber-100 text-amber-700' : ''}
                          `}>
                            {report.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                            <CheckCircle2 size={14} /> {report.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500 font-mono">{report.pages}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors" title="View"><Eye size={16} /></button>
                            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors" title="Download"><Download size={16} /></button>
                            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors" title="More"><MoreVertical size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Showing {(currentPage - 1) * 5 + 1} to {Math.min(currentPage * 5, reportsData.length)} of {reportsData.length} reports</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-white border border-gray-100 rounded-md hover:bg-slate-100 transition-colors text-slate-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >Previous</button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-white border border-gray-100 rounded-md hover:bg-slate-100 transition-colors text-slate-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >Next</button>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT PANEL: Report Preview */}
          <div className="xl:w-[420px] shrink-0 flex flex-col min-h-0">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0">
              <FileBarChart size={16} /> Report Preview
            </h2>

            <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-0">

              {/* Document Header */}
              <div className="bg-[#021422] text-white p-6 shrink-0 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 opacity-10"><FileText size={150} /></div>
                <div className="relative z-10">
                  <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-3 inline-block">
                    {selectedReport?.type} Report
                  </span>
                  <h3 className="text-xl font-bold leading-tight mb-2">
                    {selectedReport?.title}
                  </h3>
                  <p className="text-sm text-blue-200 font-medium">
                    Date: {selectedReport?.date} • {selectedReport?.pages} Pages
                  </p>
                </div>
              </div>

              {/* Document Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')]">

                {/* Mock content based on the wireframe */}
                <div className="space-y-8">

                  {/* Key Achievements */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-gray-100 pb-2">
                      <CheckCircle2 size={16} className="text-emerald-500" /> Key Achievements:
                    </h4>
                    <ul className="space-y-2 pl-6 list-disc list-outside text-sm text-slate-600 marker:text-emerald-500">
                      <li>Completed 45% of piling work (50/110 piles installed).</li>
                      <li>Ground floor slab preparation completed.</li>
                      <li>Material delivery for next phase received and verified.</li>
                    </ul>
                  </div>

                  {/* Challenges */}
                  <div className="space-y-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900 border-b border-amber-200/50 pb-2">
                      <AlertTriangle size={16} className="text-amber-500" /> Challenges:
                    </h4>
                    <ul className="space-y-2 pl-4 list-disc list-outside text-sm text-amber-800 marker:text-amber-500">
                      <li>Piling work 3 weeks behind schedule due to adverse weather.</li>
                      <li>Labor shortage on concrete crew (currently 20% understaffed).</li>
                    </ul>
                  </div>

                  {/* Next Week Plan */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-gray-100 pb-2">
                      <Calendar size={16} className="text-blue-500" /> Next Week Plan:
                    </h4>
                    <ul className="space-y-2 pl-6 list-disc list-outside text-sm text-slate-600 marker:text-blue-500">
                      <li>Complete remaining piling work.</li>
                      <li>Start preliminary column works on Ground Floor.</li>
                      <li>Hire and onboard additional concrete workers.</li>
                    </ul>
                  </div>

                </div>
              </div>

              {/* Document Footer / Actions */}
              <div className="p-4 border-t border-slate-100 bg-white flex gap-3 shrink-0">
                <button 
                  onClick={() => {
                    toast.success('Preparing PDF for download...');
                    setTimeout(() => toast.success('Download complete!'), 2000);
                  }}
                  className="flex-1 py-2.5 bg-[#021422] hover:bg-[#03437a] text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Download size={16} /> Download PDF
                </button>
                <button 
                  onClick={() => setIsShareSidepopOpen(true)}
                  className="px-4 py-2.5 bg-white border border-gray-100 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center shadow-sm" title="Share Document"
                >
                  <Share2 size={16} />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Generate Report Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsGenerateModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Generate New Report</h3>
              <button onClick={() => setIsGenerateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-md"><X size={20} className="lucide-x"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Report Type</label>
                <select className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Weekly Progress Report</option>
                  <option>Monthly Progress Report</option>
                  <option>Milestone Report</option>
                  <option>Inspection Report</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
                  <input type="date" className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
                  <input type="date" className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Sections to Include</label>
                <div className="space-y-2 border border-gray-100 p-3 rounded-lg bg-white">
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Executive Summary</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Financial Overview</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Photos & Attachments</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> HSE Incident Log</label>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-2">
              <button onClick={() => setIsGenerateModalOpen(false)} className="px-4 py-2 bg-white border border-gray-100 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors text-sm">Cancel</button>
              <button onClick={() => {
                setIsGenerateModalOpen(false);
                toast.success('Report generation started. You will be notified when it is ready.');
              }} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm">Generate</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Sidepop */}
      {isShareSidepopOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm flex justify-end" onClick={() => setIsShareSidepopOpen(false)}>
          <div 
            className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Share2 size={18} className="text-blue-600"/> Share Report</h3>
              <button onClick={() => setIsShareSidepopOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md border border-gray-100 shadow-sm"><X size={16} className="lucide-x"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">Share Link</h4>
                <div className="flex gap-2">
                  <input type="text" readOnly value="https://app.sitesupervise.com/reports/s8d9fs" className="flex-1 bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono" />
                  <button onClick={() => toast.success('Link copied to clipboard!')} className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors text-sm">Copy</button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">Send via Email</h4>
                <div className="space-y-3">
                  <input type="email" placeholder="Email address..." className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <textarea placeholder="Add a message (optional)..." className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"></textarea>
                  <button 
                    onClick={() => {
                      toast.success('Report shared successfully!');
                      setIsShareSidepopOpen(false);
                    }}
                    className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    Send Email
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2">Recent Collaborators</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Sarah Jenkins', role: 'Client Representative' },
                    { name: 'Michael Obu', role: 'Lead Architect' },
                    { name: 'David Smith', role: 'Project Manager' }
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-colors cursor-pointer" onClick={() => toast.success(`Sent to ${user.name}`)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">{user.name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.role}</p>
                        </div>
                      </div>
                      <button className="text-blue-600 text-xs font-bold px-2 py-1 bg-blue-50 rounded hover:bg-blue-100">Send</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
