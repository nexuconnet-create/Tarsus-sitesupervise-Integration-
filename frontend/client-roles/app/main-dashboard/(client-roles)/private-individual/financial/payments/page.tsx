'use client';

import React from 'react';
import { 
  DollarSign, CheckCircle, Clock, FileText, 
  MapPin, ChevronRight, Download, CreditCard 
} from 'lucide-react';

const PAYMENTS = [
  { id: 1, milestone: 'Initial Deposit (30%)', amount: '₦25,500,000', dueDate: 'Jan 15, 2026', status: 'paid', paidOn: 'Jan 12, 2026', invoice: 'INV-2026-001' },
  { id: 2, milestone: 'Foundation Completion (30%)', amount: '₦25,500,000', dueDate: 'Mar 15, 2026', status: 'paid', paidOn: 'Mar 10, 2026', invoice: 'INV-2026-042' },
  { id: 3, milestone: 'Superstructure (30%)', amount: '₦25,500,000', dueDate: 'Oct 15, 2026', status: 'upcoming', paidOn: null, invoice: 'INV-2026-115' },
  { id: 4, milestone: 'Final Handover (10%)', amount: '₦8,500,000', dueDate: 'Aug 15, 2027', status: 'upcoming', paidOn: null, invoice: 'INV-2027-024' },
];

export default function PaymentSchedulePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-12 font-sans selection:bg-blue-100">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
            <DollarSign className="text-blue-600" size={22} />
            Payment Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            <MapPin size={12} className="text-rose-500" />
            Lagos 12-Storey Mixed-Use Development
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-8 space-y-8">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><CheckCircle size={80}/></div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 relative z-10">Total Paid (60%)</p>
            <p className="text-3xl font-black text-slate-800 relative z-10">₦51,000,000</p>
            <p className="text-xs font-bold text-emerald-600 mt-2 relative z-10">2 of 4 Payments Completed</p>
          </div>

          <div className="bg-[#021422] rounded-2xl shadow-xl p-6 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={80}/></div>
            <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1 relative z-10">Next Payment Due</p>
            <p className="text-3xl font-black text-white relative z-10">₦25,500,000</p>
            <p className="text-xs font-bold text-blue-300 mt-2 relative z-10 flex items-center gap-1"><Clock size={12}/> Due Oct 15, 2026</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><CreditCard size={80}/></div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 relative z-10">Total Remaining (40%)</p>
            <p className="text-3xl font-black text-slate-800 relative z-10">₦34,000,000</p>
            <p className="text-xs font-bold text-slate-500 mt-2 relative z-10">2 Payments Remaining</p>
          </div>
        </div>

        {/* Payment Timeline / Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Milestone Breakdown</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {PAYMENTS.map((payment) => {
                const isPaid = payment.status === 'paid';
                return (
                  <div key={payment.id} className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border transition-colors ${
                    isPaid ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                  }`}>
                    
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isPaid ? (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                            <CheckCircle size={12}/> Paid
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                            <Clock size={12}/> Upcoming
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-400 uppercase">Invoice: {payment.invoice}</span>
                      </div>
                      <h3 className={`text-lg font-bold ${isPaid ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {payment.milestone}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 mt-1">
                        {isPaid ? `Paid on ${payment.paidOn}` : `Due by ${payment.dueDate}`}
                      </p>
                    </div>

                    <div className="flex flex-col md:items-end gap-3 md:min-w-[200px]">
                      <p className="text-2xl font-black text-slate-800">{payment.amount}</p>
                      
                      {isPaid ? (
                        <button className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 justify-center">
                          <Download size={14}/> Download Receipt
                        </button>
                      ) : (
                        <button className="text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 justify-center shadow-sm shadow-blue-500/30">
                          <CreditCard size={14}/> Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
