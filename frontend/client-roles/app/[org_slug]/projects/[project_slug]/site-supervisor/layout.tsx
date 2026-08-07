"use client";

import { use, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import OfflineBanner from "@/components/OfflineBanner";
import NetworkErrorBanner from "@/components/NetworkErrorBanner";
import { useHasQueryErrors } from "@/lib/hooks/useHasQueryErrors";
import CrewSidebar from "./component/Sidebar";
import NotificationsDrawer from "./component/NotificationsDrawer";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";
import { Bell } from "lucide-react";
import type { Notification } from "@/lib/mockData/notifications";
import {
  notificationsService,
  toDrawerNotification,
} from "@/lib/services/notificationsService";

interface CrewLayoutProps {
  children: React.ReactNode;
  params: Promise<{ org_slug: string; project_slug: string }>;
}

// Rendered *inside* this layout's own QueryClientProvider -- see the
// identical comment in engineer/(office)/layout.tsx for why this can't just
// be a value computed in CrewLayout's own body.
function NetworkErrorWatcher({ queryClient }: { queryClient: QueryClient }) {
  const hasQueryErrors = useHasQueryErrors();
  return (
    <NetworkErrorBanner
      isError={hasQueryErrors}
      onRetry={() => queryClient.refetchQueries({ predicate: (q) => q.state.status === "error" })}
    />
  );
}

const CrewLayout = ({ children, params }: CrewLayoutProps) => {
  const { org_slug, project_slug } = use(params);
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
  useRoleGuard(org_slug, project_slug, "site-supervisor");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Load from the central notifications engine. Fetched via the service (not
  // react-query) since this layout is above its own QueryClientProvider.
  useEffect(() => {
    let active = true;
    notificationsService
      .list()
      .then((r) => {
        if (active) setNotifications(r.data.results.map(toDrawerNotification));
      })
      .catch(() => {
        /* bell stays empty on failure — non-blocking */
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
      /* a refresh will re-sync from the server */
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <CrewSidebar />
        <main className="flex-1 overflow-hidden h-full w-full bg-[#E3E3E3] relative">
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
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default CrewLayout;
