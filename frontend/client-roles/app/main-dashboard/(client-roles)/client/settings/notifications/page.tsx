"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Settings, Bell, Save, Check
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function NotificationsSettingsPage() {
    const org_slug = "";
  const project_slug = "";
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  // Toggle states
  const [emailNotify, setEmailNotify] = useState(true);
  const [pushNotify, setPushNotify] = useState(true);
  const [inAppNotify, setInAppNotify] = useState(true);
  
  const [notifPreferences, setNotifPreferences] = useState({
    projectUpdates: true,
    milestones: true,
    documents: true,
    schedule: true,
    budget: false,
    reports: true,
    meetings: true,
    alerts: true,
  });

  const togglePref = (key: keyof typeof notifPreferences) => {
    setNotifPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wider">
            <Settings className="text-amber-500" size={24} />
            Client Settings <span className="text-slate-300 font-light mx-2">|</span> <span className="text-lg font-semibold text-slate-600 normal-case">Notifications</span>
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">John Olu</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-slate-500">{projectName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 mt-8 mb-12 flex-1 w-full flex flex-col overflow-y-auto custom-scrollbar gap-8 pb-12">
        
        {/* NOTIFICATION PREFERENCES SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Bell size={18} className="text-amber-500" /> Notification Channels & Triggers
            </h2>
          </div>
          <div className="p-8 space-y-10">
            
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Global Channels</h3>
              <div className="flex flex-wrap gap-4 md:gap-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-slate-300" checked={emailNotify} onChange={() => setEmailNotify(!emailNotify)} />
                  <span className="text-base font-bold text-slate-700">Email Notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-slate-300" checked={pushNotify} onChange={() => setPushNotify(!pushNotify)} />
                  <span className="text-base font-bold text-slate-700">Push Notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-slate-300" checked={inAppNotify} onChange={() => setInAppNotify(!inAppNotify)} />
                  <span className="text-base font-bold text-slate-700">In-App Alerts</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Notify me for:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {[
                  { id: 'projectUpdates', label: 'Project Updates', desc: 'General news and team announcements' },
                  { id: 'milestones', label: 'Milestone Achievements', desc: 'When key project phases are completed' },
                  { id: 'documents', label: 'Document Uploads', desc: 'New drawings, reports, or contracts' },
                  { id: 'schedule', label: 'Schedule Changes', desc: 'Any delays or timeline adjustments' },
                  { id: 'budget', label: 'Budget Changes', desc: 'Invoices, payments, and variations' },
                  { id: 'reports', label: 'Progress Reports', desc: 'Daily logs and weekly summaries' },
                  { id: 'meetings', label: 'Meeting Invites', desc: 'Calendar events and virtual rooms' },
                  { id: 'alerts', label: 'Critical Alerts', desc: 'Safety hazards and severe weather' },
                ].map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => togglePref(item.id as keyof typeof notifPreferences)}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    notifPreferences[item.id as keyof typeof notifPreferences] 
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      notifPreferences[item.id as keyof typeof notifPreferences] ? 'bg-blue-600 text-white' : 'bg-slate-100 border border-slate-300 text-transparent'
                    }`}>
                      <Check size={16} />
                    </div>
                    <div>
                      <span className={`block text-sm font-bold mb-1 ${notifPreferences[item.id as keyof typeof notifPreferences] ? 'text-blue-900' : 'text-slate-700'}`}>
                        {item.label}
                      </span>
                      <span className="block text-xs font-medium text-slate-500 leading-snug">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-4 mt-2">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-rose-600 rounded-xl text-sm font-bold transition-colors">
            Reset to Defaults
          </button>
          <button className="px-5 py-2.5 bg-[#021422] text-white hover:bg-[#03437a] rounded-xl text-sm font-bold transition-colors shadow-md flex items-center gap-2">
            <Save size={16} /> Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
}
