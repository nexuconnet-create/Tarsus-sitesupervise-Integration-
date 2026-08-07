"use client";

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import engineerService from "@/lib/engineerService";

interface CrewMember {
    id: string;
    name: string;
    scheduled: string;
    status: string;
    actualClock: string;
    notes: string;
}

interface CrewAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CrewAttendanceModal({ isOpen, onClose }: CrewAttendanceModalProps) {
    const [crew, setCrew] = useState<CrewMember[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchAttendance = async () => {
                setLoading(true);
                try {
                    const res = await engineerService.getAttendance("");
                    const rawData = res.data?.results || res.data || [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const mapped: CrewMember[] = rawData.map((record: any) => ({
                        id: record.id.toString(),
                        name: record.user_name || "Unknown",
                        scheduled: record.scheduled_hours || "07:00",
                        status: record.status || "Absent",
                        actualClock: record.clock_in || "--",
                        notes: record.notes || "___________"
                    }));
                    setCrew(mapped);
                } catch (err) {
                    console.error("Error fetching crew attendance:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchAttendance();
        }
    }, [isOpen]);

    // Prevent click propagation to close overlay when clicking modal content
    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PRESENT': return 'bg-green-100 text-green-700 border-green-200';
            case 'LATE': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'ABSENT': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={handleModalClick}
                        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header Section */}
                        <div className="bg-[#021422] text-white p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold uppercase tracking-wider">
                                        Crew Attendance - {new Date().toLocaleDateString('en-GB')}
                                    </h2>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto">
                                    <button className="flex-1 md:flex-none px-4 md:px-6 py-2.5 bg-[#007AFF] hover:bg-blue-600 rounded text-sm font-bold transition-colors text-center">
                                        Bulk Update
                                    </button>
                                    <button className="flex-1 md:flex-none px-4 md:px-6 py-2.5 bg-[#007AFF] hover:bg-blue-600 rounded text-sm font-bold transition-colors text-center">
                                        Export
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="flex-1 overflow-auto p-8">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#021422]"></div>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="py-4 px-4 font-bold text-sm uppercase text-[#021422]">Name</th>
                                            <th className="py-4 px-4 font-bold text-sm uppercase text-[#021422]">Scheduled</th>
                                            <th className="py-4 px-4 font-bold text-sm uppercase text-[#021422]">Status</th>
                                            <th className="py-4 px-4 font-bold text-sm uppercase text-[#021422]">Actual Clock</th>
                                            <th className="py-4 px-4 font-bold text-sm uppercase text-[#021422]">Notes (Supervisor)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {crew.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-10 text-center text-gray-500 italic">No attendance records found for today.</td>
                                            </tr>
                                        ) : (
                                            crew.map((member) => (
                                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-4 text-sm font-medium text-gray-700">{member.name}</td>
                                                    <td className="py-4 px-4 text-sm text-gray-500">{member.scheduled}</td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(member.status)}`}>
                                                            {member.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-gray-500">{member.actualClock}</td>
                                                    <td className="py-4 px-4 text-sm text-gray-400 font-mono">{member.notes}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Footer / Bulk Actions */}
                        <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row items-center gap-4 md:justify-between sticky bottom-0">
                            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                                <span className="font-bold text-lg text-[#021422]">Bulk Action:</span>
                                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                                    <span className="text-gray-500 text-sm whitespace-nowrap">Mark Selected as:</span>

                                    <div className="relative flex-1 md:flex-none">
                                        <button className="w-full md:w-auto flex items-center justify-between gap-2 px-4 py-2 bg-[#021422] text-white rounded text-sm font-medium">
                                            Present
                                            <ChevronDown size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full md:w-auto px-8 py-2 bg-[#007AFF] text-white rounded text-sm font-bold shadow-md hover:bg-blue-600 transition-colors">
                                Apply
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}