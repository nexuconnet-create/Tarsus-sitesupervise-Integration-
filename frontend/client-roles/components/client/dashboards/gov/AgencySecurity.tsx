/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, Key, Lock, Smartphone, Monitor, 
  History, Download, AlertTriangle, Fingerprint
} from 'lucide-react';

interface AgencySecurityProps {
  user?: any;
  orgSlug: string;
}

export default function AgencySecurity({ user, orgSlug }: AgencySecurityProps) {
  const agencyName = user?.agency_name || 'Lagos State Building Control Agency';
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wide">
            Security & Access
          </h1>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-2 font-medium">
            <ShieldCheck size={12}/> Regulatory Access Control
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Banner Alert for Agencies */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0 mt-0.5">
            <ShieldCheck size={16}/>
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-900">Enterprise Security Active</h3>
            <p className="text-xs text-emerald-700 mt-1">This account is protected by mandatory Two-Factor Authentication (2FA) and is subject to state-level compliance auditing. All access logs are recorded.</p>
          </div>
        </div>

        {/* Password & Authentication */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Key size={20}/></div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Authentication Credentials</h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage your password and secondary security measures.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-xl bg-white">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Lock size={14} className="text-slate-400"/> Account Password</h3>
                <p className="text-xs text-slate-500 mt-1">Last changed 45 days ago (Expires in 45 days)</p>
              </div>
              <button className="px-4 py-2 bg-white border border-gray-100 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-lg transition-colors">
                Change Password
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-xl bg-white">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Smartphone size={14} className="text-slate-400"/> Two-Factor Authentication (2FA)</h3>
                <p className="text-xs text-slate-500 mt-1">Mandatory for all Government Agency personnel.</p>
              </div>
              <button 
                onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${is2FAEnabled ? 'bg-emerald-500' : 'bg-slate-200'} opacity-50 cursor-not-allowed`}
                title="Contact IT Admin to modify"
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${is2FAEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Active Sessions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-slate-800 font-bold uppercase tracking-wider text-sm">
                <Monitor size={16} className="text-blue-600"/> Active Sessions
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-start gap-3 p-3 border border-emerald-100 bg-emerald-50/30 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm shrink-0"><Monitor size={16} className="text-emerald-600"/></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-slate-800">MacBook Pro</h4>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Current</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Lagos, Nigeria • 192.168.1.45</p>
                  <p className="text-[10px] text-slate-400 mt-1">Active right now</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border border-slate-100 hover:bg-white rounded-xl transition-colors">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0"><Smartphone size={16} className="text-slate-400"/></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-slate-800">iPhone 14 Pro</h4>
                    <button className="text-xs font-bold text-rose-600 hover:text-rose-800">Revoke</button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Ikeja, Nigeria • 105.112.98.11</p>
                  <p className="text-[10px] text-slate-400 mt-1">Last active: 2 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Regulatory Audit Log */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-slate-800 font-bold uppercase tracking-wider text-sm">
                <Fingerprint size={16} className="text-purple-600"/> Audit Log Snapshot
              </div>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Download size={12}/> Export
              </button>
            </div>

            <div className="flex-1">
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 pb-2">
                
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  </div>
                  <p className="text-xs font-bold text-slate-800">Exported Regulatory Archive Data</p>
                  <p className="text-[10px] text-slate-500 mt-1">Today, 2:45 PM • Engr. Olatunji Femi</p>
                </div>
                
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-rose-100 border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                  </div>
                  <p className="text-xs font-bold text-slate-800">Issued Stop-Work Order</p>
                  <p className="text-[10px] text-slate-500 mt-1">Yesterday, 10:30 AM • System (Auto)</p>
                  <p className="text-[10px] font-bold text-rose-600 mt-1">Project: Eko Atlantic Tower 5</p>
                </div>
                
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  </div>
                  <p className="text-xs font-bold text-slate-800">New Device Login Detected</p>
                  <p className="text-[10px] text-slate-500 mt-1">Oct 24, 8:15 AM • iPhone 14 Pro</p>
                </div>
                
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-gray-100">
              View Full Audit Log
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
