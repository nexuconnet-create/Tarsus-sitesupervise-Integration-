"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { wsBase } from "@/lib/utils/ws";

type HeadsetStreamProps = {
  room: string;
  className?: string;
};

/**
 * Live audio/video viewer for the Trimble XR10 headset stream.
 *
 * Connects to:  {wsBase}/ws/stream/{room}/view/  with `["access_token", jwt]`
 * subprotocol auth (same as chat sockets).
 *
 * Incoming messages are JSON:  { kind: "video"|"audio", data: "<base64>" }
 *   - "video": JPEG frame → <img> via data URL
 *   - "audio": raw 16-bit PCM at 48kHz → played through AudioContext
 *
 * The headset can't use LiveKit/WebRTC (no UWP/ARM64 binary), so it publishes
 * plain JPEG + PCM frames to ws/stream/{room}/publish/.
 */
export function HeadsetStream({ room, className }: HeadsetStreamProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextAudioTimeRef = useRef(0);
  const [status, setStatus] = useState<
    "connecting" | "waiting" | "live" | "offline"
  >("connecting");
  const [audioEnabled, setAudioEnabled] = useState(false);

  const handleEnableAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext({ sampleRate: 48000 });
    }
    audioCtxRef.current.resume();
    setAudioEnabled(true);
  };

  useEffect(() => {
    let ws: WebSocket | null = null;
    let closedByUs = false;
    let retry: ReturnType<typeof setTimeout>;

    const url = `${wsBase()}/ws/stream/${room}/view/`;

    const connect = () => {
      const token = useAuthStore.getState().accessToken;
      if (!token) {
        setStatus("offline");
        retry = setTimeout(connect, 2000);
        return;
      }

      setStatus("connecting");
      ws = new WebSocket(url, ["access_token", token]);

      ws.onopen = () => setStatus("waiting");

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string);
          const kind: string = msg.kind ?? "video";
          const data: string = msg.data;

          if (kind === "video" && imgRef.current) {
            imgRef.current.src = "data:image/jpeg;base64," + data;
            setStatus("live");
          } else if (kind === "audio") {
            playRawPcm(data);
            setStatus("live");
          }
        } catch {
          // Legacy plain-base64 JPEG (pre-audio format).
          if (imgRef.current && typeof ev.data === "string") {
            imgRef.current.src = "data:image/jpeg;base64," + ev.data;
            setStatus("live");
          }
        }
      };

      ws.onclose = () => {
        if (closedByUs) return;
        setStatus("offline");
        retry = setTimeout(connect, 2000);
      };

      ws.onerror = () => ws?.close();
    };

    const playRawPcm = (base64Data: string) => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const raw = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      if (raw.byteLength < 2) return;

      // 16-bit PCM → Float32 samples
      const sampleCount = raw.byteLength / 2;
      const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
      const samples = new Float32Array(sampleCount);
      for (let i = 0; i < sampleCount; i++) {
        samples[i] = view.getInt16(i * 2, true) / 32768;
      }

      const buf = ctx.createBuffer(1, sampleCount, 48000);
      buf.getChannelData(0).set(samples);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);

      const now = ctx.currentTime;
      if (nextAudioTimeRef.current < now) {
        nextAudioTimeRef.current = now;
      }
      src.start(nextAudioTimeRef.current);
      nextAudioTimeRef.current += buf.duration;
    };

    connect();

    return () => {
      closedByUs = true;
      clearTimeout(retry);
      ws?.close();
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      nextAudioTimeRef.current = 0;
    };
  }, [room]);

  const label =
    status === "live"
      ? "● Live"
      : status === "waiting"
        ? "Connected — waiting for frames…"
        : status === "offline"
          ? "Disconnected — reconnecting…"
          : "Connecting…";

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-2">
        <span
          className={`text-sm ${status === "live" ? "text-green-500" : "text-gray-400"}`}
        >
          {label}
        </span>
        {!audioEnabled && (
          <button
            onClick={handleEnableAudio}
            className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
          >
            Enable Audio
          </button>
        )}
      </div>
      <img
        ref={imgRef}
        alt="Live headset stream"
        className="w-full aspect-video object-contain border border-gray-700 bg-black rounded-lg"
      />
    </div>
  );
}

export default HeadsetStream;
