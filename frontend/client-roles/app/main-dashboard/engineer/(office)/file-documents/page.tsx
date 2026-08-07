"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    User,
    Filter,
    Search,
    FileText,
    MapPin,
    Settings as Tools,
    Eye,
    MessageSquare,
    Share2,
    Scan,
    FolderOpen,
    Camera
} from "lucide-react";
import { div } from "framer-motion/client";
import engineerService from "@/lib/engineerService";
import { useAuthStore } from "@/lib/stores/authStore";


export default function FileDocumentsPage() {
    const [isClashModalOpen, setIsClashModalOpen] = useState(false);
    const [isARScanOpen, setIsARScanOpen] = useState(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [documents, setDocuments] = useState<any[]>([]);
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
                const res = await engineerService.getDocuments("");
                const data = res.data?.results || (Array.isArray(res.data) ? res.data : []);
                console.log("?? Documents Page Fetched Data:", data);
                setDocuments(data);
            } catch (err) {
                console.error("Error fetching documents:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);


    return (
        <>
            <div className="">
                {/* Header */}
                <div className="flex items-center justify-between shrink-0  gap-4 bg-white py-7 px-4">
                    <h1 className="text-2xl font-bold text-[#021422]">Project Document - {project?.name || "N/A"}</h1>
                    <div className="flex items-center gap-4 text-right">
                        <div className="flex flex-col">
                            <span className="font-bold text-[#021422]">{user?.fullname || user?.username || "Superintendent"}</span>
                            <span className="text-xs text-gray-500 uppercase">{user?.role?.replace('_', ' ') || "Engineer"}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User size={16} />
                        </div>
                        <button className="flex items-center gap-2 px-6 py-2 bg-[#0070D4] text-white rounded-lg font-bold hover:bg-[#005bb5] transition-colors">
                            <FolderOpen size={18} />
                            Upload File
                        </button>
                    </div>
                </div>


                <div className="flex gap-8 flex-1 min-h-0 p-4">
                    {/* Sidebar */}
                    <div className="w-80 shrink-0 flex flex-col gap-6">
                        {/* Contextual Filters */}
                        <div className="rounded-2xl overflow-hidden text-white shadow-xl border border-gray-200">
                            <div className="p-6 bg-[#021422]">
                                <h2 className="font-bold text-sm tracking-wider uppercase">CONTEXTUAL FILTERS</h2>
                            </div>
                            <div className="p-6 space-y-6 bg-white">
                                <p className="text-sm text-gray-300">Find Docs for:</p>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold flex items-center gap-2"><MapPin size={12} className="text-[#021422]" /> <span className="text-[#021422]">Location</span></label>
                                            <button className="w-full bg-gray-50 text-[#021422] border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold flex justify-between items-center hover:bg-gray-100 transition-colors">
                                                Grid BS <Filter size={12} />
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold flex items-center gap-2"><Tools size={12} className="text-[#021422]" /> <span className="text-[#021422]">Task</span></label>
                                            <button className="w-full bg-gray-50 text-[#021422] border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold flex justify-between items-center hover:bg-gray-100 transition-colors">
                                                WP-205 <Filter size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold flex items-center gap-2"><FileText size={12} className="text-[#021422]" /> <span className="text-[#021422]">Type</span></label>
                                        <button className="w-full bg-gray-50 text-[#021422] border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold flex justify-between items-center hover:bg-gray-100 transition-colors">
                                            All <Filter size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Latest Updates */}
                        <div className="rounded-2xl overflow-hidden text-white flex-1 shadow-xl border border-gray-200 bg-white">
                            <h2 className="text-sm font-bold border-b border-white/10 p-4 bg-[#021422]">Latest Updates</h2>
                            <div className="space-y-6 p-6">
                                <p className="text-xs text-gray-500 mb-1 font-semibold text-center italic">No recent updates.</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 bg-white rounded-2xl  text-white overflow-y-auto">
                        <div className="flex items-center justify-between mb-8 border-b border-white px-4 py-8 bg-[#021422]">
                            <h2 className="font-bold text-sm text-center tracking-wider uppercase">DOCUMENT CARDS</h2>
                        </div>

                        <div className="space-y-6 p-8">
                            {documents.length === 0 ? (
                                <div className="text-center text-gray-500 font-medium py-8 bg-[#f8fafc] rounded-2xl">
                                    No documents available.
                                </div>
                            ) : (
                                documents.map((doc) => (
                                    <div key={doc.id} className="bg-[#f8fafc] text-[#021422] rounded-2xl p-8 flex flex-col gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#021422] flex items-center justify-center shrink-0">
                                                <FileText className="text-white" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">{doc.title}</h3>
                                                <p className="text-sm font-medium text-gray-600 mt-1">
                                                    {doc.rev} | {doc.stage} | {doc.date}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pl-14 space-y-3">
                                            <div className="flex items-center gap-3 text-sm font-medium">
                                                <MapPin size={18} />
                                                <span>Location: {doc.location}</span>
                                            </div>
                                            {doc.linked && (
                                                <div className="flex items-center gap-3 text-sm font-medium">
                                                    <Tools size={18} />
                                                    <span>Linked to: {doc.linked}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pl-14 flex items-center gap-4 pt-2">
                                            <button
                                                onClick={() => setIsClashModalOpen(true)}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                                            >
                                                <Eye size={14} /> View
                                            </button>
                                            <button className="flex items-center gap-2 px-6 py-2.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors">
                                                <MessageSquare size={14} /> Comment
                                            </button>
                                            <button className="flex items-center gap-2 px-6 py-2.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors">
                                                <Share2 size={14} /> Share
                                            </button>
                                            <button
                                                onClick={() => setIsARScanOpen(true)}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                                            >
                                                <Scan size={14} /> AR
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isClashModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsClashModalOpen(false)}
                        ></div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 p-8 flex flex-col items-center"
                        >
                            <button
                                onClick={() => setIsClashModalOpen(false)}
                                className="absolute top-4 right-4 bg-red-400 p-1.5 rounded-lg text-white hover:bg-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="mt-8 text-center space-y-2 mb-10">
                                <h2 className="text-2xl font-bold text-[#021422]">CLASH DETECTED: Column C5</h2>
                                <p className="text-lg font-medium text-gray-600">As-Built vs. Design: +5cm East</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <button className="bg-[#0070D4] hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-sm transition-colors">
                                    Capture Snapshot
                                </button>
                                <button className="bg-[#021422] hover:bg-gray-900 text-white py-4 rounded-xl font-bold text-sm transition-colors">
                                    Advise Engineer
                                </button>
                                <button className="bg-[#021422] hover:bg-gray-900 text-white py-4 rounded-xl font-bold text-sm transition-colors">
                                    Hide Model
                                </button>
                                <button className="bg-[#0070D4] hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-sm transition-colors">
                                    Exit AR
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isARScanOpen && (
                    <div className="fixed inset-0 z-[60] bg-[#F4F6F8] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-5xl aspect-video relative z-10 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200"
                        >
                            <button
                                onClick={() => setIsARScanOpen(false)}
                                className="absolute top-6 right-6 z-20 bg-white/10 hover:bg-white/20 p-2 rounded-full text-[#021422] transition-colors"
                            >
                                <X size={24} />
                            </button>

                            {/* AR Viewport Simulation */}
                            <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center">
                                <div className="relative w-[60%] h-[60%] border-2 border-blue-400 rounded-lg flex flex-col items-center justify-center">
                                    {/* Corner Markers */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1" />

                                    <Camera size={64} className="text-gray-400 mb-4" />
                                    <p className="text-gray-500 font-medium">Camera Feed Simulation</p>
                                    <p className="text-gray-400 text-sm mt-1">Scanning: T-25 Rebar</p>
                                </div>
                            </div>

                            {/* Bottom Card Overlay */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md">
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-[#021422]">T-25 Rebar</h3>
                                            <p className="text-gray-500 text-sm">Block B, South Yard</p>
                                        </div>
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">In Stock</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-gray-400 text-xs font-bold uppercase">Qty Detected:</p>
                                            <p className="text-[#021422] font-bold text-lg">150 pcs</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-400 text-xs font-bold uppercase">Allocated to:</p>
                                            <p className="text-[#021422] font-bold text-lg">Pile Cap #5</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button className="flex-1 bg-[#021422] text-white py-3 rounded-lg font-bold text-sm hover:bg-gray-900 shadow-lg">Check-Out 50 pcs</button>
                                    <button className="flex-1 bg-white text-[#021422] py-3 rounded-lg font-bold text-sm hover:bg-gray-50 shadow-md">Report Damage</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}