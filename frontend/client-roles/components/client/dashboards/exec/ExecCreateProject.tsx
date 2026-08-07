'use client';

import React, { useState } from 'react';
import { 
  PlusSquare, ArrowRight, CheckCircle, Target, Briefcase, ChevronRight, X
} from 'lucide-react';
import Link from 'next/link';

interface ExecCreateProjectProps {
  user?: any;
  orgSlug: string;
}

export default function ExecCreateProject({ user, orgSlug }: ExecCreateProjectProps) {
  const [step, setStep] = useState(1);
  const developerName = user?.company_name || 'Martins Construction Ltd';

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase">
            Initialize New Project
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Developer: {developerName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600">Portfolio Addition</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/${orgSlug}/projects/undefined/executive-developers/project/schedule`} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors flex items-center gap-2">
            <X size={16}/> Cancel
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8">

        {/* Wizard Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative z-10">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2 w-1/4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
                  step >= s ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30' : 'bg-white text-slate-400 border-gray-100'
                }`}>
                  {step > s ? <CheckCircle size={18}/> : s}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${step >= s ? 'text-blue-700' : 'text-slate-400'}`}>
                  {s === 1 ? 'Details' : s === 2 ? 'Financials' : s === 3 ? 'Team' : 'Review'}
                </span>
              </div>
            ))}
          </div>
          <div className="relative -top-9 mx-[12.5%] h-1 bg-slate-200 rounded-full z-0 overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          </div>
        </div>

        {/* Wizard Forms */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden relative min-h-[500px]">
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

          <div className="p-10 relative z-10">
            
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div>
                  <h2 className="text-xl font-bold text-[#021422] mb-1">Project Details</h2>
                  <p className="text-sm text-slate-500">Define the core parameters of the new development.</p>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Project Name</label>
                    <input type="text" placeholder="e.g., Ikoyi Luxury Towers" className="w-full p-4 bg-white border border-gray-100 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Location</label>
                    <input type="text" placeholder="e.g., Bourdillon Road, Ikoyi" className="w-full p-4 bg-white border border-gray-100 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Asset Class</label>
                      <select className="w-full p-4 bg-white border border-gray-100 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                        <option>Residential</option>
                        <option>Commercial / Retail</option>
                        <option>Mixed-Use</option>
                        <option>Infrastructure</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Estimated Duration</label>
                      <select className="w-full p-4 bg-white border border-gray-100 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                        <option>12 - 18 Months</option>
                        <option>18 - 24 Months</option>
                        <option>24 - 36 Months</option>
                        <option>3+ Years</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div>
                  <h2 className="text-xl font-bold text-[#021422] mb-1">Financial Parameters</h2>
                  <p className="text-sm text-slate-500">Set the budgetary constraints and expected returns.</p>
                </div>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Budget (₦)</label>
                      <input type="text" placeholder="e.g., 2,500,000,000" className="w-full p-4 bg-white border border-gray-100 rounded-xl text-slate-800 font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Expected ROI (%)</label>
                      <input type="text" placeholder="e.g., 22.5" className="w-full p-4 bg-white border border-gray-100 rounded-xl text-slate-800 font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Primary Funding Source</label>
                    <select className="w-full p-4 bg-white border border-gray-100 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                      <option>Internal Equity</option>
                      <option>Bank Financing / Debt</option>
                      <option>Joint Venture</option>
                      <option>Off-Plan Sales</option>
                    </select>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                    <Target className="text-blue-500 shrink-0" size={20}/>
                    <p className="text-sm text-blue-900 font-medium">Based on your portfolio average, projects in this asset class typically require a 15% contingency reserve. We recommend allocating ₦375M for unexpected costs.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div>
                  <h2 className="text-xl font-bold text-[#021422] mb-1">Team & Contractors</h2>
                  <p className="text-sm text-slate-500">Assign key personnel and vendors to the project.</p>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Site Manager</label>
                    <select className="w-full p-4 bg-white border border-gray-100 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                      <option>Engr. Tunde Bakare</option>
                      <option>Sarah Ojo</option>
                      <option>Chief Emeka Nzeribe</option>
                      <option>Engr. Wale Johnson</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Lead Contractor / Vendor</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Search registered vendors..." className="flex-1 p-4 bg-white border border-gray-100 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                      <button className="px-6 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors">Search</button>
                    </div>
                  </div>
                  <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-white text-center text-sm text-slate-500 font-medium py-8 cursor-pointer hover:bg-slate-100 transition-colors">
                    + Invite external consultants (Architect, Structural Engineer)
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 text-center py-10">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-200">
                  <Briefcase size={32}/>
                </div>
                <h2 className="text-2xl font-black text-[#021422] mb-2">Project Ready for Initialization</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  Review the parameters. Once deployed, the project will immediately appear in your active portfolio and the selected team members will be notified.
                </p>
                
                <div className="bg-white rounded-2xl p-6 text-left max-w-md mx-auto border border-gray-100">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-slate-500 uppercase">Project Name</span>
                    <span className="text-sm font-bold text-slate-800">Ikoyi Luxury Towers</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-slate-500 uppercase">Target Budget</span>
                    <span className="text-sm font-bold text-slate-800">₦2,500,000,000</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-slate-500 uppercase">Site Manager</span>
                    <span className="text-sm font-bold text-slate-800">Engr. Tunde Bakare</span>
                  </div>
                  <div className="flex justify-between py-2 mt-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
                    <span className="text-sm font-black text-emerald-600">Ready to Deploy</span>
                  </div>
                </div>
              </div>
            )}
            
          </div>
          
          {/* Footer Actions */}
          <div className="absolute bottom-0 w-full p-6 bg-white border-t border-gray-100 flex justify-between">
            <button 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className={`px-6 py-2.5 font-bold rounded-xl transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'bg-white border border-gray-100 text-slate-700 hover:bg-slate-100'}`}
            >
              Back
            </button>
            <button 
              onClick={() => step === 4 ? alert('Project successfully deployed to portfolio!') : setStep(Math.min(4, step + 1))}
              className="px-6 py-2.5 bg-[#021422] hover:bg-[#021422]/90 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              {step === 4 ? 'Deploy Project' : 'Continue'} {step !== 4 && <ArrowRight size={16}/>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
