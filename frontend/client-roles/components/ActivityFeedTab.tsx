"use client";

import { useMemo } from "react";
import {
  Clock,
  User,
  RefreshCw,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  ListChecks,
  ChevronDown,
} from "lucide-react";
import { useTaskActivity } from "@/lib/hooks/useTaskActivity";
import type { TaskActivityItem, TaskActivityEventType } from "@/lib/types/api";

interface ActivityFeedTabProps {
  projectUuid: string;
  taskId: string;
}

export function renderActivitySentence(
  event_type: TaskActivityEventType,
  details: Record<string, unknown>,
): string {
  const d = details as Record<string, string>;
  switch (event_type) {
    case "task_created":
      return "Task created (approved)";
    case "status_changed":
      return `Status changed from "${d.old ?? "?"}" to "${d.new ?? "?"}"`;
    case "queue_changed":
      return `Moved from "${d.old ?? "?"}" to "${d.new ?? "?"}"`;
    case "assigned":
      return `Assigned to ${d.crew_name ?? "crew"}`;
    case "reschedule_requested":
      return `Reschedule requested — ${d.reason ?? ""}`;
    case "reschedule_approved":
      return `Reschedule approved — ${d.old_start_date ?? "?"} → ${d.new_start_date ?? "?"}`;
    case "reschedule_rejected":
      return `Reschedule rejected — ${d.rejection_reason ?? ""}`;
    case "subtask_created":
      return `Subtask created: ${d.title ?? ""}`;
    case "subtask_actioned":
      return `Subtask ${d.action ?? "actioned"}: ${d.title ?? ""}`;
    case "checklist_item_checked":
      return `Checked: ${d.description ?? ""}`;
    case "checklist_item_unchecked":
      return `Unchecked: ${d.description ?? ""}`;
    case "progress_updated":
      return `Progress updated: ${d.old ?? "0"}% → ${d.new ?? "0"}%`;
    case "file_attached":
      return `File attached: ${d.file_name ?? ""}`;
    case "completed":
      return "Task completed";
    case "reopened":
      return `Task reopened — ${d.reason ?? ""}`;
    default:
      return event_type.replace(/_/g, " ");
  }
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  completed: <CheckCircle size={14} className="text-green-600" />,
  reopened: <RefreshCw size={14} className="text-red-500" />,
  task_created: <CheckCircle size={14} className="text-green-600" />,
  reschedule_approved: <RefreshCw size={14} className="text-amber-600" />,
  reschedule_rejected: <XCircle size={14} className="text-red-500" />,
  assigned: <User size={14} className="text-blue-600" />,
  progress_updated: <ListChecks size={14} className="text-blue-600" />,
  file_attached: <FileText size={14} className="text-purple-600" />,
};

function getEventIcon(event_type: string) {
  return EVENT_ICONS[event_type] ?? <Clock size={14} className="text-gray-400" />;
}

export function getEventBadgeStyle(event_type: string): string {
  if (event_type === "reopened") return "bg-red-100 text-red-700 border-red-200";
  if (["completed", "task_created"].includes(event_type)) return "bg-green-100 text-green-700 border-green-200";
  if (event_type.startsWith("reschedule")) return "bg-amber-100 text-amber-700 border-amber-200";
  if (event_type.startsWith("subtask")) return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

export default function ActivityFeedTab({ projectUuid, taskId }: ActivityFeedTabProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useTaskActivity(projectUuid, taskId);

  const activities = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((p) => p.results);
  }, [data]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#021422] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <AlertTriangle size={24} />
        <p className="mt-2 text-sm">Failed to load activity log</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Clock size={24} />
        <p className="mt-2 text-sm">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((item: TaskActivityItem) => (
        <div
          key={item.id}
          className="flex gap-3 py-3 border-b border-gray-100 last:border-b-0"
        >
          <div className="flex-shrink-0 mt-0.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              item.event_type === "reopened"
                ? "bg-red-50"
                : "bg-gray-100"
            }`}>
              {getEventIcon(item.event_type)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {item.triggered_by && (
                <span className="text-sm font-semibold text-[#021422]">
                  {item.triggered_by.first_name} {item.triggered_by.last_name}
                </span>
              )}
              {item.is_system && (
                <span className="text-xs text-gray-400 font-medium">System</span>
              )}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getEventBadgeStyle(item.event_type)}`}>
                {item.event_type_display}
              </span>
              <span className="text-[10px] text-gray-400 ml-auto whitespace-nowrap">
                {formatTime(item.occurred_at)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-0.5">
              {renderActivitySentence(item.event_type, item.details)}
            </p>
          </div>
        </div>
      ))}

      {hasNextPage && (
        <div className="pt-3 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="flex items-center gap-1 mx-auto px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <ChevronDown size={14} />
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
