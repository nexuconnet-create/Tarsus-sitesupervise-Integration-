"use client";

import React, { useState } from "react";
import {
  Send,
  Paperclip,
  Mic,
  LayoutTemplate,
  FileText,
  Search,
  FileSearch,
  Eye,
  BarChart3,
  AlertTriangle,
  ShieldCheck,
  Download,
  Cpu,
  FileCheck,
  Share2,
  Filter,
  LineChart,
  CheckCircle,
  XCircle,
  Edit3,
} from "lucide-react";

const AIChatAssistant = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const suggestions = [
    "What is the total value of all change orders?",
    "Summarize the latest foundation inspection report for me",
    "Generate a progress report for the last 2 weeks",
  ];

  const handleSend = () => {
    if (!query.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "AI response would appear here. This is a placeholder for the document assistant reply.",
        },
      ]);
      setLoading(false);
    }, 1500);
    setQuery("");
  };

  return (
    <div className="space-y-6">
      <div className="text-sm font-bold text-[#021422] uppercase tracking-wider flex items-center gap-2">
        <Cpu size={16} />
        AI Chat Assistant
      </div>

      {/* Chat Messages */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 min-h-[120px] max-h-[300px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-sm text-gray-400 italic text-center py-8">
            Ask anything about your project documents...
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-lg text-sm font-medium ${
                    msg.role === "user"
                      ? "bg-[#021422] text-white"
                      : "bg-gray-100 text-[#021422]"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2.5 rounded-lg text-sm text-gray-500 animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => setQuery(s)}
            className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#0166B0] hover:text-[#0166B0] transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about your documents..."
          className="flex-1 bg-white border border-gray-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0166B0]/20 focus:border-[#0166B0]"
        />
        <button
          onClick={handleSend}
          disabled={!query.trim() || loading}
          className="bg-[#021422] text-white px-6 py-3 rounded-lg font-bold text-sm uppercase flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <Send size={14} />
          Send
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Paperclip size={14} />
          Attach File
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Mic size={14} />
          Voice Input
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <LayoutTemplate size={14} />
          Template
        </button>
      </div>
    </div>
  );
};

const quickActions = [
  { label: "Generate Weekly Report", icon: FileText },
  { label: "Find Similar Documents", icon: Search },
  { label: "Extract Contract Terms", icon: FileSearch },
  { label: "Auto-Review", icon: Eye },
  { label: "Financial Analysis", icon: BarChart3 },
  { label: "Risk Assessment", icon: AlertTriangle },
  { label: "Compliance Check", icon: ShieldCheck },
  { label: "Bulk Export", icon: Download },
];

const AIDocumentAssistant = () => {
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h1 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
            AI DOCUMENT ASSISTANT — Intelligent Document Processing
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Project: Lagos 12-Storey Mixed-Use Development</span>
            <span className="text-gray-300">|</span>
            <span>Available: 1,247 Documents</span>
            <span className="text-gray-300">|</span>
            <span>AI Model: DocNet V3.1</span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* AI Chat Assistant */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <AIChatAssistant />
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={18} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
              QUICK ACTIONS
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="flex items-center justify-center gap-2 p-4 bg-[#021422] text-white rounded-lg font-bold text-sm uppercase transition-colors hover:bg-gray-800"
                >
                  <Icon size={16} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI-Generated Analysis */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Cpu size={18} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
              AI-GENERATED ANALYSIS
            </h2>
          </div>

          {/* AI Message */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <FileCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-[#021422]">
                &quot;I have analyzed the project documents and found:&quot;
              </p>
            </div>
          </div>

          {/* Document Summary */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={14} className="text-[#021422]" />
              <h3 className="text-xs font-bold text-[#021422] uppercase tracking-wider">
                DOCUMENT SUMMARY:
              </h3>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-700 font-medium pl-6">
              <span>Total Documents: 1,247</span>
              <span>Reviewed: 892</span>
              <span>Pending Review: 355</span>
              <span>Approved: 745</span>
            </div>
          </div>

          {/* Key Findings */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Search size={14} className="text-[#021422]" />
              <h3 className="text-xs font-bold text-[#021422] uppercase tracking-wider">
                KEY FINDINGS:
              </h3>
            </div>
            <ol className="space-y-3 pl-6 text-sm text-gray-700 font-medium">
              <li>1. Total Change Orders: ₦45.2M (4.2% of BAC)</li>
              <li>2. 3 contracts approaching deadlines (within 30 days)</li>
              <li>3. Foundation inspection — PASSED (minor recommendations)</li>
              <li>4. 2 critical risk items requiring immediate attention</li>
              <li>5. Document compliance rate: 92.4%</li>
            </ol>
          </div>

          {/* AI Prompt */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <FileCheck size={16} className="text-[#021422]" />
              <p className="text-sm font-medium text-[#021422]">
                Would you like me to generate a detailed Executive Summary?
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
              <CheckCircle size={14} />
              Yes
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
              <XCircle size={14} />
              No
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Edit3 size={14} />
              Edit Prompt
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 size={14} />
              Share Analysis
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {/* AI-Powered Search & Discovery */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Search size={18} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
              AI-POWERED SEARCH & DISCOVERY
            </h2>
          </div>

          {/* Search Input */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder='Search for: "rebar specification" across all documents'
              className="flex-1 bg-white border border-gray-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0166B0]/20 focus:border-[#0166B0]"
            />
            <button className="bg-[#021422] text-white px-6 py-3 rounded-lg font-bold text-sm uppercase flex items-center gap-2 hover:bg-gray-800 transition-colors">
              <Search size={14} />
              Search
            </button>
            <button className="bg-[#0166B0] text-white px-4 py-3 rounded-lg font-bold text-sm uppercase flex items-center gap-2 hover:bg-blue-700 transition-colors">
              <Filter size={14} />
              Smart Filter
            </button>
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Results (24 documents found):
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {[
              {
                name: "Structural Drawings_Rev3.pdf",
                desc: 'Page 45 — "Rebar spacing 200mm"',
              },
              {
                name: "BOQ_Structural.xlsx",
                desc: '"Rebar Type: T16 @ 150mm"',
              },
              {
                name: "Foundation_Report.pdf",
                desc: '"Rebar inspection PASSED"',
              },
              {
                name: "Material_Specs.pdf",
                desc: '"Rebar Grade: 500N"',
              },
            ].map((doc, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <FileText size={14} className="text-gray-400 shrink-0" />
                  <div>
                    <span className="text-sm font-bold text-[#021422]">{doc.name}</span>
                    <span className="text-sm text-gray-500 ml-2">— {doc.desc}</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="p-1.5 text-gray-400 hover:text-[#021422] transition-colors" title="Download">
                    <Download size={14} />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-[#021422] transition-colors" title="View">
                    <Eye size={14} />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-[#021422] transition-colors" title="Analyze">
                    <Cpu size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={14} />
              Advanced Filters
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <LineChart size={14} />
              View Analytics
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={14} />
              Export All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDocumentAssistant;
