"use client";

import { useState } from "react";
import { Camera, Pause, CheckCircle2, Search, ListChecks } from "lucide-react";
import type { Task } from "../types";
import toast from "react-hot-toast";

interface ProgressTabProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export default function ProgressTab({ task, onUpdate }: ProgressTabProps) {
  // Determine if progress is checklist-driven or manual
  const hasChecklist = !!task.taskTracker && (task.taskTracker.items?.filter(i => i.enabled !== false).length ?? 0) > 0;
  const checklistProgress = hasChecklist
    ? (() => {
        const enabled = task.taskTracker!.items.filter(i => i.enabled !== false);
        const checked = enabled.filter(i => i.checked).length;
        return enabled.length > 0 ? Math.round((checked / enabled.length) * 100) : 0;
      })()
    : null;

  const [progress, setProgress] = useState(task.progress);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.progress.toString());

  const displayProgress = checklistProgress ?? progress;

  const handleSaveProgress = () => {
    if (hasChecklist) return; // checklist drives progress — no manual override
    const val = Math.max(0, Math.min(100, parseInt(draft) || 0));
    setProgress(val);
    setEditing(false);
    onUpdate(task.id, { progress: val });
    toast.success(`Progress updated to ${val}%`);
  };

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
      setProgress(100);
    }
    onUpdate(task.id, updates);
  };

  const progressColor =
    displayProgress >= 75
      ? "bg-green-500"
      : displayProgress >= 40
        ? "bg-yellow-500"
        : "bg-red-500";

  const progressTextColor =
    displayProgress >= 75
      ? "text-green-600"
      : displayProgress >= 40
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="space-y-8 flex flex-col h-full justify-center">

      {/* Checklist-driven notice */}
      {hasChecklist && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
          <ListChecks size={15} className="text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700 font-medium">
            Progress is automatically calculated from the Task Tracker checklist.
            Check items in the <strong>Task Tracker</strong> tab to advance progress.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <span className="text-sm font-semibold text-[#021422] whitespace-nowrap">
          Progress:
        </span>
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            {/* Checklist-driven: read-only display */}
            {hasChecklist ? (
              <span className={`text-2xl font-bold ${progressTextColor}`}>
                {displayProgress}%
              </span>
            ) : editing ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  autoFocus
                  onBlur={handleSaveProgress}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveProgress()}
                />
                <span className="text-sm text-gray-400">%</span>
              </div>
            ) : (
              <button
                onClick={() => { setDraft(progress.toString()); setEditing(true); }}
                className={`text-2xl font-bold ${progressTextColor} hover:underline`}
              >
                {displayProgress}%
              </button>
            )}
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressColor} rounded-full transition-all duration-500`}
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        {/* Only show Capture Progress button for tasks without a checklist */}
        {!hasChecklist && (
          <button
            onClick={() => { setDraft(progress.toString()); setEditing(true); }}
            className="shrink-0 px-4 py-2 bg-[#007AFF] text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-100"
          >
            <Camera size={14} />
            Capture Progress
          </button>
        )}
      </div>

      <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
          Task Complete
        </button>
      </div>

      <div className="pt-4 bg-gray-50 rounded-xl p-4 space-y-2">
        <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">
          Progress History
        </h4>
        {[
          {
            date: "2025-03-19",
            note: "Progress updated to " + progress + "%",
            user: "John Martinez",
          },
          {
            date: "2025-03-17",
            note: "Progress updated to 40%",
            user: "John Martinez",
          },
          { date: "2025-03-15", note: "Task created", user: "Marcus Johnson" },
        ].map((entry, i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-xs text-gray-500"
          >
            <span className="w-20 font-medium text-gray-400">{entry.date}</span>
            <span className="flex-1">{entry.note}</span>
            <span className="text-gray-400">{entry.user}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
