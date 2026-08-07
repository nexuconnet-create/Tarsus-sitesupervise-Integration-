"use client";

import { useState, useMemo } from "react";
import { Filter, ClipboardList, CheckCircle2 } from "lucide-react";
import { CrewTaskCard, CrewTaskDetailDrawer, CrewFilters } from "./components";
import type {
  Task as TaskType,
  CrewManagerTaskFilters,
  TaskMessage,
  ChecklistChange,
  TaskNote,
} from "./types";
import type { SubtaskRequest } from "@/app/main-dashboard/engineer/(office)/task-details/types";
import { STATUS_CONFIG, QUEUE_LABELS } from "./types";
import { getMockTasks } from "@/lib/mockData";
import toast from "react-hot-toast";

// Extended task type with approval status
interface ExtendedTask extends TaskType {
  approvalStatus?: "pending_approval" | "approved" | "rejected";
}

const defaultFilters: CrewManagerTaskFilters = {
  dateFrom: "",
  dateTo: "",
  status: "all",
  queue: "all",
};

export default function CrewTaskDetailsPage() {
  const [tasks, setTasks] = useState<ExtendedTask[]>(() => {
    const allTasks = getMockTasks();
    const approvedTasks = allTasks.filter(
      (task) =>
        (task as ExtendedTask).approvalStatus === "approved" ||
        !(task as ExtendedTask).approvalStatus,
    );
    return approvedTasks.map((task) => ({
      ...task,
      approvalStatus: (task as ExtendedTask).approvalStatus || "approved",
    })) as ExtendedTask[];
  });
  const [filters, setFilters] =
    useState<CrewManagerTaskFilters>(defaultFilters);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<{ name: string } | null>(() => {
    try {
      const stored = localStorage.getItem("selected_project");
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  // Derive selectedTask from tasks - no manual sync needed
  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );

  // Filter tasks based on filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchDateFrom =
        !filters.dateFrom || task.dueDate >= filters.dateFrom;
      const matchDateTo = !filters.dateTo || task.dueDate <= filters.dateTo;
      const matchStatus =
        filters.status === "all" || task.status === filters.status;
      const matchQueue =
        filters.queue === "all" || task.queue === filters.queue;
      return matchDateFrom && matchDateTo && matchStatus && matchQueue;
    });
  }, [tasks, filters]);

  // Calculate queue stats
  const queueStats = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.queue === "todo").length,
      inProgress: tasks.filter((t) => t.queue === "in_progress").length,
      onHold: tasks.filter((t) => t.queue === "on_hold").length,
      completed: tasks.filter((t) => t.queue === "completed").length,
      cancelled: tasks.filter((t) => t.queue === "cancelled").length,
    };
  }, [tasks]);

  // Calculate status stats
  const statusStats = useMemo(() => {
    return {
      aheadOfSchedule: tasks.filter((t) => t.status === "ahead_of_schedule")
        .length,
      onSchedule: tasks.filter((t) => t.status === "on_schedule").length,
      behindSchedule: tasks.filter((t) => t.status === "behind_schedule")
        .length,
      atRisk: tasks.filter((t) => t.status === "at_risk").length,
    };
  }, [tasks]);

  const handleOpenTask = (task: ExtendedTask) => {
    setSelectedTaskId(task.id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedTaskId(null), 300);
  };

  const handleSendMessage = (taskId: string, message: TaskMessage) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          communications: [...(t.communications || []), message],
        };
      }),
    );
    // selectedTask automatically updates via useMemo when tasks changes
  };

  // Handle task updates (progress, tracker, etc.)
  const handleTaskUpdate = (taskId: string, updates: Partial<ExtendedTask>) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          ...updates,
        };
      }),
    );
    // selectedTask automatically updates via useMemo when tasks changes
  };

  // Handle checklist change submission (crew submits changes for approval)
  const handleSubmitChecklistChanges = (
    taskId: string,
    changes: ChecklistChange[],
  ) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id !== taskId) return t;
        const existingPending =
          t.taskTracker?.pendingChanges?.filter(
            (c) => c.status !== "pending",
          ) || [];
        return {
          ...t,
          taskTracker: t.taskTracker
            ? {
                ...t.taskTracker,
                pendingChanges: [...existingPending, ...changes],
              }
            : undefined,
          trackerApprovalStatus: "pending" as const,
        };
      }),
    );
  };

  // Handle sending private notes
  const handleSendNote = (taskId: string, note: TaskNote) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id !== taskId) return t;
        const existing = t.notes || [];
        return { ...t, notes: [...existing, note] };
      }),
    );
    toast.success("Note sent");
  };

  // Handle create subtask
  const handleCreateSubtask = (taskId: string, subtask: SubtaskRequest) => {
    const updateTask = (t: ExtendedTask): ExtendedTask => {
      if (t.id !== taskId) return t;
      const existing = t.subtasks || [];
      return { ...t, subtasks: [...existing, subtask] };
    };
    setTasks((prevTasks) => prevTasks.map(updateTask));
    toast.success("Subtask created successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E3E3E3]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E3E3E3]">
      {/* Task Detail Drawer */}
      <CrewTaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSendMessage={handleSendMessage}
        onUpdate={handleTaskUpdate}
        onSubmitChanges={handleSubmitChecklistChanges}
        onSendNote={handleSendNote}
      />

      {/* Header */}
      <div className="bg-white py-7 px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#021422]">
              Task Overview â€” {project?.name || "N/A"}
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              {filteredTasks.length} of {tasks.length} approved tasks
            </p>
          </div>

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
              filters.dateFrom ||
              filters.dateTo) && (
              <span className="w-5 h-5 rounded-full bg-[#007AFF] text-white text-[10px] font-bold flex items-center justify-center">
                {
                  [
                    filters.status !== "all",
                    filters.queue !== "all",
                    !!filters.dateFrom,
                    !!filters.dateTo,
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8 space-y-6 pb-20">
        {/* Filter Panel */}
        {showFilters && (
          <CrewFilters
            filters={filters}
            onChange={setFilters}
            onClose={() => setShowFilters(false)}
            totalTasks={tasks.length}
            filteredCount={filteredTasks.length}
          />
        )}

        {/* Queue Stats Cards */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Task Queues
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                key: "todo",
                label: "To-Do",
                count: queueStats.todo,
                color: "bg-gray-100 text-gray-700",
              },
              {
                key: "inProgress",
                label: "In Progress",
                count: queueStats.inProgress,
                color: "bg-blue-100 text-blue-700",
              },
              {
key: "onHold",
          label: "On Hold",
          count: queueStats.onHold,
          color: "bg-yellow-100 text-yellow-700",
        },
        {
          key: "completed",
          label: "Completed",
          count: queueStats.completed,
          color: "bg-green-100 text-green-700",
        },
        {
          key: "cancelled",
          label: "Cancelled",
          count: queueStats.cancelled,
          color: "bg-red-100 text-red-700",
        },
            ].map((stat) => (
              <div
                key={stat.key}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {stat.label}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${stat.color}`}
                  >
                    {stat.count}
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#021422] mt-2">
                  {stat.count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Stats */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Task Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              {
                key: "aheadOfSchedule",
                label: "Ahead of Schedule",
                count: statusStats.aheadOfSchedule,
                config: STATUS_CONFIG["ahead_of_schedule"],
              },
              {
                key: "onSchedule",
                label: "On Schedule",
                count: statusStats.onSchedule,
                config: STATUS_CONFIG["on_schedule"],
              },
              {
                key: "behindSchedule",
                label: "Behind schedule",
                count: statusStats.behindSchedule,
                config: STATUS_CONFIG["behind_schedule"],
              },
              {
                key: "atRisk",
                label: "At Risk",
                count: statusStats.atRisk,
                config: STATUS_CONFIG["at_risk"],
              },
            ].map((stat) => (
              <div
                key={stat.key}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stat.config.dot}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {stat.label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#021422] mt-2">
                  {stat.count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Active Work Packages
          </h2>

          {filteredTasks.length > 0 ? (
            <div className="space-y-6">
              {filteredTasks.map((task) => (
                <CrewTaskCard
                  key={task.id}
                  task={task}
                  onOpenDetail={handleOpenTask}
                  crews={[]}
                  onSendNote={handleSendNote}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <ClipboardList size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No approved tasks found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {tasks.length === 0
                  ? "There are no approved tasks in this project yet."
                  : "No tasks match the current filters."}
              </p>
              {tasks.length > 0 && (
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="text-sm font-bold text-[#007AFF] hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
