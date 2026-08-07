"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  FileText,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Truck,
  RefreshCw,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  RefreshCw as RetryIcon,
} from "lucide-react";

function NairaIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20V4" />
      <path d="M4 4L14 16V4" />
      <path d="M14 4V20" />
      <path d="M20 4V20" />
      <path d="M2 12H22" />
    </svg>
  );
}
import Link from "next/link";
import toast from "react-hot-toast";
import { MOCK_NOTIFICATIONS } from "@/lib/mockData/vendorNotifications";
import type { VendorNotification, NotificationType } from "@/lib/types/vendor";

const typeConfig: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  new_rfq: { icon: <FileText size={18} />, color: "bg-[#DBEAFE] text-[#2563EB]" },
  quote_accepted: { icon: <CheckCircle size={18} />, color: "bg-[#DCFCE7] text-[#16A34A]" },
  quote_rejected: { icon: <XCircle size={18} />, color: "bg-[#FEE2E2] text-[#DC2626]" },
  po_confirmed: { icon: <ShoppingCart size={18} />, color: "bg-[#DCFCE7] text-[#16A34A]" },
  delivery_update: { icon: <Truck size={18} />, color: "bg-[#DBEAFE] text-[#2563EB]" },
  payment_received: { icon: <NairaIcon size={18} />, color: "bg-[#DCFCE7] text-[#16A34A]" },
  change_order: { icon: <RefreshCw size={18} />, color: "bg-[#FEF3C7] text-[#D97706]" },
  kyc_update: { icon: <ShieldCheck size={18} />, color: "bg-[#DCFCE7] text-[#16A34A]" },
  general: { icon: <Bell size={18} />, color: "bg-gray-100 text-gray-600" },
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function groupByDate(items: VendorNotification[]): { label: string; items: VendorNotification[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const thisWeek = today - 6 * 86400000;

  const groups: Record<string, VendorNotification[]> = { Today: [], Yesterday: [], "This Week": [], Earlier: [] };

  items.forEach((n) => {
    const t = new Date(n.createdAt).getTime();
    if (t >= today) groups.Today.push(n);
    else if (t >= yesterday) groups.Yesterday.push(n);
    else if (t >= thisWeek) groups["This Week"].push(n);
    else groups.Earlier.push(n);
  });

  return Object.entries(groups)
    .filter(([_, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<VendorNotification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const grouped = groupByDate(notifications);

  if (loading) {
    return (
      <div className="pb-24">
        <div className="bg-white py-7 px-4">
          <div className="text-3xl font-bold text-[#0D1B2A]">Notifications</div>
        </div>
        <div className="p-8 max-w-3xl mx-auto space-y-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-24">
        <div className="bg-white py-7 px-4">
          <div className="text-3xl font-bold text-[#0D1B2A]">Notifications</div>
        </div>
        <div className="p-8 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <AlertTriangle size={48} className="mx-auto mb-3 text-red-300" />
            <p className="font-bold text-gray-500 mb-1">Failed to load notifications</p>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => { setError(null); setLoading(true); setTimeout(() => setLoading(false), 800); }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              <RetryIcon size={16} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-[#0D1B2A]">Notifications</div>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <CheckCheck size={16} />
            Mark All Read
          </button>
        )}
      </div>

      <div className="p-8 max-w-3xl mx-auto space-y-8">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Bell size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-500 mb-1">No notifications yet</p>
            <p className="text-sm text-gray-400">
              Notifications will appear here when there are updates on your orders, quotes, and account.
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.label}>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                {group.label}
              </h3>
              <div className="space-y-2">
                {group.items.map((notif, idx) => {
                  const cfg = typeConfig[notif.type] || typeConfig.general;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`bg-white rounded-xl border shadow-sm p-5 transition-colors ${
                        !notif.read
                          ? "border-[#2563EB]/30 bg-blue-50/30"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`text-sm ${!notif.read ? "font-bold text-[#0D1B2A]" : "font-medium text-gray-700"}`}>
                                {notif.title}
                              </p>
                              <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                              {formatTime(notif.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            {notif.actionUrl && (
                              <Link
                                href={notif.actionUrl}
                                onClick={() => handleMarkRead(notif.id)}
                                className="text-xs font-bold text-[#2563EB] hover:underline"
                              >
                                View Details
                              </Link>
                            )}
                            {!notif.read && (
                              <button
                                onClick={() => handleMarkRead(notif.id)}
                                className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0 mt-2" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
