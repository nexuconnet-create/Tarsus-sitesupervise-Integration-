"use client";

import React from "react";
import {
    FileCheck,
    AlertTriangle,
    Plus,
    Zap,
    Search,
    History,
    Clock,
    Layout,
    UserCheck,
    Database,
    Send
} from "lucide-react";
import DashboardSection from "../../components/DashboardSection";
import { projectManagerService } from "../../../../../lib/services";

const ApprovalDashboard = () => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [activeProject, setActiveProject] = React.useState<any>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [approvals, setApprovals] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
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
                    const approvalsRes = await projectManagerService.getApprovalWorkflows(project.id).catch(() => ({ data: [] }));
                    setApprovals(Array.isArray(approvalsRes.data) ? approvalsRes.data : (approvalsRes.data?.results || []));
                }
            } catch (err) {
                console.error("Failed to load approval data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Approval Data...</div>;
    if (!activeProject) return <div className="p-8 text-center text-red-500 font-bold">No active project found. Set up a project in PM Settings first.</div>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pending = approvals.filter((a: any) => a.status === 'PENDING');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completed = approvals.filter((a: any) => a.status === 'APPROVED');

    return (
        <div className="pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
                <div className="text-xl font-bold text-[#021422]">Approval Workflow Manager — {activeProject.name}</div>
                <div className="py-2 px-3 rounded text-[#021422]">ACTIVE PROJECT</div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Approval Summary */}
                <DashboardSection title="Approval Dashboard" icon={<Layout size={20} />}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <FileCheck size={16} />
                            <span>APPROVAL OVERVIEW</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                            <div className="border p-6 flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="text-[10px] font-bold uppercase text-gray-400">AWAITING REVIEW:</div>
                                <div className="text-xl font-bold">{pending.length}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase">Pending Approvals</div>
                            </div>
                            <div className="border p-6 flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="text-[10px] font-bold uppercase text-gray-400">TOTAL WORKFLOWS:</div>
                                <div className="text-xl font-bold">{approvals.length}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase">All Approvals</div>
                            </div>
                            <div className="border p-6 flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="text-[10px] font-bold uppercase text-gray-400">COMPLETED:</div>
                                <div className="text-xl font-bold">{completed.length}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase">Approved</div>
                            </div>
                        </div>
                    </div>
                </DashboardSection>

                {/* Priority Approval Queue */}
                <DashboardSection title="Priority Approval Queue" icon={<AlertTriangle size={20} />}>
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <UserCheck size={16} />
                            <span>PENDING APPROVALS</span>
                        </div>

                        <div className="space-y-6">
{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {approvals.length > 0 ? approvals.map((a: any, idx: number) => (
                                <div key={idx} className="space-y-3">
                                    <div className="text-[10px] font-bold uppercase">{idx + 1}. {a.document_title} — {a.workflow_type}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">
                                        Status: {a.status} | Waiting on: {a.waiting_on || "—"}
                                    </div>
                                    <div className="bg-[#F2FBFF] p-2 border border-[#B8E1FF] text-[10px] text-blue-900 border-l-4 border-l-blue-500 font-medium italic">
                                        Step {a.current_step} of {a.total_steps}
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button className="bg-[#021422] text-white px-8 py-1.5 rounded text-[10px] font-bold uppercase transition-colors hover:bg-gray-800">Review</button>
                                        <button className="bg-[#0166B0] text-white px-8 py-1.5 rounded text-[10px] font-bold uppercase transition-colors hover:bg-blue-700">Approve</button>
                                        <button className="bg-[#021422] text-white px-8 py-1.5 rounded text-[10px] font-bold uppercase transition-colors hover:bg-gray-800">Reject</button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-gray-500 text-sm text-center py-6">No pending approvals for this project.</div>
                            )}
                        </div>
                    </div>
                </DashboardSection>

                {/* Approval Controls */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4">Approval Controls:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-12">
                    {[
                        { label: "New Approval", icon: Plus, variant: "dark" },
                        { label: "Draft Action Path", icon: History, variant: "primary" },
                        { label: "Manage Log", icon: Database, variant: "dark" },
                        { label: "Distribute Rule", icon: Send, variant: "dark" },
                        { label: "Configure Rule", icon: Zap, variant: "primary" },
                        { label: "Auto Rule", icon: Layout, variant: "dark" }
                    ].map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <button key={idx} className={`flex items-center justify-center gap-2 p-4 rounded font-bold text-[10px] uppercase transition-colors ${action.variant === "primary" ? "bg-[#0166B0] text-white" : "bg-[#021422] text-white"}`}>
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

export default ApprovalDashboard;
