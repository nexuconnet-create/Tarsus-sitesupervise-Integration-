/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { 
  Bell, Mail, Smartphone, AlertTriangle, ShieldCheck, 
  CheckCircle, MessageSquare, Clock, ArrowRight, ToggleLeft, ToggleRight
} from 'lucide-react';

interface AgencyNotificationsProps {
  user?: any;
  orgSlug: string;
}

export default function AgencyNotifications({ user, orgSlug }: AgencyNotificationsProps) {
  const [preferences, setPreferences] = useState<Record<string, { email: boolean; push: boolean; sms: boolean }>>({
    criticalViolations: { email: true, push: true, sms: true },
    stopWorkOrders: { email: true, push: true, sms: true },
    newApprovals: { email: true, push: false, sms: false },
    phaseSignoffs: { email: true, push: true, sms: false },
    inspectorMessages: { email: true, push: true, sms: false },
    weeklyDigest: { email: true, push: false, sms: false },
    licenseExpiry: { email: true, push: true, sms: true },
  });

  const togglePreference = (key: string, channel: 'email' | 'push' | 'sms') => {
    setPreferences(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [channel]: !prev[key][channel]
      }
    }));
  };

  const ToggleBtn = ({ checked, onClick }: { checked: boolean; onClick: () => void }) => (
    <button 
      onClick={onClick} 
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wide">
            Notification Preferences
          </h1>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-2 font-medium">
            <ShieldCheck size={12}/> Regulatory Alert Configuration
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-[#021422] hover:bg-[#021422]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
            Save Preferences
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Compliance Breaches */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-rose-50/50 flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><AlertTriangle size={20}/></div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Compliance Breaches</h2>
              <p className="text-xs text-slate-500">Alerts regarding immediate safety risks and regulatory violations.</p>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white transition-colors">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800">Critical Violations</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">Get notified instantly when a critical violation (e.g., structural failure risk, severe safety breach) is logged on any monitored site.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2"><Mail size={16} className="text-slate-400"/><ToggleBtn checked={preferences.criticalViolations.email} onClick={() => togglePreference('criticalViolations', 'email')} /></div>
                <div className="flex flex-col items-center gap-2"><Smartphone size={16} className="text-slate-400"/><ToggleBtn checked={preferences.criticalViolations.push} onClick={() => togglePreference('criticalViolations', 'push')} /></div>
                <div className="flex flex-col items-center gap-2"><MessageSquare size={16} className="text-slate-400"/><ToggleBtn checked={preferences.criticalViolations.sms} onClick={() => togglePreference('criticalViolations', 'sms')} /></div>
              </div>
            </div>

            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white transition-colors">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800">Stop-Work Order Updates</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">Alerts when a stop-work order is issued, updated, or lifted by authorized inspectors.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2"><Mail size={16} className="text-slate-400"/><ToggleBtn checked={preferences.stopWorkOrders.email} onClick={() => togglePreference('stopWorkOrders', 'email')} /></div>
                <div className="flex flex-col items-center gap-2"><Smartphone size={16} className="text-slate-400"/><ToggleBtn checked={preferences.stopWorkOrders.push} onClick={() => togglePreference('stopWorkOrders', 'push')} /></div>
                <div className="flex flex-col items-center gap-2"><MessageSquare size={16} className="text-slate-400"/><ToggleBtn checked={preferences.stopWorkOrders.sms} onClick={() => togglePreference('stopWorkOrders', 'sms')} /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Approvals & Workflows */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-blue-50/50 flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><CheckCircle size={20}/></div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Approvals & Sign-offs</h2>
              <p className="text-xs text-slate-500">Notifications for documents, plans, and construction phase approvals.</p>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white transition-colors">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800">New Plan Submissions</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">Alerts when developers submit new architectural or structural plans for agency review.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2"><Mail size={16} className="text-slate-400"/><ToggleBtn checked={preferences.newApprovals.email} onClick={() => togglePreference('newApprovals', 'email')} /></div>
                <div className="flex flex-col items-center gap-2"><Smartphone size={16} className="text-slate-400"/><ToggleBtn checked={preferences.newApprovals.push} onClick={() => togglePreference('newApprovals', 'push')} /></div>
                <div className="flex flex-col items-center gap-2"><MessageSquare size={16} className="text-slate-400"/><ToggleBtn checked={preferences.newApprovals.sms} onClick={() => togglePreference('newApprovals', 'sms')} /></div>
              </div>
            </div>

            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white transition-colors">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800">Phase Sign-off Requests</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">Notifications when a site manager requests an inspection for a critical construction phase completion.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2"><Mail size={16} className="text-slate-400"/><ToggleBtn checked={preferences.phaseSignoffs.email} onClick={() => togglePreference('phaseSignoffs', 'email')} /></div>
                <div className="flex flex-col items-center gap-2"><Smartphone size={16} className="text-slate-400"/><ToggleBtn checked={preferences.phaseSignoffs.push} onClick={() => togglePreference('phaseSignoffs', 'push')} /></div>
                <div className="flex flex-col items-center gap-2"><MessageSquare size={16} className="text-slate-400"/><ToggleBtn checked={preferences.phaseSignoffs.sms} onClick={() => togglePreference('phaseSignoffs', 'sms')} /></div>
              </div>
            </div>
          </div>
        </div>

        {/* System & Administrative Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-white flex items-center gap-3">
            <div className="p-2 bg-slate-200 text-slate-600 rounded-lg"><Clock size={20}/></div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Administrative Alerts</h2>
              <p className="text-xs text-slate-500">System digests, reports, and administrative warnings.</p>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white transition-colors">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800">Weekly Agency Digest</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">A weekly summary email of all active violations, completed inspections, and overall compliance rates.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2"><Mail size={16} className="text-slate-400"/><ToggleBtn checked={preferences.weeklyDigest.email} onClick={() => togglePreference('weeklyDigest', 'email')} /></div>
                <div className="flex flex-col items-center gap-2"><Smartphone size={16} className="text-slate-400"/><ToggleBtn checked={preferences.weeklyDigest.push} onClick={() => togglePreference('weeklyDigest', 'push')} /></div>
                <div className="flex flex-col items-center gap-2 opacity-50 cursor-not-allowed" title="SMS not available for digests"><MessageSquare size={16} className="text-slate-300"/><ToggleBtn checked={false} onClick={() => {}} /></div>
              </div>
            </div>

            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white transition-colors">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800">Developer License Expiry</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">Notifications when a monitored developer's operational license or specific project permit is about to expire.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2"><Mail size={16} className="text-slate-400"/><ToggleBtn checked={preferences.licenseExpiry.email} onClick={() => togglePreference('licenseExpiry', 'email')} /></div>
                <div className="flex flex-col items-center gap-2"><Smartphone size={16} className="text-slate-400"/><ToggleBtn checked={preferences.licenseExpiry.push} onClick={() => togglePreference('licenseExpiry', 'push')} /></div>
                <div className="flex flex-col items-center gap-2"><MessageSquare size={16} className="text-slate-400"/><ToggleBtn checked={preferences.licenseExpiry.sms} onClick={() => togglePreference('licenseExpiry', 'sms')} /></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
