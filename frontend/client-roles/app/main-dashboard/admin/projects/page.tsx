"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/mock/AdminContext";
import Link from "next/link";
import {
  Plus,
  Search,
  Building2,
  Edit,
  Eye,
  Users,
  Calendar,
  MapPin,
  DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig = {
  active: { label: "Active", color: "bg-green-100 text-green-700" },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-700" },
  on_hold: { label: "On Hold", color: "bg-orange-100 text-orange-700" },
};

export default function AdminProjectsPage() {
  const { projects, addProject } = useAdmin();
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    setCreating(true);
    addProject({
      name: newProject.name,
      description: newProject.description || undefined,
      status: "active",
    });
    setShowCreateModal(false);
    setNewProject({ name: "", description: "" });
    setCreating(false);
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
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

      {/* Search */}
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

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          <Building2 size={48} className="mx-auto mb-4 opacity-50" />
          <p>No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              <Link
                href={`/main-dashboard/admin/projects/${project.id}`}
                className="block p-6 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-[#021422]/10 rounded-lg">
                    <Building2 size={20} className="text-[#021422]" />
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      statusConfig[project.status]?.color || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {statusConfig[project.status]?.label || project.status}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {project.name}
                </h3>
                <p className="text-xs text-[#021422] font-medium mb-2">
                  {project.project_code}
                </p>

                {project.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {project.location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <MapPin size={14} />
                    <span>{project.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Users size={16} />
                    <span>{project.members_count} members</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} />
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {project.budget && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Budget</span>
                      <span>₦{project.spent?.toLocaleString() || 0} / ₦{project.budget.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#021422] rounded-full"
                        style={{
                          width: `${((project.spent || 0) / project.budget) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {project.manager_name && (
                  <p className="text-xs text-gray-400">
                    Manager: {project.manager_name}
                  </p>
                )}
              </Link>

              <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#021422]"
                >
                  <Edit size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Brief project description..."
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm resize-none"
                  />
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
    </div>
  );
}
