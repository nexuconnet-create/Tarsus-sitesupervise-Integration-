"use client";

import {
    User,
    MoreHorizontal,
    Wrench,
    AlertTriangle,
    HelpCircle,
    Users,
    Scan,
    Send,
    Paperclip,
    Check,
    CheckCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import engineerService from "@/lib/engineerService";
import { useAuthStore } from "@/lib/stores/authStore";



export default function MessagesPage() {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [threads, setThreads] = useState<any[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<number | string | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const res = await engineerService.getChatThreads("");
                const rawData = res.data?.results || res.data;
                const data = Array.isArray(rawData) ? rawData : [];
                console.log("?? Messaging Page Fetched Threads:", data);
                setThreads(data);
                if (data.length > 0) {
                    setActiveThreadId(data[0].id);
                }
            } catch (err) {
                console.error("Error fetching chat threads:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchThreads();
    }, []);

    useEffect(() => {
        if (!activeThreadId) return;
        const fetchMessages = async () => {
            try {
                const res = await engineerService.getChatMessages(activeThreadId);
                const data = res.data?.results || res.data || [];
                console.log(`?? Fetched Messages for Thread ${activeThreadId}:`, data);
                setMessages(data);
            } catch (err) {
                console.error("Error fetching chat messages:", err);
            }
        };
        fetchMessages();
    }, [activeThreadId]);

    const activeThread = Array.isArray(threads) ? threads.find(t => t.id === activeThreadId) : null;


    return (
        <div className="space-y-6 pb-20 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0 gap-4 bg-white py-7 px-4">
                <h1 className="text-2xl font-bold text-[#021422]">Project Communication</h1>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-[#021422]">{user?.fullname || user?.username || "Superintendent"}</span>
                        <span className="text-xs text-gray-500 uppercase">{user?.role?.replace('_', ' ') || "Engineer"}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={16} />
                    </div>

                </div>
            </div>

            <div className="flex gap-8 flex-1 min-h-0 px-4">
                {/* Sidebar */}
                <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col shrink-0">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="font-bold text-sm tracking-wide uppercase text-[#021422]">CONTEXTS & THREADS</h2>
                        <div className="flex gap-2 mt-4">
                            <span className="px-3 py-1 bg-[#021422] text-white text-[10px] uppercase font-bold rounded-full">People</span>
                            <span className="px-3 py-1 border border-gray-200 text-gray-500 text-[10px] uppercase font-bold rounded-full">Threads</span>
                            <span className="px-3 py-1 border border-gray-200 text-gray-500 text-[10px] uppercase font-bold rounded-full">Alerts</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4">
                            <h3 className="text-xs font-bold text-[#021422] mb-3 ml-2">Active Context Threads</h3>
                            <div className="space-y-1">
                                {!Array.isArray(threads) || threads.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic ml-2">No active threads.</p>
                                ) : (
                                    threads.map((thread) => (
                                        <button
                                            key={thread.id}
                                            onClick={() => setActiveThreadId(thread.id)}
                                            className={`w-full text-left p-2 rounded-lg transition-colors ${activeThreadId === thread.id ? 'bg-[#021422] text-white' : 'hover:bg-gray-50 text-[#021422]'}`}
                                        >
                                            <p className="text-xs font-bold uppercase">{thread.context || thread.title || `Thread ${thread.id}`}</p>
                                            <p className="text-[10px] opacity-70 truncate">{thread.last_message?.content || "No messages yet"}</p>
                                        </button>
                                    ))
                                )}
                            </div>


                            <h3 className="text-xs font-bold text-[#021422] mb-3 ml-2 mt-6">Alerts</h3>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 italic ml-2">No alerts.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-sm tracking-wide uppercase text-gray-500">MESSAGE THREAD</h2>
                        <MoreHorizontal className="text-gray-400" />
                    </div>

                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-[#021422]">TASK: {activeThread?.context || "N/A"}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-gray-500">{activeThread ? "Active Discussion" : "No selected thread"}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-4">
                        {!Array.isArray(messages) || messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-sm font-medium text-gray-500">No messages in this thread.</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={msg.id || idx} className={`flex ${msg.sender === user?.uuid ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-4 rounded-2xl ${msg.sender === user?.uuid ? 'bg-[#021422] text-white' : 'bg-white border border-gray-100 text-[#021422]'}`}>
                                        <div className="flex items-center justify-between gap-4 mb-2">
                                            <span className="text-[10px] font-bold uppercase opacity-70">{msg.sender_name || "Unknown User"}</span>
                                            <span className="text-[10px] opacity-50">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>


                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <p className="text-sm font-medium text-[#021422] mb-3">Regarding: {activeThread?.context || "N/A"}</p>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Type Reply...."
                                className="w-full pl-6 pr-24 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#0070D4]"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                <button className="text-gray-400 hover:text-[#021422] transition-colors">
                                    <Paperclip size={20} />
                                </button>
                                <button className="text-gray-400 hover:text-[#0070D4] transition-colors">
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}