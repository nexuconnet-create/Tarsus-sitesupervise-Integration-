"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import NotificationsDrawer from "./components/NotificationsDrawer";
import { usePathname } from "next/navigation";
import useInactivityTimeout from "@/hooks/useInactivityTimeout";
import { Bell } from "lucide-react";
import { getMockNotifications } from "@/lib/mockData";

const INACTIVITY_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT_MS) || 15 * 60 * 1000;

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  useInactivityTimeout(INACTIVITY_TIMEOUT_MS);

  const [notifications, setNotifications] = useState(getMockNotifications);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
  };

  const hideSidebarRoutes = [
    "/main-dashboard/engineer/messages",
    "/main-dashboard/engineer/conference",
  ];

  const hideSidebar = hideSidebarRoutes.includes(pathname);

return (
  <div className="flex h-screen">
    {!hideSidebar && <Sidebar />}
    <main className="flex-1 bg-[#E3E3E3] overflow-y-scroll relative">
      {/* Notification Bell Button */}
      <button
          onClick={() => setIsNotificationsOpen(true)}
          className="fixed top-4 right-4 z-50 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
        >
          <Bell size={18} className="text-[#021422]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {children}

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
);
}
