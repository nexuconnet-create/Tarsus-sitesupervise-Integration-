"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { 
  Settings, Shield, ShieldCheck, 
  RotateCcw, Smartphone, Check, Lock, List
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function SecuritySettingsPage() {
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wider">
            Client Settings <span className="text-slate-300 font-light mx-2">|</span> <span className="text-lg font-semibold text-slate-600 normal-case">Security & Access</span>
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">John Olu</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-slate-500">{projectName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 mt-8 mb-12 flex-1 w-full flex flex-col overflow-y-auto custom-scrollbar gap-8 pb-12">
        
        {/* SECURITY & ACCESS SECTION */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-white/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Shield size={18} className="text-emerald-500" /> Account Security
            </h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-xl flex items-start gap-5">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-800 mb-1 flex items-center gap-2">Two-Factor Auth <Check size={18} /></h3>
                  <p className="text-sm font-medium text-emerald-700/70 mb-4">Your account is highly secure. 2FA is currently enabled via SMS and Authenticator App.</p>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors">
                    Manage 2FA
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-6 rounded-xl flex items-start gap-5">
                <div className="p-3 bg-white border border-gray-100 text-slate-600 rounded-xl shrink-0">
                  <Lock size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Password</h3>
                  <p className="text-sm font-medium text-slate-500 mb-4">Last changed 45 days ago. We recommend changing it every 90 days.</p>
                  <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-bold shadow-sm transition-colors">
                    Change Password
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-slate-100 pt-6">
                <div className="p-3 bg-white text-slate-600 border border-gray-100 rounded-xl shrink-0">
                  <RotateCcw size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Session Timeout</p>
                  <p className="font-bold text-slate-800 text-lg mb-2">30 minutes</p>
                  <select defaultValue="30 minutes" className="bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 outline-none">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>Never</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-slate-100 pt-6">
                <div className="p-3 bg-white text-slate-600 border border-gray-100 rounded-xl shrink-0">
                  <Smartphone size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Approved Devices</p>
                  <p className="font-bold text-slate-800 text-lg mb-2">2 Devices</p>
                  <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">View & Manage Devices</button>
                </div>
              </div>

            </div>
          </div>
          
          <div className="border-t border-gray-100">
            <div className="p-5 bg-white/50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <List size={18} className="text-slate-400" /> Recent Activity & Audit
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Login</p>
                <p className="font-bold text-slate-800">Today 14:30</p>
                <p className="text-xs text-slate-500 mt-1">MacBook Pro &bull; Lagos, NG</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Blocked IPs</p>
                <p className="font-bold text-slate-800">0 IPs</p>
                <p className="text-xs text-slate-500 mt-1">No recent security threats</p>
              </div>
              <div className="bg-white border border-blue-200 rounded-xl p-4 flex flex-col justify-center items-start bg-blue-50/30">
                <h3 className="font-bold text-blue-900 mb-2">Full Audit Log</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors">
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
