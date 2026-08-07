'use client';

import React from 'react';
import { 
  FileSpreadsheet, Download, CheckSquare, FileText, AlertTriangle, Scale, BookOpen
} from 'lucide-react';

interface ExecFinancialReportsProps {
  user?: any;
  orgSlug: string;
}

export default function ExecFinancialReports({ user, orgSlug }: ExecFinancialReportsProps) {
  const developerName = user?.company_name || 'Martins Construction Ltd';

  const statements = [
    { title: 'Income Statement (P&L)', period: 'Q3 2026', type: 'PDF', status: 'Audited' },
    { title: 'Balance Sheet', period: 'Q3 2026', type: 'CSV', status: 'Audited' },
    { title: 'Cash Flow Statement', period: 'Sep 2026', type: 'Excel', status: 'Pending Audit' },
    { title: 'Vendor Ledger', period: 'YTD 2026', type: 'CSV', status: 'Internal' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Financial Reports
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Compliance & Auditing</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-gray-100 hover:bg-white text-slate-700 text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
            <Download size={16}/> Export Master Ledger
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">

        {/* Auditor Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
              <Scale size={28}/>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">KPMG (External Auditor)</h3>
              <p className="text-sm text-slate-500">Currently reviewing Q3 2026 financial records.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-6 py-2 border-r border-gray-100">
              <p className="text-xs font-bold text-slate-400 uppercase">Documents Pending</p>
              <p className="text-2xl font-black text-amber-500">2</p>
            </div>
            <div className="text-center px-6 py-2">
              <p className="text-xs font-bold text-slate-400 uppercase">Compliance Score</p>
              <p className="text-2xl font-black text-emerald-500">98%</p>
            </div>
          </div>
        </div>

        {/* Statement Archive */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600"/> Financial Statements Archive
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Document Title</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Format</th>
                  <th className="p-4">Audit Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statements.map((stmt, idx) => (
                  <tr key={idx} className="hover:bg-white transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <FileText className="text-slate-400" size={18}/>
                        <span className="font-bold text-slate-800 text-sm">{stmt.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">{stmt.period}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                        stmt.type === 'PDF' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        stmt.type === 'CSV' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {stmt.type}
                      </span>
                    </td>
                    <td className="p-4">
                      {stmt.status === 'Audited' && <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold"><CheckSquare size={14}/> Audited</span>}
                      {stmt.status === 'Pending Audit' && <span className="flex items-center gap-1.5 text-amber-600 text-xs font-bold"><AlertTriangle size={14}/> Pending Review</span>}
                      {stmt.status === 'Internal' && <span className="text-slate-500 text-xs font-bold">Internal Use</span>}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button className="px-4 py-2 bg-white border border-gray-100 hover:bg-white text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2 ml-auto">
                        <Download size={14}/> Download
                      </button>
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
