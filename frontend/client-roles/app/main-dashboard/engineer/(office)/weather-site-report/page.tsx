"use client";

import {
    User,
    Sun,
    Wind,
    CheckSquare,
    Square,
    AlertTriangle,
    Camera,
    Save,
    Send,
} from "lucide-react";
import { useState, useEffect } from "react";
import engineerService from "@/lib/engineerService";
import { useAuthStore } from "@/lib/stores/authStore";


export default function WeatherSiteReportPage() {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [weatherData, setWeatherData] = useState<any>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore((s) => s.user);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [project, setProject] = useState<any>(() => {
        try {
            const stored = localStorage.getItem("selected_project");
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    useEffect(() => {
        (async () => {
            try {
                const [todayRes, historyRes] = await Promise.all([
                    engineerService.getTodaySiteReport("").catch(() => ({ data: null })),
                    engineerService.getDailySiteReports("").catch(() => ({ data: [] }))
                ]);
                console.log("?? Weather & Report Page Fetched Data:", { today: todayRes.data, history: historyRes.data });
                setWeatherData(todayRes.data);
                setReportData(historyRes.data?.results || (Array.isArray(historyRes.data) ? historyRes.data : []));
            } catch (err) {
                console.error("Error fetching report data:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (

        <div className="">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 bg-white py-7 px-4">
                <h1 className="text-2xl font-bold text-[#021422]">Weather & Site Report - {project?.name || "N/A"}</h1>
                <div className="flex items-center gap-4 text-right">
                    <div className="flex flex-col">
                        <span className="font-bold text-[#021422]">{user?.fullname || user?.username || "Superintendent"}</span>
                        <span className="text-xs text-gray-500 uppercase">{user?.role?.replace('_', ' ') || "Engineer"}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={16} />
                    </div>
                </div>
            </div>


            <div className="space-y-6 pb-20 p-4 md:p-8 pt-16 md:pt-8" >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Weather Impact */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-lg font-bold text-[#021422]">Weather Impact</h2>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Workability Score</p>
                                    <span className="text-2xl font-bold text-green-500">{weatherData?.workability_score || 0}/10</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-xs text-gray-400 font-medium">Current Weather</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-[#021422]">{weatherData?.weather_summary || "Clear Sky"}</span>
                                    {weatherData?.temperature && (
                                        <span className="text-lg text-gray-500 font-medium">{weatherData.temperature}�C</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-[#021422]">Impacts:</h3>
                                {weatherData?.weather_impact_notes ? (
                                    <div className="bg-orange-50 p-3 rounded-lg flex items-center gap-3 border border-orange-100">
                                        <Sun size={18} className="text-orange-400" />
                                        <span className="text-sm font-medium text-[#021422]">{weatherData.weather_impact_notes}</span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">No significant weather impacts recorded for today.</p>
                                )}
                                {weatherData?.wind_speed && (
                                    <div className="bg-green-50 p-3 rounded-lg flex items-center gap-3 border border-green-100">
                                        <Wind size={18} className="text-green-500" />
                                        <span className="text-sm font-medium text-[#021422]">Wind: {weatherData.wind_speed}km/h</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Progress Tracking */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold text-[#021422] mb-6">Progress Tracking</h2>
                            <div className="space-y-6">
                                {weatherData?.work_packages_affected?.length > 0 ? (
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-orange-500">Affected Packages:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {weatherData.work_packages_affected.map((pkg: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg uppercase">{pkg}</span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 font-medium">Operations are proceeding normally. No delays reported.</p>
                                )}

                                <div className="flex gap-4 items-center text-xs mt-2">
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#22c55e]" /> On Track</div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#eab308]" /> Weather Affected</div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#ef4444]" /> Delayed</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Today's Site Report */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-[#021422]">Today&apos;s Site Report</h2>
                                <span className="text-[10px] font-bold uppercase py-1 px-3 bg-gray-100 rounded-full">{weatherData?.date || "2026-03-06"}</span>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-2">Reported By</p>
                                    <p className="text-sm font-bold text-[#021422]">{weatherData?.reported_by_name || "Superintendent"}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-2">Daily Summary</p>
                                    <p className="text-sm text-gray-600 leading-relaxed italic">
                                        {weatherData?.weather_impact_notes || "No site report notes recorded for today. The site is operating at optimal workability."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Critical Issues / Delays */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold text-[#021422] mb-6">Critical Issues / Delays</h2>
                            <div className="space-y-4">
                                <div className={`p-4 rounded-xl border ${weatherData?.workability_score < 5 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle size={18} className={weatherData?.workability_score < 5 ? 'text-red-500' : 'text-green-500'} />
                                        <p className="text-sm font-bold text-[#021422]">
                                            {weatherData?.workability_score < 5 ? 'High Weather Risk Detected' : 'No Critical Weather Delays'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Historical Reports Table */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-[#021422] mb-6">Weather History & Reports Log</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="py-4 px-2 text-[10px] font-bold uppercase text-gray-400">Date</th>
                                    <th className="py-4 px-2 text-[10px] font-bold uppercase text-gray-400">Weather</th>
                                    <th className="py-4 px-2 text-[10px] font-bold uppercase text-gray-400">Temp</th>
                                    <th className="py-4 px-2 text-[10px] font-bold uppercase text-gray-400">Wind</th>
                                    <th className="py-4 px-2 text-[10px] font-bold uppercase text-gray-400">Score</th>
                                    <th className="py-4 px-2 text-[10px] font-bold uppercase text-gray-400">Summary</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {reportData?.map((report: any) => (
                                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-2 text-xs font-bold text-[#021422]">{report.date}</td>
                                        <td className="py-4 px-2 text-xs text-gray-600">{report.weather_summary || "N/A"}</td>
                                        <td className="py-4 px-2 text-xs text-gray-600">{report.temperature ? `${report.temperature}�C` : "-"}</td>
                                        <td className="py-4 px-2 text-xs text-gray-600">{report.wind_speed ? `${report.wind_speed}km/h` : "-"}</td>
                                        <td className="py-4 px-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${report.workability_score >= 8 ? 'bg-green-100 text-green-700' : report.workability_score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {report.workability_score}/10
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-xs text-gray-400 italic truncate max-w-xs">{report.weather_impact_notes || "No notes"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Media Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-[#021422] mb-6">Site Media</h2>
                    <div className="flex gap-4">
                        <button className="aspect-square w-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                            <Camera className="text-[#021422]" />
                            <span className="text-xs font-bold text-[#021422]">Add Photo</span>
                        </button>
                    </div>
                    <button className="w-full mt-6 py-4 bg-gray-50 text-[#021422] font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors uppercase tracking-wide">
                        AR Site Walk & Calibration
                    </button>
                    <div className="flex gap-4 mt-6 justify-end">
                        <button className="px-8 py-3 bg-white border border-gray-200 rounded-lg font-bold text-[#021422] hover:bg-gray-50 transition-colors">
                            Save Draft
                        </button>
                        <button className="px-8 py-3 bg-[#021422] text-white rounded-lg font-bold hover:bg-gray-900 transition-colors">
                            Submit Daily Report & Notify PM
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}