"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useMemberships } from '@/lib/hooks/useMemberships';
import { sanitizeHtml } from '@/lib/utils/sanitize';
import {
    Box,
    Award,
    AlertTriangle,
    HardHat,
    Banknote,
    TrendingUp,
    Settings
} from 'lucide-react';
import { crewManagerService } from '@/lib/services';
import CrewHeader from '../component/CrewHeader';

export default function PerformanceAnalyticsPage() {
    const params = useParams();
    const orgSlug = params.org_slug as string;
    const projectSlug = params.project_slug as string;
    const { getProject } = useMemberships();
    const project = getProject(orgSlug, projectSlug);
    const [loading, setLoading] = useState(true);
    const [productivity, setProductivity] = useState<any[]>([]);
    const [topPerformers, setTopPerformers] = useState<string[]>([]);
    const [needsAttention, setNeedsAttention] = useState<string[]>([]);
    const [qualityRates, setQualityRates] = useState<string>('');
    const [safetyIncidents, setSafetyIncidents] = useState<any>(null);
    const [costImpact, setCostImpact] = useState<string[]>([]);
    const [forecast, setForecast] = useState<string>('');
    const [optimizations, setOptimizations] = useState<string[]>([]);
    const [monthLabel, setMonthLabel] = useState('');

    const getProjectId = useCallback(() => {
        try {
            if (project) {
                return (project as any).id || (project as any).project_id;
            }
        } catch { }
        return null;
    }, [project]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const projectId = getProjectId();
            if (!projectId) return;

            setLoading(true);
            try {
                const res = await crewManagerService.getProductivity(projectId);
                const data = res.data;

                if (data) {
                    // Map productivity crews
                    const crews = data.crews || data.productivity || data.results || [];
                    if (Array.isArray(crews) && crews.length > 0) {
                        const colorCycle = ['#021422', '#007AFF'];
                        setProductivity(crews.map((c: any, idx: number) => ({
                            name: c.crew_name || c.name || `Crew ${idx + 1}`,
                            value: c.productivity ?? c.percentage ?? c.score ?? 0,
                            color: colorCycle[idx % 2],
                        })));
                    }

                    // Top performers
                    if (Array.isArray(data.top_performers) && data.top_performers.length > 0) {
                        setTopPerformers(data.top_performers.map((p: any) =>
                            `${p.name || p.member_name} (${p.crew || p.crew_name || ''}): ${p.percentage ?? p.score ?? ''}% of target`
                        ));
                    }

                    // Needs attention
                    if (Array.isArray(data.needs_attention) && data.needs_attention.length > 0) {
                        setNeedsAttention(data.needs_attention.map((a: any) =>
                            a.message || a.description || `${a.name || a.member_name}: ${a.percentage ?? a.score ?? ''}% of target`
                        ));
                    }

                    // Quality rates
                    if (data.quality_rates || data.quality_pass_rates) {
                        const qr = data.quality_rates || data.quality_pass_rates;
                        if (typeof qr === 'string') {
                            setQualityRates(qr);
                        } else if (typeof qr === 'object') {
                            const parts = Object.entries(qr).map(([k, v]) => `${k}: ${v}%`);
                            setQualityRates(parts.join('  |  '));
                        }
                    }

                    // Safety incidents
                    if (data.safety_incidents) {
                        setSafetyIncidents(data.safety_incidents);
                    }

                    // Cost impact
                    if (Array.isArray(data.cost_impact) && data.cost_impact.length > 0) {
                        setCostImpact(data.cost_impact.map((c: any) => c.message || c.description || JSON.stringify(c)));
                    }

                    // Forecast
                    if (data.forecast || data.predictive_insight) {
                        setForecast(data.forecast || data.predictive_insight);
                    }

                    // Optimizations
                    if (Array.isArray(data.optimizations || data.optimization_suggestions)) {
                        const opts = data.optimizations || data.optimization_suggestions;
                        setOptimizations(opts.map((o: any) => o.message || o.description || o));
                    }

                    // Month label
                    if (data.month || data.period) {
                        setMonthLabel(data.month || data.period);
                    }
                }
            } catch (err) {
                console.error('Performance analytics fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [getProjectId]);
    return (
        <div className="p-6 md:p-8 space-y-8 pb-32 bg-[#F8F9FA] min-h-screen">
            <CrewHeader title="Crew Performance Analytics" badge={monthLabel} project={project?.name || projectSlug} />

            {/* Section 1: Productivity Table */}
            <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">Comparative Metrics</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col lg:flex-row gap-12">

                    {/* Left Column: Metrics Visualization */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-8">
                            <Box size={20} className="text-[#021422]" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#021422]">Productivity Table</h3>
                        </div>

                        <div className="space-y-6">
                            {productivity.map((crew, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <span className="text-xs text-gray-700 font-medium w-24">{crew.name}</span>
                                    <div className="flex-1 h-12 bg-gray-200 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 h-full" style={{ backgroundColor: crew.color, width: `${crew.value}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold text-[#021422] w-8 text-right">{crew.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Highlights */}
                    <div className="flex-1 space-y-12">

                        {/* Top Performer */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Award size={20} className="text-yellow-500" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#021422]">Top Performer ({monthLabel})</h3>
                            </div>
                            <ol className="space-y-4 text-xs text-gray-600">
                                {topPerformers.map((p, idx) => (
                                    <li key={idx}>{idx + 1}. {p}</li>
                                ))}
                            </ol>
                        </div>

                        {/* Needs Attention */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle size={20} className="text-[#021422]" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#021422]">Needs Attention</h3>
                            </div>
                            <ul className="space-y-4 text-xs text-gray-600 list-disc list-inside">
                                {needsAttention.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>
            </div>

            {/* Section 2: Quality & Safety Metrics */}
            <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">Quality & Safety Metrics</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-0 overflow-hidden">

                    {/* First-Time Quality Pass Rate Banner */}
                    <div className="bg-[#021422] p-12 flex flex-col items-center justify-center text-center">
                        <div className="mb-4">
                            {/* Using a simple SVG checkmark path for the visual */}
                            <svg width="60" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3 className="text-white text-xs font-bold uppercase tracking-widest">FIRST-TIME QUALITY PASS RATE</h3>
                    </div>

                    <div className="p-8">
                        <p className="text-xs text-gray-600 mb-12 text-center md:text-left">
                            {qualityRates}
                        </p>

                        <div className="flex flex-col lg:flex-row gap-12">
                            {/* Safety Incidents Table */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <HardHat size={20} className="text-yellow-500" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#021422]">Safety Incidents by Crew</h3>
                                </div>

                                <div className="grid grid-cols-3 border border-gray-200">
                                    <div className="p-4 border-b border-gray-200 font-bold text-xs text-[#021422] text-center border-r">Near Miss</div>
                                    <div className="p-4 border-b border-gray-200 font-bold text-xs text-[#021422] text-center border-r">First Aid</div>
                                    <div className="p-4 border-b border-gray-200 font-bold text-xs text-[#021422] text-center">Recordable</div>

                                    <div className="p-4 font-medium text-xs text-gray-600 border-r border-gray-200 space-y-4">
                                        <p>Steel: {safetyIncidents?.nearMiss?.steel ?? safetyIncidents?.near_miss?.steel ?? '—'}</p>
                                        <p>Carp: {safetyIncidents?.nearMiss?.carp ?? safetyIncidents?.near_miss?.carpenter ?? '—'}</p>
                                        <p>MEP: {safetyIncidents?.nearMiss?.mep ?? safetyIncidents?.near_miss?.mep ?? '—'}</p>
                                    </div>
                                    <div className="p-4 font-medium text-xs text-gray-600 border-r border-gray-200 space-y-4">
                                        <p>Steel: {safetyIncidents?.firstAid?.steel ?? safetyIncidents?.first_aid?.steel ?? '—'}</p>
                                        <p>Carp: {safetyIncidents?.firstAid?.carp ?? safetyIncidents?.first_aid?.carpenter ?? '—'}</p>
                                        <p>MEP: {safetyIncidents?.firstAid?.mep ?? safetyIncidents?.first_aid?.mep ?? '—'}</p>
                                    </div>
                                    <div className="p-4 font-medium text-xs text-gray-600 space-y-4">
                                        <p>Steel: {safetyIncidents?.recordable?.steel ?? '—'}</p>
                                        <p>Carp: {safetyIncidents?.recordable?.carp ?? safetyIncidents?.recordable?.carpenter ?? '—'}</p>
                                        <p>MEP: {safetyIncidents?.recordable?.mep ?? '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cost Impact */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <Banknote size={20} className="text-[#021422]" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#021422]">Cost Impact</h3>
                                </div>
                                <ul className="space-y-6 text-xs text-gray-600 list-disc list-inside">
                                    {costImpact.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Predictive Insights */}
            <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">Predictive Insights</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">

                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp size={20} className="text-gray-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#021422]">Forecast Based on Trends</h3>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed ml-8" dangerouslySetInnerHTML={{ __html: sanitizeHtml(forecast) }} />
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Settings size={20} className="text-gray-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#021422]">Optimization Suggestions</h3>
                        </div>
                        <ol className="space-y-4 text-xs text-gray-600 ml-8">
                            {optimizations.map((opt, idx) => (
                                <li key={idx}>{idx + 1}. {opt}</li>
                            ))}
                        </ol>
                    </div>

                </div>
            </div>

        </div>
    );
}
