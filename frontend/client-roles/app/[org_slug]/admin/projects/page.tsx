"use client";

import { use, useState, useEffect } from "react";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";
import { adminService, authService } from "@/lib/services";
import Link from "next/link";
import {
  Plus,
  Search,
  Building2,
  Users,
  Calendar,
  MapPin,
  Loader2,
  X,
  ExternalLink,
  Clock,
  Activity,
  UserPlus,
  UserX,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/error";

interface AdminProjectsPageProps {
  params: Promise<{ org_slug: string }>;
}

interface Project {
  uuid: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  health_status?: string;
  phase?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  budget?: number;
  spent?: number;
  members_count?: number;
  created_at?: string;
  manager_name?: string;
}

interface ProjectMember {
  id?: number;       // numeric PK used for update/delete (may not be in response)
  uuid: string;      // UUID exposed in response
  user: number;
  user_email: string;
  project: number | string;
  role: number;
  role_name: string;
  is_active: boolean;
}

interface OrgUser {
  id: string;        // UUID string from /api/v1/auth/users/
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  fullname?: string;
}

interface RoleOption {
  id: string | number;
  name: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "bg-green-400" },
  COMPLETED: { label: "Completed", color: "bg-blue-400" },
  ON_HOLD: { label: "On Hold", color: "bg-orange-400" },
  PAUSED: { label: "Paused", color: "bg-yellow-400" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-300" },
};

export default function AdminProjectsPage({ params }: AdminProjectsPageProps) {
  const { org_slug } = use(params);
  const { loading: guardLoading } = useAdminGuard(org_slug);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ── Members management ──────────────────────────────────────────────────────
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [addMemberUser, setAddMemberUser] = useState<string | null>(null);
  const [addMemberRole, setAddMemberRole] = useState<string | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [memberActionLoading, setMemberActionLoading] = useState<string | null>(null);

  const [newProject, setNewProject] = useState({
    name: "",
    // description: "",
    start_date: "",
    end_date: "",
    status: "ACTIVE",
    health_status: "GOOD",
    phase: "PLANNING",
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await adminService.getProjects(org_slug);
        const raw = response.data;
        const list: Project[] = Array.isArray(raw)
          ? raw
          : (raw?.results ?? raw?.data?.results ?? []);
        setProjects(list.map((p) => {
          const raw = p as { id?: string };
          return { ...p, uuid: p.uuid ?? raw.id! };
        }));
      } catch (err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        toast.error(
          axiosErr.response?.data?.message || "Failed to load projects",
        );
      } finally {
        setLoading(false);
      }
    };

    if (!guardLoading) {
      fetchProjects();
    }
  }, [org_slug, guardLoading]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    setCreating(true);
    try {
      await adminService.createProject(org_slug, {
        name: newProject.name,
        //       description: newProject.description || undefined,
        start_date: newProject.start_date || undefined,
        end_date: newProject.end_date || undefined,
        status: newProject.status,
        health_status: newProject.health_status,
        phase: newProject.phase,
      });
      toast.success("Project created successfully");
      setShowCreateModal(false);
      setNewProject({
        name: "",
        // description: "",
        start_date: "",
        end_date: "",
        status: "ACTIVE",
        health_status: "GOOD",
        phase: "PLANNING",
      });
      const response = await adminService.getProjects(org_slug);
      const raw = response.data;
      const list: Project[] = Array.isArray(raw)
        ? raw
        : (raw?.results ?? raw?.data?.results ?? []);
      setProjects(list.map((p) => {
        const raw = p as { id?: string };
        return { ...p, uuid: p.uuid ?? raw.id! };
      }));
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(
        axiosErr.response?.data?.message || "Failed to create project",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleEditOpen = (project: Project) => {
    setEditingProject(project);
    setEditForm({
      name: project.name,
      start_date: project.start_date ?? "",
      end_date: project.end_date ?? "",
      status: project.status,
      health_status: project.health_status ?? "GOOD",
      phase: project.phase ?? "PLANNING",
    });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setSaving(true);
    try {
      await adminService.updateProject(editingProject.uuid, org_slug, {
        name: editForm.name,
        start_date: editForm.start_date || undefined,
        end_date: editForm.end_date || undefined,
        status: editForm.status,
        health_status: editForm.health_status,
        phase: editForm.phase,
      });
      toast.success("Project updated successfully");
      setProjects((prev) =>
        prev.map((p) =>
          p.uuid === editingProject.uuid ? { ...p, ...editForm } : p,
        ),
      );
      setEditingProject(null);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    setDeleting(project.uuid);
    try {
      await adminService.deleteProject(project.uuid, org_slug);
      toast.success("Project deleted");
      setProjects((prev) => prev.filter((p) => p.uuid !== project.uuid));
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to delete project");
    } finally {
      setDeleting(null);
    }
  };

  // Load members + users + roles whenever a project detail modal opens.
  // AbortController prevents stale setState if the modal closes or switches
  // project while a request is still in-flight.
  useEffect(() => {
    if (!viewingProject) return;

    const controller = new AbortController();
    const { signal } = controller;

    // ① Current project members
    // GET /api/v1/orgs/{org_slug}/projects/{project_uuid}/members/
    // Returns paginated { count, next, previous, results: ProjectMember[] }
    // ⚠️  Requires org-admin permission on the backend (currently 403)
    adminService
      .getProjectMembers(org_slug, viewingProject.uuid)
      .then((res) => {
        if (signal.aborted) return;
        const raw = res.data;
        const data: ProjectMember[] = Array.isArray(raw)
          ? raw
          : (raw?.results ?? raw?.data?.results ?? raw?.data ?? []);
        setProjectMembers(data);
      })
      .catch((err) => {
        if (signal.aborted) return;
        toast.error(getErrorMessage(err) || "Failed to load project members");
      })
      .finally(() => {
        if (!signal.aborted) setMembersLoading(false);
      });

    // ② Org users for the Add Member dropdown
    // GET /api/v1/auth/users/
    // ⚠️  Scope unverified — confirm this returns only org-scoped users
    authService
      .getUsers()
      .then((res) => {
        if (signal.aborted) return;
        const raw = res.data;
        const data: OrgUser[] = Array.isArray(raw)
          ? raw
          : (raw?.results ?? raw?.data?.results ?? raw?.data ?? []);
        setOrgUsers(data);
      })
      .catch((err) => {
        if (signal.aborted) return;
        console.warn("Failed to load org users for Add Member dropdown:", err);
      });

    // ③ Available roles for the Add Member role dropdown
    // GET /api/v1/auth/roles/  →  returns [{ uuid, name, allow_multiple_projects }]
    // Uses uuid (string) as the role identifier sent to addProjectMember
    authService
      .getRoles()
      .then((res) => {
        if (signal.aborted) return;
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
        const roles: RoleOption[] = (list as Record<string, unknown>[])
          .filter((r) => r.uuid != null || r.id != null)
          .map((r) => ({
            id: (r.uuid ?? r.id) as string | number,
            name: r.name as string,
          }));
        setAvailableRoles(roles);
      })
      .catch((err) => {
        if (signal.aborted) return;
        console.warn("Failed to load roles for Add Member dropdown:", err);
      });

    return () => controller.abort();
  }, [viewingProject, org_slug]);

  const handleAddMember = async () => {
    if (!viewingProject || addMemberUser === null || addMemberRole === null) return;
    setAddingMember(true);
    try {
      const res = await adminService.addProjectMember(org_slug, viewingProject.uuid, {
        user: addMemberUser,   // UUID string — backend accepts UUID or numeric PK
        role: addMemberRole,
        is_active: true,
      });
      const newMember: ProjectMember = res.data;
      setProjectMembers((prev) => [...prev, newMember]);
      setProjects((prev) =>
        prev.map((p) =>
          p.uuid === viewingProject.uuid
            ? { ...p, members_count: (p.members_count ?? 0) + 1 }
            : p,
        ),
      );
      setShowAddMemberForm(false);
      setAddMemberUser(null);
      setAddMemberRole(null);
      toast.success("Member added successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingMember(false);
    }
  };

  const handleToggleMemberActive = async (member: ProjectMember) => {
    // Use numeric id if available, otherwise fall back to uuid
    const memberId = member.id ?? member.uuid;
    const key = `toggle-${memberId}`;
    setMemberActionLoading(key);
    try {
      await adminService.updateProjectMember(
        org_slug,
        viewingProject!.uuid,
        memberId as number,
        { is_active: !member.is_active },
      );
      setProjectMembers((prev) =>
        prev.map((m) =>
          (m.id ?? m.uuid) === memberId ? { ...m, is_active: !m.is_active } : m,
        ),
      );
      toast.success(member.is_active ? "Member deactivated" : "Member activated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setMemberActionLoading(null);
    }
  };

  const handleRemoveMember = async (member: ProjectMember) => {
    if (!confirm(`Remove ${member.user_email} from this project?`)) return;
    const memberId = member.id ?? member.uuid;
    const key = `remove-${memberId}`;
    setMemberActionLoading(key);
    try {
      await adminService.removeProjectMember(
        org_slug,
        viewingProject!.uuid,
        memberId as number,
      );
      setProjectMembers((prev) =>
        prev.filter((m) => (m.id ?? m.uuid) !== memberId),
      );
      setProjects((prev) =>
        prev.map((p) =>
          p.uuid === viewingProject!.uuid
            ? { ...p, members_count: Math.max(0, (p.members_count ?? 1) - 1) }
            : p,
        ),
      );
      toast.success(`${member.user_email} removed from project`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setMemberActionLoading(null);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Reset member-related state when opening/closing a project detail modal
  const openProject = (project: Project | null) => {
    setViewingProject(project);
    if (project) {
      setProjectMembers([]);
      setMembersLoading(true);
    } else {
      setProjectMembers([]);
      setMembersLoading(false);
    }
    setShowAddMemberForm(false);
    setAddMemberUser(null);
    setAddMemberRole(null);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#021422] mb-2">
            Projects
          </h1>
          <p className="text-gray-500">
            Manage all projects in your organization
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-[#021422] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0F181F] transition"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          <Building2 size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const cfg = statusConfig[project.status];
            return (
              <motion.div
                key={project.uuid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                <button
                  onClick={() => openProject(project)}
                  className="block w-full text-left p-4 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-1.5 bg-[#021422]/10 rounded-lg">
                      <Building2 size={16} className="text-[#021422]" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-600">
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg?.color ?? "bg-gray-300"}`} />
                      {cfg?.label || project.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                    {project.name}
                  </h3>

                  {project.location && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-2">
                      <MapPin size={11} />
                      <span className="truncate">{project.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    {project.members_count != null && (
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        {project.members_count}
                      </span>
                    )}
                    {project.created_at && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {project.manager_name && (
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      {project.manager_name}
                    </p>
                  )}
                </button>

                <div className="border-t border-gray-50 px-4 py-2 bg-gray-50/50 flex justify-end gap-3">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditOpen(project); }}
                    className="text-[11px] text-gray-400 hover:text-gray-600"
                  >
                    Edit
                  </button>
                  <span className="text-gray-200">|</span>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(project); }}
                    disabled={deleting === project.uuid}
                    className="text-[11px] text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    {deleting === project.uuid ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowCreateModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-[#021422] px-6 py-4">
                <h2 className="text-lg font-semibold text-white">
                  Create New Project
                </h2>
              </div>

              <form onSubmit={handleCreateProject} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter project name"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                    required
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Brief project description..."
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm resize-none"
                  />
                </div> */}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newProject.start_date}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          start_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Finish Date
                    </label>
                    <input
                      type="date"
                      value={newProject.end_date}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          end_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={newProject.status}
                      onChange={(e) =>
                        setNewProject({ ...newProject, status: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm bg-white"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="PAUSED">Paused</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Health
                    </label>
                    <select
                      value={newProject.health_status}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          health_status: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm bg-white"
                    >
                      <option value="GOOD">Good</option>
                      <option value="AT_RISK">At Risk</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phase
                  </label>
                  <select
                    value={newProject.phase}
                    onChange={(e) =>
                      setNewProject({ ...newProject, phase: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm bg-white"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="DESIGN">Design</option>
                    <option value="PROCUREMENT">Procurement</option>
                    <option value="CONSTRUCTION">Construction</option>
                    <option value="TESTING">Testing</option>
                    <option value="COMMISSIONING">Commissioning</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newProject.name.trim()}
                    className="flex-1 bg-[#021422] text-white py-3 rounded-xl font-semibold hover:bg-[#0F181F] transition disabled:opacity-50 text-sm"
                  >
                    {creating ? "Creating..." : "Create Project"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setEditingProject(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-[#021422] px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Edit Project</h2>
                <button onClick={() => setEditingProject(null)} className="p-1.5 hover:bg-white/10 rounded-lg">
                  <X size={18} className="text-white" />
                </button>
              </div>

              <form onSubmit={handleEditSave} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={editForm.start_date ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Finish Date</label>
                    <input
                      type="date"
                      value={editForm.end_date ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editForm.status ?? "ACTIVE"}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm bg-white"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="PAUSED">Paused</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Health</label>
                    <select
                      value={editForm.health_status ?? "GOOD"}
                      onChange={(e) => setEditForm({ ...editForm, health_status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm bg-white"
                    >
                      <option value="GOOD">Good</option>
                      <option value="AT_RISK">At Risk</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phase</label>
                  <select
                    value={editForm.phase ?? "PLANNING"}
                    onChange={(e) => setEditForm({ ...editForm, phase: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm bg-white"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="DESIGN">Design</option>
                    <option value="PROCUREMENT">Procurement</option>
                    <option value="CONSTRUCTION">Construction</option>
                    <option value="TESTING">Testing</option>
                    <option value="COMMISSIONING">Commissioning</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !editForm.name?.trim()}
                    className="flex-1 bg-[#021422] text-white py-3 rounded-xl font-semibold hover:bg-[#0F181F] transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {viewingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => openProject(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-[#021422] px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Building2 size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white leading-tight">
                      {viewingProject.name}
                    </h2>
                    <p className="text-xs text-white/60">{viewingProject.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => openProject(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto flex-1 p-6 space-y-5">
                {/* Status row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[viewingProject.status]?.color ?? "bg-gray-300"}`} />
                    {statusConfig[viewingProject.status]?.label || viewingProject.status}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                      <Calendar size={12} /> Start Date
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {viewingProject.start_date
                        ? new Date(viewingProject.start_date).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                      <Clock size={12} /> Finish Date
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {viewingProject.end_date
                        ? new Date(viewingProject.end_date).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                      <Users size={12} /> Members
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {viewingProject.members_count ?? projectMembers.length}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                      <Activity size={12} /> Created
                    </p>
                    <p className="text-sm font-medium text-gray-800">
                      {viewingProject.created_at
                        ? new Date(viewingProject.created_at).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>

                {viewingProject.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{viewingProject.location}</span>
                  </div>
                )}

                {viewingProject.manager_name && (
                  <p className="text-sm text-gray-600">
                    <span className="text-gray-400 mr-1">Manager:</span>
                    {viewingProject.manager_name}
                  </p>
                )}

                {/* ── Team Members Section ─────────────────────────────── */}
                <div className="border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Users size={15} className="text-[#021422]" />
                      Team Members
                      {projectMembers.length > 0 && (
                        <span className="text-xs bg-[#021422]/10 text-[#021422] px-2 py-0.5 rounded-full font-medium">
                          {projectMembers.length}
                        </span>
                      )}
                    </h3>
                    {!showAddMemberForm && (
                      <button
                        onClick={() => setShowAddMemberForm(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#021422] hover:bg-[#021422]/10 px-3 py-1.5 rounded-lg transition"
                      >
                        <UserPlus size={13} />
                        Add Member
                      </button>
                    )}
                  </div>

                  {/* Add Member Form */}
                  {showAddMemberForm && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-3 space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Add Existing Org User
                      </p>
                      <div className="relative">
                        <select
                          value={addMemberUser ?? ""}
                          onChange={(e) => setAddMemberUser(e.target.value || null)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#021422]"
                        >
                          <option value="">
                            {orgUsers.length === 0 ? "No users available" : "Select user…"}
                          </option>
                          {orgUsers
                            .filter((u) => !projectMembers.some((m) => m.user_email === u.email))
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.email}{(u.first_name || u.name) ? ` — ${u.first_name ?? u.name}${u.last_name ? ` ${u.last_name}` : ""}` : ""}
                              </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select
                          value={addMemberRole ?? ""}
                          onChange={(e) => setAddMemberRole(e.target.value || null)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#021422]"
                        >
                          <option value="">Select role…</option>
                          {availableRoles.map((r) => (
                            <option key={String(r.id)} value={String(r.id)}>{r.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setShowAddMemberForm(false); setAddMemberUser(null); setAddMemberRole(null); }}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddMember}
                          disabled={addMemberUser === null || addMemberRole === null || addingMember}
                          className="flex-1 px-3 py-2 bg-[#021422] text-white rounded-lg text-sm font-medium hover:bg-[#0F181F] transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {addingMember ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                          {addingMember ? "Adding…" : "Add"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Members list */}
                  {membersLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 size={20} className="animate-spin text-gray-400" />
                    </div>
                  ) : projectMembers.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No members assigned yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {projectMembers.map((member) => (
                        <li
                          key={member.uuid ?? member.id}
                          className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#021422]/10 flex items-center justify-center shrink-0 text-xs font-bold text-[#021422]">
                              {(member.user_email?.[0] ?? "?").toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {member.user_email}
                              </p>
                              <p className="text-xs text-gray-500">{member.role_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${member.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {member.is_active ? "Active" : "Inactive"}
                            </span>
                            <button
                              onClick={() => handleToggleMemberActive(member)}
                              disabled={memberActionLoading === `toggle-${member.id ?? member.uuid}`}
                              className="p-1.5 hover:bg-gray-200 rounded-lg transition text-gray-500 hover:text-[#021422] disabled:opacity-50"
                              title={member.is_active ? "Deactivate" : "Activate"}
                            >
                              {memberActionLoading === `toggle-${member.id ?? member.uuid}`
                                ? <Loader2 size={13} className="animate-spin" />
                                : <Users size={13} />}
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member)}
                              disabled={memberActionLoading === `remove-${member.id ?? member.uuid}`}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-600 disabled:opacity-50"
                              title="Remove from project"
                            >
                              {memberActionLoading === `remove-${member.id ?? member.uuid}`
                                ? <Loader2 size={13} className="animate-spin" />
                                : <UserX size={13} />}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Footer actions */}
              <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3 shrink-0">
                <Link
                  href={`/${org_slug}/projects/${viewingProject.slug}/project-manager`}
                  onClick={() => openProject(null)}
                  className="inline-flex items-center gap-2 text-sm text-[#021422] hover:underline font-medium"
                >
                  <ExternalLink size={14} />
                  Open Workspace
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={() => { openProject(null); handleEditOpen(viewingProject); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#021422] text-white rounded-xl text-sm font-medium hover:bg-[#0F181F] transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
