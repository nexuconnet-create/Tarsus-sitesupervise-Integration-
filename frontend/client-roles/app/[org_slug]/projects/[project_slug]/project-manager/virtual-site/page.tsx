"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import BackButton from "@/components/BackButton";

import React from "react";
import {
    Camera,
    Zap,
    Layers,
    Maximize2,
    Target,
    Activity,
    ShieldAlert,
    Box,
    Mic,
    PenTool,
    Ruler,
    Video,
    Database,
    Monitor,
    Layout,
    Radio,
    Settings,
    Share2,
    Cpu
} from "lucide-react";
import DashboardSection from "../components/DashboardSection";
import { projectManagerService } from "@/lib/services";

const VirtualSite = () => {
    const [activeProject, setActiveProject] = React.useState<any>(null);
    const [cameras, setCameras] = React.useState<string[]>([]);
    const [meetings, setMeetings] = React.useState<any[]>([]);
    const [arVerifications, setArVerifications] = React.useState<any[]>([]);
    const [analytics, setAnalytics] = React.useState<any>(null);
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

                    const [cctvRes, meetingsRes, arRes, analyticsRes] = await Promise.all([
                        projectManagerService.getCCTVConfig(project.id).catch(() => ({ data: { active_cameras: [] } })),
                        projectManagerService.getMeetings(project.id).catch(() => ({ data: [] })),
                        projectManagerService.getARVerifications(project.id).catch(() => ({ data: [] })),
                        projectManagerService.getPredictiveDelay(project.id).catch(() => ({ data: null }))
                    ]);

                    console.log('[Virtual Site] Active Project:', project);
                    console.log('[Virtual Site] Endpoints:', [
                        `/api/v1/project-manager/virtual-site/cctv/${project.id}/`,
                        `projectManagerService.getMeetings(${project.id})`,
                        `/api/v1/project-manager/virtual-site/ar-sessions/${project.id}/`,
                        `projectManagerService.getPredictiveDelay(${project.id})`
                    ]);
                    console.log('[Virtual Site] CCTV Config:', cctvRes.data);
                    console.log('[Virtual Site] Meetings:', meetingsRes.data);
                    console.log('[Virtual Site] AR Verifications:', arRes.data);
                    console.log('[Virtual Site] Analytics/Delay:', analyticsRes.data);

                    setCameras(cctvRes.data?.active_cameras || []);
                    setMeetings(Array.isArray(meetingsRes.data) ? meetingsRes.data : (meetingsRes.data?.results || []));
                    setArVerifications(Array.isArray(arRes.data) ? arRes.data : (arRes.data?.results || []));
                    setAnalytics(analyticsRes.data);
                }
            } catch (err) {
                console.error("Failed to load virtual site data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500 font-bold">Establishing AR Uplink...</div>;
    }

    if (!activeProject) {
        return <div className="p-8 text-center text-red-500 font-bold">No active projects found. Please initialize a project in PM Settings first.</div>;
    }
    return (
        <div className="pb-24 text-[#021422]">
            {/* Header Info Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
                <div className="flex items-center gap-3"><BackButton /><div className="text-2xl font-bold text-[#021422]">VIRTUAL SITE COMMAND — {activeProject.name}</div></div>
                <div className="border-1 border-gray-300 py-2 px-3 rounded font-semibold text-[#021422]">AR ENGINE ACTIVE</div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Multi-Camera AR View */}
                <DashboardSection title="Multi-Camera AR View" icon={<Camera size={20} />}>
                    <div className="space-y-8">
                        <div className="flex justify-between items-center text-sm font-bold uppercase text-gray-500 mb-2">
                            <span>Split-screen AR views:</span>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1 text-red-600"><Radio size={14} /> LIVE</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 border border-gray-800 bg-[#021422] p-1 rounded-sm">
                            {cameras && cameras.length > 0 ? cameras.map((camName: string, idx: number) => (
                                <div key={idx} className="aspect-video relative group overflow-hidden border border-gray-800 flex flex-col items-center justify-center bg-black/80">
                                    {/* AR Overlays */}
                                    <div className="absolute inset-0">
                                        <div className="absolute top-4 left-4 border-l border-t border-cyan-400 w-8 h-8 opacity-60" />
                                        <div className="absolute top-4 right-4 border-r border-t border-cyan-400 w-8 h-8 opacity-60" />
                                        <div className="absolute bottom-4 left-4 border-l border-b border-cyan-400 w-8 h-8 opacity-60" />
                                        <div className="absolute bottom-4 right-4 border-r border-b border-cyan-400 w-8 h-8 opacity-60" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                            <Target size={48} className="text-cyan-400" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 flex justify-between items-end backdrop-blur-sm">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">CAM {idx + 1}</div>
                                            <div className="text-sm font-bold text-white uppercase">{camName}</div>
                                        </div>
                                        <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded uppercase">AR: Active</span>
                                    </div>

                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors">
                                            <Maximize2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 aspect-video flex items-center justify-center bg-[#021422]/80 rounded">
                                    <div className="text-white/50 font-bold uppercase text-sm">No cameras connected to this site</div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="space-y-4 pt-4">
                                <div className="text-sm font-bold uppercase text-gray-500 tracking-widest">AR ENHANCEMENTS:</div>
                                <ul className="text-sm text-gray-600 space-y-2 font-medium bg-gray-50 p-4 border rounded">
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#0166B0]" /> Progress percentage overlay in real-time</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#0166B0]" /> Safety Hazard detection (AI real-time)</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#0166B0]" /> Productivity heat maps per zone</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#0166B0]" /> Drone view highlighting grid alignment</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#0166B0]" /> Material tracking tags (RFID/Visual)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </DashboardSection>

                {/* Remote AR Command Controls */}
                <DashboardSection title="Remote AR Command Controls" icon={<Maximize2 size={20} />}>
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-bold uppercase text-gray-500 tracking-widest">
                                <Monitor size={16} />
                                <span>REMOTE AR INTERVENTION:</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold uppercase text-gray-400">SELECT ITEM:</span>
                                <select className="border-b border-gray-300 text-sm font-bold uppercase py-1 focus:outline-none bg-transparent">
                                    <option value="">Select a site element...</option>
                                    {arVerifications.map((v: any, idx: number) => (
                                        <option key={idx} value={v.work_package_id}>{v.work_package_id}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm font-bold uppercase text-gray-500 tracking-widest">AR ANNOTATION TOOLS:</div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: "Point Cloud Select", icon: Box, variant: "dark" },
                                    { label: "Measurement Tool", icon: Ruler, variant: "primary" },
                                    { label: "AI Annotation", icon: PenTool, variant: "dark" },
                                    { label: "Remote Voice Link", icon: Mic, variant: "primary" }
                                ].map((tool, idx) => (
                                    <button key={idx} className={`flex items-center justify-center gap-2 p-3 rounded font-bold text-sm uppercase transition-colors ${tool.variant === "primary" ? "bg-[#0166B0] text-white" : "bg-[#021422] text-white hover:bg-gray-800"
                                        }`}>
                                        <tool.icon size={16} />
                                        {tool.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="text-sm font-bold uppercase text-gray-500 tracking-widest">AI-ASSISTED COMMAND:</div>
                            <ul className="text-sm text-gray-600 space-y-2 font-medium italic">
                                <li>• [&quot;AI, highlight safety concerns in floor level 2&quot;]</li>
                                <li>• [&quot;AI, measure progress in Zone C1&quot;]</li>
                                <li>• [&quot;AI, compare as-built to design&quot;]</li>
                            </ul>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="text-sm font-bold uppercase text-gray-500 tracking-widest">BROADCAST TO SITE:</div>
                            <div className="space-y-2">
                                <button className="w-full bg-[#021422] text-white py-3 rounded text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">Broadcast Safety Alert</button>
                                <button className="w-full bg-[#0166B0] text-white py-3 rounded text-sm font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors">Launch Voice Link</button>
                                <button className="w-full bg-[#021422] text-white py-3 rounded text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">Annotate Site AR</button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="bg-[#021422] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">Audit Decision</button>
                            <button className="bg-[#0166B0] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-blue-700">Command Settings</button>
                        </div>

                        {meetings.length > 0 && (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="text-sm font-bold uppercase text-gray-500 tracking-widest">PROJECT MEETINGS:</div>
                                <div className="space-y-2">
                                    {meetings.map((meeting: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center border p-3 rounded text-xs font-medium">
                                            <span className="font-bold text-gray-900 uppercase">{meeting.title}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500">{meeting.scheduled_time ? new Date(meeting.scheduled_time).toLocaleString() : 'TBD'}</span>
                                                <span className={`px-2 py-0.5 rounded font-bold uppercase text-white text-[10px] ${meeting.status === 'Live' ? 'bg-red-600' : 'bg-gray-500'}`}>{meeting.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </DashboardSection>

                {/* AI Site Analytics */}
                <DashboardSection title="AI Site Analytics" icon={<Activity size={20} />}>
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <Cpu size={16} />
                            <span>REAL-TIME SITE ANALYTICS</span>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="text-sm font-bold uppercase text-gray-900 border-b pb-1">PREDICTIVE ANALYTICS SNAPSHOT:</div>
                                <ul className="text-sm text-gray-600 space-y-2 font-medium">
                                    <li className="flex justify-between"><span>• Overall Delay Risk:</span> <span className={`font-bold ${analytics?.overall_delay_risk === 'HIGH' ? 'text-red-500' : analytics?.overall_delay_risk === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>{analytics?.overall_delay_risk || 'LOW'}</span></li>
                                    <li className="flex justify-between"><span>• Total Predicted Delay:</span> <span className="font-bold text-blue-600">{analytics?.total_predicted_delay_days ?? 0} day(s)</span></li>
                                </ul>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-dotted border-gray-300">
                                <div className="text-sm font-bold uppercase text-gray-900">AI-DETECTED RISK FACTORS:</div>
                                <ul className="text-sm text-gray-600 space-y-2 font-medium">
                                    {analytics?.factors?.length > 0 ? analytics.factors.map((factor: any, idx: number) => (
                                        <li key={idx}>• {factor.type}: {factor.reason} ({factor.impact_days} day{factor.impact_days !== 1 ? 's' : ''})</li>
                                    )) : (
                                        <li className="text-gray-500">No AI-detected risk factors at this time.</li>
                                    )}
                                </ul>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-dotted border-gray-300">
                                <div className="text-sm font-bold uppercase text-red-600">PREDICTIVE ALERTS (24H OUTLOOK):</div>
                                <ul className="text-sm text-gray-600 space-y-2 font-medium italic">
                                    <li>• Real-time model suggests delay mitigation protocols</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="bg-[#021422] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">Review Analytics</button>
                            <button className="bg-[#0166B0] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-blue-700">Audit Analytics</button>
                        </div>
                    </div>
                </DashboardSection>

                {/* Virtual Site Controls Section */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4">Virtual Site Controls:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-12">
                    {[
                        { label: "Split Screen", icon: Layout, variant: "dark" },
                        { label: "AR Command", icon: Video, variant: "primary" },
                        { label: "AI Analytics", icon: Activity, variant: "dark" },
                        { label: "Drone Command", icon: Radio, variant: "dark" },
                        { label: "Site Record DB", icon: Database, variant: "primary" },
                        { label: "Command AR Site", icon: Share2, variant: "dark" }
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
            </div>
        </div>
    );
};

export default VirtualSite;
