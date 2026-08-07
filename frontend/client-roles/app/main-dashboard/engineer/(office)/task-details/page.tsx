"use client";

import { useState } from "react";
import FilterBar from "./components/FilterBar";
import TaskCard from "./components/TaskCard";
import TaskDetailDrawer from "./components/TaskDetailDrawer";
import AddEditTaskModal from "./components/AddEditTaskModal";
import WorkPackageModal from "./components/WorkPackageModal";
import RequiresAttentionSection from "./components/RequiresAttentionSection";
import {
  Filter,
  MapPin,
  AlertTriangle,
  Bell,
  AlertOctagon,
  Plus,
} from "lucide-react";
import { getMockTasks, getMockCrews, getMockAlerts } from "@/lib/mockData";
import type { Task, TaskFilters, TaskTest, TestResult, SubtaskRequest, TaskNote } from "./types";
import toast from "react-hot-toast";

const defaultFilters: TaskFilters = {
  dateFrom: "",
  dateTo: "",
  status: "all",
  queue: "all",
  crews: [],
};

export default function TaskDetailsPage() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === "undefined") return [];
    return getMockTasks() as Task[];
  });
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWorkPackageOpen, setIsWorkPackageOpen] = useState(false);
  const [workPackageTask, setWorkPackageTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const project = (() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("selected_project");
    return stored ? JSON.parse(stored) : null;
  })();
  const crews = getMockCrews();
  const alerts = getMockAlerts();

  const filteredTasks = tasks.filter((task) => {
    const matchDateFrom = !filters.dateFrom || task.dueDate >= filters.dateFrom;
    const matchDateTo = !filters.dateTo || task.dueDate <= filters.dateTo;
    const matchStatus = filters.status === "all" || task.status === filters.status;
    const matchQueue = filters.queue === "all" || task.queue === filters.queue;
    const matchCrew = filters.crews.length === 0 || task.crews.some((c) => filters.crews.includes(c.id));
    return matchDateFrom && matchDateTo && matchStatus && matchQueue && matchCrew;
  });

  const queueStats = {
    todo: tasks.filter((t) => t.queue === "todo").length,
    inProgress: tasks.filter((t) => t.queue === "in_progress").length,
    onHold: tasks.filter((t) => t.queue === "on_hold").length,
    completed: tasks.filter((t) => t.queue === "completed").length,
    cancelled: tasks.filter((t) => t.queue === "cancelled").length,
  };

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
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

  const handleEditFromWorkPackage = (task: Task) => {
    handleCloseWorkPackage();
    setEditingTask(task);
    setIsAddModalOpen(true);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, ...taskData } as Task : t))
      );
      toast.success("Task updated successfully");
    } else {
      const newTask: Task = {
        id: `WP-${Math.floor(Math.random() * 900) + 100}`,
        title: taskData.title || "New Task",
        grid: taskData.grid || "",
        location: taskData.location || "",
description: taskData.description,
      startDate: taskData.startDate || "",
      dueDate: taskData.dueDate || "",
      crews: taskData.crews || [],
      crewAssignments: taskData.crewAssignments || [],
      queue: taskData.queue || "todo",
      status: taskData.status || "on_schedule",
      progress: 0,
      risk: taskData.risk,
      instructions: taskData.instructions || { documents: [] },
      resources: taskData.resources || { materials: [], equipment: [], manpower: [] },
      tests: taskData.tests,
      taskTracker: taskData.taskTracker,
      communications: [],
    };
      setTasks((prev) => [newTask, ...prev]);
      toast.success("Task created successfully");
    }
    setEditingTask(null);
    setIsAddModalOpen(false);
  };

  const handleCloseAddModal = () => {
    setEditingTask(null);
    setIsAddModalOpen(false);
  };

  const handleCreateSubtask = (taskId: string, subtask: SubtaskRequest) => {
    const updateTask = (t: Task): Task => {
      if (t.id !== taskId) return t;
      const existing = t.subtasks || [];
      return { ...t, subtasks: [...existing, subtask] };
    };
    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) {
      setSelectedTask(updateTask(selectedTask));
    }
    toast.success("Subtask created successfully");
  };

  const handleSendNote = (taskId: string, note: Partial<TaskNote> & { content: string }) => {
    const fullNote: TaskNote = {
      id: `note-${Date.now()}`,
      sender: "Current User",
      senderRole: "Engineer",
      content: note.content,
      timestamp: new Date().toISOString(),
      read: false,
      noteType: note.noteType as TaskNote["noteType"] || "update",
      requiresAttention: note.requiresAttention,
    };
    const updateTask = (t: Task): Task => {
      if (t.id !== taskId) return t;
      const existing = t.notes || [];
      return { ...t, notes: [...existing, fullNote] };
    };
    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) {
      setSelectedTask(updateTask(selectedTask));
    }
  };

  const handleResolveAttention = (taskId: string, messageId: string) => {
    const updateTask = (t: Task): Task => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        communications: (t.communications || []).map((msg) =>
          msg.id === messageId ? { ...msg, requiresAttention: false } : msg
        ),
      };
    };
    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) {
      setSelectedTask(updateTask(selectedTask));
    }
    toast.success("Item resolved");
  };

  const handleApproveSubtask = (subtaskId: string) => {
    if (!selectedTask) return;
    const updateTask = (t: Task): Task => {
      if (t.id !== selectedTask.id) return t;
      return {
        ...t,
        subtasks: t.subtasks?.map((s) =>
          s.id === subtaskId ? { ...s, status: "approved" as const, approvedBy: "Current User" } : s
        ),
      };
    };
    setTasks((prev) => prev.map(updateTask));
    setSelectedTask(updateTask(selectedTask));
    toast.success("Subtask approved");
  };

  const handleRejectSubtask = (subtaskId: string, reason: string) => {
    if (!selectedTask) return;
    const updateTask = (t: Task): Task => {
      if (t.id !== selectedTask.id) return t;
      return {
        ...t,
        subtasks: t.subtasks?.map((s) =>
          s.id === subtaskId ? { ...s, status: "rejected" as const, rejectedBy: "Current User", rejectionReason: reason } : s
        ),
      };
    };
    setTasks((prev) => prev.map(updateTask));
    setSelectedTask(updateTask(selectedTask));
    toast.success("Subtask rejected");
  };

  const handleApproveTask = (taskId: string) => {
    const updateTask = (t: Task): Task => {
      if (t.id !== taskId) return t;
      return { ...t, approvedBy: "Current User" };
    };
    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) {
      setSelectedTask(updateTask(selectedTask));
    }
    toast.success("Task approved");
  };

  const handleRejectTask = (taskId: string, reason: string) => {
    const updateTask = (t: Task): Task => {
      if (t.id !== taskId) return t;
      return { ...t, rejectedBy: "Current User", rejectionReason: reason };
    };
    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) {
      setSelectedTask(updateTask(selectedTask));
    }
    toast.success("Task rejected");
  };

  const handleApproveChecklistChanges = (taskId: string) => {
    const updateTask = (t: Task): Task => {
      if (t.id !== taskId) return t;
      if (!t.taskTracker?.pendingChanges) return t;

      const pendingChanges = t.taskTracker.pendingChanges.filter(
        (c) => c.status === "pending"
      );

      // Apply changes to items
      let updatedItems = [...t.taskTracker.items];

      for (const change of pendingChanges) {
        if (change.changeType === "added") {
          updatedItems.push(change.item);
        } else if (change.changeType === "removed") {
          updatedItems = updatedItems.filter(
            (item) => item.id !== change.item.id
          );
        }
      }

      // Mark all pending changes as approved
      const updatedPendingChanges = t.taskTracker.pendingChanges.map((c) =>
        c.status === "pending"
          ? { ...c, status: "approved" as const, approvedBy: "Current User" }
          : c
      );

      return {
        ...t,
        taskTracker: {
          ...t.taskTracker,
          items: updatedItems,
          pendingChanges: updatedPendingChanges,
        },
        trackerApprovalStatus: "approved" as const,
      };
    };

    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) {
      setSelectedTask(updateTask(selectedTask));
    }
    toast.success("Checklist changes approved");
  };

  const handleRejectChecklistChanges = (taskId: string, reason: string) => {
    const updateTask = (t: Task): Task => {
      if (t.id !== taskId) return t;
      if (!t.taskTracker?.pendingChanges) return t;

      // Mark all pending changes as rejected
      const updatedPendingChanges = t.taskTracker.pendingChanges.map((c) =>
        c.status === "pending"
          ? {
              ...c,
              status: "rejected" as const,
              rejectedBy: "Current User",
              rejectionReason: reason,
            }
          : c
      );

      return {
        ...t,
        taskTracker: {
          ...t.taskTracker,
          pendingChanges: updatedPendingChanges,
        },
        trackerApprovalStatus: "rejected" as const,
      };
    };

    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) {
      setSelectedTask(updateTask(selectedTask));
    }
    toast.success("Checklist changes rejected");
  };

  const handleAddTest = (taskId: string, test: TaskTest) => {
    const updateTask = (t: Task): Task => {
      if (t.id !== taskId) return t;
      const existing = t.tests || [];
      return { ...t, tests: [...existing, test] };
    };
    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) {
      setSelectedTask(updateTask(selectedTask));
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    const updateTask = (t: Task): Task =>
      t.id === taskId ? { ...t, ...updates } : t;
    setTasks((prev) => prev.map(updateTask));
    if (selectedTask?.id === taskId) {
      setSelectedTask(updateTask(selectedTask));
    }
    if (workPackageTask?.id === taskId) {
      setWorkPackageTask(updateTask(workPackageTask));
    }
  };

  return (
    <div className="">
      <AddEditTaskModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        task={editingTask}
        crews={crews}
        onSave={handleSaveTask}
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

      <div className="flex justify-between items-center bg-white py-7 px-4">
        <div>
          <h1 className="text-2xl font-bold text-[#021422]">
            Task Overview â€” {project ? (project as { name?: string }).name : "N/A"}
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            {filteredTasks.length} of {tasks.length} tasks
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
          {(filters.status !== "all" || filters.queue !== "all" || filters.crews.length > 0 || filters.dateFrom || filters.dateTo) && (
            <span className="w-5 h-5 rounded-full bg-[#007AFF] text-white text-[10px] font-bold flex items-center justify-center">
              {[filters.status !== "all", filters.queue !== "all", filters.crews.length > 0, !!filters.dateFrom, !!filters.dateTo].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      <div className="space-y-6 pb-20 p-4 md:p-8 pt-16 md:pt-8">
        {showFilters && (
          <FilterBar
            filters={filters}
            onChange={setFilters}
            crews={crews}
            totalTasks={tasks.length}
            filteredCount={filteredTasks.length}
          />
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#021422]">
            Project: {project ? (project as { name?: string }).name : "N/A"}
          </h2>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#001220] text-sm font-bold text-white hover:bg-gray-900 transition-colors"
          >
            <Plus size={14} />
            Add Tasks
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-[#021422] text-white p-4 text-center">
              <h3 className="font-semibold text-sm tracking-wide uppercase">Task Queues</h3>
            </div>
            <div className="p-6 space-y-4 flex-1">
              {[
                { key: "todo", label: "TO-DO", count: queueStats.todo },
                { key: "inProgress", label: "In Progress", count: queueStats.inProgress },
                { key: "onHold", label: "On Hold", count: queueStats.onHold },
                { key: "completed", label: "Completed", count: queueStats.completed },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      item.key === "completed"
                        ? "bg-green-500 border-green-500"
                        : item.key === "inProgress"
                          ? "bg-[#021422] border-[#021422]"
                          : "border-gray-300 bg-white"
                    }`}
                  />
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    {item.label} ({item.count})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative h-[250px] lg:h-auto">
            <div className="bg-[#021422] text-white p-2 absolute top-4 left-1/2 -translate-x-1/2 z-10 rounded px-4">
              <h3 className="font-semibold text-xs tracking-wide uppercase">Live Site Map</h3>
            </div>
            <div className="absolute inset-0 bg-gray-200" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-gray-400 rotate-12 bg-gray-100/50" />
              <MapPin className="absolute top-1/3 left-1/3 text-orange-500 fill-orange-500 drop-shadow-md" size={32} />
              <MapPin className="absolute bottom-1/4 right-1/4 text-orange-500 fill-orange-500 drop-shadow-md" size={32} />
            </div>
          </div>

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

        <RequiresAttentionSection
          tasks={tasks}
          onOpenTask={handleOpenTask}
          onResolve={handleResolveAttention}
        />

        <h3 className="font-bold text-lg text-[#021422] uppercase tracking-wide">Active Work Packages</h3>

        <div className="space-y-6">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpenDetail={handleOpenTask}
                onOpenWorkPackage={handleOpenWorkPackage}
                crews={crews}
                onCreateSubtask={handleCreateSubtask}
                onSendNote={handleSendNote}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Filter size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-semibold text-gray-500">No tasks match the current filters</p>
              <button
                onClick={() => setFilters(defaultFilters)}
                className="mt-3 text-xs font-bold text-[#007AFF] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onUpdate={handleUpdateTask}
        onApproveTask={handleApproveTask}
        onRejectTask={handleRejectTask}
        onApproveSubtask={handleApproveSubtask}
        onRejectSubtask={handleRejectSubtask}
        onApproveChecklistChanges={handleApproveChecklistChanges}
        onRejectChecklistChanges={handleRejectChecklistChanges}
        onSendNote={handleSendNote}
      />
    </div>
  );
}
