"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { Severity, NCRStatus } from "@/lib/mockData/hse";

interface NonConformityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: NCRFormData) => void;
}

export interface NCRFormData {
  description: string;
  severity: Severity;
  location: string;
  status: NCRStatus;
  deadline: string;
}

export default function NonConformityModal({ isOpen, onClose, onSubmit }: NonConformityModalProps) {
  const [formData, setFormData] = useState<NCRFormData>({
    description: "",
    severity: "Minor",
    location: "",
    status: "Open",
    deadline: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
    setFormData({
      description: "",
      severity: "Minor",
      location: "",
      status: "Open",
      deadline: "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="text-[#021422]" />
              <h2 className="text-2xl font-bold text-[#021422]">Log Non-Conformity</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the non-conformity in detail"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Severity</label>
              <div className="grid grid-cols-3 gap-3">
                {(["Minor", "Major", "Critical"] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setFormData({ ...formData, severity: sev })}
                    className={`py-3 px-4 rounded-lg font-semibold border-2 transition-colors ${
                      formData.severity === sev
                        ? sev === "Critical"
                          ? "bg-red-100 border-red-500 text-red-800"
                          : sev === "Major"
                          ? "bg-orange-100 border-orange-500 text-orange-800"
                          : "bg-yellow-100 border-yellow-500 text-yellow-800"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Block A, 3rd Floor Slab"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as NCRStatus })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors"
              >
                Log NCR
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 bg-white border border-gray-200 text-[#021422] rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
