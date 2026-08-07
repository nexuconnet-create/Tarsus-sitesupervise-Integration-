"use client";

import { use, useState, useEffect } from "react";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";
import { adminService } from "@/lib/services";
import {
  Search,
  Filter,
  UserPlus,
  Mail,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InviteModal from "./components/InviteModal";
import toast from "react-hot-toast";

interface AdminInvitationsPageProps {
  params: Promise<{ org_slug: string }>;
}

interface Invitation {
  invite_uuid: string;
  email: string;
  role_name: string;
  project_uuid: string;
  project_name: string;
  status: string; // API returns: PENDING | ACCEPTED | EXPIRED | CANCELLED
  created_at: string;
  expires_at: string;
  invited_by_name: string;
  user_type?: string;
  is_expired?: boolean;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: {
    label: "Pending",
    color: "bg-orange-400",
  },
  accepted: {
    label: "Accepted",
    color: "bg-green-400",
  },
  expired: {
    label: "Expired",
    color: "bg-red-400",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-300",
  },
};

export default function AdminInvitationsPage({ params }: AdminInvitationsPageProps) {
  const { org_slug } = use(params);
  const { loading: guardLoading } = useAdminGuard(org_slug);

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setLoading(true);
      const response = await adminService.getInvitations();
      const raw: Record<string, unknown>[] = Array.isArray(response.data) ? response.data : [];
      const list: Invitation[] = raw.map((inv) => ({
        invite_uuid: (inv.invite_uuid || inv.uuid || inv.id) as string,
        email: inv.email as string,
        role_name: (inv.role_name || inv.role) as string,
        project_uuid: (inv.project_uuid || inv.project) as string,
        project_name: inv.project_name as string,
        status: ((inv.status as string) || "PENDING").toLowerCase(),
        created_at: inv.created_at as string,
        expires_at: inv.expires_at as string,
        invited_by_name: (inv.invited_by_name || inv.invited_by) as string,
        user_type: inv.user_type as string | undefined,
        is_expired: inv.is_expired as boolean | undefined,
      }));
      setInvitations(list);
      } catch (err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        toast.error(axiosErr.response?.data?.message || "Failed to load invitations");
      } finally {
        setLoading(false);
      }
    };

    if (!guardLoading) {
      fetchInvitations();
    }
  }, [guardLoading]);

  const handleResend = async (invitationId: string) => {
    if (!invitationId) {
      toast.error("Invalid invitation ID");
      return;
    }
    setActionLoading(invitationId);
    try {
      await adminService.resendInvitation(invitationId);
      toast.success("Invitation resent successfully");
      const response = await adminService.getInvitations();
      const raw: Record<string, unknown>[] = Array.isArray(response.data) ? response.data : [];
      const list: Invitation[] = raw.map((inv) => ({
        invite_uuid: (inv.invite_uuid || inv.uuid || inv.id) as string,
        email: inv.email as string,
        role_name: (inv.role_name || inv.role) as string,
        project_uuid: (inv.project_uuid || inv.project) as string,
        project_name: inv.project_name as string,
        status: ((inv.status as string) || "PENDING").toLowerCase(),
        created_at: inv.created_at as string,
        expires_at: inv.expires_at as string,
        invited_by_name: (inv.invited_by_name || inv.invited_by) as string,
        user_type: inv.user_type as string | undefined,
        is_expired: inv.is_expired as boolean | undefined,
      }));
      setInvitations(list);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to resend invitation");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (invitationId: string) => {
    if (!invitationId) {
      toast.error("Invalid invitation ID");
      return;
    }
    setConfirmRevokeId(null);
    setActionLoading(invitationId);
    try {
      await adminService.revokeInvitation(invitationId);
      toast.success("Invitation cancelled successfully");
      setInvitations((prev) =>
        prev.map((i) =>
          i.invite_uuid === invitationId ? { ...i, status: "cancelled" as const } : i
        )
      );
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to cancel invitation");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredInvitations = invitations.filter((invitation) => {
    if (selectedStatus && invitation.status !== selectedStatus) return false;
    if (selectedProject && invitation.project_uuid !== selectedProject)
      return false;
    if (
      search &&
      !invitation.email.toLowerCase().includes(search.toLowerCase())
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
                    {invitations
                      .filter((p, i, arr) => arr.findIndex((x) => x.project_uuid === p.project_uuid) === i)
                      .map((inv) => (
                        <option key={inv.project_uuid} value={inv.project_uuid}>
                          {inv.project_name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredInvitations.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Mail size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No invitations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr className="text-left text-[11px] font-medium text-gray-500">
                  <th className="px-4 py-3 w-10">#</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Sent</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInvitations.map((invitation, idx) => {
                  const invitationId = invitation.invite_uuid;
                  const statusKey = invitation.status as keyof typeof statusConfig;
                  const cfg = statusConfig[statusKey];
                  return (
                    <tr key={invitationId} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 text-gray-400 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">
                          {invitation.email}
                        </p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px]">
                          {invitation.role_name || "Unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-gray-600 truncate max-w-[160px]">
                          {invitation.project_name}
                        </p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg?.color ?? "bg-gray-300"}`} />
                          <span className="text-gray-600">{cfg?.label || invitation.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        {invitation.status === "pending" && (
                          confirmRevokeId === invitationId ? (
                            <div className="inline-flex items-center gap-2">
                              <span className="text-xs text-gray-500">Revoke?</span>
                              <button
                                onClick={() => handleCancel(invitationId)}
                                disabled={actionLoading === invitationId}
                                className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                              >
                                Yes
                              </button>
                              <span className="text-gray-200">|</span>
                              <button
                                onClick={() => setConfirmRevokeId(null)}
                                className="text-xs text-gray-400 hover:text-gray-600"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-3">
                              <button
                                onClick={() => handleResend(invitationId)}
                                disabled={actionLoading === invitationId}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                              >
                                {actionLoading === invitationId ? "Sending..." : "Resend"}
                              </button>
                              <span className="text-gray-200">|</span>
                              <button
                                onClick={() => setConfirmRevokeId(invitationId)}
                                disabled={actionLoading === invitationId}
                                className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                              >
                                Revoke
                              </button>
                            </div>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        params={params}
      />
    </div>
  );
}
