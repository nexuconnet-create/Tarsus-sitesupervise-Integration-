"use client";

/* eslint-disable react-hooks/set-state-in-effect -- reset pagination when filters change. */

import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { Filter, MapPin, AlertOctagon, AlertTriangle, Bell } from "lucide-react";
import CrewHeader from "../component/CrewHeader";
import {
  CrewTaskCard,
  CrewTaskDetailDrawer,
  CrewFilters,
  TaskQueueModal,
} from "./components";
import type {
  Task as TaskType,
  CrewManagerTaskFilters,
  ChecklistChange,
  QueueType,
  TaskStatus,
  TaskTracker,
} from "./types";
import { taskService, buildTaskQueryFilters } from "@/lib/services/taskService";
import { milestoneService } from "@/lib/services/milestoneService";
import { crewService } from "@/lib/services/crewService";
import subtaskService from "@/lib/services/subtaskService";
import type { SubTaskCreatePayload, SubTaskApiResponse, SubTaskListItem } from "@/lib/services/subtaskService";
import type { TaskListItem, TaskDetail } from "@/lib/types/api";
import type { Milestone } from "@/lib/types/milestone";
import { taskDetailToTask } from "@/lib/transforms/taskTransforms";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/error";
import { getMockAlerts } from "@/lib/mockData";
import type { PredictiveAlert } from "@/lib/types";
import type { SubtaskRequest, SubtaskType, Crew as LocalCrew } from "./types";

interface ExtendedTask extends TaskType {
  approvalStatus?: "pending" | "pending_approval" | "approved" | "rejected";
}

function apiTaskToExtendedTask(item: TaskListItem): ExtendedTask {
  const crews = (item.crew_assignments || []).map((a) => ({
    id: a.crew_id,
    name: a.crew_name,
    trade: a.crew_trade,
    workers: [],
    size: 0,
  }));

  const crewAssignments = (item.crew_assignments || []).map((a) => ({
    crewId: a.crew_id,
    workerType: a.worker_type as
      | "subcontractor"
      | "daily_worker"
      | "not_applicable",
    price:
      a.flat_price != null
        ? parseFloat(a.flat_price)
        : a.daily_rate != null
          ? parseFloat(a.daily_rate)
          : undefined,
  }));

  return {
    id: item.id,
    title: item.title,
    grid: item.grid_reference || item.grid || "",
    status: item.status as TaskStatus,
    queue: item.queue as QueueType,
    progress: item.checklist_progress ?? 0,
    dueDate: item.due_date,
    startDate: item.start_date,
    crews,
    crewAssignments,
    location: item.location || "",
    description: item.description,
    wp: item.wp_number,
    milestoneId: item.milestone_id || "",
    milestoneName: item.milestone_name || undefined,
    checklistItemsCount: item.checklist_items_count || 0,
    communications: [],
    approvalStatus: "approved",
  };
}

const defaultFilters: CrewManagerTaskFilters = {
  dateFrom: "",
  dateTo: "",
  status: "all",
  queue: "all",
  crews: [],
  milestone: "",
  search: "",
  taskType: "all",
  ordering: "",
};

function apiSubtaskToSubtaskRequest(
  res: SubTaskApiResponse | (SubTaskListItem & { materials?: never; equipment?: never; ppe?: never; crew_requests?: never }),
  taskId: string,
): SubtaskRequest {
  const types: SubtaskType[] = [];
  if (res.has_resource_request) types.push("additional_resources");
  if (res.has_crew_request) types.push("additional_crew");
  if (res.has_timeline_extension) types.push("timeline_extension");

  return {
    id: res.id,
    taskId,
    title: res.title,
    description: res.description,
    type: types.length === 1 ? types[0] : types,
    status: res.status,
    requestedBy: res.requested_by.fullname,
    requestedByRole: res.requested_by.role,
    requestedAt: res.requested_at,
    newStartDate: res.new_start_date ?? undefined,
    newDueDate: res.new_due_date ?? undefined,
    rejectionReason: res.rejection_reason || undefined,
    approvedBy: res.approved_by?.fullname,
    approvedByRole: res.approved_by?.role,
    materials: (res.materials ?? []).map((m) => ({
      id: m.item_uuid,
      name: m.item_name,
      quantity: m.quantity_required,
      unit: "",
      status: "requested" as const,
      unitCost: parseFloat(m.unit_cost) || 0,
      notes: m.notes || undefined,
    })),
    equipment: (res.equipment ?? []).map((e) => ({
      id: e.item_uuid,
      name: e.item_name,
      quantity: e.quantity_required,
      status: "requested" as const,
      unitCost: parseFloat(e.unit_cost) || 0,
    })),
    ppe: (res.ppe ?? []).map((p) => ({
      id: p.item_uuid,
      name: p.item_name,
      quantity: p.quantity_required,
      status: "requested" as const,
      unitCost: parseFloat(p.unit_cost) || 0,
    })),
    additionalCrews: (res.crew_requests ?? []).map((c) => ({
      id: c.id,
      name: c.crew_name,
      trade: c.worker_type_display,
      workers: [],
      size: 0,
    })),
  };
}

export default function CrewTaskDetailsPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const { getProject } = useMemberships();
  const project = getProject(orgSlug, projectSlug);
  const { data: projectUuid } = useProjectUuid(orgSlug, projectSlug);

  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [crews, setCrews] = useState<LocalCrew[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [alerts] = useState<PredictiveAlert[]>(() => getMockAlerts());
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status");
  const initialFilters: CrewManagerTaskFilters = {
    ...defaultFilters,
    status: (initialStatus && initialStatus !== "all" ? initialStatus : defaultFilters.status) as CrewManagerTaskFilters["status"],
  };

  const [filters, setFilters] = useState<CrewManagerTaskFilters>(initialFilters);
  const [filterVersion, setFilterVersion] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isTaskQueueOpen, setIsTaskQueueOpen] = useState(false);
  const [queueFilter, setQueueFilter] = useState<
    "all" | "uncompleted" | QueueType
  >("all");

  // Reset page and re-fetch when filters change
  useEffect(() => {
    setPage(1);
    setTasks([]);
    setFilterVersion((v) => v + 1);
  }, [filters]);

  // ─── Data Fetching ────────────────────────────────────
  useEffect(() => {
    if (!projectUuid) return;
    let cancelled = false;

    (async () => {
      try {
        const apiParams = buildTaskQueryFilters(
          { status: filters.status, queue: filters.queue, search: filters.search, taskType: filters.taskType, ordering: filters.ordering, dateFrom: filters.dateFrom, dateTo: filters.dateTo, milestone: filters.milestone },
          page,
        );
        const [taskRes, crewRes, milestoneRes] = await Promise.all([
          taskService.list(projectUuid, apiParams),
          crewService.listCrews(projectUuid).catch(() => null),
          milestoneService.list(projectUuid).catch(() => null),
        ]);

        if (cancelled) return;

        const fetched = (taskRes.data?.results ?? []).map(apiTaskToExtendedTask);
        setTasks((prev) => (page === 1 ? fetched : [...prev, ...fetched]));
        setTotalCount(taskRes.data?.count ?? 0);

        if (milestoneRes?.data) {
          const list = Array.isArray(milestoneRes.data)
            ? milestoneRes.data
            : (milestoneRes.data as { results?: unknown[] }).results ?? [];
          setMilestones(list as Milestone[]);
        }

        if (crewRes?.data) {
          const crewList = Array.isArray(crewRes.data)
            ? crewRes.data
            : (crewRes.data as { results?: unknown[] }).results ?? [];
          setCrews(
            (crewList as { id: string; name: string; trade?: string; workers?: unknown[] }[]).map((c) => ({
              id: c.id,
              name: c.name,
              trade: c.trade || "",
              workers: [],
              size: 0,
            })),
          );
        }
      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectUuid, page, filterVersion, filters.status, filters.queue, filters.search, filters.taskType, filters.ordering, filters.dateFrom, filters.dateTo, filters.milestone]);

  // ─── Derived ──────────────────────────────────────────
  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.crews.length > 0) {
        const taskCrewIds = task.crews.map((c) => c.id);
        if (!filters.crews.some((cid) => taskCrewIds.includes(cid)))
          return false;
      }
      return true;
    });
  }, [tasks, filters.crews]);

  const queueStats = useMemo(() => ({
    all: tasks.length,
    todo: tasks.filter((t) => t.queue === "todo").length,
    inProgress: tasks.filter((t) => t.queue === "in_progress").length,
    onHold: tasks.filter((t) => t.queue === "on_hold").length,
    completed: tasks.filter((t) => t.queue === "completed").length,
    uncompleted: tasks.filter((t) => t.queue !== "completed" && t.queue !== "cancelled").length,
    cancelled: tasks.filter((t) => t.queue === "cancelled").length,
  }), [tasks]);

  // ─── Handlers ─────────────────────────────────────────
  const handleOpenTask = async (task: ExtendedTask) => {
    setSelectedTaskId(task.id);
    setIsDrawerOpen(true);

    if (!projectUuid) return;
    try {
      const [detailRes, subtaskRes] = await Promise.all([
        taskService.get(projectUuid, task.id),
        subtaskService.list(projectUuid, task.id).catch(() => ({ data: [] })),
      ]);

      const detail = detailRes.data;
      const detailPatch = taskDetailToTask(detail);
      const checklists = Array.isArray(detail)
        ? []
        : (detail as unknown as Record<string, unknown>)
            ?.checklists as TaskDetail["checklists"];
      if (checklists) {
        const items = checklists.map((c) => ({
          id: c.id,
          description: c.description,
          checked: c.is_completed,
          enabled: true,
        }));
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  ...detailPatch,
                  taskTracker: t.taskTracker
                    ? { ...t.taskTracker, items }
                    : {
                        taskType: t.wp || "general",
                        items,
                      } as TaskTracker,
                }
              : t,
          ),
        );
      } else {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, ...detailPatch } : t,
          ),
        );
      }

      const subtasks = (subtaskRes.data as unknown as SubTaskListItem[]).map((s) =>
        apiSubtaskToSubtaskRequest(s, task.id),
      );
      if (subtasks.length > 0) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, subtasks } : t,
          ),
        );
      }
    } catch {
      // detail fetch is best-effort; card already shows list data
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedTaskId(null), 300);
  };

  const handleTaskUpdate = async (
    taskId: string,
    updates: Partial<ExtendedTask>,
  ) => {
    setTasks((prev) =>
      prev.map((t) => (t.id !== taskId ? t : { ...t, ...updates })),
    );
    if (projectUuid && (updates.queue || updates.status)) {
      try {
        const patch: Record<string, string> = {};
        if (updates.queue) patch.queue = updates.queue;
        if (updates.status) patch.status = updates.status;
        await taskService.patch(projectUuid, taskId, patch);
        const msg = updates.queue === 'completed' ? 'Task marked as Complete!'
                  : updates.queue === 'on_hold' ? 'Task marked as On Hold'
                  : 'Task updated successfully';
        toast.success(msg);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    }
  };

  const handleSubmitChecklistChanges = (
    taskId: string,
    changes: ChecklistChange[],
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              taskTracker: t.taskTracker
                ? {
                    ...t.taskTracker,
                    pendingChanges: [
                      ...(t.taskTracker.pendingChanges || []),
                      ...changes,
                    ],
                    items: changes.reduce(
                      (acc, change) => {
                        if (change.changeType === "added") {
                          return [
                            ...acc,
                            {
                              id: change.item.id || `new-${Date.now()}`,
                              description: change.item.description || "",
                              checked: false,
                              enabled: true,
                            },
                          ];
                        }
                        return acc.filter((i) => i.id !== change.item.id);
                      },
                      t.taskTracker.items || [],
                    ),
                  }
                : undefined,
            }
          : t,
      ),
    );
    toast.success("Checklist changes submitted for approval");
  };

  const handleCreateSubtask = async (
    taskId: string,
    payload: SubTaskCreatePayload,
  ): Promise<void> => {
    if (!projectUuid) return;
    try {
      const res = await subtaskService.create(projectUuid, taskId, payload);
      const newSubtask = apiSubtaskToSubtaskRequest(
        res.data as unknown as SubTaskApiResponse,
        taskId,
      );
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, subtasks: [...(t.subtasks || []), newSubtask] }
            : t,
        ),
      );
      toast.success("Subtask created successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const handleApproveSubtask = async (subtaskId: string) => {
    const selectedTask = tasks.find((t) => t.id === selectedTaskId);
    if (!selectedTask || !projectUuid) return;
    try {
      const res = await subtaskService.approve(projectUuid, selectedTask.id, subtaskId);
      const updated = apiSubtaskToSubtaskRequest(
        res.data as unknown as SubTaskApiResponse,
        selectedTask.id,
      );
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id
            ? { ...t, subtasks: t.subtasks?.map((s) => (s.id === subtaskId ? updated : s)) }
            : t,
        ),
      );
      toast.success("Subtask approved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRejectSubtask = async (subtaskId: string, reason: string) => {
    const selectedTask = tasks.find((t) => t.id === selectedTaskId);
    if (!selectedTask || !projectUuid) return;
    try {
      const res = await subtaskService.reject(projectUuid, selectedTask.id, subtaskId, reason);
      const updated = apiSubtaskToSubtaskRequest(
        res.data as unknown as SubTaskApiResponse,
        selectedTask.id,
      );
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id
            ? { ...t, subtasks: t.subtasks?.map((s) => (s.id === subtaskId ? updated : s)) }
            : t,
        ),
      );
      toast.success("Subtask rejected");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleUpdateSubtask = (subtaskId: string, updated: SubtaskRequest) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTaskId
          ? { ...t, subtasks: t.subtasks?.map((s) => (s.id === subtaskId ? updated : s)) }
          : t,
      ),
    );
    toast.success("Subtask updated");
  };

  const handleQueueClick = (filter: typeof queueFilter) => {
    setQueueFilter(filter);
    setIsTaskQueueOpen(true);
  };

  const handleLoadMore = () => setPage((p) => p + 1);

  // ─── Loading ──────────────────────────────────────────
  if (isLoading && tasks.length === 0) {
    return (
      <div className="">
        <CrewHeader title="Task Overview" project={project?.name || projectSlug} />
        <div className="p-4 md:p-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-pulse"
            >
              <div className="flex gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-gray-200 rounded" />
                    <div className="h-6 w-20 bg-gray-200 rounded-full" />
                    <div className="h-6 w-24 bg-gray-200 rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                </div>
                <div className="w-24 h-24 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="">
      <CrewHeader
        title="Task Overview"
        project={project?.name || projectSlug}
      />

      <CrewTaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onUpdate={handleTaskUpdate}
        onSubmitChanges={handleSubmitChecklistChanges}
        milestones={milestones}
        crews={crews}
        onCreateSubtask={handleCreateSubtask}
        onApproveSubtask={handleApproveSubtask}
        onRejectSubtask={handleRejectSubtask}
        onUpdateSubtask={handleUpdateSubtask}
      />

      <TaskQueueModal
        isOpen={isTaskQueueOpen}
        onClose={() => setIsTaskQueueOpen(false)}
        tasks={tasks}
        onUpdateTask={handleTaskUpdate}
        initialFilter={queueFilter}
      />

      <div className="space-y-6 pb-20 p-4 md:p-8 pt-8">
        {/* ─── Action Bar ─────────────────────────────── */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
              showFilters
                ? "bg-[#021422] text-white border-[#021422]"
                : "bg-white text-[#021422] border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Filter size={14} />
            <span>Filter</span>
            {(filters.status !== "all" ||
              filters.queue !== "all" ||
              filters.crews.length > 0 ||
              filters.dateFrom ||
              filters.dateTo) && (
              <span className="w-5 h-5 rounded-full bg-[#007AFF] text-white text-[10px] font-bold flex items-center justify-center">
                {
                  [
                    filters.status !== "all",
                    filters.queue !== "all",
                    filters.crews.length > 0,
                    !!filters.dateFrom,
                    !!filters.dateTo,
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <CrewFilters
            filters={filters}
            onChange={setFilters}
            onClose={() => setShowFilters(false)}
            totalTasks={tasks.length}
            filteredCount={filteredTasks.length}
          />
        )}

        {/* ─── Main Grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-[#021422] text-white p-4 text-center">
              <h3 className="font-semibold text-sm tracking-wide uppercase">Task Queues</h3>
            </div>
            <div className="p-6 space-y-4 flex-1">
              {[
                { key: "all", label: "All", count: queueStats.all, filter: "all" as const },
                { key: "todo", label: "TO-DO", count: queueStats.todo, filter: "todo" as const },
                { key: "inProgress", label: "In Progress", count: queueStats.inProgress, filter: "in_progress" as const },
                { key: "onHold", label: "On Hold", count: queueStats.onHold, filter: "on_hold" as const },
                { key: "completed", label: "Completed", count: queueStats.completed, filter: "completed" as const },
                { key: "uncompleted", label: "Uncompleted", count: queueStats.uncompleted, filter: "uncompleted" as const },
                { key: "cancelled", label: "Cancelled", count: queueStats.cancelled, filter: "cancelled" as const },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleQueueClick(item.filter)}
                  className="w-full text-left hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    {item.label} ({isLoading ? "…" : item.count})
                  </span>
                </button>
              ))}
              <button
                onClick={() => setIsTaskQueueOpen(true)}
                className="w-full mt-4 px-4 py-2.5 rounded-lg bg-[#001220] text-xs font-bold text-white hover:bg-gray-900 transition-colors"
              >
                Manage Queues
              </button>
            </div>
          </div>

          {/* Live Site Map */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative h-[250px] lg:h-auto">
            <div className="bg-[#021422] text-white p-2 absolute top-4 left-1/2 -translate-x-1/2 z-10 rounded px-4">
              <h3 className="font-semibold text-xs tracking-wide uppercase">Live Site Map</h3>
            </div>
            <div
              className="absolute inset-0 bg-gray-200"
              style={{
                backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-gray-400 rotate-12 bg-gray-100/50" />
              <MapPin className="absolute top-1/3 left-1/3 text-orange-500 fill-orange-500 drop-shadow-md" size={32} />
              <MapPin className="absolute bottom-1/4 right-1/4 text-orange-500 fill-orange-500 drop-shadow-md" size={32} />
            </div>
          </div>

          {/* Predictive Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-[#021422] text-white p-4 text-center">
              <h3 className="font-semibold text-sm tracking-wide uppercase">Predictive Alerts</h3>
            </div>
            <div className="p-6 space-y-4 flex-1">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3">
                  {alert.type === "critical" ? (
                    <AlertOctagon size={18} className="text-red-600 shrink-0 mt-0.5" />
                  ) : alert.type === "warning" ? (
                    <AlertTriangle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                  ) : (
                    <Bell size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm font-semibold text-[#021422]">{alert.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h3 className="font-bold text-lg text-[#021422] uppercase tracking-wide">
          Active Work Packages
        </h3>

        {/* ─── Loading State ───────────────────────────── */}
        {isLoading && tasks.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <CrewTaskCard
                  key={task.id}
                  task={task}
                  onOpenDetail={handleOpenTask}
                  milestones={milestones}
                />
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <Filter size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-semibold text-gray-500">
                  No tasks match the current filters
                </p>
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="mt-3 text-xs font-bold text-[#007AFF] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── Pagination ──────────────────────────────── */}
        {tasks.length < totalCount && !isLoading && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Load more tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
