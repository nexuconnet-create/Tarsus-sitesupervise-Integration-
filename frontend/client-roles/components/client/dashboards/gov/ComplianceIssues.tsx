/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, ShieldAlert, CheckCircle, Search, 
  Filter, MapPin, Building2, Calendar, MessageSquare, 
  Download, Clock, ArrowRight, XCircle
} from 'lucide-react';
import Link from 'next/link';

interface ComplianceIssuesProps {
  user?: any;
  orgSlug: string;
}

export default function ComplianceIssues({ user, orgSlug }: ComplianceIssuesProps) {
  const agencyName = user?.agency_name || 'Lagos State Building Control Agency (LASBCA)';
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');

  const issues = [
    {
      id: 'VIO-2026-042',
      project: 'Eko Atlantic Tower 5',
      developer: 'Eko Pearl Nig.',
      location: 'Eko Atlantic City, Lagos',
      title: 'Structural Failure Risk: Concrete Core Strength',
      description: 'Concrete cube test results for Level 4 core walls returned 25MPa instead of the specified 40MPa. Immediate halt on pouring higher levels required until remediation plan is approved.',
      severity: 'critical',
      dateReported: '2 days ago',
      daysOverdue: 0,
      status: 'active',
      inspector: 'Engr. Tunde',
      image: 'https://images.unsplash.com/photo-1541888081622-140b0856004b?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'VIO-2026-041',
      project: 'Lagos 12-Storey Mixed-Use Development',
      developer: 'Craneburg Const.',
      location: 'Victoria Island, Lagos',
      title: 'Unapproved Design Variation',
      description: 'Balcony cantilever extended by 1.2m without submitting revised structural drawings to the agency. Work proceeding on eastern facade must stop.',
      severity: 'high',
      dateReported: '5 days ago',
      daysOverdue: 2,
      status: 'active',
      inspector: 'Arch. Nnamdi',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'VIO-2026-039',
      project: 'Ibadan Townhouse Estate',
      developer: 'Lekki Gardens',
      location: 'Bodija, Oyo',
      title: 'Missing Fire Safety Exits',
      description: 'Phase 2 blocks constructed without the mandated secondary fire egress routes as stipulated in the approved 2025 fire safety code.',
      severity: 'high',
      dateReported: '1 week ago',
      daysOverdue: 4,
      status: 'active',
      inspector: 'Engr. Femi',
    },
    {
      id: 'VIO-2026-038',
      project: 'Abuja Mega Mall Project',
      developer: 'Julius Berger',
      location: 'Central District, Abuja',
      title: 'Expired Environmental Permit',
      description: 'Site environmental impact clearance expired on Jan 30. Renewal application pending payment verification.',
      severity: 'warning',
      dateReported: '2 weeks ago',
      daysOverdue: 14,
      status: 'active',
      inspector: 'Engr. Sarah',
    },
    {
      id: 'VIO-2026-030',
      project: 'Port Harcourt Bridge Link',
      developer: 'RCC Nigeria',
      location: 'Obio-Akpor, Rivers',
      title: 'Inadequate Site Hoarding',
      description: 'Public safety risk due to damaged perimeter fencing along the primary highway artery.',
      severity: 'warning',
      dateReported: '1 month ago',
      daysOverdue: 0,
      status: 'resolved',
      inspector: 'Engr. Tunde',
    }
  ];

  const getSeverityStyles = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-700';
      default: return 'bg-white border-gray-100 text-slate-700';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <XCircle size={16} className="text-rose-600"/>;
      case 'high': return <ShieldAlert size={16} className="text-orange-600"/>;
      case 'warning': return <AlertTriangle size={16} className="text-amber-600"/>;
      default: return <AlertTriangle size={16} className="text-slate-600"/>;
    }
  };

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wide">
            Compliance Issues & Violations
          </h1>
          <div className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-3 font-medium">
            <span className="flex items-center gap-1 text-slate-700 font-bold"><ShieldAlert size={12}/> Enforcement Dashboard</span>
            <span className="text-slate-300">|</span>
            <span>{agencyName}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            <AlertTriangle size={16}/> Log New Violation
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Navigation & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['active', 'resolved'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-sm font-bold rounded-lg transition-colors capitalize ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab} Issues
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search issues by ID, project..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="px-3 py-2 bg-white border border-gray-100 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shrink-0">
              <Filter size={16}/> Filter
            </button>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {issues.filter(i => i.status === activeTab).map((issue) => (
            <div key={issue.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row">
              
              {/* Left Color Bar indicator */}
              <div className={`w-2 md:w-3 shrink-0 ${
                issue.severity === 'critical' ? 'bg-rose-500' : 
                issue.severity === 'high' ? 'bg-orange-500' : 
                issue.severity === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}></div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${getSeverityStyles(issue.severity)}`}>
                      {getSeverityIcon(issue.severity)}
                      {issue.severity} Priority
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{issue.id}</span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{issue.title}</h2>
                  <p className="text-sm text-slate-600 mb-4">{issue.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400"/>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project</p>
                      <p className="text-xs font-bold text-slate-700">{issue.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400"/>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{issue.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400"/>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reported</p>
                      <p className="text-xs font-bold text-slate-700">{issue.dateReported}</p>
                    </div>
                  </div>
                  {issue.daysOverdue > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-rose-400"/>
                      <div>
                        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Deadline</p>
                        <p className="text-xs font-bold text-rose-600">{issue.daysOverdue} days overdue</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side Actions / Image */}
              <div className="md:w-72 bg-white border-l border-slate-100 flex flex-col p-4 shrink-0">
                {issue.image && (
                  <div className="w-full h-32 rounded-lg overflow-hidden mb-4 border border-gray-100">
                    <img src={issue.image} alt="Evidence" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="mt-auto space-y-2">
                  {activeTab === 'active' ? (
                    <>
                      <button className="w-full py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-lg transition-colors flex justify-center items-center gap-2 border border-rose-200">
                        <ShieldAlert size={14}/> Issue Stop-Work Order
                      </button>
                      <button className="w-full py-2.5 bg-white border border-gray-100 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors flex justify-center items-center gap-2">
                        <MessageSquare size={14}/> Message Developer
                      </button>
                      <button className="w-full py-2 text-slate-500 hover:text-emerald-600 text-xs font-bold transition-colors flex justify-center items-center gap-2">
                        Mark as Resolved <ArrowRight size={14}/>
                      </button>
                    </>
                  ) : (
                    <button className="w-full py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg flex justify-center items-center gap-2">
                      <CheckCircle size={14}/> Resolution Approved
                    </button>
                  )}
                </div>
              </div>
              
            </div>
          ))}
          
          {issues.filter(i => i.status === activeTab).length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-slate-300"/>
              </div>
              <h3 className="text-lg font-bold text-slate-800">No {activeTab} issues found</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">All compliance violations have been resolved or none match your current filters.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
