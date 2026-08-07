"use client";
import BackButton from "@/components/BackButton";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import {
    Briefcase,
    AlertTriangle,
    Settings,
    FileText,
    Calendar,
    CheckCircle,
    Zap,
    FileSearch,
    Download,
    Plus,
    Link,
    ShieldCheck
} from "lucide-react";
import MetricCard from "../../components/MetricCard";
import DashboardSection from "../../components/DashboardSection";
import { projectManagerService } from "@/lib/services";

const ContractManagement = () => {
    const [activeProject, setActiveProject] = React.useState<any>(null);
    const [contracts, setContracts] = React.useState<any[]>([]);
    const [milestones, setMilestones] = React.useState<any[]>([]);
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
                    const [contractsRes, milestonesRes] = await Promise.all([
                        projectManagerService.getChangeOrders(project.id).catch(() => ({ data: [] })),
                        projectManagerService.getPaymentMilestones(project.id).catch(() => ({ data: [] }))
                    ]);

                    console.log('[Contracts Dashboard] Active Project:', project);
                    console.log('[Contracts Dashboard] Endpoints:', [
                        `/api/v1/project-manager/documents/change-orders/${project.id}/`,
                        `/api/v1/project-manager/documents/milestones/${project.id}/`
                    ]);

                    const contractsData = Array.isArray(contractsRes.data) ? contractsRes.data : (contractsRes.data?.results || []);
                    const milestonesData = Array.isArray(milestonesRes.data) ? milestonesRes.data : (milestonesRes.data?.results || []);

                    console.log('[Contracts Dashboard] Contracts/Change Orders:', contractsData);
                    console.log('[Contracts Dashboard] Payment Milestones:', milestonesData);

                    setContracts(contractsData);
                    setMilestones(milestonesData);
                }
            } catch (err) {
                console.error("Failed to load contract data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Contract Data...</div>;
    if (!activeProject) return <div className="p-8 text-center text-red-500 font-bold">No active project found. Set up a project in PM Settings first.</div>;

    const approvedContracts = contracts.filter((c: any) => c.status === 'APPROVED');
    const pendingContracts = contracts.filter((c: any) => c.status === 'PENDING');
    const totalApprovedValue = approvedContracts.reduce((sum: number, c: any) => sum + parseFloat(c.cost_impact || 0), 0);
    const totalPendingValue = pendingContracts.reduce((sum: number, c: any) => sum + parseFloat(c.cost_impact || 0), 0);
    const contractValueRaw = parseFloat(activeProject.contract_value || 0);

    return (
        <div className="pb-24 text-[#021422]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
                <div className="flex items-center gap-3"><BackButton /><div className="text-xl font-bold text-[#021422]">Contract Management — {activeProject.name}</div></div>
                <div className="py-2 px-3 rounded text-[#021422]">ACTIVE PROJECT</div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Contract Portfolio Overview */}
                <DashboardSection title="Contract Portfolio Overview" icon={<Briefcase size={20} />}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <Briefcase size={16} />
                            <span>Contract Summary</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <MetricCard
                                title="Contract Value"
                                value={contractValueRaw > 0 ? `$${(contractValueRaw / 1_000_000).toFixed(2)}M` : '—'}
                                subValue="Total contract value"
                            />
                            <MetricCard
                                title="Approved Change Orders"
                                value={`${approvedContracts.length}`}
                                subValue={totalApprovedValue > 0 ? `Total: $${totalApprovedValue.toLocaleString()}` : 'No approved changes'}
                            />
                            <MetricCard
                                title="Pending Change Orders"
                                value={`${pendingContracts.length}`}
                                subValue={totalPendingValue > 0 ? `Total: $${totalPendingValue.toLocaleString()}` : 'None pending'}
                            />
                        </div>

                        {contracts.length === 0 && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                <div className="text-blue-800 font-bold text-xs uppercase">No change orders found for this project.</div>
                            </div>
                        )}
                    </div>
                </DashboardSection>

                {/* Payment Milestones */}
                <DashboardSection title="Payment Schedule" icon={<Settings size={20} />}>
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold uppercase text-gray-500">Payment Milestones</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[10px]">
                                <thead>
                                    <tr className="text-gray-400 uppercase border-b">
                                        <th className="pb-2 font-bold">#</th>
                                        <th className="pb-2 font-bold">Description</th>
                                        <th className="pb-2 font-bold">Amount</th>
                                        <th className="pb-2 font-bold">Finish Date</th>
                                        <th className="pb-2 font-bold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="font-medium">
                                    {milestones.length > 0 ? milestones.map((m: any, idx: number) => (
                                        <tr key={idx} className="border-b">
                                            <td className="py-2.5">{idx + 1}</td>
                                            <td className="py-2.5">{m.milestone_description || m.description || m.title || '—'}</td>
                                            <td className="py-2.5 font-bold">{m.amount != null ? `$${parseFloat(m.amount).toLocaleString()}` : '—'}</td>
                                            <td className="py-2.5 uppercase">{m.due_date ? new Date(m.due_date).toLocaleDateString() : '—'}</td>
                                            <td className="py-2.5 uppercase">
                                                <span className={`flex items-center gap-1 ${m.status === 'PAID' ? 'text-green-600' : m.status === 'PENDING' ? 'text-blue-600' : 'text-red-600'}`}>
                                                    {m.status === 'PAID' ? <CheckCircle size={12} /> : <Calendar size={12} />}
                                                    {m.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="py-6 text-center text-gray-500">No payment milestones recorded yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-2">
                            <button className="bg-[#021422] text-white px-6 py-2 rounded text-[10px] font-bold uppercase transition-colors hover:bg-gray-800">Review Version</button>
                            <button className="bg-[#0166B0] text-white px-6 py-2 rounded text-[10px] font-bold uppercase transition-colors hover:bg-blue-700">Audit History</button>
                        </div>
                    </div>
                </DashboardSection>

                {/* Contract Controls Section */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4">Contract Controls:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-12">
                    {[
                        { label: "New Contract", icon: Plus, variant: "dark" },
                        { label: "Draft Amendment", icon: FileText, variant: "primary" },
                        { label: "Manage Login", icon: FileSearch, variant: "dark" },
                        { label: "Contract Analysis", icon: Link, variant: "dark" },
                        { label: "Upload PO", icon: Download, variant: "primary" },
                        { label: "Sign Documents", icon: ShieldCheck, variant: "dark" }
                    ].map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <button key={idx} className={`flex items-center justify-center gap-2 p-4 rounded font-bold text-[10px] uppercase transition-colors ${action.variant === "primary" ? "bg-[#0166B0] text-white" : "bg-[#021422] text-white"
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

export default ContractManagement;
