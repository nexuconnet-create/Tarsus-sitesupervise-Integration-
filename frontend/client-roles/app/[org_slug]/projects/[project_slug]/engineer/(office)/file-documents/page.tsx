"use client";

import { use, useState, useMemo } from "react";
import { FileText, Search, ChevronDown } from "lucide-react";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useProjectTasks } from "@/lib/hooks/useProjectTasks";
import EngineerHeader from "../components/EngineerHeader";
import TaskFilesGroup, {
  type TaskFileFilters,
} from "./components/TaskFilesGroup";
import MilestoneFilePreviewDrawer, {
  type PreviewTarget,
} from "./components/MilestoneFilePreviewDrawer";
import type { TaskListItem, TaskFileListItem, TaskFileMilestoneType } from "@/lib/types/api";

interface FileDocumentsPageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function FileDocumentsPage({ params }: FileDocumentsPageProps) {
  const { org_slug, project_slug } = use(params);
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);

  const { data, isLoading, isError } = useProjectTasks(projectUuid);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterWP, setFilterWP] = useState("");
  const [filterMilestone, setFilterMilestone] = useState<"all" | TaskFileMilestoneType>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [preview, setPreview] = useState<PreviewTarget | null>(null);

  const tasks: TaskListItem[] = useMemo(() => data?.results ?? [], [data]);

  // Search + WP filter narrow the task list; milestone/date filters apply to the
  // files inside each group (they live in the snapshot, loaded per task).
  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const wp = filterWP.toLowerCase();
    return tasks.filter((t) => {
      const hay = `${t.wp_number} ${t.title}`.toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (wp && !t.wp_number.toLowerCase().includes(wp)) return false;
      return true;
    });
  }, [tasks, searchQuery, filterWP]);

  const fileFilters: TaskFileFilters = {
    milestoneType: filterMilestone,
    dateFrom: filterDateFrom,
    dateTo: filterDateTo,
  };

  const hasActiveFilters =
    !!filterWP ||
    filterMilestone !== "all" ||
    !!filterDateFrom ||
    !!filterDateTo ||
    !!searchQuery;

  const clearFilters = () => {
    setFilterWP("");
    setFilterMilestone("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSearchQuery("");
  };

  const onView = (task: TaskListItem, file: TaskFileListItem) =>
    setPreview({ projectUuid: projectUuid!, taskId: task.id, file });

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <EngineerHeader
        title={
          project
            ? (project as { name?: string }).name
            : project_slug
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")
        }
        badge="DOCUMENTS"
      />

      <div className="px-4 pt-4">
        <div className="relative mb-4 w-full md:w-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search WP or task title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#021422] focus:bg-white w-full md:w-64"
          />
        </div>
      </div>

      <div className="flex p-5 gap-5">
        {/* ── Sidebar ── */}
        <aside className="w-64 shrink-0 flex-col gap-4 hidden lg:flex">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-xs font-bold text-[#021422] uppercase tracking-widest">
                Filters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] text-gray-400 hover:text-[#021422] transition-colors font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Task / WP</label>
                <input
                  type="text"
                  placeholder="e.g. WP-205"
                  value={filterWP}
                  onChange={(e) => setFilterWP(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Milestone</label>
                <div className="relative">
                  <select
                    value={filterMilestone}
                    onChange={(e) =>
                      setFilterMilestone(e.target.value as typeof filterMilestone)
                    }
                    className="w-full appearance-none border border-gray-200 bg-gray-50 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] pr-7"
                  >
                    <option value="all">All milestones</option>
                    <option value="created">Created</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Date range</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 px-3 py-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#021422]"
                />
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 px-3 py-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#021422]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <span className="text-xs font-bold text-[#021422] uppercase tracking-widest">
                Summary
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <p className="text-xs text-gray-500">Tasks</p>
              <span className="text-sm font-bold text-[#021422]">{filteredTasks.length}</span>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex border-b border-gray-100">
              <div className="flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 border-[#021422] text-[#021422]">
                Task Files
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#021422] text-white">
                  {filteredTasks.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Task Files
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#021422] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isError ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
              <FileText size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">Failed to load tasks.</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
              <FileText size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">
                {tasks.length === 0
                  ? "No tasks in this project yet."
                  : "No tasks match the current filters."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredTasks.map((task) => (
                <TaskFilesGroup
                  key={task.id}
                  projectUuid={projectUuid!}
                  task={task}
                  filters={fileFilters}
                  defaultOpen={filteredTasks.length <= 3}
                  onView={onView}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <MilestoneFilePreviewDrawer target={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
