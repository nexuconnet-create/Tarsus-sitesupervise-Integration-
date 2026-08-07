"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { X, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { Task, QueueType } from "../types";

interface TaskQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  initialFilter?: QueueFilter;
}

type QueueFilter = "all" | "uncompleted" | QueueType;

const QUEUE_FILTERS: { key: QueueFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "todo", label: "TO-DO" },
  { key: "in_progress", label: "In Progress" },
  { key: "on_hold", label: "On Hold" },
  { key: "completed", label: "Completed" },
  { key: "uncompleted", label: "Uncompleted" },
  { key: "cancelled", label: "Cancelled" },
];

import toast from "react-hot-toast";

export default function TaskQueueModal({
  isOpen,
  onClose,
  tasks,
  onUpdateTask,
  initialFilter = "all",
}: TaskQueueModalProps) {
  const [filter, setFilter] = useState<QueueFilter>(initialFilter);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setFilter(initialFilter);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, initialFilter]);

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.queue === filter);
  }, [tasks, filter]);

  const queueCounts = useMemo(() => ({
    all: tasks.length,
    uncompleted: tasks.filter((t) => t.queue === "uncompleted").length,
    todo: tasks.filter((t) => t.queue === "todo").length,
    in_progress: tasks.filter((t) => t.queue === "in_progress").length,
    on_hold: tasks.filter((t) => t.queue === "on_hold").length,
    completed: tasks.filter((t) => t.queue === "completed").length,
    cancelled: tasks.filter((t) => t.queue === "cancelled").length,
  }), [tasks]);

  const handleQueueToggle = (taskId: string, newQueue: QueueType) => {
    onUpdateTask(taskId, { queue: newQueue });
    toast.success("Task queue updated");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-10"
      >
        <div className="shrink-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <h2 className="text-lg font-bold text-[#021422]">Task Queue</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-[#021422]" />
          </button>
        </div>

        <div className="shrink-0 px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2 overflow-x-auto">
            {QUEUE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  filter === f.key
                    ? "bg-[#021422] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.label} ({queueCounts[f.key]})
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <p className="text-sm font-medium">No tasks found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="w-[8%] px-3 py-3 text-left text-[10px] font-bold uppercase text-gray-500 tracking-wider">Task ID</th>
                  <th className="w-[35%] px-3 py-3 text-left text-[10px] font-bold uppercase text-gray-500 tracking-wider">Title</th>
                  <th className="w-[22%] px-3 py-3 text-left text-[10px] font-bold uppercase text-gray-500 tracking-wider">Location</th>
                  <th className="w-[25%] px-3 py-3 text-left text-[10px] font-bold uppercase text-gray-500 tracking-wider">Crews</th>
                  <th className="w-[10%] px-1 py-3 text-center text-[10px] font-bold uppercase text-gray-500 tracking-wider">TO-DO</th>
                  <th className="w-[10%] px-1 py-3 text-center text-[10px] font-bold uppercase text-gray-500 tracking-wider">In Progress</th>
                  <th className="w-[10%] px-1 py-3 text-center text-[10px] font-bold uppercase text-gray-500 tracking-wider">On Hold</th>
                  <th className="w-[10%] px-1 py-3 text-center text-[10px] font-bold uppercase text-gray-500 tracking-wider">Completed</th>
                  <th className="w-[10%] px-1 py-3 text-center text-[10px] font-bold uppercase text-gray-500 tracking-wider">Uncompleted</th>
                  <th className="w-[10%] px-1 py-3 text-center text-[10px] font-bold uppercase text-gray-500 tracking-wider">Cancelled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                    <td className="px-3 py-3">
                      <span className="text-xs font-semibold text-[#021422]">{task.id}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs text-[#021422] line-clamp-2 leading-tight">{task.title}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs text-gray-600 line-clamp-2">{task.location}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs text-gray-700 line-clamp-2">
                        {task.crews.map((c) => c.name).join(", ") || "—"}
                      </span>
                    </td>
                    {(["todo", "in_progress", "on_hold", "completed", "uncompleted", "cancelled"] as QueueType[]).map((q) => (
                      <td key={q} className="px-1 py-3 text-center">
                        <button
                          onClick={() => handleQueueToggle(task.id, q)}
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all mx-auto ${
                            task.queue === q
                              ? "bg-[#007AFF] border-[#007AFF] text-white"
                              : "border-gray-300 hover:border-[#007AFF]"
                          }`}
                        >
                          {task.queue === q && <Check size={8} />}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
