"use client";

import {
    Calendar,
    User,
    Download,
    MoreVertical,
} from "lucide-react";
import { useState, useEffect } from "react";
import engineerService from "@/lib/engineerService";
import { useAuthStore } from "@/lib/stores/authStore";


export default function PerformancePage() {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reviews, setReviews] = useState<any[]>([]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [issuesList, setIssuesList] = useState<any[]>([]);
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
                const [perfRes, issuesRes] = await Promise.all([
                    engineerService.getPerformanceReviews("").catch(() => ({ data: null })),
                    engineerService.getPerformanceCriticalIssues("").catch(() => ({ data: [] }))
                ]);
                // Extract reviews from paginated response
                const reviewData = perfRes.data?.results || (Array.isArray(perfRes.data) ? perfRes.data : []);
                const issuesData = issuesRes.data?.results || (Array.isArray(issuesRes.data) ? issuesRes.data : []);
                console.log("?? Performance Page Fetched Data:", { reviews: reviewData, issues: issuesData });
                setReviews(reviewData);
                setIssuesList(issuesData);
            } catch (err) {
                console.error("Error fetching performance data:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Compute aggregate KPI stats from reviews
    const avgScore = reviews.length > 0
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (reviews.reduce((sum: number, r: any) => sum + (r.average_score || 0), 0) / reviews.length).toFixed(1)
        : "N/A";
    const avgSafety = reviews.length > 0
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (reviews.reduce((sum: number, r: any) => sum + (r.safety_compliance || 0), 0) / reviews.length).toFixed(1)
        : "N/A";
    const avgTaskCompletion = reviews.length > 0
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (reviews.reduce((sum: number, r: any) => sum + (r.task_completion_rate || 0), 0) / reviews.length).toFixed(1)
        : "N/A";
    const avgAttendance = reviews.length > 0
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (reviews.reduce((sum: number, r: any) => sum + (r.attendance_consistency || 0), 0) / reviews.length).toFixed(1)
        : "N/A";
    const avgCollaboration = reviews.length > 0
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (reviews.reduce((sum: number, r: any) => sum + (r.collaboration_score || 0), 0) / reviews.length).toFixed(1)
        : "N/A";

    return (
        <div className="">
            <div className="flex items-center justify-between gap-4 bg-white py-7 px-4">
                <h1 className="text-2xl font-bold text-[#021422]">Performance</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-right">
                        <div className="flex flex-col">
                            <span className="font-bold text-[#021422]">{user?.fullname || user?.username || "Superintendent"}</span>
                            <span className="text-xs text-gray-500 uppercase">{user?.role?.replace('_', ' ') || "Engineer"}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User size={16} />
                        </div>
                    </div>
                </div>
            </div>


            <div className="space-y-6 pb-20 p-4 md:p-8 pt-16 md:pt-8">


                <div className="-mt-2">
                    <h2 className="text-lg text-[#021422]">Project: {project?.name || "N/A"}</h2>
                </div>


                {/* Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white">
                        <Calendar size={18} className="text-gray-500" />
                        <span className="text-gray-700">{reviews.length} Review{reviews.length !== 1 ? 's' : ''}</span>
                    </div>
                    <button className="bg-[#021422] text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors">
                        Generate Client Report
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* HSE Scorecard */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-lg text-[#021422] mb-6">Safety Compliance</h3>
                        <div className="flex items-end justify-between mb-2">
                            <div>
                                <span className="text-5xl font-bold text-[#021422]">{avgSafety}</span>
                                <p className="text-gray-500 text-sm mt-1">Avg Score</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-bold text-[#021422]">100</span>
                                <p className="text-gray-500 text-sm mt-1">Target</p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                            <div className="bg-[#021422] h-full rounded-full" style={{ width: `${avgSafety !== "N/A" ? avgSafety : 0}%` }} />
                        </div>
                    </div>

                    {/* Task Completion */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-lg text-[#021422] mb-6">Task Completion</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500 font-medium">Completion Rate</span>
                                    <span className="text-[#22c55e] font-bold">{avgTaskCompletion}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                    <div className="bg-[#22c55e] h-full rounded-full" style={{ width: `${avgTaskCompletion !== "N/A" ? avgTaskCompletion : 0}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500 font-medium">Attendance</span>
                                    <span className="text-[#0070D4] font-bold">{avgAttendance}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                    <div className="bg-[#0070D4] h-full rounded-full" style={{ width: `${avgAttendance !== "N/A" ? avgAttendance : 0}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Overall Performance */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-lg text-[#021422] mb-6">Overall Performance</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Avg Score</span>
                                <span className="text-[#22c55e] font-bold text-xl">{avgScore}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Collaboration</span>
                                <span className="text-[#0070D4] font-bold text-xl">{avgCollaboration}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Total Reviews</span>
                                <span className="text-[#021422] font-bold text-xl">{reviews.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Reviews Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h3 className="font-bold text-2xl text-[#021422] mb-8">Performance Reviews</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-4 text-sm font-medium text-gray-500">Staff</th>
                                    <th className="text-left py-4 text-sm font-medium text-gray-500">Task Completion</th>
                                    <th className="text-left py-4 text-sm font-medium text-gray-500">Attendance</th>
                                    <th className="text-left py-4 text-sm font-medium text-gray-500">Safety</th>
                                    <th className="text-left py-4 text-sm font-medium text-gray-500">Collaboration</th>
                                    <th className="text-left py-4 text-sm font-medium text-gray-500">Avg Score</th>
                                    <th className="text-left py-4 text-sm font-medium text-gray-500">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reviews.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-gray-500 font-medium">No performance reviews found.</td>
                                    </tr>
                                ) : (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    reviews.map((review: any) => (
                                        <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-6 font-semibold text-[#021422]">{review.user_name || "Unknown"}</td>
                                            <td className="py-6 text-[#021422]">{review.task_completion_rate?.toFixed(1)}%</td>
                                            <td className="py-6 text-[#021422]">{review.attendance_consistency?.toFixed(1)}%</td>
                                            <td className="py-6 text-[#021422]">{review.safety_compliance?.toFixed(1)}%</td>
                                            <td className="py-6 text-[#021422]">{review.collaboration_score?.toFixed(1)}%</td>
                                            <td className="py-6 font-bold text-[#021422]">{review.average_score?.toFixed(1)}</td>
                                            <td className="py-6">
                                                <span className={`
                                                    px-3 py-1 rounded text-xs font-bold
                                                    ${review.rating === 'EXCELLENT' ? 'bg-green-100 text-green-700' : ''}
                                                    ${review.rating === 'GOOD' ? 'bg-blue-100 text-blue-700' : ''}
                                                    ${review.rating === 'AVERAGE' ? 'bg-yellow-100 text-yellow-700' : ''}
                                                    ${review.rating === 'POOR' ? 'bg-red-100 text-red-700' : ''}
                                                `}>
                                                    {review.rating || "N/A"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Critical Issues Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h3 className="font-bold text-2xl text-[#021422] mb-8">Critical Performance Issues (This Week)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-4 text-sm font-medium text-gray-500">Task</th>
                                    <th className="text-left py-4 text-sm font-medium text-gray-500">Status</th>
                                    <th className="text-left py-4 text-sm font-medium text-gray-500">Variance</th>
                                    <th className="text-left py-4 text-sm font-medium text-gray-500">Owner</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {issuesList.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500 font-medium">No overdue tasks — all on track! ?</td>
                                    </tr>
                                ) : (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    issuesList.map((issue: any) => (
                                        <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-6 font-semibold text-[#021422]">{issue.task}</td>
                                            <td className="py-6">
                                                <span className={`
                                            px-3 py-1 rounded text-xs font-bold
                                            ${issue.status === 'On Track' ? 'bg-green-100 text-green-700' : ''}
                                            ${issue.status === 'At Risk' ? 'bg-yellow-100 text-yellow-700' : ''}
                                            ${issue.status === 'Behind' ? 'bg-red-100 text-red-700' : ''}
                                        `}>
                                                    {issue.status}
                                                </span>
                                            </td>
                                            <td className={`py-6 font-medium ${issue.variance?.includes('-') ? 'text-red-600' : 'text-gray-600'}`}>
                                                {issue.variance}
                                            </td>
                                            <td className="py-6 text-gray-600">{issue.owner}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
