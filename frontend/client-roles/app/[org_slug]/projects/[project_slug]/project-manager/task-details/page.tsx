"use client";

/* eslint-disable react-hooks/set-state-in-effect -- reset pagination when filters change. */

import { use, useState, useEffect } from "react";
import FilterBar from "./components/FilterBar";
import TaskCard from "./components/TaskCard";
import TaskDetailDrawer from "./components/TaskDetailDrawer";
import AddEditTaskModal from "./components/AddEditTaskModal";
import WorkPackageModal from "./components/WorkPackageModal";
import RequiresAttentionSection from "./components/RequiresAttentionSection";
import TaskQueueModal from "./components/TaskQueueModal";
import RescheduleTaskModal, { type ReschedulePayload } from "./components/RescheduleTaskModal";
import PMHeader from "../components/PMHeader";
import {
  Filter,
  MapPin,
  Plus,
  AlertTriangle,
  AlertOctagon,
  Bell,
} from "lucide-react";
import type { Task, TaskFilters, SubtaskRequest, SubtaskType, PendingRescheduleRequest, PredictiveAlert } from "./types";
import { getMockAlerts } from "./mockData";
import type { Milestone } from "@/lib/types/milestone";
import type { Crew as LocalCrew } from "./types";
import type { MilestoneApiResponse } from "@/lib/types/api";
import toast from "react-hot-toast";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { taskService, buildTaskQueryFilters } from "@/lib/services/taskService";
import { crewService } from "@/lib/services/crewService";
import { milestoneService } from "@/lib/services/milestoneService";
import {
  taskListItemToTask,
  taskDetailToTask,
  taskToCreatePayload,
  milestoneApiToLocal,
  apiCrewToLocalCrew,
} from "@/lib/transforms/taskTransforms";
import { getErrorMessage } from "@/lib/error";
import subtaskService from "@/lib/services/subtaskService";
import type { SubTaskCreatePayload, SubTaskApiResponse, SubTaskListItem } from "@/lib/services/subtaskService";
import { useInventory } from "@/store/inventoryStore";

// ─── Map API subtask response → local SubtaskRequest shape ────────────────────
// Accepts both SubTaskApiResponse (full detail) and SubTaskListItem (list),
// which now share approved_by / rejection_reason but differ in resource arrays.
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

    // ── Resources ───────────────────────────────────────────────────────
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

    // ── Crew requests ────────────────────────────────────────────────────
    additionalCrews: (res.crew_requests ?? []).map((c) => ({
      id: c.id,
      name: c.crew_name,
      trade: c.worker_type_display,
      workers: [],
      size: 0,
    })),
  };
}

interface TaskDetailsPageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

const defaultFilters: TaskFilters = {
  dateFrom: "",
  dateTo: "",
  status: "all",
  queue: "all",
  crews: [],
  milestone: "all",
  search: "",
  taskType: "all",
  ordering: "",
};

export default function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  const { org_slug, project_slug } = use(params);
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);
  const { loadFromApi: loadInventory } = useInventory();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [crews, setCrews] = useState<LocalCrew[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const alerts: PredictiveAlert[] = getMockAlerts();
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [filterVersion, setFilterVersion] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWorkPackageOpen, setIsWorkPackageOpen] = useState(false);
  const [workPackageTask, setWorkPackageTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskQueueOpen, setIsTaskQueueOpen] = useState(false);
  const [queueFilter, setQueueFilter] = useState<"all" | "todo" | "in_progress" | "on_hold" | "completed" | "uncompleted" | "cancelled">("all");
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

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
          crewService.listCrews(projectUuid),
          milestoneService.list(projectUuid),
          loadInventory(projectUuid),
        ]);
        if (cancelled) return;

        const taskResults = taskRes.data?.results ?? [];
        const fetched = taskResults.map(taskListItemToTask);
        setTasks((prev) => (page === 1 ? fetched : [...prev, ...fetched]));
        setTotalCount(taskRes.data?.count ?? 0);

        const crewResults = Array.isArray(crewRes.data) ? crewRes.data : (crewRes.data?.results ?? []);
        setCrews(crewResults.map(apiCrewToLocalCrew));

        const rawMilestones = milestoneRes.data as
          | MilestoneApiResponse[]
          | { results?: MilestoneApiResponse[] };
        const milestoneArr = Array.isArray(rawMilestones)
          ? rawMilestones
          : (rawMilestones?.results ?? []);
        setMilestones(milestoneArr.map(milestoneApiToLocal));

      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [projectUuid, page, filterVersion, filters.status, filters.queue, filters.search, filters.taskType, filters.ordering, filters.dateFrom, filters.dateTo, filters.milestone]);

  // ─── Filtering (crews applied client-side; all others are server-side) ──
  const filteredTasks = tasks.filter((task) => {
    if (filters.crews.length === 0) return true;
    return task.crews.some((c) => filters.crews.includes(c.id));
  });

  const queueStats = {
    all: tasks.length,
    todo: tasks.filter((t) => t.queue === "todo").length,
    inProgress: tasks.filter((t) => t.queue === "in_progress").length,
    onHold: tasks.filter((t) => t.queue === "on_hold").length,
    uncompleted: tasks.filter((t) => t.queue === "uncompleted").length,
    completed: tasks.filter((t) => t.queue === "completed").length,
    cancelled: tasks.filter((t) => t.queue === "cancelled").length,
  };

  // ─── Task Handlers ────────────────────────────────────
  const handleOpenTask = async (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
    if (!projectUuid) return;
    try {
      const [detailRes, subtaskRes] = await Promise.all([
        taskService.get(projectUuid, task.id),
        subtaskService.list(projectUuid, task.id),
      ]);

      const subtasks = (subtaskRes.data as unknown as SubTaskListItem[]).map((s) =>
        apiSubtaskToSubtaskRequest(s, task.id),
      );

      setSelectedTask((prev) =>
        prev
          ? { ...prev, ...taskDetailToTask(detailRes.data), subtasks }
          : prev,
      );

      // Keep the tasks list in sync too so subtasks survive drawer close/reopen
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, subtasks } : t,
        ),
      );
    } catch {
      // non-blocking: drawer still shows with list-level data
    }
  };

  const handleOpenWorkPackage = (task: Task) => {
    setWorkPackageTask(task);
    setIsWorkPackageOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedTask(null), 300);
  };

  const handleCloseWorkPackage = () => {
    setIsWorkPackageOpen(false);
    setTimeout(() => setWorkPackageTask(null), 300);
  };

  const handleEditFromDrawer = (task: Task) => {
    handleCloseDrawer();
    setEditingTask(task);
    setIsAddModalOpen(true);
  };

  const handleRescheduleFromDrawer = (task: Task) => {
    handleCloseDrawer();
    setEditingTask(task);
    setIsRescheduleOpen(true);
  };

  const handleRescheduleTask = async (taskId: string, payload: ReschedulePayload) => {
    const updateTask = (t: Task): Task =>
      t.id !== taskId ? t : { ...t, ...payload };
    setTasks((prev) => prev.map(updateTask));
    setEditingTask(null);
    setIsRescheduleOpen(false);
    if (projectUuid) {
      try {
        await taskService.patch(projectUuid, taskId, {
          start_date: payload.startDate,
          due_date: payload.dueDate,
        });
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    }
    toast.success("Task rescheduled successfully");
  };

  const handleRequestReschedule = (taskId: string, request: PendingRescheduleRequest) => {
    const updateTask = (t: Task): Task =>
      t.id !== taskId ? t : { ...t, pendingRescheduleRequest: request };
    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) setSelectedTask(updateTask(selectedTask));
    toast.success("Edit request sent to Project Manager");
  };

  const handleApproveRescheduleRequest = (taskId: string) => {
    const updateTask = (t: Task): Task => {
      if (t.id !== taskId) return t;
      const req = t.pendingRescheduleRequest;
      if (!req) return t;
      return {
        ...t,
        startDate: req.newStartDate,
        dueDate: req.newDueDate,
        reschedule_reason: req.reason,
        is_rescheduled: true,
        original_start_date: t.original_start_date ?? t.startDate,
        original_end_date: t.original_end_date ?? t.dueDate,
        rescheduled_at: new Date().toISOString(),
        rescheduled_by: req.requestedBy,
        reschedule_approved_by_pm: true,
        pendingRescheduleRequest: undefined,
      };
    };
    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) setSelectedTask(updateTask(selectedTask));
    toast.success("Edit request approved — task rescheduled");
  };

  const handleRejectRescheduleRequest = (taskId: string) => {
    const updateTask = (t: Task): Task =>
      t.id !== taskId ? t : { ...t, pendingRescheduleRequest: undefined };
    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) setSelectedTask(updateTask(selectedTask));
    toast.error("Edit request rejected");
  };

  const handleEditFromWorkPackage = (task: Task) => {
    setIsWorkPackageOpen(false);
    setEditingTask(task);
    setIsAddModalOpen(true);
  };

  const handleQueueClick = (filter: typeof queueFilter) => {
    setQueueFilter(filter);
    setIsTaskQueueOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!projectUuid) return;
    const payload = taskToCreatePayload(taskData);
    try {
      if (editingTask) {
        await taskService.patch(projectUuid, editingTask.id, payload);
        setTasks((prev) =>
          prev.map((t) =>
            t.id === editingTask.id ? ({ ...t, ...taskData } as Task) : t,
          ),
        );
        toast.success("Task updated successfully");
      } else {
        await taskService.create(projectUuid, payload);
        // Re-fetch page 1 to get fresh list with real wp_number
        const listRes = await taskService.list(projectUuid, 1);
        setTasks(listRes.data.results.map(taskListItemToTask));
        setTotalCount(listRes.data.count);
        toast.success("Task created successfully");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setEditingTask(null);
    setIsAddModalOpen(false);
  };

  const handleCloseAddModal = () => {
    setEditingTask(null);
    setIsAddModalOpen(false);
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
      const updateTask = (t: Task): Task => {
        if (t.id !== taskId) return t;
        return { ...t, subtasks: [...(t.subtasks || []), newSubtask] };
      };
      setTasks((prev) => prev.map(updateTask));
      if (selectedTask?.id === taskId) setSelectedTask(updateTask(selectedTask));
      toast.success("Subtask created successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err; // re-throw so modal stays open and shows error state
    }
  };

  const handleResolveAttention = (taskId: string, messageId: string) => {
    const updateTask = (t: Task): Task => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        communications: (t.communications || []).map((msg) =>
          msg.id === messageId ? { ...msg, requiresAttention: false } : msg,
        ),
      };
    };
    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) setSelectedTask(updateTask(selectedTask));
    toast.success("Item resolved");
  };

  const handleUpdateSubtask = (subtaskId: string, updated: SubtaskRequest) => {
    if (!selectedTask) return;
    const updateTask = (t: Task): Task => {
      if (t.id !== selectedTask.id) return t;
      return { ...t, subtasks: t.subtasks?.map((s) => (s.id === subtaskId ? updated : s)) };
    };
    setTasks((prev) => prev.map(updateTask));
    setSelectedTask(updateTask(selectedTask));
    toast.success("Subtask updated");
  };

  const handleApproveSubtask = async (subtaskId: string) => {
    if (!selectedTask || !projectUuid) return;
    try {
      const res = await subtaskService.approve(projectUuid, selectedTask.id, subtaskId);
      const updated = apiSubtaskToSubtaskRequest(
        res.data as unknown as SubTaskApiResponse,
        selectedTask.id,
      );
      const updateTask = (t: Task): Task => {
        if (t.id !== selectedTask.id) return t;
        return { ...t, subtasks: t.subtasks?.map((s) => (s.id === subtaskId ? updated : s)) };
      };
      setTasks((prev) => prev.map(updateTask));
      setSelectedTask((prev) => (prev ? updateTask(prev) : prev));
      toast.success("Subtask approved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRejectSubtask = async (subtaskId: string, reason: string) => {
    if (!selectedTask || !projectUuid) return;
    try {
      const res = await subtaskService.reject(projectUuid, selectedTask.id, subtaskId, reason);
      const updated = apiSubtaskToSubtaskRequest(
        res.data as unknown as SubTaskApiResponse,
        selectedTask.id,
      );
      const updateTask = (t: Task): Task => {
        if (t.id !== selectedTask.id) return t;
        return { ...t, subtasks: t.subtasks?.map((s) => (s.id === subtaskId ? updated : s)) };
      };
      setTasks((prev) => prev.map(updateTask));
      setSelectedTask((prev) => (prev ? updateTask(prev) : prev));
      toast.success("Subtask rejected");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleApproveTask = async (taskId: string) => {
    if (!projectUuid) return;
    try {
      await taskService.approve(projectUuid, taskId);
      // Re-fetch the detail so approval_status, the now-locked planned-cost
      // snapshot, and post-deduction figures are all fresh. Approval also
      // deducts material/PPE stock server-side.
      const detailRes = await taskService.get(projectUuid, taskId);
      const patch = taskDetailToTask(detailRes.data);
      const apply = (t: Task): Task => (t.id === taskId ? { ...t, ...patch } : t);
      setTasks((prev) => prev.map(apply));
      setSelectedTask((prev) => (prev && prev.id === taskId ? { ...prev, ...patch } : prev));
      toast.success("Task approved");
    } catch (err) {
      // 409 surfaces here — insufficient stock at approval lists the deficient
      // items, or an FSM conflict (already actioned).
      toast.error(getErrorMessage(err));
    }
  };

  const handleRejectTask = async (taskId: string, reason: string) => {
    if (!projectUuid) return;
    try {
      await taskService.reject(projectUuid, taskId, reason);
      const detailRes = await taskService.get(projectUuid, taskId);
      const patch = taskDetailToTask(detailRes.data);
      const apply = (t: Task): Task => (t.id === taskId ? { ...t, ...patch } : t);
      setTasks((prev) => prev.map(apply));
      setSelectedTask((prev) => (prev && prev.id === taskId ? { ...prev, ...patch } : prev));
      toast.success("Task rejected");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleApproveChecklistChanges = (taskId: string) => {
    const updateTask = (t: Task): Task => {
      if (t.id !== taskId) return t;
      if (!t.taskTracker?.pendingChanges) return t;

      const pendingChanges = t.taskTracker.pendingChanges.filter(
        (c) => c.status === "pending",
      );
      let updatedItems = [...t.taskTracker.items];
      for (const change of pendingChanges) {
        if (change.changeType === "added") {
          updatedItems.push(change.item);
        } else if (change.changeType === "removed") {
          updatedItems = updatedItems.filter((item) => item.id !== change.item.id);
        }
      }
      return {
        ...t,
        taskTracker: {
          ...t.taskTracker,
          items: updatedItems,
          pendingChanges: t.taskTracker.pendingChanges.map((c) =>
            c.status === "pending"
              ? { ...c, status: "approved" as const, approvedBy: "Current User" }
              : c,
          ),
        },
        trackerApprovalStatus: "approved" as const,
      };
    };
    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) setSelectedTask(updateTask(selectedTask));
    toast.success("Checklist changes approved");
  };

  const handleRejectChecklistChanges = (taskId: string, reason: string) => {
    const updateTask = (t: Task): Task => {
      if (t.id !== taskId) return t;
      if (!t.taskTracker?.pendingChanges) return t;
      return {
        ...t,
        taskTracker: {
          ...t.taskTracker,
          pendingChanges: t.taskTracker.pendingChanges.map((c) =>
            c.status === "pending"
              ? {
                  ...c,
                  status: "rejected" as const,
                  rejectedBy: "Current User",
                  rejectionReason: reason,
                }
              : c,
          ),
        },
        trackerApprovalStatus: "rejected" as const,
      };
    };
    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) setSelectedTask(updateTask(selectedTask));
    toast.success("Checklist changes rejected");
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    const updateFn = (t: Task): Task => (t.id === taskId ? { ...t, ...updates } : t);
    setTasks((prev) => prev.map(updateFn));
    if (selectedTask?.id === taskId)
      setSelectedTask((prev) => (prev ? updateFn(prev) : prev));
    if (workPackageTask?.id === taskId)
      setWorkPackageTask((prev) => (prev ? updateFn(prev) : prev));

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

  // ─── Stat Cards (commented out — not needed for now) ─────────────────────
  // const statCards = statistics ? [ ...] : [];

  return (
    <div className="">
      <AddEditTaskModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        task={editingTask}
        crews={crews}
        milestones={milestones}
        onSave={handleSaveTask}
      />

      <RescheduleTaskModal
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={handleRescheduleTask}
      />

      {workPackageTask && (
        <WorkPackageModal
          isOpen={isWorkPackageOpen}
          onClose={handleCloseWorkPackage}
          task={workPackageTask}
          onEdit={handleEditFromWorkPackage}
          onUpdate={handleUpdateTask}
        />
      )}

      <PMHeader
        title={
          project
            ? (project as { name?: string }).name
            : project_slug
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")
        }
        badge="TASK OVERVIEW"
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

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#001220] text-sm font-bold text-white hover:bg-gray-900 transition-colors"
          >
            <Plus size={14} />
            Add Tasks
          </button>
        </div>

        {showFilters && (
          <FilterBar
            filters={filters}
            onChange={setFilters}
            crews={crews}
            milestones={milestones}
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

        {/* Analytics Sparkline — commented out, not needed for now */}
        {/* {analyticsData.length > 0 && ( ... )} */}

        <RequiresAttentionSection
          tasks={tasks}
          onOpenTask={handleOpenTask}
          onResolve={handleResolveAttention}
        />

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
                <TaskCard
                  key={task.id}
                  task={task}
                  onOpenDetail={handleOpenTask}
                  onOpenWorkPackage={handleOpenWorkPackage}
                  crews={crews}
                  milestones={milestones}
                  onCreateSubtask={handleCreateSubtask}
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
              onClick={() => setPage((p) => p + 1)}
              className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-[#021422] hover:bg-gray-50 transition-colors"
            >
              Load more ({totalCount - tasks.length} remaining)
            </button>
          </div>
        )}
      </div>

      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        milestones={milestones}
        crews={crews}
        onUpdate={handleUpdateTask}
        onApproveTask={handleApproveTask}
        onRejectTask={handleRejectTask}
        onApproveSubtask={handleApproveSubtask}
        onRejectSubtask={handleRejectSubtask}
        onCreateSubtask={handleCreateSubtask}
        onUpdateSubtask={handleUpdateSubtask}
        onApproveChecklistChanges={handleApproveChecklistChanges}
        onRejectChecklistChanges={handleRejectChecklistChanges}
        onEdit={handleEditFromDrawer}
        onReschedule={handleRescheduleFromDrawer}
        onRequestReschedule={handleRequestReschedule}
        onApproveRescheduleRequest={handleApproveRescheduleRequest}
        onRejectRescheduleRequest={handleRejectRescheduleRequest}
      />

      <TaskQueueModal
        isOpen={isTaskQueueOpen}
        onClose={() => setIsTaskQueueOpen(false)}
        tasks={tasks}
        onUpdateTask={handleUpdateTask}
        initialFilter={queueFilter}
      />
    </div>
  );
}

