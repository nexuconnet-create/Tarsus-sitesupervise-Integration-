"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/lib/mock/AdminContext";
import {
  Building2,
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Edit,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";

const milestoneStatusConfig = {
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
    icon: Clock,
  },
  pending: {
    label: "Pending",
    color: "bg-gray-100 text-gray-700",
    icon: Clock,
  },
  delayed: {
    label: "Delayed",
    color: "bg-red-100 text-red-700",
    icon: AlertCircle,
  },
};

const roleLabels: Record<string, string> = {
  PROJECT_MANAGER: "Project Manager",
  PROJECT_ENGINEER: "Project Engineer",
  MECHANICAL_ENGINEER: "Mechanical Engineer",
  ELECTRICAL_ENGINEER: "Electrical Engineer",
  QUANTITY_SURVEYOR: "Quantity Surveyor",
  SITE_SUPERVISOR: "Site Engineer / Site Supervisor",
  SAFETY: "Safety Officer",
  CLIENT: "Client",
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);
  const {
    projects,
    getProjectMilestones,
    getProjectTeam,
    getProjectDocuments,
  } = useAdmin();

  const project = projects.find((p) => p.id === projectId);
  const milestones = getProjectMilestones(projectId);
  const team = getProjectTeam(projectId);
  const documents = getProjectDocuments(projectId);

  if (!project) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The project you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/main-dashboard/admin/projects"
            className="inline-flex items-center gap-2 bg-[#021422] text-white px-6 py-3 rounded-xl font-semibold"
          >
            <ArrowLeft size={18} />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const budgetUsedPercentage = project.budget
    ? ((project.spent || 0) / project.budget) * 100
    : 0;

  const completedMilestones = milestones.filter(
    (m) => m.status === "completed",
  ).length;
  const milestoneProgress =
    milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#021422]/10 rounded-lg">
              <Building2 size={24} className="text-[#021422]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#021422]">
                {project.name}
              </h1>
              <p className="text-sm text-[#021422] font-medium">
                {project.project_code}
              </p>
              <p className="text-sm text-gray-500">
                {project.description || "No description available"}
              </p>
            </div>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#021422] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#0F181F] transition">
          <Edit size={18} />
          Edit Project
        </button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{team.length}</p>
              <p className="text-xs text-gray-500">Team Members</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {completedMilestones}/{milestones.length}
              </p>
              <p className="text-xs text-gray-500">Milestones Complete</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {documents.length}
              </p>
              <p className="text-xs text-gray-500">Documents</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {project.expected_end_date
                  ? new Date(project.expected_end_date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        year: "2-digit",
                      },
                    )
                  : "TBD"}
              </p>
              <p className="text-xs text-gray-500">Finish Date</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Summary */}
          {project.budget && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  ₦ Financial Summary
                </h2>
                <span className="text-sm text-gray-500">
                  {budgetUsedPercentage.toFixed(0)}% utilized
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-medium text-gray-900">
                      {project.spent?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${budgetUsedPercentage}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full rounded-full ${
                        budgetUsedPercentage > 90
                          ? "bg-red-500"
                          : budgetUsedPercentage > 70
                            ? "bg-orange-500"
                            : "bg-green-500"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Total Budget</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₦{project.budget.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Spent</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₦{project.spent?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Remaining</p>
                    <p className="text-lg font-bold text-green-600">
                      ₦
                      {(
                        project.budget - (project.spent || 0) || 0
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Milestones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target size={20} className="text-[#021422]" />
                Project Milestones
              </h2>
              <button className="text-sm text-[#021422] hover:underline">
                Add Milestone
              </button>
            </div>

            {milestones.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Target size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No milestones defined</p>
              </div>
            ) : (
              <div className="space-y-4">
                {milestones.map((milestone, index) => {
                  const StatusIcon =
                    milestoneStatusConfig[milestone.status]?.icon || Clock;
                  return (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-100 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-1.5 rounded-lg ${
                              milestoneStatusConfig[milestone.status]?.color ||
                              "bg-gray-100"
                            }`}
                          >
                            <StatusIcon size={16} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {milestone.name}
                            </h3>
                            {milestone.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {milestone.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            milestoneStatusConfig[milestone.status]?.color ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {milestoneStatusConfig[milestone.status]?.label ||
                            milestone.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                        <span>
                          Due:{" "}
                          {new Date(milestone.due_date).toLocaleDateString()}
                        </span>
                        <span>{milestone.progress}% complete</span>
                      </div>

                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-[#021422] rounded-full"
                          style={{ width: `${milestone.progress}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-[#021422]" />
                Documents & Files
              </h2>
              <button className="inline-flex items-center gap-2 text-sm text-white bg-[#021422] px-3 py-1.5 rounded-lg hover:bg-[#0F181F] transition">
                <Upload size={14} />
                Upload
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documents uploaded</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-gray-100 rounded-xl p-3 hover:bg-gray-50 cursor-pointer transition"
                  >
                    {doc.type === "image" ? (
                      <div className="aspect-video bg-gray-100 rounded-lg mb-2 overflow-hidden">
                        <img
                          src={doc.url}
                          alt={doc.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                        <FileText size={32} className="text-gray-400" />
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">{doc.size}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Project Details
            </h2>

            <div className="space-y-4">
              {project.location && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">{project.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="text-sm text-gray-900">
                    {project.start_date
                      ? new Date(project.start_date).toLocaleDateString()
                      : "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Finish Date</p>
                  <p className="text-sm text-gray-900">
                    {project.expected_end_date
                      ? new Date(project.expected_end_date).toLocaleDateString()
                      : "Not specified"}
                  </p>
                </div>
              </div>

              {project.manager_name && (
                <div className="flex items-start gap-3">
                  <Users size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Project Manager</p>
                    <p className="text-sm text-gray-900">
                      {project.manager_name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Team Members
              </h2>
              <button className="text-sm text-[#021422] hover:underline">
                Manage
              </button>
            </div>

            {team.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <Users size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No team members assigned</p>
              </div>
            ) : (
              <div className="space-y-3">
                {team.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.fullname}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#021422] text-white flex items-center justify-center text-xs font-medium">
                          {member.fullname.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.fullname}
                        </p>
                        <p className="text-xs text-gray-500">
                          {roleLabels[member.role] || member.role}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        member.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {member.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
