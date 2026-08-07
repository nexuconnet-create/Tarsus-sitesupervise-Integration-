"use client";

import { Phone, User } from "lucide-react";
import type { Task } from "../types";

interface CrewPanelProps {
  task: Task;
}

export default function CrewPanel({ task }: CrewPanelProps) {
  const allWorkers = task.assignedWorkers || task.crews.flatMap((c) => c.workers);

  return (
    <div className="space-y-4">
      {task.crews.map((crew) => {
        const assignment = task.crewAssignments?.find((a) => a.crewId === crew.id);
        const workerType = assignment?.workerType;

        return (
          <div key={crew.id} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#021422] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {crew.name.split(" ").map((w) => w[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-[#021422]">{crew.name}</p>
                  <p className="text-xs text-gray-500">{crew.trade}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Workers ({crew.workers.length})</h4>
              <div className="space-y-2">
                {crew.workers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <img
                      src={worker.avatarUrl}
                      alt={worker.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#021422] truncate">{worker.name}</p>
                      <p className="text-xs text-gray-500">{worker.trade}</p>
                    </div>
                    {worker.phone && (
                      <a
                        href={`tel:${worker.phone}`}
                        className="flex items-center gap-1 text-xs font-medium text-[#007AFF] hover:underline shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone size={12} />
                        {worker.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {task.crews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <User size={40} className="mb-3" />
          <p className="text-sm font-medium">No crews assigned</p>
        </div>
      )}
    </div>
  );
}
