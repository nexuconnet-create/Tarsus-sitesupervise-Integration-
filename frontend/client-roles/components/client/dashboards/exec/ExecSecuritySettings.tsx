'use client';

import React from 'react';
import { 
  ShieldCheck, Smartphone, Monitor, History, Lock, Key, LogOut, CheckCircle, AlertTriangle
} from 'lucide-react';

interface ExecSecuritySettingsProps {
  user?: any;
  orgSlug: string;
}

export default function ExecSecuritySettings({ user, orgSlug }: ExecSecuritySettingsProps) {
  const developerName = user?.company_name || 'Martins Construction Ltd';

  const activeSessions = [
    { id: 1, device: 'MacBook Pro 16"', browser: 'Chrome on macOS', location: 'Lagos, Nigeria', ip: '197.210.64.12', current: true },
    { id: 2, device: 'iPhone 15 Pro Max', browser: 'Safari on iOS', location: 'Lagos, Nigeria', ip: '197.210.64.45', current: false },
    { id: 3, device: 'Windows Desktop', browser: 'Edge on Windows 11', location: 'Abuja, Nigeria', ip: '102.89.34.11', current: false },
  ];

  const accessLogs = [
    { id: 101, event: 'Successful Login', date: 'Today, 08:45 AM', location: 'Lagos, Nigeria (MacBook Pro)' },
    { id: 102, event: 'Password Changed', date: 'Oct 12, 2026, 14:30 PM', location: 'Lagos, Nigeria (MacBook Pro)' },
    { id: 103, event: 'Failed Login Attempt', date: 'Oct 10, 2026, 23:15 PM', location: 'London, UK (Unknown Device)' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Account Security
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Access Management & Audit</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Authentication & 2FA */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                <Lock size={18} className="text-emerald-600"/> Authentication
              </h3>
            </div>
            <div className="p-6 flex-1 space-y-6">
              
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">Password</h4>
                <p className="text-xs text-slate-500 mb-4">Last changed 14 days ago.</p>
                <button className="px-5 py-2.5 bg-white border border-gray-100 hover:bg-white text-slate-700 text-sm font-bold rounded-xl transition-colors shadow-sm w-full flex justify-center items-center gap-2">
                  <Key size={16}/> Update Password
                </button>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
                      Two-Factor Authentication
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase tracking-wider">Enabled</span>
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs">We will ask for a verification code via your authenticator app when you sign in from a new device.</p>
                  </div>
                </div>
                <button className="mt-4 px-5 py-2.5 bg-white border border-gray-100 hover:bg-white text-rose-600 hover:text-rose-700 hover:border-rose-200 text-sm font-bold rounded-xl transition-colors shadow-sm w-full flex justify-center items-center gap-2">
                  Disable 2FA
                </button>
              </div>

            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                <Monitor size={18} className="text-blue-600"/> Active Sessions
              </h3>
              <button className="text-xs font-bold text-rose-600 hover:text-rose-700">Revoke All</button>
            </div>
            <div className="p-6 flex-1">
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="flex items-start justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex gap-3">
                      <div className="mt-1 text-slate-400">
                        {session.device.includes('iPhone') ? <Smartphone size={20}/> : <Monitor size={20}/>}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          {session.device} 
                          {session.current && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">This Device</span>}
                        </h4>
                        <p className="text-xs text-slate-500">{session.browser}</p>
                        <p className="text-xs text-slate-400 mt-1">{session.location} &bull; {session.ip}</p>
                      </div>
                    </div>
                    {!session.current && (
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Revoke Session">
                        <LogOut size={16}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Access Audit Log */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
              <History size={18} className="text-purple-600"/> Recent Access Audit Log
            </h3>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Download Full Log</button>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {accessLogs.map((log, idx) => (
                <div key={log.id} className="flex gap-4 relative">
                  {idx !== accessLogs.length - 1 && (
                    <div className="absolute top-8 left-2.5 bottom-[-24px] w-px bg-slate-200"></div>
                  )}
                  <div className="shrink-0 mt-0.5 relative z-10 bg-white">
                    {log.event.includes('Successful') && <CheckCircle size={20} className="text-emerald-500"/>}
                    {log.event.includes('Changed') && <Key size={20} className="text-blue-500"/>}
                    {log.event.includes('Failed') && <AlertTriangle size={20} className="text-rose-500"/>}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{log.event}</h4>
                    <p className="text-xs font-semibold text-slate-500 mt-1">{log.date}</p>
                    <p className="text-xs text-slate-400 mt-1">{log.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
