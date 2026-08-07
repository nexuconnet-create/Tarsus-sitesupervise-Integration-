"use client";

import { useUnreadMessages } from "@/lib/hooks/useUnreadMessages";

interface UnreadMessagesBadgeProps {
  projectUuid: string | null | undefined;
  /** Sidebar collapsed → render a compact dot instead of the number. */
  collapsed?: boolean;
}

/**
 * Unread-chat-message count for the "Messages" nav item. Renders nothing when
 * there is nothing unread. Expects its parent (the nav link) to be
 * `position: relative` so the collapsed dot anchors correctly.
 */
export default function UnreadMessagesBadge({
  projectUuid,
  collapsed,
}: UnreadMessagesBadgeProps) {
  const { unreadCount } = useUnreadMessages(projectUuid);
  if (unreadCount <= 0) return null;

  if (collapsed) {
    return (
      <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border border-[#021422]" />
    );
  }

  return (
    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}
