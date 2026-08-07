"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { wsBase } from "@/lib/utils/ws";

const TYPE_AUDIO = 0x01;
const SAMPLE_RATE = 48000;
const SAMPLES_PER_FRAME = 960; // 20ms at 48kHz

type AudioSenderProps = {
  room: string;
  enabled?: boolean;
};

/**
 * Captures the browser microphone as raw 16-bit PCM at 48kHz, and sends audio
 * frames to the headset over the stream publish WebSocket.
 *
 * Connects to:  {wsBase}/ws/stream/{room}/publish/
 * Sends binary messages with a 0x01 type prefix followed by raw PCM data.
 */
export function AudioSender({ room, enabled = true }: AudioSenderProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let closed = false;

    const start = async () => {
      const token = useAuthStore.getState().accessToken;
      if (!token) return;

      // 1. Open the publish WebSocket with JWT auth.
      const url = `${wsBase()}/ws/stream/${room}/publish/`;
      const ws = new WebSocket(url, ["access_token", token]);
      wsRef.current = ws;

      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => resolve();
        ws.onerror = () => reject(new Error("WebSocket connect failed"));
      });

      if (closed) {
        ws.close();
        return;
      }

      // 2. Capture microphone.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
        },
        video: false,
      });
      if (closed) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;

      // 3. Feed mic PCM into WebSocket via ScriptProcessorNode.
      // ScriptProcessorNode is deprecated but is the simplest way to get raw
      // PCM samples from a MediaStream without external codecs.
      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
      const src = ctx.createMediaStreamSource(stream);
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      let pcmBuffer = new Int16Array(0);

      proc.onaudioprocess = (e) => {
        if (closed || ws.readyState !== WebSocket.OPEN) return;

        const floatSamples = e.inputBuffer.getChannelData(0);

        // Append new samples to our accumulation buffer
        const newPcm = new Int16Array(floatSamples.length);
        for (let i = 0; i < floatSamples.length; i++) {
          const s = Math.max(-1, Math.min(1, floatSamples[i]));
          newPcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        const combined = new Int16Array(pcmBuffer.length + newPcm.length);
        combined.set(pcmBuffer, 0);
        combined.set(newPcm, pcmBuffer.length);
        pcmBuffer = combined;

        // Emit frames in SAMPLES_PER_FRAME chunks
        while (pcmBuffer.length >= SAMPLES_PER_FRAME) {
          const chunk = pcmBuffer.slice(0, SAMPLES_PER_FRAME);
          pcmBuffer = pcmBuffer.slice(SAMPLES_PER_FRAME);

          const data = new Uint8Array(chunk.buffer);

          // Prepend the type tag so the backend knows this is audio.
          const frame = new Uint8Array(1 + data.byteLength);
          frame[0] = TYPE_AUDIO;
          frame.set(data, 1);

          try {
            ws.send(frame);
          } catch {
            // Buffer full — drop the frame.
          }
        }
      };

      src.connect(proc);
      proc.connect(ctx.destination);
    };

    start().catch((err) => {
      console.warn("AudioSender failed to start:", err);
    });

    return () => {
      closed = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [room, enabled]);

  return null;
}

export default AudioSender;
