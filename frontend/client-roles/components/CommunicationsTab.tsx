"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Scan,
  Trash2,
  ChevronUp,
  FileText,
  File,
  Download,
} from "lucide-react";
import type { TaskMessage } from "@/lib/types";
import { apiMessageToTaskMessage } from "@/lib/types/taskCommunication";
import {
  useTaskMessages,
  useSendTaskMessage,
  useDeleteTaskMessage,
} from "@/lib/hooks/useTaskCommunications";
import { useTaskCommSocket } from "@/lib/hooks/useTaskCommSocket";
import ImageLightbox from "./ImageLightbox";
import { formatFileSize } from "@/lib/types/projectDocuments";

interface CommunicationsTabProps {
  projectId: string;
  taskId: string;
}

export default function CommunicationsTab({
  projectId,
  taskId,
}: CommunicationsTabProps) {
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [localArMessages, setLocalArMessages] = useState<TaskMessage[]>([]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useTaskMessages(projectId, taskId);
  useTaskCommSocket(projectId, taskId); // realtime updates into the same cache
  const sendMutation = useSendTaskMessage(projectId, taskId);
  const deleteMutation = useDeleteTaskMessage(projectId, taskId);

  const apiMessages: TaskMessage[] = useMemo(() => {
    if (!data?.pages) return [];
    return [...data.pages]
      .reverse()
      .flatMap((p) => p.results.map(apiMessageToTaskMessage));
  }, [data]);

  const allMessages = useMemo(() => {
    const apiIds = new Set(apiMessages.map((m) => m.id));
    const filteredLocal = localArMessages.filter((m) => !apiIds.has(m.id));
    return [...apiMessages, ...filteredLocal];
  }, [apiMessages, localArMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text && !attachedFile) return;

    sendMutation.mutate(
      { text, attachment: attachedFile ?? undefined, replyTo: null },
      {
        onSuccess: () => {
          setInput("");
          setAttachedFile(null);
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
          }
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFile(file);
    e.target.value = "";
  };

  const handleARSnapshot = () => {
    const newMsg: TaskMessage = {
      id: `ar-${Date.now()}`,
      sender: "You",
      senderRole: "",
      senderAvatar: undefined,
      content: "AR snapshot captured from field walkthrough.",
      timestamp: new Date().toISOString(),
      source: "ar",
      snapshotUrl: "https://picsum.photos/seed/ar-" + Date.now() + "/400/300",
    };
    setLocalArMessages((prev) => [...prev, newMsg]);
  };

  const handleDelete = (messageId: string) => {
    deleteMutation.mutate(messageId);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const fileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText size={16} className="shrink-0 text-red-500" />;
    if (ext === "docx" || ext === "doc") return <FileText size={16} className="shrink-0 text-blue-500" />;
    if (ext === "xlsx" || ext === "xls") return <FileText size={16} className="shrink-0 text-emerald-600" />;
    if (ext === "pptx" || ext === "ppt") return <FileText size={16} className="shrink-0 text-orange-500" />;
    return <File size={16} className="shrink-0 text-gray-400" />;
  };

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {hasNextPage && (
          <div className="flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-[#0070D4] transition-colors disabled:opacity-50"
            >
              <ChevronUp size={14} />
              {isFetchingNextPage ? "Loading..." : "Load older messages"}
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-[#0070D4] rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="text-center py-8 text-red-400 text-sm">
            Failed to load messages.
          </div>
        )}

        {!isLoading && !isError && allMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mb-3"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm font-semibold">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Start the conversation below
            </p>
          </div>
        )}

        {allMessages.map((msg: TaskMessage) => {
          const isOwn = msg.sender === "You";
          const isAR = msg.source === "ar";

          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-2 max-w-[85%] ${
                  isOwn ? "flex-row-reverse" : ""
                }`}
              >
                {!isOwn && (
                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold bg-[#021422]">
                    {msg.senderAvatar ? (
                      <img
                        src={msg.senderAvatar}
                        alt={msg.sender}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitial(msg.sender)
                    )}
                  </div>
                )}

                <div
                  className={`flex flex-col gap-1 ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {!isOwn && (
                      <span className="text-xs font-semibold text-[#021422]">
                        {msg.sender}
                      </span>
                    )}
                    {isAR && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-200 uppercase">
                        <Scan size={8} className="inline mr-0.5" />
                        AR
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  {msg.snapshotUrl && (
                    <div className="mt-1">
                      <img
                        src={msg.snapshotUrl}
                        alt="AR Snapshot"
                        className="rounded-lg max-w-[200px] border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setLightboxSrc(msg.snapshotUrl!)}
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => setLightboxSrc(msg.snapshotUrl!)}
                          className="text-xs font-semibold text-[#0070D4] hover:underline flex items-center gap-1"
                        >
                          <Scan size={10} />
                          View Full
                        </button>
                        <a
                          href={msg.snapshotUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-[#0070D4] hover:underline flex items-center gap-1"
                        >
                          <Download size={10} />
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  {msg.attachments &&
                    msg.attachments.length > 0 &&
                    msg.attachments.map((url, i) => {
                      const meta = msg.attachmentMeta?.[i];
                      if (meta?.type === "image") {
                        return (
                          <div key={url} className="mt-1">
                            <img
                              src={url}
                              alt={meta.name}
                              className="rounded-lg max-w-[200px] max-h-[200px] border border-gray-200 cursor-pointer object-cover hover:opacity-90 transition-opacity"
                              onClick={() => setLightboxSrc(url)}
                            />
                            <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[200px]">
                              {meta.name}
                            </p>
                          </div>
                        );
                      }
                      const name =
                        meta?.name || url.split("/").pop() || "attachment";
                      const size = meta?.sizeBytes ?? 0;
                      return (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                        >
                          {fileIcon(name)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate group-hover:text-[#0070D4] transition-colors">
                              {name}
                            </p>
                            {size > 0 && (
                              <p className="text-[10px] text-gray-400">
                                {formatFileSize(size)}
                              </p>
                            )}
                          </div>
                          <Download
                            size={14}
                            className="shrink-0 text-gray-400 group-hover:text-[#0070D4] transition-colors"
                          />
                        </a>
                      );
                    })}

                  {msg.content.trim() && (
                    <div
                      className={`px-3 py-2 rounded-xl text-sm ${
                        isOwn
                          ? "bg-[#0070D4] text-white rounded-br-sm"
                          : "bg-gray-100 text-[#021422] rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}

                  {isOwn && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="text-[10px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-0.5"
                    >
                      <Trash2 size={10} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="pt-4 border-t border-gray-100 space-y-2">
        {attachedFile && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">
            <Paperclip size={12} />
            <span className="flex-1 truncate">{attachedFile.name}</span>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              x
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleARSnapshot}
            className="shrink-0 px-3 py-2 border border-gray-200 rounded-lg text-gray-400 hover:text-[#021422] hover:border-gray-300 transition-colors flex items-center gap-1 text-xs font-medium"
            title="Add AR Snapshot"
          >
            <Scan size={14} />
          </button>
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full pl-4 pr-20 py-2.5 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-[#0070D4] outline-none text-sm resize-none overflow-y-auto"
            />
            <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
              <label className="p-1.5 text-gray-400 hover:text-[#021422] cursor-pointer transition-colors">
                <Paperclip size={16} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleAttach}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleSend}
                disabled={sendMutation.isPending}
                className="p-1.5 bg-[#0070D4] text-white rounded-full hover:bg-[#005bb5] transition-colors disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

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
