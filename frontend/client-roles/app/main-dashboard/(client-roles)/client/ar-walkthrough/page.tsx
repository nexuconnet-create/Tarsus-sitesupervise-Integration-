'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Glasses, ChevronLeft, Mic, MicOff, Camera, Video, 
  MapPin, CheckCircle, AlertTriangle, FileText, Wifi, 
  Battery, ScanFace, Activity
} from 'lucide-react';

import { useProjectUuid } from '@/lib/hooks/useProjectUuid';
import { arSessionService } from '@/lib/services/arSessionService';
import type { ARSession } from '@/lib/types/arSession';
import HeadsetStream from '@/components/ar/HeadsetStream';
import AudioSender from '@/components/ar/AudioSender';
import CollaborationChat from '@/components/ar/CollaborationChat';

interface RemoteSession {
  sessionId: string;
  sessionUuid: string;
  livekitToken: string;
  livekitUrl: string;
  roomName: string;
  engineer: { name: string; role: string; device: string };
  startTime: string;
  signalStrength: 'strong' | 'moderate' | 'weak';
}

interface ChatMessage {
  id: string;
  sessionId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export default function ArWalkThroughPage() {
  const router = useRouter();
    const org_slug = "";
  const project_slug = "";
  
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);

  const [isMuted, setIsMuted] = useState(false);
  const [time, setTime] = useState('00:00:00');

  // AR Session state
  const [session, setSession] = useState<RemoteSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Simple timer for the recording HUD
  useEffect(() => {
    let seconds = 0;
    const interval = setInterval(() => {
      seconds++;
      const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      setTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Live Session
  useEffect(() => {
    if (!projectUuid) {
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await arSessionService.getSessions(projectUuid);
        const sessions = res.data?.results || [];
        const liveSession = sessions.find((s: ARSession) => s.is_live);

        if (liveSession) {
          const joinRes = await arSessionService.joinSession(projectUuid, liveSession.uuid, {
            is_broadcaster: false,
            device_type: 'web',
          });
          const joinData = joinRes.data;
          setSession({
            sessionId: String(liveSession.id),
            sessionUuid: liveSession.uuid,
            livekitToken: joinData.livekit_token,
            livekitUrl: joinData.livekit_url,
            roomName: joinData.room_name,
            engineer: {
              name: 'Field Engineer',
              role: 'Site Engineer',
              device: 'Trimble XR10',
            },
            startTime: new Date().toISOString(),
            signalStrength: 'strong',
          });
        } else {
          setError('No active AR session found on site.');
        }
      } catch (err) {
        setError('Failed to fetch AR session.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [projectUuid]);

  const handleSendMessage = (content: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: session?.sessionId || '',
      senderName: 'Client',
      senderRole: 'Viewer',
      content,
      timestamp: new Date().toISOString(),
      isOwn: true,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col font-sans overflow-hidden">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0 z-20 relative shadow-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Glasses className="text-indigo-400" size={20} />
              AR WALKTHROUGH — Live Client View
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wider">
              {session ? `SUPERINTENDENT: ${session.engineer.name.toUpperCase()}` : 'AWAITING CONNECTION'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Wifi size={14} className={session ? "text-emerald-400" : "text-slate-600"} />
            <span>{session ? '98 Mbps' : 'Offline'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Battery size={14} className={session ? "text-emerald-400" : "text-slate-600"} />
            <span>{session ? '84%' : '--'}</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full ${session ? 'bg-red-600/20 text-red-400 border-red-600/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
            <div className={`w-2 h-2 rounded-full ${session ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
            {session ? `REC ${time}` : 'OFFLINE'}
          </div>
        </div>
      </div>

      {/* Main AR HUD Interface */}
      <div className="flex-1 relative flex bg-black">
        
        {/* Background "Camera Feed" */}
        <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-slate-950">
          {loading ? (
            <div className="flex flex-col items-center">
               <Activity size={32} className="text-indigo-500 animate-pulse mb-4" />
               <p className="font-mono text-sm tracking-widest text-slate-400">CONNECTING TO FIELD AR...</p>
            </div>
          ) : error || !session ? (
            <div className="flex flex-col items-center">
               <ScanFace size={48} className="mx-auto text-slate-700 mb-4" />
               <p className="font-mono text-sm tracking-widest text-slate-500 mb-2 uppercase">{error || 'NO ACTIVE SESSION'}</p>
               <p className="text-xs text-slate-600">Please wait for the site engineer to initiate a walkthrough.</p>
            </div>
          ) : (
            <div className="absolute inset-0 w-full h-full">
               <HeadsetStream room={session.sessionUuid} />
               <div className="hidden">
                 <AudioSender room={session.sessionUuid} />
               </div>
               
               {/* AR Grid lines (subtle overlay on top of video) */}
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
               </div>
            </div>
          )}
        </div>

        {/* Floating Controls & Overlays (Left Side) */}
        <div className="absolute left-6 top-6 bottom-6 flex flex-col justify-between pointer-events-none z-10">
          {/* Top Left Stats */}
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 w-48 shadow-2xl pointer-events-auto">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Telemetry</h3>
             <div className="space-y-3">
               <div>
                 <p className="text-[10px] text-slate-500">Device</p>
                 <p className="text-sm text-slate-200 font-mono">{session ? session.engineer.device : 'N/A'}</p>
               </div>
               <div>
                 <p className="text-[10px] text-slate-500">Spatial Drift</p>
                 <p className={`text-sm font-mono ${session ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Activity size={12} className="inline mr-1"/>{session ? 'Stable' : 'N/A'}
                 </p>
               </div>
             </div>
          </div>

          {/* Bottom Left Media Controls */}
          {session && (
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-2 flex flex-col gap-2 pointer-events-auto">
               <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-lg transition-colors flex items-center justify-center ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
                  title="Toggle Microphone"
               >
                 {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
               </button>
               <button className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors flex items-center justify-center" title="Capture Snapshot">
                 <Camera size={20} />
               </button>
               <button className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-900/50 flex items-center justify-center" title="Pin Location">
                 <MapPin size={20} />
               </button>
            </div>
          )}
        </div>

        {/* Right Sidebar - Chat & Communications */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900/90 backdrop-blur-xl border-l border-white/10 flex flex-col shadow-2xl z-10">
          <div className="p-4 border-b border-white/10 bg-black/40">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="text-blue-400" size={16} />
              COLLABORATION
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Chat with on-site team</p>
          </div>

          <div className="flex-1 overflow-y-auto bg-black/20 p-2">
            {session ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-2">
                  <CollaborationChat
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    loading={loading}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-slate-500 text-center px-4">Chat is disabled while offline.</p>
              </div>
            )}
          </div>

          {/* Voice Transcript Area */}
          <div className="p-4 bg-black/60 border-t border-white/10 shrink-0">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Mic size={12} className={isMuted || !session ? 'text-slate-600' : 'text-emerald-500 animate-pulse'} />
              {isMuted ? 'Audio Muted' : 'Live Transcript (Simulated)'}
            </h3>
            <div className="bg-slate-950/80 rounded-lg p-3 border border-white/5 min-h-[60px] flex items-center justify-center">
              {!session ? (
                 <p className="text-xs text-slate-600 italic">No active session</p>
              ) : !isMuted ? (
                <p className="text-xs text-slate-300 italic leading-relaxed text-left w-full">
                  "Listening for field comms..."
                </p>
              ) : (
                <p className="text-xs text-slate-600 italic mt-1">Microphone is muted.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
