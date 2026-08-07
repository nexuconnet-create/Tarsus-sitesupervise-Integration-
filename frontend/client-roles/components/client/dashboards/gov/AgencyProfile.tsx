/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import {
  Building, MapPin, Phone, Mail, Upload, ShieldCheck,
  User, CheckCircle, Plus, Camera, Award, FileSignature
} from 'lucide-react';

interface AgencyProfileProps {
  user?: any;
  orgSlug: string;
}

export default function AgencyProfile({ user, orgSlug }: AgencyProfileProps) {
  const agencyName = user?.agency_name || 'Lagos State Building Control Agency';
  const abbreviation = 'LASBCA';

  return (
    <div className="min-h-screen bg-[#E3E3E3] text-slate-900 pb-12 font-sans">

      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wide">
            Agency Profile
          </h1>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-2 font-medium">
            <ShieldCheck size={12} /> Official Regulatory Identity
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-[#021422] hover:bg-[#021422]/90 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
            Save Changes
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-8">

        {/* Profile Card & Branding */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">

          {/* Logo Section */}
          <div className="md:w-1/3 bg-white border-r border-gray-100 p-8 flex flex-col items-center justify-center">
            <div className="relative group cursor-pointer mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center p-2">
                <img src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784561113/Apex_p5nrd0.png" alt="Agency Logo" className="w-full h-full object-contain" />
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <h3 className="font-bold text-slate-800 text-center uppercase tracking-wider">{abbreviation}</h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-2 border border-emerald-200 flex items-center gap-1">
              <CheckCircle size={10} /> Verified Agency
            </span>
          </div>

          {/* Core Info Details */}
          <div className="p-8 flex-1 space-y-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Official Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Building size={12} /> Agency Name</label>
                <input type="text" defaultValue={agencyName} className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><MapPin size={12} /> Jurisdiction / State</label>
                <input type="text" defaultValue="Lagos State" className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Mail size={12} /> Official Email</label>
                <input type="email" defaultValue="compliance@lasbca.gov.ng" className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Phone size={12} /> Primary Contact</label>
                <input type="text" defaultValue="+234 800 123 4567" className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
            </div>

            <div className="space-y-1.5 mt-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Office Address</label>
              <textarea defaultValue="Oba Akinjobi Way, GRA Ikeja, Lagos, Nigeria" rows={2} className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* Digital Signature & Seal */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FileSignature size={20} /></div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Digital Seal & Signature</h2>
              <p className="text-xs text-slate-500 mt-0.5">Used for auto-stamping approved documents</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-white transition-colors cursor-pointer group">
              <div className="w-24 h-24 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                <Award size={32} className="text-red-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Upload Official Stamp</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">PNG or SVG with transparent background</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-white transition-colors cursor-pointer group">
              <div className="w-full h-24 bg-white border border-slate-100 rounded-lg flex items-center justify-center px-4 overflow-hidden">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_John_Hancock.svg" alt="Signature" className="opacity-50" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Update Chief Inspector Signature</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Used on final approval certificates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inspector Roster */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Inspector Roster</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage authorized personnel</p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5">
              <Plus size={14} /> Add Inspector
            </button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Engr. Olatunji Femi', role: 'Chief Structural Inspector', zone: 'Zone A (Island)', status: 'Active' },
              { name: 'Arch. Nnamdi Kalu', role: 'Architectural Reviewer', zone: 'HQ', status: 'Active' },
              { name: 'Engr. Sarah Johnson', role: 'Safety & Environmental', zone: 'Zone B (Mainland)', status: 'Active' }
            ].map((inspector, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-white transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                    {inspector.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{inspector.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{inspector.role} • {inspector.zone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {inspector.status}
                  </span>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-800">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
