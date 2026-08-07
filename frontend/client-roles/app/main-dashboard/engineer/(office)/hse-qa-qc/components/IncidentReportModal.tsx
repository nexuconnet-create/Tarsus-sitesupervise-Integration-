"use client";

import { useState } from "react";
import { X, Image as ImageIcon, Video, Scan, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import type { IncidentCategory, Severity } from "@/lib/mockData/hse";

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: IncidentFormData) => void;
}

export interface IncidentFormData {
  category: IncidentCategory;
  description: string;
  location: string;
  severity: Severity;
  date: string;
  reporter: string;
}

const incidentCategories: IncidentCategory[] = [
  "Occupational Illness",
  "Lost Time Injury",
  "Restricted Work Case",
  "Medical Treatment Case",
  "First Aid Case",
  "Unsafe Acts/Conditions",
  "Near Miss",
];

export default function IncidentReportModal({ isOpen, onClose, onSubmit }: IncidentReportModalProps) {
  const [formData, setFormData] = useState<IncidentFormData>({
    category: "Near Miss",
    description: "",
    location: "",
    severity: "Minor",
    date: new Date().toISOString().split("T")[0],
    reporter: "",
  });
  const [attachedEvidence, setAttachedEvidence] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
    setFormData({
      category: "Near Miss",
      description: "",
      location: "",
      severity: "Minor",
      date: new Date().toISOString().split("T")[0],
      reporter: "",
    });
    setAttachedEvidence([]);
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
              <AlertTriangle size={24} className="text-[#021422]" />
              <h2 className="text-2xl font-bold text-[#021422]">New Incident Report</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Incident Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as IncidentCategory })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none bg-white"
              >
                {incidentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
                placeholder="e.g., Block A, 5th Floor"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the incident in detail"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Reporter Name</label>
              <input
                type="text"
                value={formData.reporter}
                onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
                placeholder="Enter reporter name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
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
              <label className="text-sm font-bold text-[#021422]">Evidence</label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setAttachedEvidence([...attachedEvidence, "photo"])}
                  className="flex flex-col items-center justify-center py-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors gap-2"
                >
                  <ImageIcon size={20} className="text-[#021422]" />
                  <span className="text-xs font-medium text-[#021422]">Attach Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAttachedEvidence([...attachedEvidence, "video"])}
                  className="flex flex-col items-center justify-center py-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors gap-2"
                >
                  <Video size={20} className="text-[#021422]" />
                  <span className="text-xs font-medium text-[#021422]">Attach Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAttachedEvidence([...attachedEvidence, "ar"])}
                  className="flex flex-col items-center justify-center py-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors gap-2"
                >
                  <Scan size={20} className="text-[#021422]" />
                  <span className="text-xs font-medium text-[#021422]">Capture with AR</span>
                </button>
              </div>
            </div>

            {attachedEvidence.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Attached Evidence</label>
                <div className="bg-gray-100 rounded-xl p-4 space-y-2">
                  {attachedEvidence.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-white rounded-lg p-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item === "photo" && <ImageIcon size={20} className="text-gray-500" />}
                        {item === "video" && <Video size={20} className="text-gray-500" />}
                        {item === "ar" && <Scan size={20} className="text-gray-500" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#021422] text-sm">
                          {item === "photo" && "Photo Attachment"}
                          {item === "video" && "Video Attachment"}
                          {item === "ar" && "AR Screenshot"}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">Ready for upload</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors"
              >
                Submit Report
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
