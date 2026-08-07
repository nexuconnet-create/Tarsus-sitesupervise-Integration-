"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Users,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SubtaskType, Crew, CrewAssignment, WorkerType } from "../types";
import { SUBTASK_TYPE_LABELS } from "../types";
import {
  subtaskFormSchema,
  subtaskStepFields,
  defaultSubtaskFormValues,
  type SubtaskFormData,
} from "@/lib/validations/subtask-schema";
import type {
  SubTaskCreatePayload,
  SubTaskResourceItemPayload,
} from "@/lib/services/subtaskService";
import AddTaskMaterialsSection from "./AddTaskMaterialsSection";
import AddTaskEquipmentSection from "./AddTaskEquipmentSection";
import AddTaskPPESection from "./AddTaskPPESection";
import type { MaterialResource, EquipmentResource, PPEResource } from "../types";
import { useInventory } from "@/store/inventoryStore";

// ─── Props ────────────────────────────────────────────────────────────────────
interface CreateSubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  crews: Crew[];
  /** Called with the validated API payload — parent is responsible for the API call */
  onCreate: (payload: SubTaskCreatePayload) => Promise<void>;
}

type Step = "type" | "details" | "resources" | "review";

const STEPS: { id: Step; label: string }[] = [
  { id: "type", label: "Select Type" },
  { id: "details", label: "Details" },
  { id: "resources", label: "Resources" },
  { id: "review", label: "Review" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function materialToPayload(m: MaterialResource): SubTaskResourceItemPayload {
  return {
    item_id: m.id,
    quantity_required: String(m.quantity || "1"),
    notes: m.notes || "",
  };
}

function equipmentToPayload(e: EquipmentResource): SubTaskResourceItemPayload {
  return {
    item_id: e.id,
    quantity_required: String(e.quantity || "1"),
    ...(e.plannedDays ? { planned_days: String(e.plannedDays) } : {}),
    notes: "",
  };
}

function ppeToPayload(p: PPEResource) {
  return {
    item_id: p.id,
    quantity_required: String(p.quantity || "1"),
    quantity_issued: null,
    notes: "",
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreateSubtaskModal({
  isOpen,
  onClose,
  taskId,
  crews,
  onCreate,
}: CreateSubtaskModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("type");
  const [loading, setLoading] = useState(false);
  const { addMaterial, addEquipment, addPPE } = useInventory();

  // ─── Form ──────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<SubtaskFormData>({
    resolver: zodResolver(subtaskFormSchema),
    mode: "onBlur",
    defaultValues: defaultSubtaskFormValues,
  });

  const selectedTypes = watch("selectedTypes");

  // ─── Resource state (complex objects, managed outside react-hook-form) ─
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialResource[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentResource[]>([]);
  const [selectedPPE, setSelectedPPE] = useState<PPEResource[]>([]);
  const [crewAssignments, setCrewAssignments] = useState<CrewAssignment[]>([]);

  // Crew picker sub-state
  const [selectingCrewId, setSelectingCrewId] = useState<string | null>(null);
  const [selectingWorkerType, setSelectingWorkerType] = useState<WorkerType | null>(null);
  const [crewPrice, setCrewPrice] = useState("");

  // Timeline state
  const [newStartDate, setNewStartDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  // ─── Type toggle ────────────────────────────────────────────────────────
  const toggleType = (type: SubtaskType) => {
    const current = selectedTypes || [];
    setValue(
      "selectedTypes",
      current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type],
    );
  };

  // ─── Step navigation ────────────────────────────────────────────────────
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleNext = async () => {
    const fields = subtaskStepFields[currentStep];
    const isValid = fields.length > 0
      ? await trigger(fields as (keyof SubtaskFormData)[])
      : true;
    if (isValid && currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) setCurrentStep(STEPS[currentStepIndex - 1].id);
  };

  // ─── Crew handlers ──────────────────────────────────────────────────────
  const handleAddCrew = (crewId: string, workerType: WorkerType, price?: number) => {
    setCrewAssignments((prev) => [...prev, { crewId, workerType, price }]);
    setSelectingCrewId(null);
    setSelectingWorkerType(null);
    setCrewPrice("");
  };
  const handleRemoveCrew = (crewId: string) => {
    setCrewAssignments((prev) => prev.filter((a) => a.crewId !== crewId));
  };

  // ─── Submit → build API payload ─────────────────────────────────────────
  const onSubmit = async (data: SubtaskFormData) => {
    setLoading(true);
    try {
      const hasResources = data.selectedTypes.includes("additional_resources");
      const hasCrew = data.selectedTypes.includes("additional_crew");
      const hasTimeline = data.selectedTypes.includes("timeline_extension");

      const payload: SubTaskCreatePayload = {
        title: data.title.trim(),
        description: data.description.trim(),
        has_resource_request: hasResources,
        has_crew_request: hasCrew,
        has_timeline_extension: hasTimeline,
      };

      if (hasResources) {
        payload.resources = {
          materials: selectedMaterials.map(materialToPayload),
          equipment: selectedEquipment.map(equipmentToPayload),
          ppe: selectedPPE.map(ppeToPayload),
        };
      }

      if (hasCrew && crewAssignments.length > 0) {
        payload.crews = crewAssignments.map((a) => {
          const workerType = a.workerType || "subcontractor";
          const priceStr = a.price ? String(a.price) : null;
          if (workerType === "daily_worker") {
            return { crew_id: a.crewId, worker_type: workerType, daily_rate: priceStr };
          }
          if (workerType === "not_applicable") {
            return { crew_id: a.crewId, worker_type: workerType };
          }
          return { crew_id: a.crewId, worker_type: workerType, flat_price: priceStr };
        });
      }

      if (hasTimeline) {
        if (newStartDate) payload.new_start_date = newStartDate;
        if (newDueDate) payload.new_due_date = newDueDate;
      }

      await onCreate(payload);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  // ─── Close / reset ───────────────────────────────────────────────────────
  const handleClose = () => {
    reset(defaultSubtaskFormValues);
    setCurrentStep("type");
    setSelectedMaterials([]);
    setSelectedEquipment([]);
    setSelectedPPE([]);
    setCrewAssignments([]);
    setSelectingCrewId(null);
    setSelectingWorkerType(null);
    setCrewPrice("");
    setNewStartDate("");
    setNewDueDate("");
    onClose();
  };

  if (!isOpen) return null;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative z-10"
      >
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-bold text-[#021422]">Create Subtask</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Step {currentStepIndex + 1} of {STEPS.length}:{" "}
              {STEPS[currentStepIndex].label}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-[#021422]" />
          </button>
        </div>

        {/* Progress */}
        <div className="shrink-0 px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index <= currentStepIndex
                      ? "bg-[#021422] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`ml-2 text-xs font-medium ${
                    index <= currentStepIndex ? "text-[#021422]" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-gray-200 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* ── Step 1: Type ─────────────────────────────────────────── */}
              {currentStep === "type" && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Select what you need — you can pick more than one:
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {(["additional_resources", "additional_crew", "timeline_extension"] as SubtaskType[]).map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleType(type)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedTypes.includes(type)
                              ? "border-[#021422] bg-[#021422]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                selectedTypes.includes(type)
                                  ? "border-[#021422] bg-[#021422]"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedTypes.includes(type) && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[#021422]">
                                {SUBTASK_TYPE_LABELS[type]}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {type === "additional_resources" &&
                                  "Request additional materials, equipment, or PPE"}
                                {type === "additional_crew" &&
                                  "Request an additional crew assignment"}
                                {type === "timeline_extension" &&
                                  "Request changes to the task start or due date"}
                              </p>
                            </div>
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                  {errors.selectedTypes && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.selectedTypes.message}
                    </p>
                  )}
                </div>
              )}

              {/* ── Step 2: Details ──────────────────────────────────────── */}
              {currentStep === "details" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("title")}
                      placeholder="e.g., Request Additional Concrete"
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] ${
                        errors.title ? "border-red-400 bg-red-50" : "border-gray-200"
                      }`}
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={10} /> {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register("description")}
                      placeholder="Describe what is needed and why..."
                      rows={4}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#021422] ${
                        errors.description ? "border-red-400 bg-red-50" : "border-gray-200"
                      }`}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={10} /> {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 3: Resources ────────────────────────────────────── */}
              {currentStep === "resources" && (
                <div className="space-y-6">
                  {selectedTypes.includes("additional_resources") && (
                    <>
                      <AddTaskMaterialsSection
                        materials={selectedMaterials}
                        onChange={setSelectedMaterials}
                        onAddToInventory={(input) => addMaterial(input)}
                      />
                      <AddTaskEquipmentSection
                        equipment={selectedEquipment}
                        onChange={setSelectedEquipment}
                        onAddToInventory={(input) => addEquipment(input)}
                      />
                      <AddTaskPPESection
                        ppe={selectedPPE}
                        onChange={setSelectedPPE}
                        onAddToInventory={(input) => addPPE(input)}
                      />
                    </>
                  )}

                  {selectedTypes.includes("additional_crew") && (
                    <CrewAssignmentSection
                      crews={crews}
                      crewAssignments={crewAssignments}
                      selectingCrewId={selectingCrewId}
                      selectingWorkerType={selectingWorkerType}
                      crewPrice={crewPrice}
                      onSelectCrew={setSelectingCrewId}
                      onSelectWorkerType={setSelectingWorkerType}
                      onSetCrewPrice={setCrewPrice}
                      onAddAssignment={handleAddCrew}
                      onRemoveAssignment={handleRemoveCrew}
                      onCancelSelection={() => {
                        setSelectingCrewId(null);
                        setSelectingWorkerType(null);
                        setCrewPrice("");
                      }}
                    />
                  )}

                  {selectedTypes.includes("timeline_extension") && (
                    <div>
                      <h3 className="text-sm font-bold text-[#021422] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Calendar size={14} />
                        Timeline Changes
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            New Start Date
                          </label>
                          <input
                            type="date"
                            value={newStartDate}
                            onChange={(e) => setNewStartDate(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            New Due Date
                          </label>
                          <input
                            type="date"
                            value={newDueDate}
                            onChange={(e) => setNewDueDate(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 4: Review ────────────────────────────────────────── */}
              {currentStep === "review" && (
                <ReviewStep
                  selectedTypes={selectedTypes}
                  title={watch("title")}
                  description={watch("description")}
                  selectedMaterials={selectedMaterials}
                  selectedEquipment={selectedEquipment}
                  selectedPPE={selectedPPE}
                  crewAssignments={crewAssignments}
                  crews={crews}
                  newStartDate={newStartDate}
                  newDueDate={newDueDate}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className="px-8 py-3 rounded-lg bg-[#021422] text-white text-sm font-bold hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#021422] text-white text-sm font-bold hover:bg-gray-900 transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Crew Assignment Section ──────────────────────────────────────────────────

const WORKER_TYPE_OPTIONS: { value: WorkerType; label: string }[] = [
  { value: "subcontractor", label: "Subcontractor" },
  { value: "daily_worker", label: "Daily Worker" },
  { value: "not_applicable", label: "Not Applicable" },
];

interface CrewAssignmentSectionProps {
  crews: Crew[];
  crewAssignments: CrewAssignment[];
  selectingCrewId: string | null;
  selectingWorkerType: WorkerType | null;
  crewPrice: string;
  onSelectCrew: (id: string | null) => void;
  onSelectWorkerType: (type: WorkerType | null) => void;
  onSetCrewPrice: (p: string) => void;
  onAddAssignment: (crewId: string, workerType: WorkerType, price?: number) => void;
  onRemoveAssignment: (crewId: string) => void;
  onCancelSelection: () => void;
}

function CrewAssignmentSection({
  crews,
  crewAssignments,
  selectingCrewId,
  selectingWorkerType,
  crewPrice,
  onSelectCrew,
  onSelectWorkerType,
  onSetCrewPrice,
  onAddAssignment,
  onRemoveAssignment,
  onCancelSelection,
}: CrewAssignmentSectionProps) {
  const needsPrice =
    selectingWorkerType === "subcontractor" ||
    selectingWorkerType === "daily_worker";

  return (
    <div>
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
        <Users size={12} />
        Additional Crew{crewAssignments.length > 0 && ` (${crewAssignments.length})`}
      </div>

      {/* Assigned list */}
      {crewAssignments.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {crewAssignments.map((a) => {
            const crew = crews.find((c) => c.id === a.crewId);
            if (!crew) return null;
            return (
              <div
                key={crew.id}
                className="flex items-center justify-between px-3 py-2 bg-[#021422]/5 rounded border-l-2 border-[#021422]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs text-[#021422]">{crew.name}</span>
                  <span className="text-gray-500 text-[10px]">
                    ({crew.trade} · {crew.size} workers)
                  </span>
                  {a.workerType && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#021422] text-white">
                      {WORKER_TYPE_OPTIONS.find((o) => o.value === a.workerType)?.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {a.price !== undefined && a.price > 0 && (
                    <span className="text-xs font-medium text-[#021422]">
                      ₦{a.price.toLocaleString()}
                    </span>
                  )}
                  <button type="button" onClick={() => onRemoveAssignment(crew.id)} className="text-gray-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Worker-type picker */}
      {selectingCrewId && !selectingWorkerType && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-3">
          <p className="text-xs text-gray-600 mb-2">
            Worker type for{" "}
            <span className="font-medium text-[#021422]">
              {crews.find((c) => c.id === selectingCrewId)?.name}
            </span>
            :
          </p>
          <div className="flex gap-2 flex-wrap">
            {WORKER_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  if (opt.value === "not_applicable") {
                    // No price needed — add immediately
                    onAddAssignment(selectingCrewId, opt.value);
                  } else {
                    onSelectWorkerType(opt.value);
                  }
                }}
                className="flex-1 px-3 py-2 rounded text-xs font-medium bg-[#021422] text-white hover:bg-gray-800 transition-colors"
              >
                {opt.label}
              </button>
            ))}
            <button type="button" onClick={onCancelSelection} className="px-3 py-2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Price input */}
      {selectingCrewId && selectingWorkerType && needsPrice && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-3">
          <p className="text-xs text-gray-600 mb-2">
            {selectingWorkerType === "subcontractor" ? "Flat price" : "Daily rate"} for{" "}
            <span className="font-medium text-[#021422]">
              {crews.find((c) => c.id === selectingCrewId)?.name}
            </span>
            :
          </p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#021422] text-xs">₦</span>
              <input
                type="number"
                value={crewPrice}
                onChange={(e) => onSetCrewPrice(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded pl-6 pr-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#021422] bg-white"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const price = parseFloat(crewPrice);
                if (!isNaN(price) && price > 0 && selectingWorkerType) {
                  onAddAssignment(selectingCrewId, selectingWorkerType, price);
                }
              }}
              disabled={!crewPrice || parseFloat(crewPrice) <= 0}
              className="px-4 py-2 bg-[#021422] text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              Add
            </button>
            <button type="button" onClick={() => { onSelectWorkerType(null); onSetCrewPrice(""); }} className="px-2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Available crews */}
      {!selectingCrewId && (
        <div>
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Available ({crews.filter((c) => !crewAssignments.some((a) => a.crewId === c.id)).length})
          </div>
          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
            {crews
              .filter((c) => !crewAssignments.some((a) => a.crewId === c.id))
              .map((crew) => (
                <button
                  key={crew.id}
                  type="button"
                  onClick={() => onSelectCrew(crew.id)}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{crew.name}</p>
                    <p className="text-xs text-gray-500">{crew.trade}</p>
                  </div>
                  <span className="text-xs text-gray-400">{crew.size} workers</span>
                </button>
              ))}
            {crews.filter((c) => !crewAssignments.some((a) => a.crewId === c.id)).length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-gray-400">All crews assigned</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Review Step ──────────────────────────────────────────────────────────────

interface ReviewStepProps {
  selectedTypes: SubtaskType[];
  title: string;
  description: string;
  selectedMaterials: MaterialResource[];
  selectedEquipment: EquipmentResource[];
  selectedPPE: PPEResource[];
  crewAssignments: CrewAssignment[];
  crews: Crew[];
  newStartDate: string;
  newDueDate: string;
}

function ReviewStep({
  selectedTypes,
  title,
  description,
  selectedMaterials,
  selectedEquipment,
  selectedPPE,
  crewAssignments,
  crews,
  newStartDate,
  newDueDate,
}: ReviewStepProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <Row label="Type(s)">{selectedTypes.map((t) => SUBTASK_TYPE_LABELS[t]).join(", ")}</Row>
        <Row label="Title">{title}</Row>
        <Row label="Description"><span className="text-gray-700">{description}</span></Row>

        {selectedTypes.includes("additional_resources") &&
          (selectedMaterials.length > 0 || selectedEquipment.length > 0 || selectedPPE.length > 0) && (
            <Row label="Resources">
              <div className="space-y-0.5">
                {selectedMaterials.length > 0 && (
                  <p className="text-xs text-gray-600">Materials: {selectedMaterials.map((m) => m.name).join(", ")}</p>
                )}
                {selectedEquipment.length > 0 && (
                  <p className="text-xs text-gray-600">Equipment: {selectedEquipment.map((e) => e.name).join(", ")}</p>
                )}
                {selectedPPE.length > 0 && (
                  <p className="text-xs text-gray-600">PPE: {selectedPPE.map((p) => p.name).join(", ")}</p>
                )}
              </div>
            </Row>
          )}

        {crewAssignments.length > 0 && (
          <Row label="Additional Crew">
            <div className="space-y-0.5">
              {crewAssignments.map((a) => {
                const crew = crews.find((c) => c.id === a.crewId);
                return (
                  <p key={a.crewId} className="text-xs text-gray-600">
                    {crew?.name} ({crew?.trade}) — {WORKER_TYPE_OPTIONS.find((o) => o.value === a.workerType)?.label}
                    {a.price ? ` · ₦${a.price.toLocaleString()}` : ""}
                  </p>
                );
              })}
            </div>
          </Row>
        )}

        {(newStartDate || newDueDate) && (
          <Row label="Timeline">
            <div className="space-y-0.5">
              {newStartDate && <p className="text-xs text-gray-600">Start: {newStartDate}</p>}
              {newDueDate && <p className="text-xs text-gray-600">Due: {newDueDate}</p>}
            </div>
          </Row>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs font-medium text-gray-500">{label}:</span>
      <div className="text-sm font-bold text-[#021422] mt-0.5">{children}</div>
    </div>
  );
}
