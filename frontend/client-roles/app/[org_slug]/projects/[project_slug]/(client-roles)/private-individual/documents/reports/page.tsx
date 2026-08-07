'use client';

import React, { useState } from 'react';
import { 
  FileText, MapPin, Download, Search, 
  Filter, File, Calendar, MoreVertical 
} from 'lucide-react';

const DUMMY_DOCUMENTS = [
  { id: 1, title: 'Q1 2026 Financial Statement', category: 'Quarterly Statements', date: 'Apr 01, 2026', size: '2.4 MB', type: 'PDF' },
  { id: 2, title: 'Tax Year 2025 Summary', category: 'Tax Documents', date: 'Mar 15, 2026', size: '1.1 MB', type: 'PDF' },
  { id: 3, title: 'Invoice INV-2026-042 (Foundation)', category: 'Receipts & Invoices', date: 'Mar 10, 2026', size: '450 KB', type: 'PDF' },
  { id: 4, title: 'Payment Receipt - Foundation', category: 'Receipts & Invoices', date: 'Mar 10, 2026', size: '320 KB', type: 'PDF' },
  { id: 5, title: 'Invoice INV-2026-001 (Deposit)', category: 'Receipts & Invoices', date: 'Jan 15, 2026', size: '450 KB', type: 'PDF' },
  { id: 6, title: 'Payment Receipt - Deposit', category: 'Receipts & Invoices', date: 'Jan 12, 2026', size: '320 KB', type: 'PDF' },
  { id: 7, title: 'Initial Investment Agreement', category: 'Contracts', date: 'Dec 15, 2025', size: '5.8 MB', type: 'PDF' },
];

export default function FinancialReportsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = DUMMY_DOCUMENTS.filter(doc => {
    const matchesCategory = activeCategory === 'All' || doc.category === activeCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans selection:bg-blue-100">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
            Financial Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            <MapPin size={12} className="text-rose-500" />
            Lagos 12-Storey Mixed-Use Development
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#021422] text-white text-sm font-bold rounded-lg hover:bg-[#021422]/90 transition-colors shadow-sm">
            <Download size={16}/> Download All (ZIP)
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-8 space-y-6">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['All', 'Receipts & Invoices', 'Quarterly Statements', 'Tax Documents', 'Contracts'].map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  activeCategory === cat 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-transparent text-slate-500 hover:bg-white border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-slate-400" size={14} />
            </div>
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-white text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-12 md:col-span-6">Document Name</div>
            <div className="hidden md:block col-span-3">Date Added</div>
            <div className="hidden md:block col-span-2">Size / Type</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
          
          <div className="divide-y divide-slate-100">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white transition-colors group">
                
                <div className="col-span-11 md:col-span-6 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                    <File size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors cursor-pointer">
                      {doc.title}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      {doc.category}
                    </p>
                  </div>
                </div>

                <div className="hidden md:flex col-span-3 items-center text-sm text-slate-500 font-medium gap-2">
                  <Calendar size={14} className="text-slate-400"/> {doc.date}
                </div>

                <div className="hidden md:flex col-span-2 items-center text-xs font-bold text-slate-400">
                  {doc.size} • {doc.type}
                </div>

                <div className="col-span-1 flex justify-end items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all hidden md:flex" title="Download">
                    <Download size={16}/>
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all md:hidden">
                    <MoreVertical size={16}/>
                  </button>
                </div>

              </div>
            ))}

            {filteredDocs.length === 0 && (
              <div className="text-center py-20">
                <FileText className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500 font-bold">No documents match your search.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
