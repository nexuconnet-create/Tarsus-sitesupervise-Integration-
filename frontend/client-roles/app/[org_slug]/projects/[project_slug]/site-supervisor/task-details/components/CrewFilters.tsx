"use client";

/* eslint-disable react-hooks/set-state-in-effect -- synchronize the search draft with external filters. */

import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import type { CrewManagerTaskFilters, TaskStatus, QueueType, TaskType } from "../types";
import { TASK_TYPE_LABELS } from "../types";

interface CrewFiltersProps {
  filters: CrewManagerTaskFilters;
  onChange: (filters: CrewManagerTaskFilters) => void;
  onClose: () => void;
  totalTasks: number;
  filteredCount: number;
}

const taskTypeOptions = [
  { value: "all", label: "All Types" },
  ...Object.entries(TASK_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const orderingOptions = [
  { value: "", label: "Default" },
  { value: "due_date", label: "Due Date (earliest)" },
  { value: "-due_date", label: "Due Date (latest)" },
  { value: "title", label: "Title (A-Z)" },
  { value: "-created_at", label: "Created (newest)" },
  { value: "status", label: "Status" },
];

const CrewFilters = ({
  filters,
  onChange,
  onClose,
  totalTasks,
  filteredCount,
}: CrewFiltersProps) => {
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch, filters, onChange]);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

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
    setSearchInput("");
    onChange({
      dateFrom: "",
      dateTo: "",
      status: "all",
      queue: "all",
      crews: [],
      milestone: "",
      search: "",
      taskType: "all",
      ordering: "",
    });
  };

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.queue !== "all" ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.crews.length > 0 ||
    filters.milestone ||
    filters.search ||
    filters.taskType !== "all" ||
    filters.ordering;

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
        {/* Search */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Search
          </label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
            />
          </div>
        </div>

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

        {/* Task Type Filter */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Task Type
          </label>
          <select
            value={filters.taskType}
            onChange={(e) =>
              onChange({ ...filters, taskType: e.target.value as TaskType | "all" })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white"
          >
            {taskTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ordering Filter */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Sort By
          </label>
          <select
            value={filters.ordering}
            onChange={(e) => onChange({ ...filters, ordering: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white"
          >
            {orderingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CrewFilters;
