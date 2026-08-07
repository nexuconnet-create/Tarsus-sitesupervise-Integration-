"use client";
import BackButton from "@/components/BackButton";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import {
    Search,
    Zap,
    Target,
    FileText,
    History,
    Download,
    Share2
} from "lucide-react";
import DashboardSection from "../../components/DashboardSection";
import { projectManagerService } from "@/lib/services";

const SearchDiscovery = () => {
    const [activeProject, setActiveProject] = React.useState<any>(null);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<any[]>([]);
    const [searched, setSearched] = React.useState(false);
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

    const handleSearch = async () => {
        if (!activeProject) return;
        setLoading(true);
        setSearched(true);
        console.log(`[Document Search] Endpoint: GET /api/v1/project-manager/documents/files/?project_id=${activeProject.id}`);
        try {
            const res = await projectManagerService.getDocuments(activeProject.id);
            const docs = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            const filtered = query.trim()
                ? docs.filter((d: any) =>
                    (d.title || d.document_type || '').toLowerCase().includes(query.toLowerCase())
                )
                : docs;
            console.log('[Document Search] Results:', filtered);
            setResults(filtered);
        } catch (err) {
            console.error("Search failed", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 text-[#021422]">
            {/* Header Info Bar */}
            <div className="bg-[#021422] text-white p-4 px-8 flex justify-between items-center text-sm border-b border-gray-800">
                <div className="flex items-center gap-3"><BackButton className="text-white hover:bg-white/10" /><div className="font-bold tracking-widest uppercase">Smart Document Search — AI-Powered Discovery</div></div>
                <div className="bg-white/10 px-4 py-1 rounded text-xs font-bold uppercase">DISCOVERY ENGINE ACTIVE</div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Intelligent Search Bar */}
                <DashboardSection title="Intelligent Search Bar" icon={<Search size={20} />}>
                    <div className="space-y-8">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search documents, contracts, RFIs, or draw names..."
                                    className="w-full bg-[#F9FAFB] border border-gray-200 rounded-full py-4 pl-12 pr-6 text-base focus:outline-none focus:ring-2 focus:ring-[#0166B0]/20 font-medium"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={loading || !activeProject}
                                className="bg-[#0166B0] text-white px-8 py-2 rounded-full font-bold text-sm uppercase transition-colors hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        {!activeProject && (
                            <div className="text-amber-700 text-sm font-medium">No active project found. Please set up a project first.</div>
                        )}
                    </div>
                </DashboardSection>

                {/* Search Results */}
                <DashboardSection title="Search Results with AI Ranking" icon={<Target size={20} />}>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center text-xs font-bold uppercase text-gray-500 mb-2">
                            <span>
                                {searched
                                    ? `${results.length} result${results.length !== 1 ? 's' : ''} found`
                                    : 'Enter a query and press Search'}
                            </span>
                            {results.length > 0 && <span>Ranked by Relevance</span>}
                        </div>

                        <div className="space-y-4">
                            {results.length > 0 ? results.map((doc: any, idx: number) => (
                                <div key={idx} className="border-l-4 border-[#0166B0] bg-white p-4 shadow-sm space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="text-sm font-bold uppercase">{idx + 1}. {doc.title || doc.document_type || `Document ${idx + 1}`}</div>
                                        <div className="text-xs font-bold text-blue-600 uppercase">{doc.document_type || '—'}</div>
                                    </div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">Status: {doc.status || '—'} | Version: {doc.version || '—'}</div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">
                                        Created: {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
                                    </div>
                                </div>
                            )) : searched && !loading ? (
                                <div className="text-gray-500 text-sm text-center py-6">No documents found matching your query.</div>
                            ) : null}
                        </div>

                        <div className="flex gap-2">
                            <button className="bg-[#021422] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800">Audit Trail</button>
                            <button className="bg-[#0166B0] text-white px-8 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-blue-700">Export Results</button>
                        </div>
                    </div>
                </DashboardSection>

                {/* Search Controls Section */}
                <div className="text-gray-900 font-bold text-base uppercase mb-4">Search Controls:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-12">
                    {[
                        { label: "New Search", icon: Search, variant: "dark" },
                        { label: "AI Filter", icon: Zap, variant: "primary" },
                        { label: "Search History", icon: History, variant: "dark" },
                        { label: "Audit Result", icon: FileText, variant: "dark" },
                        { label: "Export Results", icon: Download, variant: "primary" },
                        { label: "Share Log", icon: Share2, variant: "dark" }
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

export default SearchDiscovery;
