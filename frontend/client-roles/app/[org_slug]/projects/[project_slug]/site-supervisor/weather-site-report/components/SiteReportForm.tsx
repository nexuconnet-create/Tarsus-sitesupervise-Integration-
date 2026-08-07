"use client";

import { useState } from "react";
import { Camera, ScanEye, Plus, X, Megaphone, FileText } from "lucide-react";

interface TaskOption {
  id: string;
  name: string;
}

interface TaskEntry {
  taskId: string;
  taskName: string;
  completionPct: number;
}

interface Props {
  taskOptions: TaskOption[];
  autoWeatherNote: string;
  date: string;
  onSubmit: (data: ReportFormData) => void;
  onSaveDraft: (data: ReportFormData) => void;
  onNotifyTeam: (data: ReportFormData) => void;
  onGenerateReport: (data: ReportFormData) => void;
}

export interface ReportFormData {
  taskEntries: TaskEntry[];
  weatherNote: string;
  issueType: string;
  issueDetail: string;
  snapshotCount: number;
}

const ISSUE_TYPES = ["None", "Safety", "Quality", "Delay", "Other"];

export default function SiteReportForm({ taskOptions, autoWeatherNote, date, onSubmit, onSaveDraft, onNotifyTeam, onGenerateReport }: Props) {
  const [taskEntries, setTaskEntries] = useState<TaskEntry[]>([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [weatherNote, setWeatherNote] = useState(autoWeatherNote);
  const [issueType, setIssueType] = useState("None");
  const [issueDetail, setIssueDetail] = useState("");
  const [snapshotCount, setSnapshotCount] = useState(0);

  function addTask() {
    if (!selectedTask) return;
    const option = taskOptions.find((t) => t.id === selectedTask);
    if (!option) return;
    if (taskEntries.find((e) => e.taskId === selectedTask)) return;
    setTaskEntries((prev) => [...prev, { taskId: option.id, taskName: option.name, completionPct: 0 }]);
    setSelectedTask("");
  }

  function removeTask(taskId: string) {
    setTaskEntries((prev) => prev.filter((e) => e.taskId !== taskId));
  }

  function updatePct(taskId: string, pct: number) {
    setTaskEntries((prev) =>
      prev.map((e) => (e.taskId === taskId ? { ...e, completionPct: Math.min(100, Math.max(0, pct)) } : e))
    );
  }

  const formData: ReportFormData = { taskEntries, weatherNote, issueType, issueDetail, snapshotCount };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-[#021422] text-white p-4 flex items-center justify-between">
        <h3 className="font-bold text-sm">Site Report</h3>
        <span className="text-xs text-gray-400">{date}</span>
      </div>

      <div className="p-5 space-y-5">

        {/* Work Completed */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Work Completed
          </label>
          <div className="flex gap-2">
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#021422] bg-white"
            >
              <option value="">Select task from schedule…</option>
              {taskOptions
                .filter((t) => !taskEntries.find((e) => e.taskId === t.id))
                .map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>
            <button
              onClick={addTask}
              disabled={!selectedTask}
              className="flex items-center gap-1 text-xs bg-[#021422] disabled:bg-gray-200 disabled:text-gray-400 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={13} />
              Add
            </button>
          </div>

          {taskEntries.length > 0 && (
            <div className="mt-3 space-y-2">
              {taskEntries.map((entry) => (
                <div key={entry.taskId} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-xs font-medium text-[#021422] flex-1 truncate">{entry.taskName}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={entry.completionPct}
                      onChange={(e) => updatePct(entry.taskId, Number(e.target.value))}
                      className="w-14 text-xs border border-gray-200 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-[#021422]"
                    />
                    <span className="text-xs text-gray-400">% complete</span>
                    <button onClick={() => removeTask(entry.taskId)} className="text-gray-400 hover:text-red-500 transition-colors ml-1">
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weather Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Weather Notes
          </label>
          <textarea
            value={weatherNote}
            onChange={(e) => setWeatherNote(e.target.value)}
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#021422] resize-none"
          />
        </div>

        {/* Issues */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Issues</label>
          <select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-1 focus:ring-[#021422] bg-white"
          >
            {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          {issueType !== "None" && (
            <input
              type="text"
              value={issueDetail}
              onChange={(e) => setIssueDetail(e.target.value)}
              placeholder={`Describe ${issueType.toLowerCase()} issue…`}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#021422]"
            />
          )}
        </div>

        {/* AR Site Scan */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            📸 AR Site Scan
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => { setSnapshotCount((n) => n + 1); /* toast when backend ready */ }}
              className="flex items-center gap-2 text-xs bg-gray-100 hover:bg-gray-200 text-[#021422] px-3 py-2 rounded-lg transition-colors"
            >
              <Camera size={13} />
              Add Photo
            </button>
            <button
              onClick={() => { /* AR Capture — coming soon */ }}
              className="flex items-center gap-2 text-xs bg-[#0070D4] hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <ScanEye size={13} />
              🕶️ Capture
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {snapshotCount} snapshot{snapshotCount !== 1 ? "s" : ""} captured today
          </p>
        </div>

        {/* Action row */}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={() => { onNotifyTeam(formData); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-[#021422] text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Megaphone size={14} />
            Notify Team
          </button>
          <button
            onClick={() => { onGenerateReport(formData); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold border border-gray-200 rounded-lg text-[#021422] hover:bg-gray-50 transition-colors"
          >
            <FileText size={14} />
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
