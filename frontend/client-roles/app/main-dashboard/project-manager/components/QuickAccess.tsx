"use client";

import React from "react";
import {
  FolderOpen,
  FileText,
  MessageCircle,
  Calendar,
  Zap,
} from "lucide-react";

interface QuickAccessProps {
  projects?: { name: string; time: string }[];
  documents?: { name: string; time: string }[];
  messages?: { name: string; time: string }[];
  deadlines?: { name: string; time: string; status: "behind" | "on-track" | "at-risk" }[];
}

const QuickAccess: React.FC<QuickAccessProps> = ({
  projects = [],
  documents = [],
  messages = [],
  deadlines = [],
}) => {
  const statusStyle = {
    "behind": "text-red-600 font-bold",
    "on-track": "text-emerald-600 font-bold",
    "at-risk": "text-amber-600 font-bold",
  };

  const statusIcon = {
    "behind": "⚠",
    "on-track": "✓",
    "at-risk": "⏳",
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-[#021422]" />
        <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
          QUICK ACCESS — Recent Activities
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Projects */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <FolderOpen size={14} className="text-[#021422]" />
            <h3 className="text-xs font-bold text-[#021422] uppercase tracking-wider">
              RECENT PROJECTS
            </h3>
          </div>
          <div className="space-y-3">
            {projects.length === 0 && (
              <p className="py-2 text-sm text-gray-500">No recent projects.</p>
            )}
            {projects.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-[#021422] font-medium">{p.name}</span>
                <span className="text-[10px] text-gray-400 font-medium">{p.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <FileText size={14} className="text-[#021422]" />
            <h3 className="text-xs font-bold text-[#021422] uppercase tracking-wider">
              RECENT DOCUMENTS
            </h3>
          </div>
          <div className="space-y-3">
            {documents.length === 0 && (
              <p className="py-2 text-sm text-gray-500">No recent documents.</p>
            )}
            {documents.map((d, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-[#021422] font-medium">{d.name}</span>
                <span className="text-[10px] text-gray-400 font-medium">{d.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <MessageCircle size={14} className="text-[#021422]" />
            <h3 className="text-xs font-bold text-[#021422] uppercase tracking-wider">
              RECENT MESSAGES
            </h3>
          </div>
          <div className="space-y-3">
            {messages.length === 0 && (
              <p className="py-2 text-sm text-gray-500">No recent messages.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-[#021422] font-medium">{m.name}</span>
                <span className="text-[10px] text-gray-400 font-medium">{m.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <Calendar size={14} className="text-[#021422]" />
            <h3 className="text-xs font-bold text-[#021422] uppercase tracking-wider">
              UPCOMING DEADLINES
            </h3>
          </div>
          <div className="space-y-3">
            {deadlines.length === 0 && (
              <p className="py-2 text-sm text-gray-500">No upcoming deadlines.</p>
            )}
            {deadlines.map((d, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-[#021422] font-medium">{d.name}</span>
                {d.time && (
                  <span className={`text-[10px] font-bold ${statusStyle[d.status]}`}>
                    {statusIcon[d.status]} {d.time}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAccess;
