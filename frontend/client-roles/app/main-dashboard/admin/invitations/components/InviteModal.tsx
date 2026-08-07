"use client";

import { useState } from "react";
import { X, Mail, ChevronDown, Loader2, Send } from "lucide-react";
import { useAdmin } from "@/lib/mock/AdminContext";
import { ROLE_CONFIG, type RoleKey } from "@/lib/mock/adminData";
import { motion, AnimatePresence } from "framer-motion";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const roles = Object.entries(ROLE_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const { projects, addInvitation } = useAdmin();
  const [formData, setFormData] = useState({
    email: "",
    role: "" as RoleKey | "",
    project_id: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.role || !formData.project_id) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const selectedProject = projects.find(
      (p) => p.id === parseInt(formData.project_id),
    );

    addInvitation({
      email: formData.email,
      role: formData.role as RoleKey,
      project_id: parseInt(formData.project_id),
      project_name: selectedProject?.name || "",
      project_code: selectedProject?.project_code || "",
      invited_by: "Admin",
      message: formData.message || undefined,
    });

    setSuccess(true);
    setTimeout(() => {
      onClose();
      setFormData({ email: "", role: "", project_id: "", message: "" });
      setSuccess(false);
    }, 1500);

    setLoading(false);
  };

  const handleClose = () => {
    setFormData({ email: "", role: "", project_id: "", message: "" });
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
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

            {/* Body */}
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
                  {/* Email */}
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

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role: e.target.value as RoleKey,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm appearance-none bg-white"
                        required
                      >
                        <option value="">Select a role</option>
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Project */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.project_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            project_id: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm appearance-none bg-white"
                        required
                      >
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.project_code} - {project.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personal Message (Optional)
                    </label>
                    <textarea
                      placeholder="Add a personal note to the invitation..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm resize-none"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
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
