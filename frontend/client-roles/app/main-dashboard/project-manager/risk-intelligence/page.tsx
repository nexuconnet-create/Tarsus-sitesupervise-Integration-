"use client";

import React from "react";
import {
    Activity,
    AlertTriangle,
    TrendingDown,
    TrendingUp,
    Map,
    CheckCircle2,
    ShieldAlert,
    FileWarning,
    PlusCircle,
    Calendar,
    Layers,
    Zap
} from "lucide-react";
import DashboardSection from "../components/DashboardSection";
import QuickActionBar from "../components/QuickActionBar";
import { projectManagerService } from "../../../../lib/services";

const RiskIntelligence = () => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [activeProject, setActiveProject] = React.useState<any>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [predictiveDelay, setPredictiveDelay] = React.useState<any>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [systemAlerts, setSystemAlerts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let project = null;
                try {
                    const stored = localStorage.getItem('selected_project');
                    if (stored) {
                        project = JSON.parse(stored);
                    }
                } catch (e) { }

                if (!project) {
                    const projectsRes = await projectManagerService.getProjects();
                    const fetchedProjects = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data?.results || []);
                    if (fetchedProjects.length > 0) {
                        project = fetchedProjects[0];
                    }
                }

                if (project) {
                    setActiveProject(project);

                    const [delayRes, alertsRes] = await Promise.all([
                        projectManagerService.getPredictiveDelay(project.id).catch(() => ({ data: null })),
                        projectManagerService.getSystemAlerts(project.id).catch(() => ({ data: [] }))
                    ]);

                    console.log('[Risk Intelligence] Active Project:', project);
                    console.log('[Risk Intelligence] Endpoints:', [
                        `/api/v1/project-manager/dashboard/predictive-delay/${project.id}/`,
                        `/api/v1/project-manager/dashboard/system-alerts/${project.id}/`
                    ]);
                    console.log('[Risk Intelligence] Predictive Delay:', delayRes.data);
                    console.log('[Risk Intelligence] System Alerts:', alertsRes.data);

                    setPredictiveDelay(delayRes.data);
                    // Alerts endpoint might return paginated { results: [] } or just [] depending on DRF configuration
                    setSystemAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : alertsRes.data?.results || []);
                }
            } catch (err) {
                console.error("Failed to load risk intelligence data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500 font-bold">Initializing Threat Detection...</div>;
    }

    if (!activeProject) {
        return <div className="p-8 text-center text-red-500 font-bold">No active projects found. Please initialize a project in PM Settings first.</div>;
    }
    return (
        <div className="pb-24">
            {/* Header Info Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
                <div className="text-2xl font-bold text-[#021422]">Risk Intelligence HUB — {activeProject.name}</div>
                <div className="bg-white/10 px-4 py-1 rounded">Proactive Mode</div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Risk Heat Map */}
                <DashboardSection title="Risk Heat Map" icon={<Map size={20} />}>
                    <div className="space-y-6">
                        <div className="h-64 w-full bg-gray-50 rounded-lg border border-gray-200 p-8 relative overflow-hidden">
                            <div className="absolute top-4 left-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Risk Heat Map</div>
                            {/* SVG representation of the heat map lines */}
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                                <path
                                    d="M 0,35 Q 20,20 40,25 T 100,10"
                                    fill="none"
                                    stroke="#EAB308"
                                    strokeWidth="0.5"
                                    className="opacity-80"
                                />
                                <path
                                    d="M 0,35 Q 20,20 40,25 T 100,10 L 100,40 L 0,40 Z"
                                    fill="#FEF9C3"
                                    className="opacity-30"
                                />
                                <path
                                    d="M 0,35 Q 15,30 30,32 T 60,18 T 100,15"
                                    fill="none"
                                    stroke="#DC2626"
                                    strokeWidth="0.5"
                                    className="opacity-80"
                                />
                                <path
                                    d="M 0,35 Q 15,30 30,32 T 60,18 T 100,15 L 100,40 L 0,40 Z"
                                    fill="#FEE2E2"
                                    className="opacity-30"
                                />
                            </svg>
                            <div className="absolute inset-x-8 bottom-4 flex justify-between text-[10px] text-gray-400 font-bold">
                                <span>0</span>
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                                <span>5</span>
                                <span>6</span>
                                <span>7</span>
                            </div>
                        </div>

                        <div className="flex gap-8 border-t pt-4">
                            <div className="text-sm font-bold text-gray-900 uppercase">Risk Trend Arrow:</div>
                            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                <span className="flex items-center gap-1 uppercase"><TrendingUp size={14} className="text-red-600" /> Increasing</span>
                                <span className="flex items-center gap-1 uppercase"><Activity size={14} className="text-yellow-500" /> Stable</span>
                                <span className="flex items-center gap-1 uppercase"><TrendingDown size={14} className="text-green-600" /> Decreasing</span>
                            </div>
                        </div>
                    </div>
                </DashboardSection>

                {/* Top 5 Active Risks */}
                <DashboardSection title="Top 5 Active Risks" icon={<AlertTriangle size={20} />}>
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <ShieldAlert size={16} />
                            <span>CRITICAL RISKS (REQUIRES PM ATTENTION)</span>
                        </div>

                        <div className="space-y-10">
{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {systemAlerts && systemAlerts.length > 0 ? systemAlerts.map((risk: any, idx: number) => (
                                <div key={idx} className={`${idx !== 0 ? "pt-8 border-t border-dashed border-gray-200" : ""} space-y-4`}>
                                    <div className="font-bold text-base">{idx + 1}. {risk.title || risk.alert_type}</div>
                                    <div className="flex items-center gap-12">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 font-bold uppercase">Severity:</span>
                                            <div className="relative w-12 h-12 flex items-center justify-center">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="24" cy="24" r="20" stroke="#f3f4f6" strokeWidth="4" fill="transparent" />
                                                    <circle
                                                        cx="24" cy="24" r="20" stroke={risk.severity === 'CRITICAL' ? "#DC2626" : risk.severity === 'HIGH' ? "#EAB308" : "#0166B0"}
                                                        strokeWidth="4" fill="transparent"
                                                        strokeDasharray={125.6}
                                                        strokeDashoffset={125.6 - ((risk.severity === 'CRITICAL' ? 95 : risk.severity === 'HIGH' ? 75 : 40) / 100) * 125.6}
                                                    />
                                                </svg>
                                                <span className="absolute text-[10px] font-bold">{risk.severity}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gray-500 font-bold uppercase">Impact: {risk.message}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium italic space-y-1">
                                        <div className="text-gray-900 border-b border-dotted w-fit pb-0.5">Status: {risk.is_resolved ? 'Resolved' : 'PM Review Requested'}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-gray-500 font-bold p-4">No active system alerts or risks detected.</div>
                            )}
                        </div>
                    </div>
                </DashboardSection>

                {/* AI Risk Prediction */}
                <DashboardSection title="AI Risk Prediction" icon={<Zap size={20} />}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <Zap size={16} />
                            <span>AI RISK FORECAST (Next 30 Days)</span>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm font-bold uppercase">EMERGING RISKS:</div>
                            <ul className="text-sm text-gray-700 space-y-4">
                                {predictiveDelay?.factors && predictiveDelay.factors.length > 0 ? (
                                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                    predictiveDelay.factors.map((factor: any, idx: number) => (
                                        <li key={idx} className="space-y-1">
                                            <div className="font-bold">• {factor.type}: {factor.impact_days} day{factor.impact_days !== 1 ? 's' : ''} impact</div>
                                            <div className="text-gray-500 italic">{factor.reason}</div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500 font-bold p-4">No predictive AI delay alerts found.</li>
                                )}
                            </ul>
                            {predictiveDelay?.overall_delay_risk && (
                                <div className="text-xs font-bold uppercase pt-2">
                                    Overall Delay Risk: <span className={predictiveDelay.overall_delay_risk === 'HIGH' ? 'text-red-600' : predictiveDelay.overall_delay_risk === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}>{predictiveDelay.overall_delay_risk}</span>
                                    {predictiveDelay.total_predicted_delay_days > 0 && ` — ${predictiveDelay.total_predicted_delay_days} day(s) predicted`}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-6 border-t pt-6">
                            <div className="flex gap-2">
                                <button className="bg-[#021422] text-white px-6 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">Generate Report</button>
                                <button className="bg-[#0166B0] text-white px-6 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-blue-700">Live Forecast</button>
                            </div>
                        </div>
                    </div>
                </DashboardSection>

                {/* Risk Mitigation Tracker */}
                <DashboardSection title="Risk Mitigation Tracker" icon={<Layers size={20} />}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <CheckCircle2 size={16} />
                            <span>MITIGATION ACTION STATUS</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 text-gray-500 font-bold border-y uppercase">
                                    <tr>
                                        <th className="px-4 py-3">RISK</th>
                                        <th className="px-4 py-3">MITIGATION ACTION</th>
                                        <th className="px-4 py-3">DUE DATE</th>
                                        <th className="px-4 py-3">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-gray-700 font-medium text-sm">
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500 font-bold">No mitigation actions logged yet.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-2 text-xs pt-4 border-t border-dotted">
                            <button className="bg-[#021422] text-white px-6 py-2 rounded font-bold uppercase transition-colors hover:bg-gray-800">View Mitigation Log</button>
                            <button className="bg-[#0166B0] text-white px-6 py-2 rounded font-bold uppercase transition-colors hover:bg-blue-700">Adjust Actions</button>
                            <button className="bg-[#021422] text-white px-6 py-2 rounded font-bold uppercase transition-colors hover:bg-gray-800">Audit</button>
                        </div>
                    </div>
                </DashboardSection>

                {/* Risk Controls Bar */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4">Risk Controls:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-12">
                    {[
                        { label: "New Risk Log", icon: FileWarning, variant: "dark" },
                        { label: "Register Event", icon: CheckCircle2, variant: "primary" },
                        { label: "Alert Team", icon: ShieldAlert, variant: "dark" },
                        { label: "Submit Audit", icon: Zap, variant: "primary" },
                        { label: "Insurance Claims", icon: Activity, variant: "dark" }
                    ].map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <button key={idx} className={`flex items-center justify-center gap-2 p-4 rounded font-bold text-sm transition-colors ${action.variant === "primary" ? "bg-[#0166B0] text-white" : "bg-[#021422] text-white hover:bg-gray-800"
                                }`}>
                                <Icon size={16} />
                                {action.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};


export default RiskIntelligence;
