"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { projectService } from "@/lib/services/project";
import { projectKeys } from "@/lib/queryKeys";
import RecentActivitySection from "./components/RecentActivitySection";
import type { Task } from "../task-details/types";
import WeatherWidget from "../../components/WeatherWidget";
import CrewHeader from "../component/CrewHeader";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function CrewDashboard() {
  const router = useRouter();
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const base = `/${orgSlug}/projects/${projectSlug}/site-supervisor`;
  const { getProject } = useMemberships();
  const project = getProject(orgSlug, projectSlug);
  const { data: projectUuid } = useProjectUuid(orgSlug, projectSlug);
  const summaryQuery = useQuery({
    queryKey: projectKeys.summary(projectUuid ?? ""),
    queryFn: () => projectService.getSummary(projectUuid!).then((r) => r.data),
    enabled: !!projectUuid,
  });
  const [showAllAllocations, setShowAllAllocations] = useState(false);
  const [loading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const crews = getMockCrews();
  const tasks = getMockTasks();
  const criticalActions = MOCK_ALERTS.map((a) => ({
    id: a.id,
    priority: a.type,
    message: a.message,
    createdAt: a.createdAt,
  }));

  // ── Compute metrics ──
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

  // ── Task/Crew overview — real summary when loaded, mock-derived fallback otherwise ──
  const taskOverview = summaryQuery.data?.task_overview ?? {
    total: metrics.totalTasks,
    ahead_of_schedule: metrics.aheadScheduleCount,
    on_schedule: metrics.onScheduleCount,
    behind_schedule: metrics.behindScheduleCount,
    at_risk: metrics.atRiskCount,
  };
  const crewOverview = summaryQuery.data?.crew_overview ?? {
    onsite_present: metrics.presentCount,
    scheduled_today: metrics.totalWorkers,
    offsite_absent: metrics.absentCount,
    on_leave: 0,
    late: metrics.lateCount,
    total_active_members: metrics.totalWorkers,
  };

  // ── Task allocation with multiple crews ──
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
      <CrewHeader
        title="Site Supervisor"
        project={project?.name || projectSlug}
      />

      <div className="space-y-6 pb-20 p-4 md:p-8 pt-16 md:pt-8">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Task Overview Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#021422] text-white p-3 flex items-center gap-2">
              <HardHat size={18} className="text-blue-400" />
              <span className="font-semibold text-sm">Task Overview</span>
            </div>
            <div className="p-4 flex-1 space-y-3">
              <div
                onClick={() => router.push(`${base}/task-details?status=ahead_of_schedule`)}
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 transition-colors"
              >
                <span className="text-sm text-gray-600">
                  Ahead of Schedule:
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {taskOverview.ahead_of_schedule}/{taskOverview.total}
                </span>
              </div>
              <div
                onClick={() => router.push(`${base}/task-details?status=on_schedule`)}
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 transition-colors"
              >
                <span className="text-sm text-gray-600">On Schedule:</span>
                <span className="text-sm font-medium text-green-600">
                  {taskOverview.on_schedule}/{taskOverview.total}
                </span>
              </div>
              <div
                onClick={() => router.push(`${base}/task-details?status=behind_schedule`)}
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 transition-colors"
              >
                <span className="text-sm text-gray-600">Behind Schedule:</span>
                <span className="text-sm font-medium text-yellow-600">
                  {taskOverview.behind_schedule}/{taskOverview.total}
                </span>
              </div>
              <div
                onClick={() => router.push(`${base}/task-details?status=at_risk`)}
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 transition-colors"
              >
                <span className="text-sm text-gray-600">At Risk:</span>
                <span className="text-sm font-medium text-red-600">
                  {taskOverview.at_risk}/{taskOverview.total}
                </span>
              </div>
            </div>
          </div>

          {/* Crew Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#021422] text-white p-3 flex items-center gap-2">
              <Users size={18} className="text-orange-400" />
              <span className="font-semibold text-sm">Crew Overview</span>
            </div>
            <div className="p-4 flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Onsite (Present):</span>
                <span className="text-sm font-medium text-[#021422]">
                  {crewOverview.onsite_present}/{crewOverview.scheduled_today}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Offsite (Absent):</span>
                <span className="text-sm font-medium text-[#021422]">
                  {crewOverview.offsite_absent}
                </span>
              </div>
            </div>
          </div>

          {/* Weather */}
          <WeatherWidget />
        </div>

        <div>
          <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Critical Actions
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-[#021422]">Issues Requiring Attention</h3>
              </div>
              {criticalActions.length > 0 && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {criticalActions.length}
                </span>
              )}
            </div>
            <div className="p-4">
              {criticalActions.length > 0 ? (
                <ul className="space-y-2">
                  {[...criticalActions].sort((a: any, b: any) => {
                    const order: Record<string, number> = { critical: 0, warning: 1, info: 2 };
                    return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
                  }).map((item: any, idx: number) => (
                    <li
                      key={item.id ?? idx}
                      className="flex items-start gap-3 rounded-lg p-3.5 border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#021422] font-medium leading-snug">
                          {item.message ||
                            item.description ||
                            item.title ||
                            JSON.stringify(item)}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {item.createdAt && (
                            <span className="text-[11px] text-gray-400">
                              {timeAgo(item.createdAt)}
                            </span>
                          )}
                          {(item.due_date || item.deadline) && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span className="text-[11px] text-gray-400">
                                Due: {item.due_date || item.deadline}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {(item.priority || item.severity) && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 bg-gray-100 text-gray-600">
                          {item.priority || item.severity}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">
                    {loading ? "Loading..." : "No issues \u2014 all clear!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Recent Activity */}
        <RecentActivitySection
          tasks={tasks as Task[]}
          onOpenTask={(task) => router.push(`${base}/task-details`)}
        />
        {/* Crew & Task Allocation */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="bg-[#021422] text-white p-4">
            <h2 className="text-sm font-bold">Crew & Task Allocation</h2>
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

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push(`${base}/task-details`)}
            className="px-4 py-2.5 bg-[#021422] text-white text-xs font-bold uppercase rounded hover:bg-gray-900 transition-colors flex items-center gap-2"
          >
            <BarChart3 size={14} />
            Task Details
          </button>
          <button
            onClick={() => router.push(`${base}/schedule-planner`)}
            className="px-4 py-2.5 bg-[#021422] text-white text-xs font-bold uppercase rounded hover:bg-gray-900 transition-colors flex items-center gap-2"
          >
            <Calendar size={14} />
            Schedule Planner
          </button>
          <button
            onClick={() => router.push(`${base}/attendance`)}
            className="px-4 py-2.5 bg-[#007AFF] text-white text-xs font-bold uppercase rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <UserCheck size={14} />
            Attendance
          </button>

          <button
            onClick={() => router.push(`${base}/safety`)}
            className="px-4 py-2.5 bg-[#007AFF] text-white text-xs font-bold uppercase rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Settings size={14} />
            Safety
          </button>
          <button
            onClick={() => router.push(`${base}/messages`)}
            className="px-4 py-2.5 bg-[#007AFF] text-white text-xs font-bold uppercase rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <MessageCircle size={14} />
            Message
          </button>
          <button
            onClick={() => router.push(`${base}/conference`)}
            className="px-4 py-2.5 bg-[#007AFF] text-white text-xs font-bold uppercase rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Users size={14} />
            Conference
          </button>
          <button
            onClick={() => router.push(`${base}/crew-settings`)}
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
