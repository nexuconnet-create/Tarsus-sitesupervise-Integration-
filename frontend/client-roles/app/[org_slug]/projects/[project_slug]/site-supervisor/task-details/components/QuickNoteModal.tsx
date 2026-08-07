"use client";

/* eslint-disable react-hooks/set-state-in-effect -- initialize the recipient after async data loads. */

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  X,
  Send,
  User,
  Paperclip,
  ChevronDown,
  Loader2,
  ChevronUp,
  Bell,
  Lock,
} from "lucide-react";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import {
  useTaskNoteRecipients,
  useTaskNoteUnreadCounts,
  useTaskNoteThread,
  useSendTaskNote,
} from "@/lib/hooks/useTaskNotes";
import type { NoteType } from "@/lib/types/taskNote";

// Local tab labels map to the API NoteType values
type TabType = "updates" | "attention" | "private";

const TAB_TO_NOTE_TYPE: Record<TabType, NoteType> = {
  updates: "updates",
  attention: "requires_attention",
  private: "private",
};

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
}

export default function QuickNoteModal({
  isOpen,
  onClose,
  taskId,
}: QuickNoteModalProps) {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const { data: projectId } = useProjectUuid(orgSlug, projectSlug);

  const [activeTab, setActiveTab] = useState<TabType>("updates");
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const noteType = TAB_TO_NOTE_TYPE[activeTab];
  const isDirectedTab = activeTab !== "updates";

  // ── Data ────────────────────────────────────────────────────────────────────

  const { data: recipients = [], isLoading: loadingRecipients } =
    useTaskNoteRecipients(isOpen ? projectId : undefined, taskId);

  const { data: unreadCounts } = useTaskNoteUnreadCounts(
    isOpen ? projectId : undefined,
    taskId,
  );

  const {
    data: threadData,
    isLoading: loadingThread,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTaskNoteThread(
    isOpen ? projectId : undefined,
    taskId,
    noteType,
    isDirectedTab ? selectedRecipientId : null,
  );

  const { mutate: sendNote, isPending: sending } = useSendTaskNote(
    projectId,
    taskId,
    noteType,
    isDirectedTab ? selectedRecipientId : null,
  );

  // Flatten pages oldest → newest for chronological display
  const notes = threadData
    ? [...threadData.pages].reverse().flatMap((p) => p.notes)
    : [];

  // ── Side-effects ────────────────────────────────────────────────────────────

  // Auto-select first recipient when list loads
  useEffect(() => {
    if (recipients.length > 0 && !selectedRecipientId) {
      setSelectedRecipientId(recipients[0].id);
    }
  }, [recipients, selectedRecipientId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowRecipientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll to bottom when notes load or tab changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [notes.length, activeTab, isOpen]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSend = () => {
    if ((!body.trim() && !attachment) || sending || !projectId) return;
    if (isDirectedTab && !selectedRecipientId) return;
    sendNote(
      { body: body.trim() || undefined, attachment: attachment ?? undefined },
      {
        onSuccess: () => {
          setBody("");
          setAttachment(null);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachment(file);
    e.target.value = "";
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ── Derived ─────────────────────────────────────────────────────────────────

  const selectedRecipient = recipients.find((r) => r.id === selectedRecipientId);

  const counts = {
    updates: unreadCounts?.updates ?? 0,
    attention: unreadCounts?.requires_attention ?? 0,
    private: unreadCounts?.private ?? 0,
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case "attention":
        return {
          title: "No notes requiring attention",
          subtitle: "Notes marked as requiring attention will appear here",
        };
      case "private":
        return { title: "No private messages", subtitle: "Start a private conversation here" };
      default:
        return { title: "No updates yet", subtitle: "Send an update to start the conversation" };
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case "attention": return "Type a note requiring attention…";
      case "private": return "Type a private message…";
      default: return "Type an update…";
    }
  };

  if (!isOpen) return null;

  const emptyState = getEmptyMessage();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-[#021422]">Notes</h3>

            {/* Recipient selector shown only for directed tabs */}
            {isDirectedTab && (
              <div className="relative mt-1" ref={dropdownRef}>
                <button
                  onClick={() => setShowRecipientDropdown(!showRecipientDropdown)}
                  disabled={loadingRecipients}
                  className="flex items-center gap-1 text-xs text-[#007AFF] hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  {loadingRecipients ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <>
                      {selectedRecipient
                        ? `${selectedRecipient.full_name} · ${selectedRecipient.role}`
                        : "Select recipient"}
                      <ChevronDown size={12} />
                    </>
                  )}
                </button>
                {showRecipientDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[200px]">
                    {loadingRecipients || !projectId ? (
                      <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400">
                        <Loader2 size={12} className="animate-spin" />
                        Loading recipients…
                      </div>
                    ) : recipients.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-gray-400">
                        No eligible recipients found.
                      </div>
                    ) : (
                      recipients.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setSelectedRecipientId(r.id);
                            setShowRecipientDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                            selectedRecipientId === r.id
                              ? "text-[#007AFF] font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          <span className="font-medium">{r.full_name}</span>
                          <span className="text-gray-400 ml-1">· {r.role}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "updates" && (
              <p className="text-xs text-gray-400 mt-0.5">Broadcast to all eligible roles</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-[#021422]" />
          </button>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            {(["updates", "attention", "private"] as TabType[]).map((tab) => {
              const count = counts[tab];
              const isActive = activeTab === tab;
              const badgeClass = isActive
                ? tab === "attention"
                  ? "bg-red-500 text-white"
                  : tab === "private"
                    ? "bg-purple-500 text-white"
                    : "bg-[#021422] text-white"
                : tab === "attention"
                  ? "bg-red-100 text-red-600"
                  : tab === "private"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-200 text-gray-600";
              const inactiveText = isActive
                ? "text-[#021422]"
                : tab === "attention" && count > 0
                  ? "text-red-600"
                  : tab === "private" && count > 0
                    ? "text-purple-600"
                    : "text-gray-500";
              const label =
                tab === "updates" ? "Updates" : tab === "attention" ? "Requires Attention" : "Private";

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all relative ${
                    isActive ? "bg-white shadow-sm" : ""
                  } ${inactiveText}`}
                >
                  <span>{label}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                      {count}
                    </span>
                  )}
                  {!isActive && count > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse ${
                        tab === "attention" ? "bg-red-500" : "bg-purple-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
          {/* Load older button */}
          {hasNextPage && (
            <div className="flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-500 hover:text-[#007AFF] border border-gray-200 rounded-full hover:border-[#007AFF] transition-colors disabled:opacity-50"
              >
                {isFetchingNextPage ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <ChevronUp size={11} />
                )}
                Load earlier
              </button>
            </div>
          )}

          {loadingThread && notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Loader2 size={22} className="animate-spin text-gray-300" />
              <p className="text-xs text-gray-400 mt-2">Loading…</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <User size={24} className="opacity-30" />
              </div>
              <p className="text-sm font-medium text-gray-500">{emptyState.title}</p>
              <p className="text-xs text-gray-400 mt-1 text-center max-w-[200px]">
                {emptyState.subtitle}
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`flex ${note.is_mine ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] flex flex-col ${note.is_mine ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-gray-500">
                      {note.is_mine ? "You" : (note.sender_name ?? "Unknown")}
                    </span>
                    {note.note_type === "requires_attention" && !note.is_mine && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[9px] font-bold uppercase">
                        <Bell size={8} />
                        Urgent
                      </span>
                    )}
                    {note.note_type === "private" && !note.is_mine && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[9px] font-bold uppercase">
                        <Lock size={8} />
                        Private
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">{formatTime(note.created_at)}</span>
                  </div>

                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      note.is_mine
                        ? "bg-[#021422] text-white rounded-br-md"
                        : note.note_type === "requires_attention"
                          ? "bg-red-50 text-[#021422] rounded-bl-md border border-red-200"
                          : note.note_type === "private"
                            ? "bg-purple-50 text-[#021422] rounded-bl-md border border-purple-200"
                            : "bg-gray-100 text-[#021422] rounded-bl-md"
                    }`}
                  >
                    {note.body && <p className="whitespace-pre-wrap">{note.body}</p>}
                    {note.attachment_url && (
                      <a
                        href={note.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-1.5 flex items-center gap-1.5 text-xs underline ${
                          note.is_mine ? "text-blue-300" : "text-[#007AFF]"
                        }`}
                      >
                        <Paperclip size={11} />
                        {note.attachment_name || "Attachment"}
                      </a>
                    )}
                  </div>

                  {!note.is_mine && note.sender_role && (
                    <span className="text-[10px] text-gray-400 mt-0.5">{note.sender_role}</span>
                  )}
                </div>
              </div>
            ))
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input ── */}
        <div className="border-t border-gray-200 p-4 shrink-0">
          {attachment && (
            <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <Paperclip size={14} className="text-blue-600 shrink-0" />
              <span className="text-xs font-medium text-blue-700 flex-1 truncate">
                {attachment.name}
              </span>
              <button
                onClick={() => setAttachment(null)}
                className="text-blue-400 hover:text-blue-600 text-sm leading-none"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileAttach}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx,.pptx,.mpp"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              title="Attach file"
            >
              <Paperclip size={16} />
            </button>
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              disabled={!projectId || (isDirectedTab && !selectedRecipientId)}
              className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={(!body.trim() && !attachment) || sending || !projectId || (isDirectedTab && !selectedRecipientId)}
              className="p-2.5 bg-[#021422] text-white rounded-full hover:bg-[#0a2a3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>

          {isDirectedTab && !selectedRecipientId && !loadingRecipients && (
            <p className="text-xs text-amber-600 mt-1.5">Select a recipient above before sending.</p>
          )}
        </div>
      </div>
    </div>
  );
}
