"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, AlertTriangle } from "lucide-react";
import { useTaskFileList, useTaskFileDownload } from "@/lib/hooks/useTaskFiles";
import { sortFilesChronologically } from "@/components/TaskFilesTab";
import MilestoneFileCard from "./MilestoneFileCard";
import type { TaskListItem, TaskFileListItem, TaskFileMilestoneType } from "@/lib/types/api";

export interface TaskFileFilters {
  milestoneType: "all" | TaskFileMilestoneType;
  dateFrom: string;
  dateTo: string;
}

interface TaskFilesGroupProps {
  projectUuid: string;
  task: TaskListItem;
  filters: TaskFileFilters;
  defaultOpen?: boolean;
  onView: (task: TaskListItem, file: TaskFileListItem) => void;
}

/** A collapsible WP/task row. Files are fetched only once the row is expanded. */
export default function TaskFilesGroup({
  projectUuid,
  task,
  filters,
  defaultOpen,
  onView,
}: TaskFilesGroupProps) {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-bold text-[#021422] bg-gray-100 px-2 py-0.5 rounded font-mono shrink-0">
            {task.wp_number}
          </span>
          <span className="text-sm font-semibold text-[#021422] truncate">
            {task.title}
          </span>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-gray-400 shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <TaskFilesList
            projectUuid={projectUuid}
            task={task}
            filters={filters}
            onView={onView}
          />
        </div>
      )}
    </div>
  );
}

/** Inner list — mounted lazily by TaskFilesGroup so the fetch only fires on open. */
function TaskFilesList({
  projectUuid,
  task,
  filters,
  onView,
}: {
  projectUuid: string;
  task: TaskListItem;
  filters: TaskFileFilters;
  onView: (task: TaskListItem, file: TaskFileListItem) => void;
}) {
  const { data, isLoading, isError } = useTaskFileList(projectUuid, task.id);
  const download = useTaskFileDownload(projectUuid, task.id);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="w-5 h-5 border-2 border-[#021422] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
        <AlertTriangle size={16} /> Failed to load files for this task.
      </div>
    );
  }

  const all = sortFilesChronologically(data?.results ?? []);
  const files = all.filter((f) => {
    if (filters.milestoneType !== "all" && f.milestone_type !== filters.milestoneType)
      return false;
    if (filters.dateFrom && f.generated_at < filters.dateFrom) return false;
    if (filters.dateTo && f.generated_at > filters.dateTo + "T23:59:59Z") return false;
    return true;
  });

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-gray-400">
        <FileText size={20} />
        <p className="mt-1.5 text-xs">No milestone files match the filters.</p>
      </div>
    );
  }

  const handleDownload = (file: TaskFileListItem) => {
    setDownloadingId(file.id);
    download.mutate(
      {
        fileId: file.id,
        filename: `${file.task_wp_number}-${file.label}.pdf`
          .replace(/\s+/g, "-")
          .toLowerCase(),
      },
      { onSettled: () => setDownloadingId(null) },
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
      {files.map((file) => (
        <MilestoneFileCard
          key={file.id}
          file={file}
          onView={(f) => onView(task, f)}
          onDownload={handleDownload}
          isDownloading={downloadingId === file.id}
        />
      ))}
    </div>
  );
}
