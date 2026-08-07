"use client";

import React from 'react';
import Link from 'next/link';
import {
    Menu,
    MapPin,
    Wrench,
    HardHat,
    ArrowRight,
    ClipboardCheck,
    MessageSquare
} from 'lucide-react';

// ... imports
import CrewAttendanceModal from '../components/CrewAttendanceModal';
import { useState, useEffect } from 'react';

import engineerService from "@/lib/engineerService";

export default function FieldModePage() {
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [briefing, setBriefing] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBriefing = async () => {
            try {
                const res = await engineerService.getFieldBriefing("");
                if (res.data) {
                    console.log("????? Field Mode Briefing Fetched Data:", res.data);
                    setBriefing(res.data);
                }
            } catch (err) {
                console.error("Error fetching field briefing data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBriefing();
    }, []);

    const userProfile = {
        name: briefing?.user_name || "N/A",
        title: briefing?.trade || "N/A",
        crew: briefing?.crew_name || "N/A"
    };
    const workArea = {
        title: briefing?.work_area || "Not Assigned",
        subtitle: briefing?.grid_zone || "N/A"
    };
    const mainTask = {
        title: briefing?.main_task?.title || "No active task"
    };
    const safetyMsg = {
        line1: briefing?.safety_alerts?.[0] || "Stay vigilant.",
        line2: briefing?.safety_alerts?.[1] || ""
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#E3E3E3]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#021422]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <CrewAttendanceModal
                isOpen={isAttendanceModalOpen}
                onClose={() => setIsAttendanceModalOpen(false)}
            />
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div>
                    <h1 className="text-xl font-bold">Field Mode - {briefing?.projectName || "Construction Site"}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-500">{new Date().toLocaleDateString('en-GB')}</span>
                    <button className="p-2 hover:bg-gray-100 rounded-md">
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-10 max-w-3xl mx-auto w-full">

                <div className="mb-8">
                    <p className="text-gray-600 mb-1">Good morning, {userProfile.name}</p>
                    <p className="text-lg font-bold text-[#021422]">{userProfile.title} <span className="text-gray-400 font-normal mx-2">|</span> {userProfile.crew}</p>
                </div>

                {/* Today's Briefing Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-12">
                    <div className="bg-[#021422] text-white p-6 text-center">
                        <h2 className="font-bold tracking-wider uppercase text-sm">Today&apos;s Briefing</h2>
                    </div>

                    <div className="p-8 space-y-8">

                        {/* Work Area */}
                        <div className="flex gap-4">
                            <div className="mt-1">
                                <MapPin className="text-red-500" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-[#021422]">Work Area: {workArea.title}</h3>
                                <p className="text-gray-600 mt-1 font-medium">{workArea.subtitle}</p>
                            </div>
                        </div>

                        {/* Main Task */}
                        <div className="flex gap-4">
                            <div className="mt-1">
                                <Wrench className="text-gray-400" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-[#021422]">Main Task: {mainTask.title}</h3>
                            </div>
                        </div>

                        {/* Safety */}
                        <div className="flex gap-4">
                            <div className="mt-1">
                                <HardHat className="text-yellow-500" size={24} fill="currentColor" fillOpacity={0.2} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-[#021422]">Safety: {safetyMsg.line1}</h3>
                                {safetyMsg.line2 && <p className="font-bold text-lg text-[#021422]">{safetyMsg.line2}</p>}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Start My Day Button */}
                <div className="flex justify-center mb-16">
                    <button
                        onClick={() => setIsAttendanceModalOpen(true)}
                        className="bg-[#021422] text-white px-10 py-4 rounded-lg font-bold tracking-wide shadow-lg hover:bg-gray-800 transition-colors uppercase text-sm transform active:scale-95 duration-200"
                    >
                        Start My Day
                    </button>
                </div>

                {/* Quick Links */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <span className="font-bold text-lg mr-2">Quick Links:</span>

                    <Link href="/main-dashboard/engineer/task-details" className="w-full md:w-auto">
                        <button className="w-full md:w-auto bg-[#021422] text-white px-6 py-3 rounded-md text-xs font-bold tracking-wider uppercase hover:bg-gray-800 transition-colors">
                            My Tasks
                        </button>
                    </Link>

                    <Link href="/main-dashboard/engineer/messages" className="w-full md:w-auto">
                        <button className="w-full md:w-auto bg-[#007AFF] text-white px-6 py-3 rounded-md text-xs font-bold tracking-wider uppercase hover:bg-blue-600 transition-colors">
                            Messages ({briefing?.unread_messages || 0})
                        </button>
                    </Link>

                    <Link href="/staff/dashboard" className="w-full md:w-auto">
                        <button className="w-full md:w-auto bg-[#021422] text-white px-6 py-3 rounded-md text-xs font-bold tracking-wider uppercase hover:bg-gray-800 transition-colors">
                            Site Map
                        </button>
                    </Link>
                </div>

            </main>
        </div>
    );
}