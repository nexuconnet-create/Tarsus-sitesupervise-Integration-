"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useAuthStore } from "@/lib/stores/authStore";
import { adminService, type ProjectResponse } from "@/lib/services/admin";
import { ChevronRight, Loader2, FolderOpen } from "lucide-react";

interface OrgProjectsPageProps {
  params: Promise<{ org_slug: string }>;
}

export default function OrgProjectsPage({ params }: OrgProjectsPageProps) {
  const { org_slug } = use(params);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setSelectedProjectUuid = useAuthStore((s) => s.setSelectedProjectUuid);
  const { getProjectsByOrg, getOrg, isAdmin, loading } = useMemberships();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [apiProjects, setApiProjects] = useState<ProjectResponse[]>([]);

  const projects = getProjectsByOrg(org_slug);
  const org = getOrg(org_slug);

  // Auth guard and empty-state redirect — runs after hydration completes
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    if (projects.length === 0) {
      // Admins have no project memberships — send them to their admin panel
      if (isAdmin(org_slug)) {
        router.replace(`/${org_slug}/admin`);
      } else {
        router.replace("/select-org");
      }
    }
  }, [loading, user, projects.length, org_slug, isAdmin, router]);

  // Fetch projects from API to get uuid
  useEffect(() => {
    if (!user) return;
    adminService.getProjects(org_slug)
      .then(res => {
        const raw = res.data;
        const list: ProjectResponse[] = Array.isArray(raw)
          ? raw
          : (raw?.results ?? raw?.data?.results ?? raw?.data ?? []);
        setApiProjects(list);
      })
      .catch(() => {});
  }, [org_slug, user]);

  const handleSelectProject = (projectSlug: string) => {
    setSelectedProject(projectSlug);
    const apiProject = apiProjects.find(p => p.slug === projectSlug);
    if (apiProject?.id) {
      setSelectedProjectUuid(apiProject.id);
    }
    // Skip location page for faster testing
    router.push(`/${org_slug}/projects/${projectSlug}/onboarding`);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#021422] mx-auto mb-4" />
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    // Blank while the useEffect redirect fires
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen size={28} className="text-[#021422]" />
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          </div>
          <p className="text-gray-500">
            Organization: <span className="font-semibold">{org?.org || org_slug}</span>
          </p>
        </div>

        <div className="grid gap-4">
          {projects.map((project) => (
            <button
              key={project.slug}
              onClick={() => handleSelectProject(project.slug)}
              disabled={selectedProject === project.slug}
              className="w-full p-6 bg-white rounded-xl border border-gray-200 hover:border-[#021422] hover:bg-gray-50 transition flex items-center justify-between group disabled:opacity-50"
            >
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-lg">{project.name}</p>
                <p className="text-sm text-gray-500">{project.role}</p>
              </div>
              {selectedProject === project.slug ? (
                <Loader2 size={20} className="animate-spin text-[#021422]" />
              ) : (
                <ChevronRight
                  size={24}
                  className="text-gray-400 group-hover:text-[#021422] transition"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
