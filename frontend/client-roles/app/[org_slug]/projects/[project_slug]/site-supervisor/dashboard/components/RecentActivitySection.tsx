"use client";

import { useState } from "react";
import { Activity, ChevronDown, ChevronRight, MessageSquare, Flag } from "lucide-react";
import type { Task } from "../../task-details/types";

interface ActivityItem {
  taskId: string;
  taskTitle: string;
  messageId: string;
  sender: string;
  senderRole: string;
  content: string;
  timestamp: string;
  requiresAttention?: boolean;
}

interface RecentActivitySectionProps {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
}

export default function RecentActivitySection({
  tasks,
  onOpenTask,
}: RecentActivitySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCount, setShowCount] = useState(5);

  const allMessages: ActivityItem[] = tasks.flatMap((task) =>
    (task.communications || [])
      .filter((msg) => msg.source !== "system")
      .map((msg) => ({
        taskId: task.id,
        taskTitle: task.title,
        messageId: msg.id,
        sender: msg.sender,
        senderRole: msg.senderRole,
        content: msg.content,
        timestamp: msg.timestamp,
        requiresAttention: msg.requiresAttention,
      }))
  );

  allMessages.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const limitedMessages = allMessages.slice(0, 20);

  const visibleItems = limitedMessages.slice(0, showCount);

  if (limitedMessages.length === 0) return null;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
            <Activity size={16} className="text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-[#021422]">Recent Activity</h3>
            <p className="text-xs text-gray-500">
              {limitedMessages.length} message{limitedMessages.length > 1 ? "s" : ""} across all
              tasks
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown size={18} className="text-gray-400" />
        ) : (
          <ChevronRight size={18} className="text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="divide-y divide-gray-50">
          {visibleItems.map((item) => (
            <div
              key={item.messageId}
              onClick={() => {
                const task = tasks.find((t) => t.id === item.taskId);
                if (task) onOpenTask(task);
              }}
              className="px-6 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#021422] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-[10px] font-bold">
                  {item.sender.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#021422]">
                    {item.sender}
                  </span>
                  <span className="text-[10px] text-gray-400">{item.senderRole}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {item.taskId}
                  </span>
                  {item.requiresAttention && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded">
                      <Flag size={7} />
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate mt-0.5">
                  {item.content}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-400">
                    {formatTime(item.timestamp)}
                  </span>
                  <span className="text-[10px] text-gray-400 truncate">
                    in {item.taskTitle}
                  </span>
                </div>
              </div>
              <MessageSquare size={14} className="text-gray-300 shrink-0 mt-1" />
            </div>
          ))}

          {limitedMessages.length > showCount && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCount((prev) => Math.min(prev + 5, 20));
              }}
              className="w-full px-6 py-3 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Show more ({limitedMessages.length - showCount} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
