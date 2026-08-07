"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  FileText, Search, Filter, Folder, FolderOpen, File, 
  Download, Share2, Link as LinkIcon, CheckCircle2, 
  XCircle, Upload, FolderPlus, DownloadCloud, Lock,
  ChevronRight, ChevronDown, MoreVertical, FileArchive,
  FileSpreadsheet, Image as ImageIcon, FileCheck, X, Users, UserPlus
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function DocumentsPage() {
    const org_slug = "";
  const project_slug = "";
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  // State for tree view expansion
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['project_docs', 'drawings']);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportAll = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showToast('All documents exported successfully!');
    }, 1500);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wider">
            <FileText className="text-blue-600" size={24} />
            Documents
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium">Total: 1,247 Documents</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-emerald-600">Updated: Today</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-6 mb-6 flex-1 w-full flex flex-col overflow-hidden gap-6">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, type, date..." 
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm shrink-0 cursor-pointer hover:bg-slate-50 transition-colors">
            <Filter size={18} className="text-slate-400" />
            <select className="bg-transparent outline-none cursor-pointer w-full pr-4 appearance-none font-medium">
              <option>Filters: All Types</option>
              <option>PDF Documents</option>
              <option>Spreadsheets</option>
              <option>Images</option>
              <option>CAD Files</option>
            </select>
            <ChevronDown size={14} className="text-slate-400 -ml-2" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
          
          {/* LEFT PANEL: Folder Structure */}
          <div className="w-full xl:w-[400px] shrink-0 flex flex-col gap-6 min-h-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <FolderOpen size={18} className="text-blue-500" /> Folder Structure
                </h2>
              </div>

              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                
                {/* Tree View */}
                <div className="space-y-1">
                  
                  {/* Root Node */}
                  <div>
                    <div 
                      className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-slate-700 font-semibold text-sm group"
                      onClick={() => toggleFolder('project_docs')}
                    >
                      <ChevronDown size={16} className={`text-slate-400 transition-transform ${expandedFolders.includes('project_docs') ? '' : '-rotate-90'}`} />
                      <Folder size={18} className="text-blue-500 fill-blue-500/20" />
                      <span>Project Documents</span>
                    </div>

                    {expandedFolders.includes('project_docs') && (
                      <div className="ml-6 border-l border-slate-200 pl-2 mt-1 space-y-1">
                        
                        {/* Drawings Node */}
                        <div>
                          <div 
                            className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-slate-600 text-sm group"
                            onClick={() => toggleFolder('drawings')}
                          >
                            <div className="flex items-center gap-2 font-medium">
                              <ChevronDown size={14} className={`text-slate-400 transition-transform ${expandedFolders.includes('drawings') ? '' : '-rotate-90'}`} />
                              <Folder size={16} className="text-amber-500 fill-amber-500/20" />
                              <span>Drawings</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">245</span>
                          </div>
                          
                          {expandedFolders.includes('drawings') && (
                            <div className="ml-6 border-l border-slate-200 pl-2 mt-1 space-y-1">
                              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-slate-600 text-sm group">
                                <div className="flex items-center gap-2">
                                  <div className="w-3.5" /> {/* Spacer */}
                                  <Folder size={16} className="text-slate-400 fill-slate-400/20 group-hover:text-amber-500 group-hover:fill-amber-500/20 transition-colors" />
                                  <span>Structural</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400">89</span>
                              </div>
                              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-slate-600 text-sm group">
                                <div className="flex items-center gap-2">
                                  <div className="w-3.5" />
                                  <Folder size={16} className="text-slate-400 fill-slate-400/20 group-hover:text-amber-500 group-hover:fill-amber-500/20 transition-colors" />
                                  <span>Architectural</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400">78</span>
                              </div>
                              <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-slate-600 text-sm group">
                                <div className="flex items-center gap-2">
                                  <div className="w-3.5" />
                                  <Folder size={16} className="text-slate-400 fill-slate-400/20 group-hover:text-amber-500 group-hover:fill-amber-500/20 transition-colors" />
                                  <span>MEP</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400">78</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Other Top Level Folders */}
                        {[
                          { name: 'Contracts', count: 45, icon: FileCheck, color: 'text-emerald-500' },
                          { name: 'BOQ & Estimates', count: 34, icon: FileSpreadsheet, color: 'text-indigo-500' },
                          { name: 'Change Orders', count: 67, icon: FileArchive, color: 'text-rose-500' },
                          { name: 'Reports', count: 312, icon: FileText, color: 'text-blue-500' },
                          { name: 'Submissions', count: 544, icon: Upload, color: 'text-teal-500' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-slate-600 text-sm group">
                            <div className="flex items-center gap-2 font-medium">
                              <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <Folder size={16} className={`${item.color} fill-current opacity-30`} />
                              <span>{item.name}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">{item.count}</span>
                          </div>
                        ))}

                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Action Buttons Container */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/80 grid grid-cols-2 gap-2 shrink-0">
                <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center justify-center gap-2 p-2.5 bg-[#021422] hover:bg-[#03437a] text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
                  <Upload size={14} /> Upload Doc
                </button>
                <button onClick={() => setIsFolderModalOpen(true)} className="flex items-center justify-center gap-2 p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors shadow-sm">
                  <FolderPlus size={14} className="text-slate-500" /> New Folder
                </button>
                <button onClick={handleExportAll} disabled={isExporting} className="flex items-center justify-center gap-2 p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50">
                  <DownloadCloud size={14} className="text-slate-500" /> {isExporting ? 'Exporting...' : 'Export All'}
                </button>
                <button onClick={() => setIsPermissionsModalOpen(true)} className="flex items-center justify-center gap-2 p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors shadow-sm">
                  <Lock size={14} className="text-slate-500" /> Permissions
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: File Lists */}
          <div className="flex-1 flex flex-col gap-6 min-h-0">
            
            {/* Recently Updated Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={18} className="text-emerald-500" /> 
                  Recently Updated <span className="text-xs font-medium text-slate-400 normal-case ml-1">(Last 7 Days)</span>
                </h2>
              </div>
              
              <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
                <div className="space-y-1">
                  {[
                    { name: 'Foundation Drawing V3.pdf', type: 'pdf', time: '30 min ago', size: '4.2 MB' },
                    { name: 'BOQ Revision 2.xlsx', type: 'spreadsheet', time: '1h ago', size: '1.8 MB' },
                    { name: 'Change Order #015.pdf', type: 'pdf', time: '2h ago', size: '850 KB' },
                    { name: 'Site Report 2026-02-19.docx', type: 'doc', time: '3h ago', size: '2.1 MB' },
                    { name: 'Progress Photos Feb 2026.zip', type: 'zip', time: '5h ago', size: '145 MB' },
                    { name: 'Structural Review Meeting Notes.pdf', type: 'pdf', time: '1 day ago', size: '1.1 MB' },
                    { name: 'Material Specs - Steel.pdf', type: 'pdf', time: '2 days ago', size: '3.4 MB' },
                    { name: 'MEP Final Layout.dwg', type: 'cad', time: '3 days ago', size: '24 MB' },
                  ].map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl group transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg ${
                          file.type === 'pdf' ? 'bg-red-50 text-red-500' :
                          file.type === 'spreadsheet' ? 'bg-emerald-50 text-emerald-600' :
                          file.type === 'doc' ? 'bg-blue-50 text-blue-600' :
                          file.type === 'zip' ? 'bg-amber-50 text-amber-600' :
                          'bg-indigo-50 text-indigo-500'
                        }`}>
                          <File size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors cursor-pointer">{file.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs font-medium text-slate-400">{file.time}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                            <span className="text-xs font-medium text-slate-400">{file.size}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                          <Download size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Share">
                          <Share2 size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Copy Link">
                          <LinkIcon size={16} />
                        </button>
                        <button className="p-2 text-slate-300 hover:text-slate-600 rounded-lg transition-colors ml-1">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Approval Section */}
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm flex flex-col shrink-0 overflow-hidden relative">
              {/* Subtle patterned background for attention */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-[0.03] pointer-events-none"></div>
              
              <div className="p-4 border-b border-amber-100 flex items-center justify-between shrink-0 bg-amber-50/50">
                <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={18} /> Pending Approval
                </h2>
                <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold">1 Action Required</span>
              </div>
              
              <div className="p-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow relative z-10 gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="p-2.5 bg-rose-50 text-rose-500 rounded-lg shrink-0">
                      <FileArchive size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Change Order #016.pdf</p>
                      <p className="text-xs font-medium text-amber-600 mt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Awaiting Project Manager Approval
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors">
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-colors">
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM PANEL: Statistics */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#021422]/10 text-[#021422] rounded-lg">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Document Statistics</h3>
              <p className="text-xs text-slate-500 mt-0.5">Summary of all project files</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm font-medium">
            <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
              <span className="text-slate-500">Total:</span>
              <span className="font-bold text-slate-800">1,247</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
            <div className="px-3 py-1.5 bg-blue-50/50 rounded-lg flex items-center gap-2">
              <span className="text-slate-500">Reviewed:</span>
              <span className="font-bold text-blue-700">892</span>
            </div>
            <div className="px-3 py-1.5 bg-amber-50/50 rounded-lg flex items-center gap-2">
              <span className="text-slate-500">Pending:</span>
              <span className="font-bold text-amber-700">355</span>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50/50 rounded-lg flex items-center gap-2">
              <span className="text-slate-500">Approved:</span>
              <span className="font-bold text-emerald-700">745</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-100 rounded-lg flex items-center gap-2">
              <span className="text-slate-500">Superseded:</span>
              <span className="font-bold text-slate-600">502</span>
            </div>
          </div>
        </div>

      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsUploadModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Upload size={18} className="text-blue-600"/> Upload Document</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer bg-slate-50/50">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-bold text-slate-800">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, XLSX, DWG (Max 100MB)</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Destination Folder</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Project Documents / Drawings / Structural</option>
                  <option>Project Documents / Contracts</option>
                  <option>Project Documents / Reports</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm">Cancel</button>
              <button onClick={() => { setIsUploadModalOpen(false); showToast('Document uploaded successfully'); }} className="px-4 py-2 bg-[#021422] text-white font-medium rounded-lg hover:bg-[#03437a] transition-colors text-sm shadow-md">Upload File</button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsFolderModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><FolderPlus size={18} className="text-blue-600"/> Create New Folder</h3>
              <button onClick={() => setIsFolderModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Folder Name</label>
                <input type="text" placeholder="e.g. Phase 2 Drawings" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Parent Folder</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Root (Project Documents)</option>
                  <option>Project Documents / Drawings</option>
                  <option>Project Documents / Reports</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setIsFolderModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm">Cancel</button>
              <button onClick={() => { setIsFolderModalOpen(false); showToast('Folder created successfully'); }} className="px-4 py-2 bg-[#021422] text-white font-medium rounded-lg hover:bg-[#03437a] transition-colors text-sm shadow-md">Create Folder</button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {isPermissionsModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsPermissionsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Lock size={18} className="text-blue-600"/> Document Access Permissions</h3>
              <button onClick={() => setIsPermissionsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-2">
                <input type="text" placeholder="Invite via email address..." className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-colors text-sm flex items-center gap-2">
                  <UserPlus size={16} /> Invite
                </button>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">People with access</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">ME</div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">Project Admin (You)</p>
                        <p className="text-xs text-slate-500">admin@sitesupervise.com</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">Owner</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold"><Users size={14}/></div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">Contractors Team</p>
                        <p className="text-xs text-slate-500">Group</p>
                      </div>
                    </div>
                    <select className="text-xs border border-slate-200 rounded bg-white py-1 px-2 focus:outline-none focus:border-blue-500">
                      <option>Viewer</option>
                      <option>Editor</option>
                      <option>Remove</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">SO</div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">Site Owner</p>
                        <p className="text-xs text-slate-500">client@example.com</p>
                      </div>
                    </div>
                    <select className="text-xs border border-slate-200 rounded bg-white py-1 px-2 focus:outline-none focus:border-blue-500">
                      <option>Viewer</option>
                      <option>Editor</option>
                      <option>Remove</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => { setIsPermissionsModalOpen(false); showToast('Permissions updated successfully'); }} className="px-6 py-2 bg-[#021422] text-white font-bold rounded-lg hover:bg-[#03437a] transition-colors text-sm shadow-md">Done</button>
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
