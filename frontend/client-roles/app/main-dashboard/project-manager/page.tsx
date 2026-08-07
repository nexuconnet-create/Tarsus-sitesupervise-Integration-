"use client";

import React from "react";
import {
  Activity,
  Zap,
  Video,
  AlertCircle,
  Send,
  UserPlus,
  Shield,
  BarChart3
} from "lucide-react";
import MetricCard from "./components/MetricCard";
import DashboardSection from "./components/DashboardSection";
import QuickActionBar from "./components/QuickActionBar";
import PMHeader from "./components/PMHeader";
import GlobalSearchBar from "./components/GlobalSearchBar";
import QuickMetricsCards from "./components/QuickMetricsCards";
import ProjectHealthScorecard from "./components/ProjectHealthScorecard";
import SCurveChart from "./components/SCurveChart";
import CriticalAlerts from "./components/CriticalAlerts";
import QuickAccess from "./components/QuickAccess";
import { projectManagerService } from "../../../lib/services";
import { useAuthStore } from "../../../lib/stores/authStore";
import { MOCK_DASHBOARD_QUICK_ACCESS, USE_MOCK } from "../../../lib/mockData/projectManager";

interface ProjectSummary {
  id: string | number;
  name: string;
  status?: string;
  contract_value?: string | number;
}

interface PredictiveAlert {
  priority?: string;
  title?: string;
  message_template?: string;
  suggested_actions?: string[];
}

interface StrategicHealth {
  project_progress?: number;
  tasks_completed?: number;
  tasks_total?: number;
  budget_variance?: number | string;
  budget_spent?: number | string;
  contract_value?: number | string;
  quality_score?: number;
  quality_status?: string;
  health_score?: number;
  safety_score?: number;
  site_safety_score?: number;
  risks_high?: number;
  deadline_days?: number;
  deadline_date?: string;
  team_active?: number;
  team_total?: number;
  schedule_variance_days?: number;
  cpi?: number;
  spi?: number;
  tcpi?: number;
  health_status?: string;
  live_minimap_synced?: boolean;
  evm_insights?: {
    cpi_text?: string;
    spi_text?: string;
  };
  ai_predictive_delay_alerts?: PredictiveAlert[];
}

interface CriticalAction {
  title?: string;
  target_type?: string;
  urgency?: string;
}

interface Camera {
  camera_name?: string;
  status?: string;
}

const asArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (
    value &&
    typeof value === "object" &&
    "results" in value &&
    Array.isArray((value as { results?: unknown }).results)
  ) {
    return (value as { results: T[] }).results;
  }
  return [];
};

const formatNaira = (value: number | string | undefined): string => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `₦${amount.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
};

const ExecutiveDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [activeProject, setActiveProject] = React.useState<ProjectSummary | null>(null);
  const [projects, setProjects] = React.useState<ProjectSummary[]>([]);
  const [strategicHealth, setStrategicHealth] = React.useState<StrategicHealth | null>(null);
  const [criticalActions, setCriticalActions] = React.useState<CriticalAction[]>([]);
  const [cameras, setCameras] = React.useState<Camera[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        let project: ProjectSummary | null = null;
        try {
          const stored = localStorage.getItem('selected_project');
          if (stored) {
            const parsed = JSON.parse(stored) as Partial<ProjectSummary>;
            if (parsed.id !== undefined && typeof parsed.name === "string") {
              project = parsed as ProjectSummary;
            }
          }
        } catch {
          localStorage.removeItem("selected_project");
        }

        const projectsRes = await projectManagerService.getProjects();
        const fetchedProjects = asArray<ProjectSummary>(projectsRes.data);
        setProjects(fetchedProjects);

        if (!project && fetchedProjects.length > 0) {
          project = fetchedProjects[0];
        }

        if (project) {
          setActiveProject(project);
          const projectId = String(project.id);

          const [healthRes, actionsRes, camerasRes] = await Promise.all([
            projectManagerService.getStrategicHealth(projectId).catch(() => ({ data: null })),
            projectManagerService.getCriticalActions(projectId).catch(() => ({ data: [] })),
            projectManagerService.getLiveCameras(projectId).catch(() => ({ data: [] }))
          ]);

          setStrategicHealth((healthRes.data ?? null) as StrategicHealth | null);
          setCriticalActions(asArray<CriticalAction>(actionsRes.data));
          setCameras(asArray<Camera>(camerasRes.data));
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setLoadError("The project dashboard could not be loaded. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const alertCount = strategicHealth?.ai_predictive_delay_alerts?.length || 0;
  const notifCount = criticalActions.length;
  const userName =
    user?.fullname ||
    user?.name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.email ||
    "Project Manager";
  const contractValue = Number(
    strategicHealth?.contract_value ?? activeProject?.contract_value,
  );
  const budgetSpent = Number(strategicHealth?.budget_spent);
  const budgetPercent =
    Number.isFinite(contractValue) && contractValue > 0 && Number.isFinite(budgetSpent)
      ? Math.min(Math.round((budgetSpent / contractValue) * 100), 100)
      : 0;
  const dashboardAlerts = (strategicHealth?.ai_predictive_delay_alerts ?? []).map(
    (alert, index) => ({
      id: index + 1,
      severity:
        alert.priority?.toUpperCase() === "CRITICAL" ||
        alert.priority?.toUpperCase() === "HIGH"
          ? ("urgent" as const)
          : alert.priority?.toUpperCase() === "MEDIUM"
            ? ("warning" as const)
            : ("insight" as const),
      message: [alert.title, alert.message_template].filter(Boolean).join(" — "),
    }),
  );

  return (
    <div className="pb-24">
      {/* Top Header Bar */}
      <PMHeader
        projectName={activeProject?.name ?? "No Project Selected"}
        userName={userName}
        alertCount={alertCount}
        notificationCount={notifCount}
      />

      {/* Global Search Bar */}
      <GlobalSearchBar />

      {/* Page Content */}
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-gray-500 font-bold">
            Synchronizing Command Center...
          </div>
        )}

        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center font-semibold text-red-700">
            {loadError}
          </div>
        )}

        {!loading && !loadError && !activeProject && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center font-semibold text-amber-800">
            No active project was found. Create or select a project in PM Settings to
            open the command center.
          </div>
        )}

        {!loading && !loadError && activeProject && (
          <>
            {/* Quick Metrics Cards */}
            <QuickMetricsCards
              projectProgress={strategicHealth?.project_progress ?? 0}
              tasksCompleted={strategicHealth?.tasks_completed ?? 0}
              tasksTotal={strategicHealth?.tasks_total ?? 0}
              budgetPercent={budgetPercent}
              budgetAmount={formatNaira(strategicHealth?.budget_spent)}
              risksOpen={alertCount}
              risksHigh={strategicHealth?.risks_high ?? 0}
              deadlineDays={strategicHealth?.deadline_days ?? 0}
              deadlineDate={strategicHealth?.deadline_date ?? "—"}
              teamActive={strategicHealth?.team_active ?? 0}
              teamTotal={strategicHealth?.team_total ?? 0}
            />

            {/* Project Health Scorecard */}
            <ProjectHealthScorecard
              healthScore={strategicHealth?.health_score ?? strategicHealth?.quality_score ?? 0}
              schedule={Math.round(Number(strategicHealth?.spi ?? 0) * 100)}
              budget={Math.round(Number(strategicHealth?.cpi ?? 0) * 100)}
              quality={strategicHealth?.quality_score ?? 0}
              safety={strategicHealth?.safety_score ?? strategicHealth?.site_safety_score ?? 0}
            />

            {/* S-Curve Chart */}
            <SCurveChart
              spi={strategicHealth?.spi ?? 0}
              cpi={strategicHealth?.cpi ?? 0}
              dataAvailable={USE_MOCK}
              eac={
                strategicHealth?.budget_spent && strategicHealth?.cpi
                  ? formatNaira(
                      Number(strategicHealth.budget_spent) /
                        Number(strategicHealth.cpi),
                    )
                  : "—"
              }
            />

            {/* Critical Alerts & Recommendations */}
            <CriticalAlerts alerts={dashboardAlerts} />

            {/* Quick Access - Recent Activities */}
            <QuickAccess
              projects={
                USE_MOCK
                  ? MOCK_DASHBOARD_QUICK_ACCESS.projects
                  : projects.slice(0, 3).map((project) => ({
                      name: project.name,
                      time: project.status ?? "",
                    }))
              }
              documents={USE_MOCK ? MOCK_DASHBOARD_QUICK_ACCESS.documents : []}
              messages={USE_MOCK ? MOCK_DASHBOARD_QUICK_ACCESS.messages : []}
              deadlines={USE_MOCK ? MOCK_DASHBOARD_QUICK_ACCESS.deadlines : []}
            />

            {/* Strategic Health */}
            <DashboardSection title="Strategic Health" icon={<Activity size={20} />}>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Schedule Risk"
                value={strategicHealth?.schedule_variance_days || 0}
                unit=" Days"
                progress={100}
                trend="Variance"
              />
              <MetricCard
                title="Budget Variance"
                value={strategicHealth?.budget_variance || 0}
                unit="%"
                subValue={`Spent: ${formatNaira(strategicHealth?.budget_spent)} / Total: ${formatNaira(strategicHealth?.contract_value)}`}
                trend="EVM Output"
              />
              <MetricCard
                title="Quality Score"
                value={strategicHealth?.quality_score || 0}
                unit="%"
                progress={strategicHealth?.quality_score || 0}
                trend={strategicHealth?.quality_status || 'Unknown'}
              />
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-500 uppercase tracking-widest">
                <BarChart3 size={16} />
                <span>Earned Value Management (EVM)</span>
              </div>
              <div className="flex gap-8 text-base font-medium mb-4">
                <span>CPI: {Number(strategicHealth?.cpi || 1).toFixed(2)}</span>
                <span>SPI: {Number(strategicHealth?.spi || 1).toFixed(2)}</span>
                <span>TCPI: {Number(strategicHealth?.tcpi || 1).toFixed(2)}</span>
              </div>
              <div className="space-y-1 text-base text-gray-600 italic">
                <p>&quot;{strategicHealth?.evm_insights?.cpi_text || 'Cost performance is to plan'}&quot;</p>
                <p>&quot;{strategicHealth?.evm_insights?.spi_text || 'Schedule performance is to plan'}&quot;</p>
              </div>
            </div>
          </div>
        </DashboardSection>

        {/* AI Predictive Insights */}
        <DashboardSection title="AI Predictive Insights" icon={<Zap size={20} />}>
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
              <Zap size={16} />
              <span>AI Strategic Predictions</span>
            </div>

            <div className="space-y-4">
              {strategicHealth?.ai_predictive_delay_alerts && strategicHealth.ai_predictive_delay_alerts.length > 0 ? (
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                strategicHealth.ai_predictive_delay_alerts.map((alert: any, idx: number) => (
                  <div key={idx} className="mb-4">
                    <div className="flex items-center gap-2 text-base font-bold text-red-600 mb-2">
                      <AlertCircle size={16} />
                      <span>{alert.priority} PROBABILITY:</span>
                    </div>
                    <ul className="list-disc list-inside text-base text-gray-700 space-y-1 ml-2">
                      <li>{alert.title}</li>
                      <li>{alert.message_template}</li>
                    </ul>
                    {alert.suggested_actions && alert.suggested_actions.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1">
                          <Activity size={14} className="text-gray-500" />
                          <span>RECOMMENDED ACTIONS:</span>
                        </div>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                          {alert.suggested_actions.map((act: string, i: number) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No predictive delay alerts at this time. Great job!</div>
              )}
            </div>

            <div className="flex items-center justify-between border-t pt-6">
              <div className="text-sm font-bold text-gray-500 uppercase">AI CONFIDENCE: {strategicHealth?.health_status === 'GOOD' ? 'HIGH' : 'STABLE'}</div>
              <div className="flex gap-2">
                <button className="bg-[#021422] text-white px-4 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">Resolve Actions</button>
              </div>
            </div>
          </div>
        </DashboardSection>

        {/* Live Site View */}
        <DashboardSection title="Live Site View" icon={<Video size={20} />}>
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
              <Video size={16} />
              <span>Virtual Site Walk</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cameras.length > 0 ? cameras.slice(0, 4).map((cam, idx) => (
                <div key={idx} className="aspect-video bg-[#021422] rounded flex flex-col items-center justify-center p-4 border border-gray-700">
                  <div className="bg-black/40 text-white text-xs font-bold px-3 py-1 rounded inline-block mb-3 border border-white/20">
                    {cam.camera_name}
                  </div>
                  <div className="text-white/60 text-sm font-medium">{cam.status}</div>
                </div>
              )) : (
                <div className="col-span-4 aspect-video bg-gray-100 rounded flex items-center justify-center p-4 border border-gray-200">
                  <div className="text-gray-500 font-bold">No cameras connected to this site</div>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-500 uppercase tracking-widest">
                <Shield size={16} />
                <span>AI HIGHLIGHTS (CCTV)</span>
              </div>
              <ul className="text-base text-gray-700 space-y-2">
                {strategicHealth?.live_minimap_synced ? (
                  <li className="flex gap-2 underline decoration-gray-300 decoration-1 underline-offset-4 decoration-dotted">
                    <span>Digital Twin Minimap is SYNCED with live footage</span>
                  </li>
                ) : (
                  <li className="flex gap-2 underline decoration-gray-300 decoration-1 underline-offset-4 decoration-dotted">
                    <span>Digital Twin Minimap Sync Pending</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </DashboardSection>

        {/* Critical Action Queue */}
        <DashboardSection title="Critical Action Queue" icon={<AlertCircle size={20} />}>
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
              <Activity size={16} />
              <span>REQUIRED PM DECISION ({criticalActions.length} ITEMS)</span>
            </div>

            {criticalActions.length > 0 ? criticalActions.map((action, idx) => (
              <div key={idx} className={`space-y-4 ${idx > 0 ? 'pt-6 border-t border-gray-100' : ''}`}>
                <div className="text-base">
                  <span className="font-bold">{idx + 1}. {action.title}</span>
                  <span className="text-gray-500"> [{action.target_type}]</span>
                </div>
                <div className="text-base text-gray-600">Urgency: {action.urgency}</div>
                <div className="flex gap-2 pt-2">
                  <button className="bg-[#021422] text-white px-6 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">Resolve</button>
                </div>
              </div>
            )) : (
              <div className="text-gray-500 font-bold">No critical actions pending.</div>
            )}

            {criticalActions.length > 0 && (
              <div className="flex gap-2 pt-4">
                <button className="bg-[#021422] text-white px-4 py-2 rounded text-xs font-bold uppercase">View All items</button>
              </div>
            )}
          </div>
        </DashboardSection>
          </>
        )}
      </div>


      <QuickActionBar
        title="PM QUICK ACTION BAR"
        actions={[
          { label: "Send Daily", icon: Send, variant: "dark" },
          { label: "Call Superv", icon: UserPlus, variant: "primary" },
          { label: "Add RFI", icon: Shield, variant: "dark" },
          { label: "Schedule Meeting", icon: BarChart3, variant: "primary" },
        ]}
      />
    </div>
  );
};

export default ExecutiveDashboard;
