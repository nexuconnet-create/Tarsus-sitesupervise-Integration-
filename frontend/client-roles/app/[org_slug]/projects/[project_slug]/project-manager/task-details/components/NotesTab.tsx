"use client";

/* eslint-disable react-hooks/set-state-in-effect -- initialize the recipient after async data loads. */

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  StickyNote,
  Send,
  User,
  Bell,
  Paperclip,
  ChevronDown,
  Lock,
  Loader2,
  ChevronUp,
} from "lucide-react";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import {
  useTaskNoteRecipients,
  useTaskNoteUnreadCounts,
  useTaskNoteThread,
  useSendTaskNote,
} from "@/lib/hooks/useTaskNotes";
import type { NoteType } from "@/lib/types/taskNote";

interface NotesTabProps {
  taskId: string;
}

export default function NotesTab({ taskId }: NotesTabProps) {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const { data: projectId } = useProjectUuid(orgSlug, projectSlug);

  const [activeTab, setActiveTab] = useState<NoteType>("updates");
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Data ──────────────────────────────────────────────────────────────────

  const { data: recipients = [], isLoading: loadingRecipients } =
    useTaskNoteRecipients(projectId, taskId);

  const { data: unreadCounts } = useTaskNoteUnreadCounts(projectId, taskId);

  const {
    data: threadData,
    isLoading: loadingThread,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTaskNoteThread(projectId, taskId, activeTab, selectedRecipientId);

  const { mutate: sendNote, isPending: sending } = useSendTaskNote(
    projectId,
    taskId,
    activeTab,
    selectedRecipientId,
  );

  // Flatten pages in reverse so display is oldest → newest (chronological)
  const notes = threadData
    ? [...threadData.pages].reverse().flatMap((p) => p.notes)
    : [];

  // ── Side-effects ──────────────────────────────────────────────────────────

  // Auto-select the first recipient when the list loads
  useEffect(() => {
    if (recipients.length > 0 && !selectedRecipientId) {
      setSelectedRecipientId(recipients[0].id);
    }
  }, [recipients, selectedRecipientId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowRecipientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to bottom when new notes arrive or tab changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes.length, activeTab]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSend = () => {
    if ((!body.trim() && !attachment) || sending || !projectId) return;
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

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ── Derived ───────────────────────────────────────────────────────────────

  const selectedRecipient = recipients.find((r) => r.id === selectedRecipientId);

  const counts = {
    updates: unreadCounts?.updates ?? 0,
    requires_attention: unreadCounts?.requires_attention ?? 0,
    private: unreadCounts?.private ?? 0,
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case "requires_attention":
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

  const getPlaceholder = () => {
    switch (activeTab) {
      case "requires_attention":
        return "Write a note requiring attention...";
      case "private":
        return "Write a private message...";
      default:
        return "Write an update...";
    }
  };

  const isDirectedTab = activeTab !== "updates";
  const canSend = !isDirectedTab || !!selectedRecipientId;

  // ── Tab header ────────────────────────────────────────────────────────────

  const TabHeader = (
    <div className="px-4 pt-3 pb-2 shrink-0 border-b border-gray-100">
      {/* Recipient selector (only relevant for directed tabs) */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">
          {isDirectedTab ? "Chat with:" : "Broadcast to all eligible roles"}
        </span>
        {isDirectedTab && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowRecipientDropdown(!showRecipientDropdown)}
              className="flex items-center gap-1 text-xs text-[#007AFF] hover:text-blue-700 font-medium"
              disabled={loadingRecipients}
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
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[200px]">
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
      </div>

      {/* Tab switcher */}
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
          {counts.updates > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "updates"
                  ? "bg-[#021422] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {counts.updates}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("requires_attention")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === "requires_attention"
              ? "bg-white text-[#021422] shadow-sm"
              : counts.requires_attention > 0
                ? "text-red-600"
                : "text-gray-500"
          }`}
        >
          <span>Requires Attention</span>
          {counts.requires_attention > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "requires_attention"
                  ? "bg-red-500 text-white"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {counts.requires_attention}
            </span>
          )}
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
          {counts.private > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "private"
                  ? "bg-purple-500 text-white"
                  : "bg-purple-100 text-purple-600"
              }`}
            >
              {counts.private}
            </span>
          )}
        </button>
      </div>
    </div>
  );

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loadingThread && notes.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {TabHeader}
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
          <p className="text-xs text-gray-400 mt-2">Loading notes…</p>
        </div>
      </div>
    );
  }

  const emptyState = getEmptyMessage();

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {TabHeader}

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Load older button */}
        {hasNextPage && (
          <div className="flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-gray-500 hover:text-[#007AFF] border border-gray-200 rounded-full hover:border-[#007AFF] transition-colors disabled:opacity-50"
            >
              {isFetchingNextPage ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <ChevronUp size={12} />
              )}
              Load earlier messages
            </button>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <StickyNote size={28} className="opacity-30" />
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
              className={`p-4 rounded-xl border ${
                note.is_mine
                  ? "bg-[#021422]/5 border-[#021422]/10"
                  : !note.is_read
                    ? "bg-blue-50 border-blue-200"
                    : note.note_type === "requires_attention"
                      ? "bg-red-50 border-red-200"
                      : note.note_type === "private"
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#021422]">
                        {note.sender_name ?? "Unknown"}
                      </span>
                      {note.sender_role && (
                        <span className="text-[10px] font-semibold text-gray-400 uppercase">
                          {note.sender_role}
                        </span>
                      )}
                      {note.note_type === "requires_attention" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[9px] font-bold uppercase">
                          <Bell size={8} />
                          Urgent
                        </span>
                      )}
                      {note.note_type === "private" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full text-[9px] font-bold uppercase">
                          <Lock size={8} />
                          Private
                        </span>
                      )}
                      {!note.is_read && !note.is_mine && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {formatTime(note.created_at)}
                    </span>
                  </div>

                  {note.body && (
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {note.body}
                    </p>
                  )}

                  {note.attachment_url && (
                    <a
                      href={note.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-[#007AFF] hover:bg-gray-200 transition-colors w-fit"
                    >
                      <Paperclip size={12} />
                      {note.attachment_name || "Attachment"}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose area */}
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
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors"
            title="Attach file"
            type="button"
          >
            <Paperclip size={16} />
          </button>
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={!canSend || !projectId}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={(!body.trim() && !attachment) || sending || !canSend || !projectId}
            className="p-2.5 bg-[#021422] text-white rounded-lg hover:bg-[#0a2a3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>

        {isDirectedTab && !selectedRecipientId && !loadingRecipients && (
          <p className="text-xs text-amber-600 mt-1.5">
            Select a recipient above before sending.
          </p>
        )}
      </div>
    </div>
  );
}
