"use client";

import { X } from "lucide-react";
import type { CrewManagerTaskFilters, TaskStatus, QueueType } from "../types";

interface CrewFiltersProps {
  filters: CrewManagerTaskFilters;
  onChange: (filters: CrewManagerTaskFilters) => void;
  onClose: () => void;
  totalTasks: number;
  filteredCount: number;
}

const CrewFilters = ({
  filters,
  onChange,
  onClose,
  totalTasks,
  filteredCount,
}: CrewFiltersProps) => {
  const handleStatusChange = (status: TaskStatus | "all") => {
    onChange({ ...filters, status });
  };

  const handleQueueChange = (queue: QueueType | "all") => {
    onChange({ ...filters, queue });
  };

  const handleDateChange = (field: "dateFrom" | "dateTo", value: string) => {
    onChange({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    onChange({
      dateFrom: "",
      dateTo: "",
      status: "all",
      queue: "all",
    });
  };

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.queue !== "all" ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-[#021422]">Filter Tasks</h3>
          <p className="text-xs text-gray-500 mt-1">
            Showing {filteredCount} of {totalTasks} tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#007AFF] hover:underline font-medium"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Range */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleDateChange("dateFrom", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleDateChange("dateTo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All" },
              {
                value: "ahead_of_schedule",
                label: "Ahead of Schedule",
                color: "bg-blue-100 text-blue-700",
              },
              {
                value: "on_schedule",
                label: "On Schedule",
                color: "bg-green-100 text-green-700",
              },
              {
                value: "behind_schedule",
                label: "Behind",
                color: "bg-yellow-100 text-yellow-700",
              },
              {
                value: "at_risk",
                label: "At Risk",
                color: "bg-red-100 text-red-700",
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleStatusChange(option.value as TaskStatus | "all")
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filters.status === option.value
                    ? option.color
                      ? `${option.color} ring-2 ring-offset-1 ring-gray-200`
                      : "bg-[#021422] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Queue Filter */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Queue
          </label>
          <div className="flex flex-wrap gap-2">
            {[
{ value: "all", label: "All Queues" },
          { value: "todo", label: "To-Do" },
          { value: "in_progress", label: "In Progress" },
          { value: "on_hold", label: "On Hold" },
          { value: "uncompleted", label: "Uncompleted" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleQueueChange(option.value as QueueType | "all")
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filters.queue === option.value
                    ? "bg-[#021422] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewFilters;
