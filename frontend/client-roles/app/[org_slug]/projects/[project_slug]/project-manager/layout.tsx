"use client";

import { use, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Sidebar from "./components/Sidebar";
import OfflineBanner from "@/components/OfflineBanner";
import NetworkErrorBanner from "@/components/NetworkErrorBanner";
import { useHasQueryErrors } from "@/lib/hooks/useHasQueryErrors";
import { usePathname } from "next/navigation";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";

interface ManagerLayoutProps {
  children: React.ReactNode;
  params: Promise<{ org_slug: string; project_slug: string }>;
}

// Rendered *inside* this layout's own QueryClientProvider -- see the
// identical comment in engineer/(office)/layout.tsx for why this can't just
// be a value computed in ManagerLayout's own body.
function NetworkErrorWatcher({ queryClient }: { queryClient: QueryClient }) {
  const hasQueryErrors = useHasQueryErrors();
  return (
    <NetworkErrorBanner
      isError={hasQueryErrors}
      onRetry={() => queryClient.refetchQueries({ predicate: (q) => q.state.status === "error" })}
    />
  );
}

export default function ManagerLayout({
  children,
  params,
}: ManagerLayoutProps) {
  const { org_slug, project_slug } = use(params);
  const pathname = usePathname();
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
  useRoleGuard(org_slug, project_slug, "project-manager");

  const base = `/${org_slug}/projects/${project_slug}/project-manager`;

  // Routes where sidebar should NOT appear
  const hideSidebarRoutes = [`${base}/messages`, `${base}/conference`];

  const hideSidebar = hideSidebarRoutes.includes(pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen">
        {!hideSidebar && (
          <Sidebar orgSlug={org_slug} projectSlug={project_slug} />
        )}
        <main className="flex-1 bg-[#E3E3E3] overflow-y-scroll">
          <OfflineBanner />
          <NetworkErrorWatcher queryClient={queryClient} />
          {children}
        </main>
      </div>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
