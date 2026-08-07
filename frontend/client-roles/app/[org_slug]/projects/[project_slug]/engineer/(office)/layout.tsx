"use client";

import { use, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"; // re-enable with Dexie for offline
// import { queryPersister } from "@/lib/queryPersister";                             // re-enable with Dexie for offline
import Sidebar from "./components/Sidebar";
import NotificationsDrawer from "./components/NotificationsDrawer";
import OfflineBanner from "@/components/OfflineBanner";
import NetworkErrorBanner from "@/components/NetworkErrorBanner";
import { useHasQueryErrors } from "@/lib/hooks/useHasQueryErrors";
import { usePathname } from "next/navigation";
import useInactivityTimeout from "@/hooks/useInactivityTimeout";
import { Bell } from "lucide-react";
import type { Notification } from "@/lib/mockData/notifications";
import {
  notificationsService,
  toDrawerNotification,
} from "@/lib/services/notificationsService";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";

// const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // re-enable with Dexie for offline

const INACTIVITY_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT_MS) || 15 * 60 * 1000;

// Rendered *inside* this layout's own QueryClientProvider, so useHasQueryErrors
// (via useQueryClient) reads this layout's own cache instead of whichever
// QueryClientProvider happens to be further up the tree (the parent project
// layout's, which holds unrelated queries like useProjectUuid). Calling the
// hook directly in StaffLayout's body would resolve to that parent client,
// since StaffLayout itself renders *as a child of* the parent's provider --
// its own provider only wraps whatever it returns below itself.
function NetworkErrorWatcher({ queryClient }: { queryClient: QueryClient }) {
  const hasQueryErrors = useHasQueryErrors();
  return (
    <NetworkErrorBanner
      isError={hasQueryErrors}
      onRetry={() => queryClient.refetchQueries({ predicate: (q) => q.state.status === "error" })}
    />
  );
}

interface StaffLayoutProps {
  children: React.ReactNode;
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function StaffLayout({ children, params }: StaffLayoutProps) {
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
  useInactivityTimeout(INACTIVITY_TIMEOUT_MS);
  useRoleGuard(org_slug, project_slug, "engineer");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Load from the central notifications engine (prayer reminders, broadcasts,
  // …). Runs in the layout itself, which sits above its own QueryClientProvider,
  // so we fetch through the service directly rather than via react-query.
  useEffect(() => {
    let active = true;
    notificationsService
      .list()
      .then((r) => {
        if (active) setNotifications(r.data.results.map(toDrawerNotification));
      })
      .catch(() => {
        /* bell just stays empty on failure — non-blocking */
      });
    return () => {
      active = false;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Per-item read/dismiss are optimistic-only: the central engine exposes bulk
  // mark-all-read but no per-notification endpoints yet.
  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationsService.markAllRead().catch(() => {
      /* revert nothing — a refresh will re-sync from the server */
    });
  };

  const base = `/${org_slug}/projects/${project_slug}/engineer`;

  const hideSidebarRoutes = [
    `${base}/messages`,
    `${base}/conference`,
  ];

  const hideSidebar = hideSidebarRoutes.includes(pathname);

  return (
  // Swap to PersistQueryClientProvider + queryPersister when enabling offline mode
  <QueryClientProvider client={queryClient}>
    <div className="flex h-screen">
      {!hideSidebar && <Sidebar orgSlug={org_slug} projectSlug={project_slug} />}
      <main className="flex-1 bg-[#E3E3E3] overflow-hidden relative">
        <OfflineBanner />
        <NetworkErrorWatcher queryClient={queryClient} />

        {/* Notification Bell Button */}
        <button
            onClick={() => setIsNotificationsOpen(true)}
            className="fixed top-[76px] right-4 z-50 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <Bell size={18} className="text-[#021422]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <div className="h-full overflow-y-auto">{children}</div>

        <NotificationsDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onDismiss={handleDismiss}
          onMarkAllRead={handleMarkAllRead}
        />
      </main>
    </div>
    {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
);
}
