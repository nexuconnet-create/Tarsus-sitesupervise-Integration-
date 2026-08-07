"use client";

import { useState } from "react";
import { X, FileText } from "lucide-react";
import { motion } from "framer-motion";
import type { PTWType } from "@/lib/mockData/hse";

interface PTWModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: PTWFormData) => void;
}

export interface PTWFormData {
  type: PTWType;
  location: string;
  description: string;
  validUntil: string;
  issuedBy: string;
}

const ptwTypes: PTWType[] = [
  "Hot Work",
  "Excavation",
  "Electrical",
  "Working at Height",
  "Confined Space",
];

export default function PTWModal({ isOpen, onClose, onSubmit }: PTWModalProps) {
  const [formData, setFormData] = useState<PTWFormData>({
    type: "Hot Work",
    location: "",
    description: "",
    validUntil: "",
    issuedBy: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
    setFormData({
      type: "Hot Work",
      location: "",
      description: "",
      validUntil: "",
      issuedBy: "",
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
              <FileText size={24} className="text-[#021422]" />
              <h2 className="text-2xl font-bold text-[#021422]">Permit to Work</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Permit Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as PTWType })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none bg-white"
              >
                {ptwTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter work location"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Work Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the work to be performed"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Valid Until</label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Issued By</label>
                <input
                  type="text"
                  value={formData.issuedBy}
                  onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                  placeholder="Supervisor name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors"
              >
                Issue Permit
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
