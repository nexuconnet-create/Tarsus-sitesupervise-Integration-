"use client";

import { useMemo } from "react";
import { Filter } from "lucide-react";
import SubtaskCard from "./SubtaskCard";
import type { SubtaskRequest, SubtaskStatus } from "../types";

interface SubtaskListProps {
  subtasks: SubtaskRequest[];
  filter?: "all" | SubtaskStatus;
  onApprove?: (subtaskId: string) => void;
  onReject?: (subtaskId: string, reason: string) => void;
}

export default function SubtaskList({ subtasks, filter = "all", onApprove, onReject }: SubtaskListProps) {
  const filteredSubtasks = useMemo(() => {
    if (filter === "all") return subtasks;
    return subtasks.filter((s) => s.status === filter);
  }, [subtasks, filter]);

  const stats = useMemo(() => {
    return {
      total: subtasks.length,
      pending: subtasks.filter((s) => s.status === "pending").length,
      approved: subtasks.filter((s) => s.status === "approved").length,
      rejected: subtasks.filter((s) => s.status === "rejected").length,
    };
  }, [subtasks]);

  if (subtasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Filter size={24} className="text-gray-400" />
        </div>
        <h3 className="text-sm font-bold text-gray-700 mb-1">No Subtasks Yet</h3>
        <p className="text-xs text-gray-500">
          Create a subtask to request additional resources or changes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Total:</span>
          <span className="font-bold text-[#021422]">{stats.total}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-gray-500">Pending:</span>
          <span className="font-bold text-yellow-600">{stats.pending}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-gray-500">Approved:</span>
          <span className="font-bold text-green-600">{stats.approved}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-gray-500">Rejected:</span>
          <span className="font-bold text-red-600">{stats.rejected}</span>
        </div>
      </div>

      {/* Filter indicator */}
      {filter !== "all" && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Showing:</span>
          <span className="font-medium capitalize">{filter} subtasks</span>
          <span className="text-gray-400">({filteredSubtasks.length})</span>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filteredSubtasks.map((subtask) => (
          <SubtaskCard
            key={subtask.id}
            subtask={subtask}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </div>
    </div>
  );
}
