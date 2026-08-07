"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { useChatSocket } from "@/lib/hooks/useChatSocket";
import { conferenceService } from "@/lib/services/conference";
import { useAuthStore } from "@/lib/stores/authStore";
import type { ChatMessage } from "@/lib/types/messaging";
import type { ConferenceMessage } from "@/lib/types/conference";

interface MeetingChatPanelProps {
  projectUuid: string;
  /** The live call UUID — chat is scoped to this call (backend maps it to the
   *  scheduled meeting when there is one, so history survives restarts). */
  callUuid: string;
  /** Kept mounted so it tracks unread while hidden; `open` slides it in/out. */
  open: boolean;
  onClose: () => void;
  /** Reports the message count so the parent can badge the chat button. */
  onMessageCount?: (total: number) => void;
}

/**
 * In-conference chat drawer. Uses the conference chat socket + history — a
 * SEPARATE thread from project chat, so meeting talk never lands in the
 * permanent project conversation.
 */
export default function MeetingChatPanel({
  projectUuid,
  callUuid,
  open,
  onClose,
  onMessageCount,
}: MeetingChatPanelProps) {
  const myUuid = useAuthStore((s) => s.user?.uuid);
  const [messages, setMessages] = useState<ConferenceMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Load history (returned oldest-first, so no reversing needed).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await conferenceService.getCallMessages(projectUuid, callUuid);
        const list = Array.isArray(res.data) ? res.data : [];
        if (!cancelled) setMessages(list);
      } catch {
        /* non-fatal — the socket still delivers live messages */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectUuid, callUuid]);

  // The socket hook types payloads as ChatMessage; conference messages are a
  // structural subset (uuid/sender_uuid/sender_name/content/created_at).
  const onMessage = useCallback((msg: ChatMessage) => {
    const m = msg as unknown as ConferenceMessage;
    setMessages((prev) =>
      prev.some((x) => x.uuid === m.uuid) ? prev : [...prev, m],
    );
  }, []);

  const { connected, send } = useChatSocket({
    target: { kind: "conference", callUuid },
    onMessage,
  });

  // Keep the parent's badge in sync and auto-scroll to the newest message.
  useEffect(() => {
    onMessageCount?.(messages.length);
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, onMessageCount]);

  const handleSend = () => {
    const content = draft.trim();
    if (!content) return;
    if (send({ type: "text", content })) setDraft("");
  };

  return (
    <div
      className={`absolute inset-y-0 right-0 z-40 w-full sm:w-96 bg-white flex flex-col shadow-2xl transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-[#021422] uppercase tracking-wide text-sm">
            Meeting Chat
          </h2>
          <span
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-green-500" : "bg-gray-300"
            }`}
            title={connected ? "Connected" : "Connecting…"}
          />
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 size={22} className="animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center px-6">
            No messages yet. Say hello 👋
          </div>
        ) : (
          messages.map((m) => {
            const mine = !!myUuid && m.sender_uuid === myUuid;
            return (
              <div
                key={m.uuid}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                {!mine && (
                  <span className="text-[11px] font-bold text-gray-500 mb-0.5 px-1">
                    {m.sender_name}
                  </span>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    mine
                      ? "bg-[#0070D4] text-white rounded-tr-sm"
                      : "bg-white text-[#021422] border border-gray-200 rounded-tl-sm"
                  }`}
                >
                  <span className="whitespace-pre-wrap break-words">
                    {m.content}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                  {new Date(m.created_at).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-gray-100 bg-white">
        <div className="relative">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message the meeting…"
            className="w-full pl-4 pr-11 py-2.5 bg-gray-50 rounded-full text-sm text-[#021422] outline-none focus:ring-2 focus:ring-[#0070D4]"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0070D4] disabled:text-gray-300 hover:text-[#005bb5] transition-colors"
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
