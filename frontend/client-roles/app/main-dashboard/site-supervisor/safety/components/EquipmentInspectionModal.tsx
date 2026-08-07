"use client";

import { useState } from "react";
import { X, ClipboardCheck } from "lucide-react";
import { motion } from "framer-motion";

interface EquipmentInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: InspectionFormData) => void;
}

export interface InspectionFormData {
  equipment: string;
  status: "Pass" | "Fail" | "Conditional";
  inspector: string;
  notes: string;
}

const checklistItems = [
  "Safety guards in place",
  "Emergency stop functional",
  "Electrical connections secure",
  "Hydraulic systems checked",
  "Fire extinguisher present",
  "PPE requirements posted",
  "Operator trained and authorized",
  "Area clear of obstructions",
];

export default function EquipmentInspectionModal({ isOpen, onClose, onSubmit }: EquipmentInspectionModalProps) {
  const [formData, setFormData] = useState<InspectionFormData>({
    equipment: "",
    status: "Pass",
    inspector: "",
    notes: "",
  });
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleCheck = (item: string) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
    setFormData({ equipment: "", status: "Pass", inspector: "", notes: "" });
    setCheckedItems([]);
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
              <ClipboardCheck size={24} className="text-[#021422]" />
              <h2 className="text-2xl font-bold text-[#021422]">Equipment Inspection</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Equipment/Plant Name</label>
              <input
                type="text"
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                placeholder="e.g., Mobile Crane #001"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Pre-Use Checklist</label>
              <div className="grid grid-cols-2 gap-2">
                {checklistItems.map((item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checkedItems.includes(item)
                        ? "bg-green-50 border-green-300 text-green-800"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checkedItems.includes(item)}
                      onChange={() => handleCheck(item)}
                      className="w-4 h-4 text-[#021422] rounded border-gray-300 focus:ring-[#021422]"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Inspection Result</label>
              <div className="grid grid-cols-3 gap-3">
                {(["Pass", "Fail", "Conditional"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, status })}
                    className={`py-3 px-4 rounded-lg font-semibold border-2 transition-colors ${
                      formData.status === status
                        ? status === "Pass"
                          ? "bg-green-100 border-green-500 text-green-800"
                          : status === "Fail"
                          ? "bg-red-100 border-red-500 text-red-800"
                          : "bg-yellow-100 border-yellow-500 text-yellow-800"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Inspector Name</label>
              <input
                type="text"
                value={formData.inspector}
                onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                placeholder="Enter inspector name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional observations or comments"
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none resize-none"
              />
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors"
              >
                Submit Inspection
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
