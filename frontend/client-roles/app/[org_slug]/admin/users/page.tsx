"use client";
 

import { use, useState, useEffect } from "react";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";
import { adminService } from "@/lib/services";
import { Search, Filter, UserX, Loader2, Pencil, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/error";

interface AdminUsersPageProps {
  params: Promise<{ org_slug: string }>;
}

interface ProjectMember {
  id: number;
  uuid: string;
  user: number;
  user_email: string;
  project: string;
  role: number;
  role_name: string;
  is_active: boolean;
  project_name: string;
  project_slug: string;
}

interface Project {
  uuid: string;
  name: string;
  slug: string;
}

interface RoleOption {
  id: number;
  name: string;
}

function emailInitial(email: string) {
  return (email?.split("@")[0]?.[0] ?? "?").toUpperCase();
}

export default function AdminUsersPage({ params }: AdminUsersPageProps) {
  const { org_slug } = use(params);
  const { loading: guardLoading } = useAdminGuard(org_slug);

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Edit modal state
  const [editMember, setEditMember] = useState<ProjectMember | null>(null);
  const [editRole, setEditRole] = useState<number>(0);
  const [editActive, setEditActive] = useState(true);
  const [editSaving, setEditSaving] = useState(false);

  // Remove confirm state
  const [removeMember, setRemoveMember] = useState<ProjectMember | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  useEffect(() => {
    if (guardLoading) return;

    const fetchAllMembers = async () => {
      setLoading(true);
      try {
        const projectsRes = await adminService.getProjects(org_slug);
        const raw = projectsRes.data;
        const projects: Project[] = (
          Array.isArray(raw)
            ? raw
            : (raw?.results ?? raw?.data?.results ?? raw?.data ?? [])
        ).map((p: Project & { id?: string }) => ({
          ...p,
          uuid: p.uuid ?? p.id,
        }));

        if (projects.length === 0) {
          setMembers([]);
          return;
        }

        const memberResults = await Promise.allSettled(
          projects.map((p) =>
            adminService.getProjectMembers(org_slug, p.uuid).then((res) => {
              const d = res.data;
              const raw: Omit<ProjectMember, "project_name" | "project_slug">[] =
                Array.isArray(d) ? d : (d?.results ?? d?.data?.results ?? d?.data ?? []);
              return raw.map((m) => ({
                ...m,
                project_name: p.name,
                project_slug: p.slug,
              }));
            })
          )
        );

        const flat: ProjectMember[] = memberResults.flatMap((r) =>
          r.status === "fulfilled" ? r.value : []
        );

        setMembers(flat);
      } catch {
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMembers();
  }, [org_slug, guardLoading]);

  const uniqueRoles = Array.from(
    new Map(members.filter((m) => m.role && m.role_name).map((m) => [m.role, m.role_name])).entries()
  ).map(([id, name]): RoleOption => ({ id, name }));

  const uniqueProjects = Array.from(
    new Map(members.map((m) => [m.project_slug, m.project_name])).entries()
  );

  const filtered = members.filter((m) => {
    if (selectedRole && m.role_name !== selectedRole) return false;
    if (selectedProject && m.project_slug !== selectedProject) return false;
    if (search && !m.user_email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openEdit = (member: ProjectMember) => {
    setEditMember(member);
    setEditRole(member.role);
    setEditActive(member.is_active);
  };

  const handleEditSave = async () => {
    if (!editMember) return;
    setEditSaving(true);
    try {
      await adminService.updateProjectMember(org_slug, editMember.project, editMember.id, {
        role: editRole,
        is_active: editActive,
      });
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editMember.id && m.project === editMember.project
            ? {
                ...m,
                role: editRole,
                role_name: uniqueRoles.find((r) => r.id === editRole)?.name ?? m.role_name,
                is_active: editActive,
              }
            : m
        )
      );
      toast.success("Member updated");
      setEditMember(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setEditSaving(false);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!removeMember) return;
    setRemoveLoading(true);
    try {
      await adminService.removeProjectMember(org_slug, removeMember.project, removeMember.id);
      setMembers((prev) =>
        prev.filter((m) => !(m.id === removeMember.id && m.project === removeMember.project))
      );
      toast.success(`${removeMember.user_email} removed from ${removeMember.project_name}`);
      setRemoveMember(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemoveLoading(false);
    }
  };

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
        <h1 className="text-2xl md:text-3xl font-bold text-[#021422] mb-2">User Management</h1>
        <p className="text-gray-500">All members across every project in this organisation</p>
      </div>

      {/* Search & filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
            {(selectedRole || selectedProject) && (
              <span className="w-2 h-2 bg-[#021422] rounded-full" />
            )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                  >
                    <option value="">All Roles</option>
                    {uniqueRoles.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                  >
                    <option value="">All Projects</option>
                    {uniqueProjects.map(([slug, name]) => (
                      <option key={slug} value={slug}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {(selectedRole || selectedProject) && (
                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setSelectedRole(""); setSelectedProject(""); }}
                    className="text-xs text-gray-500 hover:text-[#021422] underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <UserX size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium">
              {members.length === 0 ? "No members found in any project" : "No members match your filters"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((member) => (
                  <tr key={`${member.uuid}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#021422] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                          {emailInitial(member.user_email)}
                        </div>
                        <p className="text-sm text-gray-800">{member.user_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
                        {member.role_name || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{member.project_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          member.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(member)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#021422] hover:bg-gray-100 transition-colors"
                          title="Edit member"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setRemoveMember(member)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-4 text-right">
          Showing {filtered.length} of {members.length} member{members.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setEditMember(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#021422]">Edit Member</h2>
                <button onClick={() => setEditMember(null)} className="p-1 rounded hover:bg-gray-100">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">{editMember.user_email}</span>
                {" · "}
                {editMember.project_name}
              </p>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422]"
                >
                  {uniqueRoles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700">Active</p>
                  <p className="text-xs text-gray-400">Inactive members cannot access the project</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editActive ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      editActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setEditMember(null)}
                  className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={editSaving}
                  className="flex-1 bg-[#021422] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-[#021422] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {editSaving && <Loader2 size={14} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove Confirm Modal */}
      <AnimatePresence>
        {removeMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setRemoveMember(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4"
            >
              <h2 className="text-lg font-bold text-[#021422]">Remove Member</h2>
              <p className="text-sm text-gray-600">
                Remove{" "}
                <span className="font-semibold text-gray-800">{removeMember.user_email}</span>{" "}
                from{" "}
                <span className="font-semibold text-gray-800">{removeMember.project_name}</span>?
                This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRemoveMember(null)}
                  className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveConfirm}
                  disabled={removeLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {removeLoading && <Loader2 size={14} className="animate-spin" />}
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
