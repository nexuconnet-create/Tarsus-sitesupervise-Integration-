"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Send,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
// import { vendorService } from "@/lib/services";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from "@/lib/mockData/vendor";
import type { VendorConversation, VendorMessage } from "@/lib/types/vendor";

export default function VendorMessagesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<VendorConversation[]>(MOCK_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState<VendorConversation | null>(null);
  const [messages, setMessages] = useState<VendorMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!activeConversation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([]);
      return;
    }
    const timer = setTimeout(() => {
      const convMessages = MOCK_MESSAGES[activeConversation.id] || [];
      setMessages(convMessages);
      setMessagesLoading(false);
      setTimeout(scrollToBottom, 100);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeConversation, scrollToBottom]);

  /* â”€â”€ API version (uncomment when backend is ready) â”€â”€
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await vendorService.getConversations();
      const data = res.data?.data || res.data?.results || res.data || [];
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      const res = await vendorService.getMessages(conversationId);
      const data = res.data?.data || res.data?.results || res.data || [];
      setMessages(Array.isArray(data) ? data : []);
      setTimeout(scrollToBottom, 100);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  }, [scrollToBottom]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { if (activeConversation) fetchMessages(activeConversation.id); }, [activeConversation, fetchMessages]);
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const handleSend = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const content = newMessage.trim();
    setNewMessage("");

    const optimisticMsg: VendorMessage = {
      id: `temp-${Date.now()}`,
      senderId: "vendor",
      senderName: "You",
      senderRole: "VENDOR",
      content,
      timestamp: new Date().toISOString(),
      conversationId: activeConversation.id,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
          : c
      )
    );

    inputRef.current?.focus();

    /* â”€â”€ API version (uncomment when backend is ready) â”€â”€
    try {
      await vendorService.sendMessage({
        conversation_id: activeConversation.id,
        content,
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to send message");
      setNewMessage(content);
    } finally {
      setSending(false);
    }
    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const isOwnMessage = (msg: VendorMessage) =>
    msg.senderRole === "VENDOR" || msg.senderId === "vendor";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={28} className="animate-spin text-[#0D1B2A]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#0D1B2A]">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#0D1B2A]">
        <MessageCircle size={48} className="text-gray-300 mb-4" />
        <p className="font-bold text-gray-500 mb-1">No conversations yet</p>
        <p className="text-sm text-gray-400">Messages from project managers will appear here</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-white">
      <Toaster position="top-right" />

      {/* Conversation List */}
      <div
        className={`
          w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col
          ${activeConversation ? "hidden md:flex" : "flex"}
        `}
      >
        {/* List Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-[#0D1B2A]">Messages</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Conversations with project managers
          </p>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`w-full text-left px-6 py-4 border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                  activeConversation?.id === conv.id
                    ? "bg-blue-50 border-l-4 border-l-[#2563EB]"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0D1B2A] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {conv.participantName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-[#0D1B2A] text-sm truncate">
                        {conv.participantName}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {conv.participantRole}
                    </span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400">
              <MessageCircle size={48} className="mb-3 opacity-40" />
              <p className="font-bold text-gray-500 mb-1">No conversations yet</p>
              <p className="text-sm text-center px-8">
                Messages from project managers will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`
          flex-1 flex flex-col
          ${!activeConversation ? "hidden md:flex" : "flex"}
        `}
      >
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <button
                onClick={() => setActiveConversation(null)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="w-10 h-10 rounded-full bg-[#0D1B2A] flex items-center justify-center text-white text-sm font-bold">
                {activeConversation.participantName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-[#0D1B2A]">
                  {activeConversation.participantName}
                </p>
                <p className="text-xs text-gray-500">
                  {activeConversation.participantRole}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2
                    size={24}
                    className="animate-spin text-[#2563EB]"
                  />
                </div>
              ) : messages.length > 0 ? (
                <>
                  {messages.map((msg, idx) => {
                    const own = isOwnMessage(msg);
                    const showTimestamp =
                      idx === 0 ||
                      new Date(msg.timestamp).getTime() -
                        new Date(messages[idx - 1].timestamp).getTime() >
                        300000;

                    return (
                      <React.Fragment key={msg.id}>
                        {showTimestamp && (
                          <div className="text-center">
                            <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
                              {new Date(msg.timestamp).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              at{" "}
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15 }}
                          className={`flex ${own ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] ${
                              own
                                ? "bg-[#0D1B2A] text-white rounded-2xl rounded-br-md"
                                : "bg-white text-[#0D1B2A] rounded-2xl rounded-bl-md border border-gray-100 shadow-sm"
                            } px-4 py-3`}
                          >
                            {!own && (
                              <p className="text-xs font-bold mb-1 text-[#2563EB]">
                                {msg.senderName}
                              </p>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                own ? "text-gray-300" : "text-gray-400"
                              }`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle size={32} className="mb-2 opacity-40" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white">
              <div className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] resize-none max-h-32"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-[#0D1B2A] text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <MessageCircle size={64} className="mb-4 opacity-30" />
            <h3 className="text-lg font-bold text-gray-500 mb-1">
              Select a conversation
            </h3>
            <p className="text-sm">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
