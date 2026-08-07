"use client";

import React from "react";
import {
    DollarSign,
    TrendingUp,
    Table as TableIcon,
    ShieldCheck,
    FileText,
    CheckCircle,
    Lock,
    Calculator,
    AlertCircle
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import DashboardSection from "../components/DashboardSection";
import QuickActionBar from "../components/QuickActionBar";
import { projectManagerService } from "../../../../lib/services";

const FinancialCommand = () => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [activeProject, setActiveProject] = React.useState<any>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [strategicHealth, setStrategicHealth] = React.useState<any>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [materials, setMaterials] = React.useState<any[]>([]);
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

                    const [healthRes, materialsRes] = await Promise.all([
                        projectManagerService.getStrategicHealth(project.id).catch(() => ({ data: null })),
                        projectManagerService.getMaterialLifecycle(project.id).catch(() => ({ data: [] }))
                    ]);

                    console.log('[Financial Command] Active Project:', project);
                    console.log('[Financial Command] Endpoints:', [
                        `/api/v1/project-manager/dashboard/strategic-health/${project.id}/`,
                        `/api/v1/project-manager/dashboard/materials/${project.id}/`
                    ]);
                    console.log('[Financial Command] Strategic Health:', healthRes.data);
                    console.log('[Financial Command] Material Lifecycle:', materialsRes.data);

                    setStrategicHealth(healthRes.data);
                    setMaterials(materialsRes.data);
                }
            } catch (err) {
                console.error("Failed to load financial data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500 font-bold">Synchronizing Financial ledgers...</div>;
    }

    if (!activeProject) {
        return <div className="p-8 text-center text-red-500 font-bold">No active projects found. Please initialize a project in PM Settings first.</div>;
    }
    return (
        <div className="pb-24">
            {/* Header Info Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
                <div className="text-2xl font-bold text-[#021422]">Financial Command Center — {activeProject.name}</div>
                <div className="border-1 border-gray-300 py-2 px-3 rounded font-semibold text-[#021422]">Real-time EVM</div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Financial Health Overview */}
                <DashboardSection title="Financial Health Overview" icon={<DollarSign size={20} />}>
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <MetricCard
                                title="Budget"
                                value={`₦${strategicHealth?.contract_value ? (Number(strategicHealth.contract_value) / 1000000).toFixed(2) : "0.00"}M`}
                                subValue={`₦${strategicHealth?.contract_value ? Number(strategicHealth.contract_value).toLocaleString() : "0"}`}
                            />
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2 w-full">Actual</h3>
                                <div className="text-2xl font-bold text-gray-800 mb-2">₦{strategicHealth?.budget_spent ? (Number(strategicHealth.budget_spent) / 1000000).toFixed(2) : "0.00"}M</div>
                                {Number(strategicHealth?.cpi || 0) >= 1 ? (
                                    <div className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest">In Range</div>
                                ) : (
                                    <div className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest">Over Budget</div>
                                )}
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2 w-full">EVM Schedule Variance</h3>
                                <div className="text-2xl font-bold text-gray-800 mb-2">{strategicHealth?.schedule_variance_days || 0} Days</div>
                                {Number(strategicHealth?.spi || 0) >= 1 ? (
                                    <div className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest">Optimized</div>
                                ) : (
                                    <div className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest">Delayed</div>
                                )}
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-500 uppercase tracking-widest">
                                <TrendingUp size={16} />
                                <span>Earned Value Breakdown</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-base font-medium mb-4">
                                <div className="space-y-1">
                                    <div className="text-gray-500 text-xs uppercase">Planned Value (PV)</div>
                                    <div>Not Fully Configured</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-gray-500 text-xs uppercase">Earned Value (EV)</div>
                                    <div>Not Fully Configured</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-gray-500 text-xs uppercase">Actual Cost (AC)</div>
                                    <div>₦{strategicHealth?.budget_spent ? (Number(strategicHealth.budget_spent) / 1000000).toFixed(2) : "0.00"}M</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-gray-500 text-xs uppercase">Budget Variance</div>
                                    <div className={Number(strategicHealth?.budget_variance || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                                        {Number(strategicHealth?.budget_variance || 0) >= 0 ? `+${strategicHealth?.budget_variance || 0}%` : `${strategicHealth?.budget_variance || 0}%`}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-8 text-sm font-bold text-gray-900 border-t border-dotted pt-4">
                                <span>CPI: {Number(strategicHealth?.cpi || 1).toFixed(2)}</span>
                                <span>SPI: {Number(strategicHealth?.spi || 1).toFixed(2)}</span>
                                <span>TCPI: {Number(strategicHealth?.tcpi || 1).toFixed(2)}</span>
                                <span>Q-Score: {strategicHealth?.quality_score || 0}%</span>
                            </div>
                            <p className="mt-4 text-base text-gray-600 italic">&quot;{strategicHealth?.evm_insights?.cpi_text || 'Cost performance is to plan'}&quot;</p>
                        </div>
                    </div>
                </DashboardSection>

                {/* AI Financial Forecasting */}
                <DashboardSection title="AI Financial Forecasting" icon={<TrendingUp size={20} />}>
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <TrendingUp size={16} />
                            <span>AI Financial Predictions</span>
                        </div>

                        <div className="h-64 w-full bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden p-8">
                            {/* Simplified SVG Chart Representation */}
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                                <path
                                    d="M 0,30 Q 15,25 25,10 T 50,35 T 75,20 L 100,20"
                                    fill="none"
                                    stroke="#8B5CF6"
                                    strokeWidth="0.5"
                                    className="opacity-50"
                                />
                                <path
                                    d="M 0,30 Q 15,25 25,10 T 50,35 T 75,20 L 100,20 L 100,40 L 0,40 Z"
                                    fill="url(#grad)"
                                    className="opacity-20"
                                />
                                <defs>
                                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: "#8B5CF6", stopOpacity: 0.5 }} />
                                        <stop offset="100%" style={{ stopColor: "#8B5CF6", stopOpacity: 0 }} />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 font-medium">
                                Line chart showing Budget vs Actual vs Forecast
                            </div>

                        </div>

                        <div className="space-y-4">
                            <div className="text-sm font-bold text-gray-900 uppercase">AI RISK SCENARIOS:</div>
                            <div className="text-gray-500 font-medium text-sm p-4">No AI financial scenarios available yet. Run a scenario analysis to generate predictions.</div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button className="bg-[#021422] text-white px-6 py-2 rounded text-sm font-bold uppercase hover:bg-gray-800 transition-colors">Run Scenario Analysis</button>
                            <button className="bg-[#0166B0] text-white px-6 py-2 rounded text-sm font-bold uppercase hover:bg-blue-700 transition-colors">View Risk mitigation</button>
                        </div>
                    </div>
                </DashboardSection>

                {/* Cost Driver Analysis */}
                <DashboardSection title="Cost Driver Analysis" icon={<TableIcon size={20} />}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <TrendingUp size={16} />
                            <span>Top 3 Cost Driver</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-base text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-y">
                                    <tr>
                                        <th className="px-4 py-3">Rank</th>
                                        <th className="px-4 py-3">Cost Element</th>
                                        <th className="px-4 py-3">Variance</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {materials && materials.length > 0 ? materials.map((row: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-4 font-medium">{idx + 1}</td>
                                            <td className="px-4 py-4">{row.item_details?.name || row.item_details?.category || "—"}</td>
                                            <td className="px-4 py-4 font-bold text-gray-900">{row.status}</td>
                                            <td className="px-4 py-4">
                                                <button className={`text-xs font-bold px-4 py-1 rounded text-white uppercase ${row.status === 'PENDING' || row.status === 'REJECTED' ? "bg-red-800" : "bg-green-700"
                                                    }`}>
                                                    {row.status === 'PENDING' || row.status === 'REJECTED' ? "ACTION" : "TRACKED"}
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500 font-bold">No Material Cost Drivers logged.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="text-sm font-bold text-gray-900 uppercase underline decoration-blue-500 underline-offset-4 decoration-2">AI RECOMMENDED MITIGATIONS:</div>
                            <div className="text-gray-500 font-medium text-sm">No AI mitigation recommendations available yet.</div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button className="bg-[#021422] text-white px-6 py-2 rounded text-sm font-bold uppercase hover:bg-gray-800 transition-colors">Implement All Mitigations</button>
                            <button className="bg-[#0166B0] text-white px-6 py-2 rounded text-sm font-bold uppercase hover:bg-blue-700 transition-colors">Full Cost Report</button>
                        </div>
                    </div>
                </DashboardSection>

                {/* Financial Controls Section */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4">Financial Controls:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-12">
                    {[
                        { label: "Proceed Expense", icon: FileText, variant: "dark" },
                        { label: "Approve Invoice", icon: Calculator, variant: "primary" },
                        { label: "Cost Eng Layout", icon: ShieldCheck, variant: "dark" },
                        { label: "Procurement Request", icon: CheckCircle, variant: "primary" },
                        { label: "Contingency Release", icon: Lock, variant: "dark" }
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


export default FinancialCommand;
