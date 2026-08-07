"use client";

import Link from "next/link";
import { useAdmin } from "@/lib/mock/AdminContext";
import { ArrowRight, Clock, FolderOpen, Mail, UserPlus, Users } from "lucide-react";

export default function AdminDashboardPage() {
  const { users, projects, invitations } = useAdmin();
  const pendingCount = invitations.filter((invitation) => invitation.status === "pending").length;
  const statCards = [
    { title: "Users", value: users.length, icon: Users, href: "/main-dashboard/admin/users" },
    { title: "Projects", value: projects.length, icon: FolderOpen, href: "/main-dashboard/admin/projects" },
    { title: "Invitations", value: invitations.length, icon: Mail, href: "/main-dashboard/admin/invitations" },
    { title: "Pending", value: pendingCount, icon: Clock, href: "/main-dashboard/admin/invitations" },
  ];

  return <div className="p-6 md:p-8">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div><h1 className="text-2xl md:text-3xl font-bold text-[#021422] mb-1">Admin</h1><p className="text-sm text-gray-500">Stakeholder review workspace</p></div>
      <Link href="/main-dashboard/admin/invitations" className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-[#021422] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0F181F] transition"><UserPlus size={16}/>Invite User</Link>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">{statCards.map((card) => <Link key={card.title} href={card.href} className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition group"><div className="p-2 bg-[#021422]/10 rounded-lg"><card.icon size={18} className="text-[#021422]"/></div><div className="flex-1 min-w-0"><p className="text-lg font-bold text-gray-900">{card.value}</p><p className="text-[11px] text-gray-500">{card.title}</p></div><ArrowRight size={14} className="text-gray-300 group-hover:text-[#021422] transition"/></Link>)}</div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="flex items-center justify-between px-4 py-3 border-b border-gray-50"><h2 className="text-sm font-semibold text-gray-900">Recent Invitations</h2><Link href="/main-dashboard/admin/invitations" className="text-[11px] text-gray-400 hover:text-gray-600">View all</Link></div>
      {invitations.length === 0 ? <div className="py-8 text-center text-gray-400"><Mail size={24} className="mx-auto mb-2 opacity-50"/><p className="text-xs">No invitations yet</p></div> : <><div className="flex items-center gap-3 px-4 py-2 border-b border-gray-50 text-[10px] font-medium text-gray-400"><span className="w-6 text-center">#</span><span className="flex-1">Email</span><span className="w-28 text-center">Role</span><span className="w-20 text-center">Status</span></div><div className="divide-y divide-gray-50">{invitations.slice(0, 5).map((invitation, index) => { const statusColor = invitation.status === "accepted" ? "text-green-600" : invitation.status === "pending" ? "text-orange-500" : "text-gray-400"; return <div key={invitation.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/50"><span className="w-6 text-center text-[11px] text-gray-400 tabular-nums">{index + 1}</span><p className="text-xs font-medium text-gray-900 truncate flex-1">{invitation.email}</p><span className="w-28 text-center text-[11px] text-gray-500 bg-gray-50 rounded px-2 py-0.5 truncate">{invitation.role.replaceAll("_", " ")}</span><span className={`text-[11px] font-medium w-20 text-center capitalize ${statusColor}`}>{invitation.status}</span></div>; })}</div></>}
    </div>
  </div>;
}
