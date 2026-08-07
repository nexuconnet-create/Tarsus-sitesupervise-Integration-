"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { getProjectDashboardRoute } from "@/lib/urlUtils";

interface ProjectPageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { org_slug, project_slug } = use(params);
  const router = useRouter();
  const { getProject, isAdmin, loading } = useMemberships();

  useEffect(() => {
    if (!loading) {
      const project = getProject(org_slug, project_slug);
      if (project) {
        // Redirect regular members to their role-based dashboard
        const route = getProjectDashboardRoute(project.role);
        // Force routing to onboarding for client testing
        if (route === "client") {
          router.replace(`/${org_slug}/projects/${project_slug}/onboarding`);
        } else {
          router.replace(`/${org_slug}/projects/${project_slug}/${route ?? "location"}`);
        }
      } else if (isAdmin(org_slug)) {
        // Admins have no project membership — send them to the overview
        router.replace(`/${org_slug}/projects/${project_slug}/location`);
      }
      // If neither, the layout will handle the redirect
    }
  }, [loading, org_slug, project_slug, getProject, isAdmin, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin w-8 h-8 border-4 border-[#021422] border-t-transparent rounded-full" />
    </div>
  );
}
