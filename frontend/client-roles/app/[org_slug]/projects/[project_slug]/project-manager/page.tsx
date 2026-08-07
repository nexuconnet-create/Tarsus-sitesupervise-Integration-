"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import {
  Activity,
  Zap,
  Video,
  AlertCircle,
  Send,
  UserPlus,
  Shield,
  BarChart3,
} from "lucide-react";
import MetricCard from "./components/MetricCard";
import DashboardSection from "./components/DashboardSection";
import QuickActionBar from "./components/QuickActionBar";
import { projectManagerService } from "@/lib/services/projectManager";

const ExecutiveDashboard = () => {
  const [activeProject, setActiveProject] = React.useState<any>(null);
  const [strategicHealth, setStrategicHealth] = React.useState<any>(null);
  const [criticalActions, setCriticalActions] = React.useState<any[]>([]);
  const [cameras, setCameras] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        let project = null;
        try {
          const stored = localStorage.getItem("selected_project");
          if (stored) {
            project = JSON.parse(stored);
          }
        } catch (e) {}

        if (!project) {
          const projectsRes = await projectManagerService.getProjects();
          const fetchedProjects = Array.isArray(projectsRes.data)
            ? projectsRes.data
            : projectsRes.data?.results || [];
          if (fetchedProjects.length > 0) {
            project = fetchedProjects[0];
          }
        }

        if (project) {
          setActiveProject(project);
          console.log("[Executive Dashboard] Active Project:", project);
          console.log("[Executive Dashboard] Endpoints:", [
            `/api/v1/project-manager/dashboard/executive/${project.id}/`,
            `/api/v1/project-manager/dashboard/actions/${project.id}/`,
            `/api/v1/project-manager/dashboard/cameras/${project.id}/`,
          ]);

          const [healthRes, actionsRes, camerasRes] = await Promise.all([
            projectManagerService
              .getStrategicHealth(project.id)
              .catch(() => ({ data: null })),
            projectManagerService
              .getCriticalActions(project.id)
              .catch(() => ({ data: [] })),
            projectManagerService
              .getLiveCameras(project.id)
              .catch(() => ({ data: [] })),
          ]);

          console.log(
            "[Executive Dashboard] Strategic Health:",
            healthRes.data,
          );
          console.log(
            "[Executive Dashboard] Critical Actions:",
            actionsRes.data,
          );
          console.log("[Executive Dashboard] Live Cameras:", camerasRes.data);

          setStrategicHealth(healthRes.data);
          setCriticalActions(actionsRes.data);
          setCameras(camerasRes.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-bold">
        Synchronizing Command Center...
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        No active projects found. Please initialize a project in PM Settings
        first.
      </div>
    );
  }
  return (
    <div className="pb-24">
      {/* Header Info Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="text-2xl font-bold text-[#021422]">
          Project Command Center — {activeProject.name}
        </div>
        <div className="font-bold text-[#021422]">
          Status: {activeProject.status}
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Project Context */}
        <div className="space-y-1">
          <div className="text-gray-900 font-bold text-xl">
            Project: {activeProject.name} | Client:{" "}
            {activeProject.client || activeProject.company} | Phase:{" "}
            {activeProject.phase}
          </div>
          <div className="text-gray-600 text-base">
            Contract Value: $
            {parseFloat(activeProject.contract_value).toLocaleString()} |
            Started: {activeProject.start_date}
          </div>
        </div>

        {/* Strategic Health */}
        <DashboardSection
          title="Strategic Health"
          icon={<Activity size={20} />}
        >
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
                subValue={`Spent: $${strategicHealth?.budget_spent ? (Number(strategicHealth.budget_spent) / 1000000).toFixed(2) : "0.00"}M / Total: $${strategicHealth?.contract_value ? (Number(strategicHealth.contract_value) / 1000000).toFixed(2) : "0.00"}M`}
                trend="EVM Output"
              />
              <MetricCard
                title="Quality Score"
                value={strategicHealth?.quality_score || 0}
                unit="%"
                progress={strategicHealth?.quality_score || 0}
                trend={strategicHealth?.quality_status || "Unknown"}
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
                <span>
                  TCPI: {Number(strategicHealth?.tcpi || 1).toFixed(2)}
                </span>
              </div>
              <div className="space-y-1 text-base text-gray-600 italic">
                <p>
                  &quot;
                  {strategicHealth?.evm_insights?.cpi_text ||
                    "Cost performance is to plan"}
                  &quot;
                </p>
                <p>
                  &quot;
                  {strategicHealth?.evm_insights?.spi_text ||
                    "Schedule performance is to plan"}
                  &quot;
                </p>
              </div>
            </div>
          </div>
        </DashboardSection>

        {/* AI Predictive Insights */}
        <DashboardSection
          title="AI Predictive Insights"
          icon={<Zap size={20} />}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
              <Zap size={16} />
              <span>AI Strategic Predictions</span>
            </div>

            <div className="space-y-4">
              {strategicHealth?.ai_predictive_delay_alerts &&
              strategicHealth.ai_predictive_delay_alerts.length > 0 ? (
                strategicHealth.ai_predictive_delay_alerts.map(
                  (alert: any, idx: number) => (
                    <div key={idx} className="mb-4">
                      <div className="flex items-center gap-2 text-base font-bold text-red-600 mb-2">
                        <AlertCircle size={16} />
                        <span>{alert.priority} PROBABILITY:</span>
                      </div>
                      <ul className="list-disc list-inside text-base text-gray-700 space-y-1 ml-2">
                        <li>{alert.title}</li>
                        <li>{alert.message_template}</li>
                      </ul>
                      {alert.suggested_actions &&
                        alert.suggested_actions.length > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1">
                              <Activity size={14} className="text-gray-500" />
                              <span>RECOMMENDED ACTIONS:</span>
                            </div>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                              {alert.suggested_actions.map(
                                (act: string, i: number) => (
                                  <li key={i}>{act}</li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  ),
                )
              ) : (
                <div className="text-gray-500">
                  No predictive delay alerts at this time. Great job!
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t pt-6">
              <div className="text-sm font-bold text-gray-500 uppercase">
                AI CONFIDENCE:{" "}
                {strategicHealth?.health_status === "GOOD" ? "HIGH" : "STABLE"}
              </div>
              <div className="flex gap-2">
                <button className="bg-[#021422] text-white px-4 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">
                  Resolve Actions
                </button>
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
              {cameras.length > 0 ? (
                cameras.slice(0, 4).map((cam: any, idx) => (
                  <div
                    key={idx}
                    className="aspect-video bg-[#021422] rounded flex flex-col items-center justify-center p-4 border border-gray-700"
                  >
                    <div className="bg-black/40 text-white text-xs font-bold px-3 py-1 rounded inline-block mb-3 border border-white/20">
                      {cam.camera_name}
                    </div>
                    <div className="text-white/60 text-sm font-medium">
                      {cam.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 aspect-video bg-gray-100 rounded flex items-center justify-center p-4 border border-gray-200">
                  <div className="text-gray-500 font-bold">
                    No cameras connected to this site
                  </div>
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
                    <span>
                      Digital Twin Minimap is SYNCED with live footage
                    </span>
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
        <DashboardSection
          title="Critical Action Queue"
          icon={<AlertCircle size={20} />}
        >
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
              <Activity size={16} />
              <span>REQUIRED PM DECISION ({criticalActions.length} ITEMS)</span>
            </div>

            {criticalActions.length > 0 ? (
              criticalActions.map((action, idx) => (
                <div
                  key={idx}
                  className={`space-y-4 ${idx > 0 ? "pt-6 border-t border-gray-100" : ""}`}
                >
                  <div className="text-base">
                    <span className="font-bold">
                      {idx + 1}. {action.title}
                    </span>
                    <span className="text-gray-500">
                      {" "}
                      [{action.target_type}]
                    </span>
                  </div>
                  <div className="text-base text-gray-600">
                    Urgency: {action.urgency}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button className="bg-[#021422] text-white px-6 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">
                      Resolve
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 font-bold">
                No critical actions pending.
              </div>
            )}

            {criticalActions.length > 0 && (
              <div className="flex gap-2 pt-4">
                <button className="bg-[#021422] text-white px-4 py-2 rounded text-xs font-bold uppercase">
                  View All items
                </button>
              </div>
            )}
          </div>
        </DashboardSection>
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
