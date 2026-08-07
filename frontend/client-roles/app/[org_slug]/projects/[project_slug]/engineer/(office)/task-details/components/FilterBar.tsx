"use client";

/* eslint-disable react-hooks/set-state-in-effect -- synchronize the search draft with external filters. */

import { useState, useEffect } from "react";
import { X, RotateCcw, Search } from "lucide-react";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import type { TaskFilters, Crew, TaskType } from "../types";
import type { Milestone } from "@/lib/types/milestone";
import { TASK_TYPE_LABELS } from "../types";

interface FilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  crews: Crew[];
  milestones: Milestone[];
  totalTasks: number;
  filteredCount: number;
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

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "ahead_of_schedule", label: "Ahead of Schedule" },
  { value: "on_schedule", label: "On Schedule" },
  { value: "behind_schedule", label: "Behind Schedule" },
  { value: "at_risk", label: "At Risk" },
];

const queueOptions = [
  { value: "all", label: "All Queues" },
  { value: "todo", label: "TO-DO" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_hold", label: "On Hold" },
  { value: "uncompleted", label: "Uncompleted" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

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

export default function FilterBar({
  filters,
  onChange,
  crews,
  milestones,
  totalTasks,
  filteredCount,
}: FilterBarProps) {
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

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.status !== "all" ||
    filters.queue !== "all" ||
    filters.crews.length > 0 ||
    filters.milestone !== "all" ||
    filters.search ||
    filters.taskType !== "all" ||
    filters.ordering;

  const activeCount = [
    filters.dateFrom,
    filters.dateTo,
    filters.status !== "all",
    filters.queue !== "all",
    filters.crews.length > 0,
    filters.milestone !== "all",
    !!filters.search,
    filters.taskType !== "all",
    !!filters.ordering,
  ].filter(Boolean).length;

  const handleReset = () => {
    setSearchInput("");
    onChange(defaultFilters);
  };

  const handleRemoveFilter = (key: keyof TaskFilters) => {
    if (key === "crews") {
      onChange({ ...filters, crews: [] });
    } else if (key === "milestone") {
      onChange({ ...filters, milestone: "all" });
    } else if (key === "search") {
      setSearchInput("");
      onChange({ ...filters, search: "" });
    } else if (key === "taskType") {
      onChange({ ...filters, taskType: "all" });
    } else if (key === "ordering") {
      onChange({ ...filters, ordering: "" });
    } else {
      onChange({
        ...filters,
        [key]: key === "status" || key === "queue" ? "all" : "",
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold uppercase text-gray-500 tracking-wider whitespace-nowrap">
          Filters ({filteredCount}/{totalTasks}):
        </span>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tasks..."
            className="border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent w-48"
          />
        </div>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
          placeholder="From"
        />

        <span className="text-gray-400 text-xs">—</span>

        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
          placeholder="To"
        />

        <select
          value={filters.status}
          onChange={(e) =>
            onChange({
              ...filters,
              status: e.target.value as TaskFilters["status"],
            })
          }
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.queue}
          onChange={(e) =>
            onChange({
              ...filters,
              queue: e.target.value as TaskFilters["queue"],
            })
          }
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white"
        >
          {queueOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.taskType}
          onChange={(e) =>
            onChange({
              ...filters,
              taskType: e.target.value as TaskType | "all",
            })
          }
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white"
        >
          {taskTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.crews.length === 1 ? filters.crews[0] : "all"}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "all") {
              onChange({ ...filters, crews: [] });
            } else {
              onChange({ ...filters, crews: [val] });
            }
          }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white"
        >
          <option value="all">All Crews</option>
          {crews.map((crew) => (
            <option key={crew.id} value={crew.id}>
              {crew.name}
            </option>
          ))}
        </select>

        <select
          value={filters.milestone}
          onChange={(e) => onChange({ ...filters, milestone: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white"
        >
          <option value="all">All Milestones</option>
          {milestones.map((ms) => (
            <option key={ms.id} value={ms.id}>
              {ms.name}
            </option>
          ))}
        </select>

        <select
          value={filters.ordering}
          onChange={(e) => onChange({ ...filters, ordering: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white"
        >
          {orderingOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-semibold text-[#007AFF] bg-[#007AFF]/10 px-2 py-1 rounded-full">
              {activeCount} active
            </span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#021422] transition-colors"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-medium">Active:</span>
          {filters.search && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              Search: {filters.search}
              <button
                onClick={() => handleRemoveFilter("search")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {filters.dateFrom && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              From: {filters.dateFrom}
              <button
                onClick={() => handleRemoveFilter("dateFrom")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {filters.dateTo && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              To: {filters.dateTo}
              <button
                onClick={() => handleRemoveFilter("dateTo")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {filters.status !== "all" && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full capitalize">
              {filters.status.replace("_", " ")}
              <button
                onClick={() => handleRemoveFilter("status")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {filters.queue !== "all" && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full capitalize">
              {filters.queue.replace("_", " ")}
              <button
                onClick={() => handleRemoveFilter("queue")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {filters.taskType !== "all" && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full capitalize">
              {TASK_TYPE_LABELS[filters.taskType as TaskType] || filters.taskType}
              <button
                onClick={() => handleRemoveFilter("taskType")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {filters.crews.map((crewId) => (
            <span
              key={crewId}
              className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {crews.find((c) => c.id === crewId)?.name || crewId}
              <button
                onClick={() =>
                  onChange({
                    ...filters,
                    crews: filters.crews.filter((id) => id !== crewId),
                  })
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          {filters.milestone !== "all" && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
              {milestones.find((m) => m.id === filters.milestone)?.name || filters.milestone}
              <button
                onClick={() => handleRemoveFilter("milestone")}
                className="text-blue-400 hover:text-blue-600"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {filters.ordering && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {orderingOptions.find((o) => o.value === filters.ordering)?.label || filters.ordering}
              <button
                onClick={() => handleRemoveFilter("ordering")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={10} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
