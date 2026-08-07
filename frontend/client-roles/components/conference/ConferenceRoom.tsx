"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  Track,
  ConnectionState,
  setLogLevel,
  LogLevel,
} from "livekit-client";

// We surface our own Reconnecting/Disconnected UI for network blips, so we don't
// need LiveKit's verbose debug/info chatter in the console. Drop it to warnings.
// (Note: this trims noise but cannot suppress Next.js's dev-only error overlay —
// that overlay does not exist in a production build.)
setLogLevel(LogLevel.warn);
import {
  RoomContext,
  useTracks,
  useLocalParticipant,
  useConnectionState,
  VideoTrack,
  RoomAudioRenderer,
} from "@livekit/components-react";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  ScreenShare,
  ScreenShareOff,
  PhoneOff,
  Building2,
  User,
  Loader2,
  ArrowLeft,
  WifiOff,
  Hand,
  Smile,
} from "lucide-react";
import { MessageSquare } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { useRoomReactions } from "./useRoomReactions";
import MeetingChatPanel from "./MeetingChatPanel";

// Quick-reaction palette shown in the control-bar popover.
const REACTION_EMOJIS = ["👍", "❤️", "😂", "🎉", "👏", "👀"];

interface ConferenceRoomProps {
  token: string;
  serverUrl: string;
  /** Called after the room has disconnected (user left / ended). */
  onLeave: () => void;
  /** End the call for everyone (backend enforces creator/PM permission). */
  onEnd: () => void;
  /**
   * Maps a participant identity (the user UUID) to a human-readable name.
   * LiveKit identities are UUIDs, so without this map tiles show the raw UUID.
   */
  participantNames?: Record<string, string>;
  /** Project UUID + live call UUID — enable the separate in-conference chat. */
  projectUuid?: string | null;
  callUuid?: string | null;
}

/**
 * Live LiveKit room. Owns the Room lifecycle (connect on mount, disconnect on
 * unmount) and renders the branded conference UI with real media tracks.
 */
export default function ConferenceRoom({
  token,
  serverUrl,
  onLeave,
  onEnd,
  participantNames,
  projectUuid,
  callUuid,
}: ConferenceRoomProps) {
  // A fresh Room is created per connection attempt. Creating it inside the
  // effect (not useMemo) is what makes this safe under React StrictMode's
  // double-invoke: the throwaway first room is disconnected in cleanup, and a
  // brand-new room is used for the real mount — so we never call connect() or
  // enableCameraAndMicrophone() on an already-closed PeerConnection manager
  // (the cause of "PC manager is closed").
  const [room, setRoom] = useState<Room | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  useEffect(() => {
    const r = new Room({ adaptiveStream: true, dynacast: true });
    let cancelled = false;

    (async () => {
      try {
        await r.connect(serverUrl, token);
        if (cancelled) return;
        // Show the room as soon as signaling connects. Enabling camera/mic is
        // done in the background so a slow/failed media publish can't keep the
        // UI stuck on "Connecting…".
        setRoom(r);
        r.localParticipant
          .enableCameraAndMicrophone()
          .catch((e) => {
            console.error("[Conference] enable camera/mic failed", e);
            toast.error(
              "Joined, but couldn't start your camera/mic. Check permissions / connection.",
            );
          });
      } catch (err) {
        if (cancelled) return;
        console.error("[Conference] connect failed", err);
        setConnectError(
          "Could not connect to the conference. Check your camera/mic permissions and try again.",
        );
      }
    })();

    return () => {
      cancelled = true;
      setRoom(null);
      r.disconnect();
    };
  }, [serverUrl, token]);

  if (connectError) {
    return (
      <div className="h-screen bg-[#021422] flex flex-col items-center justify-center gap-6 p-8 text-center">
        <p className="text-white/80 max-w-md">{connectError}</p>
        <button
          onClick={onLeave}
          className="bg-[#0070D4] hover:bg-[#005bb5] text-white px-6 py-3 rounded-full font-bold transition-colors"
        >
          Back to Lobby
        </button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="h-screen bg-[#021422] flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="animate-spin text-white/70" />
        <p className="text-white/70 text-sm uppercase tracking-widest font-bold">
          Connecting to room…
        </p>
      </div>
    );
  }

  return (
    <RoomContext.Provider value={room}>
      <RoomAudioRenderer />
      <RoomUI
        onLeave={onLeave}
        onEnd={onEnd}
        participantNames={participantNames}
        projectUuid={projectUuid}
        callUuid={callUuid}
      />
    </RoomContext.Provider>
  );
}

function RoomUI({
  onLeave,
  onEnd,
  participantNames,
  projectUuid,
  callUuid,
}: {
  onLeave: () => void;
  onEnd: () => void;
  participantNames?: Record<string, string>;
  projectUuid?: string | null;
  callUuid?: string | null;
}) {
  const connectionState = useConnectionState();
  // These flags are reactive — the hook re-renders when they change.
  const {
    localParticipant,
    isMicrophoneEnabled: micOn,
    isCameraEnabled: camOn,
    isScreenShareEnabled: sharing,
  } = useLocalParticipant();

  // Camera tracks (local + remote) for the participant tiles.
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false },
  );
  const screenTracks = useTracks([Track.Source.ScreenShare]);

  // Reactions + raise-hand (LiveKit data messages / participant attributes).
  const { reactions, hands, myHandRaised, sendReaction, toggleHand } =
    useRoomReactions();
  const [showEmoji, setShowEmoji] = useState(false);
  const handsCount = hands.size;

  // In-meeting chat drawer + unread badge. The panel stays mounted (tracking
  // message count) even while hidden, so unread accrues when the chat is closed.
  const [showChat, setShowChat] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);
  const chatOpenRef = useRef(false);
  const lastChatCountRef = useRef<number | null>(null);

  // Called by the panel whenever its message count changes. The first call is
  // the baseline (existing history — not unread); later growth while the drawer
  // is closed accrues to the badge.
  const handleChatCount = useCallback((total: number) => {
    const prev = lastChatCountRef.current;
    lastChatCountRef.current = total;
    if (prev === null) return;
    if (!chatOpenRef.current && total > prev) {
      setChatUnread((u) => u + (total - prev));
    }
  }, []);

  const openChat = () => {
    chatOpenRef.current = true;
    setShowChat(true);
    setChatUnread(0);
  };
  const closeChat = () => {
    chatOpenRef.current = false;
    setShowChat(false);
  };

  const toggleMic = () => localParticipant?.setMicrophoneEnabled(!micOn);
  const toggleCam = () => localParticipant?.setCameraEnabled(!camOn);
  const toggleShare = async () => {
    try {
      await localParticipant?.setScreenShareEnabled(!sharing);
    } catch {
      // User dismissed the screen-share picker — no-op.
    }
  };

  const elapsed = useElapsedTimer(connectionState === ConnectionState.Connected);

  // Track whether the user themselves triggered the disconnect (Leave/End/Back)
  // so we can tell an intentional exit apart from a network drop.
  const [isLeaving, setIsLeaving] = useState(false);
  const leave = () => {
    setIsLeaving(true);
    toast.success("Leaving meeting…");
    onLeave();
  };
  const end = () => {
    setIsLeaving(true);
    onEnd();
  };

  const reconnecting = connectionState === ConnectionState.Reconnecting;
  const connecting =
    connectionState === ConnectionState.Connecting || reconnecting;

  // Remember once we've successfully connected, so a Disconnected state means a
  // real drop (not the initial connect handshake).
  const [wasConnected, setWasConnected] = useState(false);
  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      // Track the first successful connection so later disconnects can be surfaced.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWasConnected(true);
    }
  }, [connectionState]);

  // LiveKit auto-retries on a brief drop (→ Reconnecting). If it fully gives up
  // (→ Disconnected) and the user didn't ask to leave, show a "dropped" screen
  // instead of a frozen black room or an uncaught error.
  const dropped =
    connectionState === ConnectionState.Disconnected &&
    wasConnected &&
    !isLeaving;

  // Prefer a screen share as the main stage; otherwise the first camera.
  const stageTrack = screenTracks[0] ?? cameraTracks[0];

  // LiveKit identities are user UUIDs. Resolve a readable name from the
  // participant's own name, then the UUID→name map, falling back to the UUID.
  const displayName = (p: { identity: string; name?: string }) =>
    p.name || participantNames?.[p.identity] || p.identity;

  // Network fully dropped — surface a clear screen with a way out.
  if (dropped) {
    return (
      <div className="h-screen bg-[#021422] flex flex-col items-center justify-center gap-6 p-8 text-center">
        <WifiOff size={40} className="text-amber-400" />
        <div className="space-y-2">
          <p className="text-white font-bold text-lg">You were disconnected</p>
          <p className="text-white/70 max-w-md text-sm">
            We lost the connection to the meeting — this is usually a network
            issue. Head back to the lobby and rejoin the room.
          </p>
        </div>
        <button
          onClick={onLeave}
          className="bg-[#0070D4] hover:bg-[#005bb5] text-white px-6 py-3 rounded-full font-bold transition-colors"
        >
          Back to Lobby
        </button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-900 relative overflow-hidden">
      {/* Reconnecting overlay — LiveKit retries automatically in the background */}
      {reconnecting && (
        <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 px-6 text-center">
          <Loader2 size={32} className="animate-spin text-amber-400" />
          <p className="text-white font-bold">Reconnecting…</p>
          <p className="text-white/60 text-sm max-w-xs">
            Your connection dropped. Trying to get you back into the meeting.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#021422] px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 shadow-sm z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={leave}
            title="Leave and go back"
            className="flex items-center gap-1 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 sm:px-3 py-2 rounded-full font-bold transition-colors shrink-0"
          >
            <ArrowLeft size={18} />{" "}
            <span className="hidden sm:inline">Back</span>
          </button>
          <Building2 size={24} className="text-white shrink-0" />
          <h1 className="text-base sm:text-lg font-bold text-white truncate">
            Project Room
          </h1>
          {connecting && !reconnecting && (
            <span className="flex items-center gap-1 text-amber-400 text-xs font-bold ml-1 shrink-0">
              <Loader2 size={14} className="animate-spin" />
              <span className="hidden sm:inline">CONNECTING…</span>
            </span>
          )}
        </div>
        <div className="text-gray-300 font-mono text-sm sm:text-lg shrink-0">
          {elapsed}
        </div>
      </div>

      {/* Main content — stacks vertically on phones, side-by-side on larger screens */}
      <div className="flex-1 flex flex-col md:flex-row p-2 sm:p-4 gap-2 sm:gap-4 overflow-hidden">
        {/* Participant rail — horizontal strip on phones, vertical column on desktop */}
        <div className="flex flex-row md:flex-col gap-2 sm:gap-3 overflow-x-auto md:overflow-x-visible md:overflow-y-auto shrink-0 md:w-64">
          {cameraTracks.length > 0 ? (
            cameraTracks.map((trackRef) => (
              <div
                key={`${trackRef.participant.identity}-${trackRef.source}`}
                className="relative aspect-video w-32 sm:w-40 md:w-full shrink-0 bg-gray-800 rounded-xl overflow-hidden shadow-lg"
              >
                {trackRef.publication ? (
                  <VideoTrack
                    trackRef={trackRef}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold uppercase">
                      {displayName(trackRef.participant).charAt(0) || "?"}
                    </span>
                  </div>
                )}
                {hands.has(trackRef.participant.identity) && (
                  <div
                    title="Hand raised"
                    className="absolute top-1.5 right-1.5 bg-amber-400 text-[#021422] rounded-full p-1.5 shadow-lg animate-bounce"
                  >
                    <Hand size={14} />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-xs font-bold truncate">
                    {displayName(trackRef.participant)}
                    {trackRef.participant.isLocal && " (You)"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-white/40 text-xs uppercase font-bold gap-2">
              <User size={24} />
              <span>Waiting for participants</span>
            </div>
          )}
        </div>

        {/* Stage */}
        <div className="flex-1 bg-black rounded-2xl overflow-hidden relative flex items-center justify-center">
          {stageTrack?.publication ? (
            <VideoTrack
              trackRef={stageTrack}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center text-gray-500">
              <VideoIcon size={48} className="mx-auto mb-3" />
              <p className="text-xs uppercase tracking-widest font-bold">
                {connecting ? "Connecting to room…" : "No active video"}
              </p>
            </div>
          )}

          {/* Floating emoji reactions — rise and fade over the stage */}
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-2 overflow-hidden">
            <AnimatePresence>
              {reactions.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{ opacity: 1, y: -80, scale: 1.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 3, ease: "easeOut" }}
                  className="text-4xl"
                >
                  {r.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Control bar — wraps onto multiple rows on narrow screens */}
      <div className="bg-[#021422] px-2 sm:px-6 py-3 sm:py-4 flex items-center justify-center flex-wrap gap-2 sm:gap-4 z-10">
        <ControlButton
          active={micOn}
          onClick={toggleMic}
          onIcon={<Mic size={20} />}
          offIcon={<MicOff size={20} />}
          label={micOn ? "Mute" : "Unmute"}
        />
        <ControlButton
          active={camOn}
          onClick={toggleCam}
          onIcon={<VideoIcon size={20} />}
          offIcon={<VideoOff size={20} />}
          label={camOn ? "Stop Video" : "Start Video"}
        />
        <ControlButton
          active={sharing}
          onClick={toggleShare}
          onIcon={<ScreenShareOff size={20} />}
          offIcon={<ScreenShare size={20} />}
          label={sharing ? "Stop Share" : "Share Screen"}
        />

        {/* Raise hand */}
        <button
          onClick={toggleHand}
          title={myHandRaised ? "Lower hand" : "Raise hand"}
          className={`relative px-5 py-3 rounded-full font-bold flex items-center gap-2 transition-colors ${
            myHandRaised
              ? "bg-amber-400 text-[#021422] hover:bg-amber-300"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
        >
          <Hand size={20} />
          <span className="text-sm hidden sm:inline">
            {myHandRaised ? "Lower" : "Raise"}
          </span>
          {handsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
              {handsCount}
            </span>
          )}
        </button>

        {/* Reactions */}
        <div className="relative">
          {showEmoji && (
            <>
              {/* Click-away backdrop */}
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowEmoji(false)}
              />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 bg-[#0b2233] border border-white/10 rounded-2xl p-2 flex gap-1 shadow-2xl">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      sendReaction(emoji);
                      setShowEmoji(false);
                    }}
                    className="text-2xl hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
          <button
            onClick={() => setShowEmoji((v) => !v)}
            title="Send a reaction"
            className={`px-5 py-3 rounded-full font-bold flex items-center gap-2 transition-colors ${
              showEmoji
                ? "bg-[#0070D4] text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            <Smile size={20} />
            <span className="text-sm hidden sm:inline">React</span>
          </button>
        </div>

        {/* Chat */}
        {projectUuid && callUuid && (
          <button
            onClick={() => (showChat ? closeChat() : openChat())}
            title="Chat"
            className={`relative px-5 py-3 rounded-full font-bold flex items-center gap-2 transition-colors ${
              showChat
                ? "bg-[#0070D4] text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            <MessageSquare size={20} />
            <span className="text-sm hidden sm:inline">Chat</span>
            {chatUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                {chatUnread}
              </span>
            )}
          </button>
        )}

        <button
          onClick={leave}
          title="Leave"
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 sm:px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
        >
          <PhoneOff size={20} />{" "}
          <span className="text-sm hidden sm:inline">Leave</span>
        </button>
        <button
          onClick={end}
          title="End the meeting for everyone (host/PM only)"
          className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
        >
          <PhoneOff size={20} />{" "}
          <span className="text-sm hidden sm:inline">End Meeting</span>
        </button>
      </div>

      {/* In-conference chat drawer — kept mounted so unread accrues while closed */}
      {projectUuid && callUuid && (
        <MeetingChatPanel
          projectUuid={projectUuid}
          callUuid={callUuid}
          open={showChat}
          onClose={closeChat}
          onMessageCount={handleChatCount}
        />
      )}
    </div>
  );
}

function ControlButton({
  active,
  onClick,
  onIcon,
  offIcon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`px-5 py-3 rounded-full font-bold flex items-center gap-2 transition-colors ${
        active
          ? "bg-[#0070D4] hover:bg-[#005bb5] text-white"
          : "bg-gray-700 hover:bg-gray-600 text-white"
      }`}
    >
      {active ? onIcon : offIcon}
      <span className="text-sm hidden sm:inline">{label}</span>
    </button>
  );
}

/** Returns an "HH:MM:SS" elapsed string that ticks while `running` is true. */
function useElapsedTimer(running: boolean): string {
  const [seconds, setSeconds] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    if (startRef.current === null) startRef.current = Date.now();
    const id = setInterval(() => {
      if (startRef.current !== null) {
        setSeconds(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
