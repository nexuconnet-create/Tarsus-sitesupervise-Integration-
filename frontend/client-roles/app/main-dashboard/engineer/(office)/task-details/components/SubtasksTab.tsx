"use client";

import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import SubtaskList from "./SubtaskList";
import CreateSubtaskModal from "./CreateSubtaskModal";
import type { Task, SubtaskRequest, SubtaskStatus } from "../types";

interface SubtasksTabProps {
  task: Task;
  onCreateSubtask: (subtask: SubtaskRequest) => void;
  onApproveSubtask: (subtaskId: string) => void;
  onRejectSubtask: (subtaskId: string, reason: string) => void;
}

export default function SubtasksTab({
  task,
  onCreateSubtask,
  onApproveSubtask,
  onRejectSubtask,
}: SubtasksTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | SubtaskStatus>("all");

  const subtasks = task.subtasks || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-[#021422] uppercase tracking-wider">
            Subtasks
          </h3>
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
            {subtasks.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | SubtaskStatus)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Create Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#021422] text-white text-xs font-bold hover:bg-gray-900 transition-colors"
          >
            <Plus size={14} />
            Create Subtask
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs text-gray-700">
          <strong className="text-[#021422]">Create subtasks</strong> to request additional resources, crew, or timeline changes for this task.
          Subtasks require approval before resources are allocated.
        </p>
      </div>

      {/* Subtask List */}
      <SubtaskList
        subtasks={subtasks}
        filter={filter}
        onApprove={onApproveSubtask}
        onReject={onRejectSubtask}
      />

      {/* Create Modal */}
      <CreateSubtaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        taskId={task.id}
        crews={task.crews}
        onCreate={onCreateSubtask}
      />
    </div>
  );
}
