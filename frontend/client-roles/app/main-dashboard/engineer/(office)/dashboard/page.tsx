"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HardHat,
  Users,
  CloudSun,
  Construction,
  Scan,
} from "lucide-react";
import engineerService from "@/lib/engineerService";
import { useAuthStore } from "@/lib/stores/authStore";
import { getMockTasks, getMockWeather } from "@/lib/mockData";
import StockAlertsSection from "./components/StockAlertsSection";
import RecentActivitySection from "../task-details/components/RecentActivitySection";
import type { Task } from "../task-details/types";

export default function DashboardPage() {
  const router = useRouter();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [project, setProject] = useState<any>(() => {
    try {
      const stored = localStorage.getItem("selected_project");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  useEffect(() => {
    (async () => {
      try {
        const [summaryRes, criticalRes, feedRes] = await Promise.all([
          engineerService.getDashboardSummary("").catch(() => ({ data: null })),
          engineerService.getCriticalActions("").catch(() => ({ data: null })),
          engineerService.getActivityFeed("").catch(() => ({ data: null })),
        ]);
        const dashboardPayload = {
          summary: summaryRes.data,
          critical: criticalRes.data,
          feed: feedRes.data,
        };
        const feedResults =
          feedRes.data?.results ||
          (Array.isArray(feedRes.data) ? feedRes.data : []);
        console.log("??? Dashboard Page Fetched Data:", {
          ...dashboardPayload,
          feed: feedResults,
        });
        setDashboardData({ ...dashboardPayload, feedResults });
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#E3E3E3] min-h-screen p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#021422]"></div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};
  const crewStats = summary.crew || {
    onSite: "0/0",
    absent: 0,
    trades: "None",
  };
  const feedItems = dashboardData?.feedResults || [];

  const allTasks = getMockTasks();
  const taskStatusCounts = {
    ahead_of_schedule: allTasks.filter((t) => t.status === "ahead_of_schedule").length,
    on_schedule: allTasks.filter((t) => t.status === "on_schedule").length,
    behind_schedule: allTasks.filter((t) => t.status === "behind_schedule")
      .length,
    at_risk: allTasks.filter((t) => t.status === "at_risk").length,
  };
  const totalTasks = allTasks.length;
  const mockWeather = getMockWeather();

  const weatherScoreColor =
    mockWeather.score >= 7
      ? "text-green-600"
      : mockWeather.score >= 4
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="bg-[#E3E3E3] min-h-screen pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div>
          <h1 className="text-2xl font-bold text-[#021422]">
            {project?.name || "Dashboard"}
          </h1>
        </div>
        <div className="flex flex-col items-end text-sm text-gray-600">
          <span className="font-semibold text-[#021422]">
            {user?.fullname || user?.username || "Superintendent"} (
            {user?.role?.replace("_", " ") || "Engineer"})
          </span>
          <span>{new Date().toLocaleString()}</span>
        </div>
      </div>
      <div className="space-y-6 pb-20 p-4 md:p-8 pt-16 md:pt-8">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Task Overview Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#021422] text-white p-3 flex items-center gap-2">
              <HardHat size={18} className="text-blue-400" />
              <span className="font-semibold tracking-wide text-sm">
                TASK OVERVIEW
              </span>
            </div>
            <div className="p-4 flex-1 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ahead of Schedule:</span>
                <span className="font-medium text-blue-600">
                  {taskStatusCounts.ahead_of_schedule}/{totalTasks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">On Schedule:</span>
                <span className="font-medium text-green-600">
                  {taskStatusCounts.on_schedule}/{totalTasks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Behind Schedule:</span>
                <span className="font-medium text-yellow-600">
                  {taskStatusCounts.behind_schedule}/{totalTasks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">At Risk:</span>
                <span className="font-medium text-red-600">
                  {taskStatusCounts.at_risk}/{totalTasks}
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
                  {crewStats.onSite}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Absent:</span>
                <span className="font-medium text-[#021422]">
                  {crewStats.absent}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Trades:</span>
                <span className="font-medium text-[#021422]">
                  {crewStats.trades}
                </span>
              </div>
            </div>
          </div>

          {/* Weather Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#021422] text-white p-3 flex items-center gap-2">
              <CloudSun size={18} className="text-blue-300" />
              <span className="font-semibold tracking-wide text-sm">
                WEATHER
              </span>
            </div>
            <div className="p-4 flex-1 space-y-3">
              <div className="text-center">
                <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">
                  Workability Score
                </p>
                <p className={`text-3xl font-bold ${weatherScoreColor}`}>
                  {mockWeather.score}/10
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Condition:</span>
                <span className="font-medium text-[#021422]">
                  {mockWeather.condition}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Wind:</span>
                <span className="font-medium text-[#021422]">
                  {mockWeather.wind}
                </span>
              </div>
            </div>
</div>
</div>

{/* Inventory Stock Alerts */}
<StockAlertsSection />

{/* Recent Activity */}
<RecentActivitySection
  tasks={allTasks as Task[]}
  onOpenTask={(task) => router.push("/main-dashboard/engineer/(office)/task-details")}
/>

{/* Safety KPI Summary */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="bg-[#021422] text-white p-4">
            <h2 className="text-sm font-semibold tracking-widest uppercase">
              Safety
            </h2>
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    KPI
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Report No.
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    KPI
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Report No.
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 bg-white">
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">
                    Occupational Illness
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">
                    0
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">
                    Lost Time Injury (LTI)
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">
                    0
                  </td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">
                    Restricted Work Case (RWC)
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">
                    0
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">
                    Medical Treatment Case (MTC)
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">
                    0
                  </td>
                </tr>
                <tr className="border-b border-gray-100 bg-white">
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">
                    First Aid Case (FAC)
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">
                    0
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">
                    Anomalies (UA/UC)
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">
                    3
                  </td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">Near Miss</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">
                    1
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">
                    Permit-To-Work (PTW)
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">
                    6
                  </td>
                </tr>
                <tr className="border-b border-gray-100 bg-white">
                  <td className="py-3 px-4 text-sm text-gray-800 truncate">
                    Plant/Equipment Inspection
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">
                    4
                  </td>
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
              <h2 className="text-sm font-semibold tracking-widest uppercase">
                Live Site Feed & Critical Actions
              </h2>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {feedItems.length === 0 ? (
              <div className="p-6 text-center text-gray-500 font-medium">
                No data available
              </div>
            ) : (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                    <p className="font-medium text-[#021422]">
                      {item.text ||
                        item.content ||
                        item.message ||
                        "Activity logged."}
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
        <div className="fixed bottom-6 left-6 md:left-[300px] z-50">
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