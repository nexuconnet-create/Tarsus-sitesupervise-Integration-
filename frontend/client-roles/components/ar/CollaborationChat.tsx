"use client";

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { ChatMessage } from '@/lib/types/collaboration';

interface CollaborationChatProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  loading: boolean;
}

const CollaborationChat = ({ messages, onSendMessage, loading }: CollaborationChatProps) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chat</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[180px] max-h-[260px] bg-gray-50/50">
        {messages.length === 0 && !loading && (
          <p className="text-center text-xs text-gray-400 py-4">No messages yet</p>
        )}
        {loading && (
          <p className="text-center text-xs text-gray-400 py-4">Loading messages...</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${msg.isOwn ? 'order-1' : ''}`}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-semibold text-gray-500">
                  {msg.senderName} ({msg.senderRole})
                </span>
              </div>
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  msg.isOwn
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
              <p className={`text-[9px] text-gray-400 mt-0.5 ${msg.isOwn ? 'text-right' : ''}`}>
                {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-gray-200 p-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default CollaborationChat;
