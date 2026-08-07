"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Building2, Search, Filter, Phone, 
  Mail, Star, MoreVertical, MapPin, ExternalLink,
  Plus, X, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useMemberships } from '@/lib/hooks/useMemberships';

interface Vendor {
  id: number;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  rating: number;
  status: string;
  location: string;
}

export default function VendorsPage() {
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const vendors: Vendor[] = [
    { id: 1, name: 'First Materials Ltd', category: 'Materials', contact: 'Adeyemi B.', phone: '0803 123 4567', email: 'adeyemi@fm.com', rating: 4.8, status: 'Active', location: 'Lagos Island' },
    { id: 2, name: 'SteelCo Nigeria', category: 'Structural', contact: 'Chidi O.', phone: '0805 789 0123', email: 'chidi@steelco.com', rating: 4.6, status: 'Active', location: 'Ikeja' },
    { id: 3, name: 'PilingPro Ltd', category: 'Foundation', contact: 'Musa K.', phone: '0807 345 6789', email: 'musa@pilingpro.com', rating: 4.2, status: 'Completed', location: 'Victoria Island' },
    { id: 4, name: 'EcoBuild Supplies', category: 'Materials', contact: 'Sarah T.', phone: '0812 345 6780', email: 'sarah@ecobuild.com', rating: 4.9, status: 'Active', location: 'Lekki Phase 1' },
    { id: 5, name: 'PowerGrid Solutions', category: 'Electrical', contact: 'John D.', phone: '0802 987 6543', email: 'john@powergrid.ng', rating: 4.5, status: 'Pending', location: 'Yaba' },
    { id: 6, name: 'Apex Glassworks', category: 'Finishing', contact: 'Emeka N.', phone: '0810 111 2222', email: 'emeka@apexglass.com', rating: 4.7, status: 'Active', location: 'Surulere' },
  ];

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wider">
            Vendors & Suppliers
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium">Total Vendors: {vendors.length}</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active Contracts: 4</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setIsAddVendorModalOpen(true)} className="px-4 py-2 bg-[#021422] text-white hover:bg-[#03437a] rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-md">
            <Plus size={16} /> Add Vendor
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-6 mb-6 flex-1 w-full flex flex-col overflow-y-auto custom-scrollbar pb-12">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search vendors by name, category, or contact person..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm shrink-0 cursor-pointer hover:bg-white transition-colors">
            <Filter size={18} className="text-slate-400" />
            <select className="bg-transparent outline-none cursor-pointer w-full pr-4 appearance-none font-medium">
              <option>Category: All</option>
              <option>Materials</option>
              <option>Structural</option>
              <option>Electrical</option>
              <option>Finishing</option>
            </select>
          </div>
        </div>

        {/* Vendor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">{vendor.name}</h3>
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{vendor.category}</span>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin size={16} className="text-slate-400 shrink-0" />
                    <span>{vendor.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone size={16} className="text-slate-400 shrink-0" />
                    <span className="font-mono">{vendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail size={16} className="text-slate-400 shrink-0" />
                    <span>{vendor.email}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md">
                    <span className="font-bold text-amber-700 text-sm">{vendor.rating.toFixed(1)}</span>
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                  </div>
                  
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    vendor.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                    vendor.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {vendor.status}
                  </span>
                </div>
              </div>
              
              <div className="bg-white border-t border-slate-100 p-3 flex gap-2">
                <Link href={`/${org_slug}/projects/${project_slug}/client/communication/messages`} className="flex-1 py-2 bg-white border border-gray-100 rounded-lg text-sm font-bold text-slate-700 hover:bg-white transition-colors flex items-center justify-center gap-2">
                  <Mail size={16} className="text-slate-400" /> Message
                </Link>
                <button onClick={() => setSelectedVendor(vendor)} className="flex-1 py-2 bg-white border border-gray-100 rounded-lg text-sm font-bold text-slate-700 hover:bg-white transition-colors flex items-center justify-center gap-2">
                  <ExternalLink size={16} className="text-slate-400" /> Details
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Add Vendor Modal */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddVendorModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Plus size={18} className="text-blue-600"/> Add New Vendor</h3>
              <button onClick={() => setIsAddVendorModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                <input type="text" placeholder="e.g. BuildWell Ltd" className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Materials</option>
                  <option>Structural</option>
                  <option>Electrical</option>
                  <option>Finishing</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input type="text" placeholder="Full name" className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input type="text" placeholder="e.g. 08012345678" className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-2">
              <button onClick={() => setIsAddVendorModalOpen(false)} className="px-4 py-2 bg-white border border-gray-100 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors text-sm">Cancel</button>
              <button onClick={() => { setIsAddVendorModalOpen(false); showToast('Vendor added successfully!'); }} className="px-6 py-2 bg-[#021422] text-white font-medium rounded-lg hover:bg-[#03437a] transition-colors text-sm shadow-md flex items-center gap-2">
                Save Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedVendor(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Building2 size={18} className="text-blue-600"/> Vendor Details</h3>
              <button onClick={() => setSelectedVendor(null)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Building2 size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedVendor.name}</h2>
                  <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">{selectedVendor.category}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Contact Person</span>
                  <span className="text-sm font-bold text-slate-800">{selectedVendor.contact}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Phone Number</span>
                  <span className="text-sm font-bold text-slate-800">{selectedVendor.phone}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Email Address</span>
                  <span className="text-sm font-bold text-slate-800">{selectedVendor.email}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Location</span>
                  <span className="text-sm font-bold text-slate-800">{selectedVendor.location}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Rating</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-800">{selectedVendor.rating.toFixed(1)}</span>
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    selectedVendor.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                    selectedVendor.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedVendor.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
              <button onClick={() => setSelectedVendor(null)} className="px-6 py-2 bg-[#021422] text-white font-bold rounded-lg hover:bg-[#03437a] transition-colors text-sm shadow-md">
                Close
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
