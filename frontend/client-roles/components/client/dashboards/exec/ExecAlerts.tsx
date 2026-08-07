'use client';

import React, { useState } from 'react';
import { 
  Bell, AlertTriangle, ShieldAlert, CheckCircle, Settings, Mail, Smartphone,
  CheckSquare, XCircle, Trash2
} from 'lucide-react';

interface ExecAlertsProps {
  user?: any;
  orgSlug: string;
}

export default function ExecAlerts({ user, orgSlug }: ExecAlertsProps) {
  const developerName = user?.company_name || 'Martins Construction Ltd';
  const [activeTab, setActiveTab] = useState<'inbox' | 'actions' | 'settings'>('inbox');

  const inbox = [
    { id: 1, type: 'critical', project: 'Port Harcourt Bridge', title: 'Severe Weather Warning', time: '10 mins ago', desc: 'Category 3 storm approaching. Site evacuation recommended.', read: false },
    { id: 2, type: 'warning', project: 'Lagos 12-Storey', title: 'Budget Threshold Reached', time: '2 hours ago', desc: 'Project has consumed 90% of allocated budget with 15% of phase remaining.', read: false },
    { id: 3, type: 'info', project: 'Abuja Mall', title: 'Inspection Passed', time: 'Yesterday', desc: 'Phase 2 structural inspection passed by local authorities.', read: true },
  ];

  const actions = [
    { id: 101, project: 'Lagos 12-Storey', title: 'Change Order Request #42', amount: '₦12,500,000', vendor: 'Julius Berger', desc: 'Additional steel reinforcement required for foundation.' },
    { id: 102, project: 'Port Harcourt Bridge', title: 'Vendor Contract Renewal', amount: '₦45,000,000', vendor: 'Oceanic Logistics', desc: 'Annual renewal for haulage services.' }
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Executive Alerts
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Priority Inbox</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8">

        {/* Custom Tabs */}
        <div className="flex bg-white rounded-xl border border-gray-100 shadow-sm p-1 mb-6 max-w-max">
          <button 
            onClick={() => setActiveTab('inbox')}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'inbox' ? 'bg-[#021422] text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
          >
            <Bell size={16}/> Inbox <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">2</span>
          </button>
          <button 
            onClick={() => setActiveTab('actions')}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'actions' ? 'bg-[#021422] text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
          >
            <CheckSquare size={16}/> Action Required <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">2</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-[#021422] text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
          >
            <Settings size={16}/> Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
          
          {activeTab === 'inbox' && (
            <div className="animate-in fade-in duration-300">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="font-bold text-slate-800 text-sm">Critical Notifications</h3>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Mark all as read</button>
              </div>
              <div className="divide-y divide-slate-100">
                {inbox.map((msg) => (
                  <div key={msg.id} className={`p-5 flex gap-4 transition-colors group cursor-pointer ${msg.read ? 'bg-white hover:bg-white' : 'bg-blue-50/30 hover:bg-blue-50/60'}`}>
                    <div className="shrink-0 mt-1">
                      {msg.type === 'critical' && <ShieldAlert size={20} className="text-rose-600"/>}
                      {msg.type === 'warning' && <AlertTriangle size={20} className="text-amber-500"/>}
                      {msg.type === 'info' && <CheckCircle size={20} className="text-emerald-500"/>}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm ${msg.read ? 'font-semibold text-slate-700' : 'font-black text-slate-900'}`}>{msg.title}</h4>
                        <span className="text-xs font-medium text-slate-400">{msg.time}</span>
                      </div>
                      <p className="text-xs font-bold text-blue-600 mb-1">{msg.project}</p>
                      <p className={`text-sm ${msg.read ? 'text-slate-500' : 'text-slate-700'}`}>{msg.desc}</p>
                    </div>
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center">
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="animate-in fade-in duration-300">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-50">
                <h3 className="font-bold text-amber-900 text-sm">Awaiting Executive Approval</h3>
              </div>
              <div className="divide-y divide-slate-100 p-6 space-y-4">
                {actions.map((act) => (
                  <div key={act.id} className="p-5 rounded-xl border border-gray-100 bg-white hover:border-blue-300 transition-colors shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800">{act.title}</h4>
                        <p className="text-xs font-bold text-blue-600 mt-1">{act.project}</p>
                      </div>
                      <span className="text-lg font-black text-slate-800">{act.amount}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{act.desc}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase">Vendor: <span className="text-slate-700">{act.vendor}</span></p>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 bg-white text-xs font-bold flex items-center gap-1.5">
                          <XCircle size={14}/> Reject
                        </button>
                        <button className="px-4 py-2 text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm text-xs font-bold flex items-center gap-1.5">
                          <CheckSquare size={14}/> Sign & Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-300">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="font-bold text-slate-800 text-sm">Alert Preferences</h3>
              </div>
              <div className="p-8 max-w-2xl">
                <div className="space-y-6">
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ShieldAlert size={20}/>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Critical Incident Alerts</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Safety violations, severe delays, stop-work orders.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                        <Mail size={14} className="text-slate-400"/>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                        <Smartphone size={14} className="text-slate-400"/>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                        <CheckSquare size={20}/>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Approvals & Signatures</h4>
                        <p className="text-xs text-slate-500 mt-0.5">High-value POs, change orders, contracts.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                        <Mail size={14} className="text-slate-400"/>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                        <Smartphone size={14} className="text-slate-400"/>
                      </label>
                    </div>
                  </div>

                  <button className="mt-8 px-6 py-2.5 bg-[#021422] hover:bg-[#021422]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                    Save Preferences
                  </button>

                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
