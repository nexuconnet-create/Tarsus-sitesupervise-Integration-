'use client';

import React from 'react';
import { 
  User, MapPin, Camera, Save, Shield, CreditCard
} from 'lucide-react';

export default function ProfileSettingsPage() {
  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans selection:bg-blue-100">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
            My Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            Manage your personal information and account details.
          </p>
        </div>
        <div>
          <button className="flex items-center gap-2 px-6 py-2 bg-[#021422] text-white text-sm font-bold rounded-lg hover:bg-[#021422]/90 transition-colors shadow-sm">
            <Save size={16}/> Save Changes
          </button>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-8 space-y-8">
        
        {/* Profile Picture */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150" 
                alt="Profile" 
                className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white drop-shadow-md" size={24} />
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold text-slate-800">John Olu</h2>
            <p className="text-sm text-slate-500 mb-3">Property Owner</p>
            <div className="flex gap-2 justify-center sm:justify-start">
              <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                Change Photo
              </button>
              <button className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-white flex items-center gap-2">
            <User size={18} className="text-slate-500"/>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Personal Information</h3>
          </div>
          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">First Name</label>
              <input type="text" defaultValue="John" className="w-full bg-white border border-gray-100 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Last Name</label>
              <input type="text" defaultValue="Olu" className="w-full bg-white border border-gray-100 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" defaultValue="john.olu@example.com" className="w-full bg-white border border-gray-100 rounded-lg p-2.5 text-sm font-medium text-slate-500 cursor-not-allowed" disabled />
              <p className="text-[10px] text-slate-400 mt-1">To change your email, please contact support.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
              <input type="tel" defaultValue="+234 801 234 5678" className="w-full bg-white border border-gray-100 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Language</label>
              <select className="w-full bg-white border border-gray-100 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-white flex items-center gap-2">
            <Shield size={18} className="text-amber-500"/>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Emergency Contact</h3>
          </div>
          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Contact Name</label>
              <input type="text" placeholder="e.g. Jane Doe" className="w-full bg-white border border-gray-100 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Relationship</label>
              <input type="text" placeholder="e.g. Spouse" className="w-full bg-white border border-gray-100 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Contact Phone Number</label>
              <input type="tel" placeholder="+234 XXX XXX XXXX" className="w-full bg-white border border-gray-100 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
          </div>
        </div>

        {/* Linked Properties (Read Only) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-white flex items-center gap-2">
            <MapPin size={18} className="text-indigo-500"/>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Linked Properties</h3>
          </div>
          <div className="p-6 sm:p-8">
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Lagos 12-Storey Mixed-Use Development</h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Unit 12B (Penthouse Level)</p>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 text-center">To link a new property to your account, please contact your sales representative.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
