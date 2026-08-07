"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  User,
  MoreHorizontal,
  Wrench,
  AlertTriangle,
  HelpCircle,
  Users,
  Scan,
  Send,
  Activity,
  Paperclip,
  Check,
  CheckCheck,
  Loader2,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { clientService } from "@/lib/services";

export default function MessagesPage() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<string>("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientService.getMessages();
      const data = res.data;
      const list = Array.isArray(data) ? data : data.results || [];
      setMessages(list);

      // Extract unique threads
      const threadSet = new Map<string, any>();
      list.forEach((msg: any) => {
        const threadId = msg.thread_id || msg.thread || msg.context || msg.subject || '';
        if (threadId && !threadSet.has(threadId)) {
          threadSet.set(threadId, {
            id: threadId,
            title: msg.thread_title || msg.subject || msg.context || threadId,
            type: msg.thread_type || msg.type || 'task',
          });
        }
      });
      const threadList = Array.from(threadSet.values());
      setThreads(threadList);
      if (threadList.length > 0 && !activeThread) {
        setActiveThread(threadList[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [activeThread]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();
  }, []);

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await clientService.sendMessage({
        content: replyText.trim(),
        thread: activeThread || undefined,
      } as any);
      setReplyText('');
      await fetchMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter messages by active thread
  const activeMessages = activeThread
    ? messages.filter((msg: any) => {
      const threadId = msg.thread_id || msg.thread || msg.context || msg.subject || '';
      return threadId === activeThread;
    })
    : messages;

  const getThreadIcon = (type: string) => {
    switch (type) {
      case 'task': return <Wrench size={16} className="md:w-[18px] md:h-[18px]" />;
      case 'issue': return <AlertTriangle size={16} className="md:w-[18px] md:h-[18px]" />;
      case 'rfi': return <HelpCircle size={16} className="md:w-[18px] md:h-[18px]" />;
      case 'crew': return <Users size={16} className="md:w-[18px] md:h-[18px]" />;
      default: return <Wrench size={16} className="md:w-[18px] md:h-[18px]" />;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 gap-2 md:gap-4 bg-white py-4 md:py-7 px-3 md:px-4">
        <h1 className="text-lg md:text-2xl font-bold text-[#021422]">Project Communication</h1>
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={16} />
            </div>
            <span className="font-bold text-[#021422] hidden md:inline">John Doe</span>
            <span className="text-xs text-gray-500 uppercase hidden lg:inline">Supervisor</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8 flex-1 min-h-0 px-3 md:px-4">
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:shrink-0 max-h-[400px] md:max-h-none">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <h2 className="font-bold text-xs md:text-sm tracking-wide uppercase text-[#021422]">CONTEXTS & THREADS</h2>
            <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
              <span className="px-2 md:px-3 py-1 bg-[#021422] text-white text-[9px] md:text-[10px] uppercase font-bold rounded-full">People</span>
              <span className="px-2 md:px-3 py-1 border border-gray-200 text-gray-500 text-[9px] md:text-[10px] uppercase font-bold rounded-full">Threads</span>
              <span className="px-2 md:px-3 py-1 border border-gray-200 text-gray-500 text-[9px] md:text-[10px] uppercase font-bold rounded-full">Alerts</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-3 md:p-4">
              <h3 className="text-xs font-bold text-[#021422] mb-2 md:mb-3 ml-2">Active Context Threads</h3>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={18} className="animate-spin text-gray-400" />
                </div>
              ) : threads.length > 0 ? (
                <div className="space-y-1">
                  {threads.map((thread: any) => (
                    <button
                      key={thread.id}
                      onClick={() => setActiveThread(thread.id)}
                      className={`w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl text-left transition-colors ${activeThread === thread.id ? "bg-[#021422] text-white" : "hover:bg-gray-50 text-[#021422]"
                        }`}
                    >
                      {getThreadIcon(thread.type)}
                      <span className="text-xs md:text-sm font-medium truncate">{thread.title}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No threads</p>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[500px] md:min-h-0">
          <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-xs md:text-sm tracking-wide uppercase text-gray-500">MESSAGE THREAD</h2>
            <MoreHorizontal className="text-gray-400 w-5 h-5 md:w-6 md:h-6" />
          </div>

          {activeThread && (
            <div className="p-4 md:p-6 border-b border-gray-100">
              <h3 className="text-sm md:text-lg font-bold text-[#021422]">
                {threads.find(t => t.id === activeThread)?.title || activeThread}
              </h3>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 bg-gray-50/50">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-gray-400" />
              </div>
            ) : activeMessages.length > 0 ? (
              activeMessages.map((msg: any, idx: number) => {
                const isOutgoing = msg.is_own || msg.is_sender || msg.direction === 'outgoing';
                const content = msg.content || msg.message || msg.body || msg.text || '';
                const time = msg.time || msg.timestamp || msg.created_at || '';
                const sender = msg.sender_name || msg.sender || msg.from || (isOutgoing ? 'You' : '');
                const hasAttachment = msg.attachment || msg.has_attachment;

                return (
                  <div key={msg.id ?? idx} className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} gap-2`}>
                    <div className={isOutgoing ? 'text-right' : 'text-left'}>
                      <span className="text-xs font-bold text-gray-400">{sender}</span>
                    </div>
                    <div className={`${isOutgoing ? 'bg-[#0070D4] text-white rounded-2xl rounded-tr-sm' : 'bg-gray-100 rounded-2xl rounded-tl-sm'} p-3 md:p-4 max-w-[90%] md:max-w-[80%] shadow-sm`}>
                      <p className={`text-xs md:text-sm font-medium ${isOutgoing ? '' : 'text-[#021422]'}`}>{content}</p>
                      {time && (
                        <div className={`${isOutgoing ? 'flex items-center justify-end gap-1' : 'text-right'} mt-1`}>
                          <span className={`text-[10px] ${isOutgoing ? 'opacity-80' : 'text-gray-400'}`}>{time}</span>
                          {isOutgoing && <CheckCheck size={12} className="opacity-80" />}
                        </div>
                      )}
                    </div>
                    {hasAttachment && (
                      <div className="bg-[#021422] rounded-xl p-2 md:p-3 flex items-center gap-2 md:gap-4 shadow-sm cursor-pointer hover:bg-gray-900 transition-colors">
                        <Scan size={16} className="md:w-5 md:h-5 text-white" />
                        <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">
                          {typeof hasAttachment === 'string' ? hasAttachment : 'ATTACHMENT'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 text-center py-12">No messages in this thread</p>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 md:p-4 bg-white border-t border-gray-100">
            {activeThread && (
              <p className="text-xs md:text-sm font-medium text-[#021422] mb-2 md:mb-3">
                Regarding: {threads.find(t => t.id === activeThread)?.title || activeThread}
              </p>
            )}
            <div className="relative">
              <input
                type="text"
                placeholder="Type Reply...."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-4 md:pl-6 pr-20 md:pr-24 py-3 md:py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#0070D4] text-sm"
              />
              <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-3">
                <button className="text-gray-400 hover:text-[#021422] transition-colors">
                  <Paperclip size={18} className="md:w-5 md:h-5" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !replyText.trim()}
                  className="text-gray-400 hover:text-[#0070D4] transition-colors disabled:opacity-50"
                >
                  {sending ? <Loader2 size={18} className="animate-spin md:w-5 md:h-5" /> : <Send size={18} className="md:w-5 md:h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
