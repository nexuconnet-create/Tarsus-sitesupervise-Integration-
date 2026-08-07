import React from 'react';
import { Target, Camera, CheckCircle, Phone, MessageSquare, AlertTriangle, GraduationCap, XCircle, Calendar, Clock } from 'lucide-react';

export function CurrentAssignmentTab() {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <Target className="text-gray-400" size={20} />
                <h3 className="text-sm font-bold text-[#021422] uppercase tracking-wider">ACTIVE TASK: WP-205 - Rebar Installation</h3>
            </div>

            <ul className="space-y-6 ml-2 mb-10">
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Location: Grid BS, South Foundation
                </li>
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Started: 07:00 <span className="text-gray-300 mx-2">|</span> Estimated Complete: 15:30
                </li>
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Progress:
                    <div className="w-12 h-12 rounded-full border-4 border-[#007AFF] flex items-center justify-center text-[10px] font-bold ml-2">65%</div>
                    <span className="text-gray-300 mx-2">|</span>
                    Photo: 12 <span className="text-gray-300 mx-2">|</span>
                    AR verification: 3
                </li>
            </ul>

            <h3 className="text-sm font-bold text-[#021422] uppercase tracking-wider mb-6">PRODUCTIVITY METRICS</h3>
            <div className="flex flex-wrap gap-12 mb-10 items-center">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-[#021422]">Today:</span>
                    <div className="w-16 h-16 rounded-full border-4 border-[#22C55E] flex items-center justify-center text-xs font-bold">85%</div>
                    <span className="text-sm text-[#021422]">of target rate</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-[#021422]">Week:</span>
                    <div className="w-14 h-14 rounded-full border-4 border-[#22C55E] flex items-center justify-center text-xs font-bold">92%</div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-[#021422]">Month:</span>
                    <div className="w-14 h-14 rounded-full border-4 border-[#22C55E] flex items-center justify-center text-xs font-bold">88%</div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-[#021422]">Project:</span>
                    <div className="w-14 h-14 rounded-full border-4 border-[#22C55E] flex items-center justify-center text-xs font-bold">90%</div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-[#021422]">Quality Pass Rate:</span>
                    <div className="w-14 h-14 rounded-full border-4 border-[#22C55E] flex items-center justify-center text-xs font-bold">96%</div>
                </div>
            </div>

            <h3 className="text-sm font-bold text-[#021422] uppercase tracking-wider mb-6">QUICK ACTIONS:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="bg-[#021422] text-white p-4 rounded-lg flex items-center justify-center gap-3 text-xs font-bold uppercase">
                    <Phone size={16} /> Call Mike
                </button>
                <button className="bg-[#007AFF] text-white p-4 rounded-lg flex items-center justify-center gap-3 text-xs font-bold uppercase">
                    <MessageSquare size={16} /> Messages
                </button>
                <button className="bg-[#021422] text-white p-4 rounded-lg flex items-center justify-center gap-3 text-xs font-bold uppercase">
                    <MessageSquare size={16} /> Reassign
                </button>
                <button className="bg-[#021422] text-white p-4 rounded-lg flex items-center justify-center gap-3 text-xs font-bold uppercase">
                    <Camera size={16} /> Request Photo Update
                </button>
                <button className="bg-[#007AFF] text-white p-4 rounded-lg flex items-center justify-center gap-3 text-xs font-bold uppercase">
                    <Camera size={16} /> Request AR Scan
                </button>
            </div>
        </div>
    );
}

export function CertificationsTab() {
    return (
        <div className="p-8">
            <h3 className="flex items-center gap-3 text-sm font-bold text-[#021422] uppercase tracking-wider mb-6">
                <CheckCircle size={20} /> ACTIVE CERTIFICATIONS
            </h3>
            <ul className="space-y-6 ml-2 mb-10">
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    OSHA 30-Hour (Exp: 15-Dec-2024)
                </li>
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Crane Signal Person (Exp: 30-Nov-2023)
                </li>
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Confined Space Entry (Exp: 15-Jan-2024)
                </li>
            </ul>

            <h3 className="flex items-center gap-3 text-sm font-bold text-[#021422] uppercase tracking-wider mb-6">
                <AlertTriangle size={20} className="text-yellow-600" /> REQUIRED FOR CURRENT TASKS
            </h3>
            <ul className="flex gap-12 ml-2 mb-10">
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Fall Protection (Expired)
                </li>
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Blocking WP-310
                </li>
            </ul>

            <h3 className="flex items-center gap-3 text-sm font-bold text-[#021422] uppercase tracking-wider mb-6">
                <GraduationCap size={20} /> TRAINING RECOMMENDATIONS:
            </h3>
            <ul className="space-y-6 ml-2 mb-10">
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Advanced Rebar: Available online (2 hours)
                </li>
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    BIM for field: Scheduled for Nov 15
                </li>
            </ul>

            <div className="flex gap-4">
                <button className="px-8 py-3 bg-[#021422] text-white text-xs font-bold uppercase rounded hover:bg-gray-800 transition-colors">
                    Schedule Training
                </button>
                <button className="px-8 py-3 bg-[#007AFF] text-white text-xs font-bold uppercase rounded hover:bg-blue-600 transition-colors">
                    Upload Certificate
                </button>
                <button className="px-8 py-3 bg-[#021422] text-white text-xs font-bold uppercase rounded hover:bg-gray-800 transition-colors">
                    View All
                </button>
            </div>
        </div>
    );
}

export function AvailabilityTab() {
    return (
        <div className="p-8">
            <h3 className="flex items-center gap-3 text-sm font-bold text-[#021422] uppercase tracking-wider mb-6">
                <Calendar size={20} /> UPCOMING UNAVAILABILITY
            </h3>
            <ul className="space-y-6 ml-2 mb-10">
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Nov 10-12: Vacation (Approved)
                </li>
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Dec 5 PM: Dentist appointment
                </li>
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Dec 20-31: Holiday break
                </li>
            </ul>

            <h3 className="flex items-center gap-3 text-sm font-bold text-[#021422] uppercase tracking-wider mb-6">
                <Clock size={20} /> PREFERRED SCHEDULE
            </h3>
            <ul className="space-y-6 ml-2 mb-10">
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Mon-Fri: 07:00-15:30
                </li>
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Willing for OT: Yes (max 10 hrs/week)
                </li>
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Preferred Crew: Steel Crew A
                </li>
                <li className="flex items-center gap-3 text-sm text-[#021422]">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    Avoid: Night shifts (Medical)
                </li>
            </ul>

            <div className="flex gap-4">
                <button className="px-8 py-3 bg-[#021422] text-white text-xs font-bold uppercase rounded hover:bg-gray-800 transition-colors">
                    Request Time Off
                </button>
                <button className="px-8 py-3 bg-[#007AFF] text-white text-xs font-bold uppercase rounded hover:bg-blue-600 transition-colors">
                    Update Preferences
                </button>
            </div>
        </div>
    );
}

export function PerformanceTab() {
    return (
        <div className="p-8 flex items-center justify-center h-[300px]">
            <p className="text-gray-400 font-medium">Performance History implementation...</p>
        </div>
    );
}

export function CommunicationTab() {
    return (
        <div className="p-8 flex items-center justify-center h-[300px]">
            <p className="text-gray-400 font-medium">Communication Logs implementation...</p>
        </div>
    );
}

export function DocumentsTab() {
    return (
        <div className="p-8 flex items-center justify-center h-[300px]">
            <p className="text-gray-400 font-medium">Documents implementation...</p>
        </div>
    );
}
