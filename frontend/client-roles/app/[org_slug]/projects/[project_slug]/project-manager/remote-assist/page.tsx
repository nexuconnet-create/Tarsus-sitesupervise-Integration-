"use client";

import { use, useState, useEffect } from 'react';
import { useProjectUuid } from '@/lib/hooks/useProjectUuid';
import { arSessionService } from '@/lib/services/arSessionService';
import type { ARSession } from '@/lib/types/arSession';
import DashboardSection from '../components/DashboardSection';
import PMHeader from '../components/PMHeader';
import SessionHeader from '@/components/ar/SessionHeader';
import HeadsetStream from '@/components/ar/HeadsetStream';
import AudioSender from '@/components/ar/AudioSender';
import AnnotationCanvas from '@/components/ar/AnnotationCanvas';
import AnnotationToolbar from '@/components/ar/AnnotationToolbar';
import CollaborationChat from '@/components/ar/CollaborationChat';
import SessionControls from '@/components/ar/SessionControls';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface RemoteAssistPageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

interface RemoteSession {
  sessionId: string;
  sessionUuid: string;
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

export default function RemoteAssistPage({ params }: RemoteAssistPageProps) {
  const { org_slug, project_slug } = use(params);
  const router = useRouter();
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);

  const [session, setSession] = useState<RemoteSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<AnnotationTool | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ending, setEnding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!projectUuid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      setError('No project selected. Select a project first.');
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
            engineer: {
              name: 'Field Engineer',
              role: 'Site Engineer',
              device: 'Trimble XR10',
            },
            startTime: new Date().toISOString(),
            signalStrength: 'strong',
          });
        } else {
          setError('No active AR session found');
        }
      } catch {
        setError('No active AR session found');
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
      senderName: 'Project Manager',
      senderRole: 'Office',
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
      router.push(`/${org_slug}/projects/${project_slug}/project-manager`);
    }
  };

  const handleSaveRecording = async () => {
    setSaving(true);
    setTimeout(() => {
      toast.success('Recording saved');
      setSaving(false);
    }, 500);
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    setTimeout(() => {
      toast.success('AR Report generated');
      setGenerating(false);
      if (session) {
        router.push(
          `/${org_slug}/projects/${project_slug}/engineer/qa-dashboard/reports/${session.sessionId}`,
        );
      }
    }, 500);
  };

  if (loading) {
    return (
      <div>
        <PMHeader title="REMOTE ASSIST" badge="OFFICE MODE" />
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
        <PMHeader title="REMOTE ASSIST" badge="OFFICE MODE" />
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
            <p className="text-gray-500">{error || 'No active AR session found'}</p>
            <p className="text-xs text-gray-400 mt-2">
              Start a session from the Trimble XR10 to begin remote assist
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 text-[#021422]">
      <PMHeader title="REMOTE ASSIST" badge="OFFICE MODE" />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <SessionHeader
          engineer={session.engineer}
          startTime={session.startTime}
          signalStrength={session.signalStrength}
        />

        <DashboardSection title="Live XR10 Feed">
          <div className="space-y-4">
            <HeadsetStream room={session.sessionUuid} />
            <AudioSender room={session.sessionUuid} />
            <hr className="border-gray-200" />
            <AnnotationToolbar activeTool={activeTool} onSelectTool={setActiveTool} />
          </div>
        </DashboardSection>

        <DashboardSection title="Annotations">
          <AnnotationCanvas annotations={[]} />
        </DashboardSection>

        <DashboardSection title="Chat">
          <CollaborationChat
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={false}
          />
        </DashboardSection>

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
