"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";
import { adminService } from "@/lib/services";
import {
  Users,
  Mail,
  FolderOpen,
  UserPlus,
  ArrowRight,
  Loader2,
  Clock,
} from "lucide-react";

interface AdminPageProps {
  params: Promise<{ org_slug: string }>;
}

export default function AdminDashboardPage({ params }: AdminPageProps) {
  const { org_slug } = use(params);
  const { loading: guardLoading } = useAdminGuard(org_slug);
  const { getOrg } = useMemberships();

  const org = getOrg(org_slug);

  const [userCount, setUserCount] = useState<number | null>(null);
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [invitationCount, setInvitationCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [recentInvitations, setRecentInvitations] = useState<Array<{
    invite_uuid: string;
    email: string;
    status: string;
    role_name: string;
    created_at: string;
  }>>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (guardLoading) return;

    const controller = new AbortController();
    const { signal } = controller;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [usersRes, projectsRes, invitationsRes] = await Promise.allSettled([
          adminService.getUsers(),
          adminService.getProjects(org_slug),
          adminService.getInvitations(),
        ]);

        if (signal.aborted) return;

        if (usersRes.status === "fulfilled") {
          const raw = usersRes.value.data;
          const list = Array.isArray(raw) ? raw : (raw?.results ?? raw?.data ?? []);
          setUserCount(list.length);
        }

        if (projectsRes.status === "fulfilled") {
          const raw = projectsRes.value.data;
          const list = Array.isArray(raw) ? raw : (raw?.results ?? raw?.data ?? []);
          setProjectCount(list.length);
        }

        if (invitationsRes.status === "fulfilled") {
          const raw = invitationsRes.value.data;
          const list: Array<{ invite_uuid: string; email: string; status: string; role_name: string; created_at: string }> = Array.isArray(raw) ? raw : (raw?.results ?? []);
          setInvitationCount(list.length);
          setPendingCount(list.filter((i) => i.status?.toLowerCase() === "pending").length);
          setRecentInvitations(list.slice(0, 5));
        }
      } catch {
        // Partial data is fine â€” cards show "â€”" for failed endpoints
      } finally {
        if (!signal.aborted) setLoadingData(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [org_slug, guardLoading]);

  if (guardLoading) return null;

  const statCards = [
    {
      title: "Users",
      value: userCount,
      icon: Users,
      href: `/${org_slug}/admin/users`,
    },
    {
      title: "Projects",
      value: projectCount,
      icon: FolderOpen,
      href: `/${org_slug}/admin/projects`,
    },
    {
      title: "Invitations",
      value: invitationCount,
      icon: Mail,
      href: `/${org_slug}/admin/invitations`,
    },
    {
      title: "Pending",
      value: pendingCount,
      icon: Clock,
      href: `/${org_slug}/admin/invitations`,
    },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#021422] mb-1">
            Admin
          </h1>
          <p className="text-sm text-gray-500">
            {org?.org || org_slug}
          </p>
        </div>
        <Link
          href={`/${org_slug}/admin/invitations`}
          className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-[#021422] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0F181F] transition"
        >
          <UserPlus size={16} />
          Invite User
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition group"
          >
            <div className="p-2 bg-[#021422]/10 rounded-lg">
              <card.icon size={18} className="text-[#021422]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-gray-900">
                {loadingData ? (
                  <Loader2 size={16} className="animate-spin text-gray-300" />
                ) : card.value !== null ? (
                  card.value
                ) : (
                  "â€”"
                )}
              </p>
              <p className="text-[11px] text-gray-500">{card.title}</p>
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-[#021422] transition" />
          </Link>
        ))}
      </div>

      {/* Recent Invitations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Recent Invitations</h2>
          <Link
            href={`/${org_slug}/admin/invitations`}
            className="text-[11px] text-gray-400 hover:text-gray-600"
          >
            View all
          </Link>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-gray-300" />
          </div>
        ) : recentInvitations.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <Mail size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">No invitations yet</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-50 text-[10px] font-medium text-gray-400">
              <span className="w-6 text-center">#</span>
              <span className="flex-1">Email</span>
              <span className="w-28 text-center">Role</span>
              <span className="w-20 text-center">Status</span>
            </div>
            <div className="divide-y divide-gray-50">
              {recentInvitations.map((inv, idx) => {
                const s = inv.status?.toLowerCase();
                const statusColor = s === "accepted" ? "text-green-600"
                  : s === "pending" ? "text-orange-500"
                  : "text-gray-400";
                return (
                  <div key={inv.invite_uuid} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/50">
                    <span className="w-6 text-center text-[11px] text-gray-400 tabular-nums">{idx + 1}</span>
                    <p className="text-xs font-medium text-gray-900 truncate flex-1">{inv.email}</p>
                    <span className="w-28 text-center text-[11px] text-gray-500 bg-gray-50 rounded px-2 py-0.5">
                      {inv.role_name || "â€”"}
                    </span>
                    <span className={`text-[11px] font-medium w-20 text-center capitalize ${statusColor}`}>
                      {s}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
