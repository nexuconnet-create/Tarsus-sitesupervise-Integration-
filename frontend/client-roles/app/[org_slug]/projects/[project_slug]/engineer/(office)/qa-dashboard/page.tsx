"use client";

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { useProjectUuid } from '@/lib/hooks/useProjectUuid';
import { useQuery } from "@tanstack/react-query";
import { engineerKeys } from "@/lib/queryKeys";
import { arSessionService, captureService } from '@/lib/services';
import { mockActiveSession, mockSessions, mockQATasks } from '@/lib/mockData/arSessions';
import type { QASession } from '@/lib/types/arSession';
import type { QATask } from '@/lib/mockData/arSessions';
import type { ARCapture } from '@/lib/types/capture';
import EngineerHeader from '../components/EngineerHeader';
import QATaskTable from './components/QATaskTable';
import ActiveARSessionPanel from './components/ActiveARSessionPanel';
import InspectionChecklistPanel from './components/InspectionChecklistPanel';
import CaptureGallery from '@/components/ar/CaptureGallery';
import ProjectDeviceList from '@/components/ar/ProjectDeviceList';
import { FolderOpen } from 'lucide-react';

interface QADashboardPageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function QADashboardPage({ params }: QADashboardPageProps) {
  const { org_slug, project_slug } = use(params);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);

  const [activeSession, setActiveSession] = useState<QASession | null>(null);
  const [tasks, setTasks] = useState<QATask[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Fetch all captures for the project (across all sessions)
  const { data: captures = [], isLoading: capturesLoading } = useQuery({
    queryKey: engineerKeys.captures(projectUuid ?? ""),
    queryFn: () =>
      captureService.listProjectCaptures(projectUuid!).then((res) => {
        const responseData = res.data as ARCapture[] | { results?: ARCapture[] };
        const list = Array.isArray(responseData) ? responseData : responseData.results || [];
        return list as ARCapture[];
      }),
    enabled: !!projectUuid,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (projectUuid) {
          const res = await arSessionService.getSessions(projectUuid);
          const sessions = res.data?.results || [];
          const active = sessions.find((s) => s.is_live);
          if (active) {
            setActiveSession(mockActiveSession);
            setSessionsLoading(false);
            return;
          }
        }
      } catch {
        // fallback to mock
      }
      setActiveSession(mockActiveSession);
      setSessionsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const storedProject = localStorage.getItem('selected_project');
        if (storedProject) {
          const project = JSON.parse(storedProject);
          const tasksRes = await import('@/lib/services/engineer').then((m) =>
            m.staffService.getTasks(),
          );
          if (tasksRes.data) {
            const data = tasksRes.data as { results?: QATask[] };
            const list = Array.isArray(data) ? data : data.results || [];
            if (list.length > 0) {
              setTasks(list as QATask[]);
              setTasksLoading(false);
              return;
            }
          }
        }
      } catch {
        // fallback to mock
      }
      setTasks(mockQATasks);
      setTasksLoading(false);
    };
    fetchTasks();
  }, []);

  const handleInspect = (taskId: string) => {
    const sessions = mockSessions;
    const session = sessions.find(
      (s) =>
        s.issues.some((i) => i.taskId === taskId) ||
        (taskId === 'task-wp307' && s.wpReference === 'WP-307') ||
        (taskId === 'task-wp205' && s.wpReference === 'WP-205'),
    );
    if (session) {
      router.push(
        `/${org_slug}/projects/${project_slug}/engineer/qa-dashboard/reports/${session.id}`,
      );
    }
  };

  const projectName = user?.name || '';

  return (
    <div>
      <EngineerHeader title="QA DASHBOARD" project={projectName} badge="Engineer" />
      <div className="p-4 md:p-8 pb-20 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide mb-4">
            Today&apos;s QA Task List
          </h2>
          <QATaskTable
            tasks={tasks}
            loading={tasksLoading}
            onInspect={handleInspect}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide mb-4">
            Devices on Site
          </h2>
          <ProjectDeviceList projectUuid={projectUuid} />
        </section>

        <section>
          <Link
            href={`/${org_slug}/projects/${project_slug}/engineer/bim-files`}
            className="inline-flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow transition-all group"
          >
            <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
              <FolderOpen size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">BIM File Manager</p>
              <p className="text-xs text-gray-500">Upload and manage BIM models on Trimble Connect</p>
            </div>
          </Link>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide mb-4">
            Active AR Session
          </h2>
          <ActiveARSessionPanel session={activeSession} loading={sessionsLoading} />
        </section>

        {activeSession && (
          <section>
            <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide mb-4">
              Inspection Checklist (Voice-Activated)
            </h2>
            <InspectionChecklistPanel
              items={activeSession.checklist}
              active={activeSession.voiceActive}
            />
          </section>
        )}

        <section>
          <CaptureGallery
            captures={captures}
            projectUuid={projectUuid}
            loading={capturesLoading}
          />
        </section>
      </div>
    </div>
  );
}
