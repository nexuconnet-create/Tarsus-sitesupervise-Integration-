"use client";

import {
  Clock,
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Pause,
  Search,
} from "lucide-react";
import type { Task } from "../types";
import { STATUS_CONFIG, QUEUE_LABELS } from "../types";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/dateUtils";

interface CrewProgressTabProps {
  task: Task;
  onUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

const CrewProgressTab = ({ task, onUpdate }: CrewProgressTabProps) => {
  const statusConfig = STATUS_CONFIG[task.status];
  const queueLabel = QUEUE_LABELS[task.queue];

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!task.dueDate) return null;
    const due = new Date(task.dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  const handleAction = (action: "hold" | "inspection" | "complete") => {
    const updates: Partial<Task> = {};
    
    if (action === "hold") {
      updates.queue = "on_hold";
    } else if (action === "inspection") {
      toast.success("Inspection request submitted");
      return;
} else if (action === "complete") {
  updates.queue = "completed";
  updates.progress = 100;
      updates.status = "on_schedule";
    }
    
    if (onUpdate) {
      onUpdate(task.id, updates);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Progress Overview Card */}
      <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#021422]">Task Progress</h3>
          <TrendingUp size={24} className="text-[#007AFF]" />
        </div>

        <div className="flex items-end gap-2 mb-2">
          <span className="text-5xl font-bold text-[#021422]">{task.progress}</span>
          <span className="text-2xl text-gray-500 mb-2">%</span>
        </div>

        <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#007AFF] to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${task.progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>Started</span>
          <span>In Progress</span>
          <span>Completed</span>
        </div>
      </div>

      {/* Status & Queue */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-[#021422]" />
            <h4 className="font-semibold text-[#021422]">Status</h4>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-[#021422]" />
            <h4 className="font-semibold text-[#021422]">Queue</h4>
          </div>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
            {queueLabel}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleAction("hold")}
          className="bg-[#021422] text-white py-4 rounded-xl font-semibold text-sm hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
        >
          <Pause size={16} />
          Mark on Hold
        </button>
        <button
          onClick={() => handleAction("inspection")}
          className="bg-[#007AFF] text-white py-4 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Search size={16} />
          Request Inspection
        </button>
        <button
          onClick={() => handleAction("complete")}
          className="bg-green-600 text-white py-4 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={16} />
          Mark Complete
        </button>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-[#021422]" />
          <h4 className="font-semibold text-[#021422]">Timeline</h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#021422]">Start Date</p>
              <p className="text-sm text-gray-500">
                {formatDate(task.startDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#021422]">Finish Date</p>
              <p className="text-sm text-gray-500">
                {formatDate(task.dueDate)}
              </p>
              {daysRemaining !== null && (
                <p
                  className={`text-xs mt-1 ${
                    daysRemaining < 0
                      ? "text-red-500"
                      : daysRemaining <= 3
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {daysRemaining < 0
                    ? `${Math.abs(daysRemaining)} days overdue`
                    : daysRemaining === 0
                    ? "Due today"
                    : `${daysRemaining} days remaining`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {task.risk && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-orange-500" />
            <h4 className="font-semibold text-[#021422]">Risk Factor</h4>
          </div>

          <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
            <p className="text-sm text-orange-700">{task.risk}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewProgressTab;
