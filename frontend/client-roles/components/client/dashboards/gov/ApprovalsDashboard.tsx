/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, Search, Filter, Clock, AlertTriangle, 
  CheckCircle, XCircle, MoreVertical, Building2, 
  MapPin, FileText, ArrowRight, FileCheck, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

interface ApprovalsDashboardProps {
  user?: any;
  orgSlug: string;
}

export default function ApprovalsDashboard({ user, orgSlug }: ApprovalsDashboardProps) {
  const agencyName = user?.agency_name || 'Lagos State Building Control Agency (LASBCA)';
  const [searchQuery, setSearchQuery] = useState('');
  
  const columns = [
    { id: 'pending', title: 'Pending Submission', count: 3, color: 'slate' },
    { id: 'review', title: 'Under Review', count: 5, color: 'blue' },
    { id: 'approved', title: 'Approved', count: 12, color: 'emerald' },
    { id: 'rejected', title: 'Action Required', count: 2, color: 'rose' }
  ];

  const requests = [
    { id: 'REQ-042', project: 'Lagos 12-Storey Mixed-Use Development', type: 'Foundation Phase Sign-off', date: 'Submitted Today', status: 'review', developer: 'Craneburg Const.', priority: 'high' },
    { id: 'REQ-041', project: 'Eko Atlantic Tower 5', type: 'Fire Safety Plan', date: '2 days ago', status: 'review', developer: 'Eko Pearl Nig.', priority: 'medium' },
    { id: 'REQ-039', project: 'Abuja Mega Mall Project', type: 'Structural Integrity Test', date: '5 days ago', status: 'pending', developer: 'Julius Berger', priority: 'medium' },
    { id: 'REQ-038', project: 'Ibadan Townhouse Estate', type: 'Initial Building Plan', date: '1 week ago', status: 'rejected', developer: 'Lekki Gardens', priority: 'high' },
    { id: 'REQ-035', project: 'Port Harcourt Bridge Link', type: 'Environmental Impact', date: '2 weeks ago', status: 'approved', developer: 'RCC Nigeria', priority: 'medium' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-slate-100 text-slate-700 border-gray-100';
      case 'review': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wide">
            Regulatory Approvals
          </h1>
          <div className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-3 font-medium">
            <span className="flex items-center gap-1 text-slate-700 font-bold"><ShieldCheck size={12}/> {agencyName}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[#021422] hover:bg-[#021422]/90 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            <FileCheck size={16}/> New Approval Request
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by project name, ID, or developer..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2.5 bg-white border border-gray-100 hover:bg-white text-slate-700 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
              <Filter size={16}/> Filter Types
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-4 items-start min-h-[600px]">
          
          {columns.map(col => (
            <div key={col.id} className="w-80 shrink-0 flex flex-col gap-4">
              
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-bold uppercase tracking-wider text-${col.color}-700 flex items-center gap-2`}>
                  <div className={`w-2.5 h-2.5 rounded-full bg-${col.color}-500`}></div>
                  {col.title}
                </h3>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold bg-${col.color}-100 text-${col.color}-700`}>
                  {col.count}
                </span>
              </div>

              {/* Column Items */}
              <div className="flex flex-col gap-4 min-h-[100px] p-2 -mx-2 rounded-xl border border-transparent hover:border-gray-100 transition-colors">
                
                {requests.filter(r => r.status === col.id).map(req => (
                  <div key={req.id} className={`bg-white p-4 rounded-2xl border ${getStatusColor(req.status)} shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col gap-3 relative overflow-hidden`}>
                    
                    {req.priority === 'high' && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>}
                    
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{req.id}</span>
                      <button className="text-slate-400 hover:text-slate-700 transition-colors"><MoreVertical size={14}/></button>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1 group-hover:text-blue-700 transition-colors">{req.type}</h4>
                      <p className="text-xs font-medium text-slate-500 line-clamp-1">{req.project}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                      <Building2 size={12}/>
                      <span className="truncate">{req.developer}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100/50 mt-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Clock size={12}/>
                        {req.date}
                      </div>
                      
                      <button className="w-6 h-6 rounded bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ArrowRight size={14}/>
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Empty State / Drop Zone styling (implicit) */}
                {requests.filter(r => r.status === col.id).length === 0 && (
                  <div className="h-24 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Empty</span>
                  </div>
                )}
                
              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}
