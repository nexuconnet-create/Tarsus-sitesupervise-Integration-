"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Link as LinkIcon,
  Video,
  CalendarPlus,
  Radio,
  Loader2,
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  History,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { conferenceService, scheduledMeetingService } from "@/lib/services/conference";
import { getErrorMessage } from "@/lib/error";
import type {
  ConferenceCall,
  CallParticipant,
  CallStartJoinResponse,
  ScheduledMeeting,
} from "@/lib/types/conference";
import ConferenceRoom from "./ConferenceRoom";
import ConferenceErrorBoundary from "./ConferenceErrorBoundary";
import ScheduleMeetingModal from "./ScheduleMeetingModal";
import MeetingTranscriptModal from "./MeetingTranscriptModal";

interface ConferencePageProps {
  /** Project UUID (resolved by the role page wrapper). */
  projectUuid: string | null | undefined;
  /** Project numeric id, kept for backward compat with existing wrappers. */
  projectId?: string | number;
  projectName?: string;
  /** Org + project slugs — used to build the role-agnostic share link. */
  orgSlug?: string;
  projectSlug?: string;
}

interface Connection {
  token: string;
  serverUrl: string;
  callUuid: string;
  /** Maps participant identity (user UUID) → display name for the room tiles. */
  participantNames: Record<string, string>;
}

export default function ConferencePage({
  projectUuid,
  projectName,
  orgSlug,
  projectSlug,
}: ConferencePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCall, setActiveCall] = useState<ConferenceCall | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([]);
  const [pastMeetings, setPastMeetings] = useState<ScheduledMeeting[]>([]);
  const [showPast, setShowPast] = useState(false);
  const [transcriptMeeting, setTranscriptMeeting] =
    useState<ScheduledMeeting | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  // Look up the project's currently-active call (if any).
  const refreshActive = useCallback(async () => {
    if (!projectUuid) return;
    try {
      const res = await conferenceService.getActiveCall(projectUuid);
      setActiveCall(res.data?.active ? res.data.call : null);
    } catch {
      setActiveCall(null);
    }
  }, [projectUuid]);

  const refreshMeetings = useCallback(async () => {
    if (!projectUuid) return;
    try {
      // Backend already returns only upcoming (live or future-end) meetings.
      const res = await scheduledMeetingService.list(projectUuid);
      setMeetings(Array.isArray(res.data) ? res.data : []);
    } catch {
      /* non-fatal */
    }
  }, [projectUuid]);

  // Past (completed) meetings — loaded lazily when the section is opened.
  const loadPast = useCallback(async () => {
    if (!projectUuid) return;
    try {
      const res = await scheduledMeetingService.listPast(projectUuid);
      setPastMeetings(Array.isArray(res.data) ? res.data : []);
    } catch {
      /* non-fatal */
    }
  }, [projectUuid]);

  const togglePast = () => {
    setShowPast((v) => {
      if (!v) loadPast();
      return !v;
    });
  };

  // ── Connect helpers ─────────────────────────────────────────────────────────
  const connectTo = useCallback(
    (opts: {
      token: string;
      serverUrl: string;
      callUuid: string;
      participants?: CallParticipant[];
    }) => {
      if (!opts.serverUrl) {
        toast.error("Conference server is not configured. Contact support.");
        return;
      }
      const participantNames: Record<string, string> = {};
      for (const p of opts.participants ?? []) {
        if (p.user_uuid && p.user_name) participantNames[p.user_uuid] = p.user_name;
      }
      setConnection({
        token: opts.token,
        serverUrl: opts.serverUrl,
        callUuid: opts.callUuid,
        participantNames,
      });
    },
    [],
  );

  const enterCall = useCallback(
    (res: CallStartJoinResponse) =>
      connectTo({
        token: res.token,
        serverUrl: res.server_url,
        callUuid: res.uuid,
        participants: res.participants,
      }),
    [connectTo],
  );

  // Start (or join) a scheduled meeting's live room.
  const startScheduled = useCallback(
    async (meetingUuid: string) => {
      if (!projectUuid || busy) return;
      setBusy(true);
      try {
        const res = await scheduledMeetingService.start(projectUuid, meetingUuid);
        connectTo({
          token: res.data.token,
          serverUrl: res.data.server_url,
          callUuid: res.data.call_uuid,
        });
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setBusy(false);
      }
    },
    [projectUuid, busy, connectTo],
  );

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (projectUuid === undefined) return; // still resolving
    let cancelled = false;
    (async () => {
      setLoading(true);
      await Promise.all([refreshActive(), refreshMeetings()]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [projectUuid, refreshActive, refreshMeetings]);

  // Auto-join from a shared calendar link: /conference?meeting=<uuid>.
  // Runs once per meeting id so a failed/left join doesn't loop.
  const autoJoinedRef = useRef<string | null>(null);
  useEffect(() => {
    const meetingParam = searchParams.get("meeting");
    if (
      !meetingParam ||
      !projectUuid ||
      connection ||
      autoJoinedRef.current === meetingParam
    )
      return;
    autoJoinedRef.current = meetingParam;
    startScheduled(meetingParam);
  }, [searchParams, projectUuid, connection, startScheduled]);

  // While connected, refresh the active call so participants who join after us
  // are added to the UUID→name map (LiveKit identities are bare UUIDs).
  const inCall = connection !== null;
  useEffect(() => {
    if (!inCall || !projectUuid) return;
    let cancelled = false;
    const id = setInterval(async () => {
      try {
        const res = await conferenceService.getActiveCall(projectUuid);
        const list = res.data?.active ? res.data.call?.participants ?? [] : [];
        if (cancelled || list.length === 0) return;
        setConnection((prev) => {
          if (!prev) return prev;
          const names = { ...prev.participantNames };
          for (const p of list) {
            if (p.user_uuid && p.user_name) names[p.user_uuid] = p.user_name;
          }
          return { ...prev, participantNames: names };
        });
      } catch {
        /* best-effort */
      }
    }, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [inCall, projectUuid]);

  const handleStart = async () => {
    if (!projectUuid || busy) return;
    setBusy(true);
    try {
      const res = await conferenceService.startCall(projectUuid);
      enterCall(res.data);
    } catch (err) {
      // 400 = a call is already active for this project → join it instead.
      try {
        const activeRes = await conferenceService.getActiveCall(projectUuid);
        if (activeRes.data?.active && activeRes.data.call) {
          const joinRes = await conferenceService.joinCall(
            projectUuid,
            activeRes.data.call.uuid,
          );
          enterCall(joinRes.data);
        } else {
          toast.error(getErrorMessage(err));
        }
      } catch (e) {
        toast.error(getErrorMessage(e));
      }
    } finally {
      setBusy(false);
    }
  };

  // Copy a role-agnostic link to this project's conference lobby. Anyone with
  // project access lands in the lobby and can start/join the live room.
  const canShare = Boolean(orgSlug && projectSlug);
  const handleShareLink = async () => {
    if (!canShare) return;
    const link = `${window.location.origin}/conference?org=${orgSlug}&project=${projectSlug}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Conference link copied to clipboard");
    } catch {
      toast.error("Couldn't copy the link.");
    }
  };

  const handleJoin = async (callUuid: string) => {
    if (!projectUuid || busy) return;
    setBusy(true);
    try {
      const res = await conferenceService.joinCall(projectUuid, callUuid);
      enterCall(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = useCallback(async () => {
    if (projectUuid && connection) {
      try {
        await conferenceService.leaveCall(projectUuid, connection.callUuid);
      } catch {
        /* best-effort — LiveKit disconnect already happened client-side */
      }
    }
    setConnection(null);
    refreshActive();
    refreshMeetings();
  }, [projectUuid, connection, refreshActive, refreshMeetings]);

  // End the call for everyone. The backend enforces creator/PM permission and
  // returns 403 otherwise — surfaced as a toast, leaving the user in the room.
  const handleEnd = useCallback(async () => {
    if (!projectUuid || !connection) return;
    try {
      await conferenceService.endCall(projectUuid, connection.callUuid);
      toast.success("Meeting ended for everyone");
      setConnection(null);
      refreshActive();
      refreshMeetings();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [projectUuid, connection, refreshActive, refreshMeetings]);

  // ── Live room ──────────────────────────────────────────────────────────────
  if (connection) {
    return (
      <ConferenceErrorBoundary onExit={handleLeave}>
        <ConferenceRoom
          token={connection.token}
          serverUrl={connection.serverUrl}
          onLeave={handleLeave}
          onEnd={handleEnd}
          participantNames={connection.participantNames}
          projectUuid={projectUuid}
          callUuid={connection.callUuid}
        />
      </ConferenceErrorBoundary>
    );
  }

  // ── Resolving / no project ───────────────────────────────────────────────────
  if (projectUuid === undefined || (loading && projectUuid)) {
    return (
      <div className="h-screen bg-[#021422] flex items-center justify-center">
        <Loader2 className="animate-spin text-white/60" size={32} />
      </div>
    );
  }

  if (!projectUuid) {
    return (
      <div className="h-screen bg-[#021422] flex items-center justify-center p-8 text-center">
        <p className="text-white/70">
          No project selected. Pick a project to start a conference.
        </p>
      </div>
    );
  }

  // ── Lobby ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#021422] flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/70 hover:text-white font-bold transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <h1 className="text-4xl font-bold text-white">
          Conference — {projectName || "Project"}
        </h1>

        {/* Live now banner */}
        {activeCall && (
          <div className="bg-[#0166B0] p-6 rounded-2xl border border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio size={22} className="text-red-400 animate-pulse" />
              <div>
                <div className="text-white font-bold text-lg">
                  A meeting is live now
                </div>
                <div className="text-white/70 text-sm">
                  {activeCall.created_by_name
                    ? `Started by ${activeCall.created_by_name} · `
                    : ""}
                  {activeCall.participants?.filter((p) => !p.left_at).length || 0}{" "}
                  in the room
                </div>
              </div>
            </div>
            <button
              onClick={() => handleJoin(activeCall.uuid)}
              disabled={busy}
              className="bg-[#0070D4] hover:bg-blue-600 disabled:opacity-60 px-8 py-3 rounded-full font-bold text-white transition-colors flex items-center gap-2"
            >
              {busy ? <Loader2 size={18} className="animate-spin" /> : null}
              Join Room
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={handleShareLink}
            disabled={!canShare}
            title={
              canShare
                ? "Copy a shareable link to this conference"
                : "Link sharing unavailable for this project"
            }
            className="bg-white/90 rounded-3xl p-10 flex flex-col items-center justify-center gap-5 hover:scale-105 transition-transform group disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            <LinkIcon
              size={56}
              className="text-[#021422] group-hover:text-[#0070D4] transition-colors"
            />
            <span className="font-bold text-[#021422]">Create Link to Share</span>
          </button>

          <button
            onClick={handleStart}
            disabled={busy}
            className="bg-white rounded-3xl p-10 flex flex-col items-center justify-center gap-5 hover:scale-105 transition-transform group disabled:opacity-60 disabled:hover:scale-100"
          >
            {busy ? (
              <Loader2 size={56} className="text-[#0070D4] animate-spin" />
            ) : (
              <Video
                size={56}
                className="text-[#021422] group-hover:text-[#0070D4] transition-colors"
              />
            )}
            <span className="font-bold text-[#021422]">
              {activeCall ? "Start / Join Meeting" : "Start an Instant Meeting"}
            </span>
          </button>

          <button
            onClick={() => setShowSchedule(true)}
            className="bg-[#0070D4] rounded-3xl p-10 flex flex-col items-center justify-center gap-5 hover:scale-105 transition-transform group"
          >
            <CalendarPlus size={56} className="text-white" />
            <span className="font-bold text-white">Schedule a Meeting</span>
          </button>
        </div>

        {/* Upcoming meetings — always shown so the feature is discoverable */}
        <div className="bg-[#0166B0]/30 p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white/80 font-bold uppercase tracking-wider text-sm">
              Upcoming Meetings
            </h2>
            <button
              onClick={() => setShowSchedule(true)}
              className="flex items-center gap-1.5 text-[#0070D4] hover:text-blue-400 font-bold text-sm transition-colors"
            >
              <CalendarPlus size={16} /> Schedule
            </button>
          </div>
          {meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-white/40 text-center">
              <CalendarClock size={28} />
              <p className="text-sm font-bold uppercase tracking-wider">
                No meetings scheduled yet
              </p>
              <p className="text-xs text-white/30">
                Schedule one to share a calendar invite with your team.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((m) => (
                <div
                  key={m.uuid}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-[#021422] p-4 rounded-xl"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CalendarClock size={16} className="text-[#0070D4] shrink-0" />
                      <span className="text-white font-bold truncate">
                        {m.title}
                      </span>
                      {m.is_live && (
                        <span className="flex items-center gap-1 text-red-400 text-xs font-bold">
                          <Radio size={12} className="animate-pulse" /> LIVE
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm mt-0.5">
                      {new Date(m.scheduled_start).toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {" · "}
                      {m.created_by_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={m.google_calendar_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Add to Google Calendar"
                      className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => startScheduled(m.uuid)}
                      disabled={busy}
                      className="bg-[#0070D4] hover:bg-blue-600 disabled:opacity-60 px-6 py-2 rounded-full font-bold text-white transition-colors text-sm"
                    >
                      {m.is_live ? "Join" : "Start"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past meetings — collapsible, lazy-loaded; each opens its transcript */}
        <div className="bg-white/5 rounded-2xl border border-white/10">
          <button
            onClick={togglePast}
            className="w-full flex items-center justify-between p-5 text-white/70 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm">
              <History size={16} /> Past Meetings
            </span>
            <span className="text-xs">{showPast ? "Hide" : "Show"}</span>
          </button>
          {showPast && (
            <div className="px-5 pb-5">
              {pastMeetings.length === 0 ? (
                <p className="text-white/30 text-sm py-4 text-center">
                  No past meetings yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {pastMeetings.map((m) => (
                    <div
                      key={m.uuid}
                      className="flex justify-between items-center bg-[#021422] p-4 rounded-xl gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-white font-bold truncate">
                          {m.title}
                        </div>
                        <div className="text-gray-400 text-sm mt-0.5">
                          {new Date(m.scheduled_start).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          {" · "}
                          {m.created_by_name}
                        </div>
                      </div>
                      <button
                        onClick={() => setTranscriptMeeting(m)}
                        className="flex items-center gap-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full font-bold text-sm transition-colors shrink-0"
                      >
                        <FileText size={15} /> Transcript
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {transcriptMeeting && projectUuid && (
        <MeetingTranscriptModal
          projectUuid={projectUuid}
          meeting={transcriptMeeting}
          onClose={() => setTranscriptMeeting(null)}
        />
      )}

      {showSchedule && (
        <ScheduleMeetingModal
          projectUuid={projectUuid}
          onClose={() => setShowSchedule(false)}
          onCreated={() => refreshMeetings()}
        />
      )}
    </div>
  );
}
