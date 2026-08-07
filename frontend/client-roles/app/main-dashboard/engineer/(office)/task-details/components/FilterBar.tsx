"use client";

import { X, RotateCcw } from "lucide-react";
import type { TaskFilters, Crew } from "../types";

interface FilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  crews: Crew[];
  totalTasks: number;
  filteredCount: number;
}

const defaultFilters: TaskFilters = {
  dateFrom: "",
  dateTo: "",
  status: "all",
  queue: "all",
  crews: [],
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

export default function FilterBar({
  filters,
  onChange,
  crews,
  totalTasks,
  filteredCount,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.status !== "all" ||
    filters.queue !== "all" ||
    filters.crews.length > 0;

  const activeCount = [
    filters.dateFrom,
    filters.dateTo,
    filters.status !== "all",
    filters.queue !== "all",
    filters.crews.length > 0,
  ].filter(Boolean).length;

  const handleReset = () => {
    onChange(defaultFilters);
  };

  const handleRemoveFilter = (key: keyof TaskFilters) => {
    if (key === "crews") {
      onChange({ ...filters, crews: [] });
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

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
          placeholder="From"
        />

        <span className="text-gray-400 text-xs">â€”</span>

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
        </div>
      )}
    </div>
  );
}
