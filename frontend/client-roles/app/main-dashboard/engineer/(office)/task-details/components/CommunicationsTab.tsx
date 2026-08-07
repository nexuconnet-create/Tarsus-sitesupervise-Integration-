"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Paperclip, Camera, AlertTriangle, Scan } from "lucide-react";
import type { TaskMessage, MessageSource } from "../types";

interface CommunicationsTabProps {
  messages?: TaskMessage[];
  taskId: string;
  onUpdate?: (taskId: string, updates: Partial<{ communications: TaskMessage[] }>) => void;
}

const SOURCE_CONFIG: Record<MessageSource, { bg: string; text: string; border: string; align: string; label?: string }> = {
  chat: { bg: "bg-blue-50", text: "text-[#021422]", border: "border-blue-100", align: "items-start" },
  ar: { bg: "bg-white", text: "text-[#021422]", border: "border-green-200", align: "items-start" },
  system: { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-100", align: "items-start" },
};

export default function CommunicationsTab({ messages, taskId, onUpdate }: CommunicationsTabProps) {
  const [localAdditions, setLocalAdditions] = useState<TaskMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const allMessages = useMemo(() => {
    const propIds = new Set((messages || []).map((m) => m.id));
    const filteredAdditions = localAdditions.filter((m) => !propIds.has(m.id));
    return [...(messages || []), ...filteredAdditions];
  }, [messages, localAdditions]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSend = () => {
    if (!input.trim() && !attachedFile) return;
    const newMsg: TaskMessage = {
      id: `msg-${taskId}-${Date.now()}`,
      sender: "You",
      senderRole: "Foreman",
      senderAvatar: "https://i.pravatar.cc/150?img=11",
      content: input.trim(),
      timestamp: new Date().toISOString(),
      source: "chat",
      attachments: attachedFile ? [attachedFile] : undefined,
    };
    setLocalAdditions((prev) => [...prev, newMsg]);
    onUpdate?.(taskId, { communications: [...allMessages, newMsg] });
    setInput("");
    setAttachedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAttachedFile(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleARSnapshot = () => {
    const snapshot = "https://picsum.photos/seed/arnew/400/300";
    const newMsg: TaskMessage = {
      id: `msg-${taskId}-${Date.now()}`,
      sender: "You",
      senderRole: "Foreman",
      senderAvatar: "https://i.pravatar.cc/150?img=11",
      content: "AR snapshot captured from field walkthrough.",
      timestamp: new Date().toISOString(),
      source: "ar",
      snapshotUrl: snapshot,
    };
    setLocalAdditions((prev) => [...prev, newMsg]);
    onUpdate?.(taskId, { communications: [...allMessages, newMsg] });
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {allMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm font-semibold">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">Start the conversation below</p>
          </div>
        )}

        {allMessages.map((msg: TaskMessage) => {
          const config = SOURCE_CONFIG[msg.source];
          const isOwn = msg.sender === "You";
          const isSystem = msg.source === "system";
          const isAR = msg.source === "ar";

          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`flex ${config.align} gap-2 max-w-[85%] ${isOwn ? "items-end" : ""}`}>
                {!isOwn && !isSystem && (
                  <img src={msg.senderAvatar || "https://i.pravatar.cc/150?img=1"} alt={msg.sender} className="w-7 h-7 rounded-full shrink-0 mt-1" />
                )}
                <div className="flex flex-col gap-1">
                  {!isSystem && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-[#021422]">{msg.sender}</span>
                      {isAR && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-200 uppercase">
                          <Scan size={8} /> AR
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</span>
                    </div>
                  )}
                  <div className={`px-3 py-2.5 rounded-xl text-sm ${config.bg} ${config.text} ${config.border} border ${isOwn ? "rounded-br-sm" : "rounded-bl-sm"} ${isSystem ? "w-full italic" : ""}`}>
                    {isSystem && <AlertTriangle size={12} className="inline mr-1.5 shrink-0" />}
                    {msg.content}
                  </div>
                  {msg.snapshotUrl && (
                    <div className="mt-1">
                      <img src={msg.snapshotUrl} alt="AR Snapshot" className="rounded-lg max-w-[200px] border border-gray-200" />
                      <button className="mt-1 text-xs font-semibold text-[#007AFF] hover:underline flex items-center gap-1">
                        <Camera size={10} />
                        View Full AR Snapshot
                      </button>
                    </div>
                  )}
                  {msg.attachments && msg.attachments.length > 0 && !msg.snapshotUrl && (
                    <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                      <Paperclip size={10} />
                      {msg.attachments.length} attachment(s)
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="pt-4 border-t border-gray-100 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={handleARSnapshot}
            className="shrink-0 px-3 py-2 border border-gray-200 rounded-lg text-gray-400 hover:text-[#021422] hover:border-gray-300 transition-colors flex items-center gap-1 text-xs font-medium"
            title="Add AR Snapshot"
          >
            <Scan size={14} />
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full pl-4 pr-20 py-2.5 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-[#007AFF] outline-none text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <label className="p-1.5 text-gray-400 hover:text-[#021422] cursor-pointer transition-colors">
                <Paperclip size={16} />
                <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleAttach} className="hidden" />
              </label>
              <button
                onClick={handleSend}
                className="p-1.5 bg-[#007AFF] text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
        {attachedFile && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">
            <Paperclip size={12} />
            <span className="flex-1 truncate">File attached</span>
            <button onClick={() => setAttachedFile(null)} className="text-gray-400 hover:text-gray-600">x</button>
          </div>
        )}
      </div>
    </div>
  );
}
