"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import {
  useTaskFileList,
  useTaskFileDetail,
  useTaskFileDownload,
} from "@/lib/hooks/useTaskFiles";
import type { TaskFileListItem, TaskFileMilestoneType } from "@/lib/types/api";
import type { TaskSnapshot } from "@/lib/types/taskSnapshot";
import TaskSnapshotView from "@/components/snapshot/TaskSnapshotView";

interface TaskFilesTabProps {
  projectUuid: string;
  taskId: string;
}

/**
 * Orders milestone snapshots chronologically by `generated_at`.
 *
 * The API orders by `milestone_type`, which sorts alphabetically —
 * "completed" < "created" < "rescheduled" — so a completed task lists its
 * completions above its own creation. This restores true timeline order.
 * Returns a new array; the input (react-query cache data) is never mutated.
 * Once the backend orders by `generated_at`, this becomes a no-op and can be
 * removed. See docs/TASK_ACTIVITY_BACKEND_REVIEW.md, issue 1.
 */
export function sortFilesChronologically(
  files: TaskFileListItem[],
): TaskFileListItem[] {
  return [...files].sort(
    (a, b) => Date.parse(a.generated_at) - Date.parse(b.generated_at),
  );
}

const MILESTONE_CONFIG: Record<TaskFileMilestoneType, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
  created: {
    icon: <CheckCircle size={14} />,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  rescheduled: {
    icon: <RefreshCw size={14} />,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  completed: {
    icon: <CheckCircle size={14} />,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
};

function SnapshotDetail({
  projectUuid,
  taskId,
  file,
}: {
  projectUuid: string;
  taskId: string;
  file: TaskFileListItem;
}) {
  const fileId = file.id;
  const { data, isLoading, isError } = useTaskFileDetail(projectUuid, taskId, fileId);
  const download = useTaskFileDownload(projectUuid, taskId);

  const handleDownload = () =>
    download.mutate({
      fileId,
      filename: `${file.task_wp_number}-${file.label}.pdf`
        .replace(/\s+/g, "-")
        .toLowerCase(),
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-4 h-4 border-2 border-[#021422] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-xs text-gray-400 py-2">Failed to load snapshot</p>;
  }

  return (
    <div className="space-y-3 mt-3">
      {/* Not gated on has_pdf: the backend renders the PDF on first request and
          only then reports has_pdf, so gating would hide the button forever. */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={download.isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-60"
      >
        <Download size={12} />
        {download.isPending ? "Preparing…" : "Download PDF"}
      </button>
      <TaskSnapshotView
        file={file}
        snapshot={data.snapshot as unknown as TaskSnapshot}
      />
    </div>
  );
}

export default function TaskFilesTab({ projectUuid, taskId }: TaskFilesTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading, isError } = useTaskFileList(projectUuid, taskId);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
        <p className="mt-2 text-sm">Failed to load task files</p>
      </div>
    );
  }

  const files = sortFilesChronologically(data?.results ?? []);

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <FileText size={24} />
        <p className="mt-2 text-sm">No milestone snapshots yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file: TaskFileListItem) => {
        const cfg = MILESTONE_CONFIG[file.milestone_type] ?? MILESTONE_CONFIG.created;
        const isExpanded = expandedId === file.id;

        return (
          <div
            key={file.id}
            className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}
          >
            <button
              onClick={() => toggleExpand(file.id)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.bg} ${cfg.text}`}>
                  {cfg.icon}
                </div>
                <div>
                  <p className={`text-sm font-bold ${cfg.text}`}>{file.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {new Date(file.generated_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {file.generated_by && (
                  <span className="text-[10px] text-gray-500 hidden sm:inline">
                    {file.generated_by.first_name} {file.generated_by.last_name}
                  </span>
                )}
                {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-inherit pt-3">
                <SnapshotDetail projectUuid={projectUuid} taskId={taskId} file={file} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
