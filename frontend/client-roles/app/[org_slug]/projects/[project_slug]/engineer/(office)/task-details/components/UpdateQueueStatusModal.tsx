"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import type { Task, QueueType, TaskStatus } from "../types";

interface UpdateQueueStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onSave: (taskId: string, updates: { queue: QueueType; status: TaskStatus }) => void;
}

export default function UpdateQueueStatusModal({
  isOpen,
  onClose,
  task,
  onSave,
}: UpdateQueueStatusModalProps) {
  const [queue, setQueue] = useState<QueueType>(task.queue);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQueue(task.queue);
    setStatus(task.status);
    setError(null);
  }, [task.queue, task.status]);

  if (!isOpen) return null;

  const isConcreteTask = task.taskType === "concrete";
  const hasTestResults = task.concreteTestResultsUploaded === true;
  const isAttemptingCompletion = queue === "completed";

  const handleSave = () => {
    if (isConcreteTask && isAttemptingCompletion && !hasTestResults) {
      setError("Concrete test results must be uploaded before marking the task as completed.");
      return;
    }
    onSave(task.id, { queue, status });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#021422]">Update Queue & Status</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-[#021422]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Concrete Task Warning */}
          {isConcreteTask && !hasTestResults && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-semibold">Concrete Task</p>
                <p className="text-xs mt-1">Test results must be uploaded before this task can be marked as completed.</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
              Queue
            </label>
            <select
              value={queue}
              onChange={(e) => setQueue(e.target.value as QueueType)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
            >
              <option value="todo">TO-DO</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="uncompleted">Uncompleted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
            >
              <option value="ahead_of_schedule">Ahead of Schedule</option>
              <option value="on_schedule">On Schedule</option>
              <option value="behind_schedule">Behind Schedule</option>
              <option value="at_risk">At Risk</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg bg-[#021422] text-white text-sm font-bold hover:bg-gray-900 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
