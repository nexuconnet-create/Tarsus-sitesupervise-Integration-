"use client";

import { useState } from "react";
import { X, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import type { RiskCategory, RiskLevel } from "@/lib/mockData/hse";

interface RiskAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: RiskFormData) => void;
}

export interface RiskFormData {
  hazard: string;
  category: RiskCategory;
  controls: string[];
  riskLevel: RiskLevel;
}

const riskCategories: RiskCategory[] = [
  "Utilities",
  "Underground Cables",
  "Line of Fire",
  "Working at Height",
  "Electrical",
  "Fall from Height",
];

const defaultControls: Record<RiskCategory, string[]> = {
  Utilities: ["Isolate before work", "Verify isolation", "Barricade area", "PPE required"],
  "Underground Cables": ["Cable locate service", "Hand dig only", "Physical barrier", "Safe distance 1m"],
  "Line of Fire": ["Eliminate hazard", "Establish safe zone", "Warning signage", "Escape route clear"],
  "Working at Height": ["Full harness required", "Anchor points checked", "Guardrails in place", "Rescue plan ready"],
  Electrical: ["Lockout/tagout", "Voltage tester verification", "Insulated tools only", "Qualified person only"],
  "Fall from Height": ["Scaffold inspection", "Safety nets installed", "Edge protection", "Rescue equipment"],
};

export default function RiskAssessmentModal({ isOpen, onClose, onSubmit }: RiskAssessmentModalProps) {
  const [formData, setFormData] = useState<RiskFormData>({
    hazard: "",
    category: "Utilities",
    controls: [...defaultControls.Utilities],
    riskLevel: "Medium",
  });

  if (!isOpen) return null;

  const handleCategoryChange = (category: RiskCategory) => {
    setFormData({
      ...formData,
      category,
      controls: [...defaultControls[category]],
    });
  };

  const handleControlToggle = (control: string) => {
    setFormData((prev) => ({
      ...prev,
      controls: prev.controls.includes(control)
        ? prev.controls.filter((c) => c !== control)
        : [...prev.controls, control],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
    setFormData({
      hazard: "",
      category: "Utilities",
      controls: [...defaultControls.Utilities],
      riskLevel: "Medium",
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
              <ShieldAlert size={24} className="text-[#021422]" />
              <h2 className="text-2xl font-bold text-[#021422]">Risk Assessment</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Hazard Description</label>
              <textarea
                value={formData.hazard}
                onChange={(e) => setFormData({ ...formData, hazard: e.target.value })}
                placeholder="Describe the hazard being assessed"
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
                {riskCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Risk Level</label>
              <div className="grid grid-cols-3 gap-3">
                {(["Low", "Medium", "High"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, riskLevel: level })}
                    className={`py-3 px-4 rounded-lg font-semibold border-2 transition-colors ${
                      formData.riskLevel === level
                        ? level === "High"
                          ? "bg-red-100 border-red-500 text-red-800"
                          : level === "Medium"
                          ? "bg-orange-100 border-orange-500 text-orange-800"
                          : "bg-green-100 border-green-500 text-green-800"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Control Measures</label>
              <div className="grid grid-cols-2 gap-2">
                {defaultControls[formData.category].map((control) => (
                  <label
                    key={control}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.controls.includes(control)
                        ? "bg-green-50 border-green-300 text-green-800"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.controls.includes(control)}
                      onChange={() => handleControlToggle(control)}
                      className="w-4 h-4 text-[#021422] rounded border-gray-300 focus:ring-[#021422]"
                    />
                    <span className="text-sm">{control}</span>
                  </label>
                ))}
              </div>
            </div>

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
    </div>
  );
}
