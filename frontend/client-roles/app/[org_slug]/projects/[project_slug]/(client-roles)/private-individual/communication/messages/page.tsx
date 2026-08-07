'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, MapPin, Send, Paperclip, 
  MoreVertical, CheckCheck, Smile, Phone, Video
} from 'lucide-react';

const DUMMY_MESSAGES = [
  { id: 1, text: 'Hello! I am Sarah, your dedicated Project Manager. How can I help you today?', sender: 'pm', time: '10:00 AM' },
  { id: 2, text: 'Hi Sarah. I saw the recent photos of the foundation. Looks great!', sender: 'client', time: '10:05 AM' },
  { id: 3, text: 'Thank you! Yes, we just finished pouring the concrete for Sector A. The weather has been very cooperative.', sender: 'pm', time: '10:07 AM' },
  { id: 4, text: 'Will this keep us on track for the June milestone?', sender: 'client', time: '10:15 AM' },
  { id: 5, text: 'Absolutely. In fact, we are currently about 3 days ahead of schedule.', sender: 'pm', time: '10:18 AM' },
];

export default function ChatWithPMPage() {
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'client',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <div className="h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-100">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#021422] flex items-center gap-2 uppercase tracking-wide">
            Chat with Project Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            <MapPin size={12} className="text-rose-500" />
            Lagos 12-Storey Mixed-Use Development
          </p>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col max-w-[1000px] w-full mx-auto px-4 md:px-6 py-6 overflow-hidden">
        
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" 
                  alt="Sarah - PM" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Sarah Jenkins</h2>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Lead Project Manager</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Phone size={18}/></button>
              <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Video size={18}/></button>
              <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><MoreVertical size={18}/></button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/50">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Today</span>
            </div>

            {messages.map((msg) => {
              const isClient = msg.sender === 'client';
              return (
                <div key={msg.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] md:max-w-[60%] flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                      isClient 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-gray-100 text-slate-700 rounded-tl-sm'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-400">
                      <span>{msg.time}</span>
                      {isClient && <CheckCheck size={12} className="text-blue-500" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-end gap-2 bg-white border border-gray-100 p-2 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                <Paperclip size={18}/>
              </button>
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message here..."
                className="flex-1 bg-transparent border-none focus:outline-none resize-none max-h-32 min-h-[40px] text-sm py-2.5 px-2"
                rows={1}
              />
              <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                <Smile size={18}/>
              </button>
              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send size={18}/>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-medium text-center mt-2">
              Press Enter to send, Shift + Enter for new line.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
