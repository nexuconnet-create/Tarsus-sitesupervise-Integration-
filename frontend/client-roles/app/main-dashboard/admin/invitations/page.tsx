"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/mock/AdminContext";
import {
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  X,
  Clock,
  CheckCircle,
  Mail,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InviteModal from "./components/InviteModal";

const roleLabels: Record<string, string> = {
  PROJECT_ENGINEER: "Project Engineer",
  SITE_SUPERVISOR: "Site Supervisor",
  PROJECT_MANAGER: "Project Manager",
  CLIENT: "Client",
};

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-orange-100 text-orange-700",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  expired: {
    label: "Expired",
    color: "bg-red-100 text-red-700",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-700",
    icon: X,
  },
};

export default function AdminInvitationsPage() {
  const { invitations, projects, cancelInvitation, resendInvitation } =
    useAdmin();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleResend = (invitationId: string) => {
    setActionLoading(invitationId);
    resendInvitation(invitationId);
    setTimeout(() => setActionLoading(null), 500);
  };

  const handleCancel = (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;
    setActionLoading(invitationId);
    cancelInvitation(invitationId);
    setTimeout(() => setActionLoading(null), 500);
  };

  const filteredInvitations = invitations.filter((invitation) => {
    if (selectedStatus && invitation.status !== selectedStatus) return false;
    if (selectedProject && invitation.project_id !== parseInt(selectedProject))
      return false;
    if (
      search &&
      !invitation.email.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#021422] mb-2">
            Invitations
          </h1>
          <p className="text-gray-500">
            Manage user invitations to your projects
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-[#021422] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0F181F] transition"
        >
          <UserPlus size={20} />
          Invite User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by email..."
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

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                  >
                    <option value="">All Projects</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Invitations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredInvitations.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Mail size={48} className="mx-auto mb-4 opacity-50" />
            <p>No invitations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Sent</th>
                  <th className="px-6 py-4">Expires</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvitations.map((invitation) => {
                  const StatusIcon =
                    statusConfig[invitation.status]?.icon || Clock;
                  return (
                    <tr key={invitation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {invitation.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {roleLabels[invitation.role] || invitation.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {invitation.project_name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                            statusConfig[invitation.status]?.color ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <StatusIcon size={12} />
                          {statusConfig[invitation.status]?.label ||
                            invitation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500">
                          {new Date(invitation.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500">
                          {new Date(invitation.expires_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {invitation.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleResend(invitation.id)}
                                disabled={actionLoading === invitation.id}
                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 disabled:opacity-50"
                                title="Resend invitation"
                              >
                                {actionLoading === invitation.id ? (
                                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <RefreshCw size={16} />
                                )}
                              </button>
                              <button
                                onClick={() => handleCancel(invitation.id)}
                                disabled={actionLoading === invitation.id}
                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 disabled:opacity-50"
                                title="Cancel invitation"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
}
