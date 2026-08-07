"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Users,
  Shield,
  Plug,
  Edit,
  Plus,
  Trash2,
  Mail,
  Smartphone,
  MessageSquare,
  CheckCircle,
  Clock,
  Eye,
  Key,
  Monitor,
  Wifi,
  Video,
  Cpu,
  Save,
  RotateCcw,
  Download,
  Lock,
  UserPlus,
  Send,
  FileText,
  BarChart2,
  AlertTriangle,
  Zap,
  PieChart,
} from "lucide-react";
import DashboardSection from "../components/DashboardSection";
import ProjectSetupForm from "./components/ProjectSetupForm";
import CrewAssignmentForm from "./components/CrewAssignmentForm";
import { projectManagerService } from "../../../../lib/services";

const teamMembers = [
  { role: "PM", name: "Engr. Adebayo", email: "a.martina@...", status: "Active", permissions: "Full" },
  { role: "Site Sup.", name: "Engr. Adebayo", email: "a.kama@...", status: "Active", permissions: "Limited" },
  { role: "Foreman", name: "Ahmed Yakubu", email: "a.yakubu@...", status: "Inactive", permissions: "Limited" },
  { role: "Client", name: "J.Olu", email: "j.olu@...", status: "Active", permissions: "View Only" },
];

const PMSettings = () => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [activeProject, setActiveProject] = React.useState<any>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [healthData, setHealthData] = React.useState<any>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [systemAlerts, setSystemAlerts] = React.useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
                    setActiveProject(project);
                    const [healthRes, alertsRes] = await Promise.all([
                        projectManagerService.getStrategicHealth(project.id).catch(() => ({ data: null })),
                        projectManagerService.getSystemAlerts(project.id).catch(() => ({ data: [] }))
                    ]);
                    setHealthData(healthRes.data);
                    setSystemAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : (alertsRes.data?.results || []));
                }
            } catch (err) {
                console.error("Failed to load settings data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const safetyScore = healthData?.safety_score ?? healthData?.site_safety_score ?? null;
    const budgetVariance = healthData?.budget_variance ?? null;
    const qualityScore = healthData?.quality_score ?? null;
    const spi = healthData?.spi ?? null;
    const metrics: { label: string; value: string; color: string }[] = [
        { label: "Safety", value: safetyScore != null ? `${safetyScore}%` : '—', color: "#0166B0" },
        { label: "Budget Variance", value: budgetVariance != null ? `${budgetVariance > 0 ? '+' : ''}${budgetVariance}%` : '—', color: (budgetVariance != null && budgetVariance < 0) ? '#dc2626' : '#0166B0' },
        { label: "Quality", value: qualityScore != null ? `${qualityScore}%` : '—', color: "#0166B0" },
        { label: "SPI", value: spi != null ? spi.toFixed(2) : '—', color: "#0166B0" }
    ];

    return (
        <div className="pb-24 text-[#021422]">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <h1 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
                        PM SETTINGS — Project Configuration
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <span>Project: {activeProject?.name || "Lagos 12-Storey Mixed-Use Development"}</span>
                        <span className="text-gray-300">|</span>
                        <span>Last Updated: 2026-02-19</span>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-6xl mx-auto space-y-6">
                {/* General Settings */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings size={16} className="text-[#021422]" />
                        <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">GENERAL SETTINGS</h2>
                    </div>
                    <div className="space-y-0">
                        {[
                            { label: "Project Name", value: "Lagos 12-Storey Mixed-Use Development" },
                            { label: "Project Code", value: "PRJ-LAGOS-TOWER-2026" },
                            { label: "Location", value: "Victoria Island, Lagos" },
                            { label: "Start Date", value: "2026-01-15" },
                            { label: "End Date", value: "2027-06-30" },
                            { label: "Status", value: "ACTIVE" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-28">{item.label}:</span>
                                    <span className="text-sm font-bold text-[#021422]">{item.value}</span>
                                </div>
                                <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-500 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                                    <Edit size={10} /> Edit
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell size={16} className="text-[#021422]" />
                        <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">NOTIFICATION PREFERENCES</h2>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-700 py-3 border-b border-gray-100 mb-4">
                        <span className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400" /> Email Notifications: <CheckCircle size={14} className="text-emerald-500" /></span>
                        <span className="flex items-center gap-1.5"><Smartphone size={14} className="text-gray-400" /> Push Notifications: <CheckCircle size={14} className="text-emerald-500" /></span>
                        <span className="flex items-center gap-1.5"><MessageSquare size={14} className="text-gray-400" /> In-App: <CheckCircle size={14} className="text-emerald-500" /></span>
                    </div>
                    <div className="mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notify me for:</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {["Task Assignments", "Task Progress Updates", "Approvals Needed", "Vendor Deliveries", "Disputes", "Change Orders", "AR Inspection Reports", "Risk Alerts"].map((item, idx) => (
                            <label key={idx} className="flex items-center gap-1.5 text-sm font-medium text-gray-700 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-gray-300 text-[#0166B0] focus:ring-[#0166B0]" />
                                {item}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Team Management */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={16} className="text-[#021422]" />
                        <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">TEAM MANAGEMENT</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                    <th className="text-left py-2 pr-2">Role</th>
                                    <th className="text-left py-2 pr-2">Name</th>
                                    <th className="text-left py-2 pr-2">Email</th>
                                    <th className="text-left py-2 pr-2">Status</th>
                                    <th className="text-left py-2 pr-2">Permissions</th>
                                    <th className="text-left py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamMembers.map((m, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="py-3 pr-2 font-bold text-[#021422]">{m.role}</td>
                                        <td className="py-3 pr-2 font-medium text-gray-700">{m.name}</td>
                                        <td className="py-3 pr-2 font-medium text-gray-700">{m.email}</td>
                                        <td className="py-3 pr-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${m.status === "Active" ? "text-emerald-700 bg-emerald-50" : "text-gray-700 bg-gray-100"}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${m.status === "Active" ? "bg-emerald-500" : "bg-gray-400"}`} />
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-2 font-medium text-gray-700">{m.permissions}</td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-1">
                                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><Edit size={14} /></button>
                                                <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors"><Plus size={14} /> Add User</button>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Send size={14} /> Bulk Invite</button>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Shield size={14} /> Manage Permissions</button>
                    </div>
                </div>

                {/* Security & Access */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield size={16} className="text-[#021422]" />
                        <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">SECURITY & ACCESS</h2>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-700 py-3 border-b border-gray-100 mb-3">
                        <span className="flex items-center gap-1.5"><Key size={14} className="text-gray-400" /> Two-Factor Authentication: <CheckCircle size={14} className="text-emerald-500" /> Enabled</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" /> Session Timeout: 30 min</span>
                        <span className="flex items-center gap-1.5"><Eye size={14} className="text-gray-400" /> Audit Log: <button className="text-[#0166B0] underline">View</button></span>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-700 py-3">
                        <span className="flex items-center gap-1.5"><Monitor size={14} className="text-gray-400" /> Approved Devices: 3</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" /> Last Login: Today 14:30</span>
                        <span className="flex items-center gap-1.5"><Shield size={14} className="text-gray-400" /> Blocked IPs: 0</span>
                        <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-500 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Settings size={10} /> Manage</button>
                    </div>
                </div>

                {/* Integration Settings */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Plug size={16} className="text-[#021422]" />
                        <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">INTEGRATION SETTINGS</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-gray-50">
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-700">
                                <span className="flex items-center gap-1.5"><Wifi size={14} className="text-gray-400" /> Trimble XR10: <CheckCircle size={14} className="text-emerald-500" /> Connected</span>
                                <span className="text-gray-300">|</span>
                                <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" /> Last Sync: Today 14:30</span>
                                <span className="text-gray-300">|</span>
                                <span className="flex items-center gap-1.5"><Monitor size={14} className="text-gray-400" /> Device ID: TXR-001</span>
                            </div>
                            <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-[#0166B0] border border-[#0166B0] rounded hover:bg-blue-50 transition-colors"><Settings size={10} /> Configure</button>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-gray-50">
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-700">
                                <span className="flex items-center gap-1.5"><Video size={14} className="text-gray-400" /> Video Conferencing: <CheckCircle size={14} className="text-emerald-500" /> Enabled</span>
                                <span className="text-gray-300">|</span>
                                <span>Provider: Twilio</span>
                                <span className="text-gray-300">|</span>
                                <span>Quality: HD</span>
                            </div>
                            <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-[#0166B0] border border-[#0166B0] rounded hover:bg-blue-50 transition-colors"><Settings size={10} /> Configure</button>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-700">
                                <span className="flex items-center gap-1.5"><Cpu size={14} className="text-gray-400" /> AI Services: <CheckCircle size={14} className="text-emerald-500" /> Enabled</span>
                                <span className="text-gray-300">|</span>
                                <span>Model: StrategyNet V2.3</span>
                                <span className="text-gray-300">|</span>
                                <span>Confidence: 92%</span>
                            </div>
                            <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-[#0166B0] border border-[#0166B0] rounded hover:bg-blue-50 transition-colors"><Settings size={10} /> Configure</button>
                        </div>
                    </div>
                </div>

                {/* Save Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                    <button className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#021422] rounded hover:bg-gray-800 transition-colors"><Save size={14} /> Save Changes</button>
                    <button className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><RotateCcw size={14} /> Reset Defaults</button>
                    <button className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Download size={14} /> Export Settings</button>
                </div>

                {/* Legacy Sections */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4 pt-4">Essential Controls:</div>
                <DashboardSection title="Essential Controls" icon={<Settings size={20} />}>
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-sm font-bold uppercase text-amber-600 tracking-widest">
                                <AlertTriangle size={16} />
                                <span>CRITICAL METRICS AT-A-GLANCE:</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {metrics.map((metric, idx) => {
                                    const numVal = parseFloat(metric.value.replace('%', '').replace('+', '').replace('—', '0'));
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
                                <span>PRIORITY ALERTS ({systemAlerts.length}):</span>
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
                        { label: "Approve Request", icon: Shield, variant: "dark" },
                        { label: "Resolve Issue", icon: AlertTriangle, variant: "primary" },
                        { label: "Set Priority", icon: Settings, variant: "dark" }
                    ].map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <button key={idx} className={`flex items-center justify-center gap-2 p-4 rounded font-bold text-sm uppercase transition-colors ${action.variant === "primary" ? "bg-[#0166B0] text-white" : "bg-[#021422] text-white hover:bg-gray-800"}`}>
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
                            <button key={idx} className={`flex items-center justify-center gap-2 p-4 rounded font-bold text-sm uppercase transition-colors ${report.variant === "primary" ? "bg-[#0166B0] text-white" : "bg-[#021422] text-white hover:bg-gray-800"}`}>
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

export default PMSettings;
