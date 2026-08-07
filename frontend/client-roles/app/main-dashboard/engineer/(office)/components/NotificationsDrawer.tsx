"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Bell, ClipboardList, ShieldAlert, Scan, CloudSun, Users, Wrench, Truck, Moon, Megaphone } from "lucide-react";
import type { Notification, NotificationSource } from "@/lib/mockData/notifications";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
}

const SOURCE_ICONS: Record<NotificationSource, React.ElementType> = {
  task: ClipboardList,
  hse: ShieldAlert,
  qaqc: Scan,
  weather: CloudSun,
  attendance: Users,
  equipment: Wrench,
  material: Truck,
  prayer: Moon,
  broadcast: Megaphone,
  general: Bell,
};

const SOURCE_LABELS: Record<NotificationSource, string> = {
  task: "Task",
  hse: "HSE",
  qaqc: "QA/QC",
  weather: "Weather",
  attendance: "Attendance",
  equipment: "Equipment",
  material: "Material",
  prayer: "Prayer",
  broadcast: "Broadcast",
  general: "Notification",
};

export default function NotificationsDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onDismiss,
  onMarkAllRead,
}: NotificationsDrawerProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  const handleView = (notification: Notification) => {
    onMarkRead(notification.id);
    onClose();
    router.push(notification.href);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white h-full w-full max-w-md overflow-hidden flex flex-col shadow-2xl"
        style={{ animation: "slideInRight 0.25s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-gray-500" />
            <h2 className="text-base font-bold text-[#021422]">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-[#021422] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded hover:bg-gray-100"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
              <Bell size={40} className="mb-3 opacity-25" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-gray-400 mt-1">You&apos;re all caught up</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const Icon = SOURCE_ICONS[notification.source];
                const isUnread = !notification.read;

                return (
                  <div
                    key={notification.id}
                    className={`group flex items-start gap-3 px-4 py-4 cursor-pointer border-b border-gray-100 transition-colors ${isUnread ? "bg-blue-50/70 hover:bg-blue-100/60" : "bg-white hover:bg-gray-50"}`}
                    onClick={() => handleView(notification)}
                  >
                    {/* Left: icon column with optional unread dot */}
                    <div className="relative shrink-0 mt-0.5">
                      {isUnread && (
                        <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#007AFF]" />
                      )}
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                        <Icon size={16} className="text-gray-600" />
                      </div>
                    </div>

                    {/* Middle: content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#021422] leading-snug pr-6">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                        {notification.meta}
                      </p>
                      <div className="mt-2">
                        <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-[#021422] text-white">
                          {SOURCE_LABELS[notification.source]}
                        </span>
                      </div>
                    </div>

                    {/* Right: time + dismiss */}
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
                        {notification.time}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(notification.id);
                        }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
