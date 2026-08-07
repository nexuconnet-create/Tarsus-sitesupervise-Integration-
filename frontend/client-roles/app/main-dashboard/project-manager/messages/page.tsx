"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Hash,
  MessageSquare,
  Bell,
  FileText,
  AlertTriangle,
  Wrench,
  Users,
  Send,
  Paperclip,
  Mic,
  Video,
  Plus,
  BarChart3,
  Filter,
  Zap,
  User,
} from "lucide-react";

const channels = [
  { name: "General", unread: 12, icon: MessageSquare },
  { name: "Site Updates", unread: 8, icon: Wrench },
  { name: "Tasks", unread: 5, icon: FileText },
  { name: "Alerts", unread: 3, icon: AlertTriangle },
  { name: "Documents", unread: 7, icon: FileText },
];

const directMessages = [
  { name: "Engr. Adebayo (PM)", online: true },
  { name: "Engr. Adebayo (Site)", online: true },
  { name: "Client J.Olu", online: false },
  { name: "Project Director", online: true },
];

const chatMessages = [
  { sender: "Engr. Adebayo (PM)", time: "12:45", content: "Team, we need to review the rebar spacing on Zone B3.", isOwn: true },
  { sender: "Site Foreman", time: "12:48", content: "I've inspected the area. 12 rebars need repositioning.", isOwn: false },
  { sender: "Engr. Adebayo (PM)", time: "12:52", content: "Great. Please create a task for this.", isOwn: true },
];

const MessagesPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"channels" | "direct">("channels");
  const [activeChannel, setActiveChannel] = useState("General");
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Messages...</div>;
  }

  return (
    <div className="pb-24 text-[#021422]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
            MESSAGING & COMMUNICATION
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Project: Lagos 12-Storey Mixed-Use Development</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Unread: 12
            </span>
            <span className="text-gray-300">|</span>
            <span>Active Channels: 5</span>
            <span className="text-gray-300">|</span>
            <span>Online: 8</span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search conversations, files, mentions..."
              className="flex-1 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none"
            />
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Filter size={16} />
            </button>
            <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-500 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <Zap size={12} /> Smart Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Channels */}
          <div className="lg:col-span-1 space-y-6">
            {/* Channels */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Hash size={16} className="text-[#021422]" />
                <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">CHANNELS</h2>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("channels")}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded transition-colors ${
                    activeTab === "channels" ? "bg-[#021422] text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Project Channels
                </button>
                <button
                  onClick={() => setActiveTab("direct")}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded transition-colors ${
                    activeTab === "direct" ? "bg-[#021422] text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  General Chat
                </button>
              </div>

              {/* Channel List */}
              {activeTab === "channels" ? (
                <div className="space-y-0">
                  {channels.map((ch, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveChannel(ch.name)}
                      className={`w-full flex items-center justify-between py-3 border-b border-gray-50 last:border-0 text-left transition-colors ${
                        activeChannel === ch.name ? "bg-gray-50" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ch.icon size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{ch.name}</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold text-gray-500 bg-gray-100 rounded">
                        {ch.unread}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 text-center py-4">General chat channel</div>
              )}
            </div>

            {/* Direct Messages */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-[#021422]" />
                <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">DIRECT MESSAGES</h2>
              </div>
              <div className="space-y-0">
                {directMessages.map((dm, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dm.online ? "bg-emerald-500" : "bg-gray-300"}`} />
                      <span className="text-sm font-medium text-gray-700">{dm.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Chat Area */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-gray-400" />
                <h3 className="text-sm font-bold text-[#021422]">{activeChannel}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                  <Bell size={14} />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                  <Users size={14} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-[300px] max-h-[500px] bg-gray-50/30">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] ${msg.isOwn ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{msg.sender}</span>
                      <span className="text-[10px] text-gray-400">{msg.time}</span>
                    </div>
                    <div className={`p-3 rounded-lg text-sm font-medium ${
                      msg.isOwn
                        ? "bg-[#0166B0] text-white rounded-br-sm"
                        : "bg-white text-gray-700 border border-gray-100 rounded-bl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0166B0]/20 focus:border-[#0166B0]"
                  />
                </div>
                <button className="p-2.5 text-white bg-[#0166B0] rounded-lg hover:bg-blue-700 transition-colors">
                  <Send size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  <Plus size={12} /> New Message
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  <Paperclip size={12} /> Attach File
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  <Mic size={12} /> Voice Note
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  <Video size={12} /> Video Call
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-[#021422] rounded hover:bg-gray-800 transition-colors">
                  <FileText size={12} /> Create Task
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Communication Statistics */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">COMMUNICATION STATISTICS</h2>
          </div>
          <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-700">
            <span>Total Messages (Today): <span className="font-bold text-[#021422]">234</span></span>
            <span className="text-gray-300">|</span>
            <span>Active Users: <span className="font-bold text-[#021422]">8/12</span></span>
            <span className="text-gray-300">|</span>
            <span>Avg Response: <span className="font-bold text-[#021422]">3.2 min</span></span>
            <span className="text-gray-300">|</span>
            <span>Mentions: <span className="font-bold text-[#021422]">12</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
