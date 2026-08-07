"use client";

import React from "react";
import {
    Zap,
    Bell,
    Send,
    FileText,
    Settings,
    ShieldCheck,
    BarChart2,
    AlertTriangle,
    PieChart,
    Lock
} from "lucide-react";
import DashboardSection from "./components/DashboardSection";
import ProjectSetupForm from "./components/ProjectSetupForm";
import CrewAssignmentForm from "./components/CrewAssignmentForm";
import { projectManagerService } from "../../../../lib/services";

const AdminSettings = () => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [healthData, setHealthData] = React.useState<any>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [systemAlerts, setSystemAlerts] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                let project = null;
                try {
                    const stored = localStorage.getItem('selected_project');
                    if (stored) project = JSON.parse(stored);
                } catch (e) { }
                if (!project) {
                    const res = await projectManagerService.getProjects();
                    const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                    if (list.length > 0) project = list[0];
                }
                if (project) {
                    const [healthRes, alertsRes] = await Promise.all([
                        projectManagerService.getStrategicHealth(project.id).catch(() => ({ data: null })),
                        projectManagerService.getSystemAlerts(project.id).catch(() => ({ data: [] }))
                    ]);

                    console.log('[Admin Settings] Active Project:', project);
                    console.log('[Admin Settings] Endpoints:', [
                        `/api/v1/project-manager/dashboard/strategic-health/${project.id}/`,
                        `/api/v1/project-manager/dashboard/system-alerts/${project.id}/`
                    ]);
                    console.log('[Admin Settings] Strategic Health:', healthRes.data);
                    console.log('[Admin Settings] Admin Auto-Setup Configuration loaded');

                    setHealthData(healthRes.data);
                    setSystemAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : (alertsRes.data?.results || []));
                }
            } catch (err) {
                console.error("Failed to load settings data", err);
            }
        };
        fetchData();
    }, []);

    const safetyScore = healthData?.safety_score ?? healthData?.site_safety_score ?? null;
    const budgetVariance = healthData?.budget_variance ?? null;
    const qualityScore = healthData?.quality_score ?? null;
    const spi = healthData?.spi ?? null;
    const metrics: { label: string; value: string; color: string }[] = [
        { label: "Safety", value: safetyScore != null ? `${safetyScore}%` : '�', color: "#0166B0" },
        { label: "Budget Variance", value: budgetVariance != null ? `${budgetVariance > 0 ? '+' : ''}${budgetVariance}%` : '�', color: (budgetVariance != null && budgetVariance < 0) ? '#dc2626' : '#0166B0' },
        { label: "Quality", value: qualityScore != null ? `${qualityScore}%` : '�', color: "#0166B0" },
        { label: "SPI", value: spi != null ? spi.toFixed(2) : '�', color: "#0166B0" }
    ];

    return (
        <div className="pb-24 text-[#021422]">
            {/* Header Info Bar */}
            <div className="bg-[#021422] text-white p-4 px-8 flex justify-between items-center text-sm border-b border-gray-800">
                <div className="font-bold tracking-widest uppercase">Admin Quick Command Bar</div>
                <div className="flex gap-4">
                    <button className="bg-white/10 px-6 py-1 rounded uppercase font-bold text-xs hover:bg-white/20 transition-colors">Minimize</button>
                    <button className="bg-white/10 px-6 py-1 rounded uppercase font-bold text-xs hover:bg-white/20 transition-colors flex items-center gap-1"><Lock size={12} /> Pin</button>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Essential Controls */}
                <DashboardSection title="Essential Controls" icon={<Settings size={20} />}>
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-sm font-bold uppercase text-amber-600 tracking-widest">
                                <AlertTriangle size={16} />
                                <span>Critical Metrics At-A-Glance:</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {metrics.map((metric, idx) => {
                                    const numVal = parseFloat(metric.value.replace('%', '').replace('+', '').replace('�', '0'));
                                    const pct = isNaN(numVal) ? 0 : Math.min(100, Math.abs(numVal));
                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-3">
                                            <div className="relative w-16 h-16 flex items-center justify-center text-sm font-bold">
                                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                    <circle cx="32" cy="32" r="28" fill="none" stroke="#E3E3E3" strokeWidth="6" />
                                                    <circle cx="32" cy="32" r="28" fill="none" stroke={metric.color} strokeWidth="6" strokeDasharray="175" strokeDashoffset={175 - (175 * pct) / 100} />
                                                </svg>
                                                <span>{metric.value}</span>
                                            </div>
                                            <div className="text-sm font-bold uppercase text-gray-500">{metric.label}:</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm font-bold uppercase text-gray-900 tracking-widest">
                                <Bell size={16} />
                                <span>Priority Alerts ({systemAlerts.length}):</span>
                            </div>

                            <div className="space-y-4">
{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {systemAlerts.length > 0 ? systemAlerts.slice(0, 5).map((alert: any, idx: number) => (
                                    <div key={idx} className="text-sm font-bold uppercase text-gray-700 pl-4">{idx + 1}. {alert.title || alert.message || alert.alert_type}</div>
                                )) : (
                                    <div className="text-sm text-gray-500 pl-4">No system alerts at this time.</div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button className="bg-[#021422] text-white px-10 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">View All</button>
                                <button className="bg-[#0166B0] text-white px-10 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-blue-700">Acknowledge All</button>
                            </div>
                        </div>
                    </div>
                </DashboardSection>

                {/* Quick Actions */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4">Quick Actions:</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Draft Email", icon: Send, variant: "dark" },
                        { label: "Edit PCO", icon: FileText, variant: "primary" },
                        { label: "Add RFI", icon: Zap, variant: "dark" },
                        { label: "Generate Report", icon: BarChart2, variant: "primary" },
                        { label: "Approve Request", icon: ShieldCheck, variant: "dark" },
                        { label: "Resolve Issue", icon: AlertTriangle, variant: "primary" },
                        { label: "Set Priority", icon: Settings, variant: "dark" }
                    ].map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <button key={idx} className={`flex items-center justify-center gap-2 p-4 rounded font-bold text-sm uppercase transition-colors ${action.variant === "primary" ? "bg-[#0166B0] text-white" : "bg-[#021422] text-white hover:bg-gray-800"
                                }`}>
                                <Icon size={16} />
                                {action.label}
                            </button>
                        );
                    })}
                </div>

                {/* One-Click Reports */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4 pt-4">One-Click Reports:</div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { label: "Executive Summary", icon: PieChart, variant: "dark" },
                        { label: "Financial Snapshot", icon: BarChart2, variant: "primary" },
                        { label: "Risk Overview", icon: AlertTriangle, variant: "dark" },
                        { label: "Stakeholder Update", icon: PieChart, variant: "dark" },
                        { label: "Performance Dashboard", icon: BarChart2, variant: "primary" }
                    ].map((report, idx) => {
                        const Icon = report.icon;
                        return (
                            <button key={idx} className={`flex items-center justify-center gap-2 p-4 rounded font-bold text-sm uppercase transition-colors ${report.variant === "primary" ? "bg-[#0166B0] text-white" : "bg-[#021422] text-white hover:bg-gray-800"
                                }`}>
                                <Icon size={16} />
                                {report.label}
                            </button>
                        );
                    })}
                </div>

                {/* AI Assistant */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4 pt-4">AI Assistant:</div>
                <div className="bg-white border rounded-xl p-12 space-y-8 flex flex-col items-center justify-center">
                    <div className="space-y-6 w-full max-w-lg text-center font-bold text-base text-gray-800">
                        <div className="hover:text-[#0166B0] cursor-pointer transition-colors">&quot;AI, what&apos;s my top priority?&quot;</div>
                        <div className="hover:text-[#0166B0] cursor-pointer transition-colors">&quot;AI, draft client update&quot;</div>
                        <div className="hover:text-[#0166B0] cursor-pointer transition-colors">&quot;AI, analyze schedule risk&quot;</div>
                    </div>
                </div>

                {/* Project Initialization */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4 pt-4">Project DNA &amp; Setup:</div>
                <div className="space-y-4 pb-12">
                    <ProjectSetupForm />
                    <CrewAssignmentForm />
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;