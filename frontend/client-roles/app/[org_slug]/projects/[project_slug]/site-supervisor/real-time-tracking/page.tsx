"use client";

import { useParams } from "next/navigation";
import { useMemberships } from "@/lib/hooks/useMemberships";
import {
    RefreshCw,
    MapPin,
    HardHat,
    Filter,
    Clock,
    Activity,
    Send
} from 'lucide-react';
import CrewHeader from '../component/CrewHeader';

const MapMarker = ({ top, left, color, type, icon }: { top: string, left: string, color: string, type: string, icon?: React.ReactNode }) => (
    <div className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group" style={{ top, left }}>
        <div className={`w-10 h-10 rounded-full ${color} border-[3px] border-white shadow-xl flex items-center justify-center text-white relative z-10`}>
            {icon || <MapPin size={18} fill="currentColor" />}
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 bg-[#021422] text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {type}
            </div>
        </div>
    </div>
);

export default function RealTimeTrackingPage() {
    const params = useParams();
    const orgSlug = params.org_slug as string;
    const projectSlug = params.project_slug as string;
    const { getProject } = useMemberships();
    const project = getProject(orgSlug, projectSlug);
    return (
        <div className="p-6 md:p-8 space-y-8 pb-32 bg-[#F8F9FA] min-h-screen">
            <CrewHeader title="Live Crew Tracking" project={project?.name || projectSlug} />

            {/* Map View */}
            <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">Map View</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[500px] bg-gray-50">
                    {/* Map Background (Simulated Vector Map) */}
                    <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none opacity-20">
                        <defs>
                            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ccc" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {/* Roads/Paths */}
                        <path d="M 0 100 Q 300 150 600 100 T 1000 200" stroke="#e5e7eb" strokeWidth="40" fill="none" />
                        <path d="M 200 0 L 250 500" stroke="#e5e7eb" strokeWidth="30" fill="none" />
                        <path d="M 800 0 L 750 500" stroke="#e5e7eb" strokeWidth="30" fill="none" />

                        {/* Buildings */}
                        <rect x="100" y="50" width="100" height="150" fill="#d1d5db" />
                        <rect x="300" y="250" width="200" height="100" fill="#d1d5db" />
                        <rect x="700" y="300" width="150" height="150" fill="#d1d5db" />
                        <circle cx="600" cy="150" r="40" fill="#d1d5db" />
                    </svg>

                    {/* Estate Gate Label */}
                    <div className="absolute top-10 right-10 text-xs text-gray-400 font-medium">Estate gate</div>

                    {/* Markers */}
                    <MapMarker top="20%" left="65%" color="bg-[#021422]" type="Steel Fixers" icon={<MapPin size={18} fill="currentColor" />} />
                    <MapMarker top="25%" left="25%" color="bg-[#DC2626]" type="MEP" icon={<MapPin size={18} fill="currentColor" />} />
                    <MapMarker top="55%" left="20%" color="bg-[#007AFF]" type="Carpenters" icon={<MapPin size={18} fill="currentColor" />} />
                    <MapMarker top="60%" left="60%" color="bg-[#F97316]" type="Idle > 15min" icon={<MapPin size={18} fill="currentColor" />} />

                    <MapMarker top="40%" left="75%" color="bg-[#007AFF]" type="Carpenters" icon={<MapPin size={18} fill="currentColor" />} />


                    {/* Map Legend (Integrated inside map at bottom) */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-8 bg-white px-8 py-3 rounded-full shadow-lg border border-gray-100">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#021422] uppercase tracking-wide">
                            <div className="w-3 h-3 rounded-full bg-[#021422]"></div> Steel Fixers
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#021422] uppercase tracking-wide">
                            <div className="w-3 h-3 rounded-full bg-[#007AFF]"></div> Carpenters
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#021422] uppercase tracking-wide">
                            <div className="w-3 h-3 rounded-full bg-[#DC2626]"></div> MEP
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#021422] uppercase tracking-wide">
                            <div className="w-3 h-3 rounded-full bg-[#F97316]"></div> Idle &gt; 15min
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Panel */}
            <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">Status Panel</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-[#021422] text-white p-6 md:p-8 flex items-center justify-center gap-4">
                        <div className="text-white">
                            <HardHat size={32} />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest">Crew Status By Zone</h3>
                    </div>

                    <div className="p-8 flex flex-col gap-20">

                        {/* Zones Column */}
                        <div className="space-y-8">
                            {/* Zone A */}
                            <div>
                                <h4 className="font-bold text-[#021422] mb-4 text-sm">ZONE A (Grid B4-B6):</h4>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-xs font-medium text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                                        Steel Crew A: 5/6 present
                                    </li>
                                    <li className="flex items-center gap-3 text-xs font-medium text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                                        Task: WP-205 (65% complete)
                                    </li>
                                    <li className="flex items-center gap-3 text-xs font-medium text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                                        Hours on task: 3.5/8
                                    </li>
                                    <li className="flex items-center gap-3 text-xs font-medium text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                                        Last photo: 10:15 AM
                                    </li>
                                </ul>
                            </div>

                            {/* Zone B */}
                            <div>
                                <h4 className="font-bold text-[#021422] mb-4 text-sm">ZONE B (Level 7):</h4>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-xs font-medium text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                                        MEP Crew: 4/4 present
                                    </li>
                                    <li className="flex items-center gap-3 text-xs font-medium text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                                        Task: WP-307 (42% complete)
                                    </li>
                                    <li className="flex items-center gap-3 text-xs font-medium text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                                        Safety: All harnessed verified
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Alerts & Actions Column */}
                        <div className="space-y-8">
                            <div>
                                <h4 className="font-bold text-[#021422] mb-4 text-sm uppercase">Anomaly Detection</h4>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-xs font-bold text-[#021422]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                        Worker #STL: Stationary 25 min (Bathroom/GPS issues?)
                                    </li>
                                    <li className="flex items-center gap-3 text-xs font-bold text-[#021422]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                        Zone C: No activity in 45 min (Break time)
                                    </li>
                                </ul>
                            </div>

                            <div className="pt-4">
                                <h4 className="font-bold text-[#021422] mb-4 text-sm uppercase">Actions</h4>
                                <div className="flex gap-4">
                                    <button className="flex-1 bg-[#021422] text-white py-4 rounded text-[10px] font-bold uppercase hover:bg-gray-900 transition-colors">Broadcast to Zone</button>
                                    <button className="flex-1 bg-[#007AFF] text-white py-4 rounded text-[10px] font-bold uppercase hover:bg-blue-600 transition-colors">Check on Worker</button>
                                    <button className="flex-1 bg-[#021422] text-white py-4 rounded text-[10px] font-bold uppercase hover:bg-gray-900 transition-colors">Check on Worker</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Filter Control (Bottom Bar) */}
            <div className=" border-t border-gray-200 p-6 px-10 z-30">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-[#021422]">Filter Control</h3>
                    <div className="flex flex-wrap gap-4 flex-1">
                        <button className="px-6 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-500 flex items-center justify-between gap-6 min-w-[160px] shadow-sm hover:border-gray-300">
                            Show: All Crew <Filter size={12} />
                        </button>
                        <button className="px-6 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-500 flex items-center justify-between gap-6 min-w-[160px] shadow-sm hover:border-gray-300">
                            Time: Last 60 mins <Clock size={12} />
                        </button>
                        <button className="px-6 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-500 flex items-center justify-between gap-6 min-w-[160px] shadow-sm hover:border-gray-300">
                            Activity: Working <Activity size={12} />
                        </button>
                    </div>
                
                </div>
            </div>

        </div>
    );
}
