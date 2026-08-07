"use client";

import { useState, useRef, useEffect } from "react";
import {
  StickyNote,
  Send,
  User,
  Bell,
  Paperclip,
  ChevronDown,
  Lock,
} from "lucide-react";
import type { TaskNote } from "../types";

interface NotesTabProps {
  notes?: TaskNote[];
  taskId: string;
  onSendNote?: (taskId: string, note: TaskNote) => void;
  senderRole?: string;
  availableRecipients?: string[];
}

type TabType = "updates" | "attention" | "private";

export default function NotesTab({
  notes = [],
  taskId,
  onSendNote,
  senderRole = "Project Engineer",
  availableRecipients = ["Project Engineer", "Project Manager"],
}: NotesTabProps) {
  const [replyContent, setReplyContent] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("updates");
  const [selectedRecipient, setSelectedRecipient] = useState(
    availableRecipients[0],
  );
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [attachment, setAttachment] = useState<{
    name: string;
    data: string;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowRecipientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes, activeTab]);

  const getNoteType = (): TaskNote["noteType"] => {
    switch (activeTab) {
      case "attention":
        return "attention";
      case "private":
        return "private";
      default:
        return "update";
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchesRecipient =
      n.recipientRole === selectedRecipient ||
      (!n.recipientRole && selectedRecipient === "Project Engineer");
    const matchesTab =
      activeTab === "attention"
        ? n.noteType === "attention"
        : activeTab === "private"
          ? n.noteType === "private"
          : n.noteType === "update";
    return matchesRecipient && matchesTab;
  });

  const getTabCounts = () => {
    return {
      updates: notes.filter(
        (n) =>
          (n.recipientRole === selectedRecipient ||
            (!n.recipientRole && selectedRecipient === "Project Engineer")) &&
          n.noteType === "update",
      ).length,
      attention: notes.filter(
        (n) =>
          (n.recipientRole === selectedRecipient ||
            (!n.recipientRole && selectedRecipient === "Project Engineer")) &&
          n.noteType === "attention",
      ).length,
      private: notes.filter(
        (n) =>
          (n.recipientRole === selectedRecipient ||
            (!n.recipientRole && selectedRecipient === "Project Engineer")) &&
          n.noteType === "private",
      ).length,
    };
  };

  const counts = getTabCounts();

  const handleSend = () => {
    if (!replyContent.trim() || !onSendNote) return;

    const note: TaskNote = {
      id: `note-${Date.now()}`,
      sender: "You",
      senderRole,
      content: attachment
        ? `${replyContent.trim()} [Attachment: ${attachment.name}]`
        : replyContent.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      noteType: getNoteType(),
      recipientRole: selectedRecipient,
      attachments: attachment
        ? [
            {
              name: attachment.name,
              url: attachment.data,
              type: attachment.name.split(".").pop() || "file",
            },
          ]
        : undefined,
    };

    onSendNote(taskId, note);
    setReplyContent("");
    setAttachment(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachment({ name: file.name, data: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case "attention":
        return {
          title: "No notes requiring attention",
          subtitle: "Notes marked as requiring attention will appear here",
        };
      case "private":
        return {
          title: "No private messages",
          subtitle: "Start a private conversation here",
        };
      default:
        return {
          title: "No updates yet",
          subtitle: "Send an update to start the conversation",
        };
    }
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Tab Switcher */}
        <div className="px-4 pt-3 pb-2 shrink-0 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Chat with:</span>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowRecipientDropdown(!showRecipientDropdown)}
                className="flex items-center gap-1 text-xs text-[#007AFF] hover:text-blue-700 font-medium"
              >
                {selectedRecipient}
                <ChevronDown size={12} />
              </button>
              {showRecipientDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                  {availableRecipients.map((recipient) => (
                    <button
                      key={recipient}
                      onClick={() => {
                        setSelectedRecipient(recipient);
                        setShowRecipientDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                        selectedRecipient === recipient
                          ? "text-[#007AFF] font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {recipient}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("updates")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "updates"
                  ? "bg-white text-[#021422] shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <span>Updates</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "updates" ? "bg-[#021422] text-white" : "bg-gray-200 text-gray-600"}`}
              >
                {counts.updates}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("attention")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "attention"
                  ? "bg-white text-[#021422] shadow-sm"
                  : counts.attention > 0
                    ? "text-red-600"
                    : "text-gray-500"
              }`}
            >
              {" "}
              no
              <span>Requires Attention</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "attention" ? "bg-red-500 text-white" : counts.attention > 0 ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-600"}`}
              >
                {counts.attention}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("private")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "private"
                  ? "bg-white text-[#021422] shadow-sm"
                  : counts.private > 0
                    ? "text-purple-600"
                    : "text-gray-500"
              }`}
            >
              <span>Private</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "private" ? "bg-purple-500 text-white" : counts.private > 0 ? "bg-purple-100 text-purple-600" : "bg-gray-200 text-gray-600"}`}
              >
                {counts.private}
              </span>
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <StickyNote size={28} className="opacity-50" />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">
            No Notes Yet
          </h3>
          <p className="text-xs text-gray-400">
            Private notes between crew manager and engineer will appear here
          </p>
        </div>
      </div>
    );
  }

  const emptyState = getEmptyMessage();

  return (
    <div className="flex flex-col h-full">
      {/* Tab Switcher */}
      <div className="px-4 pt-3 pb-2 shrink-0 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Chat with:</span>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowRecipientDropdown(!showRecipientDropdown)}
              className="flex items-center gap-1 text-xs text-[#007AFF] hover:text-blue-700 font-medium"
            >
              {selectedRecipient}
              <ChevronDown size={12} />
            </button>
            {showRecipientDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                {availableRecipients.map((recipient) => (
                  <button
                    key={recipient}
                    onClick={() => {
                      setSelectedRecipient(recipient);
                      setShowRecipientDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                      selectedRecipient === recipient
                        ? "text-[#007AFF] font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {recipient}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("updates")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "updates"
                ? "bg-white text-[#021422] shadow-sm"
                : "text-gray-500"
            }`}
          >
            <span>Updates</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "updates" ? "bg-[#021422] text-white" : "bg-gray-200 text-gray-600"}`}
            >
              {counts.updates}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("attention")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "attention"
                ? "bg-white text-[#021422] shadow-sm"
                : counts.attention > 0
                  ? "text-red-600"
                  : "text-gray-500"
            }`}
          >
            <span>Requires Attention</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "attention" ? "bg-red-500 text-white" : counts.attention > 0 ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-600"}`}
            >
              {counts.attention}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("private")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "private"
                ? "bg-white text-[#021422] shadow-sm"
                : counts.private > 0
                  ? "text-purple-600"
                  : "text-gray-500"
            }`}
          >
            <span>Private</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "private" ? "bg-purple-500 text-white" : counts.private > 0 ? "bg-purple-100 text-purple-600" : "bg-gray-200 text-gray-600"}`}
            >
              {counts.private}
            </span>
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <StickyNote size={28} className="opacity-30" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              {emptyState.title}
            </p>
            <p className="text-xs text-gray-400 mt-1 text-center max-w-[200px]">
              {emptyState.subtitle}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-xl border ${
                !note.read
                  ? "bg-blue-50 border-blue-200"
                  : note.noteType === "attention"
                    ? "bg-red-50 border-red-200"
                    : note.noteType === "private"
                      ? "bg-purple-50 border-purple-200"
                      : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#021422] flex items-center justify-center shrink-0">
                  <User size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#021422]">
                        {note.sender}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">
                        {note.senderRole}
                      </span>
                      {note.noteType === "attention" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[9px] font-bold uppercase">
                          <Bell size={8} />
                          Urgent
                        </span>
                      )}
                      {note.noteType === "private" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[9px] font-bold uppercase">
                          <Lock size={8} />
                          Private
                        </span>
                      )}
                      {!note.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {formatTime(note.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply Input */}
      <div className="border-t border-gray-200 p-4">
        {attachment && (
          <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <Paperclip size={14} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-700 flex-1 truncate">
              {attachment.name}
            </span>
            <button
              onClick={() => setAttachment(null)}
              className="text-blue-400 hover:text-blue-600"
            >
              Ã—
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileAttach}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors"
            title="Attach file"
          >
            <Paperclip size={16} />
          </button>
          <input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeTab === "private"
                ? "Write a private message..."
                : activeTab === "attention"
                  ? "Write a note requiring attention..."
                  : "Write an update..."
            }
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!replyContent.trim()}
            className="p-2.5 bg-[#021422] text-white rounded-lg hover:bg-[#0a2a3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
