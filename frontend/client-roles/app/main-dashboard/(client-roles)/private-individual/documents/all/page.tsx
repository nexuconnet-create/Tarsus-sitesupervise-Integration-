'use client';

import React, { useState } from 'react';
import { 
  FileText, MapPin, Plus, Clock, 
  CheckCircle, File, Download, MoreVertical,
  Search, Filter
} from 'lucide-react';

const DUMMY_REQUESTS = [
  { id: 1, title: 'Updated Floor Plan Diagram', type: 'Design', dateRequested: 'Mar 15, 2026', status: 'pending', dateFulfilled: null, size: null },
  { id: 2, title: 'Foundation Structural Report', type: 'Engineering', dateRequested: 'Mar 10, 2026', status: 'fulfilled', dateFulfilled: 'Mar 12, 2026', size: '3.2 MB' },
  { id: 3, title: 'Building Permit Copy', type: 'Legal', dateRequested: 'Feb 20, 2026', status: 'fulfilled', dateFulfilled: 'Feb 21, 2026', size: '1.5 MB' },
  { id: 4, title: 'Environmental Impact Study', type: 'Compliance', dateRequested: 'Feb 05, 2026', status: 'fulfilled', dateFulfilled: 'Feb 10, 2026', size: '8.4 MB' },
];

export default function DocumentRequestsPage() {
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = DUMMY_REQUESTS.filter(req => 
    req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-12 font-sans selection:bg-blue-100 relative">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
            <FileText className="text-blue-600" size={22} />
            Document Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            <MapPin size={12} className="text-rose-500" />
            Lagos 12-Storey Mixed-Use Development
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowNewRequestModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#021422] text-white text-sm font-bold rounded-lg hover:bg-[#0A4B7D] transition-colors shadow-sm"
          >
            <Plus size={16}/> New Request
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-8 space-y-6">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-500 font-bold">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span> Pending: 1
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Fulfilled: 3
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors">
              <Filter size={14}/> Filter
            </button>
            <div className="relative flex-1 md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-slate-400" size={14} />
              </div>
              <input 
                type="text" 
                placeholder="Search requests..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-12 md:col-span-5">Document Title</div>
            <div className="hidden md:block col-span-2">Type</div>
            <div className="hidden md:block col-span-2">Date Requested</div>
            <div className="col-span-3 text-right">Status / Action</div>
          </div>
          
          <div className="divide-y divide-slate-100">
            {filteredRequests.map((req) => {
              const isPending = req.status === 'pending';
              const isFulfilled = req.status === 'fulfilled';

              return (
                <div key={req.id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-slate-50 transition-colors group">
                  
                  <div className="col-span-8 md:col-span-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isPending ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                    }`}>
                      <File size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{req.title}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 md:hidden">
                        {req.type} • Req: {req.dateRequested}
                      </p>
                    </div>
                  </div>

                  <div className="hidden md:flex col-span-2 items-center text-xs font-bold text-slate-600">
                    <span className="bg-slate-100 px-2 py-1 rounded uppercase tracking-wider">{req.type}</span>
                  </div>

                  <div className="hidden md:flex col-span-2 items-center text-sm text-slate-500 font-medium">
                    {req.dateRequested}
                  </div>

                  <div className="col-span-4 md:col-span-3 flex justify-end items-center gap-3">
                    {isPending ? (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 border border-amber-200">
                        <Clock size={12}/> Pending
                      </span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="hidden md:flex bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase items-center gap-1 border border-emerald-200">
                          <CheckCircle size={12}/> Fulfilled
                        </span>
                        <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100">
                          <Download size={14}/> <span className="hidden sm:inline">Download</span>
                        </button>
                      </div>
                    )}
                    <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all md:hidden">
                      <MoreVertical size={16}/>
                    </button>
                  </div>

                </div>
              );
            })}

            {filteredRequests.length === 0 && (
              <div className="text-center py-20">
                <FileText className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500 font-bold">No document requests found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Request Modal Placeholder */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-[#021422] flex items-center gap-2">
                <FileText className="text-blue-600" size={20} /> Request Document
              </h2>
              <button 
                onClick={() => setShowNewRequestModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Document Type</label>
                <select className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option>Design & Architectural</option>
                  <option>Engineering & Structural</option>
                  <option>Legal & Contracts</option>
                  <option>Financial & Invoices</option>
                  <option>Compliance & Permits</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Specific Details</label>
                <textarea 
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                  rows={4}
                  placeholder="Please describe exactly what document you need..."
                ></textarea>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
