"use client";
import BackButton from "@/components/BackButton";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Zap,
    Bell,
    Send,
    FileText,
    Settings,
    Plus,
    MessageSquare,
    ShieldCheck,
    BarChart2,
    AlertTriangle,
    History,
    UserCheck,
    PieChart,
    Lock,
    Loader2,
    Trash2,
    Users,
    FolderOpen,
    ChevronRight,
    ClipboardList,
    Target,
} from "lucide-react";
import DashboardSection from "../components/DashboardSection";
import ProjectSetupForm from "./components/ProjectSetupForm";
import CrewAssignmentForm from "./components/CrewAssignmentForm";
import WorkPolicyCard from "@/components/WorkPolicyCard";
import { projectManagerService } from "@/lib/services";
import { adminService } from "@/lib/services";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/error";

interface TeamMember {
    id: number;
    uuid: string;
    user: number;
    user_email: string;
    project: string;
    role: number;
    role_name: string;
    is_active: boolean;
}

interface RoleOption { id: number; name: string; }

function emailInitial(email: string) {
    return (email?.split("@")[0]?.[0] ?? "?").toUpperCase();
}

const PMSettings = () => {
    const params = useParams();
    const router = useRouter();
    const orgSlug = params.org_slug as string;
    const projectSlug = params.project_slug as string;
    const { data: projectUuid } = useProjectUuid(orgSlug, projectSlug);

    const [activeProject, setActiveProject] = React.useState<any>(null);
    const [healthData, setHealthData] = React.useState<any>(null);
    const [systemAlerts, setSystemAlerts] = React.useState<any[]>([]);

    // Team members state
    const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
    const [teamLoading, setTeamLoading] = React.useState(true);
    const [memberActionLoading, setMemberActionLoading] = React.useState<string | null>(null);
    const [removingMember, setRemovingMember] = React.useState<TeamMember | null>(null);
    const [removeLoading, setRemoveLoading] = React.useState(false);

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
            }
        };
        fetchData();
    }, []);

    React.useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!orgSlug || !projectUuid) { setTeamLoading(false); return; }
        adminService.getProjectMembers(orgSlug, projectUuid)
            .then((res) => {
                const raw = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
                setTeamMembers(raw);
            })
            .catch(() => setTeamMembers([]))
            .finally(() => setTeamLoading(false));
    }, [orgSlug, projectUuid]);

    const roleOptions: RoleOption[] = Array.from(
        new Map(teamMembers.filter((m) => m.role && m.role_name).map((m) => [m.role, m.role_name])).entries()
    ).map(([id, name]) => ({ id, name }));

    const handleRoleChange = async (member: TeamMember, newRole: number) => {
        const key = `role-${member.id}`;
        setMemberActionLoading(key);
        try {
            await adminService.updateProjectMember(orgSlug, member.project, member.id, { role: newRole });
            setTeamMembers((prev) => prev.map((m) =>
                m.id === member.id
                    ? { ...m, role: newRole, role_name: roleOptions.find((r) => r.id === newRole)?.name ?? m.role_name }
                    : m
            ));
            toast.success("Role updated");
        } catch (err) { toast.error(getErrorMessage(err)); }
        finally { setMemberActionLoading(null); }
    };

    const handleToggleActive = async (member: TeamMember) => {
        const key = `active-${member.id}`;
        setMemberActionLoading(key);
        try {
            await adminService.updateProjectMember(orgSlug, member.project, member.id, { is_active: !member.is_active });
            setTeamMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, is_active: !m.is_active } : m));
            toast.success(member.is_active ? "Member deactivated" : "Member activated");
        } catch (err) { toast.error(getErrorMessage(err)); }
        finally { setMemberActionLoading(null); }
    };

    const handleRemoveConfirm = async () => {
        if (!removingMember) return;
        setRemoveLoading(true);
        try {
            await adminService.removeProjectMember(orgSlug, removingMember.project, removingMember.id);
            setTeamMembers((prev) => prev.filter((m) => m.id !== removingMember.id));
            toast.success(`${removingMember.user_email} removed`);
            setRemovingMember(null);
        } catch (err) { toast.error(getErrorMessage(err)); }
        finally { setRemoveLoading(false); }
    };

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
        <>
        <div className="pb-24 text-[#021422]">
            {/* Header Info Bar */}
            <div className="bg-[#021422] text-white p-4 px-8 flex justify-between items-center text-sm border-b border-gray-800">
                <div className="flex items-center gap-3"><BackButton className="text-white hover:bg-white/10" /><div className="font-bold tracking-widest uppercase">PM QUICK COMMAND BAR</div></div>
                <div className="flex gap-4">
                    <button className="bg-white/10 px-6 py-1 rounded uppercase font-bold text-xs hover:bg-white/20 transition-colors">Minimize</button>
                    <button className="bg-white/10 px-6 py-1 rounded uppercase font-bold text-xs hover:bg-white/20 transition-colors flex items-center gap-1"><Lock size={12} /> Pin</button>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Project Team */}
                <DashboardSection title="Project Team" icon={<Users size={20} />}>
                    {teamLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={24} className="animate-spin text-[#0166B0]" />
                        </div>
                    ) : teamMembers.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4">No members found for this project.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        <th className="text-left py-2 px-3">Member</th>
                                        <th className="text-left py-2 px-3">Role</th>
                                        <th className="text-left py-2 px-3">Status</th>
                                        <th className="text-right py-2 px-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamMembers.map((member) => (
                                        <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-[#021422] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                        {emailInitial(member.user_email)}
                                                    </div>
                                                    <span className="text-gray-700">{member.user_email}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(member, Number(e.target.value))}
                                                    disabled={memberActionLoading === `role-${member.id}`}
                                                    className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0166B0] disabled:opacity-50"
                                                >
                                                    {roleOptions.map((r) => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-3 px-3">
                                                <button
                                                    onClick={() => handleToggleActive(member)}
                                                    disabled={!!memberActionLoading}
                                                    className={`text-xs px-2 py-1 rounded-full font-bold transition-colors disabled:opacity-50 ${
                                                        member.is_active
                                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                            : "bg-red-100 text-red-700 hover:bg-red-200"
                                                    }`}
                                                >
                                                    {memberActionLoading === `active-${member.id}`
                                                        ? <Loader2 size={10} className="animate-spin inline" />
                                                        : member.is_active ? "Active" : "Inactive"}
                                                </button>
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="flex items-center justify-end">
                                                    <button
                                                        onClick={() => setRemovingMember(member)}
                                                        disabled={!!memberActionLoading}
                                                        className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                        title="Remove member"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </DashboardSection>

                {/* Essential Controls */}
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

                {/* Project Details */}
                <DashboardSection title="Project Details" icon={<ClipboardList size={20} />}>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm text-gray-600">
                                View and edit core project information — identity, timeline, and contract details.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push(`/${orgSlug}/projects/${projectSlug}/project-manager/settings/project-details`)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#021422] text-white text-sm font-bold rounded-lg hover:bg-gray-900 transition-colors shrink-0 ml-6"
                        >
                            <ClipboardList size={15} />
                            Open Details
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </DashboardSection>

                {/* Project Documents */}
                <DashboardSection title="Project Documents" icon={<FolderOpen size={20} />}>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm text-gray-600">
                                Upload and manage instruction documents. Tag them to task types for automatic attachment when tasks are created.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push(`/${orgSlug}/projects/${projectSlug}/project-manager/settings/documents`)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#021422] text-white text-sm font-bold rounded-lg hover:bg-gray-900 transition-colors shrink-0 ml-6"
                        >
                            <FolderOpen size={15} />
                            Open Documents
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </DashboardSection>

                {/* Milestones */}
                <DashboardSection title="Milestones" icon={<Target size={20} />}>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm text-gray-600">
                                Create and manage project phases. Tasks and documents are scoped to milestones.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push(`/${orgSlug}/projects/${projectSlug}/project-manager/settings/milestones`)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#021422] text-white text-sm font-bold rounded-lg hover:bg-gray-900 transition-colors shrink-0 ml-6"
                        >
                            <Target size={15} />
                            Open Milestones
                            <ChevronRight size={14} />
                        </button>
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

                {/* Work Policy */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4 pt-4">Work Policy:</div>
                <div className="pb-12">
                    <WorkPolicyCard orgSlug={orgSlug} />
                </div>
            </div>
        </div>

        {/* Remove confirm dialog */}
        {removingMember && (
            <div
                className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                onClick={() => setRemovingMember(null)}
            >
                <div
                    className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-lg font-bold text-[#021422]">Remove Member</h2>
                    <p className="text-sm text-gray-600">
                        Remove <span className="font-semibold text-gray-800">{removingMember.user_email}</span> from this project? This cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setRemovingMember(null)}
                            className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRemoveConfirm}
                            disabled={removeLoading}
                            className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {removeLoading && <Loader2 size={14} className="animate-spin" />}
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default PMSettings;
