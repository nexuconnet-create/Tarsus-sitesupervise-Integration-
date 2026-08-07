"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import type { Task } from "../types";
import {
  STATUS_CONFIG,
  QUEUE_LABELS,
  TASK_TYPE_LABELS,
  RESCHEDULE_BADGE_CONFIG,
} from "../types";
import type { Milestone } from "@/lib/types/milestone";
import QuickNoteModal from "./QuickNoteModal";

interface CrewTaskCardProps {
  task: Task;
  onOpenDetail: (task: Task) => void;
  milestones?: Milestone[];
}

const CrewTaskCard = ({
  task,
  onOpenDetail,
  milestones,
}: CrewTaskCardProps) => {
  const [showNoteModal, setShowNoteModal] = useState(false);

  const statusConfig = STATUS_CONFIG[task.status];
  const queueLabel = QUEUE_LABELS[task.queue];

  const taskTypeLabel = task.taskTracker
    ? TASK_TYPE_LABELS[task.taskTracker.taskType]
    : task.taskType
      ? TASK_TYPE_LABELS[task.taskType]
      : null;

  const enabledItems = task.taskTracker
    ? task.taskTracker.items.filter((i) => i.enabled !== false)
    : [];
  const checkedItems = enabledItems.filter((i) => i.checked);
  const trackerPercent =
    enabledItems.length > 0
      ? Math.round((checkedItems.length / enabledItems.length) * 100)
      : null;

  const displayProgress = trackerPercent ?? task.progress;

  const checklistProgress = task.taskTracker
    ? `${checkedItems.length}/${enabledItems.length} checked`
    : task.checklistItemsCount && task.checklistItemsCount > 0
      ? `${task.checklistItemsCount} items`
      : null;

  const milestoneName =
    milestones?.find((m) => m.id === task.milestoneId)?.name ?? task.milestoneName;

  return (
    <>
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col gap-6 relative hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onOpenDetail(task)}
      >
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-bold text-[#021422] bg-gray-100 px-2 py-1 rounded">
                {task.wp || task.id}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                ></span>
                {statusConfig.label}
              </span>
              <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                {queueLabel}
              </span>
              {milestoneName && (
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                  {milestoneName}
                </span>
              )}
              {task.is_rescheduled && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${RESCHEDULE_BADGE_CONFIG.bg} ${RESCHEDULE_BADGE_CONFIG.text} ${RESCHEDULE_BADGE_CONFIG.border}`}
                >
                  <RefreshCw size={10} />★ RESCHEDULED
                </span>
              )}
            </div>

            <h3 className="font-bold text-lg text-[#021422]">
              {task.title}
              {task.is_rescheduled && (
                <span className="ml-1 text-orange-500">*</span>
              )}
            </h3>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#021422]">
              <div className="flex items-center gap-2">
                <span className="font-bold">Grid {task.grid}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Finish:
                </span>
                <span className="font-bold">{task.dueDate}</span>
              </div>
              {task.location && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">|</span>
                  <span>{task.location}</span>
                </div>
              )}
            </div>

            {taskTypeLabel && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                  Tracker:
                </span>
                <span className="text-xs font-semibold bg-[#021422] text-white px-2 py-0.5 rounded">
                  {taskTypeLabel}
                </span>
                {checklistProgress && (
                  <span className="text-xs px-2 py-0.5 rounded font-medium bg-blue-100 text-blue-700">
                    {checklistProgress}
                  </span>
                )}
              </div>
            )}

            {task.assignedWorkers && task.assignedWorkers.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                  Crew:
                </span>
                <div className="flex items-center -space-x-2">
                  {task.assignedWorkers.slice(0, 4).map((worker) => (
                    <img
                      key={worker.id}
                      src={worker.avatarUrl}
                      alt={worker.name}
                      title={`${worker.name} (${worker.trade})`}
                      className="w-7 h-7 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                  {task.assignedWorkers.length > 4 && (
                    <span className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 text-xs font-bold flex items-center justify-center text-gray-600">
                      +{task.assignedWorkers.length - 4}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {task.assignedWorkers
                    .map((w) => w.trade)
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .join(", ")}
                </span>
              </div>
            ) : task.crews.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                  Crew:
                </span>
                {task.crews.map((crew) => (
                  <span
                    key={crew.id}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-[#021422] px-2.5 py-0.5 rounded-full border border-gray-200"
                  >
                    {crew.name}
                    <span className="text-gray-400 font-normal">· {crew.trade}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={
                  displayProgress >= 75
                    ? "#22c55e"
                    : displayProgress >= 40
                      ? "#eab308"
                      : "#ef4444"
                }
                strokeWidth="8"
                strokeDasharray={`${displayProgress * 2.64} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center leading-none">
              <span className="text-lg font-bold text-[#021422]">
                {displayProgress}%
              </span>
              {trackerPercent !== null && (
                <span className="text-[9px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">
                  tracker
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(task);
            }}
            className="bg-[#021422] text-white py-2.5 rounded text-xs font-bold uppercase tracking-wide hover:bg-gray-900 transition-colors"
          >
            Open Dashboard
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0070D4] text-white py-2.5 rounded text-xs font-bold uppercase tracking-wide hover:bg-blue-600 transition-colors"
          >
            Message Crew
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="bg-[#021422] text-white py-2.5 rounded text-xs font-bold uppercase tracking-wide hover:bg-gray-900 transition-colors"
          >
            View AR Scope
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNoteModal(true);
            }}
            className="bg-[#0070D4] text-white py-2.5 rounded text-xs font-bold uppercase tracking-wide hover:bg-blue-600 transition-colors"
          >
            NOTE
          </button>
        </div>
      </div>

      <QuickNoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        taskId={task.id}
      />
    </>
  );
};

export default CrewTaskCard;
