"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  HardHat,
  Calendar,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Settings,
  Activity,
  ShieldAlert,
  Download,
  MessageCircle,
} from "lucide-react";
import { getMockCrews, getMockTasks, MOCK_ALERTS } from "@/lib/mockData";
import RecentActivitySection from "@/app/main-dashboard/engineer/(office)/task-details/components/RecentActivitySection";
import type { Task } from "@/app/main-dashboard/engineer/(office)/task-details/types";

export default function CrewDashboard() {
  const router = useRouter();
  const [showAllAllocations, setShowAllAllocations] = useState(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [criticalActions, setCriticalActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const crews = getMockCrews();
  const tasks = getMockTasks();
  const alerts = MOCK_ALERTS;

  // -- Compute metrics --
  const metrics = useMemo(() => {
    const totalWorkers = crews.reduce((sum, c) => sum + c.workers.length, 0);
    const allWorkers = crews.flatMap((c) => c.workers);
    const presentCount = allWorkers.filter(
      (w) => w.status === "present",
    ).length;
    const absentCount = allWorkers.filter((w) => w.status === "absent").length;
    const lateCount = allWorkers.filter((w) => w.status === "late").length;
    const onSiteCount = presentCount + lateCount;

    const onScheduleCount = tasks.filter(
      (t) => t.status === "on_schedule",
    ).length;
    const behindScheduleCount = tasks.filter(
      (t) => t.status === "behind_schedule",
    ).length;
    const atRiskCount = tasks.filter((t) => t.status === "at_risk").length;
    const aheadScheduleCount = tasks.filter(
      (t) => t.status === "ahead_of_schedule",
    ).length;
    const activeSchedules = tasks.filter(
      (t) => t.queue === "in_progress",
    ).length;

    return {
      totalWorkers,
      presentCount,
      absentCount,
      lateCount,
      onSiteCount,
      onScheduleCount,
      behindScheduleCount,
      atRiskCount,
      aheadScheduleCount,
      activeSchedules,
      totalTasks: tasks.length,
    };
  }, [crews, tasks]);

  // -- Task allocation with multiple crews --
  const taskAllocations = useMemo(() => {
    return tasks.map((task) => {
      const crewNames = task.crews.map((c) => c.name).join(", ");
      const assignedWorkers = task.assignedWorkers || [];
      const present = assignedWorkers.filter(
        (w) => w.status === "present",
      ).length;
      const absent = assignedWorkers.filter(
        (w) => w.status === "absent",
      ).length;
      const late = assignedWorkers.filter((w) => w.status === "late").length;

      return {
        id: task.id,
        title: task.title,
        crewNames,
        assigned: assignedWorkers.length,
        onSite: present + late,
        absent,
        late,
        status: task.status,
        progress: task.progress,
      };
    });
  }, [tasks]);

  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ahead_of_schedule":
        return "Ahead of Schedule";
      case "on_schedule":
        return "On Schedule";
      case "behind_schedule":
        return "Behind";
      case "at_risk":
        return "At Risk";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ahead_of_schedule":
        return "text-blue-600";
      case "on_schedule":
        return "text-green-600";
      case "behind_schedule":
        return "text-yellow-600";
      case "at_risk":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-[#E3E3E3] min-h-screen pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div>
          <h1 className="text-2xl font-bold text-[#021422]">Crew Management</h1>
        </div>
        <div className="flex flex-col items-end text-sm text-gray-600">
          <span className="font-semibold text-[#021422]">Crew Manager</span>
          <span>{dateStr}</span>
        </div>
      </div>

      <div className="space-y-6 pb-20 p-4 md:p-8 pt-16 md:pt-8">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Schedule Status Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#021422] text-white p-3 flex items-center gap-2">
              <HardHat size={18} className="text-blue-400" />
              <span className="font-semibold tracking-wide text-sm">
                SCHEDULE STATUS
              </span>
            </div>
            <div className="p-4 flex-1 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ahead of Schedule:</span>
                <span className="font-medium text-blue-600">
                  {metrics.aheadScheduleCount}/{metrics.totalTasks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">On Schedule:</span>
                <span className="font-medium text-green-600">
                  {metrics.onScheduleCount}/{metrics.totalTasks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Behind Schedule:</span>
                <span className="font-medium text-yellow-600">
                  {metrics.behindScheduleCount}/{metrics.totalTasks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">At Risk:</span>
                <span className="font-medium text-red-600">
                  {metrics.atRiskCount}/{metrics.totalTasks}
                </span>
              </div>
            </div>
          </div>

          {/* Crew Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#021422] text-white p-3 flex items-center gap-2">
              <Users size={18} className="text-orange-400" />
              <span className="font-semibold tracking-wide text-sm">CREW</span>
            </div>
            <div className="p-4 flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">On Site:</span>
                <span className="font-medium text-[#021422]">
                  {metrics.onSiteCount}/{metrics.totalWorkers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Present:</span>
                <span className="font-medium text-green-600">
                  {metrics.presentCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Absent:</span>
                <span className="font-medium text-red-600">
                  {metrics.absentCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Late:</span>
                <span className="font-medium text-yellow-600">
                  {metrics.lateCount}
                </span>
              </div>
            </div>
          </div>

          {/* Active Schedules Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#021422] text-white p-3 flex items-center gap-2">
              <Calendar size={18} className="text-blue-300" />
              <span className="font-semibold tracking-wide text-sm">
                SCHEDULES
              </span>
            </div>
            <div className="p-4 flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active:</span>
                <span className="font-medium text-blue-600">
                  {metrics.activeSchedules}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Tasks:</span>
                <span className="font-medium text-[#021422]">
                  {metrics.totalTasks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Coverage:</span>
                <span className="font-medium text-purple-600">
                  {metrics.totalTasks > 0
                    ? Math.round(
                        (metrics.activeSchedules / metrics.totalTasks) * 100,
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Critical Actions
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#021422] text-white p-4 flex items-center gap-2">
              <ShieldAlert size={16} />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Items Requiring Attention
              </h3>
            </div>
            <div className="p-6">
              {criticalActions.length > 0 ? (
                <ul className="space-y-3">
{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {criticalActions.map((item: any, idx: number) => {
                    const priority = (
                      item.priority ||
                      item.severity ||
                      ""
                    ).toLowerCase();
                    const dotColor =
                      priority === "critical" || priority === "high"
                        ? "bg-red-500"
                        : priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-blue-500";
                    return (
                      <li
                        key={item.id ?? idx}
                        className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-100"
                      >
                        <div
                          className={`mt-1 w-2.5 h-2.5 rounded-full ${dotColor} flex-shrink-0`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#021422] font-medium">
                            {item.message ||
                              item.description ||
                              item.title ||
                              JSON.stringify(item)}
                          </p>
                          {(item.due_date || item.deadline) && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Finish: {item.due_date || item.deadline}
                            </p>
                          )}
                        </div>
                        {(item.priority || item.severity) && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 ${
                              priority === "critical" || priority === "high"
                                ? "bg-red-100 text-red-600"
                                : priority === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {item.priority || item.severity}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">
                  {loading ? "Loading..." : "No critical actions at this time"}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Recent Activity */}
        <RecentActivitySection
          tasks={tasks as Task[]}
          onOpenTask={(task) =>
            router.push("/main-dashboard/site-supervisor/task-details")
          }
        />
        {/* Crew & Task Allocation */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="bg-[#021422] text-white p-4">
            <h2 className="text-sm font-semibold tracking-widest uppercase">
              Crew & Task Allocation
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[18%]" />
                <col className="w-1/12" />
                <col className="w-1/12" />
                <col className="w-1/12" />
                <col className="w-1/12" />
                <col className="w-[15%]" />
              </colgroup>
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Task
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Crew(s)
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Assigned
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    On Site
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Absent
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Late
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {(showAllAllocations
                  ? taskAllocations
                  : taskAllocations.slice(0, 5)
                ).map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-[#021422] truncate">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-gray-400">{item.id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-800">
                        {item.crewNames}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-medium text-[#021422]">
                        {item.assigned}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-medium text-green-600">
                        {item.onSite}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-sm font-medium ${
                          item.absent > 0 ? "text-red-600" : "text-gray-400"
                        }`}
                      >
                        {item.absent}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-sm font-medium ${
                          item.late > 0 ? "text-yellow-600" : "text-gray-400"
                        }`}
                      >
                        {item.late}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm font-medium ${getStatusColor(item.status)}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {taskAllocations.length > 5 && (
            <div className="flex justify-end px-4 py-3 border-t border-gray-100">
              <button
                onClick={() => setShowAllAllocations(!showAllAllocations)}
                className="text-xs font-bold text-[#007AFF] hover:underline"
              >
                {showAllAllocations
                  ? "View Less"
                  : `View More (${taskAllocations.length - 5} more)`}
              </button>
            </div>
          )}
        </div>
        {/* Crew Health & Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Crew Health */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="bg-[#021422] text-white p-4">
              <h2 className="text-sm font-semibold tracking-widest uppercase">
                Crew Health
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {crews.map((crew) => {
                const present = crew.workers.filter(
                  (w) => w.status === "present",
                ).length;
                const absent = crew.workers.filter(
                  (w) => w.status === "absent",
                ).length;
                const late = crew.workers.filter(
                  (w) => w.status === "late",
                ).length;
                const onSite = present + late;
                const ratio =
                  crew.workers.length > 0
                    ? Math.round((onSite / crew.workers.length) * 100)
                    : 0;

                return (
                  <div
                    key={crew.id}
                    className={`flex justify-between items-center py-3 border-b border-gray-100 ${
                      absent > 0 ? "bg-red-50" : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-[#021422]">
                        {crew.name}
                      </p>
                      <p className="text-[10px] text-gray-400">{crew.trade}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-[#021422]">
                        {onSite}/{crew.workers.length}
                      </span>
                      {absent > 0 && (
                        <span className="text-red-500 text-xs font-medium">
                          {absent} absent
                        </span>
                      )}
                      {late > 0 && (
                        <span className="text-yellow-500 text-xs font-medium">
                          {late} late
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crew Alerts */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="bg-[#021422] text-white p-4">
              <h2 className="text-sm font-semibold tracking-widest uppercase">
                Alerts
              </h2>
            </div>
            <div className="p-4 divide-y divide-gray-100">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 py-3">
                    <AlertTriangle
                      size={14}
                      className={`mt-0.5 flex-shrink-0 ${
                        alert.type === "critical"
                          ? "text-red-500"
                          : alert.type === "warning"
                            ? "text-yellow-500"
                            : "text-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#021422] leading-relaxed">
                        {alert.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  No alerts at this time
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() =>
              router.push("/main-dashboard/site-supervisor/task-details")
            }
            className="px-4 py-2.5 bg-[#021422] text-white text-xs font-bold uppercase rounded hover:bg-gray-900 transition-colors flex items-center gap-2"
          >
            <BarChart3 size={14} />
            Task Details
          </button>
          <button
            onClick={() =>
              router.push("/main-dashboard/site-supervisor/schedule-planner")
            }
            className="px-4 py-2.5 bg-[#021422] text-white text-xs font-bold uppercase rounded hover:bg-gray-900 transition-colors flex items-center gap-2"
          >
            <Calendar size={14} />
            Schedule Planner
          </button>
          <button
            onClick={() =>
              router.push("/main-dashboard/site-supervisor/attendance")
            }
            className="px-4 py-2.5 bg-[#007AFF] text-white text-xs font-bold uppercase rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <UserCheck size={14} />
            Attendance
          </button>

          <button
            onClick={() => router.push("/main-dashboard/site-supervisor/safety")}
            className="px-4 py-2.5 bg-[#007AFF] text-white text-xs font-bold uppercase rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Settings size={14} />
            Safety
          </button>
          <button
            onClick={() => router.push("/main-dashboard/site-supervisor/message")}
            className="px-4 py-2.5 bg-[#007AFF] text-white text-xs font-bold uppercase rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <MessageCircle size={14} />
            Message
          </button>
          <button
            onClick={() =>
              router.push("/main-dashboard/site-supervisor/conference")
            }
            className="px-4 py-2.5 bg-[#007AFF] text-white text-xs font-bold uppercase rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Users size={14} />
            Conference
          </button>
          <button
            onClick={() =>
              router.push("/main-dashboard/site-supervisor/crew-settings")
            }
            className="px-4 py-2.5 bg-[#007AFF] text-white text-xs font-bold uppercase rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Settings size={14} />
            Crew Settings
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2.5 bg-[#021422] text-white text-xs font-bold uppercase rounded hover:bg-gray-900 transition-colors flex items-center gap-2"
          >
            <Download size={14} />
            Generate Report
          </button>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-bold text-lg uppercase tracking-wider text-[#021422]">
                Generate Report
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Download a CSV report of attendance records for the selected
                date.
              </p>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Report Date
                </label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-[#021422] text-xs font-bold uppercase rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    alert("Report download started");
                  }}
                  className="flex-1 py-3 bg-[#021422] text-white text-xs font-bold uppercase rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}