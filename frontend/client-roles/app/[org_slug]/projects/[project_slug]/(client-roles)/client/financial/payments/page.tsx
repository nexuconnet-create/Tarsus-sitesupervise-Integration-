'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { 
  CreditCard, Search, Filter, Download, ArrowUpRight, 
  Calendar, CheckCircle2, Clock, Landmark, FileText, X
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function FinancialPaymentsPage() {
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExport = () => showToast('Ledger exported successfully!');
  const handleApprove = () => showToast('Payment approved successfully!');

  const handlePrevious = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(12, p + 1));

  // Mock Ledger Data
  const ledgerData = [
    { id: 'TXN-99812', date: 'Feb 19, 2026', recipient: 'First Materials Ltd.', category: 'Materials', amount: '₦45,000,000', method: 'Wire Transfer', status: 'Completed' },
    { id: 'TXN-99811', date: 'Feb 15, 2026', recipient: 'PilingPro Ltd', category: 'Subcontractor', amount: '₦12,000,000', method: 'Bank Draft', status: 'Completed' },
    { id: 'TXN-99810', date: 'Feb 01, 2026', recipient: 'City Permits', category: 'Overhead', amount: '₦5,000,000', method: 'Credit Card', status: 'Completed' },
    { id: 'TXN-99809', date: 'Jan 28, 2026', recipient: 'HeavyEq Rentals', category: 'Equipment', amount: '₦18,500,000', method: 'Wire Transfer', status: 'Completed' },
  ];

  return (
    <div className="h-screen bg-[#E3E3E3] text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3">
            PAYMENTS & DISBURSEMENTS
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">Financial Suite</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-100 hover:bg-white text-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
            <Download size={16} /> Export Ledger
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-6 mb-6 flex-1 w-full flex flex-col overflow-hidden gap-6">
        
        {/* KPI SUMMARY BLOCKS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Landmark size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Paid (YTD)</p>
              <p className="text-2xl font-black text-slate-800 font-mono tracking-tight">₦85.0M</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Approvals</p>
              <p className="text-2xl font-black text-slate-800 font-mono tracking-tight">₦22.0M</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Next Payment Run</p>
              <p className="text-2xl font-black text-slate-800 font-sans tracking-tight">Feb 25</p>
            </div>
          </div>
        </div>

        {/* UPCOMING SCHEDULE & LEDGER */}
        <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
          
          {/* UPCOMING SCHEDULE */}
          <div className="xl:w-[400px] shrink-0 flex flex-col gap-6">
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-5 border-b border-slate-100 shrink-0">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={16} /> Upcoming Schedule (30 Days)
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                
                {/* Item 1 */}
                <div className="border border-gray-100 rounded-xl p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">Due: Feb 25</span>
                    <span className="font-mono font-bold text-slate-800">₦22.0M</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">SteelCo Nig</h3>
                  <p className="text-xs text-slate-500 mb-4">Milestone 2 Rebar Payment</p>
                  <button onClick={handleApprove} className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors">
                    Review & Approve
                  </button>
                </div>

                {/* Item 2 */}
                <div className="border border-gray-100 rounded-xl p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">Due: Mar 05</span>
                    <span className="font-mono font-bold text-slate-800">₦8.5M</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Crane Rentals Ltd</h3>
                  <p className="text-xs text-slate-500 mb-4">Monthly Lease Agreement</p>
                  <button className="w-full py-2 bg-white text-slate-400 rounded-lg text-xs font-bold cursor-not-allowed">
                    Awaiting Invoice
                  </button>
                </div>

              </div>
            </section>
          </div>

          {/* PAYMENT LEDGER */}
          <div className="flex-1 flex flex-col min-h-0">
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
              
              {/* Ledger Controls */}
              <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 shrink-0">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} /> Payment History (Ledger)
                </h2>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search transactions..." 
                      className="w-48 pl-8 pr-3 py-1.5 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600">
                    <Filter size={14} className="text-slate-400" />
                    <select className="bg-transparent outline-none cursor-pointer">
                      <option>Category: All</option>
                      <option>Materials</option>
                      <option>Labor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-y-auto custom-scrollbar flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Txn Ref</th>
                      <th className="px-6 py-4">Recipient</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Method</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledgerData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white transition-colors">
                        <td className="px-6 py-4 text-slate-500">{row.date}</td>
                        <td className="px-6 py-4 font-mono font-bold text-blue-600 cursor-pointer hover:underline">{row.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">{row.recipient}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                            {row.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{row.method}</td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                          {row.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
                <span>Showing {(currentPage - 1) * 4 + 1} to {Math.min(48, currentPage * 4)} of 48 transactions</span>
                <div className="flex gap-2">
                  <button onClick={handlePrevious} disabled={currentPage === 1} className="px-3 py-1.5 bg-white border border-gray-100 rounded-md hover:bg-slate-100 transition-colors text-slate-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                  <button onClick={handleNext} disabled={currentPage === 12} className="px-3 py-1.5 bg-white border border-gray-100 rounded-md hover:bg-slate-100 transition-colors text-slate-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </div>
              </div>

            </section>
          </div>

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
