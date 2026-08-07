"use client";

import { useState } from "react";
import { Bell, X, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

interface Notification {
  id: number;
  type: "warning" | "danger" | "info" | "success";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "danger",
    title: "Safety Alert",
    message: "PPE violation reported at Zone B — immediate action required.",
    time: "5 min ago",
    read: false,
  },
  {
    id: 2,
    type: "warning",
    title: "Schedule Delay",
    message: "Foundation work is 2 days behind schedule.",
    time: "30 min ago",
    read: false,
  },
  {
    id: 3,
    type: "warning",
    title: "Low Inventory",
    message: "Cement stock below minimum threshold (12 bags remaining).",
    time: "1 hr ago",
    read: false,
  },
  {
    id: 4,
    type: "info",
    title: "Crew Update",
    message: "Crew B has completed today's assigned tasks.",
    time: "2 hrs ago",
    read: true,
  },
  {
    id: 5,
    type: "success",
    title: "Inspection Passed",
    message: "Structural inspection for Level 3 passed successfully.",
    time: "3 hrs ago",
    read: true,
  },
];

const typeConfig = {
  danger: {
    icon: AlertTriangle,
    iconClass: "text-red-500",
    dotClass: "bg-red-500",
    bgClass: "bg-red-50",
    borderClass: "border-l-red-500",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-yellow-500",
    dotClass: "bg-yellow-500",
    bgClass: "bg-yellow-50",
    borderClass: "border-l-yellow-500",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-500",
    dotClass: "bg-blue-500",
    bgClass: "bg-blue-50",
    borderClass: "border-l-blue-500",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-green-500",
    dotClass: "bg-green-500",
    bgClass: "bg-green-50",
    borderClass: "border-l-green-500",
  },
};

export default function NotificationBell() {
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismiss = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const markRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  return (
    <>
      {/* Bell button */}
      <button
        onClick={() => setOpen(true)}
        className="relative w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-[#021422]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Side drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="bg-[#021422] px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-white/70" />
            <span className="text-sm font-semibold text-white">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-white/60 hover:text-white transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <Bell size={32} className="opacity-30" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((n) => {
              const cfg = typeConfig[n.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex gap-3 px-4 py-4 border-l-4 ${cfg.borderClass} cursor-pointer hover:bg-gray-50 transition-colors ${
                    !n.read ? "bg-blue-50/30" : "bg-white"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-full ${cfg.bgClass} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={15} className={cfg.iconClass} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-[#021422]">
                        {n.title}
                        {!n.read && (
                          <span className="ml-1.5 inline-block w-1.5 h-1.5 bg-blue-500 rounded-full align-middle" />
                        )}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismiss(n.id);
                        }}
                        className="text-gray-300 hover:text-gray-500 flex-shrink-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                      <span className="text-[10px] text-gray-400">{n.time}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer footer */}
        <div className="border-t border-gray-100 px-5 py-3 flex-shrink-0">
          <button className="w-full text-xs font-semibold text-[#021422] hover:underline text-center">
            View all notifications
          </button>
        </div>
      </div>
    </>
  );
}
