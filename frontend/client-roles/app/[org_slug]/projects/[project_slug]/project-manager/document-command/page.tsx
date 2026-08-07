"use client";
import BackButton from "@/components/BackButton";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import {
    FileText,
    AlertTriangle,
    Clock,
    CheckCircle2,
    FileSearch,
    Settings,
    Plus,
    Download,
    Send,
    History,
    FileCheck,
    Zap
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import DashboardSection from "../components/DashboardSection";
import { projectManagerService } from "@/lib/services";

const DocumentDashboard = () => {
    const [activeProject, setActiveProject] = React.useState<any>(null);
    const [approvalWorkflows, setApprovalWorkflows] = React.useState<any[]>([]);
    const [changeOrders, setChangeOrders] = React.useState<any[]>([]);
    const [docCount, setDocCount] = React.useState<number>(0);
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

                    const [workflowsRes, ordersRes, docsRes] = await Promise.all([
                        projectManagerService.getApprovalWorkflows(project.id).catch(() => ({ data: [] })),
                        projectManagerService.getChangeOrders(project.id).catch(() => ({ data: [] })),
                        projectManagerService.getDocuments(project.id).catch(() => ({ data: [] }))
                    ]);

                    console.log('[Document Dashboard] Active Project:', project);
                    console.log('[Document Dashboard] Endpoints:', [
                        `/api/v1/project-manager/documents/approvals/${project.id}/`,
                        `/api/v1/project-manager/documents/change-orders/${project.id}/`,
                        `/api/v1/project-manager/documents/files/?project_id=${project.id}`
                    ]);

                    console.log('[Document Dashboard] Approval Workflows:', workflowsRes.data);
                    console.log('[Document Dashboard] Change Orders:', ordersRes.data);
                    console.log('[Document Dashboard] Documents:', docsRes.data);

                    setApprovalWorkflows(Array.isArray(workflowsRes.data) ? workflowsRes.data : (workflowsRes.data?.results || []));
                    setChangeOrders(Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.results || []);
                    // store documents count for metrics
                    (window as any).__docCount = Array.isArray(docsRes.data) ? docsRes.data.length : (docsRes.data?.results?.length || docsRes.data?.count || 0);
                }
            } catch (err) {
                console.error("Failed to load document data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500 font-bold">Synchronizing Document Repositories...</div>;
    }

    if (!activeProject) {
        return <div className="p-8 text-center text-red-500 font-bold">No active projects found. Please initialize a project in PM Settings first.</div>;
    }
    return (
        <div className="pb-24">
            {/* Header Info Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
                <div className="flex items-center gap-3"><BackButton /><div className="text-xl font-bold text-[#021422]">Document Command Center — {activeProject.name}</div></div>
                <div className="border-1 border-gray-300 py-2 px-3 rounded text-[#021422]">PM Dashboard</div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Document Health Overview */}
                <DashboardSection title="Document Health Overview" icon={<FileText size={20} />}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <FileCheck size={16} />
                            <span>Document Vital Signs</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <MetricCard
                                title="Total Documents"
                                value={String((window as any).__docCount || 0)}
                                unit="Files"
                            />
                            <MetricCard
                                title="Pending Approvals"
                                value={String(approvalWorkflows.filter((w: any) => w.status === 'PENDING').length)}
                                unit="Workflows"
                            />
                            <MetricCard
                                title="Active Change Orders"
                                value={String(changeOrders.length)}
                                unit="Orders"
                            />
                        </div>

                        {approvalWorkflows.filter((w: any) => w.status === 'PENDING').length > 0 ? (
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mt-6">
                                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase mb-2">
                                    <AlertTriangle size={14} />
                                    <span>Pending Approvals</span>
                                </div>
                                <ul className="text-sm text-amber-900 space-y-2 font-medium">
                                    {approvalWorkflows.filter((w: any) => w.status === 'PENDING').map((wf: any, idx: number) => (
                                        <li key={idx}>• {wf.document_title} — Waiting on: {wf.waiting_on || 'Approver'}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-6">
                                <div className="text-green-800 font-bold text-sm uppercase">No pending document approvals.</div>
                            </div>
                        )}
                    </div>
                </DashboardSection>

                {/* Contract & Change Order Status */}
                <DashboardSection title="Contract & Change Order Status" icon={<FileSearch size={20} />}>
                    <div className="flex flex-col gap-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                                <Settings size={16} />
                                <span>Contract Financial Control</span>
                            </div>
                            <div className="space-y-4 text-sm font-medium">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 uppercase">Base Contract Value:</span>
                                    <span className="font-bold">{activeProject.contract_value ? `$${(parseFloat(activeProject.contract_value) / 1_000_000).toFixed(2)}M` : '—'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 text-blue-600">
                                    <span className="uppercase font-bold">Approved Change Orders:</span>
                                    <span className="font-bold">{changeOrders.filter((c: any) => c.status === 'APPROVED').length} orders</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 text-amber-600">
                                    <span className="uppercase font-bold">Pending COs:</span>
                                    <span className="font-bold">{changeOrders.filter((c: any) => c.status === 'PENDING').length} orders</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 text-red-600">
                                    <span className="uppercase font-bold">Rejected COs:</span>
                                    <span className="font-bold">{changeOrders.filter((c: any) => c.status === 'REJECTED').length} orders</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                                <FileSearch size={16} />
                                <span>Change Order Tracking</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="text-gray-400 uppercase border-b text-xs">
                                            <th className="pb-2 font-bold">#</th>
                                            <th className="pb-2 font-bold">Description</th>
                                            <th className="pb-2 font-bold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-medium">
                                        {changeOrders && changeOrders.length > 0 ? changeOrders.map((co: any, idx: number) => (
                                            <tr key={idx} className="border-b">
                                                <td className="py-3">{co.change_order_number || idx + 1}</td>
                                                <td className="py-3">{co.description || co.title}</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold text-white ${co.status === 'APPROVED' ? 'bg-green-600' :
                                                        co.status === 'PENDING' ? 'bg-amber-600' :
                                                            'bg-gray-500'
                                                        }`}>
                                                        {co.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="py-6 text-center text-gray-500">No Change Orders active.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex gap-2">
                                <button className="bg-[#021422] text-white px-4 py-1.5 rounded text-xs font-bold uppercase transition-colors hover:bg-gray-800">Audit Change Logs</button>
                                <button className="bg-[#0166B0] text-white px-4 py-1.5 rounded text-xs font-bold uppercase transition-colors hover:bg-blue-700">Contract File</button>
                            </div>
                        </div>
                    </div>
                </DashboardSection>

                {/* Approval Workflow Queue */}
                <DashboardSection title="Approval Workflow Queue" icon={<Clock size={20} />}>
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <CheckCircle2 size={16} />
                            <span>Pending Your Approval (23 Tasks)</span>
                        </div>

                        <div className="space-y-6">
                            {approvalWorkflows && approvalWorkflows.length > 0 ? approvalWorkflows.map((workflow: any, idx: number) => {
                                const currentStep = workflow.steps?.find((step: any) => step.status === 'PENDING');
                                return (
                                    <div key={idx} className="border-l-2 border-[#0166B0] pl-4 space-y-2">
                                        <div className="text-sm font-bold">{idx + 1}. {workflow.document?.title} — {workflow.workflow_type}</div>
                                        <div className="text-xs text-gray-500 font-bold uppercase">Status: {workflow.status} | Step: {currentStep ? currentStep.step_name : 'Completed'}</div>
                                        <div className="text-xs text-gray-700 italic">Started by {workflow.initiator?.username || 'System'}</div>
                                    </div>
                                );
                            }) : (
                                <div className="text-gray-500">No workflows pending approval.</div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button className="bg-[#021422] text-white px-6 py-2 rounded text-xs font-bold uppercase transition-colors hover:bg-gray-800">Launch Batch</button>
                            <button className="bg-[#0166B0] text-white px-6 py-2 rounded text-xs font-bold uppercase transition-colors hover:bg-blue-700">Go to DB</button>
                            <button className="bg-[#021422] text-white px-6 py-2 rounded text-xs font-bold uppercase transition-colors hover:bg-gray-800">Escalate Delay</button>
                        </div>
                    </div>
                </DashboardSection>

                {/* AI Document Insights */}
                <DashboardSection title="AI Document Insights" icon={<Zap size={20} />}>
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <Settings size={16} />
                            <span>AI Document Intelligence</span>
                        </div>

                        <div className="space-y-6">
                            <div className="text-sm font-bold uppercase bg-[#E3E3E3] p-2 inline-block">Recent AI Discoveries:</div>
                            <div className="text-gray-500 text-sm font-medium italic py-4">
                                AI document analysis will appear here once documents are uploaded and processed.
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button className="bg-[#021422] text-white px-8 py-2 rounded text-xs font-bold uppercase transition-colors hover:bg-gray-800">Link Page</button>
                            <button className="bg-[#0166B0] text-white px-8 py-2 rounded text-xs font-bold uppercase transition-colors hover:bg-blue-700">Report Summary</button>
                        </div>
                    </div>
                </DashboardSection>

                {/* Document Quick Actions */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4">Document Quick Actions:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-12">
                    {[
                        { label: "Sign Document", icon: FileCheck, variant: "dark" },
                        { label: "Set Approval Log", icon: History, variant: "primary" },
                        { label: "Request Drawing", icon: Plus, variant: "dark" },
                        { label: "Track RFI Link", icon: FileSearch, variant: "dark" },
                        { label: "Export Project Record", icon: Download, variant: "primary" },
                        { label: "Action Document", icon: Send, variant: "dark" }
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


export default DocumentDashboard;
