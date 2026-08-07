"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  Mic,
  Square,
  Trash2,
  FileText,
  MessageSquare,
  Loader2,
  Radio,
  Download,
  Languages,
  Volume2,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { messagingService } from "@/lib/services/messaging";
import { API_BASE_URL } from "@/lib/api";
import { messagingKeys } from "@/lib/queryKeys";
import { getErrorMessage, sanitizeErrorMessage } from "@/lib/error";
import { useAuthStore } from "@/lib/stores/authStore";
import { useChatSocket, type MessagingTarget } from "@/lib/hooks/useChatSocket";
import type { ChatMessage, SupportedLanguage } from "@/lib/types/messaging";
import ImageLightbox from "@/components/ImageLightbox";

// Persisted target language for on-demand message translation.
const TARGET_LANG_KEY = "chat_target_language";

function getInitialTargetLang(): string {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(TARGET_LANG_KEY) || "en";
}

function toAbsoluteMediaUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Relative media URL — prepend the backend base URL.
  const base = API_BASE_URL?.replace(/\/$/, "") ?? "";
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

interface ChatPanelProps {
  projectUuid: string;
  // Messaging UI handles project + private rooms only (never conference chat).
  target: MessagingTarget;
  title: string;
  subtitle?: string;
}

export default function ChatPanel({
  projectUuid,
  target,
  title,
  subtitle,
}: ChatPanelProps) {
  const myUuid = useAuthStore((s) => s.user?.uuid);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  // Translation UI state.
  const [languages, setLanguages] = useState<SupportedLanguage[]>([]);
  const [targetLang, setTargetLang] = useState<string>(getInitialTargetLang);
  const [translatingUuid, setTranslatingUuid] = useState<string | null>(null);
  // Messages the user has toggled back to their original (un-translated) text.
  const [showOriginal, setShowOriginal] = useState<Set<string>>(new Set());
  // Voice note TTS audio URLs keyed by "voice:<lang>:tts_url" cache key.
  const [ttsAudioMap, setTtsAudioMap] = useState<Map<string, string>>(new Map());
  // Currently playing TTS audio element ref.
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roomUuid = target.kind === "private" ? target.roomUuid : null;
  const queryClient = useQueryClient();

  // Clear this room's unread notifications on the server. The backend does NOT
  // clear on socket connect (by design) and exposes only per-notification
  // mark-read, so we list the user's unread notifications, keep the ones that
  // belong to this room, and mark each read — then refresh the nav badge.
  const markRoomRead = useCallback(async () => {
    if (!projectUuid) return;
    try {
      const res = await messagingService.listNotifications();
      const all = Array.isArray(res.data) ? res.data : [];
      const mine = all.filter((n) =>
        roomUuid
          ? n.room_type === "private" && n.room_uuid === roomUuid
          : n.room_type === "project" && n.project_uuid === projectUuid,
      );
      if (mine.length === 0) return;
      await Promise.allSettled(
        mine.map((n) => messagingService.markNotificationRead(n.uuid)),
      );
      queryClient.invalidateQueries({
        queryKey: messagingKeys.unread(projectUuid),
      });
    } catch {
      /* non-fatal — the badge will catch up on its next poll */
    }
  }, [projectUuid, roomUuid, queryClient]);

  // Append a message, de-duplicating by uuid (the sender also receives its own
  // broadcast from the server). A message from someone else while this room is
  // open is read immediately, so the badge never ticks up for what you're viewing.
  const appendMessage = useCallback(
    (msg: ChatMessage) => {
      setMessages((prev) =>
        prev.some((m) => m.uuid === msg.uuid) ? prev : [...prev, msg],
      );
      if (myUuid && msg.sender_uuid !== myUuid) void markRoomRead();
    },
    [myUuid, markRoomRead],
  );

  const { connected, send } = useChatSocket({
    target,
    onMessage: appendMessage,
    onError: (_code, detail) => toast.error(detail),
  });

  // Load history whenever the target changes.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setMessages([]);
      try {
        const res =
          target.kind === "project"
            ? await messagingService.getProjectMessages(projectUuid)
            : await messagingService.getPrivateMessages(projectUuid, target.roomUuid);
        // Cursor pagination returns newest-first — show chronological.
        const list = [...(res.data?.results ?? [])].reverse();
        if (!cancelled) setMessages(list);
        // Opening a conversation marks everything in it as read.
        if (!cancelled) void markRoomRead();
      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [projectUuid, target, roomUuid, markRoomRead]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Supported languages for the picker — stable, fetch once. Non-fatal: on
  // failure the picker simply stays hidden and translation is unavailable.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await messagingService.getLanguages();
        if (!cancelled && Array.isArray(res.data)) setLanguages(res.data);
      } catch {
        /* non-fatal */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectLang = (code: string) => {
    setTargetLang(code);
    try {
      localStorage.setItem(TARGET_LANG_KEY, code);
    } catch {
      /* ignore storage failures */
    }
  };

  const handleTranslate = async (msg: ChatMessage) => {
    // A cached translation is instant and free — render without a request.
    if (msg.translations?.[targetLang]) {
      setShowOriginal((prev) => {
        const next = new Set(prev);
        next.delete(msg.uuid);
        return next;
      });
      return;
    }
    setTranslatingUuid(msg.uuid);
    try {
      const res =
        target.kind === "project"
          ? await messagingService.translateProjectMessage(
              projectUuid,
              msg.uuid,
              targetLang,
            )
          : await messagingService.translatePrivateMessage(
              projectUuid,
              target.roomUuid,
              msg.uuid,
              targetLang,
            );
      const translated = res.data.translated_text;
      setMessages((prev) =>
        prev.map((m) =>
          m.uuid === msg.uuid
            ? {
                ...m,
                translations: { ...(m.translations ?? {}), [targetLang]: translated },
              }
            : m,
        ),
      );
      setShowOriginal((prev) => {
        const next = new Set(prev);
        next.delete(msg.uuid);
        return next;
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTranslatingUuid(null);
    }
  };

  const toggleOriginal = (uuid: string) => {
    setShowOriginal((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  };

  const handleTranslateVoice = async (msg: ChatMessage) => {
    const ttsCacheKey = `voice:${targetLang}:tts_url`;

    // Check if we already have the TTS audio URL cached locally for this language.
    if (ttsAudioMap.has(ttsCacheKey)) {
      const url = ttsAudioMap.get(ttsCacheKey)!;
      const audio = new Audio(url);
      ttsAudioRef.current?.pause();
      ttsAudioRef.current = audio;
      audio.play().catch(() => toast.error("Failed to play audio."));
      return;
    }

    // Check if the backend has it cached (from a previous session).
    const cachedUrl = msg.translations?.[ttsCacheKey];
    if (cachedUrl) {
      const absoluteUrl = toAbsoluteMediaUrl(cachedUrl);
      setTtsAudioMap((prev) => new Map(prev).set(ttsCacheKey, absoluteUrl));
      const audio = new Audio(absoluteUrl);
      ttsAudioRef.current?.pause();
      ttsAudioRef.current = audio;
      audio.play().catch(() => toast.error("Failed to play audio."));
      return;
    }

    setTranslatingUuid(msg.uuid);
    try {
      const res =
        target.kind === "project"
          ? await messagingService.transcribeProjectMessage(
              projectUuid,
              msg.uuid,
              targetLang,
            )
          : await messagingService.transcribePrivateMessage(
              projectUuid,
              target.roomUuid,
              msg.uuid,
              targetLang,
            );

      const { tts_audio_url, tts_error } = res.data;

      // Cache the TTS URL locally and in the message translations.
      if (tts_audio_url) {
        setTtsAudioMap((prev) => new Map(prev).set(ttsCacheKey, tts_audio_url));
        setMessages((prev) =>
          prev.map((m) =>
            m.uuid === msg.uuid
              ? {
                  ...m,
                  translations: {
                    ...(m.translations ?? {}),
                    [ttsCacheKey]: tts_audio_url,
                  },
                }
              : m,
          ),
        );
        // Play immediately.
        const audio = new Audio(tts_audio_url);
        ttsAudioRef.current?.pause();
        ttsAudioRef.current = audio;
        audio.play().catch(() => toast.error("Failed to play audio."));
      } else {
        toast.error(
          sanitizeErrorMessage(tts_error) || "Translation audio not available.",
        );
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTranslatingUuid(null);
    }
  };

  const handleSendText = () => {
    const content = input.trim();
    if (!content) return;
    const ok = send({ type: "text", content });
    if (!ok) {
      toast.error("Not connected. Reconnecting…");
      return;
    }
    setInput("");
  };

  const handleAttachment = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res =
        target.kind === "project"
          ? await messagingService.uploadProjectAttachment(projectUuid, form)
          : await messagingService.uploadPrivateAttachment(
              projectUuid,
              target.roomUuid,
              form,
            );
      send({ type: "attachment", message_uuid: res.data.message_uuid });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleVoiceNote = async (file: File, durationSec: number) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("duration", String(Math.max(1, Math.round(durationSec))));
      const res =
        target.kind === "project"
          ? await messagingService.uploadProjectVoiceNote(projectUuid, form)
          : await messagingService.uploadPrivateVoiceNote(
              projectUuid,
              target.roomUuid,
              form,
            );
      send({ type: "voice_note", message_uuid: res.data.message_uuid });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (msg: ChatMessage) => {
    try {
      if (target.kind === "project") {
        await messagingService.deleteProjectMessage(projectUuid, msg.uuid);
      } else {
        await messagingService.deletePrivateMessage(
          projectUuid,
          target.roomUuid,
          msg.uuid,
        );
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.uuid === msg.uuid ? { ...m, is_deleted: true, content: "" } : m,
        ),
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-bold text-sm text-[#021422]">{title}</h2>
          {subtitle && <p className="text-[11px] text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {languages.length > 0 && (
            <label
              className="flex items-center gap-1 text-gray-500"
              title="Translate messages into"
            >
              <Languages size={14} className="text-gray-400" />
              <select
                value={targetLang}
                onChange={(e) => handleSelectLang(e.target.value)}
                className="text-[11px] font-medium text-[#021422] bg-gray-50 rounded-lg px-1.5 py-1 outline-none focus:ring-2 focus:ring-[#0070D4] cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <span
            className={`flex items-center gap-1 text-[10px] font-bold uppercase ${
              connected ? "text-green-600" : "text-gray-400"
            }`}
          >
            <Radio size={10} className={connected ? "animate-pulse" : ""} />
            {connected ? "Live" : "Connecting"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gray-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
            <MessageSquare size={32} className="text-gray-300" />
            <p className="text-sm font-medium">No messages yet.</p>
            <p className="text-xs">Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = !!myUuid && msg.sender_uuid === myUuid;
            const isText = msg.message_type === "text" && !msg.is_deleted;
            const isVoice = msg.message_type === "voice_note" && !msg.is_deleted;
            const translation = msg.translations?.[targetLang] ?? null;
            const isOriginalShown = showOriginal.has(msg.uuid);
            // Show translation when one exists and the user hasn't toggled back.
            const showTranslation = isText && !!translation && !isOriginalShown;
            const canTranslate = isText && languages.length > 0;
            const canTranslateVoice = isVoice && languages.length > 0;
            const ttsCacheKey = `voice:${targetLang}:tts_url`;
            const hasTtsAudio =
              ttsAudioMap.has(msg.uuid) || !!msg.translations?.[ttsCacheKey];
            return (
              <div
                key={msg.uuid}
                className={`flex flex-col ${isOwn ? "items-end" : "items-start"} group max-w-[80%] ${isOwn ? "ml-auto" : "mr-auto"}`}
              >
                <span className="text-[10px] font-bold text-gray-400 px-1 mb-0.5">
                  {isOwn ? "You" : msg.sender_name}
                </span>
                {msg.message_type === "voice_note" ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-3 py-2 rounded-tr-sm flex items-center gap-2">
                    <MessageBody
                      msg={msg}
                      onImageClick={setLightboxSrc}
                      translatedText={showTranslation ? translation : null}
                    />
                  {hasTtsAudio && (
                    <button
                      onClick={() => {
                        const url =
                          ttsAudioMap.get(ttsCacheKey) ||
                          toAbsoluteMediaUrl(msg.translations?.[ttsCacheKey] || "");
                        if (!url) return;
                        const audio = new Audio(url);
                        ttsAudioRef.current?.pause();
                        ttsAudioRef.current = audio;
                        audio.play().catch(() => toast.error("Failed to play audio."));
                      }}
                      className="text-[#0070D4] hover:text-[#005bb5] transition-colors shrink-0"
                      title="Play translated audio"
                    >
                      <Volume2 size={18} />
                    </button>
                  )}
                  </div>
                ) : (
                  <div
                    className={`rounded-2xl shadow-sm overflow-hidden ${
                      isOwn
                        ? "bg-[#0070D4] text-white rounded-tr-sm"
                        : "bg-white text-[#021422] rounded-tl-sm border border-gray-100"
                    }`}
                  >
                    <MessageBody
                      msg={msg}
                      onImageClick={setLightboxSrc}
                      translatedText={showTranslation ? translation : null}
                    />
                  </div>
                )}
                {showTranslation && (
                  <button
                    onClick={() => toggleOriginal(msg.uuid)}
                    className={`text-[9px] px-1 mt-0.5 hover:underline ${isOwn ? "text-blue-400" : "text-gray-400"}`}
                  >
                    Translated · Show original
                  </button>
                )}
                {isText && translation && isOriginalShown && (
                  <button
                    onClick={() => toggleOriginal(msg.uuid)}
                    className={`text-[9px] px-1 mt-0.5 hover:underline ${isOwn ? "text-blue-400" : "text-gray-400"}`}
                  >
                    Show translation
                  </button>
                )}
                <div
                  className={`flex items-center gap-1.5 px-1 mt-0.5 ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <span className="text-[9px] text-gray-400">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {canTranslate && !showTranslation && (
                    <button
                      onClick={() => handleTranslate(msg)}
                      disabled={translatingUuid === msg.uuid}
                      className="flex items-center gap-0.5 text-gray-400 hover:text-[#0070D4] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
                      title={`Translate to ${languages.find((l) => l.code === targetLang)?.name ?? targetLang}`}
                    >
                      {translatingUuid === msg.uuid ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <Languages size={10} />
                      )}
                    </button>
                  )}
                  {canTranslateVoice && (
                    <button
                      onClick={() => handleTranslateVoice(msg)}
                      disabled={translatingUuid === msg.uuid}
                      className="flex items-center gap-0.5 text-gray-400 hover:text-[#0070D4] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
                      title={
                        hasTtsAudio
                          ? "Play translated audio"
                          : `Translate to ${languages.find((l) => l.code === targetLang)?.name ?? targetLang}`
                      }
                    >
                      {translatingUuid === msg.uuid ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : hasTtsAudio ? (
                        <Volume2 size={10} />
                      ) : (
                        <Languages size={10} />
                      )}
                    </button>
                  )}
                  {isOwn && !msg.is_deleted && (
                    <button
                      onClick={() => handleDelete(msg)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="px-3 py-2.5 bg-white border-t border-gray-100 shrink-0">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendText();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 pl-4 pr-3 py-2 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0070D4] text-sm"
          />

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleAttachment(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-gray-400 hover:text-[#021422] transition-colors disabled:opacity-50"
            title="Attach file"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
          </button>

          <VoiceRecorder onRecorded={handleVoiceNote} disabled={uploading} />

          <button
            onClick={handleSendText}
            className="bg-[#0070D4] hover:bg-[#005bb5] text-white p-2.5 rounded-full transition-colors"
            title="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxSrc && (
          <ImageLightbox
            src={lightboxSrc}
            alt="Image attachment"
            onClose={() => setLightboxSrc(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MessageBody({
  msg,
  onImageClick,
  translatedText,
}: {
  msg: ChatMessage;
  onImageClick?: (src: string) => void;
  translatedText?: string | null;
}) {
  if (msg.is_deleted) {
    return <p className="text-xs italic opacity-60 px-2 py-1">Message deleted</p>;
  }
  if (msg.message_type === "voice_note" && msg.voice_note) {
    return (
      <audio controls src={toAbsoluteMediaUrl(msg.voice_note.url)} className="max-w-[220px] h-8">
        Your browser does not support audio playback.
      </audio>
    );
  }
  if (msg.message_type === "attachment" && msg.attachment) {
    const att = msg.attachment;
    const attUrl = toAbsoluteMediaUrl(att.url);
    if (att.file_type === "image") {
      return (
        <div className="relative group/img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={attUrl}
            alt={att.original_filename}
            className="max-w-[260px] max-h-[180px] cursor-pointer hover:opacity-90 transition-opacity object-cover"
            onClick={() => onImageClick?.(attUrl)}
          />
          <div className="absolute bottom-1 right-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
            <a
              href={attUrl}
              download={att.original_filename}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black/60 text-white p-1 rounded-md hover:bg-black/80 transition-colors"
              title="Download"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={12} />
            </a>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-2.5 py-2 bg-white rounded-lg border border-gray-100">
        <FileText size={16} className="text-gray-400 shrink-0" />
        <span className="text-xs font-medium text-gray-700 truncate flex-1">{att.original_filename}</span>
        <a
          href={attUrl}
          download={att.original_filename}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-gray-400 hover:text-[#0070D4] p-1 rounded transition-colors"
          title="Download"
        >
          <Download size={14} />
        </a>
      </div>
    );
  }
  return (
    <p className="text-[13px] font-medium whitespace-pre-wrap px-2 py-1">
      {translatedText ?? msg.content}
    </p>
  );
}

function VoiceRecorder({
  onRecorded,
  disabled,
}: {
  onRecorded: (file: File, durationSec: number) => void;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const durationSec = (Date.now() - startedAtRef.current) / 1000;
        const file = new File([blob], `voice-note-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        stream.getTracks().forEach((t) => t.stop());
        onRecorded(file, durationSec);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast.error("Microphone permission denied.");
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  return (
    <button
      onClick={recording ? stop : start}
      disabled={disabled}
      className={`transition-colors disabled:opacity-50 ${
        recording ? "text-red-500" : "text-gray-400 hover:text-[#021422]"
      }`}
      title={recording ? "Stop recording" : "Record voice note"}
    >
      {recording ? <Square size={18} /> : <Mic size={18} />}
    </button>
  );
}
