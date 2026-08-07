"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  Users,
  Download,
  Plus,
  MoreVertical,
} from "lucide-react";

import engineerService from "@/lib/engineerService";
import { useAuthStore } from "@/lib/stores/authStore";


export default function AttendancePage() {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [staffList, setStaffList] = useState<any[]>([]);
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
        const res = await engineerService.getAttendance("");
        const data = res.data?.results || (Array.isArray(res.data) ? res.data : []);
        console.log("?? Attendance Page Fetched Data:", data);
        if (Array.isArray(data) && data.length > 0) {
          setStaffList(data);
        }
      } catch (error) {
        console.error("Error fetching attendance data", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const displayList = staffList;

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-[#021422]">Attendance & Labour Management</h1>
          <p className="text-gray-600 mt-1">Project: {project?.name || "N/A"}</p>
        </div>
        <div className="flex flex-col items-end text-sm text-gray-600">
          <span className="font-semibold text-[#021422]">{user?.fullname || user?.username || "Superintendent"}</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
      </div>


      <div className="space-y-6 pb-20 p-4 md:p-8 pt-16 md:pt-8">

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Date:</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Load Crew</label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none bg-white">
                <option>Select Crew...</option>
                <option>Crew A</option>
                <option>Crew B</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Bulk Actions</label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none bg-white">
                <option>Select Action...</option>
                <option>Approve All</option>
                <option>Mark All Late</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full px-4 py-3 bg-[#021422] text-white rounded-lg font-medium hover:bg-gray-900 transition-colors">
                Notify Absent
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button className="px-6 py-3 bg-[#021422] text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center gap-2">
              <Download size={18} />
              Export Daily Report
            </button>
            <button className="px-6 py-3 bg-[#0070D4] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Plus size={18} />
              Add Staff
            </button>
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Name</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Trade</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Scheduled</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Clock-in</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">No data available</td>
                  </tr>
                ) : (
                  displayList.map((staff) => (
                    <tr key={staff.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-6 px-4 font-semibold text-[#021422] whitespace-nowrap">{staff.user_name || (staff.first_name ? staff.first_name + " " + staff.last_name : "Unknown")}</td>
                      <td className="py-6 px-4 text-[#021422] whitespace-nowrap">{staff.trade || staff.role || "N/A"}</td>
                      <td className="py-6 px-4 text-[#021422] whitespace-nowrap">{staff.scheduled || "07:00 - 15:30"}</td>
                      <td className="py-6 px-4 text-[#021422] whitespace-nowrap">{staff.clock_in || staff.clock_in_time || "-"}</td>
                      <td className="py-6 px-4 whitespace-nowrap">
                        <span className={`
                                      px-4 py-1.5 rounded-full text-sm font-bold inline-block w-[100px] text-center
                                      ${(staff.status || '').toLowerCase() === 'present' ? 'bg-green-100 text-green-600' : ''}
                                      ${(staff.status || '').toLowerCase() === 'late' ? 'bg-yellow-100 text-yellow-700' : ''}
                                      ${(staff.status || '').toLowerCase() === 'absent' ? 'bg-red-100 text-red-600' : ''}
                                      ${!['present', 'late', 'absent'].includes((staff.status || '').toLowerCase()) ? 'bg-gray-100 text-gray-700' : ''}
                                  `}>
                          {staff.status || "Unknown"}
                        </span>
                      </td>
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