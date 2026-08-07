'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { 
  FileText, Download, Plus, Calendar, TrendingUp, 
  BarChart4, PieChart, Activity, X, CheckCircle2
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function FinancialReportsPage() {
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [selectedReport, setSelectedReport] = React.useState<{title: string, period: string, summary: string} | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setToastMessage('Report downloaded successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    }, 1500);
  };

  return (
    <div className="h-screen bg-[#E3E3E3] text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3">
            FINANCIAL REPORTS
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">Financial Suite</span>
          </div>
        </div>

        <button className="px-4 py-2 bg-[#021422] hover:bg-[#03437a] text-white rounded-lg text-sm font-bold transition-colors shadow-md flex items-center gap-2">
          <Plus size={16} /> Generate New Report
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Report 1: Cash Flow */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-blue-300 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Cash Flow Statement</h2>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar size={12}/> Period: Q1 2026
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">
                  Generated: Today
                </span>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Positive cash flow maintained for February. Total inflows of ₦120M against outflows of ₦85M. Cash reserves are sufficient for upcoming Q2 procurement milestones.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedReport({ title: 'Cash Flow Statement', period: 'Q1 2026', summary: 'Positive cash flow maintained for February. Total inflows of ₦120M against outflows of ₦85M. Cash reserves are sufficient for upcoming Q2 procurement milestones.' })} className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-bold transition-colors">
                  View Report
                </button>
                <button onClick={handleDownload} disabled={isDownloading} className="px-4 py-2.5 bg-white border border-gray-100 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors shadow-sm disabled:opacity-50" title="Download PDF">
                  <Download size={18} />
                </button>
              </div>
            </div>

            {/* Report 2: Budget Variance */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-emerald-300 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <BarChart4 size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Budget Variance Analysis</h2>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar size={12}/> Period: Feb 2026
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">
                  Generated: Yesterday
                </span>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Overall project is currently <span className="font-bold text-emerald-600">2.1% under budget</span>. Materials are tracking slightly high (+5%) due to cement costs, offset by labor savings.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedReport({ title: 'Budget Variance Analysis', period: 'Feb 2026', summary: 'Overall project is currently 2.1% under budget. Materials are tracking slightly high (+5%) due to cement costs, offset by labor savings.' })} className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-bold transition-colors">
                  View Report
                </button>
                <button onClick={handleDownload} disabled={isDownloading} className="px-4 py-2.5 bg-white border border-gray-100 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors shadow-sm disabled:opacity-50" title="Download PDF">
                  <Download size={18} />
                </button>
              </div>
            </div>

            {/* Report 3: Subcontractor */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-amber-300 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <PieChart size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Subcontractor Expenditure</h2>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar size={12}/> Period: Jan - Feb 2026
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">
                  Generated: Feb 15
                </span>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Total subcontractor spend to date: ₦45M. Piling works completed exactly to contracted estimate. Framing subcontractor payments scheduled for late March.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedReport({ title: 'Subcontractor Expenditure', period: 'Jan - Feb 2026', summary: 'Total subcontractor spend to date: ₦45M. Piling works completed exactly to contracted estimate. Framing subcontractor payments scheduled for late March.' })} className="flex-1 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-sm font-bold transition-colors">
                  View Report
                </button>
                <button onClick={handleDownload} disabled={isDownloading} className="px-4 py-2.5 bg-white border border-gray-100 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors shadow-sm disabled:opacity-50" title="Download PDF">
                  <Download size={18} />
                </button>
              </div>
            </div>

            {/* Report 4: Equipment ROI */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-indigo-300 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Equipment ROI & Utilization</h2>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar size={12}/> Period: Q1 2026
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">
                  Generated: Feb 01
                </span>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Heavy machinery lease utilization tracking at 85%. Cost-benefit analysis confirms leasing crane is 22% more cost-effective than purchasing for this 18-month timeline.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedReport({ title: 'Equipment ROI & Utilization', period: 'Q1 2026', summary: 'Heavy machinery lease utilization tracking at 85%. Cost-benefit analysis confirms leasing crane is 22% more cost-effective than purchasing for this 18-month timeline.' })} className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold transition-colors">
                  View Report
                </button>
                <button onClick={handleDownload} disabled={isDownloading} className="px-4 py-2.5 bg-white border border-gray-100 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors shadow-sm disabled:opacity-50" title="Download PDF">
                  <Download size={18} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* View Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FileText className="text-blue-600"/> {selectedReport.title}</h3>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><Calendar size={14}/> Period: {selectedReport.period}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-8">
                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Executive Summary</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedReport.summary}</p>
              </div>
              
              <div className="space-y-6">
                <div className="h-48 bg-white rounded-xl border border-slate-100 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-slate-100 opacity-50 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <div className="z-10 flex flex-col items-center">
                     <BarChart4 size={32} className="text-slate-300 mb-2" />
                     <p className="text-sm font-bold text-slate-400">Detailed Analytics Chart Placeholder</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Key Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Variance</p>
                      <p className="text-lg font-black text-slate-800 font-mono">+ ₦4.2M</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Efficiency Ratio</p>
                      <p className="text-lg font-black text-slate-800 font-mono">92.4%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
              <button onClick={() => setSelectedReport(null)} className="px-4 py-2 bg-white border border-gray-100 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors text-sm">Close</button>
              <button onClick={() => { setSelectedReport(null); handleDownload(); }} className="px-4 py-2 bg-[#021422] text-white font-bold rounded-lg hover:bg-[#03437a] transition-colors text-sm flex items-center gap-2 shadow-md">
                <Download size={16} /> Download Full PDF
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
