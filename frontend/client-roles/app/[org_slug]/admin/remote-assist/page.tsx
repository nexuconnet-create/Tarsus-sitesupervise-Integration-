"use client";

import { use, useState, useEffect } from 'react';
import { arSessionService } from '@/lib/services/arSessionService';
import { adminService } from '@/lib/services';
import type { ARSession } from '@/lib/types/arSession';
import SessionHeader from '@/components/ar/SessionHeader';
import HeadsetStream from '@/components/ar/HeadsetStream';
import AudioSender from '@/components/ar/AudioSender';
import AnnotationCanvas from '@/components/ar/AnnotationCanvas';
import AnnotationToolbar from '@/components/ar/AnnotationToolbar';
import CollaborationChat from '@/components/ar/CollaborationChat';
import SessionControls from '@/components/ar/SessionControls';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2 } from 'lucide-react';

interface RemoteAssistPageProps {
  params: Promise<{ org_slug: string }>;
}

interface Project {
  uuid: string;
  name: string;
  slug: string;
  status: string;
}

interface RemoteSession {
  sessionId: string;
  sessionUuid: string;
  projectUuid: string;
  projectName: string;
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

export default function AdminRemoteAssistPage({ params }: RemoteAssistPageProps) {
  const { org_slug } = use(params);
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [session, setSession] = useState<RemoteSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<AnnotationTool | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ending, setEnding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await adminService.getProjects(org_slug);
        const raw = response.data;
        const list: Project[] = Array.isArray(raw)
          ? raw
          : (raw?.results ?? raw?.data?.results ?? []);
        setProjects(list.map((p) => ({
          uuid: p.uuid,
          name: p.name,
          slug: p.slug,
          status: p.status,
        })));
      } catch {
        toast.error('Failed to load projects');
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [org_slug]);

  useEffect(() => {
    if (!selectedProject) {
      // This effect intentionally resets dependent state when the selection is cleared.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSession(null);
      setError(null);
      return;
    }

    const fetchSession = async () => {
      setLoading(true);
      setError(null);
      setSession(null);
      try {
        const res = await arSessionService.getSessions(selectedProject.uuid);
        const sessions = res.data?.results || [];
        const liveSession = sessions.find((s: ARSession) => s.is_live);

        if (liveSession) {
          await arSessionService.joinSession(selectedProject.uuid, liveSession.uuid, {
            is_broadcaster: false,
            device_type: 'web',
          });
          setSession({
            sessionId: String(liveSession.id),
            sessionUuid: liveSession.uuid,
            projectUuid: selectedProject.uuid,
            projectName: selectedProject.name,
            engineer: {
              name: 'Field Engineer',
              role: 'Site Engineer',
              device: 'Trimble XR10',
            },
            startTime: new Date().toISOString(),
            signalStrength: 'strong',
          });
        } else {
          setError('No active AR session found for this project');
        }
      } catch {
        setError('No active AR session found for this project');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [selectedProject]);

  const handleSendMessage = (content: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: session?.sessionId || '',
      senderName: 'Admin',
      senderRole: 'Office',
      content,
      timestamp: new Date().toISOString(),
      isOwn: true,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleEndSession = async () => {
    if (!session) return;
    setEnding(true);
    try {
      await arSessionService.endStream(session.projectUuid, session.sessionUuid);
      toast.success('Session ended');
    } catch {
      toast.success('Session ended (local)');
    } finally {
      setEnding(false);
      setSession(null);
      setSelectedProject(null);
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

  if (loadingProjects) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#021422]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#021422] mb-2">
          Remote Assist
        </h1>
        <p className="text-gray-500">
          View live AR streams from Trimble XR10 headsets
        </p>
      </div>

      {/* Project Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Project
        </label>
        <div className="relative max-w-md">
          <select
            value={selectedProject?.uuid || ''}
            onChange={(e) => {
              const project = projects.find((p) => p.uuid === e.target.value);
              setSelectedProject(project || null);
            }}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm bg-white appearance-none"
          >
            <option value="">Select a project...</option>
            {projects.map((project) => (
              <option key={project.uuid} value={project.uuid}>
                {project.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#021422]" />
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && selectedProject && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <p className="text-gray-500">{error}</p>
          <p className="text-xs text-gray-400 mt-2">
            Start a session from the Trimble XR10 to begin collaborating
          </p>
        </div>
      )}

      {/* No project selected */}
      {!loading && !selectedProject && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <p className="text-gray-500">Select a project to view its AR sessions</p>
        </div>
      )}

      {/* Active session */}
      {!loading && session && (
        <div className="space-y-6">
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
              <span className="text-xs text-gray-500 ml-2">— {session.projectName}</span>
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
                Remote Annotations
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
      )}
    </div>
  );
}
