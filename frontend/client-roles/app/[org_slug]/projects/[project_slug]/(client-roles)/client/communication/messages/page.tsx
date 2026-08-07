"use client";

import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  MessageSquare, Search, Filter, Paperclip, 
  Video, CalendarPlus, Send, MoreVertical, 
  Phone, Info, CheckCheck, Users, Clock,
  Edit, Activity, X
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function MessagesPage() {
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;
  
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';

  const [activeChat, setActiveChat] = useState('general');

  const conversations = [
    { id: 'general', name: 'General Chat', role: 'Project Team', unread: 0, time: '13:00', active: true },
    { id: 'pm', name: 'Engr. Adebayo', role: 'Project Manager', unread: 2, time: '12:45', active: false },
    { id: 'site', name: 'Engr. Samuel', role: 'Site Supervisor', unread: 0, time: 'Yesterday', active: false },
    { id: 'vendor', name: 'First Materials Ltd', role: 'Vendor Manager', unread: 1, time: 'Yesterday', active: false },
    { id: 'support', name: 'Client Support Team', role: 'Support', unread: 3, time: 'Tuesday', active: false },
  ];

  const [messages, setMessages] = useState([
    { id: 1, sender: 'Engr. Adebayo (PM)', time: '12:45', text: 'Foundation work completed. Next phase starting tomorrow.', isMe: false },
    { id: 2, sender: 'Engr. Samuel (Site)', time: '12:50', text: 'Material delivery confirmed for tomorrow 8:00 AM. Crane is set up.', isMe: false },
    { id: 3, sender: 'Client Support', time: '13:00', text: 'New document uploaded: Structural Drawing V3. Please review when you have a moment.', isMe: false },
    { id: 4, sender: 'You', time: '13:05', text: 'Thanks for the update. I will review the drawings this afternoon.', isMe: true },
  ]);

  const [newMessageText, setNewMessageText] = useState('');
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: newMessageText,
      isMe: true,
    };
    setMessages([...messages, newMsg]);
    setNewMessageText('');
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      showToast(`Attached: ${e.target.files[0].name}`);
      e.target.value = '';
    }
  };

  return (
    <div className="h-screen bg-[#E3E3E3] text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-wider">
            Communication Hub <span className="text-slate-300 font-light mx-2">|</span> <span className="text-lg font-semibold text-slate-600 normal-case">Messages & Notifications</span>
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Unread: 5</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium">Total Messages: 234</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setIsNewMessageModalOpen(true)} className="px-4 py-2 bg-[#021422] text-white hover:bg-[#03437a] rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-md">
            <Edit size={16} /> New Message
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-6 mb-6 flex-1 w-full flex flex-col overflow-hidden gap-6">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations, files, or keywords..." 
              className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm shrink-0 cursor-pointer hover:bg-white transition-colors">
            <Filter size={18} className="text-slate-400" />
            <select className="bg-transparent outline-none cursor-pointer w-full pr-4 appearance-none font-medium">
              <option>Filters: All Messages</option>
              <option>Unread Only</option>
              <option>With Attachments</option>
              <option>Mentions (@me)</option>
            </select>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
          
          {/* LEFT PANEL: Conversations */}
          <div className="w-full md:w-[320px] shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-0">
            <div className="p-4 border-b border-slate-100 bg-white/50 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-blue-500" /> Conversations
              </h2>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div 
                    key={conv.id}
                    onClick={() => setActiveChat(conv.id)}
                    className={`flex items-start justify-between p-3 rounded-xl cursor-pointer transition-colors border ${
                      activeChat === conv.id 
                        ? 'bg-blue-50 border-blue-100' 
                        : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100'
                    }`}
                  >
                    <div className="flex gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0 uppercase">
                        {conv.name.substring(0, 2)}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className={`font-bold truncate text-sm ${activeChat === conv.id ? 'text-blue-800' : 'text-slate-800'}`}>
                          {conv.name}
                        </span>
                        <span className="text-xs font-medium text-slate-500 truncate mt-0.5">
                          {conv.role}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                      <span className="text-[10px] font-bold text-slate-400">{conv.time}</span>
                      {conv.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Chat View */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-0">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 bg-white/50 flex flex-wrap items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#021422] flex items-center justify-center text-white font-bold shrink-0">
                  GC
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">General Chat</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Project Team Members (5 online)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Start Video Call">
                  <Video size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Schedule Meeting">
                  <CalendarPlus size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Call">
                  <Phone size={18} />
                </button>
                <button className="p-2 text-slate-300 hover:bg-slate-100 rounded-lg transition-colors ml-1">
                  <Info size={18} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white/30">
              <div className="flex flex-col gap-6">
                
                {/* Date Divider */}
                <div className="flex items-center justify-center">
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-400 uppercase tracking-wider">Today</span>
                </div>

                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    {!msg.isMe && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0 mr-3 mt-1 uppercase">
                        {msg.sender.substring(0, 2)}
                      </div>
                    )}
                    
                    <div className={`flex flex-col max-w-[75%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                      {!msg.isMe && <span className="text-xs font-bold text-slate-500 mb-1 ml-1">{msg.sender}</span>}
                      
                      <div className={`p-4 rounded-2xl ${
                        msg.isMe 
                          ? 'bg-[#021422] text-white rounded-tr-sm' 
                          : 'bg-white border border-gray-100 text-slate-800 rounded-tl-sm shadow-sm'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1 mr-1">
                        <span className="text-[10px] font-bold text-slate-400">{msg.time}</span>
                        {msg.isMe && <CheckCheck size={12} className="text-blue-500" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-slate-100 bg-white shrink-0">
              <div className="flex items-end gap-2 bg-white border border-gray-100 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
                <button onClick={handleAttachClick} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shrink-0">
                  <Paperclip size={20} />
                </button>
                <textarea 
                  placeholder="Type your message here..." 
                  className="flex-1 bg-transparent border-none focus:outline-none resize-none max-h-32 min-h-[44px] py-2.5 px-2 text-sm text-slate-800"
                  rows={1}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                ></textarea>
                <button onClick={handleSendMessage} className="p-2.5 bg-[#021422] text-white hover:bg-[#03437a] rounded-xl transition-colors shrink-0 flex items-center justify-center">
                  <Send size={18} className="ml-0.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM PANEL: Statistics */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Communication Stats</h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm font-medium">
            <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-100 flex items-center gap-2">
              <span className="text-slate-500">Total:</span>
              <span className="font-bold text-slate-800">234</span>
            </div>
            <div className="px-3 py-1.5 bg-rose-50 rounded-lg flex items-center gap-2">
              <span className="text-rose-600">Unread:</span>
              <span className="font-bold text-rose-700">5</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
            <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-100 flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              <span className="text-slate-500">Avg Response:</span>
              <span className="font-bold text-slate-700">3.2 min</span>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 rounded-lg flex items-center gap-2">
              <Activity size={14} className="text-emerald-500" />
              <span className="text-emerald-700">Active Chats:</span>
              <span className="font-bold text-emerald-800">4</span>
            </div>
          </div>
        </div>

      </div>

      {/* New Message Modal */}
      {isNewMessageModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsNewMessageModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Edit size={18} className="text-blue-600"/> Compose Message</h3>
              <button onClick={() => setIsNewMessageModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">To</label>
                <select className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Project Team (General)</option>
                  <option>Engr. Adebayo (PM)</option>
                  <option>Engr. Samuel (Site Supervisor)</option>
                  <option>First Materials Ltd (Vendor)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                <input type="text" placeholder="e.g. Schedule Update" className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Message</label>
                <textarea rows={5} placeholder="Write your message..." className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-2">
              <button onClick={() => setIsNewMessageModalOpen(false)} className="px-4 py-2 bg-white border border-gray-100 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors text-sm">Cancel</button>
              <button onClick={() => { setIsNewMessageModalOpen(false); showToast('Message sent successfully!'); }} className="px-6 py-2 bg-[#021422] text-white font-medium rounded-lg hover:bg-[#03437a] transition-colors text-sm shadow-md flex items-center gap-2">
                <Send size={16} className="ml-0.5" /> Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCheck size={18} className="text-emerald-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
