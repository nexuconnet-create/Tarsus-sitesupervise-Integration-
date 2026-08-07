"use client";

import { useEffect, useState } from "react";
import { X, Loader2, MessageSquare } from "lucide-react";
import { scheduledMeetingService } from "@/lib/services/conference";
import type { ConferenceMessage, ScheduledMeeting } from "@/lib/types/conference";

interface MeetingTranscriptModalProps {
  projectUuid: string;
  meeting: ScheduledMeeting;
  onClose: () => void;
}

/**
 * Read-only chat transcript for a past meeting. Shows the in-conference chat
 * (who said what, when) — not spoken-audio transcription.
 */
export default function MeetingTranscriptModal({
  projectUuid,
  meeting,
  onClose,
}: MeetingTranscriptModalProps) {
  const [messages, setMessages] = useState<ConferenceMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await scheduledMeetingService.getMessages(
          projectUuid,
          meeting.uuid,
        );
        if (!cancelled) setMessages(Array.isArray(res.data) ? res.data : []);
      } catch {
        /* non-fatal */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectUuid, meeting.uuid]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg max-h-[85vh] rounded-3xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#021422] truncate">
              {meeting.title}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(meeting.scheduled_start).toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              · Chat transcript
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-gray-400 text-center">
              <MessageSquare size={28} />
              <p className="text-sm">No chat messages in this meeting.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.uuid} className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-[#021422]">
                    {m.sender_name}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(m.created_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-[#021422]/90 whitespace-pre-wrap break-words mt-0.5">
                  {m.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
