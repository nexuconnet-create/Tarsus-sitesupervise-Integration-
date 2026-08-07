"use client";
import BackButton from "@/components/BackButton";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import {
    FileUp,
    Search,
    Zap,
    Layers,
    CheckSquare,
    FileText,
    Send,
    ShieldCheck,
    Share2,
    Cpu,
    Download,
    FileSearch,
    History
} from "lucide-react";
import DashboardSection from "../../components/DashboardSection";
import { projectManagerService } from "@/lib/services";

const AIDocumentAssistant = () => {
    const [activeProject, setActiveProject] = React.useState<any>(null);
    const [aiQuery, setAiQuery] = React.useState("");
    const [aiResponse, setAiResponse] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const initProject = async () => {
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
                setActiveProject(project);
            } catch (err) {
                console.error("Failed to init project", err);
            }
        };
        initProject();
    }, []);

    const handleAIQuery = async () => {
        if (!aiQuery.trim() || !activeProject) return;
        setLoading(true);
        console.log(`[AI Document Assistant] Endpoint: POST /api/v1/project-manager/ai-assistant/query/ (Query: ${aiQuery})`);
        try {
            const res = await projectManagerService.queryDocumentAI({
                query: aiQuery,
                project_id: activeProject.id
            });
            console.log('[AI Document Assistant] Result:', res.data);
            setAiResponse(res.data);
        } catch (err) {
            console.error("AI query failed", err);
            setAiResponse({ error: "AI query failed. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24">
            {/* Header Info Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
                <div className="flex items-center gap-3"><BackButton /><div className="text-xl font-bold text-[#021422]">AI DOCUMENT ASSISTANT — Smart Document Management</div></div>
                <div className="border border-gray-300 py-2 px-3 rounded text-[#021422]">AI ENGINE ACTIVE</div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* AI Document Processing */}
                <DashboardSection title="AI Document Processing" icon={<Cpu size={20} />}>
                    <div className="space-y-8">
                        <div className="bg-white border rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-gray-300">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                                <FileUp size={32} />
                            </div>
                            <div className="space-y-1">
                                <div className="text-base font-bold uppercase tracking-tight">Upload files for AI Analysis</div>
                                <div className="text-sm text-gray-400 font-medium">Select and upload the files of your choice</div>
                            </div>

                            <div className="w-full max-w-lg border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center space-y-4 bg-gray-50/50">
                                <div className="text-gray-400">
                                    <FileUp size={48} />
                                </div>
                                <div className="text-base font-bold text-gray-900">Choose a file or drag &amp; drop it here</div>
                                <div className="text-xs text-gray-400 font-bold uppercase">JPEG, PNG, PDF, and MP4 formats, up to 50MB</div>
                                <button className="bg-white border text-[#021422] px-8 py-2 rounded font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors uppercase">Browse File</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="text-sm font-bold uppercase text-gray-500 tracking-widest">AI PROCESSING OPTIONS:</div>
                                <div className="space-y-3">
                                    {[
                                        { label: "Full Document OCR Scan", checked: false },
                                        { label: "Cross-Reference & Linking", checked: false },
                                        { label: "Compliance Check Against Specs", checked: false },
                                        { label: "Risk Exposure Identification", checked: false },
                                        { label: "Summary & Insights Generation", checked: false }
                                    ].map((opt, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="w-4 h-4 rounded border border-gray-300 group-hover:border-gray-400 flex items-center justify-center" />
                                            <span className="text-xs font-bold uppercase text-gray-700">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="text-sm font-bold uppercase text-gray-500 tracking-widest">AI PROCESSING STATUS:</div>
                                <div className="bg-gray-50 border rounded p-4 text-sm text-gray-500 font-medium italic">
                                    Upload a document to begin AI processing.
                                </div>
                            </div>
                        </div>
                    </div>
                </DashboardSection>

                {/* AI Query Interface */}
                <DashboardSection title="AI Document Query" icon={<FileSearch size={20} />}>
                    <div className="space-y-8">
                        <div className="text-sm font-bold uppercase text-gray-500 tracking-widest">ASK AI ABOUT YOUR DOCUMENTS:</div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
                                placeholder="e.g. 'Find all pending RFIs' or 'Summarize contract risks'"
                                className="flex-1 bg-[#F9FAFB] border border-gray-200 rounded-full py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#0166B0]/20 font-medium"
                            />
                            <button
                                onClick={handleAIQuery}
                                disabled={loading || !activeProject}
                                className="bg-[#0166B0] text-white px-8 py-2 rounded-full font-bold text-sm uppercase transition-colors hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Send size={14} />
                                {loading ? 'Processing...' : 'Ask AI'}
                            </button>
                        </div>

                        {aiResponse && !aiResponse.error && (
                            <div className="bg-white border rounded p-6 shadow-sm space-y-4">
                                <div className="text-xs font-bold uppercase text-gray-400">AI RESPONSE:</div>
                                <div className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
                                    {typeof aiResponse === 'string' ? aiResponse : (aiResponse.answer || aiResponse.response || JSON.stringify(aiResponse, null, 2))}
                                </div>
                            </div>
                        )}

                        {aiResponse?.error && (
                            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm font-medium">
                                {aiResponse.error}
                            </div>
                        )}

                        {!aiResponse && !loading && (
                            <div className="text-gray-500 text-sm font-medium italic">
                                AI responses will appear here once you submit a query.
                            </div>
                        )}
                    </div>
                </DashboardSection>

                {/* Smart Document Organisation */}
                <DashboardSection title="Smart Document Organisation" icon={<Layers size={20} />}>
                    <div className="space-y-8">
                        <div className="text-sm font-bold uppercase text-gray-500">AI-SUGGESTED ORGANISATION</div>
                        <div className="text-sm text-gray-500 font-medium italic">
                            Upload documents to receive AI-powered organisation suggestions and metadata tagging.
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-[#021422] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">Confirm Organisation</button>
                            <button className="bg-[#0166B0] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-blue-700">Auto</button>
                        </div>
                    </div>
                </DashboardSection>

                {/* AI Document Generation */}
                <DashboardSection title="AI Document Generation" icon={<CheckSquare size={20} />}>
                    <div className="space-y-8">
                        <div className="text-sm text-gray-500 font-medium italic">
                            Use the query interface above to instruct the AI to generate documents (e.g. delay notices, RFI responses, formal letters).
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-[#021422] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">Review Draft</button>
                            <button className="bg-[#0166B0] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-blue-700">Save To Record</button>
                            <button className="bg-[#021422] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">Export</button>
                        </div>
                    </div>
                </DashboardSection>

                {/* AI Document Controls */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4">AI Document Controls:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-12">
                    {[
                        { label: "Scan Document", icon: FileSearch, variant: "dark" },
                        { label: "Request Record", icon: Download, variant: "primary" },
                        { label: "AI Analysis", icon: Cpu, variant: "dark" },
                        { label: "Draft Document", icon: FileText, variant: "dark" },
                        { label: "Project Record Link", icon: Share2, variant: "primary" },
                        { label: "Audit Log", icon: History, variant: "dark" }
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

export default AIDocumentAssistant;
