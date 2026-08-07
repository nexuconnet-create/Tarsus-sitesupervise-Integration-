"use client";

import React from 'react';
import {
    AlertCircle,
    Users,
    Link as LinkIcon,
    Check,
    Search,
    ChevronDown
} from 'lucide-react';

export default function ReassignmentEnginePage() {
    return (
        <div className="p-6 md:p-8 space-y-8 pb-32 bg-[#F8F9FA] min-h-screen">

            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <h1 className="font-bold text-sm text-[#021422] uppercase tracking-wider">SMART REASSIGNMENT INTERFACE</h1>
                <button className="px-6 py-2 bg-[#007AFF] text-white text-xs font-bold uppercase rounded hover:bg-blue-600 transition-colors">
                    Auto-Suggest Mode
                </button>
            </div>

            {/* Section 1: Problem Detection */}
            <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">Problem Detection</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-start gap-4">
                        <div className="mt-1">
                            <Search size={20} className="text-[#021422]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#021422] mb-3">ISSUE: WP-205 behind schedule (Steel Crew A)</h3>
                            <ul className="space-y-3 text-xs text-gray-500">
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                    Current: 5 workers, need 7 to meet deadline
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                    Impact: 2-day delay, ₦&,500 cost overrun
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                    Root Cause: 2 absent, 1 low productivity
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Available Resources */}
            <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">Available Resources</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Users size={20} className="text-[#021422]" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#021422]">Pool of Available Workers</h3>
                    </div>

                    <div className="overflow-x-auto mb-8">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="py-4 px-4 text-xs font-bold uppercase text-[#021422] border-r border-gray-100">Name</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase text-[#021422] border-r border-gray-100">Trade</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase text-[#021422] border-r border-gray-100">Current Task</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase text-[#021422]">Availability</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: 'Sam', trade: 'Steel Fixer', task: 'WP-208', avail: 'Low Priority' },
                                    { name: 'Jane', trade: 'Steel Fixer', task: 'Training', avail: 'Available' },
                                    { name: 'Tom', trade: 'Carpenter', task: 'WP-412', avail: 'Medium Priority' },
                                    { name: 'Lisa', trade: 'Steel Fixer', task: 'WP-210', avail: 'Critical' },
                                ].map((worker, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                        <td className="py-4 px-4 text-xs text-gray-600 border-r border-gray-100">{worker.name}</td>
                                        <td className="py-4 px-4 text-xs text-gray-600 border-r border-gray-100">{worker.trade}</td>
                                        <td className="py-4 px-4 text-xs text-gray-600 border-r border-gray-100">{worker.task}</td>
                                        <td className="py-4 px-4 text-xs text-gray-600">{worker.avail}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 py-3 px-4 border border-gray-300 rounded text-xs text-gray-600 flex justify-between items-center hover:bg-gray-50">
                            Filter by: Trade <ChevronDown size={14} />
                        </button>
                        <button className="flex-1 py-3 px-4 border border-gray-300 rounded text-xs text-gray-600 flex justify-between items-center hover:bg-gray-50">
                            Certification <ChevronDown size={14} />
                        </button>
                        <button className="flex-1 py-3 px-4 border border-gray-300 rounded text-xs text-gray-600 flex justify-between items-center hover:bg-gray-50">
                            Location <ChevronDown size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Section 3: Recommended Solution */}
            <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">Recommended Solution</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <LinkIcon size={20} className="text-[#021422]" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#021422]">System Recommendation</h3>
                    </div>

                    <div className="mb-8">
                        <ol className="space-y-4 text-xs text-gray-600 mb-8">
                            <li>1. Reassign Sam from WP-208 (Low priority) to WP-205</li>
                            <li>2. Move Jane from Training (can reschedule)</li>
                            <li>3. Adjust WP-208 Schedule: Delay 1 day (low impact)</li>
                        </ol>

                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-3">Prediction Outcome</h4>
                        <ul className="space-y-3 text-xs text-gray-600 mb-8">
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                WP-205: Back on Schedule (+2 days saved)
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                WP-208: 1 day delay (acceptable)
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                Cost Impact: ₦&,200 vs ₦&,500
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                Crew Morale: Minimal disruption
                            </li>
                        </ul>

                        <div className="flex gap-4">
                            <button className="px-8 py-3 bg-[#021422] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-gray-900 transition-colors">
                                Apply This Solution
                            </button>
                            <button className="px-8 py-3 bg-[#007AFF] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors">
                                Modify
                            </button>
                            <button className="px-8 py-3 bg-[#021422] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-gray-900 transition-colors">
                                See Alternatives
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Implementation Workflow */}
            <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">Implementation Workflow</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Check size={20} className="text-[#021422]" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#021422]">Steps to Execute</h3>
                    </div>

                    <ol className="space-y-4 text-xs text-gray-600 mb-8 ml-1">
                        <li>1. Notify Sam & Jane of reassignment</li>
                        <li>2. Update WP-208 schedule</li>
                        <li>3. Inform WP-205 foreman</li>
                        <li>4. Adjust time tracking</li>
                        <li>5. Update client dashboard (if impact)</li>
                    </ol>

                    <div className="mb-8">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-3">Automated Communications:</h4>
                        <div className="flex gap-4">
                            <button className="px-8 py-3 bg-[#021422] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-gray-900 transition-colors">
                                Preview Messages to Sent
                            </button>
                            <button className="px-8 py-3 bg-[#007AFF] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors">
                                Schedule Notifications
                            </button>
                        </div>
                    </div>

                    <hr className="border-gray-100 mb-8" />

                    <div className="flex justify-between items-center gap-4">
                        <button className="flex-1 py-3 bg-[#021422] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-gray-900 transition-colors">
                            Print Action
                        </button>
                        <button className="flex-1 py-3 bg-[#007AFF] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors">
                            Schedule for Specific Time
                        </button>
                        <button className="flex-1 py-3 bg-[#021422] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-gray-900 transition-colors">
                            Send Notification
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}
