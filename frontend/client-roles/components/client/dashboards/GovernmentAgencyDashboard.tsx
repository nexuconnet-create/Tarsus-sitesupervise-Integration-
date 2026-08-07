'use client';

import React from 'react';
import {
  Building2, Calendar, CheckCircle, Clock,
  MapPin, Activity, Download, Camera, Video,
  FileText, MessageSquare, Bell, ArrowRight, UserCircle, Target, TrendingUp, ShieldCheck, BarChart2,
  AlertCircle, AlertTriangle, ShieldAlert, FileSearch, CheckSquare, Search, FileBarChart
} from 'lucide-react';
import Link from 'next/link';

interface GovernmentAgencyDashboardProps {
  user?: any;
  project?: any;
  orgSlug: string;
  projectSlug: string;
}

export default function GovernmentAgencyDashboard({ user, project, orgSlug, projectSlug }: GovernmentAgencyDashboardProps) {
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';
  const agencyName = user?.agency_name || 'Lagos State Building Control Agency (LASBCA)';
  const base = orgSlug && projectSlug
    ? `/${orgSlug}/projects/${projectSlug}/government-agencies`
    : `/main-dashboard/government-agencies`;

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">

      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Government Agency Dashboard
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700 flex items-center gap-1"><ShieldCheck size={14} /> Agency: {agencyName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600"><MapPin size={14} /> Project: {projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"><Target size={14} /> Role: Regulatory Body</span>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* AGENCY OVERVIEW */}
        <section className="bg-gradient-to-r from-[#021422] to-[#021422] rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 right-32 w-48 h-48 bg-blue-400 opacity-10 rounded-full blur-2xl translate-y-1/3"></div>

          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
              Welcome to {agencyName.split(' ')[0]} Dashboard!
            </h2>
            <p className="text-blue-100 text-lg mb-6">
              You have <strong className="text-white">12 projects</strong> currently under review across your jurisdiction.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="bg-rose-500/20 border border-rose-500/30 rounded-xl p-4 backdrop-blur-sm flex items-start gap-3">
                <div className="p-2 bg-rose-500/30 rounded-lg text-rose-300">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-rose-100 font-bold text-lg">3 Projects</h3>
                  <p className="text-rose-200/80 text-xs font-medium uppercase tracking-wider mt-0.5">Require Immediate Attention</p>
                </div>
              </div>
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 backdrop-blur-sm flex items-start gap-3">
                <div className="p-2 bg-amber-500/30 rounded-lg text-amber-300">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-amber-100 font-bold text-lg">5 Projects</h3>
                  <p className="text-amber-200/80 text-xs font-medium uppercase tracking-wider mt-0.5">Need Regulatory Approval</p>
                </div>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 backdrop-blur-sm flex items-start gap-3">
                <div className="p-2 bg-emerald-500/30 rounded-lg text-emerald-300">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="text-emerald-100 font-bold text-lg">4 Projects</h3>
                  <p className="text-emerald-200/80 text-xs font-medium uppercase tracking-wider mt-0.5">Are Fully Compliant</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REGULATORY COMPLIANCE DASHBOARD */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-600" /> Regulatory Compliance Dashboard
            </h2>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
              <FileSearch size={16} className="text-slate-500" /> Project: {projectName}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-full"><CheckCircle size={16} /></div>
                <p className="text-sm font-bold text-slate-800">Building Plans</p>
              </div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100/50 px-2.5 py-1 rounded-full">Approved</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-full"><Clock size={16} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Structural Compliance</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">DUE: MAR 10, 2026</p>
                </div>
              </div>
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100/50 px-2.5 py-1 rounded-full">Under Review</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/50 border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-full"><AlertCircle size={16} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Fire Safety Compliance</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">DUE: MAR 15, 2026</p>
                </div>
              </div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-100/50 px-2.5 py-1 rounded-full">Pending</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/50 border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-full"><AlertCircle size={16} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Environmental Impact</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">DUE: MAR 20, 2026</p>
                </div>
              </div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-100/50 px-2.5 py-1 rounded-full">Pending</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-full"><CheckCircle size={16} /></div>
                <p className="text-sm font-bold text-slate-800">Occupational Health</p>
              </div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100/50 px-2.5 py-1 rounded-full">Approved</div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* INSPECTION REPORTS */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <FileText size={16} className="text-blue-600" /> Inspection Reports
            </h2>

            <div className="space-y-3 flex-1 mb-6">
              {[
                { title: 'Foundation Inspection', date: 'Mar 02, 2026' },
                { title: 'Rebar Placement', date: 'Feb 28, 2026' },
                { title: 'Concrete Quality', date: 'Feb 25, 2026' },
                { title: 'Beam Installation', date: 'Feb 20, 2026' },
              ].map((report, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm font-bold text-slate-700">{report.title}</span>
                  </div>
                  <span className="text-xs text-slate-500">{report.date}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto flex gap-3 border-t border-slate-100 pt-4">
              <button className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <Download size={16} /> Download All
              </button>
              <button className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <FileSearch size={16} /> View Archive
              </button>
            </div>
          </section>

          {/* ACTIVE PROJECTS */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" /> Active Projects
            </h2>

            <div className="space-y-3 flex-1 mb-6">
              {[
                { name: 'Lagos Tower', status: 'Compliance Review Pending', statusColor: 'amber' },
                { name: 'Abuja Mall', status: 'Approved', statusColor: 'emerald' },
                { name: 'Port Harcourt Bridge', status: 'Under Review', statusColor: 'blue' },
                { name: 'Ibadan Townhouse', status: 'Compliance Check', statusColor: 'purple' },
              ].map((proj, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Target size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-800">{proj.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-${proj.statusColor}-100 text-${proj.statusColor}-700`}>
                    {proj.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-auto border-t border-slate-100 pt-4">
              <Link href={`${base}/project/schedule`} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <BarChart2 size={16} /> View All Projects
              </Link>
            </div>
          </section>
        </div>

        {/* COMPLIANCE SUMMARY */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Activity size={16} className="text-blue-600" /> Compliance Summary
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white rounded-xl border border-slate-100 flex flex-col items-center text-center">
              <span className="text-xs font-bold text-slate-500 uppercase mb-1">Total Under Review</span>
              <span className="text-2xl font-black text-slate-800">12</span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center text-center">
              <span className="text-xs font-bold text-emerald-600 uppercase mb-1">Compliant</span>
              <span className="text-2xl font-black text-emerald-700">4</span>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex flex-col items-center text-center">
              <span className="text-xs font-bold text-rose-600 uppercase mb-1">Non-Compliant</span>
              <span className="text-2xl font-black text-rose-700">3</span>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex flex-col items-center text-center">
              <span className="text-xs font-bold text-amber-600 uppercase mb-1">Pending Review</span>
              <span className="text-2xl font-black text-amber-700">5</span>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><TrendingUp size={18} /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Compliance Trend</p>
                <p className="text-sm font-bold text-blue-700 mt-0.5">Improving</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-semibold">Last Month</p>
                <p className="text-sm font-bold text-slate-700">3 Compliant</p>
              </div>
              <div className="text-right border-l border-blue-200 pl-6">
                <p className="text-xs text-slate-500 uppercase font-semibold">This Month</p>
                <p className="text-sm font-bold text-emerald-600">4 Compliant</p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPLIANCE ISSUES */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-600" /> Compliance Issues
            </h2>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">2 Actionable Items</span>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="mt-0.5 text-rose-600"><AlertCircle size={20} /></div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800"><span className="text-rose-600">Critical:</span> Rebar spacing violation on Zone B3</h3>
                  <p className="text-xs font-medium text-slate-600 mt-1">Immediate action required to halt section pour.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 ml-8">
                <button className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
                  <FileText size={14} /> Issue Notice
                </button>
                <button className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
                  <Camera size={14} /> View Evidence
                </button>
                <button className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Escalate
                </button>
              </div>
            </div>

            <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="mt-0.5 text-amber-500"><AlertTriangle size={20} /></div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800"><span className="text-amber-600">Warning:</span> Concrete cover below specification</h3>
                  <p className="text-xs font-medium text-slate-600 mt-1">Review required by structural engineer before next phase.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 ml-8">
                <button className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
                  <FileText size={14} /> Issue Notice
                </button>
                <button className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
                  <Camera size={14} /> View Evidence
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* AGENCY ACTIONS */}
        <section className="bg-[#021422] rounded-2xl shadow-lg p-6 md:p-8 text-white">
          <h2 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Activity size={16} /> Agency Actions
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-all group">
              <CheckSquare size={24} className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">Approve Compliance</span>
            </button>
            <button className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:border-rose-400/50 transition-all group">
              <FileText size={24} className="text-rose-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">Issue Notice</span>
            </button>
            <button className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-400/50 transition-all group">
              <FileBarChart size={24} className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">Generate Report</span>
            </button>
            <button className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all group">
              <Search size={24} className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">Search Projects</span>
            </button>
            <button className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500/20 hover:border-amber-400/50 transition-all group">
              <BarChart2 size={24} className="text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white">Analytics</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
