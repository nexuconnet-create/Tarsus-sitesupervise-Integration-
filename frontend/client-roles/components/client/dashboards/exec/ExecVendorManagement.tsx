'use client';

import React, { useState } from 'react';
import { 
  Users, Search, Filter, PlusSquare, Building2, Phone, 
  Mail, FileText, CheckCircle, AlertTriangle, ShieldCheck, MoreVertical
} from 'lucide-react';

interface ExecVendorManagementProps {
  user?: any;
  orgSlug: string;
}

export default function ExecVendorManagement({ user, orgSlug }: ExecVendorManagementProps) {
  const developerName = user?.company_name || 'Martins Construction Ltd';
  const [searchTerm, setSearchTerm] = useState('');

  const vendors = [
    { 
      id: 1, 
      name: 'Julius Berger Nigeria', 
      type: 'General Contractor', 
      contact: 'Engr. Wolfgang', 
      email: 'w.berg@julius-berger.com',
      activeProjects: 3,
      contractValue: '₦4.5B',
      status: 'Active',
      compliance: 'Verified'
    },
    { 
      id: 2, 
      name: 'Dangote Cement Plc', 
      type: 'Material Supplier', 
      contact: 'Alhaji Musa', 
      email: 'musa.s@dangote.com',
      activeProjects: 12,
      contractValue: '₦1.2B',
      status: 'Active',
      compliance: 'Verified'
    },
    { 
      id: 3, 
      name: 'BrightSpark Electricals', 
      type: 'MEP Subcontractor', 
      contact: 'Chinedu Eze', 
      email: 'c.eze@brightspark.ng',
      activeProjects: 1,
      contractValue: '₦85M',
      status: 'Pending Renewal',
      compliance: 'Expiring Soon'
    },
    { 
      id: 4, 
      name: 'Structuracore Engineering', 
      type: 'Structural Consultant', 
      contact: 'Dr. Femi Peters', 
      email: 'f.peters@structuracore.com',
      activeProjects: 4,
      contractValue: '₦320M',
      status: 'Active',
      compliance: 'Verified'
    },
    { 
      id: 5, 
      name: 'Oceanic Logistics', 
      type: 'Haulage & Transport', 
      contact: 'Capt. Benson', 
      email: 'ops@oceaniclogistics.ng',
      activeProjects: 2,
      contractValue: '₦150M',
      status: 'Suspended',
      compliance: 'Non-Compliant'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Vendor Management
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Registered Vendors: {vendors.length}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-[#021422] hover:bg-[#021422]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
            <PlusSquare size={16}/> Onboard Vendor
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search vendors by name, type, or contact..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>All Types</option>
              <option>General Contractor</option>
              <option>Material Supplier</option>
              <option>Consultant</option>
            </select>
            <button className="px-4 py-2 bg-white border border-gray-100 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              <Filter size={16}/> Filter
            </button>
          </div>
        </div>

        {/* Vendor Directory List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Vendor Details</th>
                  <th className="p-4">Contact Person</th>
                  <th className="p-4 text-center">Active Projects</th>
                  <th className="p-4">Contract Value</th>
                  <th className="p-4">Compliance</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-white transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{vendor.name}</p>
                          <p className="text-xs font-medium text-slate-500">{vendor.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-700 text-sm">{vendor.contact}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Mail size={10}/> {vendor.email}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                        {vendor.activeProjects}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-slate-800">{vendor.contractValue}</p>
                    </td>
                    <td className="p-4">
                      {vendor.compliance === 'Verified' && (
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 w-max px-2.5 py-1 rounded-md border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                          <ShieldCheck size={14}/> Verified
                        </div>
                      )}
                      {vendor.compliance === 'Expiring Soon' && (
                        <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 w-max px-2.5 py-1 rounded-md border border-amber-100 text-[10px] font-bold uppercase tracking-wider">
                          <AlertTriangle size={14}/> Expiring Soon
                        </div>
                      )}
                      {vendor.compliance === 'Non-Compliant' && (
                        <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 w-max px-2.5 py-1 rounded-md border border-rose-100 text-[10px] font-bold uppercase tracking-wider">
                          <AlertTriangle size={14}/> Non-Compliant
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                        vendor.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        vendor.status === 'Pending Renewal' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-500 border-gray-100'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Message Vendor">
                          <Mail size={16}/>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Contracts">
                          <FileText size={16}/>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
