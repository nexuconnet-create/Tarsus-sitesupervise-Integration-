'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { 
  DollarSign, PieChart, TrendingUp, Download, Share2, 
  Wallet, CreditCard, ArrowUpRight, ArrowDownRight,
  FileText, CheckCircle2, Clock, AlertCircle, BarChart4, Mail, X, Link, Search
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function FinancialBudgetPage() {
    const org_slug = "";
  const project_slug = "";
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isAllInvoicesOpen, setIsAllInvoicesOpen] = React.useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setToastMessage('File downloaded successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    }, 1500);
  };

  // Mock Invoice Data
  const invoices = [
    { id: 'INV-2026-023', vendor: 'First Materials', amount: '₦45.0M', date: 'Feb 19', status: 'Paid' },
    { id: 'INV-2026-022', vendor: 'SteelCo Nig', amount: '₦22.0M', date: 'Feb 18', status: 'Pending' },
    { id: 'INV-2026-021', vendor: 'PilingPro Ltd', amount: '₦12.0M', date: 'Feb 15', status: 'Paid' },
    { id: 'INV-2026-020', vendor: 'HeavyEq Rentals', amount: '₦18.5M', date: 'Feb 10', status: 'Overdue' },
  ];

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3">
            <DollarSign className="text-blue-600" size={24} />
            FINANCIAL DASHBOARD
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Budget & Cost Control</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">As of: Feb 19, 2026</span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setIsShareModalOpen(true)} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
            <Share2 size={16} /> Share Report
          </button>
          <button onClick={handleDownload} disabled={isDownloading} className="px-4 py-2 bg-[#021422] hover:bg-[#03437a] text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-md disabled:opacity-70">
            <Download size={16} /> {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          
          {/* BUDGET OVERVIEW */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Left Card: KPIs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-6">
                <Wallet size={16} /> Budget Overview
              </h2>
              
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Total Budget (BAC)</p>
                  <p className="text-2xl font-black text-slate-800 font-mono tracking-tight">₦1.80B</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Committed</p>
                  <p className="text-2xl font-black text-slate-800 font-mono tracking-tight">₦1.20B</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Spent to Date</p>
                  <p className="text-2xl font-black text-blue-600 font-mono tracking-tight flex items-center gap-2">
                    ₦85.0M <ArrowUpRight size={16} className="text-blue-500" />
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Remaining Budget</p>
                  <p className="text-2xl font-black text-emerald-600 font-mono tracking-tight flex items-center gap-2">
                    ₦1.71B <ArrowDownRight size={16} className="text-emerald-500" />
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Burn Rate</p>
                  <p className="text-base font-bold text-slate-800 font-mono">₦4.5M <span className="text-xs text-slate-400 font-sans">/week</span></p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Budget Utilization</p>
                  <p className="text-base font-bold text-slate-800 font-mono">68.0% <span className="text-xs text-slate-400 font-sans">committed</span></p>
                </div>
              </div>
            </div>

            {/* Right Card: Cost Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-6">
                <PieChart size={16} /> Cost Breakdown
              </h2>

              <div className="space-y-5">
                
                {/* Labor */}
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700">Labor</span>
                    <span className="text-slate-800 font-mono">₦270M <span className="text-slate-400 ml-1 font-sans text-xs">(15%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700">Materials</span>
                    <span className="text-slate-800 font-mono">₦810M <span className="text-slate-400 ml-1 font-sans text-xs">(45%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700">Equipment</span>
                    <span className="text-slate-800 font-mono">₦180M <span className="text-slate-400 ml-1 font-sans text-xs">(10%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                {/* Subcontractors */}
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700">Subcontractors</span>
                    <span className="text-slate-800 font-mono">₦360M <span className="text-slate-400 ml-1 font-sans text-xs">(20%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '55%' }}></div>
                  </div>
                </div>

                {/* Overhead */}
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700">Overhead</span>
                    <span className="text-slate-800 font-mono">₦180M <span className="text-slate-400 ml-1 font-sans text-xs">(10%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-slate-400 h-2.5 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>

              </div>
            </div>
            
          </section>

          {/* COST PERFORMANCE TREND */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-6">
              <TrendingUp size={16} /> Cost Performance Trend
            </h2>

            {/* Custom SVG Line Chart */}
            <div className="relative w-full h-[300px] mb-6">
              <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                
                {/* Grid Lines */}
                <path d="M 50 250 L 980 250" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 50 200 L 980 200" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 50 150 L 980 150" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 50 100 L 980 100" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 50 50 L 980 50" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

                {/* Y-Axis Labels */}
                <text x="40" y="255" className="text-[10px] font-mono fill-slate-400 text-end" textAnchor="end">0</text>
                <text x="40" y="205" className="text-[10px] font-mono fill-slate-400" textAnchor="end">200M</text>
                <text x="40" y="155" className="text-[10px] font-mono fill-slate-400" textAnchor="end">400M</text>
                <text x="40" y="105" className="text-[10px] font-mono fill-slate-400" textAnchor="end">600M</text>
                <text x="40" y="55" className="text-[10px] font-mono fill-slate-400" textAnchor="end">800M</text>
                <text x="40" y="15" className="text-[10px] font-mono fill-slate-400" textAnchor="end">1.0B</text>

                {/* X-Axis Labels */}
                <text x="100" y="275" className="text-[10px] font-bold fill-slate-400" textAnchor="middle">JAN</text>
                <text x="250" y="275" className="text-[10px] font-bold fill-slate-400" textAnchor="middle">FEB</text>
                <text x="400" y="275" className="text-[10px] font-bold fill-slate-400" textAnchor="middle">MAR</text>
                <text x="550" y="275" className="text-[10px] font-bold fill-slate-400" textAnchor="middle">APR</text>
                <text x="700" y="275" className="text-[10px] font-bold fill-slate-400" textAnchor="middle">MAY</text>
                <text x="850" y="275" className="text-[10px] font-bold fill-slate-400" textAnchor="middle">JUN</text>

                {/* Data Lines */}
                {/* Planned Cost (Dotted) */}
                <path d="M 100 240 L 250 200 L 400 150 L 550 110 L 700 80 L 850 40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 6" />
                
                {/* Committed Cost (Solid Blue) */}
                <path d="M 100 230 L 250 120" fill="none" stroke="#3b82f6" strokeWidth="3" />
                <circle cx="100" cy="230" r="4" fill="#3b82f6" />
                <circle cx="250" cy="120" r="4" fill="#3b82f6" />

                {/* Actual Cost (Solid Emerald) */}
                <path d="M 100 245 L 250 220" fill="none" stroke="#10b981" strokeWidth="3" />
                <circle cx="100" cy="245" r="4" fill="#10b981" />
                <circle cx="250" cy="220" r="4" fill="#10b981" />
                
                {/* Highlight Point (Current Month) */}
                <circle cx="250" cy="120" r="8" fill="#3b82f6" opacity="0.2" />
                <circle cx="250" cy="220" r="8" fill="#10b981" opacity="0.2" />
              </svg>
            </div>

            {/* Legend & Summary */}
            <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-6 mt-4 gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <div className="w-4 h-0.5 bg-slate-400 border-t-2 border-dashed border-slate-400"></div> Planned Cost
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <div className="w-4 h-1 bg-blue-500 rounded-full"></div> Committed Cost
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <div className="w-4 h-1 bg-emerald-500 rounded-full"></div> Actual Cost
                </div>
              </div>
              
              <div className="flex items-center gap-6 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> 68% utilized
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Remaining: ₦600M
                </div>
              </div>
            </div>
          </section>

          {/* INVOICES & PAYMENTS */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={16} /> Invoices & Payments
              </h2>
              <button onClick={() => setIsAllInvoicesOpen(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                View All Invoices &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Invoice No</th>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">{inv.id}</td>
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
                        {inv.status === 'Overdue' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700">
                            <AlertCircle size={12} /> Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="View Document">
                            <FileText size={16} />
                          </button>
                          <button className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Download">
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoices Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center gap-3 shrink-0">
              <button onClick={() => setIsAllInvoicesOpen(true)} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
                <BarChart4 size={16} /> View All Invoices
              </button>
              <button onClick={handleDownload} disabled={isDownloading} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70">
                <Download size={16} /> {isDownloading ? 'Downloading...' : 'Download Statement'}
              </button>
              <button onClick={() => setIsSupportModalOpen(true)} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
                <Mail size={16} /> Request Support
              </button>
            </div>
          </section>

        </div>
      </div>

      {/* Share Report Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4" onClick={() => setIsShareModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Share2 size={18} className="text-blue-600"/> Share Financial Report</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Share via Email</label>
                <div className="flex gap-2">
                  <input type="email" placeholder="client@example.com" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">Send</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Copy Link</label>
                <div className="flex gap-2">
                  <input type="text" readOnly value="https://sitesupervise.com/reports/fin-123" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500" />
                  <button className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 flex items-center gap-2">
                    <Link size={16} /> Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4" onClick={() => setIsSupportModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Mail size={18} className="text-blue-600"/> Request Support</h3>
              <button onClick={() => setIsSupportModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 mb-2">Have a question about an invoice or budget discrepancy? Send a message to the finance team.</p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject</label>
                <input type="text" placeholder="e.g. Question about Invoice INV-2026-023" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message</label>
                <textarea rows={4} placeholder="Describe your issue..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsSupportModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
                <button onClick={() => setIsSupportModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">Submit Request</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View All Invoices Slide-Over */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ${isAllInvoicesOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><CreditCard className="text-blue-600"/> All Invoices & Payments</h2>
              <p className="text-sm text-slate-500 mt-1">Complete history of financial transactions for {projectName}</p>
            </div>
            <button onClick={() => setIsAllInvoicesOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search by vendor or ID..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <button className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-100 bg-white">Filter</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {[...invoices, { id: 'INV-2026-019', vendor: 'Cement Corp', amount: '₦55.0M', date: 'Jan 28', status: 'Paid' }, { id: 'INV-2026-018', vendor: 'Arch Designs', amount: '₦8.0M', date: 'Jan 15', status: 'Paid' }].map((inv, idx) => (
                <div key={idx} className="p-4 border border-slate-100 rounded-xl hover:border-blue-100 hover:shadow-md transition-all flex items-center justify-between bg-white group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{inv.vendor}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono">{inv.id}</span>
                        <span>•</span>
                        <span>{inv.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-slate-800">{inv.amount}</p>
                    <div className="mt-1 flex justify-end">
                      {inv.status === 'Paid' && <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Paid</span>}
                      {inv.status === 'Pending' && <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Pending</span>}
                      {inv.status === 'Overdue' && <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Overdue</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Backdrop for Slide-Over */}
      {isAllInvoicesOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsAllInvoicesOpen(false)}></div>
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
