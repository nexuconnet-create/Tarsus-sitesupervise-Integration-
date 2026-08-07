"use client";
import BackButton from "@/components/BackButton";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { projectManagerService } from "@/lib/services";
import {
    Cpu,
    Zap,
    Target,
    CheckCircle,
    AlertTriangle,
    Settings,
    Plus,
    History,
    TrendingUp,
    BarChart2,
    UserCheck,
    Share2,
    Database,
    Terminal,
    FileSearch,
    BookOpen
} from "lucide-react";
import DashboardSection from "../components/DashboardSection";

const AIStrategist = () => {
    const [activeProject, setActiveProject] = useState<any>(null);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const initProject = async () => {
            try {
                let project = null;
                try {
                    const stored = localStorage.getItem('selected_project');
                    if (stored) project = JSON.parse(stored);
                } catch (e) { }
                if (!project) {
                    const projectsRes = await projectManagerService.getProjects();
                    const list = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data?.results || []);
                    if (list.length > 0) project = list[0];
                }
                if (project) {
                    setActiveProject(project);
                    console.log('[AI Strategist] Active Project:', project);
                }
            } catch (err) {
                console.error("Failed to load projects", err);
            }
        };
        initProject();
    }, []);

    const handleAnalyze = async () => {
        if (!activeProject || !query) return;
        setLoading(true);
        console.log('[AI Strategist] Endpoint: POST /api/v1/project-manager/ai-strategist/decision/' + activeProject.id + '/ (Query: ' + query + ')');
        try {
            const res = await projectManagerService.getAIStrategistDecision(activeProject.id, query);
            console.log('[AI Strategist] Result:', res.data);
            setResult(res.data);
        } catch (err) {
            console.error("Analysis failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24">
            {/* Header Info Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
                <div className="flex items-center gap-3"><BackButton /><div className="text-xl font-bold text-[#021422]">AI STRATEGIST — Decision Support System</div></div>
                <div className="border-1 border-gray-300 py-2 px-3 rounded font-regular text-[#021422]">Auto-Update Mode</div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* AI Decision Analyzer */}
                <DashboardSection title="AI Decision Analyzer" icon={<Cpu size={20} />}>
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-bold uppercase text-gray-500 tracking-widest">
                                <Terminal size={14} />
                                <span>DECISION INPUT:</span>
                            </div>
                            <div className="border-b border-gray-200 pb-2 flex">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                                    placeholder="Should we accelerate Zone C steelwork despite rain forecast? Include impact analysis."
                                    className="w-full text-base font-medium focus:outline-none bg-transparent"
                                />
                                <button onClick={handleAnalyze} disabled={loading} className="text-sm font-bold bg-[#0166B0] text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50">
                                    Analyze
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm font-bold uppercase text-gray-500 tracking-widest">{loading ? "ANALYSIS IN PROGRESS..." : "LATEST RUN CONTEXT"}</div>
                            <ul className="text-sm text-gray-600 space-y-2 font-medium">
                                <li>• Analyzing Historical weather decisions from past projects</li>
                                <li>• Modeling Cost vs Schedule tradeoff</li>
                                <li>• Accessing labor force availability</li>
                                <li>• Evaluating Subcontractor capacity impacts</li>
                            </ul>
                        </div>

                        {result && (
                            <div className="flex items-center gap-6">
                                <div className="text-sm font-bold uppercase text-gray-900">ESTIMATED ANALYSIS: Complete</div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold uppercase text-gray-400">AI CONFIDENCE TARGET:</span>
                                    <div className="relative w-16 h-16 flex items-center justify-center text-sm font-bold">
                                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                                            <circle cx="32" cy="32" r="28" fill="none" stroke="#E3E3E3" strokeWidth="6" />
                                            <circle cx="32" cy="32" r="28" fill="none" stroke="#0166B0" strokeWidth="6" strokeDasharray="175" strokeDashoffset={175 - (175 * parseInt(result.confidence || "90") / 100)} />
                                        </svg>
                                        <span>{result.confidence}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DashboardSection>

                {/* AI Recommendation with Alternatives */}
                <DashboardSection title="AI Recommendation with Alternatives" icon={<Zap size={20} />}>
                    {!result ? (
                        <div className="text-gray-500 font-bold uppercase">Awaiting Query...</div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                                <Zap size={16} />
                                <span>AI RECOMMENDATION: {result.recommendation}</span>
                            </div>

                            <div className="space-y-4">
                                <div className="text-sm font-bold uppercase text-gray-900">PRIMARY REASONS:</div>
                                <ol className="text-sm text-gray-600 list-decimal pl-4 space-y-1 font-medium">
                                    {result.primary_reasons?.map((reason: string, idx: number) => (
                                        <li key={idx}>{reason}</li>
                                    ))}
                                </ol>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(result.impacts || {}).map(([key, outcome]: [string, any], idx: number) => (
                                    <div key={idx} className="border p-4 rounded space-y-2">
                                        <div className="text-xs font-bold uppercase text-gray-400">{key} IMPACT:</div>
                                        <div className={`text-xs font-bold uppercase leading-snug ${outcome.color}`}>{outcome.impact}</div>
                                    </div>
                                ))}
                            </div>

                            {result.alternatives && result.alternatives.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="text-sm font-bold uppercase text-gray-500 tracking-widest">ALTERNATIVE OPTIONS:</div>
                                    <div className="space-y-4 text-xs font-medium leading-relaxed">
                                        {result.alternatives.map((alt: any, idx: number) => (
                                            <div key={idx}>
                                                <div className="font-bold">{alt.title}:</div>
                                                <div className="text-gray-500">Cost: {alt.cost} | Risk: {alt.risk}</div>
                                                <div className={`text-gray-500 ${alt.highlight ? 'italic' : ''}`}>Outcome: {alt.outcome}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button className="bg-[#021422] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">Launch Decision</button>
                                <button className="bg-[#0166B0] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-blue-700">Audit History</button>
                            </div>
                        </div>
                    )}
                </DashboardSection>

                {/* AI Execution Plan */}
                <DashboardSection title="AI Execution Plan" icon={<Target size={20} />}>
                    {!result ? (
                        <div className="text-gray-500 font-bold uppercase">Awaiting Recommendation...</div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                                <Settings size={16} />
                                <span>AI-GENERATED EXECUTION PLAN</span>
                            </div>

                            <div className="space-y-6">
                                <div className="text-sm font-bold uppercase text-gray-900 border-b pb-2">RECOMMENDED STEPS:</div>
                                <ul className="text-sm text-gray-600 space-y-3 font-medium">
                                    {result.execution_plan?.map((step: string, idx: number) => (
                                        <li key={idx} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {idx + 1}. {step}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                                <div className="space-y-4">
                                    <div className="text-sm font-bold uppercase text-gray-500 tracking-widest">AI WILL AUTOMATE:</div>
                                    <div className="text-xs text-gray-500 font-medium italic">Automation scope will be determined once a decision is launched.</div>
                                </div>
                                <div className="space-y-4 border-l pl-8">
                                    <div className="text-sm font-bold uppercase text-red-600 tracking-widest">PM REQUIRED ACTION:</div>
                                    <div className="p-4 bg-red-50 border border-red-100 rounded text-sm font-bold uppercase text-red-900">
                                        CLIENT SIGNATURE REQUIRED
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="bg-[#021422] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">Launch Workflow</button>
                                <button className="bg-[#0166B0] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-blue-700">Project Command</button>
                            </div>
                        </div>
                    )}
                </DashboardSection>

                {/* AI Learning & Feedback */}
                <DashboardSection title="AI Learning & Feedback" icon={<BookOpen size={20} />}>
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="text-sm font-bold uppercase text-gray-500 tracking-widest">AI LEARNING FROM THIS DECISION:</div>
                                <div className="space-y-4">
                                    <div className="text-xs text-gray-500 font-bold uppercase">DATA BEING CAPTURED:</div>
                                    <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1 font-medium">
                                        <li>• Decision context (weather, market, crew)</li>
                                        <li>• Human override record (if any)</li>
                                        <li>• Outcome metrics (tracked over time)</li>
                                        <li>• Team leader feedback</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="text-sm font-bold uppercase text-gray-500 tracking-widest">AI PERFORMANCE FEEDBACK:</div>
                                <div className="text-xs text-gray-500 font-medium">No performance feedback recorded yet. Submit a decision to begin tracking.</div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                            <button className="bg-[#021422] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">Review Learning</button>
                            <button className="bg-[#0166B0] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-blue-700">Refine Models</button>
                        </div>
                    </div>
                </DashboardSection>

                {/* AI Controls Section */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4">AI Controls:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-12">
                    {[
                        { label: "New Analysis", icon: Plus, variant: "dark" },
                        { label: "Strategic Review", icon: TrendingUp, variant: "primary" },
                        { label: "AI Log History", icon: History, variant: "dark" },
                        { label: "Project Record", icon: Database, variant: "dark" },
                        { label: "Audit Result", icon: UserCheck, variant: "primary" },
                        { label: "Share Summary", icon: Share2, variant: "dark" }
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


export default AIStrategist;
