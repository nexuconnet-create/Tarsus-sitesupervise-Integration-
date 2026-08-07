"use client";

import { X, Download, AlertTriangle } from "lucide-react";
import {
  useTaskFileDetail,
  useTaskFileDownload,
} from "@/lib/hooks/useTaskFiles";
import TaskSnapshotView from "@/components/snapshot/TaskSnapshotView";
import { formatDateTime } from "@/lib/format/snapshot";
import type { TaskFileListItem } from "@/lib/types/api";
import type { TaskSnapshot } from "@/lib/types/taskSnapshot";

export interface PreviewTarget {
  projectUuid: string;
  taskId: string;
  file: TaskFileListItem;
}

interface MilestoneFilePreviewDrawerProps {
  target: PreviewTarget | null;
  onClose: () => void;
}

export default function MilestoneFilePreviewDrawer({
  target,
  onClose,
}: MilestoneFilePreviewDrawerProps) {
  const enabled = Boolean(target);
  const { data, isLoading, isError } = useTaskFileDetail(
    target?.projectUuid ?? "",
    target?.taskId ?? "",
    enabled ? target!.file.id : null,
  );
  const download = useTaskFileDownload(
    target?.projectUuid ?? "",
    target?.taskId ?? "",
  );

  if (!target) return null;

  const { file } = target;

  const handleDownload = () =>
    download.mutate({
      fileId: file.id,
      filename: `${file.task_wp_number}-${file.label}.pdf`
        .replace(/\s+/g, "-")
        .toLowerCase(),
    });

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-[#F4F6F8] shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 bg-white px-6 py-4 border-b border-gray-200">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#021422] bg-gray-100 px-2 py-0.5 rounded font-mono">
                {file.task_wp_number}
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                {file.label}
              </span>
            </div>
            <h2 className="text-sm font-bold text-[#021422] truncate">
              {file.task_title}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Generated {formatDateTime(file.generated_at)}
              {file.generated_by &&
                ` · ${file.generated_by.first_name} ${file.generated_by.last_name}`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              disabled={download.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              <Download size={12} />
              {download.isPending ? "Preparing…" : "PDF"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-[#021422] transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#021422] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <AlertTriangle size={24} />
              <p className="mt-2 text-sm">Failed to load snapshot.</p>
            </div>
          )}
          {data && (
            <TaskSnapshotView
              file={file}
              snapshot={data.snapshot as unknown as TaskSnapshot}
            />
          )}
        </div>
      </aside>
    </>
  );
}
