"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Settings, User, Save, 
  Download, Edit2, CheckCircle2, X
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function ProfileSettingsPage() {
    const org_slug = "";
  const project_slug = "";
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  const [profile, setProfile] = useState({
    name: 'John Olu',
    email: 'j.olu@example.com',
    phone: '0803 123 4567',
    company: 'Olu Investments Ltd',
    role: 'Client / Project Owner'
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const renderField = (key: keyof typeof profile, label: string, isEditable: boolean = true) => {
    const isEditing = editingField === key;
    return (
      <div className={`flex items-center justify-between group border-b border-slate-100 pb-4 ${!isEditable ? 'md:col-span-2' : ''}`}>
        <div className="w-full mr-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
          {isEditing ? (
            <input 
              autoFocus
              type="text" 
              className="w-full border border-blue-300 rounded-lg px-3 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={profile[key]} 
              onChange={(e) => setProfile({...profile, [key]: e.target.value})}
              onBlur={() => setEditingField(null)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
            />
          ) : (
            <p className="font-medium text-slate-800 text-lg">{profile[key]}</p>
          )}
        </div>
        {isEditable && !isEditing && (
          <button onClick={() => setEditingField(key)} className="text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
            <Edit2 size={18}/>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wider">
            <Settings className="text-blue-500" size={24} />
            Client Settings <span className="text-slate-300 font-light mx-2">|</span> <span className="text-lg font-semibold text-slate-600 normal-case">Profile</span>
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{profile.name}</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium">Last Login: Today 14:30</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-slate-500">{projectName}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm">
            <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 mt-8 mb-12 flex-1 w-full flex flex-col overflow-y-auto custom-scrollbar gap-8 pb-12">
        
        {/* PROFILE SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <User size={18} className="text-blue-500" /> Profile Information
            </h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              
              {renderField('name', 'Full Name')}
              {renderField('email', 'Email Address')}
              {renderField('phone', 'Phone Number')}
              {renderField('company', 'Company')}
              {renderField('role', 'Role / Permissions', false)}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-4 mt-2">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-rose-600 rounded-xl text-sm font-bold transition-colors">
            Cancel Changes
          </button>
          <button onClick={() => showToast('Profile changes saved successfully!')} className="px-5 py-2.5 bg-[#021422] text-white hover:bg-[#03437a] rounded-xl text-sm font-bold transition-colors shadow-md flex items-center gap-2">
            <Save size={16} /> Save Profile
          </button>
        </div>

      </div>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
