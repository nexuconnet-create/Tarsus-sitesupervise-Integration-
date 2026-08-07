"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ChevronLeft,
  Send,
  Phone,
  Truck,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { MOCK_PURCHASE_ORDERS, MOCK_DRIVER_MESSAGES } from "@/lib/mockData/vendor";
import type { DriverMessage } from "@/lib/types/vendor";

const VENDOR_ID = "vendor-1";

export default function DriverChatPage() {
  const params = useParams();
  const router = useRouter();
  const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === params.id && p.vendorId === VENDOR_ID);
  const initialMsgs = po ? (MOCK_DRIVER_MESSAGES[po.id] || []).map((m) => ({ ...m, read: true })) : [];
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<DriverMessage[]>(initialMsgs);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [params.id, po]);

  const handleSend = async () => {
    if (!newMessage.trim() || !po) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 300));
    const msg: DriverMessage = {
      id: `dm-${crypto.randomUUID()}`,
      purchaseOrderId: po.id,
      senderId: "vendor-1",
      senderName: "ABC Cement",
      senderRole: "vendor",
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
    setSending(false);
    toast.success("Message sent");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#0D1B2A]">
        <Loader2 size={28} className="animate-spin text-[#0D1B2A]" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#0D1B2A]">
        <p className="font-bold mb-4">Purchase order not found</p>
        <button onClick={() => router.back()} className="text-sm text-[#2563EB] underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#E3E3E3]">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-[#0D1B2A] flex items-center justify-center text-white font-bold">
            {po.driverName?.charAt(0) || "D"}
          </div>
          <div>
            <p className="font-bold text-[#0D1B2A] text-sm">{po.driverName || "Driver"}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Truck size={10} /> {po.vehiclePlate || "No plate"} · {po.poNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {po.driverPhone && (
            <a
              href={`tel:${po.driverPhone}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Phone size={18} className="text-gray-600" />
            </a>
          )}
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <div className="text-right">
            <p className="text-xs text-gray-500">Project</p>
            <p className="text-xs font-bold text-[#0D1B2A]">{po.projectName || po.projectId}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="font-bold text-gray-500 mb-1">No messages yet</p>
            <p className="text-sm text-gray-400">Start the conversation with the driver</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isVendor = msg.senderRole === "vendor";
            return (
              <div
                key={msg.id}
                className={`flex ${isVendor ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                    isVendor
                      ? "bg-[#0D1B2A] text-white rounded-br-md"
                      : "bg-white text-[#0D1B2A] border border-gray-100 rounded-bl-md"
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isVendor ? "text-white/50" : "text-gray-400"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString("en-NG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {!isVendor && ` · ${msg.senderName}`}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="w-11 h-11 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Vendor to Driver communication</p>
      </div>
    </div>
  );
}
