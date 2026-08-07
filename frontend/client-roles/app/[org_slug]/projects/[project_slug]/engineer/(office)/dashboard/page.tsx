"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { HardHat, Users, Construction, Scan, ShieldAlert, MessageCircle, ChevronRight } from "lucide-react";
import engineerService from "@/lib/engineerService";
import { projectService } from "@/lib/services/project";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { useUnreadMessages } from "@/lib/hooks/useUnreadMessages";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { getMockTasks } from "@/lib/mockData";
import { engineerKeys, projectKeys } from "@/lib/queryKeys";
import WeatherWidget from "../../../components/WeatherWidget";
import StockAlertsSection from "./components/StockAlertsSection";
import RecentActivitySection from "../task-details/components/RecentActivitySection";
import EngineerHeader from "../components/EngineerHeader";
import type { Task } from "../task-details/types";

interface DashboardPageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { org_slug, project_slug } = use(params);
  const router = useRouter();
  const base = `/${org_slug}/projects/${project_slug}/engineer`;
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);
  const { unreadCount: unreadMessages } = useUnreadMessages(projectUuid);
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);

  const [summaryQuery, criticalQuery, feedQuery, projectSummaryQuery] = useQueries({
    queries: [
      {
        queryKey: engineerKeys.dashboard(projectUuid),
        queryFn: () => engineerService.getDashboardSummary(projectUuid!).then((r) => r.data),
        enabled: !!projectUuid,
      },
      {
        queryKey: engineerKeys.criticalActions(projectUuid),
        queryFn: () => engineerService.getCriticalActions(projectUuid!).then((r) => r.data),
        enabled: !!projectUuid,
      },
      {
        queryKey: engineerKeys.activityFeed(projectUuid),
        queryFn: () => engineerService.getActivityFeed(projectUuid!).then((r) => r.data),
        enabled: !!projectUuid,
      },
      {
        queryKey: projectKeys.summary(projectUuid ?? ""),
        queryFn: () => projectService.getSummary(projectUuid!).then((r) => r.data),
        enabled: !!projectUuid,
      },
    ],
  });

  const isLoading =
    summaryQuery.isLoading && !summaryQuery.data &&
    criticalQuery.isLoading && !criticalQuery.data &&
    feedQuery.isLoading && !feedQuery.data;

  if (isLoading) {
    return (
      <div className="bg-[#E3E3E3] min-h-screen p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#021422]"></div>
      </div>
    );
  }

  const rawFeed = feedQuery.data;
  const feedItems: any[] =
    (rawFeed as any)?.results || (Array.isArray(rawFeed) ? rawFeed : []);

  const criticalActions: any[] = Array.isArray(criticalQuery.data)
    ? criticalQuery.data
    : [];

  const allTasks = getMockTasks();
  const mockTaskStatusCounts = {
    ahead_of_schedule: allTasks.filter((t) => t.status === "ahead_of_schedule").length,
    on_schedule: allTasks.filter((t) => t.status === "on_schedule").length,
    behind_schedule: allTasks.filter((t) => t.status === "behind_schedule").length,
    at_risk: allTasks.filter((t) => t.status === "at_risk").length,
  };

  // Real dashboard summary (task/crew overview) when loaded, mock-derived fallback otherwise.
  const taskOverview = projectSummaryQuery.data?.task_overview ?? {
    total: allTasks.length,
    ...mockTaskStatusCounts,
  };
  const crewOverview = projectSummaryQuery.data?.crew_overview ?? {
    onsite_present: 0,
    scheduled_today: 0,
    offsite_absent: 0,
    on_leave: 0,
    late: 0,
    total_active_members: 0,
  };

  return (
    <div className="bg-[#E3E3E3] min-h-screen pb-10">
      <EngineerHeader
        title={project?.name || project_slug}
        badge="Dashboard"
      />
      <div className="space-y-6 pb-20 p-4 md:p-8 pt-8">
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
                <span className="text-sm text-gray-600">Ahead of Schedule:</span>
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

          {/* Weather Card */}
          <WeatherWidget />
        </div>

        {/* Team Messages summary */}
        <Link href={`${base}/messages`} className="block">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-full bg-[#0070D4]/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="text-[#0070D4]" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#021422]">Team Messages</p>
              <p className="text-xs text-gray-500">
                {unreadMessages > 0
                  ? `${unreadMessages} unread message${unreadMessages > 1 ? "s" : ""}`
                  : "You're all caught up"}
              </p>
            </div>
            {unreadMessages > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </span>
            )}
            <ChevronRight className="text-gray-300 flex-shrink-0" size={18} />
          </div>
        </Link>

        {/* Inventory Stock Alerts */}
        <StockAlertsSection />

        <div>
          <h2 className="text-xs font-semibold text-gray-500 mb-3">
            Critical Actions
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#021422] text-white p-4 flex items-center gap-2">
              <ShieldAlert size={16} />
              <h3 className="text-sm font-bold">Items requiring attention</h3>
            </div>
            <div className="p-6">
              {criticalActions.length > 0 ? (
                <ul className="space-y-3">
                  {criticalActions.map((item: any, idx: number) => {
                    const priority = (
                      item.priority || item.severity || ""
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
                  No critical actions at this time
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivitySection
          tasks={allTasks as Task[]}
          onOpenTask={() => router.push(`${base}/task-details`)}
        />

        {/* Safety KPI Summary */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="bg-[#021422] text-white p-4">
            <h2 className="text-sm font-bold">Safety</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-1/4" />
                <col className="w-1/4" />
                <col className="w-1/4" />
                <col className="w-1/4" />
              </colgroup>
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">KPI</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Report No.</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">KPI</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Report No.</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 bg-white">
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">Occupational Illness</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">0</td>
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">Lost Time Injury (LTI)</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">0</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">Restricted Work Case (RWC)</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">0</td>
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">Medical Treatment Case (MTC)</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">0</td>
                </tr>
                <tr className="border-b border-gray-100 bg-white">
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">First Aid Case (FAC)</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">0</td>
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">Anomalies (UA/UC)</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">3</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">Near Miss</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">1</td>
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">Permit-To-Work (PTW)</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">6</td>
                </tr>
                <tr className="border-b border-gray-100 bg-white">
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">Plant/Equipment Inspection</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">4</td>
                  <td className="py-3 px-4 text-sm text-gray-800"></td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Site Feed Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="bg-[#021422] text-white p-6 flex items-center justify-center relative">
            <div className="flex items-center gap-3">
              <Construction className="text-gray-400" size={24} />
              <h2 className="text-sm font-bold">
                Live site feed & critical actions
              </h2>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {feedItems.length === 0 ? (
              <div className="p-6 text-center text-gray-500 font-medium">
                No data available
              </div>
            ) : (
              feedItems.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 md:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-[80px]">
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {item.time || item.created_at || "10:00 AM"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#021422]">
                      {item.text || item.content || item.message || "Activity logged."}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.type === "danger" && (
                      <>
                        <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          AR Snapshot
                        </span>
                        <button className="bg-[#021422] text-white text-xs font-semibold px-4 py-2 rounded uppercase tracking-wider hover:bg-gray-900 transition-colors">
                          Assign
                        </button>
                        <button className="bg-[#0070D4] text-white text-xs font-semibold px-4 py-2 rounded uppercase tracking-wider hover:bg-blue-600 transition-colors">
                          View
                        </button>
                      </>
                    )}
                    {item.type === "message" && (
                      <button className="bg-[#021422] text-white text-xs font-semibold px-4 py-2 rounded uppercase tracking-wider hover:bg-gray-900 transition-colors">
                        Reply
                      </button>
                    )}
                    {item.type === "warning" && (
                      <button className="bg-[#021422] text-white text-xs font-semibold px-4 py-2 rounded uppercase tracking-wider hover:bg-gray-900 transition-colors">
                        Notify Client
                      </button>
                    )}
                    {item.type === "info" && <div className="opacity-0"></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Persistent AR Scan FAB */}
        <div className="fixed bottom-6 left-6 md:left-[300px] z-30">
          <button className="bg-[#021422] text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 hover:bg-gray-900 transition-colors border border-gray-700">
            <Scan size={20} className="text-white" />
            <span className="text-xs font-bold tracking-wider uppercase">
              Persistent AR Scan Fab
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
