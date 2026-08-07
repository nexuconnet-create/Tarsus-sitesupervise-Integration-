"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, ClipboardCheck, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ApiInspection, InspectionStatus, CreateInspectionBody } from "@/lib/services/hseService";
import { inventoryService } from "@/lib/services/inventoryService";
import { engineerKeys } from "@/lib/queryKeys";

interface EquipmentInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateInspectionBody) => void;
  record?: ApiInspection | null;
  projectUuid: string;
}

export type { CreateInspectionBody as InspectionFormData };

const STATUSES: InspectionStatus[] = ["PASS", "FAIL", "CONDITIONAL"];

const statusStyle = (s: InspectionStatus, selected: boolean) => {
  if (!selected) return "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100";
  switch (s) {
    case "PASS": return "bg-green-100 border-green-500 text-green-800";
    case "FAIL": return "bg-red-100 border-red-500 text-red-800";
    case "CONDITIONAL": return "bg-orange-100 border-orange-500 text-orange-800";
  }
};

const statusBadge = (s: InspectionStatus) => {
  switch (s) {
    case "PASS": return "bg-green-100 text-green-700";
    case "FAIL": return "bg-red-100 text-red-700";
    case "CONDITIONAL": return "bg-orange-100 text-orange-700";
  }
};

export default function EquipmentInspectionModal({
  isOpen,
  onClose,
  onSubmit,
  record,
  projectUuid,
}: EquipmentInspectionModalProps) {
  const { data: equipmentItems = [] } = useQuery({
    queryKey: engineerKeys.inventory(projectUuid, { item_type: "equipment" }),
    queryFn: async () => {
      const res = await inventoryService.listInventory(projectUuid, { item_type: "equipment" });
      const results = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
      return results as Array<{ id?: string; name?: string }>;
    },
    enabled: !!projectUuid && isOpen,
  });

  const [formData, setFormData] = useState<CreateInspectionBody>({
    inspection_type: "",
    location: "",
    date_inspected: new Date().toISOString().split("T")[0],
    status: "PASS",
    notes: "",
  });
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);

  if (!isOpen) return null;

  const filteredEquipment = equipmentItems.filter((e) =>
    (e.name ?? "").toLowerCase().includes(equipmentSearch.toLowerCase())
  );

  const handleSelectEquipment = (item: { id?: string; name?: string }) => {
    const name = item.name ?? "";
    setFormData((prev) => ({ ...prev, inspection_type: name }));
    setEquipmentSearch(name);
    setShowEquipmentDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
    setFormData({
      inspection_type: "",
      location: "",
      date_inspected: new Date().toISOString().split("T")[0],
      status: "PASS",
      notes: "",
    });
    setEquipmentSearch("");
  };

  // ─── Detail View ──────────────────────────────────────────────────────────
  if (record) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <AnimatePresence>
          <motion.div
            key="inspection-detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ClipboardCheck size={24} className="text-[#021422]" />
                  <h2 className="text-2xl font-bold text-[#021422]">Inspection Detail</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-5">
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase ${statusBadge(record.status)}`}>
                  {record.status}
                </span>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Inspection Type</p>
                  <p className="text-lg font-bold text-[#021422]">{record.inspection_type}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                    <p className="text-sm font-medium text-[#021422]">{record.location}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Inspector</p>
                    <p className="text-sm font-medium text-[#021422]">{record.inspector}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date Inspected</p>
                  <p className="text-sm font-medium text-[#021422]">
                    {new Date(record.date_inspected).toLocaleDateString()}
                  </p>
                </div>

                {record.notes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-sm text-[#021422] bg-gray-50 rounded-lg p-3">{record.notes}</p>
                  </div>
                )}

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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <AnimatePresence>
        <motion.div
          key="inspection-create"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
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
                <label className="text-sm font-bold text-[#021422]">Equipment Name</label>
                <p className="text-xs text-gray-400">Pick from inventory or type a name manually</p>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={equipmentSearch || formData.inspection_type}
                    onChange={(e) => {
                      setEquipmentSearch(e.target.value);
                      setFormData((prev) => ({ ...prev, inspection_type: e.target.value }));
                      setShowEquipmentDropdown(true);
                    }}
                    onFocus={() => setShowEquipmentDropdown(true)}
                    onBlur={() => setTimeout(() => setShowEquipmentDropdown(false), 150)}
                    placeholder="e.g. Mobile Crane #001, Scaffold System A"
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                  />
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  {showEquipmentDropdown && filteredEquipment.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredEquipment.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={() => handleSelectEquipment(item)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Location</label>
                  <input
                    required
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Block A, Site B"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Date Inspected</label>
                  <input
                    type="date"
                    value={formData.date_inspected}
                    onChange={(e) => setFormData({ ...formData, date_inspected: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Result</label>
                <div className="grid grid-cols-3 gap-3">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: s })}
                      className={`py-3 px-4 rounded-lg font-semibold border-2 transition-colors text-sm ${statusStyle(s, formData.status === s)}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Notes (optional)</label>
                <textarea
                  value={formData.notes ?? ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional observations"
                  rows={3}
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
      </AnimatePresence>
    </div>
  );
}
