"use client";

import { use, useState, useEffect } from "react";
import { X, Mail, ChevronDown, Loader2, Send } from "lucide-react";
import { authService, invitationService, adminService } from "@/lib/services";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: Promise<{ org_slug: string }>;
}

interface Project {
  uuid: string;
  name: string;
  slug: string;
  status?: string;
}

interface Role {
  id: string;
  name: string;
}

export default function InviteModal({
  isOpen,
  onClose,
  params,
}: InviteModalProps) {
  const { org_slug } = use(params);
  const [projects, setProjects] = useState<Project[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    role_uuid: "",
    project_uuid: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const response = await adminService.getProjects(org_slug);
        const raw = Array.isArray(response.data)
          ? response.data
          : (response.data?.results ?? response.data?.data?.results ?? response.data?.data ?? []);
        setProjects(raw.map((p: { id?: string }) => ({ ...p, uuid: (p as { uuid?: string }).uuid ?? p.id! })));
      } catch (err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        toast.error(
          axiosErr.response?.data?.message || "Failed to load projects",
        );
      } finally {
        setLoadingProjects(false);
      }
    };

    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await authService.getRoles();
        const data = Array.isArray(response.data)
          ? response.data
          : (response.data?.data ?? []);
        setRoles(data);
      } catch (err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        toast.error(axiosErr.response?.data?.message || "Failed to load roles");
      } finally {
        setLoadingRoles(false);
      }
    };

    if (isOpen) {
      fetchProjects();
      fetchRoles();
    }
  }, [isOpen, org_slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.role_uuid || !formData.project_uuid) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      await invitationService.sendInvite({
        email: formData.email,
        project_uuid: formData.project_uuid,
        role_id: formData.role_uuid,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setFormData({ email: "", role_uuid: "", project_uuid: "" });
        setSuccess(false);
      }, 1500);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: "", role_uuid: "", project_uuid: "" });
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-[#021422] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Mail size={20} className="text-white" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Invite User
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="p-6">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Invitation Sent!
                  </h3>
                  <p className="text-gray-500 text-sm">
                    An email has been sent to {formData.email}
                  </p>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      Temporary password generated:
                    </p>
                    <p className="text-sm font-mono font-medium text-gray-900">
                      Will be sent via email
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.role_uuid}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role_uuid: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm appearance-none bg-white"
                        required
                        disabled={loadingRoles}
                      >
                        <option value="">
                          {loadingRoles ? "Loading roles..." : "Select a role"}
                        </option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.project_uuid}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            project_uuid: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm appearance-none bg-white"
                        required
                        disabled={loadingProjects}
                      >
                        <option value="">
                          {loadingProjects
                            ? "Loading projects..."
                            : "Select a project"}
                        </option>
                        {projects.map((project) => (
                          <option key={project.uuid} value={project.uuid}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || loadingProjects || loadingRoles}
                    className="w-full bg-[#021422] text-white py-3 rounded-xl font-semibold hover:bg-[#0F181F] transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending Invitation...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Invitation
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
