'use client';

import React, { useState } from 'react';
import { 
  Shield, Key, Smartphone, Monitor, Clock, CheckCircle, MapPin
} from 'lucide-react';

export default function SecuritySettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans selection:bg-blue-100">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
            Security Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            Manage your password, authentication methods, and account access.
          </p>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-8 space-y-8">
        
        {/* Password Management */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key size={18} className="text-slate-500"/>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Change Password</h3>
            </div>
            <p className="text-[10px] font-bold text-slate-400">Last changed 3 months ago</p>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full sm:max-w-md bg-white border border-gray-100 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full sm:max-w-md bg-white border border-gray-100 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Password must be at least 8 characters and include a number and special character.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Confirm New Password</label>
              <input type="password" placeholder="••••••••" className="w-full sm:max-w-md bg-white border border-gray-100 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div className="pt-2">
              <button className="px-6 py-2.5 bg-[#021422] text-white text-sm font-bold rounded-lg hover:bg-[#021422]/90 transition-colors shadow-sm">
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-white flex items-center gap-2">
            <Smartphone size={18} className="text-slate-500"/>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Two-Factor Authentication (2FA)</h3>
          </div>
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-md">
              <h4 className="text-sm font-bold text-slate-800 mb-1">Protect your account with extra security</h4>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                When enabled, you'll be required to enter a security code sent to your phone or authentication app whenever you sign in from a new device.
              </p>
              {twoFactorEnabled && (
                <div className="flex items-center gap-1 mt-3 text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 w-max px-2.5 py-1 rounded-full border border-emerald-100">
                  <CheckCircle size={12}/> Enabled (Authenticator App)
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap ${
                twoFactorEnabled 
                  ? 'bg-white border border-gray-100 text-slate-600 hover:bg-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>
        </div>

        {/* Recent Login Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor size={18} className="text-slate-500"/>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Login Activity</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            
            <div className="p-5 flex items-start gap-4 hover:bg-white transition-colors">
              <div className="mt-1 text-blue-500"><Monitor size={20}/></div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-slate-800">MacBook Pro (macOS)</h4>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-max">Active Now</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={12}/> Lagos, Nigeria</span>
                  <span className="flex items-center gap-1"><Clock size={12}/> Today, 10:45 AM</span>
                  <span>IP: 197.210.64.12</span>
                </div>
              </div>
            </div>

            <div className="p-5 flex items-start gap-4 hover:bg-white transition-colors">
              <div className="mt-1 text-slate-400"><Smartphone size={20}/></div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-slate-800">iPhone 14 (iOS)</h4>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={12}/> Lagos, Nigeria</span>
                  <span className="flex items-center gap-1"><Clock size={12}/> Yesterday, 08:30 PM</span>
                  <span>IP: 197.210.64.12</span>
                </div>
              </div>
            </div>

          </div>
          <div className="p-4 border-t border-slate-100 bg-white text-center">
            <button className="text-xs font-bold text-red-600 hover:text-red-700">
              Sign out of all other devices
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
