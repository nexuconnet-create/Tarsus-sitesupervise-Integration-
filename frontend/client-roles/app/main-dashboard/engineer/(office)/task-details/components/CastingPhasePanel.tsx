"use client";

import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import type { CastingPhase } from "../types";
import { CASTING_STAGES, CASTING_STAGE_LABELS } from "../types";

interface CastingPhasePanelProps {
  castingPhase: CastingPhase | undefined;
}

export default function CastingPhasePanel({ castingPhase }: CastingPhasePanelProps) {
  if (!castingPhase) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Clock size={40} className="mb-3" />
        <p className="text-sm font-medium">No casting phase tracked for this task</p>
      </div>
    );
  }

  const currentIndex = CASTING_STAGES.indexOf(castingPhase.stage);
  const isCompleted = castingPhase.stage === "completed";

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">Start Date</p>
            <p className="text-sm font-semibold text-[#021422]">{castingPhase.startDate}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">Est. Completion</p>
            <p className="text-sm font-semibold text-[#021422]">{castingPhase.estimatedCompletion}</p>
          </div>
          {castingPhase.actualCompletion && (
            <div>
              <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">Actual Completion</p>
              <p className="text-sm font-semibold text-green-600">{castingPhase.actualCompletion}</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Stage Progress</span>
          <span className="text-xs font-bold text-[#021422]">{CASTING_STAGE_LABELS[castingPhase.stage]}</span>
        </div>

        <div className="relative flex items-center">
          {CASTING_STAGES.map((stage, idx) => {
            const isPast = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isLast = idx === CASTING_STAGES.length - 1;

            return (
              <div key={stage} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isPast || isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isCurrent
                        ? "bg-[#0070D4] border-[#0070D4] text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {isPast || isCompleted ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold mt-1.5 text-center leading-tight ${
                      isCurrent ? "text-[#0070D4] font-bold" : "text-gray-400"
                    }`}
                  >
                    {CASTING_STAGE_LABELS[stage].split(" ").map((w, i) => (
                      <span key={i}>
                        {w}
                        <br />
                      </span>
                    ))}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={`flex-1 h-0.5 mx-1 ${
                      isPast || isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {castingPhase.reminders.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Reminders & Milestones</h4>
          <div className="space-y-2">
            {castingPhase.reminders.map((reminder, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  reminder.isOverdue
                    ? "bg-red-50 border-red-200"
                    : reminder.isUpcoming
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-white border-gray-100"
                }`}
              >
                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  reminder.isOverdue
                    ? "bg-red-100"
                    : reminder.isUpcoming
                    ? "bg-yellow-100"
                    : "bg-gray-100"
                }`}>
                  {reminder.isOverdue ? (
                    <AlertTriangle size={12} className="text-red-600" />
                  ) : reminder.isUpcoming ? (
                    <Clock size={12} className="text-yellow-600" />
                  ) : (
                    <CheckCircle2 size={12} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${
                    reminder.isOverdue ? "text-red-700" : reminder.isUpcoming ? "text-yellow-700" : "text-gray-700"
                  }`}>
                    {reminder.label}
                  </p>
                  <p className="text-xs text-gray-400">{reminder.dueDate}</p>
                </div>
                {reminder.isOverdue && (
                  <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Overdue</span>
                )}
                {reminder.isUpcoming && !reminder.isOverdue && (
                  <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">Soon</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
