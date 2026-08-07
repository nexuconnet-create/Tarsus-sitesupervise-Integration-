"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/mock/AdminContext";
import { Search, Filter, UserCheck, UserX, Mail, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ROLE_CONFIG, type RoleKey } from "@/lib/mock/adminData";

const roleLabels: Record<string, string> = Object.entries(ROLE_CONFIG).reduce(
  (acc, [key, config]) => ({
    ...acc,
    [key]: config.label,
  }),
  {} as Record<string, string>,
);

export default function AdminUsersPage() {
  const { users, projects, deactivateUser } = useAdmin();
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleDeactivate = (userId: string) => {
    deactivateUser(userId);
  };

  const filteredUsers = users.filter((user) => {
    if (selectedRole && user.role !== selectedRole) return false;
    if (
      selectedProject &&
      !user.projects.some((p) => p.id === parseInt(selectedProject))
    )
      return false;
    if (
      search &&
      !user.email.toLowerCase().includes(search.toLowerCase()) &&
      !user.fullname.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#021422] mb-2">
          User Management
        </h1>
        <p className="text-gray-500">
          View and manage all registered users across projects
        </p>
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
              placeholder="Search by name or email..."
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
                    Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                  >
                    <option value="">All Roles</option>
                    {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
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
                        {project.project_code} - {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <UserX size={48} className="mx-auto mb-4 opacity-50" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Projects</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.fullname}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#021422] text-white flex items-center justify-center text-sm font-medium">
                            {user.fullname.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.fullname}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.projects.slice(0, 2).map((project) => (
                          <span
                            key={project.id}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                            title={project.name}
                          >
                            {project.project_code}
                          </span>
                        ))}
                        {user.projects.length > 2 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded">
                            +{user.projects.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          user.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#021422]"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600"
                          title="Send email"
                        >
                          <Mail size={18} />
                        </button>
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          className={`p-1.5 hover:bg-gray-100 rounded-lg ${
                            user.is_active
                              ? "text-gray-500 hover:text-red-600"
                              : "text-gray-500 hover:text-green-600"
                          }`}
                          title={user.is_active ? "Deactivate" : "Activate"}
                        >
                          {user.is_active ? (
                            <UserX size={18} />
                          ) : (
                            <UserCheck size={18} />
                          )}
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
    </div>
  );
}
