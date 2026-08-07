'use client';

import { useState } from 'react';
import { Camera, Mic, Video, Share2, Plus, Circle, X, MoreVertical, Send, AtSign, Check } from 'lucide-react';
import Image from 'next/image';

interface Participant {
  id: string;
  name: string;
  role: string;
  image?: string;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isUser?: boolean;
}

export default function ProjectRoomPage() {
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('dashboard');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [messageInput, setMessageInput] = useState('');

  const participants: Participant[] = [
    { id: '1', name: 'Jane Doe', role: '(Struct. Eng)', image: '/placeholder-1.jpg' },
    { id: '2', name: 'John Smith', role: '(Site Supervisor)', image: '/placeholder-2.jpg' },
    { id: '3', name: 'Alice', role: '(Client Rep.)', image: '/placeholder-3.jpg' },
  ];

  const messages: Message[] = [
    { id: '1', sender: 'Jane', text: 'John, can you pan to the left? I want to...', time: '10:15 AM', isUser: true },
    { id: '2', sender: 'System', text: '@Jane started on Live Feed', time: '10:30 AM' },
    { id: '3', sender: 'System', text: "@Action item 'Verify spacing' created", time: '10:30 AM' },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center justify-center">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1763210692/logo_myiwr5.png"
              alt="Site Supervise Logo"
              width={40}
              height={40}
              className="object-contain md:w-[60px] md:h-[60px]"
            />
          </div>
          <h1 className="text-sm md:text-lg font-semibold text-gray-800">Project Room</h1>
        </div>
        <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Meeting Time: 00: 45: 12</p>
      </div>

      {/* Top Control Buttons Bar */}
      <div className="bg-gray-200 px-3 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-stretch md:items-start justify-between gap-3 md:gap-6">
        {/* Left Side Buttons */}
        <div className="flex flex-wrap gap-2 md:gap-4">
          <button
            onClick={() => setShowAgendaModal(true)}
            className="bg-[#001220] hover:bg-[#002030] text-white py-2 md:py-3 px-3 md:px-6 rounded-xl text-[10px] md:text-xs font-bold transition-colors flex items-center gap-1 md:gap-2"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">AGENDA ITEM</span>
            <span className="sm:hidden">AGENDA</span>
          </button>
          <button
            onClick={() => setShowChatModal(true)}
            className="bg-[#0066FF] hover:bg-[#0052CC] text-white py-2 md:py-3 px-3 md:px-6 rounded-xl text-[10px] md:text-xs font-bold transition-colors flex items-center gap-1 md:gap-2"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="hidden sm:inline">MEETING ACTIONS</span>
            <span className="sm:hidden">ACTIONS</span>
          </button>
        </div>

        {/* Right Side Buttons */}
        <div className="flex flex-wrap gap-2 md:gap-4">
          <button
            onClick={() => setShowChatModal(true)}
            className="bg-[#001220] hover:bg-[#002030] text-white py-2 md:py-3 px-3 md:px-6 rounded-xl text-[10px] md:text-xs font-bold transition-colors flex items-center gap-1 md:gap-2 relative"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full absolute top-1 md:top-2 right-1 md:right-2"></div>
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="hidden lg:inline">MEETING CHAT & ACTION</span>
            <span className="lg:hidden">CHAT</span>
          </button>
          <button
            onClick={() => setShowControlsModal(true)}
            className="bg-[#0066FF] hover:bg-[#0052CC] text-white py-2 md:py-3 px-3 md:px-6 rounded-xl text-[10px] md:text-xs font-bold transition-colors flex items-center gap-1 md:gap-2"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            CONTROLS
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-145px)] overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-full md:w-[340px] bg-gray-200 p-3 md:p-4 space-y-3 md:space-y-4 overflow-y-auto max-h-[400px] md:max-h-none">
          {/* Participants & Agenda */}
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="bg-white px-3 md:px-4 py-2 md:py-3 border-b border-gray-200">
              <h2 className="text-xs md:text-sm font-bold text-gray-800">PARTICIPANTS & AGENDA</h2>
            </div>
            <div className="bg-[#001220] p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  onClick={() => index === 0 && setShowAgendaModal(true)}
                  className="bg-white border-4 border-black rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="aspect-video bg-white flex items-center justify-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="bg-white px-3 py-2 text-center border-t-2 border-gray-300">
                    <p className="text-xs font-bold text-gray-800">
                      {participant.name} <span className="font-normal text-gray-600">{participant.role}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-200 p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl overflow-hidden h-fit flex flex-col">
            {/* Workspace Header */}
            <div className="bg-[#001220] text-white py-4 md:py-8 px-4 md:px-6">
              <h2 className="text-lg md:text-2xl font-bold text-center">SHARED WORKSPACE</h2>
            </div>

            {/* Workspace Tabs */}
            <div className="flex items-center gap-2 md:gap-4 px-3 md:px-6 py-3 md:py-4 bg-gray-50 overflow-x-auto">
              <button
                onClick={() => setActiveWorkspaceTab('dashboard')}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap ${activeWorkspaceTab === 'dashboard'
                    ? 'bg-[#001220] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </button>
              <button
                onClick={() => setActiveWorkspaceTab('3dmodel')}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap ${activeWorkspaceTab === '3dmodel'
                    ? 'bg-[#001220] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                3D Model
              </button>
              <button
                onClick={() => setActiveWorkspaceTab('livefeed')}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap ${activeWorkspaceTab === 'livefeed'
                    ? 'bg-[#001220] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Live Site Feed
              </button>
            </div>

            {/* Display Area */}
            <div className="flex-1 bg-gray-50 p-4 md:p-8 flex flex-col items-center justify-center">
              <div className="w-full max-w-3xl border-2 md:border-4 border-blue-400 rounded-xl bg-white p-6 md:p-12 flex flex-col items-center justify-center min-h-[250px] md:min-h-[400px]">
                <div className="w-12 h-12 md:w-20 md:h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 md:mb-6">
                  <Camera className="w-6 h-6 md:w-10 md:h-10 text-gray-400" />
                </div>
                <p className="text-gray-400 font-medium text-xs md:text-sm mb-1">LIVE AR FEED</p>
                <p className="text-gray-400 text-[10px] md:text-xs">BotKit &amp; SiteHub (Client&apos;s View)</p>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-4 md:mt-6 text-center">Live Video Showing Rebar. Remote Markups Visible.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Modal */}
      {showControlsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-start justify-end z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-[#001220] text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h3 className="text-sm font-bold">CONTROLS</h3>
              <button onClick={() => setShowControlsModal(false)} className="text-white hover:text-red-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className='flex items-center gap-4'>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white py-4 px-6 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-3"
                >
                  <Mic className="w-5 h-5" />
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className="w-full bg-[#001220] hover:bg-[#002030] text-white py-4 px-6 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-3"
                >
                  <Video className="w-5 h-5" />
                  {isVideoOn ? 'Stop Video' : 'Start Video'}
                </button>
              </div>
              <button className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white py-4 px-6 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-3">
                <Camera className="w-5 h-5" />
                Share My AR Feed
              </button>
              <button
                onClick={() => {
                  setShowControlsModal(false);
                  setShowActionsModal(true);
                }}
                className="w-full bg-[#001220] hover:bg-[#002030] text-white py-4 px-6 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5" />
                Create Action Item
              </button>
              <button className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white py-4 px-6 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-3">
                <Circle className="w-5 h-5" />
                Record Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-end z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-full flex flex-col">
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-xl">
              <h3 className="text-sm font-bold text-gray-800">MESSAGE CHAT & ACTIONS</h3>
              <div className="flex items-center gap-2">
                <button className="text-gray-500 hover:text-gray-700">
                  <MoreVertical className="w-5 h-5" />
                </button>
                <button onClick={() => setShowChatModal(false)} className="text-gray-500 hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${message.isUser ? 'text-right' : 'text-left'}`}>
                    {message.isUser && (
                      <p className="text-xs text-gray-500 mb-1">{message.sender}</p>
                    )}
                    <div className={`inline-block px-4 py-3 rounded-lg ${message.isUser
                        ? 'bg-[#0066FF] text-white rounded-tr-none'
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}>
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type Reply..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF] text-sm"
                />
                <button className="p-3 text-gray-500 hover:text-gray-700">
                  <AtSign className="w-5 h-5" />
                </button>
                <button onClick={handleSendMessage} className="p-3 text-gray-500 hover:text-[#0066FF]">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agenda Modal */}
      {showAgendaModal && (
        <div className="fixed inset-0 bg-black/80 flex items-start justify-start z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl h-[200px] w-full max-w-md">
            <div className="bg-[#001220] text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h3 className="text-sm font-bold">AGENDA ITEM: WP-205</h3>
              <button onClick={() => setShowAgendaModal(false)} className="text-white hover:text-red-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-sm font-bold text-[#0066FF]">Status:</span>
                <div className="flex items-center gap-2">
                  <Circle className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-800">On Hold</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm font-bold text-[#0066FF]">Latest:</span>
                <span className="text-sm text-gray-800">AR snapshot of spacing issue attached</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Actions Modal */}
      {showActionsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="bg-[#001220] text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h3 className="text-sm font-bold">MEETING ACTIONS</h3>
              <button onClick={() => setShowActionsModal(false)} className="text-white hover:text-red-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800 mb-3">
                    Action Created: Verify rebar spacing at NE Corner
                  </p>
                  <p className="text-sm text-gray-700">
                    Owner: John Smith | Finish: EOD | Linked: WP-205
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
