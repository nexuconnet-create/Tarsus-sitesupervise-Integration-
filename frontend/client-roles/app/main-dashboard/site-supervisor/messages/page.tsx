"use client";

import {
    User,
    MoreHorizontal,
    Send,
    Paperclip,
    MessageSquare,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const res = await engineerService.getChatThreads("");
                const rawData = res.data?.results || res.data;
                const data = Array.isArray(rawData) ? rawData : [];
                console.log("?? Crew Manager - Fetched Threads:", data);
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
                console.log(`?? Crew Manager - Fetched Messages for Thread ${activeThreadId}:`, data);
                setMessages(data);
            } catch (err) {
                console.error("Error fetching chat messages:", err);
            }
        };
        fetchMessages();
    }, [activeThreadId]);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const activeThread = Array.isArray(threads) ? threads.find(t => t.id === activeThreadId) : null;

    const sortedMessages = messages?.length > 0
        ? [...messages].sort((a, b) => new Date(a.created_at || a.timestamp).getTime() - new Date(b.created_at || b.timestamp).getTime())
        : [];

    return (
        <div className="space-y-6 pb-20 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0 gap-4 bg-white py-7 px-4">
                <h1 className="text-2xl font-bold text-[#021422]">Project Communication</h1>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-[#021422]">{user?.fullname || user?.username || "Crew Manager"}</span>
                        <span className="text-xs text-gray-500 uppercase">{user?.role?.replace('_', ' ') || "Crew Manager"}</span>
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
                                {loading ? (
                                    <div className="text-xs text-gray-400 text-center py-4">Loading threads...</div>
                                ) : !Array.isArray(threads) || threads.length === 0 ? (
                                    <div className="text-xs text-gray-400 text-center py-8 space-y-2">
                                        <MessageSquare size={24} className="mx-auto text-gray-300" />
                                        <p>No active threads.</p>
                                    </div>
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

                    {activeThread ? (
                        <>
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-[#021422]">TASK: {activeThread?.context || "N/A"}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm font-bold text-gray-500">{activeThread ? "Active Discussion" : "No selected thread"}</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-4">
                                {!Array.isArray(sortedMessages) || sortedMessages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <MessageSquare size={32} className="text-gray-300" />
                                            <p className="text-sm font-medium">No messages in this thread.</p>
                                            <p className="text-xs">Send a message to start the conversation.</p>
                                        </div>
                                    </div>
                                ) : (
                                    sortedMessages.map((msg, idx) => {
                                        const isOwn = msg.sender === user?.uuid || msg.sender_name === user?.fullname;
                                        return (
                                            <div key={msg.id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] p-4 rounded-2xl ${isOwn ? 'bg-[#021422] text-white' : 'bg-white border border-gray-100 text-[#021422]'}`}>
                                                    <div className="flex items-center justify-between gap-4 mb-2">
                                                        <span className="text-[10px] font-bold uppercase opacity-70">{msg.sender_name || "Unknown User"}</span>
                                                        <span className="text-[10px] opacity-50">
                                                            {new Date(msg.created_at || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm">{msg.content}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={chatEndRef} />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
                            <MessageSquare size={40} className="text-gray-300" />
                            <p className="text-sm font-medium">
                                {loading ? "Loading threads..." : "Select a thread to view messages"}
                            </p>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        {activeThread && (
                            <p className="text-sm font-medium text-[#021422] mb-3">Regarding: {activeThread?.context || "N/A"}</p>
                        )}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={activeThread ? "Type Reply...." : "Select a thread first"}
                                disabled={!activeThread}
                                className="w-full pl-6 pr-24 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#0070D4] disabled:opacity-50"
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