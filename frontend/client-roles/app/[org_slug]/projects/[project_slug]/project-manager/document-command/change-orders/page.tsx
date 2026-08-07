"use client";
import BackButton from "@/components/BackButton";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import {
    FileText,
    Layers,
    FileSearch,
    Plus,
    Share2,
    Search,
    History,
    Layout,
    Zap,
    FileCheck
} from "lucide-react";
import DashboardSection from "../../components/DashboardSection";
import { projectManagerService } from "@/lib/services";

const ChangeOrderControl = () => {
    const [activeProject, setActiveProject] = React.useState<any>(null);
    const [changeOrders, setChangeOrders] = React.useState<any[]>([]);
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

                    console.log('[Change Orders Dashboard] Active Project:', project);
                    console.log('[Change Orders Dashboard] Endpoint: GET /api/v1/project-manager/documents/change-orders/' + project.id + '/');

                    const ordersRes = await projectManagerService.getChangeOrders(project.id).catch(() => ({ data: [] }));
                    const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.results || []);

                    console.log('[Change Orders Dashboard] Change Orders:', ordersData);

                    setChangeOrders(ordersData);
                }
            } catch (err) {
                console.error("Failed to load change order data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Change Order Data...</div>;
    if (!activeProject) return <div className="p-8 text-center text-red-500 font-bold">No active project found. Set up a project in PM Settings first.</div>;

    const approved = changeOrders.filter((co: any) => co.status === 'APPROVED');
    const pending = changeOrders.filter((co: any) => co.status === 'PENDING');
    const rejected = changeOrders.filter((co: any) => co.status === 'REJECTED');
    const approvedTotal = approved.reduce((s: number, c: any) => s + parseFloat(c.cost_impact || 0), 0);
    const pendingTotal = pending.reduce((s: number, c: any) => s + parseFloat(c.cost_impact || 0), 0);
    const rejectedTotal = rejected.reduce((s: number, c: any) => s + parseFloat(c.cost_impact || 0), 0);

    return (
        <div className="pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
                <div className="flex items-center gap-3"><BackButton /><div className="text-xl font-bold text-[#021422]">Change Order Control Center — {activeProject.name}</div></div>
                <div className="py-2 px-3 rounded text-[#021422]">ACTIVE PROJECT</div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Change Order Portfolio */}
                <DashboardSection title="Change Order Portfolio" icon={<Layers size={20} />}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <FileText size={16} />
                            <span>PCO Summary</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                            <div className="border p-6 flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="text-[10px] font-bold uppercase text-gray-400">APPROVED CHANGE ORDERS:</div>
                                <div className="text-xl font-bold">{approvedTotal > 0 ? `$${(approvedTotal / 1000).toFixed(0)}k` : '$0'}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase">{approved.length} CASES</div>
                            </div>
                            <div className="border p-6 flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="text-[10px] font-bold uppercase text-gray-400">PENDING CHANGE ORDERS:</div>
                                <div className="text-xl font-bold">{pendingTotal > 0 ? `$${(pendingTotal / 1000).toFixed(0)}k` : '$0'}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase">{pending.length} CASES</div>
                            </div>
                            <div className="border p-6 flex flex-col items-center justify-center space-y-4 text-center">
                                <div className="text-[10px] font-bold uppercase text-gray-400">REJECTED CHANGE ORDERS:</div>
                                <div className="text-xl font-bold">{rejectedTotal > 0 ? `$${(rejectedTotal / 1000).toFixed(0)}k` : '$0'}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase">{rejected.length} CASES</div>
                            </div>
                        </div>

                        {changeOrders.length === 0 && (
                            <div className="text-gray-500 text-sm text-center py-4">No change orders found for this project yet.</div>
                        )}
                    </div>
                </DashboardSection>

                {/* Change Orders Table */}
                <DashboardSection title="Active Change Order Detail" icon={<FileSearch size={20} />}>
                    <div className="space-y-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[10px]">
                                <thead>
                                    <tr className="text-gray-400 uppercase border-b">
                                        <th className="pb-2 font-bold">#</th>
                                        <th className="pb-2 font-bold">Reference</th>
                                        <th className="pb-2 font-bold">Description</th>
                                        <th className="pb-2 font-bold">Cost Impact</th>
                                        <th className="pb-2 font-bold">Schedule (days)</th>
                                        <th className="pb-2 font-bold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="font-medium uppercase">
                                    {changeOrders.length > 0 ? changeOrders.map((co: any, idx: number) => (
                                        <tr key={idx} className="border-b">
                                            <td className="py-3">{idx + 1}</td>
                                            <td className="py-3 font-bold">{co.reference_number || `CO-${idx + 1}`}</td>
                                            <td className="py-3">{co.request_type || co.description || '—'}</td>
                                            <td className="py-3 font-bold text-blue-700">{co.cost_impact != null ? `$${parseFloat(co.cost_impact).toLocaleString()}` : '—'}</td>
                                            <td className="py-3">{co.schedule_impact_days != null ? co.schedule_impact_days : '—'}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${co.status === 'APPROVED' ? 'bg-green-600' : co.status === 'PENDING' ? 'bg-amber-600' : 'bg-red-600'}`}>
                                                    {co.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="py-6 text-center text-gray-500">No change orders active for this project.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-2">
                            <button className="bg-[#021422] text-white px-8 py-2 rounded text-[10px] font-bold uppercase transition-colors hover:bg-gray-800">Review Version</button>
                            <button className="bg-[#0166B0] text-white px-8 py-2 rounded text-[10px] font-bold uppercase transition-colors hover:bg-blue-700">Audit Logs</button>
                            <button className="bg-[#021422] text-white px-8 py-2 rounded text-[10px] font-bold uppercase transition-colors hover:bg-gray-800">Escalate</button>
                        </div>
                    </div>
                </DashboardSection>

                {/* Change Order Controls */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4">Change Order Controls:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-12">
                    {[
                        { label: "Draft PCO", icon: Plus, variant: "dark" },
                        { label: "Track Workflow", icon: Layout, variant: "primary" },
                        { label: "Distribute CO", icon: Share2, variant: "dark" },
                        { label: "Request Audit", icon: Search, variant: "dark" },
                        { label: "Manage Log", icon: History, variant: "primary" },
                        { label: "AI Analysis", icon: Zap, variant: "dark" }
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

export default ChangeOrderControl;
