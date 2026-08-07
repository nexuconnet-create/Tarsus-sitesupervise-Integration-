"use client";

import { useState } from "react";
import {
  X,
  Loader2,
  CalendarPlus,
  Download,
  Copy,
  Check,
  CalendarClock,
} from "lucide-react";
import toast from "react-hot-toast";
import { scheduledMeetingService } from "@/lib/services/conference";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import type { ScheduledMeeting } from "@/lib/types/conference";

interface ScheduleMeetingModalProps {
  projectUuid: string;
  onClose: () => void;
  /** Called after a meeting is created so the lobby can refresh its list. */
  onCreated: (meeting: ScheduledMeeting) => void;
}

/** Rounds `date` up to the next quarter-hour, returned as a datetime-local value. */
function defaultStartValue(): string {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  // datetime-local expects local time with no timezone/seconds: YYYY-MM-DDTHH:MM
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/**
 * Two-step modal:
 *  1. Fill in title / time / duration → create the meeting.
 *  2. Share step — "Add to Google Calendar", download .ics, copy join link.
 */
export default function ScheduleMeetingModal({
  projectUuid,
  onClose,
  onCreated,
}: ScheduleMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState(defaultStartValue);
  const [durationMin, setDurationMin] = useState(30);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<ScheduledMeeting | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Give the meeting a title.");
      return;
    }
    const startDate = new Date(start);
    if (Number.isNaN(startDate.getTime())) {
      toast.error("Pick a valid start time.");
      return;
    }
    const endDate = new Date(startDate.getTime() + durationMin * 60_000);

    setBusy(true);
    try {
      const res = await scheduledMeetingService.create(projectUuid, {
        title: title.trim(),
        description: description.trim(),
        scheduled_start: startDate.toISOString(),
        scheduled_end: endDate.toISOString(),
      });
      setCreated(res.data);
      onCreated(res.data);
      toast.success("Meeting scheduled");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadIcs = async () => {
    if (!created) return;
    try {
      // The .ics endpoint is auth-gated, so fetch it through the api client
      // (which attaches the JWT) as a blob and trigger a download.
      const res = await api.get(
        scheduledMeetingService.icsUrl(projectUuid, created.uuid),
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${created.title || "meeting"}.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCopyLink = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.join_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#021422] flex items-center gap-2">
            <CalendarClock size={22} className="text-[#0070D4]" />
            {created ? "Meeting scheduled" : "Schedule a meeting"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {!created ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Weekly site review"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-[#021422] focus:border-[#0070D4] focus:outline-none focus:ring-1 focus:ring-[#0070D4]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Agenda, links, notes…"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-[#021422] focus:border-[#0070D4] focus:outline-none focus:ring-1 focus:ring-[#0070D4] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Starts
                </label>
                <input
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-[#021422] focus:border-[#0070D4] focus:outline-none focus:ring-1 focus:ring-[#0070D4]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Duration
                </label>
                <select
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-[#021422] focus:border-[#0070D4] focus:outline-none focus:ring-1 focus:ring-[#0070D4]"
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={busy}
              className="w-full mt-2 rounded-full bg-[#0070D4] hover:bg-[#005bb5] disabled:opacity-60 text-white font-bold py-3 flex items-center justify-center gap-2 transition-colors"
            >
              {busy ? <Loader2 size={18} className="animate-spin" /> : null}
              Schedule meeting
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
              <div className="font-bold text-[#021422]">{created.title}</div>
              <div className="text-sm text-gray-500 mt-0.5">
                {new Date(created.scheduled_start).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Add it to a calendar or share the join link with attendees.
            </p>

            <a
              href={created.google_calendar_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-full bg-[#0070D4] hover:bg-[#005bb5] text-white font-bold py-3 flex items-center justify-center gap-2 transition-colors"
            >
              <CalendarPlus size={18} /> Add to Google Calendar
            </a>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadIcs}
                className="rounded-full border border-gray-300 hover:bg-gray-50 text-[#021422] font-bold py-2.5 flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={18} /> .ics
              </button>
              <button
                onClick={handleCopyLink}
                className="rounded-full border border-gray-300 hover:bg-gray-50 text-[#021422] font-bold py-2.5 flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={18} className="text-green-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={18} /> Copy link
                  </>
                )}
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-full bg-gray-100 hover:bg-gray-200 text-[#021422] font-bold py-2.5 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
