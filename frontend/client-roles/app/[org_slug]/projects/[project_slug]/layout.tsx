"use client";

import { use, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRouter } from "next/navigation";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { useAuthStore } from "@/lib/stores/authStore";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ org_slug: string; project_slug: string }>;
}

// Inner component that syncs UUID — rendered inside QueryClientProvider so useQuery works
function ProjectUuidSync({ org_slug, project_slug }: { org_slug: string; project_slug: string }) {
  const setSelectedProjectUuid = useAuthStore((s) => s.setSelectedProjectUuid);
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);

  useEffect(() => {
    if (projectUuid) setSelectedProjectUuid(projectUuid);
  }, [projectUuid, setSelectedProjectUuid]);

  return null;
}

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { org_slug, project_slug } = use(params);
  const router = useRouter();
  const { hasAccessToProject, isAdmin, loading } = useMemberships();
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2,
        retryDelay: 1000,
        refetchOnReconnect: "always",
      },
    },
  }));

  // Org admins have access to all projects in their org even if not listed
  // as a project member (they manage from the admin panel).
  const canAccess = isAdmin(org_slug) || hasAccessToProject(org_slug, project_slug);

  useEffect(() => {
    if (!loading && !canAccess) {
      router.push(`/${org_slug}/projects`);
    }
  }, [org_slug, canAccess, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-[#021422] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!canAccess) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ProjectUuidSync org_slug={org_slug} project_slug={project_slug} />
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
