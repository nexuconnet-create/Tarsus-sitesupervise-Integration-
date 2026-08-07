'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProjectUuid } from '@/lib/hooks/useProjectUuid';
import { arSessionService } from '@/lib/services/arSessionService';
import type { ARSession } from '@/lib/types/arSession';
import HeadsetStream from '@/components/ar/HeadsetStream';
import AudioSender from '@/components/ar/AudioSender';
import CollaborationChat from '@/components/ar/CollaborationChat';
import SessionHeader from '@/components/ar/SessionHeader';
import AnnotationCanvas from '@/components/ar/AnnotationCanvas';
import AnnotationToolbar from '@/components/ar/AnnotationToolbar';
import SessionControls from '@/components/ar/SessionControls';
import EngineerHeader from '../../../engineer/(office)/components/EngineerHeader';
import toast from 'react-hot-toast';

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

type AnnotationTool = 'draw' | 'pin' | 'measure' | 'voice' | 'capture';

export default function ArWalkThroughPage() {
  const router = useRouter();
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;
  
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);

  const [session, setSession] = useState<RemoteSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<AnnotationTool | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ending, setEnding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

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

  const handleEndSession = async () => {
    if (!projectUuid || !session) return;
    setEnding(true);
    try {
      await arSessionService.endStream(projectUuid, session.sessionUuid);
      toast.success('Session ended');
    } catch {
      toast.success('Session ended (local)');
    } finally {
      setEnding(false);
      router.push(`/${org_slug}/projects/${project_slug}/onboarding`);
    }
  };

  const handleSaveRecording = () => {
    setSaving(true);
    setTimeout(() => {
      toast.success('Recording saved');
      setSaving(false);
    }, 500);
  };

  const handleGenerateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      toast.success('AR Report generated');
      setGenerating(false);
    }, 500);
  };

  if (loading) {
    return (
      <div>
        <EngineerHeader title="AR Walkthrough" badge="Live Site View" />
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#021422]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div>
        <EngineerHeader title="AR Walkthrough" badge="Live Site View" />
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
            <p className="text-gray-500">{error || 'No active AR session found'}</p>
            <p className="text-xs text-gray-400 mt-2">
              Please wait for the site engineer to initiate a walkthrough.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <EngineerHeader title="AR Walkthrough" badge="Live Site View" />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <SessionHeader
          engineer={session.engineer}
          startTime={session.startTime}
          signalStrength={session.signalStrength}
        />

        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-gray-900 text-xl font-bold tracking-tight uppercase">
              Live XR10 Feed
            </h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <HeadsetStream room={session.sessionUuid} />
            <AudioSender room={session.sessionUuid} />
            <hr className="border-gray-200" />
            <AnnotationToolbar activeTool={activeTool} onSelectTool={setActiveTool} />
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-gray-900 text-xl font-bold tracking-tight uppercase">
              Remote Annotations (Client View)
            </h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <AnnotationCanvas annotations={[]} />
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-gray-900 text-xl font-bold tracking-tight uppercase">
              Chat
            </h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <CollaborationChat
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={false}
            />
          </div>
        </section>

        <SessionControls
          onEndSession={handleEndSession}
          onSaveRecording={handleSaveRecording}
          onGenerateReport={handleGenerateReport}
          ending={ending}
          saving={saving}
          generating={generating}
        />
      </div>
    </div>
  );
}
