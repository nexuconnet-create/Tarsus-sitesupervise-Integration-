"use client";

import { useState } from "react";
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
import type {
  SubtaskRequest,
  SubtaskType,
  MaterialResource,
  EquipmentResource,
  PPEResource,
  Crew,
  CrewAssignment,
  WorkerType,
} from "../types";
import { SUBTASK_TYPE_LABELS } from "../types";
import { useInventory } from "@/store/inventoryStore";
import {
  subtaskFormSchema,
  subtaskStepFields,
  defaultSubtaskFormValues,
  type SubtaskFormData,
} from "@/lib/validations/subtask-schema";
import AddTaskMaterialsSection from "./AddTaskMaterialsSection";
import AddTaskEquipmentSection from "./AddTaskEquipmentSection";
import AddTaskPPESection from "./AddTaskPPESection";

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface CreateSubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  crews: Crew[];
  onCreate: (subtask: SubtaskRequest) => void;
}

type Step = "type" | "details" | "resources" | "review";

const STEPS: { id: Step; label: string }[] = [
  { id: "type", label: "Select Type" },
  { id: "details", label: "Details" },
  { id: "resources", label: "Resources" },
  { id: "review", label: "Review" },
];

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Form State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Separate State for Complex Objects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [selectedMaterials, setSelectedMaterials] = useState<
    MaterialResource[]
  >([]);
  const [selectedEquipment, setSelectedEquipment] = useState<
    EquipmentResource[]
  >([]);
  const [selectedPPE, setSelectedPPE] = useState<PPEResource[]>([]);
  const [crewAssignments, setCrewAssignments] = useState<CrewAssignment[]>([]);
  const [selectingCrewId, setSelectingCrewId] = useState<string | null>(null);
  const [selectingWorkerType, setSelectingWorkerType] =
    useState<WorkerType | null>(null);
  const [crewPrice, setCrewPrice] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  // â”€â”€â”€ Inventory Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleAddMaterialToInventory = (input: {
    name: string;
    category: string;
    unit: string;
    quantity: number;
    price?: number;
  }) => {
    addMaterial(input);
  };

  const handleAddEquipmentToInventory = (input: {
    name: string;
    category: string;
    condition: string;
    price?: number;
  }) => {
    addEquipment(input);
  };

  const handleAddPPEToInventory = (input: {
    name: string;
    unit: string;
    quantity: number;
    price?: number;
    size?: string;
  }) => {
    addPPE(input);
  };

  // â”€â”€â”€ Type Toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const toggleType = (type: SubtaskType) => {
    const current = selectedTypes || [];
    if (current.includes(type)) {
      setValue(
        "selectedTypes",
        current.filter((t) => t !== type),
      );
    } else {
      setValue("selectedTypes", [...current, type]);
    }
  };

  // â”€â”€â”€ Step Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleNext = async () => {
    const fieldsToValidate = subtaskStepFields[currentStep];
    let isValid = true;
    if (fieldsToValidate.length > 0) {
      isValid = await trigger(fieldsToValidate as (keyof SubtaskFormData)[]);
    }
    if (isValid) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < STEPS.length) {
        setCurrentStep(STEPS[nextIndex].id);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  // â”€â”€â”€ Crew Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleAddCrewAssignment = (
    crewId: string,
    workerType: WorkerType,
    price?: number,
  ) => {
    setCrewAssignments((prev) => [...prev, { crewId, workerType, price }]);
    setSelectingCrewId(null);
    setSelectingWorkerType(null);
    setCrewPrice("");
  };

  const handleRemoveCrewAssignment = (crewId: string) => {
    setCrewAssignments((prev) => prev.filter((a) => a.crewId !== crewId));
  };

  // â”€â”€â”€ Submit Handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const onSubmit = async (data: SubtaskFormData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const selectedCrews = crews.filter((c) =>
      crewAssignments.some((a) => a.crewId === c.id),
    );

    const subtaskId = `ST-${Date.now()}`;
    const newSubtask: SubtaskRequest = {
      id: subtaskId,
      taskId,
      title: data.title.trim(),
      description: data.description.trim(),
      type: data.selectedTypes,
      status: "pending",
      requestedBy: data.createdBy.trim(),
      requestedAt: new Date().toISOString(),
      materials:
        data.selectedTypes.includes("additional_resources") &&
        selectedMaterials.length > 0
          ? selectedMaterials
          : undefined,
      equipment:
        data.selectedTypes.includes("additional_resources") &&
        selectedEquipment.length > 0
          ? selectedEquipment
          : undefined,
      ppe:
        data.selectedTypes.includes("additional_resources") &&
        selectedPPE.length > 0
          ? selectedPPE
          : undefined,
      additionalCrews:
        data.selectedTypes.includes("additional_crew") &&
        selectedCrews.length > 0
          ? selectedCrews
          : undefined,
      additionalWorkers:
        data.selectedTypes.includes("additional_crew") &&
        crewAssignments.length > 0
          ? crewAssignments.map((a) => {
              const crew = crews.find((c) => c.id === a.crewId);
              return {
                id: a.crewId,
                name: crew?.name || "",
                trade: crew?.trade || "",
                workers: crew?.workers || [],
                size: crew?.size || 0,
              };
            })
          : undefined,
      newStartDate: data.selectedTypes.includes("timeline_extension")
        ? newStartDate || undefined
        : undefined,
      newDueDate: data.selectedTypes.includes("timeline_extension")
        ? newDueDate || undefined
        : undefined,
      notes: data.notes?.trim() || undefined,
      approvedBy: data.approvedBy?.trim() || undefined,
    };

    onCreate(newSubtask);
    setLoading(false);
    handleClose();
  };

  // â”€â”€â”€ Close Handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!isOpen) return null;

  const isLastStep = currentStepIndex === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
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

        {/* Progress Bar */}
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
                    index <= currentStepIndex
                      ? "text-[#021422]"
                      : "text-gray-400"
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
              {/* â”€â”€â”€ Step 1: Select Type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              {currentStep === "type" && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Select the type of subtask you want to create:
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {(
                      [
                        "additional_resources",
                        "additional_crew",
                        "timeline_extension",
                      ] as SubtaskType[]
                    ).map((type) => (
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
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
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
                                "Request additional crew members"}
                              {type === "timeline_extension" &&
                                "Request changes to task timeline"}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* â”€â”€â”€ Step 2: Details â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              {currentStep === "details" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                      Subtask Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("title")}
                      placeholder="e.g., Request Additional Concrete"
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] ${
                        errors.title
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.title.message}
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
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#007AFF] ${
                        errors.description
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                      Created By *
                    </label>
                    <input
                      {...register("createdBy")}
                      placeholder="Your name"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                      Approved By
                    </label>
                    <input
                      {...register("approvedBy")}
                      placeholder="e.g., John Smith (Project Manager)"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    />
                  </div>
                </div>
              )}

              {/* â”€â”€â”€ Step 3: Resources â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              {currentStep === "resources" && (
                <div className="space-y-6">
                  {/* Resources (Materials, Equipment, PPE) */}
                  {selectedTypes.includes("additional_resources") && (
                    <>
                      <AddTaskMaterialsSection
                        materials={selectedMaterials}
                        onChange={setSelectedMaterials}
                        onAddToInventory={handleAddMaterialToInventory}
                      />
                      <AddTaskEquipmentSection
                        equipment={selectedEquipment}
                        onChange={setSelectedEquipment}
                        onAddToInventory={handleAddEquipmentToInventory}
                      />
                      <AddTaskPPESection
                        ppe={selectedPPE}
                        onChange={setSelectedPPE}
                        onAddToInventory={handleAddPPEToInventory}
                      />
                    </>
                  )}

                  {/* Additional Crew */}
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
                      onAddAssignment={handleAddCrewAssignment}
                      onRemoveAssignment={handleRemoveCrewAssignment}
                      onCancelSelection={() => {
                        setSelectingCrewId(null);
                        setSelectingWorkerType(null);
                        setCrewPrice("");
                      }}
                    />
                  )}

                  {/* Timeline Changes */}
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
                            New Finish Date
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

              {/* â”€â”€â”€ Step 4: Review â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              {currentStep === "review" && (
                <ReviewStep
                  selectedTypes={selectedTypes}
                  title={watch("title")}
                  description={watch("description")}
                  notes={watch("notes")}
                  approvedBy={watch("approvedBy")}
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
              <ChevronLeft size={16} />
              Back
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
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Subtask"
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#021422] text-white text-sm font-bold hover:bg-gray-900 transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// â”€â”€â”€ Crew Assignment Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface CrewAssignmentSectionProps {
  crews: Crew[];
  crewAssignments: CrewAssignment[];
  selectingCrewId: string | null;
  selectingWorkerType: WorkerType | null;
  crewPrice: string;
  onSelectCrew: (crewId: string | null) => void;
  onSelectWorkerType: (type: WorkerType | null) => void;
  onSetCrewPrice: (price: string) => void;
  onAddAssignment: (
    crewId: string,
    workerType: WorkerType,
    price?: number,
  ) => void;
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
  return (
    <div>
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
        <Users size={12} />
        Additional Crew{" "}
        {crewAssignments.length > 0 && `(${crewAssignments.length})`}
      </div>

      {/* Assigned Crews */}
      {crewAssignments.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Assigned ({crewAssignments.length})
          </div>
          <div className="space-y-1.5">
            {crewAssignments.map((assignment) => {
              const crew = crews.find((c) => c.id === assignment.crewId);
              if (!crew) return null;
              return (
                <div
                  key={crew.id}
                  className="flex items-center justify-between px-3 py-2 bg-[#021422]/5 rounded border-l-2 border-[#021422]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-[#021422]">
                      {crew.name}
                    </span>
                    <span className="text-gray-500 text-[10px]">
                      ({crew.trade} â€¢ {crew.size} workers)
                    </span>
                    {assignment.workerType && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#021422] text-white">
                        {assignment.workerType === "subcontractor"
                          ? "Subcontractor"
                          : "Daily Worker"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {assignment.price !== undefined && assignment.price > 0 && (
                      <span className="text-xs font-medium text-[#021422]">
                        â‚¦{assignment.price.toLocaleString()}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveAssignment(crew.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Worker Type Selection */}
      {selectingCrewId && !selectingWorkerType && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-3">
          <p className="text-xs text-gray-600 mb-2">
            Worker type for{" "}
            <span className="font-medium text-[#021422]">
              {crews.find((c) => c.id === selectingCrewId)?.name}
            </span>
            :
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onSelectWorkerType("subcontractor")}
              className="flex-1 px-3 py-2 rounded text-xs font-medium bg-[#021422] text-white hover:bg-gray-800 transition-colors"
            >
              Subcontractor
            </button>
            <button
              type="button"
              onClick={() => onSelectWorkerType("daily_worker")}
              className="flex-1 px-3 py-2 rounded text-xs font-medium bg-[#021422] text-white hover:bg-gray-800 transition-colors"
            >
              Daily Worker
            </button>
            <button
              type="button"
              onClick={onCancelSelection}
              className="px-3 py-2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Price Input */}
      {selectingCrewId && selectingWorkerType && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-3">
          <p className="text-xs text-gray-600 mb-2">
            Price for{" "}
            <span className="font-medium text-[#021422]">
              {selectingWorkerType === "subcontractor"
                ? "Subcontractor"
                : "Daily Worker"}
            </span>
            :
          </p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#021422] text-xs">
                â‚¦
              </span>
              <input
                type="number"
                value={crewPrice}
                onChange={(e) => onSetCrewPrice(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded pl-6 pr-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#021422] focus:border-[#021422] bg-white"
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
              className="px-4 py-2 bg-[#021422] text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectWorkerType(null);
                onSetCrewPrice("");
              }}
              className="px-2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Available Crews */}
      {!selectingCrewId && (
        <div className="space-y-1">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Available (
            {
              crews.filter(
                (c) => !crewAssignments.some((a) => a.crewId === c.id),
              ).length
            }
            )
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
                    <p className="text-sm font-medium text-gray-900">
                      {crew.name}
                    </p>
                    <p className="text-xs text-gray-500">{crew.trade}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {crew.size} workers
                  </span>
                </button>
              ))}
            {crews.filter(
              (c) => !crewAssignments.some((a) => a.crewId === c.id),
            ).length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-gray-400">
                All crews assigned
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Review Step â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface ReviewStepProps {
  selectedTypes: SubtaskType[];
  title: string;
  description: string;
  notes?: string;
  approvedBy?: string;
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
  notes,
  approvedBy,
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
        <div>
          <span className="text-xs font-medium text-gray-500">Type(s):</span>
          <p className="text-sm font-bold text-[#021422]">
            {selectedTypes.map((t) => SUBTASK_TYPE_LABELS[t]).join(", ")}
          </p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500">Title:</span>
          <p className="text-sm font-bold text-[#021422]">{title}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500">
            Description:
          </span>
          <p className="text-sm text-gray-700">{description}</p>
        </div>
        {notes && (
          <div>
            <span className="text-xs font-medium text-gray-500">Notes:</span>
            <p className="text-sm text-gray-700">{notes}</p>
          </div>
        )}
        {selectedTypes.includes("additional_resources") &&
          (selectedMaterials.length > 0 ||
            selectedEquipment.length > 0 ||
            selectedPPE.length > 0) && (
            <div>
              <span className="text-xs font-medium text-gray-500">
                Resources:
              </span>
              <div className="mt-1 space-y-1">
                {selectedMaterials.length > 0 && (
                  <p className="text-xs text-gray-600">
                    Materials: {selectedMaterials.map((m) => m.name).join(", ")}
                  </p>
                )}
                {selectedEquipment.length > 0 && (
                  <p className="text-xs text-gray-600">
                    Equipment: {selectedEquipment.map((e) => e.name).join(", ")}
                  </p>
                )}
                {selectedPPE.length > 0 && (
                  <p className="text-xs text-gray-600">
                    PPE: {selectedPPE.map((p) => p.name).join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}
        {crewAssignments.length > 0 && (
          <div>
            <span className="text-xs font-medium text-gray-500">
              Additional Crew:
            </span>
            <div className="mt-1 space-y-1">
              {crewAssignments.map((assignment) => {
                const crew = crews.find((c) => c.id === assignment.crewId);
                return (
                  <p key={assignment.crewId} className="text-xs text-gray-600">
                    {crew?.name} ({crew?.trade})
                    {assignment.workerType && (
                      <span>
                        {" "}
                        -{" "}
                        {assignment.workerType === "subcontractor"
                          ? "Subcontractor"
                          : "Daily Worker"}
                      </span>
                    )}
                    {assignment.price !== undefined && (
                      <span> - â‚¦{assignment.price.toLocaleString()}</span>
                    )}
                  </p>
                );
              })}
            </div>
          </div>
        )}
        {(newStartDate || newDueDate) && (
          <div>
            <span className="text-xs font-medium text-gray-500">
              Timeline Changes:
            </span>
            <div className="mt-1 space-y-1">
              {newStartDate && (
                <p className="text-xs text-gray-600">Start: {newStartDate}</p>
              )}
              {newDueDate && (
                <p className="text-xs text-gray-600">Finish: {newDueDate}</p>
              )}
            </div>
          </div>
        )}
        {approvedBy && (
          <div>
            <span className="text-xs font-medium text-gray-500">
              Approved By:
            </span>
            <p className="text-xs text-gray-600">{approvedBy}</p>
          </div>
        )}
      </div>
    </div>
  );
}
