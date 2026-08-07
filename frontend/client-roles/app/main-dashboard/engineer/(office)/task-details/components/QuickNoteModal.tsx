"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, User, Paperclip, ChevronDown } from "lucide-react";
import type { TaskNote } from "../types";

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  recipientRole: string;
  existingNotes?: TaskNote[];
  onSend: (taskId: string, note: TaskNote) => void;
  availableRecipients?: string[];
}

type TabType = "updates" | "attention" | "private";

export default function QuickNoteModal({
  isOpen,
  onClose,
  taskId,
  recipientRole,
  existingNotes = [],
  onSend,
  availableRecipients = ["Project Engineer", "Project Manager"],
}: QuickNoteModalProps) {
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("updates");
  const [selectedRecipient, setSelectedRecipient] = useState(availableRecipients.includes(recipientRole) ? recipientRole : availableRecipients[0]);
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; data: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    }
  }, [existingNotes, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowRecipientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const filteredNotes = existingNotes.filter((n) => {
    const matchesRecipient = n.recipientRole === selectedRecipient || (!n.recipientRole && selectedRecipient === "Project Engineer");
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
      updates: existingNotes.filter(
        (n) => (n.recipientRole === selectedRecipient || (!n.recipientRole && selectedRecipient === "Project Engineer")) && n.noteType === "update",
      ).length,
      attention: existingNotes.filter(
        (n) => (n.recipientRole === selectedRecipient || (!n.recipientRole && selectedRecipient === "Project Engineer")) && n.noteType === "attention",
      ).length,
      private: existingNotes.filter(
        (n) => (n.recipientRole === selectedRecipient || (!n.recipientRole && selectedRecipient === "Project Engineer")) && n.noteType === "private",
      ).length,
    };
  };

  const counts = getTabCounts();

  if (!isOpen) return null;

  const handleSend = () => {
    if (!content.trim()) return;

    const note: TaskNote = {
      id: `note-${Date.now()}`,
      sender: "You",
      senderRole: "Site Supervisor",
      content: attachment ? `${content.trim()} [Attachment: ${attachment.name}]` : content.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      noteType: getNoteType(),
      recipientRole: selectedRecipient,
      attachments: attachment
        ? [{ name: attachment.name, url: attachment.data, type: attachment.name.split(".").pop() || "file" }]
        : undefined,
    };

    onSend(taskId, note);
    setContent("");
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
        return { title: "No notes requiring attention", subtitle: "Notes marked as requiring attention will appear here" };
      case "private":
        return { title: "No private messages", subtitle: "Start a private conversation here" };
      default:
        return { title: "No updates yet", subtitle: "Send an update to start the conversation" };
    }
  };

  const emptyState = getEmptyMessage();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-[#021422]">Notes</h3>
            {/* Recipient Dropdown */}
            <div className="relative mt-1" ref={dropdownRef}>
              <button
                onClick={() => setShowRecipientDropdown(!showRecipientDropdown)}
                className="flex items-center gap-1 text-xs text-[#007AFF] hover:text-blue-700 font-medium"
              >
                Private chat with {selectedRecipient}
                <ChevronDown size={12} />
              </button>
              {showRecipientDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[180px]">
                  {availableRecipients.map((recipient) => (
                    <button
                      key={recipient}
                      onClick={() => {
                        setSelectedRecipient(recipient);
                        setShowRecipientDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                        selectedRecipient === recipient ? "text-[#007AFF] font-medium" : "text-gray-700"
                      }`}
                    >
                      {recipient}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-[#021422]" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("updates")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeTab === "updates"
                  ? "bg-white text-[#021422] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>Updates</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold min-w-[20px] text-center ${
                  activeTab === "updates"
                    ? "bg-[#021422] text-white"
                    : counts.updates > 0
                    ? "bg-gray-200 text-gray-600"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {counts.updates}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("attention")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 relative ${
                activeTab === "attention"
                  ? "bg-white text-[#021422] shadow-sm"
                  : counts.attention > 0
                  ? "text-red-600 hover:text-red-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>Requires Attention</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold min-w-[20px] text-center ${
                  activeTab === "attention"
                    ? counts.attention > 0
                      ? "bg-red-500 text-white"
                      : "bg-gray-600 text-white"
                    : counts.attention > 0
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {counts.attention}
              </span>
              {counts.attention > 0 && activeTab !== "attention" && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("private")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 relative ${
                activeTab === "private"
                  ? "bg-white text-[#021422] shadow-sm"
                  : counts.private > 0
                  ? "text-purple-600 hover:text-purple-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>Private</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold min-w-[20px] text-center ${
                  activeTab === "private"
                    ? "bg-purple-500 text-white"
                    : counts.private > 0
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {counts.private}
              </span>
              {counts.private > 0 && activeTab !== "private" && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <User size={28} className="opacity-30" />
              </div>
              <p className="text-sm font-medium text-gray-500">{emptyState.title}</p>
              <p className="text-xs text-gray-400 mt-1 text-center max-w-[200px]">
                {emptyState.subtitle}
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isOwn = note.sender === "You";
              return (
                <div
                  key={note.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-semibold text-gray-500">
                        {note.sender}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatTime(note.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isOwn
                          ? "bg-[#021422] text-white rounded-br-md"
                          : note.noteType === "attention"
                          ? "bg-red-50 text-[#021422] rounded-bl-md border border-red-200"
                          : note.noteType === "private"
                          ? "bg-purple-50 text-[#021422] rounded-bl-md border border-purple-200"
                          : "bg-gray-100 text-[#021422] rounded-bl-md"
                      }`}
                    >
                      {note.content}
                    </div>
                    {!isOwn && (
                      <span className="text-[10px] text-gray-400 mt-1">
                        {selectedRecipient}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 shrink-0">
          {attachment && (
            <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <Paperclip size={14} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-700 flex-1 truncate">{attachment.name}</span>
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
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeTab === "private"
                  ? "Type a private message..."
                  : activeTab === "attention"
                  ? "Type a note requiring attention..."
                  : "Type an update..."
              }
              className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!content.trim()}
              className="p-2.5 bg-[#021422] text-white rounded-full hover:bg-[#0a2a3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
