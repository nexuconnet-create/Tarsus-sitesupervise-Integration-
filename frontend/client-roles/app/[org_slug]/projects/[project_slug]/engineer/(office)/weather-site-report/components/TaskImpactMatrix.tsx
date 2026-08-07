"use client";

import { ClipboardList, RotateCcw, Clock } from "lucide-react";
import { TaskImpactItem } from "@/lib/mockData/weatherSiteReport";

interface Props {
  tasks: TaskImpactItem[];
  onReschedule?: (taskId: string) => void;
  onDelay?: (taskId: string, label: string) => void;
}

function StatusBadge({ status }: { status: TaskImpactItem["status"] }) {
  const styles =
    status === "At Risk"  ? "bg-red-100 text-red-700" :
    status === "Warning"  ? "bg-yellow-100 text-yellow-700" :
                            "bg-green-100 text-green-700";
  const dot =
    status === "At Risk"  ? "bg-red-500" :
    status === "Warning"  ? "bg-yellow-500" :
                            "bg-green-500";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

export default function TaskImpactMatrix({ tasks, onReschedule, onDelay }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-[#021422] text-white p-4 flex items-center gap-2">
        <ClipboardList size={16} className="text-blue-300" />
        <h3 className="font-bold text-sm">Today&apos;s Task Impact</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Task</th>
              <th className="text-left py-3 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Weather Risk</th>
              <th className="text-left py-3 px-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-sm font-semibold text-[#021422]">{task.name}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={task.status} />
                </td>
                <td className="py-3 px-4 text-xs text-gray-600">{task.weatherRisk}</td>
                <td className="py-3 px-4">
                  {task.action === "reschedule" && (
                    <button
                      onClick={() => onReschedule?.(task.id)}
                      className="flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors"
                    >
                      <RotateCcw size={11} />
                      Reschedule
                    </button>
                  )}
                  {task.action === "delay" && (
                    <button
                      onClick={() => onDelay?.(task.id, task.actionLabel ?? "Delay")}
                      className="flex items-center gap-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded transition-colors"
                    >
                      <Clock size={11} />
                      {task.actionLabel ?? "Delay"}
                    </button>
                  )}
                  {task.action === "continue" && (
                    <span className="text-xs text-green-600 font-semibold">Continue</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
