'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  FileText, Search, Filter, Download, Plus, 
  CheckCircle2, Clock, XCircle, Printer, Check, X, UploadCloud
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function FinancialInvoicesPage() {
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  // Mock Data
  const invoicesData = [
    { id: 'INV-2026-023', vendor: 'First Materials Ltd.', amount: '₦45,000,000', date: 'Feb 19, 2026', status: 'Paid', items: [
      { desc: 'Cement (500 bags)', price: '₦25,000,000' },
      { desc: 'Rebar (10 tons)', price: '₦20,000,000' }
    ]},
    { id: 'INV-2026-022', vendor: 'SteelCo Nig', amount: '₦22,000,000', date: 'Feb 18, 2026', status: 'Pending', items: [
      { desc: 'Structural Steel Beams', price: '₦22,000,000' }
    ]},
    { id: 'INV-2026-021', vendor: 'PilingPro Ltd', amount: '₦12,000,000', date: 'Feb 15, 2026', status: 'Rejected', items: [
      { desc: 'Additional Piling Works', price: '₦12,000,000' }
    ]},
    { id: 'INV-2026-020', vendor: 'HeavyEq Rentals', amount: '₦18,500,000', date: 'Feb 10, 2026', status: 'Paid', items: [
      { desc: 'Tower Crane Lease (Feb)', price: '₦18,500,000' }
    ]},
    { id: 'INV-2026-019', vendor: 'City Permits', amount: '₦5,000,000', date: 'Feb 01, 2026', status: 'Paid', items: [
      { desc: 'Environmental Clearance', price: '₦5,000,000' }
    ]},
  ];

  const [selectedId, setSelectedId] = useState<string>('INV-2026-023');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const selectedInvoice = invoicesData.find(i => i.id === selectedId);

  return (
    <div className="h-screen bg-[#E3E3E3] text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3">
            INVOICE MANAGEMENT
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">Financial Suite</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="w-48 pl-9 pr-4 py-2 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600">
            <Filter size={16} className="text-slate-400" />
            <select className="bg-transparent outline-none cursor-pointer">
              <option>Status: All</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
          </div>
          <button onClick={() => setIsUploadModalOpen(true)} className="px-4 py-2 bg-[#021422] text-white hover:bg-[#03437a] rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-md">
            <Plus size={16} /> Upload Invoice
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-6 mb-6 flex-1 w-full flex flex-col overflow-hidden">
        <div className="flex flex-col xl:flex-row gap-8 flex-1 min-h-0">
          
          {/* LEFT PANEL: Invoice List */}
          <div className="flex-1 flex flex-col gap-6 min-h-0">
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} /> Invoice List
                </h2>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">Total: 24</span>
              </div>

              {/* Table Container */}
              <div className="overflow-y-auto custom-scrollbar flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4">Invoice No</th>
                      <th className="px-6 py-4">Vendor</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoicesData.map((inv) => (
                      <tr 
                        key={inv.id} 
                        onClick={() => setSelectedId(inv.id)}
                        className={`cursor-pointer transition-colors group ${selectedId === inv.id ? 'bg-blue-50/50' : 'hover:bg-white'}`}
                      >
                        <td className="px-6 py-4 font-mono font-bold text-slate-700">
                          {inv.id}
                          {selectedId === inv.id && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">{inv.vendor}</td>
                        <td className="px-6 py-4 font-mono text-slate-600">{inv.amount}</td>
                        <td className="px-6 py-4 text-slate-500">{inv.date}</td>
                        <td className="px-6 py-4">
                          {inv.status === 'Paid' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                              <CheckCircle2 size={12} /> Paid
                            </span>
                          )}
                          {inv.status === 'Pending' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                              <Clock size={12} /> Pending
                            </span>
                          )}
                          {inv.status === 'Rejected' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700">
                              <XCircle size={12} /> Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* RIGHT PANEL: Invoice Preview */}
          <div className="xl:w-[500px] shrink-0 flex flex-col min-h-0">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0">
              <FileText size={16} /> Document Preview
            </h2>

            <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-0">
              
              {/* Document Header */}
              <div className="bg-white border-b border-gray-100 p-6 shrink-0 flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#021422] rounded-lg text-white flex items-center justify-center font-bold text-xl mb-3 shadow-sm">
                    {selectedInvoice?.vendor.charAt(0)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">
                    {selectedInvoice?.vendor}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{selectedInvoice?.date}</p>
                </div>
                <div className="text-right">
                  <span className="bg-white border border-gray-100 px-3 py-1 rounded-md text-xs font-bold text-slate-500 uppercase tracking-wider shadow-sm">
                    Invoice
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-3">{selectedInvoice?.id}</p>
                </div>
              </div>

              {/* Document Content (Items) */}
              <div className="flex-1 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                      <th className="text-left pb-3">Description</th>
                      <th className="text-right pb-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice?.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-4 text-slate-700 font-medium">{item.desc}</td>
                        <td className="py-4 text-right font-mono font-bold text-slate-800">{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-8 flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2 text-sm font-bold border-b border-gray-100 text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-mono">{selectedInvoice?.amount}</span>
                    </div>
                    <div className="flex justify-between py-3 text-lg font-black text-[#021422]">
                      <span>Total Due</span>
                      <span className="font-mono">{selectedInvoice?.amount}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Status</p>
                  {selectedInvoice?.status === 'Paid' && (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 w-fit px-4 py-2 rounded-lg border border-emerald-100">
                      <CheckCircle2 size={18} /> INVOICE PAID
                    </div>
                  )}
                  {selectedInvoice?.status === 'Pending' && (
                    <div className="flex items-center gap-2 text-amber-600 font-bold bg-amber-50 w-fit px-4 py-2 rounded-lg border border-amber-100">
                      <Clock size={18} /> PENDING APPROVAL
                    </div>
                  )}
                  {selectedInvoice?.status === 'Rejected' && (
                    <div className="flex items-center gap-2 text-rose-600 font-bold bg-rose-50 w-fit px-4 py-2 rounded-lg border border-rose-100">
                      <XCircle size={18} /> INVOICE REJECTED
                    </div>
                  )}
                </div>

              </div>

              {/* Document Footer / Actions */}
              <div className="p-4 border-t border-slate-100 bg-white flex gap-3 shrink-0">
                {selectedInvoice?.status === 'Pending' ? (
                  <>
                    <button className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md">
                      <Check size={16} /> Approve
                    </button>
                    <button className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                      <XCircle size={16} /> Reject
                    </button>
                  </>
                ) : (
                  <button className="flex-1 py-2.5 bg-[#021422] hover:bg-[#03437a] text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md">
                    <Download size={16} /> Download PDF
                  </button>
                )}
                
                <button className="px-4 py-2.5 bg-white border border-gray-100 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center shadow-sm" title="Print Document">
                  <Printer size={16} />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Upload Invoice Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsUploadModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Plus size={18} className="text-blue-600"/> Upload New Invoice</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="border-2 border-dashed border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white transition-colors cursor-pointer bg-white/50">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm font-bold text-slate-800">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">PDF, JPG, or PNG (max. 50MB)</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Vendor / Contractor</label>
                  <select className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>Select a vendor...</option>
                    <option>First Materials Ltd.</option>
                    <option>SteelCo Nig</option>
                    <option>PilingPro Ltd</option>
                    <option>New Vendor...</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Invoice Number</label>
                    <input type="text" placeholder="e.g. INV-12345" className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Invoice Date</label>
                    <input type="date" className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Total Amount (₦)</label>
                  <input type="text" placeholder="0.00" className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-2">
              <button onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 bg-white border border-gray-100 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors text-sm">Cancel</button>
              <button onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 bg-[#021422] text-white font-medium rounded-lg hover:bg-[#03437a] transition-colors text-sm shadow-md">Upload & Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
