'use client';

import React from 'react';
import { 
  User, Building, Camera, Save, MapPin, Briefcase, Mail, Phone
} from 'lucide-react';

interface ExecProfileSettingsProps {
  user?: any;
  orgSlug: string;
}

export default function ExecProfileSettings({ user, orgSlug }: ExecProfileSettingsProps) {
  const developerName = user?.company_name || 'Martins Construction Ltd';
  const execName = user?.full_name || 'Alhaji Martins';

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Profile Settings
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Company & Executive Identity</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-[#021422] hover:bg-[#021422]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
            <Save size={16}/> Save Changes
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-6">

        {/* Executive Profile Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-white/50">
            <User size={18} className="text-blue-600"/>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Executive Details</h3>
          </div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                    <User size={64} className="text-slate-300" />
                  </div>
                  <button className="absolute bottom-0 right-0 p-2.5 bg-[#021422] text-white rounded-full shadow-md hover:bg-[#021422]/90 transition-colors border-2 border-white">
                    <Camera size={16}/>
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-500 text-center">JPG, GIF or PNG. Max size 2MB</p>
              </div>

              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                      <input type="text" defaultValue={execName} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Job Title</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                      <input type="text" defaultValue="Chief Executive Officer" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                      <input type="email" defaultValue="executive@martins-const.com" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                      <input type="tel" defaultValue="+234 800 000 0000" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Profile Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-white/50">
            <Building size={18} className="text-blue-600"/>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Company Profile</h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Registered Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                  <input type="text" defaultValue={developerName} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Registration / RC Number</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                  <input type="text" defaultValue="RC-1234567" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Headquarters Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={16}/>
                  <textarea rows={3} defaultValue="15 Bourdillon Road, Ikoyi&#10;Lagos, Nigeria" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Company Logo (Used for Auto-Generated Reports)</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center">
                  <Building size={32} className="text-slate-300"/>
                </div>
                <button className="px-5 py-2.5 bg-white border border-gray-100 hover:bg-white text-slate-700 text-sm font-bold rounded-xl transition-colors shadow-sm">
                  Upload Logo
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
