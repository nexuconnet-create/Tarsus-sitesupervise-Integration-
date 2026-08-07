"use client";

import React from "react";
import {
    Users,
    Layout,
    MessageSquare,
    FileBox,
    PieChart,
    Mail,
    UserCheck,
    Briefcase,
    Send,
    Settings,
    Calendar,
    Grid
} from "lucide-react";
import DashboardSection from "../components/DashboardSection";
import { projectManagerService } from "@/lib/services";

const StakeholderHub = () => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [activeProject, setActiveProject] = React.useState<any>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [crmImpact, setCrmImpact] = React.useState<any[]>([]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [crewPerformance, setCrewPerformance] = React.useState<any[]>([]);
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

                    const [performanceRes, crmRes] = await Promise.all([
                        projectManagerService.getCrewPerformance(project.id).catch(() => ({ data: [] })),
                        projectManagerService.getCRMImpact(project.id).catch(() => ({ data: [] }))
                    ]);

                    console.log('[Stakeholder Hub] Active Project:', project);
                    console.log('[Stakeholder Hub] Endpoints:', [
                        `/api/v1/project-manager/dashboard/crew-performance/${project.id}/`,
                        `/api/v1/project-manager/dashboard/crm-impact/${project.id}/`
                    ]);
                    console.log('[Stakeholder Hub] Crew Performance:', performanceRes.data);
                    console.log('[Stakeholder Hub] CRM Impact:', crmRes.data);

                    setCrewPerformance(performanceRes.data);
                    setCrmImpact(crmRes.data);
                }
            } catch (err) {
                console.error("Failed to load stakeholder data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500 font-bold">Synchronizing Stakeholder Networks...</div>;
    }

    if (!activeProject) {
        return <div className="p-8 text-center text-red-500 font-bold">No active projects found. Please initialize a project in PM Settings first.</div>;
    }
    return (
        <div className="pb-24">
            {/* Header Info Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
                <div className="text-2xl font-bold text-[#021422]">Stakeholder HUB — {activeProject.name}</div>
                <div className="border-1 border-gray-300 py-2 px-3 rounded font-semibold text-[#021422]">Auto-Stakeholder AI</div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Stakeholder Matrix */}
                <DashboardSection title="Stakeholder Matrix" icon={<Grid size={20} />}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <Users size={16} />
                            <span>STAKEHOLDER INFLUENCE/INTEREST MATRIX</span>
                        </div>

                        <div className="h-96 w-full flex gap-1">
                            {/* Simplified Treemap/Matrix Representation */}
                            <div className="w-1/4 h-full bg-black"></div>
                            <div className="w-1/3 h-full bg-[#8B5CF6]"></div>
                            <div className="w-5/12 h-full flex flex-col gap-1">
                                <div className="h-1/2 bg-[#06B6D4]"></div>
                                <div className="h-1/2 bg-[#F97316]"></div>
                            </div>
                        </div>
                        <div className="h-1 bg-[#FCA5A5] w-full"></div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-xs font-bold text-gray-500 uppercase">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-black"></div> High Power / High Interest (Monitor Closely)</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#FCA5A5]"></div> High Power / Low Interest (Keep Satisfied)</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#06B6D4]"></div> Low Power / High Interest (Keep Informed)</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#F97316]"></div> Low Power / Low Interest (Monitor)</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#8B5CF6]"></div> Low Power / Engagement (Active Engagement)</div>
                        </div>
                    </div>
                </DashboardSection>

                {/* Key Stakeholder Dashboards */}
                <DashboardSection title="Key Stakeholder Dashboards" icon={<Layout size={20} />}>
                    <div className="space-y-12">
                        {/* Client Dashboard */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                                <Briefcase size={16} />
                                <span>CLIENT CRM IMPACT ({activeProject.client || activeProject.company})</span>
                            </div>
                            <div className="text-base text-gray-700 space-y-3 font-medium">
{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {crmImpact && crmImpact.length > 0 ? crmImpact.map((crm: any, idx: number) => (
                                    <div key={idx} className="bg-gray-50 p-4 border rounded">
                                        <div className="font-bold text-gray-900 border-b pb-2 mb-2">{crm.request_type || crm.title} (Status: {crm.status})</div>
                                        <div className="flex gap-6 mt-2">
                                            <span className="text-red-600 font-bold text-sm">Cost Impact: ${crm.cost_impact?.toLocaleString() || 0}</span>
                                            <span className="text-amber-600 font-bold text-sm">Schedule Impact: {crm.schedule_impact_days != null ? `${crm.schedule_impact_days} Days` : 'N/A'}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-gray-500">No recent client CRM impacts recorded.</div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button className="bg-[#021422] text-white px-6 py-2 rounded text-xs font-bold uppercase transition-colors hover:bg-gray-800">View Client Portal</button>
                                <button className="bg-[#0166B0] text-white px-6 py-2 rounded text-xs font-bold uppercase transition-colors hover:bg-blue-700">Update Pipeline</button>
                                <button className="bg-[#021422] text-white px-6 py-2 rounded text-xs font-bold uppercase transition-colors hover:bg-gray-800">Email Pipeline</button>
                            </div>
                        </div>

                        <div className="space-y-6 pt-8 border-t border-dashed border-gray-200">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                                <Settings size={16} />
                                <span>CREW PERFORMANCE SNAPSHOT</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {crewPerformance && crewPerformance.length > 0 ? crewPerformance.map((crew: any, idx: number) => (
                                    <div key={idx} className="border p-4 rounded text-base text-gray-700 space-y-2 font-medium">
                                        <div className="font-bold text-[#0166B0] uppercase border-b pb-1">{crew.name}</div>
                                        <div className="flex justify-between text-sm"><span>Safety Score</span> <span>{crew.performance_metrics?.safety != null ? `${crew.performance_metrics.safety}%` : "—"}</span></div>
                                        <div className="flex justify-between text-sm"><span>Efficiency</span> <span>{crew.performance_metrics?.efficiency != null ? `${crew.performance_metrics.efficiency}%` : "—"}</span></div>
                                        <div className="flex justify-between text-sm"><span>Quality</span> <span>{crew.performance_metrics?.quality != null ? `${crew.performance_metrics.quality}%` : "—"}</span></div>
                                        <div className="flex justify-between text-sm"><span>Collaboration</span> <span>{crew.performance_metrics?.collaboration != null ? `${crew.performance_metrics.collaboration}%` : "—"}</span></div>
                                    </div>
                                )) : (
                                    <div className="text-gray-500 text-base font-medium">No crew performance metrics available yet.</div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button className="bg-[#021422] text-white px-6 py-2 rounded text-xs font-bold uppercase transition-colors hover:bg-gray-800">Submit Permit DOC</button>
                                <button className="bg-[#0166B0] text-white px-6 py-2 rounded text-xs font-bold uppercase transition-colors hover:bg-blue-700">Schedule Inspection</button>
                            </div>
                        </div>
                    </div>
                </DashboardSection>

                {/* AI Communication Manager */}
                <DashboardSection title="AI Communication Manager" icon={<MessageSquare size={20} />}>
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <Calendar size={16} />
                            <span>AI COMMUNICATION SCHEDULER</span>
                        </div>

                        <div className="space-y-6">
                            <div className="text-sm font-bold uppercase">UPCOMING STAKEHOLDER COMMUNICATIONS:</div>
                            <div className="text-gray-500 font-medium text-base">No upcoming stakeholder communications scheduled.</div>
                        </div>

                        <div className="space-y-6">
                            <div className="text-sm font-bold uppercase">SENTIMENT MONITORING:</div>
                            <div className="text-gray-500 font-medium text-base">No sentiment data available yet.</div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button className="bg-[#021422] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">Settings</button>
                            <button className="bg-[#0166B0] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-blue-700">Email All Comms</button>
                        </div>
                    </div>
                </DashboardSection>

                {/* Auto-Reporting Engine */}
                <DashboardSection title="Auto-Reporting Engine" icon={<FileBox size={20} />}>
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <PieChart size={16} />
                            <span>AI-GENERATED REPORTS (Customized by Stakeholder)</span>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="text-xs font-bold uppercase text-gray-900">CLIENT REPORT:</div>
                                <ul className="text-xs text-gray-600 space-y-2 uppercase font-bold">
                                    <li>• Executive Summary (3 page)</li>
                                    <li>• Financial (High-level, by item)</li>
                                    <li>• Progress (Visual, Milestone-focused)</li>
                                    <li>• Risk (Strategic options outlined)</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <div className="text-xs font-bold uppercase text-gray-900">INVESTOR REPORT:</div>
                                <ul className="text-xs text-gray-600 space-y-2 uppercase font-bold">
                                    <li>• ROI projections</li>
                                    <li>• Market Comparison</li>
                                    <li>• Risk-adjusted returns</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <div className="text-xs font-bold uppercase text-gray-900">SUB-REGULATOR REPORT:</div>
                                <ul className="text-xs text-gray-600 space-y-2 uppercase font-bold">
                                    <li>• Compliance Status</li>
                                    <li>• Safety Metrics</li>
                                    <li>• Environmental impact</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button className="bg-[#021422] text-white px-6 py-2 rounded text-xs font-bold uppercase transition-colors hover:bg-gray-800">Edit Template</button>
                            <button className="bg-[#0166B0] text-white px-6 py-2 rounded text-xs font-bold uppercase transition-colors hover:bg-blue-700">Full Template</button>
                            <button className="bg-[#021422] text-white px-6 py-2 rounded text-xs font-bold uppercase transition-colors hover:bg-gray-800">Reporting Logs</button>
                        </div>
                    </div>
                </DashboardSection>

                {/* Stakeholder Controls Section */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4">Stakeholder Controls:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-12">
                    {[
                        { label: "New Stakeholder", icon: UserCheck, variant: "dark" },
                        { label: "Schedule Comms", icon: Mail, variant: "primary" },
                        { label: "Manage Login", icon: Layout, variant: "dark" },
                        { label: "Distribute Report", icon: Send, variant: "primary" },
                        { label: "Community Insights", icon: Users, variant: "dark" }
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


export default StakeholderHub;
