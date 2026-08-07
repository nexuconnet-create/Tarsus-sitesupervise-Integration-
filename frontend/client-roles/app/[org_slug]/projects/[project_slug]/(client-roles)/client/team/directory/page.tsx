"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Contact, Search, Filter, Phone, 
  Mail, MessageSquare, ExternalLink, Download
} from 'lucide-react';
import Link from 'next/link';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function ContactDirectoryPage() {
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  const [searchTerm, setSearchTerm] = useState('');

  // Combined and sorted list for directory
  const allContacts = [
    { id: 't1', name: 'Engr. Adebayo', type: 'Project Team', role: 'Project Manager', email: 'a.martins@example.com', phone: '+234 801 111 1111', company: 'SiteSupervise' },
    { id: 'v1', name: 'Adeyemi B.', type: 'Vendor', role: 'Sales Rep', email: 'adeyemi@fm.com', phone: '0803 123 4567', company: 'First Materials Ltd' },
    { id: 't3', name: 'Ahmed Yakubu', type: 'Project Team', role: 'Site Foreman', email: 'a.yakubu@example.com', phone: '+234 801 333 3333', company: 'SiteSupervise' },
    { id: 't5', name: 'Chief Ademola', type: 'Project Team', role: 'Project Owner', email: 'c.ademola@example.com', phone: '+234 801 555 5555', company: 'Client Corp' },
    { id: 'v2', name: 'Chidi O.', type: 'Vendor', role: 'Manager', email: 'chidi@steelco.com', phone: '0805 789 0123', company: 'SteelCo Nigeria' },
    { id: 't2', name: 'Engr. Kamal', type: 'Project Team', role: 'Site Supervisor', email: 'a.kamal@example.com', phone: '+234 801 222 2222', company: 'SiteSupervise' },
    { id: 't4', name: 'Engr. Ola Adeyemi', type: 'Project Team', role: 'Architect', email: 'o.adeyemi@example.com', phone: '+234 801 444 4444', company: 'Design Partners' },
    { id: 'v4', name: 'John D.', type: 'Vendor', role: 'Technician', email: 'john@powergrid.ng', phone: '0802 987 6543', company: 'PowerGrid Solutions' },
    { id: 'v3', name: 'Musa K.', type: 'Vendor', role: 'Operations', email: 'musa@pilingpro.com', phone: '0807 345 6789', company: 'PilingPro Ltd' },
    { id: 'v5', name: 'Sarah T.', type: 'Vendor', role: 'Account Manager', email: 'sarah@ecobuild.com', phone: '0812 345 6780', company: 'EcoBuild Supplies' },
  ];

  const groupedContacts = allContacts.reduce((acc, contact) => {
    const letter = contact.name.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(contact);
    return acc;
  }, {} as Record<string, typeof allContacts>);

  const letters = Object.keys(groupedContacts).sort();

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wider">
            Contact Directory
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium">Total Contacts: {allContacts.length}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-100 text-slate-700 hover:bg-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm">
            <Download size={16} /> Export Contacts
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-6 mb-6 flex-1 w-full flex flex-col overflow-y-auto custom-scrollbar gap-6 pb-12">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search directory by name, role, or company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm shrink-0 cursor-pointer hover:bg-white transition-colors">
            <Filter size={18} className="text-slate-400" />
            <select className="bg-transparent outline-none cursor-pointer w-full pr-4 appearance-none font-medium">
              <option>Type: All Contacts</option>
              <option>Project Team</option>
              <option>Vendors</option>
              <option>Clients</option>
            </select>
          </div>
        </div>

        {/* Directory Layout */}
        <div className="flex items-start gap-8">
          
          {/* Alphabet Index (Sticky) */}
          <div className="hidden lg:flex flex-col gap-1 sticky top-6">
            {letters.map((letter) => (
              <a 
                key={letter} 
                href={`#letter-${letter}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>

          {/* Contacts List */}
          <div className="flex-1 space-y-10">
            {letters.map((letter) => (
              <div key={letter} id={`letter-${letter}`} className="scroll-mt-6">
                <h2 className="text-2xl font-black text-slate-300 mb-4 pl-2 border-b-2 border-gray-100 pb-2">{letter}</h2>
                <div className="grid gap-3">
                  {groupedContacts[letter].map((contact) => (
                    <div key={contact.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                          {contact.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 text-base truncate">{contact.name}</h3>
                          <p className="text-sm font-medium text-slate-500 truncate">{contact.role} &bull; <span className="text-slate-400">{contact.company}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mr-2 ${
                          contact.type === 'Project Team' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          {contact.type}
                        </span>
                        <Link href={`/${org_slug}/projects/${project_slug}/client/communication/messages`} className="p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors" title="Call via Messages">
                          <Phone size={18} />
                        </Link>
                        <a href={`mailto:${contact.email}`} className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title={contact.email}>
                          <Mail size={18} />
                        </a>
                        <Link href={`/${org_slug}/projects/${project_slug}/client/communication/messages`} className="p-2 text-slate-400 hover:bg-white hover:text-slate-600 rounded-lg transition-colors" title="Message">
                          <MessageSquare size={18} />
                        </Link>
                      </div>

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
