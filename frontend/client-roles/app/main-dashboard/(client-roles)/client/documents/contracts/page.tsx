"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  FileSignature, Search, Filter, Download, 
  Eye, MoreVertical, Plus, CheckCircle2, 
  Clock, AlertCircle, Building2, X, FileText
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function ContractsPage() {
    const org_slug = "";
  const project_slug = "";
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const contractsData = [
    { id: 'CON-001', title: 'Main Contractor Agreement', vendor: 'BuildRight Construction Ltd', value: '₦1.2B', date: 'Jan 15, 2026', expiry: 'Dec 31, 2027', status: 'Active' },
    { id: 'CON-002', title: 'MEP Subcontract', vendor: 'ElectroMech Solutions', value: '₦350M', date: 'Feb 01, 2026', expiry: 'Oct 30, 2027', status: 'Active' },
    { id: 'CON-003', title: 'Material Supply - Steel', vendor: 'SteelCo Nigeria', value: '₦120M', date: 'Feb 10, 2026', expiry: 'Jun 30, 2026', status: 'Pending Review' },
    { id: 'CON-004', title: 'Heavy Equipment Lease', vendor: 'Crane & Co Rentals', value: '₦45M', date: 'Jan 20, 2026', expiry: 'Apr 20, 2026', status: 'Expiring Soon' },
    { id: 'CON-005', title: 'Waste Management', vendor: 'EcoClear Ltd', value: '₦12M', date: 'Jan 05, 2026', expiry: 'Jan 05, 2027', status: 'Active' },
  ];

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col overflow-hidden">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wider">
            <FileSignature className="text-emerald-600" size={24} />
            Contracts & Agreements
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium">Total: 45 Active Contracts</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setIsExportModalOpen(true)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm">
            <Download size={16} /> Export List
          </button>
          <button onClick={() => setIsNewContractOpen(true)} className="px-4 py-2 bg-[#021422] text-white hover:bg-[#03437a] rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-md">
            <Plus size={16} /> New Contract
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-6 mb-6 flex-1 w-full flex flex-col overflow-hidden gap-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Contracts</div>
            <div className="text-2xl font-black text-slate-800">45</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Review</div>
            <div className="text-2xl font-black text-amber-600">8</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Expiring in 30 Days</div>
            <div className="text-2xl font-black text-rose-600">3</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Value Executed</div>
            <div className="text-2xl font-black text-emerald-600">₦1.8B</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search contracts by name, vendor, or ID..." 
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
            <Filter size={18} className="text-slate-400" />
            <select className="bg-transparent outline-none cursor-pointer">
              <option>Status: All</option>
              <option>Active</option>
              <option>Pending Review</option>
              <option>Expiring Soon</option>
            </select>
          </div>
        </div>

        {/* Contracts Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4">Contract ID & Title</th>
                  <th className="px-6 py-4">Vendor / Party</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Effective Date</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contractsData.map((contract) => (
                  <tr key={contract.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{contract.title}</span>
                        <span className="text-xs font-mono text-slate-500 mt-0.5">{contract.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded text-slate-500"><Building2 size={14}/></div>
                        <span className="font-semibold text-slate-700">{contract.vendor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">{contract.value}</td>
                    <td className="px-6 py-4 text-slate-600">{contract.date}</td>
                    <td className="px-6 py-4 text-slate-600">{contract.expiry}</td>
                    <td className="px-6 py-4">
                      {contract.status === 'Active' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      )}
                      {contract.status === 'Pending Review' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                          <Clock size={12} /> Pending Review
                        </span>
                      )}
                      {contract.status === 'Expiring Soon' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700">
                          <AlertCircle size={12} /> Expiring Soon
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Document">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                          <Download size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
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

      </div>

      {/* Export List Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsExportModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Download size={18} className="text-blue-600"/> Export Contracts List</h3>
              <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Export Format</label>
                <div className="flex gap-3">
                  <label className="flex-1 border border-blue-200 bg-blue-50/50 rounded-lg p-3 flex items-center gap-2 cursor-pointer hover:bg-blue-50 transition-colors">
                    <input type="radio" name="exportFormat" className="w-4 h-4 text-blue-600" defaultChecked />
                    <span className="text-sm font-bold text-blue-900">CSV Excel</span>
                  </label>
                  <label className="flex-1 border border-slate-200 rounded-lg p-3 flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="radio" name="exportFormat" className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-slate-700">PDF Report</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Filter Range</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>All Active Contracts</option>
                  <option>Expiring within 30 days</option>
                  <option>Pending Review only</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setIsExportModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm">Cancel</button>
              <button onClick={() => { setIsExportModalOpen(false); showToast('Export started successfully'); }} className="px-4 py-2 bg-[#021422] text-white font-medium rounded-lg hover:bg-[#03437a] transition-colors text-sm shadow-md flex items-center gap-2">
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Contract Slide-Over */}
      <div className={`fixed inset-y-0 right-0 z-[60] w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300 ${isNewContractOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FileSignature className="text-blue-600"/> Add New Contract</h2>
              <p className="text-sm text-slate-500 mt-1">Register a new vendor or subcontractor agreement</p>
            </div>
            <button onClick={() => setIsNewContractOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer bg-slate-50/50">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                <FileText size={20} />
              </div>
              <p className="text-sm font-bold text-slate-800">Upload Contract Document</p>
              <p className="text-xs text-slate-500 mt-1">Drag & drop PDF or scanned document</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Contract Title</label>
                <input type="text" placeholder="e.g. Phase 2 MEP Works" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Vendor / Subcontractor</label>
                <input type="text" placeholder="Enter company name" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Contract Value (₦)</label>
                  <input type="text" placeholder="0.00" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>Active</option>
                    <option>Pending Review</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Effective Date</label>
                  <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
            <button onClick={() => setIsNewContractOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors text-sm">Cancel</button>
            <button onClick={() => { setIsNewContractOpen(false); showToast('Contract added successfully'); }} className="px-6 py-2 bg-[#021422] text-white font-bold rounded-lg hover:bg-[#03437a] transition-colors text-sm shadow-md flex items-center gap-2">
              <CheckCircle2 size={16} /> Save Contract
            </button>
          </div>
        </div>
      </div>
      {/* Backdrop for Slide-Over */}
      {isNewContractOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsNewContractOpen(false)}></div>
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
