"use client";

import { use, useState, useEffect } from "react";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";
import { adminService } from "@/lib/services";
import {
  Search,
  Filter,
  Activity,
  User,
  Clock,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface ActivityLog {
  id: string | number;
  user_name: string;
  action: string;
  details: string;
  created_at: string;
  project_name?: string;
  project_id?: number;
  ip_address?: string;
}

interface AdminActivityLogsPageProps {
  params: Promise<{ org_slug: string }>;
}

const actionColors: Record<string, string> = {
  login: "bg-green-100 text-green-700",
  logout: "bg-gray-100 text-gray-700",
  invitation_sent: "bg-blue-100 text-blue-700",
  invitation_accepted: "bg-green-100 text-green-700",
  user_created: "bg-purple-100 text-purple-700",
  user_updated: "bg-yellow-100 text-yellow-700",
  user_deactivated: "bg-red-100 text-red-700",
  project_created: "bg-blue-100 text-blue-700",
  project_updated: "bg-yellow-100 text-yellow-700",
};

const formatAction = (action: string) =>
  action
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function AdminActivityLogsPage({ params }: AdminActivityLogsPageProps) {
  const { org_slug } = use(params);
  const { loading: guardLoading } = useAdminGuard(org_slug);

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await adminService.getActivityLogs();
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? [];
        setLogs(data);
      } catch {
        toast.error("Failed to load activity logs");
      } finally {
        setLoading(false);
      }
    };

    if (!guardLoading) {
      fetchLogs();
    }
  }, [guardLoading]);

  const filteredLogs = logs.filter((log) => {
    if (selectedUser && !log.user_name.toLowerCase().includes(selectedUser.toLowerCase()))
      return false;
    if (selectedAction && log.action !== selectedAction) return false;
    if (
      search &&
      !log.user_name.toLowerCase().includes(search.toLowerCase()) &&
      !log.details.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  if (guardLoading || loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#021422]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#021422] mb-2">
          Activity Logs
        </h1>
        <p className="text-gray-500">Track all user activities and system events</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by user or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User
                </label>
                <input
                  type="text"
                  placeholder="Filter by user..."
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Type
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                >
                  <option value="">All Actions</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="invitation_sent">Invitation Sent</option>
                  <option value="invitation_accepted">Invitation Accepted</option>
                  <option value="user_created">User Created</option>
                  <option value="user_updated">User Updated</option>
                  <option value="user_deactivated">User Deactivated</option>
                  <option value="project_created">Project Created</option>
                  <option value="project_updated">Project Updated</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Activity size={48} className="mx-auto mb-4 opacity-50" />
            <p>No activity logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.user_name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                          actionColors[log.action] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formatAction(log.action)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      {log.project_name && (
                        <div className="flex items-center gap-1.5">
                          <FolderOpen size={12} />
                          <span>{log.project_name}</span>
                        </div>
                      )}
                      {log.ip_address && (
                        <span className="text-gray-400">IP: {log.ip_address}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
