"use client";

import { useState } from "react";
import { Flag, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import type { Task } from "../types";

interface AttentionItem {
  taskId: string;
  taskTitle: string;
  messageId: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface RequiresAttentionSectionProps {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onResolve: (taskId: string, messageId: string) => void;
}

export default function RequiresAttentionSection({
  tasks,
  onOpenTask,
  onResolve,
}: RequiresAttentionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const attentionItems: AttentionItem[] = tasks.flatMap((task) =>
    (task.communications || [])
      .filter((msg) => msg.requiresAttention)
      .map((msg) => ({
        taskId: task.id,
        taskTitle: task.title,
        messageId: msg.id,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
      }))
  );

  if (attentionItems.length === 0) return null;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 bg-red-50 hover:bg-red-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <Flag size={16} className="text-red-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-red-800">
              Requires Attention
            </h3>
            <p className="text-xs text-red-600">
              {attentionItems.length} item{attentionItems.length > 1 ? "s" : ""}{" "}
              need review
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="text-red-400" />
        ) : (
          <ChevronDown size={18} className="text-red-400" />
        )}
      </button>

      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {attentionItems.map((item) => (
            <div
              key={item.messageId}
              className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#021422] bg-gray-100 px-1.5 py-0.5 rounded">
                    {item.taskId}
                  </span>
                  <span className="text-sm font-semibold text-[#021422] truncate">
                    {item.taskTitle}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{item.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">{item.sender}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const task = tasks.find((t) => t.id === item.taskId);
                    if (task) onOpenTask(task);
                  }}
                  className="text-xs font-semibold text-[#007AFF] hover:underline"
                >
                  View
                </button>
                <button
                  onClick={() => onResolve(item.taskId, item.messageId)}
                  className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded hover:bg-green-100 transition-colors"
                >
                  <CheckCircle size={12} />
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
