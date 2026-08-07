"use client";

import { useState, useEffect } from "react";
import {
    Link as LinkIcon,
    Video,
    Calendar,
    Building2,
    Mic,
    VideoOff,
    Scan,
    Plus,
    Disc,
    X,
    MessageSquare,
    Settings,
    MoreHorizontal,
    Send,
    Camera,
    Layers,
    Activity,
    User,
    PauseCircle,
    FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import engineerService from "@/lib/engineerService";
import { useAuthStore } from "@/lib/stores/authStore";



export default function ConferencePage() {
    const [view, setView] = useState<"schedule" | "room">("schedule");
    const [activeOverlay, setActiveOverlay] = useState<"chat" | "controls" | "agenda" | null>(null);
    const [meetingTime, setMeetingTime] = useState("00:45:12");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [conferenceLinks, setConferenceLinks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore((s) => s.user);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [project, setProject] = useState<any>(() => {
        try {
            const stored = localStorage.getItem("selected_project");
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    useEffect(() => {
        (async () => {
            try {
                const res = await engineerService.getConferenceLinks("");
                const data = res.data?.results || (Array.isArray(res.data) ? res.data : []);
                console.log("?? Conference Page Fetched Links:", data);
                setConferenceLinks(data);
            } catch (err) {
                console.error("Error fetching conference links:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);



    // Mock participants
    const participants = [
        { name: "Jane Doe", role: "Struct. Eng", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop", talking: true },
        { name: "John Smith", role: "Site Supervisor", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop", talking: false },
        { name: "Alice", role: "Client Rep.", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop", talking: false },
    ];

    if (view === "schedule") {
        return (
            <div className="h-screen bg-[#021422] flex flex-col items-center justify-center p-8">
                <div className="max-w-4xl w-full space-y-12">
                    <h1 className="text-4xl font-bold text-white mb-12">Meeting Schedule</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Existing Links */}
                        {Array.isArray(conferenceLinks) && conferenceLinks.length > 0 ? (
                            conferenceLinks.map((link, idx) => (
                                <a
                                    key={link.id || idx}
                                    href={link.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center gap-6 hover:scale-105 transition-transform group"
                                >
                                    <Video size={64} className="text-[#0070D4]" />
                                    <span className="font-bold text-[#021422] text-center">{link.title || `Meeting ${idx + 1}`}</span>
                                    <span className="text-xs text-gray-500 uppercase font-bold">{link.type || "General"}</span>
                                </a>
                            ))
                        ) : (
                            <div className="bg-white/10 border border-white/20 rounded-3xl p-12 flex flex-col items-center justify-center gap-4">
                                <Video size={64} className="text-gray-500" />
                                <span className="text-white font-medium">No scheduled meetings</span>
                            </div>
                        )}


                        {/* Instant Meeting */}
                        <button
                            onClick={() => setView("room")}
                            className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center gap-6 hover:scale-105 transition-transform group"
                        >
                            <Plus size={64} className="text-[#021422] group-hover:text-[#0070D4] transition-colors" />
                            <span className="font-bold text-[#021422] text-lg">Start Instant Room</span>
                        </button>

                        {/* Schedule */}
                        <button className="bg-[#0070D4] rounded-3xl p-12 flex flex-col items-center justify-center gap-6 hover:scale-105 transition-transform">
                            <Calendar size={64} className="text-white" />
                            <span className="font-bold text-white text-lg">Sync Calendar</span>
                        </button>
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-200 relative overflow-hidden">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Building2 size={32} className="text-[#021422]" />
                    <h1 className="text-xl font-bold text-[#021422]">{project?.name || "Project Room"}</h1>
                </div>

                <div className="text-gray-500 font-mono text-xl">
                    Meeting Time: {meetingTime}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex p-6 gap-6 overflow-hidden relative">

                {/* Active Overlay (Chat / Controls / Agenda) */}
                <AnimatePresence>
                    {activeOverlay === "controls" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                        >
                            <div className="bg-[#021422] rounded-3xl p-8 w-[500px] pointer-events-auto relative shadow-2xl">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-white font-bold tracking-wider uppercase">CONTROLS</h2>
                                    <button onClick={() => setActiveOverlay(null)} className="bg-red-500 p-2 rounded hover:bg-red-600 transition-colors">
                                        <X className="text-white" size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <button className="flex-1 bg-[#0070D4] hover:bg-[#005bb5] text-white py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-colors">
                                            <Mic size={20} className="stroke-[3]" /> Mute
                                        </button>
                                        <button className="flex-1 bg-black hover:bg-gray-900 text-white py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-colors">
                                            <VideoOff size={20} className="stroke-[3]" /> Stop Video
                                        </button>
                                    </div>

                                    <button className="w-full bg-[#0070D4] hover:bg-[#005bb5] text-white py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-colors">
                                        <Scan size={20} className="stroke-[3]" /> Share My AR Feed
                                    </button>

                                    <button className="w-full bg-[#021422] border-2 border-[#021422] hover:bg-gray-900 text-white py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-colors shadow-[0_0_0_2px_white] box-content">
                                        <Plus size={20} className="stroke-[3]" /> Create Action Item
                                    </button>

                                    <button className="w-full bg-[#0070D4] hover:bg-[#005bb5] text-white py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-colors">
                                        <Disc size={20} className="stroke-[3]" /> Record Meeting
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeOverlay === "chat" && (
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            className="absolute right-0 top-0 bottom-0 w-[400px] bg-white z-40 shadow-2xl flex flex-col"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="font-bold text-sm tracking-wide uppercase text-gray-500">MESSAGE CHAT & ACTIONS</h2>
                                <div className="flex gap-2">
                                    <MoreHorizontal className="text-gray-400" />
                                    <button onClick={() => setActiveOverlay(null)}><X size={20} className="text-gray-400" /></button>
                                </div>
                            </div>

                            <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50">
                                <div className="flex flex-col items-end">
                                    <div className="bg-[#0070D4] text-white p-3 rounded-2xl rounded-tr-sm text-sm">
                                        John, can you pan to the left? I want to.....
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-[10px] text-gray-400">10:15 AM</span>
                                        <div className="text-[#0070D4]"><Activity size={10} /></div>
                                    </div>
                                </div>

                                <div className="bg-gray-200/50 p-2 rounded-lg flex items-center gap-2 text-xs text-gray-600">
                                    <div className="w-1 h-8 bg-gray-300 rounded-full"></div>
                                    <span>@Jane started on Live Feed</span>
                                    <span className="ml-auto text-gray-400">10:30 AM</span>
                                </div>

                                <div className="bg-gray-200/50 p-2 rounded-lg flex items-center gap-2 text-xs text-gray-600">
                                    <div className="w-1 h-8 bg-gray-300 rounded-full"></div>
                                    <span>@Action Item &apos;Verify spacing&apos; created</span>
                                    <span className="ml-auto text-gray-400">10:30 AM</span>
                                </div>
                            </div>

                            <div className="p-4 bg-white border-t border-gray-100">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Type Reply..."
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#0070D4]"
                                    />
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0070D4]">
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeOverlay === "agenda" && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="absolute left-[360px] top-24 z-40"
                        >
                            <div className="bg-white rounded-xl shadow-2xl w-[350px] overflow-hidden">
                                <div className="bg-[#021422] p-4 flex justify-between items-center text-white">
                                    <h3 className="font-bold text-sm uppercase">AGENDA ITEM: WP-205</h3>
                                    <button onClick={() => setActiveOverlay(null)}><X size={16} /></button>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-[#0070D4] font-bold text-sm">Status:</span>
                                        <span className="flex items-center gap-1 font-bold text-[#021422]">
                                            <PauseCircle size={16} /> On Hold
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[#0070D4] font-bold text-sm block mb-2">Latest:</span>
                                        <p className="text-sm text-[#021422] font-medium leading-relaxed">
                                            AR snapshot of spacing issue attached
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Left Sidebar: Participants */}
                <div className="w-80 flex flex-col gap-4 z-0">
                    {/* Floating Actions */}
                    <div className=" top-6 left-6 flex flex-col gap-2">
                        <button
                            onClick={() => setActiveOverlay(activeOverlay === "agenda" ? null : "agenda")}
                            className="bg-[#021422] text-white px-4 py-4 rounded-lg border border-gray-600 text-xs font-bold hover:bg-gray-800 flex items-center gap-2 w-fit"
                        >
                            <FileText size={14} /> AGENDA ITEM
                        </button>
                        <button className="bg-[#0070D4] text-white px-4 py-4 rounded-lg text-xs font-bold hover:bg-[#005bb5] flex items-center gap-2 w-fit">
                            <Mic size={14} /> MEETING ACTIONS
                        </button>
                    </div>
                    <div className="bg-[#021422] rounded-xl">

                        <div className="bg-white text-[#021422] p-4 rounded-t-xl text-center">
                            <h2 className="font-bold text-xs tracking-wider uppercase">PARTICIPANTS & AGENDA</h2>
                        </div>

                        <div className="flex-1 space-y-4 px-3 pt-3">
                            {participants.map((p, i) => (
                                <div key={i} className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden group shadow-lg">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                        <p className="text-white font-bold text-sm">{p.name} <span className="text-gray-300 text-xs font-normal">({p.role})</span></p>
                                    </div>
                                    {p.talking && (
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <div className="w-1 h-3 bg-green-500 rounded-full animate-bounce"></div>
                                            <div className="w-1 h-3 bg-green-500 rounded-full animate-bounce delay-75"></div>
                                            <div className="w-1 h-3 bg-green-500 rounded-full animate-bounce delay-150"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
                <div className=" flex-1 flex flex-col gap-6">

                    <div className="flex flex-col gap-2 justify-end items-end">
                        <button
                            onClick={() => setActiveOverlay("chat")}
                            className="bg-[#021422] text-white px-4 py-4 rounded-lg border border-gray-600 text-xs font-bold hover:bg-gray-800 flex items-center gap-2 w-fit"
                        >
                            <MessageSquare size={14} /> MEETING CHAT & ACTION
                        </button>
                        <button
                            onClick={() => setActiveOverlay(activeOverlay === "controls" ? null : "controls")}
                            className="bg-[#0070D4] text-white px-4 py-4 rounded-lg text-xs font-bold hover:bg-[#005bb5] flex items-center gap-2 w-fit"
                        >
                            <Settings size={14} /> CONTROLS
                        </button>
                    </div>

                    {/* Right Area: Shared Workspace */}
                    <div className="flex-1 bg-[#021422] rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">


                        <div className="p-8 pb-0">
                            <h2 className="text-white font-bold text-lg tracking-wider text-center uppercase mb-8">SHARED WORKSPACE</h2>

                            <div className="flex justify-center gap-4 mb-8">
                                <button className="px-6 py-2 bg-[#021422] text-white border border-gray-600 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-gray-800">
                                    <Layers size={16} /> Dashboard
                                </button>
                                <button className="px-6 py-2 bg-gray-100 text-[#021422] rounded-lg flex items-center gap-2 text-sm font-bold">
                                    <img src="https://cdn-icons-png.flaticon.com/512/1152/1152912.png" className="w-4 h-4" alt="" /> 3D Model
                                </button>
                                <button className="px-6 py-2 bg-gray-100 text-[#021422] rounded-lg flex items-center gap-2 text-sm font-bold">
                                    <Activity size={16} /> Live Site Feed
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-gray-200 mx-8 mb-8 rounded-2xl relative flex items-center justify-center border-4 border-white/10">
                            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#0070D4]"></div>
                            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#0070D4]"></div>
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#0070D4]"></div>
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#0070D4]"></div>

                            <div className="text-center">
                                <Camera size={48} className="text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">LIVE AR FEED</p>
                                <p className="text-gray-400 text-[10px] mt-1">Block A, 5th Floor (John&apos;s View)</p>
                            </div>

                            <div className="absolute bottom-2 left-0 right-0 text-center">
                                <p className="text-[10px] text-[#021422] font-semibold">Live Video Showing Rebar. Remote Markups Visible.</p>
                            </div>
                        </div>



                    </div>
                </div>
            </div>

        </div>
    );
}