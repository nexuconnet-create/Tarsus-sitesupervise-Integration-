"use client";

import { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Paperclip, User, Flag } from "lucide-react";
import type { TaskMessage } from "../types";
import toast from "react-hot-toast";

// â”€â”€â”€ Schema â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

type MessageFormData = z.infer<typeof messageSchema>;

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface CrewCommunicationsTabProps {
  messages: TaskMessage[];
  taskId: string;
  onSendMessage?: (message: TaskMessage) => void;
}

const CrewCommunicationsTab = ({
  messages,
  taskId,
  onSendMessage,
}: CrewCommunicationsTabProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<{ name: string; data: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "" },
  });

  const currentMessage = watch("message");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "chat":
        return (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
            Chat
          </span>
        );
      case "ar":
        return (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">
            AR
          </span>
        );
      case "system":
        return (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">
            System
          </span>
        );
      default:
        return null;
    }
  };

  const onSubmit = ({ message }: MessageFormData) => {
    const newMessage: TaskMessage = {
      id: `msg-${Date.now()}`,
      sender: "Crew Manager",
      senderRole: "Crew Manager",
      content: attachment ? `${message.trim()} [Attachment: ${attachment.name}]` : message.trim(),
      timestamp: new Date().toISOString(),
      source: "chat",
    };

    if (onSendMessage) {
      onSendMessage(newMessage);
    }

    reset();
    setAttachment(null);
    toast.success("Message sent");
  };

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachment({ name: file.name, data: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <User size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">
              Start the conversation by sending a message
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === "Crew Manager" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                  message.sender === "Crew Manager"
                    ? "bg-[#007AFF]"
                    : message.source === "system"
                    ? "bg-gray-400"
                    : "bg-[#021422]"
                }`}
              >
                {message.sender.charAt(0).toUpperCase()}
              </div>

              {/* Message content */}
              <div
                className={`max-w-[80%] ${
                  message.sender === "Crew Manager" ? "items-end" : "items-start"
                } flex flex-col`}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#021422]">
                    {message.sender}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTimestamp(message.timestamp)}
                  </span>
                  {getSourceBadge(message.source)}
                </div>

                {/* Message bubble */}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm ${
                    message.sender === "Crew Manager"
                      ? "bg-[#007AFF] text-white rounded-br-md"
                      : message.source === "system"
                      ? "bg-gray-100 text-gray-700 rounded-bl-md"
                      : "bg-gray-100 text-[#021422] rounded-bl-md"
                  }`}
                >
                  {message.content}
                </div>

                {/* Role tag */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-400">
                    {message.senderRole}
                  </span>
                  {message.requiresAttention && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                      <Flag size={8} /> Requires Attention
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t border-gray-100 p-4 bg-gray-50">
        {attachment && (
          <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <Paperclip size={14} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-700 flex-1 truncate">{attachment.name}</span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="text-blue-400 hover:text-blue-600"
            >
              Ã—
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleAttach}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          />
          <div className="flex-1 relative">
            <textarea
              {...register("message")}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              rows={2}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-3 bottom-3 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              title="Attach file"
            >
              <Paperclip size={18} />
            </button>
          </div>
          <button
            type="submit"
            disabled={!currentMessage?.trim() && !attachment}
            className="p-3 bg-[#007AFF] text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
        {errors.message && (
          <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default CrewCommunicationsTab;
