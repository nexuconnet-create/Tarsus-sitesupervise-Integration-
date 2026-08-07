"use client";

import { TrendingUp, TrendingDown, ExternalLink, ScanEye } from "lucide-react";

export interface TaskPerformanceItem {
  id: string | number;
  name: string;
  variancePct: number;
  status?: string;
  /** Per-task SPI/CPI (EV/PV, EV/AC using this task's own budget slice) —
   * null when the task hasn't started yet (nothing planned/spent to divide
   * by). Optional since not every caller computes these. */
  spi?: number | null;
  cpi?: number | null;
}

function taskIndex(val?: number | null): string {
  return val === undefined || val === null ? "—" : val.toFixed(2);
}

interface Props {
  topTasks: TaskPerformanceItem[];
  bottomTasks: TaskPerformanceItem[];
  onViewTask?: (id: string | number) => void;
  onNotifyTeam?: (task: TaskPerformanceItem) => void;
  onArInspect?: (task: TaskPerformanceItem) => void;
}

export default function TopBottomTasks({
  topTasks,
  bottomTasks,
  onViewTask,
  onNotifyTeam,
  onArInspect,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Top Performing */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-[#021422] text-white p-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-green-400" />
          <h3 className="font-bold text-sm">Top Performing Tasks</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {topTasks.length === 0 ? (
            <p className="p-6 text-sm text-gray-400 text-center">
              No task data available.
            </p>
          ) : (
            topTasks.map((task, i) => (
              <div key={task.id} className="p-4 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#021422] truncate">{task.name}</p>
                  {task.status && (
                    <p className="text-xs text-gray-400">{task.status}</p>
                  )}
                  {(task.spi !== undefined || task.cpi !== undefined) && (
                    <p className="text-[11px] text-gray-400">
                      SPI {taskIndex(task.spi)} · CPI {taskIndex(task.cpi)}
                    </p>
                  )}
                </div>
                <span className="text-sm font-bold text-green-600 flex-shrink-0">
                  +{task.variancePct.toFixed(0)}% ahead
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Performing */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-red-700 text-white p-4 flex items-center gap-2">
          <TrendingDown size={16} className="text-red-200" />
          <h3 className="font-bold text-sm">Bottom Performing Tasks</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {bottomTasks.length === 0 ? (
            <p className="p-6 text-sm text-gray-400 text-center">
              No issues found — all tasks on track.
            </p>
          ) : (
            bottomTasks.map((task, i) => (
              <div key={task.id} className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#021422] truncate">{task.name}</p>
                    {task.status && (
                      <p className="text-xs text-gray-400">{task.status}</p>
                    )}
                    {(task.spi !== undefined || task.cpi !== undefined) && (
                      <p className="text-[11px] text-gray-400">
                        SPI {taskIndex(task.spi)} · CPI {taskIndex(task.cpi)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-red-600 flex-shrink-0">
                    -{task.variancePct.toFixed(0)}% behind
                  </span>
                </div>
                <div className="flex gap-2 pl-9">
                  <button
                    onClick={() => onViewTask?.(task.id)}
                    className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition-colors"
                  >
                    <ExternalLink size={11} />
                    View Details
                  </button>
                  <button
                    onClick={() => onNotifyTeam?.(task)}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-[#021422] hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ExternalLink size={11} />
                    Engineer Review Required
                  </button>
                  <button
                    onClick={() => onArInspect?.(task)}
                    className="flex items-center gap-1 text-xs bg-[#0070D4] hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors"
                  >
                    <ScanEye size={11} />
                    AR Inspect
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
