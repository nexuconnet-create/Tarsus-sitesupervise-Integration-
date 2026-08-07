"use client";

import React, { useState } from "react";
import { X, Award, Truck, User, Plus } from "lucide-react";
import { motion } from "framer-motion";
import type { PersonnelRole, CertificationType } from "@/lib/mockData/skills";
import { personnelCertOptions, equipmentCertOptions } from "@/lib/mockData/skills";
import { mockEquipment } from "@/lib/mockData/inventory";

interface RequestCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CertificationFormData) => void;
  editData?: CertificationFormData | null;
}

export interface CertificationFormData {
  type: CertificationType;
  role?: PersonnelRole;
  holderName?: string;
  holderId?: string;
  equipmentId?: string;
  equipmentName?: string;
  equipmentCategory?: string;
  certificationName: string;
  issuingBody: string;
  issueDate: string;
  expiryDate: string;
  certificateNumber?: string;
  notes?: string;
}

const personnelRoleOptions: { value: PersonnelRole; label: string }[] = [
  { value: "foreman", label: "Foreman" },
  { value: "safety_officer", label: "Safety Officer" },
  { value: "operator", label: "Equipment Operator" },
  { value: "electrician", label: "Electrician" },
  { value: "welder", label: "Welder" },
  { value: "worker", label: "Worker" },
];

const equipmentCategoryOptions = [
  "Crane",
  "Heavy Machinery",
  "Construction Equipment",
  "Power Tools",
  "Measuring Equipment",
];

function getInitialFormData(editData?: CertificationFormData | null) {
  if (editData) {
    return {
      type: editData.type,
      role: editData.role,
      holderName: editData.holderName,
      holderId: editData.holderId,
      equipmentId: editData.equipmentId,
      equipmentName: editData.equipmentName,
      equipmentCategory: editData.equipmentCategory,
      certificationName: editData.certificationName,
      issuingBody: editData.issuingBody,
      issueDate: editData.issueDate,
      expiryDate: editData.expiryDate,
      certificateNumber: editData.certificateNumber,
      notes: editData.notes,
    };
  }
  return {
    type: "personnel" as CertificationType,
    role: "foreman" as PersonnelRole,
    certificationName: "",
    issuingBody: "",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
  };
}

export default function RequestCertificationModal({
  isOpen,
  onClose,
  onSubmit,
  editData,
}: RequestCertificationModalProps) {
  const initialData = getInitialFormData(editData);
  const [certType, setCertType] = useState<CertificationType>(initialData.type);
  const [formData, setFormData] = useState<Partial<CertificationFormData>>(initialData);

  if (!isOpen) return null;

  const handleRoleChange = (role: PersonnelRole) => {
    setFormData({ ...formData, role, certificationName: "", issuingBody: "" });
  };

  const handleCertSelect = (certName: string) => {
    const role = formData.role as PersonnelRole;
    const certOption = personnelCertOptions[role]?.find((c) => c.name === certName);
    if (certOption) {
      setFormData({
        ...formData,
        certificationName: certName,
        issuingBody: certOption.issuingBody,
      });
    }
  };

  const handleEquipmentSelect = (equipmentId: string) => {
    const equipment = mockEquipment.find((eq) => eq.id === equipmentId);
    if (equipment) {
      setFormData({
        ...formData,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        equipmentCategory: equipment.category,
      });
    }
  };

  const handleEquipmentCertSelect = (certName: string) => {
    const certOption = equipmentCertOptions.find((c) => c.name === certName);
    if (certOption) {
      setFormData({
        ...formData,
        certificationName: certName,
        issuingBody: certOption.issuingBody,
        equipmentCategory: certOption.category,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData: CertificationFormData = {
      type: certType,
      ...formData,
    } as CertificationFormData;
    onSubmit?.(finalData);
    onClose();
  };

  const role = formData.role as PersonnelRole;
  const availableCertNames = certType === "personnel" && role
    ? personnelCertOptions[role]?.map((c) => c.name) || []
    : equipmentCertOptions.map((c) => c.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award size={24} className="text-[#021422]" />
              <h2 className="text-xl font-bold text-[#021422]">
                {editData ? "Edit Certification" : "Request Certification"}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Certification Type Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#021422]">Certification Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setCertType("personnel");
                  setFormData({ ...formData, type: "personnel", equipmentId: undefined, equipmentName: undefined });
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold border-2 transition-colors ${
                  certType === "personnel"
                    ? "bg-[#021422] border-[#021422] text-white"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <User size={18} />
                Personnel
              </button>
              <button
                type="button"
                onClick={() => {
                  setCertType("equipment");
                  setFormData({ ...formData, type: "equipment", role: undefined, holderName: undefined });
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold border-2 transition-colors ${
                  certType === "equipment"
                    ? "bg-[#021422] border-[#021422] text-white"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Truck size={18} />
                Equipment
              </button>
            </div>
          </div>

          {/* Personnel Fields */}
          {certType === "personnel" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Personnel Type</label>
                  <select
                    value={formData.role || ""}
                    onChange={(e) => handleRoleChange(e.target.value as PersonnelRole)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none bg-white"
                  >
                    {personnelRoleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Personnel Name</label>
                  <input
                    type="text"
                    value={formData.holderName || ""}
                    onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                    placeholder="Enter name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Equipment Fields */}
          {certType === "equipment" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Select Equipment</label>
                  <select
                    value={formData.equipmentId || ""}
                    onChange={(e) => handleEquipmentSelect(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none bg-white"
                    required
                  >
                    <option value="">Select from inventory...</option>
                    {mockEquipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} ({eq.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Or Enter Manually</label>
                  <input
                    type="text"
                    value={formData.equipmentName || ""}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value, equipmentId: "manual" })}
                    placeholder="Equipment name/ID"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                  />
                </div>
              </div>

              {formData.equipmentName && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Equipment Category</label>
                  <select
                    value={formData.equipmentCategory || ""}
                    onChange={(e) => setFormData({ ...formData, equipmentCategory: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none bg-white"
                  >
                    {equipmentCategoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Certification Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Certification Name</label>
              <select
                value={formData.certificationName || ""}
                onChange={(e) =>
                  certType === "personnel"
                    ? handleCertSelect(e.target.value)
                    : handleEquipmentCertSelect(e.target.value)
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none bg-white"
                required
              >
                <option value="">Select certification...</option>
                {availableCertNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Issuing Body</label>
              <input
                type="text"
                value={formData.issuingBody || ""}
                onChange={(e) => setFormData({ ...formData, issuingBody: e.target.value })}
                placeholder="e.g., OSHA, NCCCO"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Issue Date</label>
              <input
                type="date"
                value={formData.issueDate || ""}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate || ""}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                placeholder="Leave empty if no expiry"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
              />
            </div>
          </div>

          {/* Certificate Number */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#021422]">Certificate Number (Optional)</label>
            <input
              type="text"
              value={formData.certificateNumber || ""}
              onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
              placeholder="e.g., OSH30-2024-001234"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#021422]">Notes (Optional)</label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or comments"
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 space-y-3">
            <button
              type="submit"
              className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {editData ? "Update Certification" : "Add Certification"}
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
      </motion.div>
    </div>
  );
}
