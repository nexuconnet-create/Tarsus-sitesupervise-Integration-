"use client";

import { useState } from "react";
import { X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ApiRiskAssessment, RiskCategory, RiskLevel, CreateRiskAssessmentBody } from "@/lib/services/hseService";
import { RISK_CATEGORY_LABELS, RISK_LEVEL_LABELS, DEFAULT_CONTROLS } from "@/lib/services/hseService";

interface RiskAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateRiskAssessmentBody) => void;
  record?: ApiRiskAssessment | null;
}

export type { CreateRiskAssessmentBody as RiskFormData };

const RISK_CATEGORIES: RiskCategory[] = [
  "UTILITIES",
  "UNDERGROUND_CABLES",
  "LINE_OF_FIRE",
  "WORKING_AT_HEIGHT",
  "ELECTRICAL",
  "FALL_FROM_HEIGHT",
  "OTHER",
];

const RISK_LEVELS: RiskLevel[] = ["LOW", "MEDIUM", "HIGH"];

const levelStyle = (l: RiskLevel, selected: boolean) => {
  if (!selected) return "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100";
  switch (l) {
    case "HIGH": return "bg-red-100 border-red-500 text-red-800";
    case "MEDIUM": return "bg-orange-100 border-orange-500 text-orange-800";
    case "LOW": return "bg-green-100 border-green-500 text-green-800";
  }
};

const levelBadge = (l: RiskLevel) => {
  switch (l) {
    case "HIGH": return "bg-red-100 text-red-700 border-red-200";
    case "MEDIUM": return "bg-orange-100 text-orange-700 border-orange-200";
    case "LOW": return "bg-green-100 text-green-700 border-green-200";
  }
};

export default function RiskAssessmentModal({ isOpen, onClose, onSubmit, record }: RiskAssessmentModalProps) {
  const [formData, setFormData] = useState<CreateRiskAssessmentBody>({
    description: "",
    category: "UTILITIES",
    hazards: "",
    controls: DEFAULT_CONTROLS.UTILITIES.join("\n"),
    risk_level: "MEDIUM",
  });
  const [selectedControls, setSelectedControls] = useState<string[]>([...DEFAULT_CONTROLS.UTILITIES]);

  if (!isOpen) return null;

  const handleCategoryChange = (category: RiskCategory) => {
    const defaults = DEFAULT_CONTROLS[category] ?? [];
    setSelectedControls([...defaults]);
    setFormData({ ...formData, category, controls: defaults.join("\n") });
  };

  const handleControlToggle = (control: string) => {
    const next = selectedControls.includes(control)
      ? selectedControls.filter((c) => c !== control)
      : [...selectedControls, control];
    setSelectedControls(next);
    setFormData((prev) => ({ ...prev, controls: next.join("\n") }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
    const defaults = DEFAULT_CONTROLS.UTILITIES;
    setSelectedControls([...defaults]);
    setFormData({
      description: "",
      category: "UTILITIES",
      hazards: "",
      controls: defaults.join("\n"),
      risk_level: "MEDIUM",
    });
  };

  // ─── Detail View ──────────────────────────────────────────────────────────
  if (record) {
    const controlsList = record.controls ? record.controls.split("\n").filter(Boolean) : [];
    const hazardsList = record.hazards ? record.hazards.split("\n").filter(Boolean) : [];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <AnimatePresence>
          <motion.div
            key="risk-detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ShieldAlert size={24} className="text-[#021422]" />
                  <h2 className="text-2xl font-bold text-[#021422]">Risk Assessment Detail</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${levelBadge(record.risk_level)}`}>
                    {RISK_LEVEL_LABELS[record.risk_level]} Risk
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                    {RISK_CATEGORY_LABELS[record.category]}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-[#021422] bg-gray-50 rounded-lg p-4">{record.description}</p>
                </div>

                {hazardsList.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hazards</p>
                    <ul className="space-y-1">
                      {hazardsList.map((h, i) => (
                        <li key={i} className="text-sm text-[#021422] bg-gray-50 rounded-lg p-3">{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {controlsList.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Control Measures</p>
                    <div className="grid grid-cols-2 gap-2">
                      {controlsList.map((control, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 rounded-lg border text-sm bg-green-50 border-green-300 text-green-800">
                          <span>✓</span>
                          <span>{control}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Assessor</p>
                    <p className="text-sm font-medium text-[#021422]">{record.assessor || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date Assessed</p>
                    <p className="text-sm font-medium text-[#021422]">
                      {record.date_assessed ? new Date(record.date_assessed).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ─── Create View ──────────────────────────────────────────────────────────
  const categoryDefaults = DEFAULT_CONTROLS[formData.category] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <AnimatePresence>
        <motion.div
          key="risk-create"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ShieldAlert size={24} className="text-[#021422]" />
                <h2 className="text-2xl font-bold text-[#021422]">Risk Assessment</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the activity being assessed"
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Hazard Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value as RiskCategory)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none bg-white"
                >
                  {RISK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{RISK_CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Hazards (optional)</label>
                <textarea
                  value={formData.hazards}
                  onChange={(e) => setFormData({ ...formData, hazards: e.target.value })}
                  placeholder="List hazards, one per line"
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Risk Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {RISK_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, risk_level: level })}
                      className={`py-3 px-4 rounded-lg font-semibold border-2 transition-colors text-sm ${levelStyle(level, formData.risk_level === level)}`}
                    >
                      {RISK_LEVEL_LABELS[level]}
                    </button>
                  ))}
                </div>
              </div>

              {categoryDefaults.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Control Measures</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryDefaults.map((control) => (
                      <label
                        key={control}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedControls.includes(control)
                            ? "bg-green-50 border-green-300 text-green-800"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedControls.includes(control)}
                          onChange={() => handleControlToggle(control)}
                          className="w-4 h-4 text-[#021422] rounded border-gray-300 focus:ring-[#021422]"
                        />
                        <span className="text-sm">{control}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors"
                >
                  Submit Assessment
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
      </AnimatePresence>
    </div>
  );
}
