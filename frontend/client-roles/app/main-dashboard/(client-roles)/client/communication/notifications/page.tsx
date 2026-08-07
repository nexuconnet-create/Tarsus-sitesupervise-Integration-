"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { 
  Bell, FileText, AlertCircle, MessageSquare, 
  CheckCircle2, Info, CheckCheck, Settings
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function NotificationsPage() {
    const org_slug = "";
  const project_slug = "";
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  const notifications = [
    {
      date: 'Today',
      items: [
        { id: 1, type: 'alert', title: 'Schedule Variance Alert', message: 'Foundation phase is currently 2 days behind schedule.', time: '10:30 AM', unread: true, icon: <AlertCircle size={20}/>, color: 'text-rose-600', bg: 'bg-rose-50' },
        { id: 2, type: 'doc', title: 'Document Required Approval', message: 'Change Order #016 needs your review and approval.', time: '09:15 AM', unread: true, icon: <FileText size={20}/>, color: 'text-amber-600', bg: 'bg-amber-50' },
      ]
    },
    {
      date: 'Yesterday',
      items: [
        { id: 3, type: 'message', title: 'New Message from PM', message: '"Material delivery confirmed for tomorrow..."', time: 'Yesterday, 4:00 PM', unread: false, icon: <MessageSquare size={20}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 4, type: 'success', title: 'Invoice Paid', title_suffix: 'INV-2026-004', message: 'Payment of ₦45,000,000 has been successfully processed.', time: 'Yesterday, 1:20 PM', unread: false, icon: <CheckCircle2 size={20}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      ]
    },
    {
      date: 'Last Week',
      items: [
        { id: 5, type: 'info', title: 'System Update', message: 'SiteSupervise was updated with new reporting features.', time: 'Jul 15, 2026', unread: false, icon: <Info size={20}/>, color: 'text-slate-600', bg: 'bg-slate-100' },
      ]
    }
  ];

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col overflow-hidden">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wider">
            <Bell className="text-rose-500" size={24} />
            Notifications
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">2 Unread</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm">
            <CheckCheck size={16} /> Mark All Read
          </button>
          <button className="p-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors shadow-sm">
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-6 mb-6 flex-1 w-full flex flex-col overflow-hidden gap-6">
        
        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
          <div className="space-y-8">
            {notifications.map((group, gIdx) => (
              <div key={gIdx} className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">{group.date}</h3>
                
                <div className="space-y-2">
                  {group.items.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        notification.unread 
                          ? 'bg-white border-blue-200 shadow-md hover:border-blue-300' 
                          : 'bg-white/60 border-slate-200 shadow-sm hover:bg-white hover:shadow-md'
                      } flex gap-4`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1 ${notification.bg} ${notification.color}`}>
                        {notification.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4 mb-1">
                          <h4 className={`text-base font-bold truncate ${notification.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notification.title}
                            {notification.title_suffix && <span className="ml-2 text-xs font-mono text-slate-400">{notification.title_suffix}</span>}
                          </h4>
                          <span className="text-xs font-bold text-slate-400 whitespace-nowrap shrink-0">{notification.time}</span>
                        </div>
                        <p className={`text-sm ${notification.unread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                          {notification.message}
                        </p>
                      </div>
                      
                      {notification.unread && (
                        <div className="shrink-0 flex items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
