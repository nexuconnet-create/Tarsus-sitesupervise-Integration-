"use client";

import React, { useState } from "react";
import { Search, Plus, Trash2, Pencil, Loader2, Users, RotateCcw } from "lucide-react";
import { CREW_TRADES, POOL_WORKER_STATUSES } from "@/lib/services/crewService";
import type { PoolWorkerDetail } from "@/lib/services/crewService";

interface PoolWorkersSectionProps {
  poolWorkers: PoolWorkerDetail[];
  loading: boolean;
  onRegister: () => void;
  onEdit: (worker: PoolWorkerDetail) => void;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
  deactivatingId?: string;
  reactivatingId?: string;
}

function tradeLabel(value: string): string {
  return CREW_TRADES.find((t) => t.value === value)?.label ?? value;
}

function statusLabel(value: string): string {
  return POOL_WORKER_STATUSES.find((s) => s.value === value)?.label ?? value;
}

const STATUS_COLORS: Record<string, string> = {
  on_site: "bg-green-100 text-green-700",
  off_site: "bg-gray-100 text-gray-600",
  on_leave: "bg-amber-100 text-amber-700",
  standby: "bg-blue-100 text-blue-700",
  suspended: "bg-red-100 text-red-700",
};

export default function PoolWorkersSection({
  poolWorkers,
  loading,
  onRegister,
  onEdit,
  onDeactivate,
  onReactivate,
  deactivatingId,
  reactivatingId,
}: PoolWorkersSectionProps) {
  const [filterTrade, setFilterTrade] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = poolWorkers.filter((w) => {
    if (filterTrade !== "all" && w.trade !== filterTrade) return false;
    if (filterStatus !== "all" && w.status !== filterStatus) return false;
    if (filterActive === "active" && !w.is_active) return false;
    if (filterActive === "inactive" && w.is_active) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !w.first_name?.toLowerCase().includes(q) &&
        !w.last_name?.toLowerCase().includes(q) &&
        !w.worker_code?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">
        Pool Workers
      </h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-500">Filter:</span>
          </div>
          <select
            value={filterTrade}
            onChange={(e) => setFilterTrade(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
          >
            <option value="all">All Trades</option>
            {CREW_TRADES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
          >
            <option value="all">All Statuses</option>
            {POOL_WORKER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as "all" | "active" | "inactive")}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
          >
            <option value="all">Active & Inactive</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search pool workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            />
          </div>
          <button
            onClick={onRegister}
            className="px-4 py-2 bg-[#021422] text-white text-xs font-bold uppercase rounded shadow hover:bg-gray-900 transition-colors flex items-center gap-2"
          >
            <Plus size={14} />
            Register Worker
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 size={22} className="animate-spin mr-2" />
            <span>Loading pool workers…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Worker</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Code</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Trade</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Location</th>
                  <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                      {poolWorkers.length === 0
                        ? "No pool workers yet. Register your first worker."
                        : "No workers match your filters."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((w) => (
                    <tr
                      key={w.id}
                      className={`border-b border-gray-100 transition-colors ${
                        w.is_active ? "hover:bg-gray-50" : "bg-gray-50 opacity-70"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {w.profile_picture_url ? (
                            <img src={w.profile_picture_url} alt={`${w.first_name} ${w.last_name}`} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                              {w.first_name?.[0]}{w.last_name?.[0]}
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-medium text-[#021422]">{w.first_name} {w.last_name}</span>
                            {!w.is_active && (
                              <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-red-100 text-red-600">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{w.worker_code || "—"}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{tradeLabel(w.trade)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[w.status] || "bg-gray-100 text-gray-600"}`}>
                          {statusLabel(w.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{w.current_location || "—"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(w)}
                            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                            title="Edit worker"
                          >
                            <Pencil size={14} className="text-gray-400 hover:text-blue-600" />
                          </button>
                          {w.is_active ? (
                            <button
                              onClick={() => onDeactivate(w.id)}
                              disabled={deactivatingId === w.id}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Deactivate worker"
                            >
                              {deactivatingId === w.id ? (
                                <Loader2 size={14} className="animate-spin text-red-500" />
                              ) : (
                                <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => onReactivate(w.id)}
                              disabled={reactivatingId === w.id}
                              className="p-1.5 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                              title="Reactivate worker"
                            >
                              {reactivatingId === w.id ? (
                                <Loader2 size={14} className="animate-spin text-green-600" />
                              ) : (
                                <RotateCcw size={14} className="text-gray-400 hover:text-green-600" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Showing {filtered.length} of {poolWorkers.length} pool workers
          </span>
        </div>
      </div>
    </div>
  );
}
