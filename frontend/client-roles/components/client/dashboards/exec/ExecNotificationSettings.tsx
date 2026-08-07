'use client';

import React from 'react';
import { 
  Bell, Save, Mail, Smartphone, AlertTriangle, Briefcase, FileSpreadsheet, Activity
} from 'lucide-react';

interface ExecNotificationSettingsProps {
  user?: any;
  orgSlug: string;
}

export default function ExecNotificationSettings({ user, orgSlug }: ExecNotificationSettingsProps) {
  const developerName = user?.company_name || 'Martins Construction Ltd';

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Notification Preferences
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Alerts & Digests</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-[#021422] hover:bg-[#021422]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
            <Save size={16}/> Save Preferences
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-6">

        {/* Global Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Global Settings</h3>
          </div>
          <div className="p-6 md:p-8 space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-800">Executive Summary Digest</h4>
                <p className="text-sm text-slate-500 max-w-lg mt-1">Receive a compiled summary of all project statuses, financial health, and active incidents across your entire portfolio.</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                <button className="px-4 py-2 text-sm font-bold bg-white text-blue-600 shadow-sm rounded-lg">Daily</button>
                <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Weekly</button>
                <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Disabled</button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">Do Not Disturb</h4>
                <p className="text-sm text-slate-500 max-w-lg mt-1">Pause all non-critical notifications during these hours. Critical safety incidents will still bypass this setting.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input type="time" defaultValue="22:00" className="px-3 py-2 bg-white border border-gray-100 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                <span className="text-slate-400 font-bold">to</span>
                <input type="time" defaultValue="07:00" className="px-3 py-2 bg-white border border-gray-100 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>

          </div>
        </div>

        {/* Granular Triggers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Alert Triggers</h3>
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Mail size={14}/> Email</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Smartphone size={14}/> SMS</span>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100">
            
            {/* Row 1 */}
            <div className="p-6 md:p-8 flex items-center justify-between hover:bg-white transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-1">
                  <AlertTriangle size={20}/>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Critical Safety & Incidents</h4>
                  <p className="text-xs text-slate-500 max-w-md mt-1">Immediate alerts for stop-work orders, severe weather, or major on-site accidents.</p>
                </div>
              </div>
              <div className="flex items-center gap-8 pl-4">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
              </div>
            </div>

            {/* Row 2 */}
            <div className="p-6 md:p-8 flex items-center justify-between hover:bg-white transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-1">
                  <FileSpreadsheet size={20}/>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Financial Anomalies</h4>
                  <p className="text-xs text-slate-500 max-w-md mt-1">Alerts when a project's budget variance exceeds 10% or high-value POs require signature.</p>
                </div>
              </div>
              <div className="flex items-center gap-8 pl-4">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
              </div>
            </div>

            {/* Row 3 */}
            <div className="p-6 md:p-8 flex items-center justify-between hover:bg-white transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                  <Briefcase size={20}/>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Vendor Management</h4>
                  <p className="text-xs text-slate-500 max-w-md mt-1">Notifications regarding contractor onboarding, expiring insurance, or compliance failure.</p>
                </div>
              </div>
              <div className="flex items-center gap-8 pl-4">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
              </div>
            </div>

            {/* Row 4 */}
            <div className="p-6 md:p-8 flex items-center justify-between hover:bg-white transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                  <Activity size={20}/>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Timeline Milestones</h4>
                  <p className="text-xs text-slate-500 max-w-md mt-1">Updates when major project phases (e.g., Substructure, Topping Out) are completed.</p>
                </div>
              </div>
              <div className="flex items-center gap-8 pl-4">
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
