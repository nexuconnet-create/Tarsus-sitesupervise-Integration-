"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Users, Search, Filter, MessageSquare, Phone, 
  Mail, Building2, Star, MoreVertical, ShieldCheck, 
  UserPlus, X, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function TeamDirectoryPage() {
    const org_slug = "";
  const project_slug = "";
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const teamMembers = [
    { id: 1, name: 'Engr. Adebayo', role: 'Project Manager', email: 'a.martins@example.com', status: 'Active' },
    { id: 2, name: 'Engr. Kamal', role: 'Site Supervisor', email: 'a.kamal@example.com', status: 'Active' },
    { id: 3, name: 'Ahmed Yakubu', role: 'Site Foreman', email: 'a.yakubu@example.com', status: 'Inactive' },
    { id: 4, name: 'Engr. Ola Adeyemi', role: 'Architect', email: 'o.adeyemi@example.com', status: 'Active' },
    { id: 5, name: 'Chief Ademola', role: 'Project Owner', email: 'c.ademola@example.com', status: 'Active' },
  ];

  const vendorContacts = [
    { id: 1, vendor: 'First Materials Ltd', contactPerson: 'Adeyemi B.', phone: '0803 123 4567', email: 'adeyemi@fm.com', rating: 4.8 },
    { id: 2, vendor: 'SteelCo Nigeria', contactPerson: 'Chidi O.', phone: '0805 789 0123', email: 'chidi@steelco.com', rating: 4.6 },
    { id: 3, vendor: 'PilingPro Ltd', contactPerson: 'Musa K.', phone: '0807 345 6789', email: 'musa@pilingpro.com', rating: 4.2 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wider">
            <Users className="text-blue-500" size={24} />
            Team Directory
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium">Total: 28 Members</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active: 24</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Online: 8</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setIsAddMemberModalOpen(true)} className="px-4 py-2 bg-[#021422] text-white hover:bg-[#03437a] rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-md">
            <UserPlus size={16} /> Add Member
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-6 mb-6 flex-1 w-full flex flex-col overflow-y-auto custom-scrollbar gap-8 pb-12">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, role, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm shrink-0 cursor-pointer hover:bg-slate-50 transition-colors">
            <Filter size={18} className="text-slate-400" />
            <select className="bg-transparent outline-none cursor-pointer w-full pr-4 appearance-none font-medium">
              <option>Filters: All Roles</option>
              <option>Management</option>
              <option>Engineering</option>
              <option>Vendors</option>
            </select>
          </div>
        </div>

        {/* TEAM LIST */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" /> Team List
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6 w-16">#</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Contact (Email)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {teamMembers.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 pl-6 font-medium text-slate-400">{idx + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#021422] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <span className="font-bold text-slate-800">{member.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{member.role}</td>
                    <td className="p-4 text-slate-500">{member.email}</td>
                    <td className="p-4">
                      {member.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link href={`/main-dashboard/client/communication/messages`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Message">
                          <MessageSquare size={14} />
                        </Link>
                        <Link href={`/main-dashboard/client/communication/messages`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Call">
                          <Phone size={14} />
                        </Link>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" title="Email">
                          <Mail size={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors ml-2" title="More">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* VENDOR CONTACTS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-2">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={18} className="text-indigo-500" /> Vendor Contacts
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6 w-16">#</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Contact Person</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-right pr-6">Rating</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {vendorContacts.map((vendor, idx) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 pl-6 font-medium text-slate-400">{idx + 1}</td>
                    <td className="p-4 font-bold text-slate-800">{vendor.vendor}</td>
                    <td className="p-4 font-medium text-slate-600">{vendor.contactPerson}</td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{vendor.phone}</td>
                    <td className="p-4 text-slate-500">{vendor.email}</td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-bold text-slate-700">{vendor.rating.toFixed(1)}</span>
                        <Star size={16} className="text-amber-400 fill-amber-400" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddMemberModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><UserPlus size={18} className="text-blue-600"/> Add Team Member</h3>
              <button onClick={() => setIsAddMemberModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input type="text" placeholder="e.g. Engr. Olabisi" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input type="email" placeholder="email@example.com" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Project Manager</option>
                  <option>Site Supervisor</option>
                  <option>Architect</option>
                  <option>Consultant</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setIsAddMemberModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm">Cancel</button>
              <button onClick={() => { setIsAddMemberModalOpen(false); showToast('Team member added successfully!'); }} className="px-6 py-2 bg-[#021422] text-white font-medium rounded-lg hover:bg-[#03437a] transition-colors text-sm shadow-md flex items-center gap-2">
                Save Member
              </button>
            </div>
          </div>
        </div>
      )}

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
