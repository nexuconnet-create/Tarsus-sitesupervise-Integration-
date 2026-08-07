'use client';

import React, { useState } from 'react';
import { 
  Bell, Mail, Smartphone, Monitor, Save, Activity, 
  DollarSign, FileText, Calendar 
} from 'lucide-react';

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
  >
    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${checked ? 'left-6' : 'left-1'}`}></div>
  </button>
);

export default function NotificationPreferencesPage() {
  
  const [prefs, setPrefs] = useState({
    financial: { email: true, sms: true, push: true },
    progress: { email: true, sms: false, push: true },
    documents: { email: true, sms: false, push: false },
    meetings: { email: true, sms: true, push: true },
    digest: true
  });

  const togglePref = (category: keyof typeof prefs, channel?: 'email'|'sms'|'push') => {
    setPrefs(prev => {
      if (category === 'digest') {
        return { ...prev, digest: !prev.digest };
      }
      if (channel && typeof prev[category] === 'object') {
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [channel]: !prev[category][channel]
          }
        };
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans selection:bg-blue-100">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
            Notification Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            Control how and when you receive updates about your property.
          </p>
        </div>
        <div>
          <button className="flex items-center gap-2 px-6 py-2 bg-[#021422] text-white text-sm font-bold rounded-lg hover:bg-[#021422]/90 transition-colors shadow-sm">
            <Save size={16}/> Save Preferences
          </button>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-8 space-y-6">
        
        {/* Global Summary/Digest */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-md p-6 text-white flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold mb-1">Weekly Project Digest</h3>
            <p className="text-sm font-medium text-blue-100 max-w-md">Get a comprehensive email every Friday summarizing all progress, new photos, and financial updates for the week.</p>
          </div>
          <div>
            <Toggle checked={prefs.digest} onChange={() => togglePref('digest')} />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
            <div className="col-span-6 text-left pl-2">Notification Category</div>
            <div className="col-span-2 flex flex-col items-center gap-1"><Mail size={14}/> Email</div>
            <div className="col-span-2 flex flex-col items-center gap-1"><Smartphone size={14}/> SMS</div>
            <div className="col-span-2 flex flex-col items-center gap-1"><Monitor size={14}/> Push</div>
          </div>

          <div className="divide-y divide-slate-100">
            
            {/* Financial Updates */}
            <div className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-white transition-colors">
              <div className="col-span-12 sm:col-span-6 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <DollarSign size={16}/>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Financial & Payments</h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Invoices, payment confirmations, and overdue reminders.</p>
                </div>
              </div>
              <div className="col-span-4 sm:col-span-2 flex justify-center mt-4 sm:mt-0">
                <Toggle checked={prefs.financial.email} onChange={() => togglePref('financial', 'email')} />
              </div>
              <div className="col-span-4 sm:col-span-2 flex justify-center mt-4 sm:mt-0">
                <Toggle checked={prefs.financial.sms} onChange={() => togglePref('financial', 'sms')} />
              </div>
              <div className="col-span-4 sm:col-span-2 flex justify-center mt-4 sm:mt-0">
                <Toggle checked={prefs.financial.push} onChange={() => togglePref('financial', 'push')} />
              </div>
            </div>

            {/* Construction Progress */}
            <div className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-white transition-colors">
              <div className="col-span-12 sm:col-span-6 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Activity size={16}/>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Construction Progress</h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Milestone completions, phase updates, and new site photos.</p>
                </div>
              </div>
              <div className="col-span-4 sm:col-span-2 flex justify-center mt-4 sm:mt-0">
                <Toggle checked={prefs.progress.email} onChange={() => togglePref('progress', 'email')} />
              </div>
              <div className="col-span-4 sm:col-span-2 flex justify-center mt-4 sm:mt-0">
                <Toggle checked={prefs.progress.sms} onChange={() => togglePref('progress', 'sms')} />
              </div>
              <div className="col-span-4 sm:col-span-2 flex justify-center mt-4 sm:mt-0">
                <Toggle checked={prefs.progress.push} onChange={() => togglePref('progress', 'push')} />
              </div>
            </div>

            {/* Document Uploads */}
            <div className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-white transition-colors">
              <div className="col-span-12 sm:col-span-6 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <FileText size={16}/>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Document Uploads</h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Alerts when new reports, contracts, or tax documents are added.</p>
                </div>
              </div>
              <div className="col-span-4 sm:col-span-2 flex justify-center mt-4 sm:mt-0">
                <Toggle checked={prefs.documents.email} onChange={() => togglePref('documents', 'email')} />
              </div>
              <div className="col-span-4 sm:col-span-2 flex justify-center mt-4 sm:mt-0">
                <Toggle checked={prefs.documents.sms} onChange={() => togglePref('documents', 'sms')} />
              </div>
              <div className="col-span-4 sm:col-span-2 flex justify-center mt-4 sm:mt-0">
                <Toggle checked={prefs.documents.push} onChange={() => togglePref('documents', 'push')} />
              </div>
            </div>

            {/* Meetings & Visits */}
            <div className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-white transition-colors">
              <div className="col-span-12 sm:col-span-6 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Calendar size={16}/>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Meetings & Site Visits</h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Scheduling confirmations, reminders, and updates.</p>
                </div>
              </div>
              <div className="col-span-4 sm:col-span-2 flex justify-center mt-4 sm:mt-0">
                <Toggle checked={prefs.meetings.email} onChange={() => togglePref('meetings', 'email')} />
              </div>
              <div className="col-span-4 sm:col-span-2 flex justify-center mt-4 sm:mt-0">
                <Toggle checked={prefs.meetings.sms} onChange={() => togglePref('meetings', 'sms')} />
              </div>
              <div className="col-span-4 sm:col-span-2 flex justify-center mt-4 sm:mt-0">
                <Toggle checked={prefs.meetings.push} onChange={() => togglePref('meetings', 'push')} />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
