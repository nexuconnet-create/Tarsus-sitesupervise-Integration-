"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useForm,
  Controller,
  FormProvider,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Task,
  Crew,
  TaskStatus,
  QueueType,
  TaskType,
  WorkerType,
  CrewAssignment,
  MaterialResource,
  EquipmentResource,
  PPEResource,
  TaskTest,
  TaskTracker as TaskTrackerType,
  ChecklistItem,
} from "../types";
import { useInventory } from "@/store/inventoryStore";
import { useAuthStore } from "@/lib/stores/authStore";
import {
  taskFormSchema,
  taskStepFields,
  defaultTaskFormValues,
  type TaskFormData,
} from "@/lib/validations/task-schema";
import AddTaskMaterialsSection from "./AddTaskMaterialsSection";
import AddTaskEquipmentSection from "./AddTaskEquipmentSection";
import AddTaskPPESection from "./AddTaskPPESection";
import AddTaskTestingSection from "./AddTaskTestingSection";
import AddTaskTrackerSection from "./AddTaskTrackerSection";

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface AddEditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  crews: Crew[];
  onSave: (task: Partial<Task>) => void;
}

type Step = "basic" | "resources" | "testing" | "tracker";

const STEPS: { id: Step; label: string }[] = [
  { id: "basic", label: "Basic Info" },
  { id: "resources", label: "Resources" },
  { id: "testing", label: "Testing" },
  { id: "tracker", label: "Tracker" },
];

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AddEditTaskModal({
  isOpen,
  onClose,
  task,
  crews,
  onSave,
}: AddEditTaskModalProps) {
  const { addMaterial, addEquipment, addPPE } = useInventory();
  const user = useAuthStore((s) => s.user);
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [loading, setLoading] = useState(false);
  const [selectingCrewId, setSelectingCrewId] = useState<string | null>(null);
  const [selectingWorkerType, setSelectingWorkerType] =
    useState<WorkerType | null>(null);
  const [crewPrice, setCrewPrice] = useState("");

  const isEdit = !!task;

  // â”€â”€â”€ Form State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const defaultValues = useMemo(() => {
    if (task) {
      return {
        title: task.title || "",
        grid: task.grid || "",
        location: task.location || "",
        description: task.description || "",
        startDate: task.startDate || "",
        dueDate: task.dueDate || "",
        queue: task.queue || "todo",
        status: task.status || "on_schedule",
        risk: task.risk || "",
        hasTaskTracker: !!task.taskTracker,
        taskType: task.taskTracker?.taskType || "general",
        linkedDrawings: task.linkedDrawings || "",
        methodStatement: task.methodStatement || "",
        arScopeReference: task.arScopeReference || "",
        createdBy: task.createdBy || "",
        approvedBy: task.approvedBy || "",
        crewAssignments: task.crewAssignments || [],
        materials: task.resources?.materials || [],
        equipment: task.resources?.equipment || [],
        ppe: task.resources?.ppe || [],
        tests: task.tests || [],
        taskTracker: task.taskTracker,
        resourcesCreatedBy: task.resourcesCreatedBy || "",
        resourcesApprovedBy: task.resourcesApprovedBy || "",
        testingCreatedBy: task.testingCreatedBy || "",
        testingApprovedBy: task.testingApprovedBy || "",
        trackerCreatedBy: task.trackerCreatedBy || "",
        trackerApprovedBy: task.trackerApprovedBy || "",
      };
    }
    return defaultTaskFormValues;
  }, [task]);

  const methods = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    mode: "onBlur",
    shouldUnregister: false,
    defaultValues,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = methods;

  // â”€â”€â”€ useFieldArray for Crew Assignments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const {
    fields: crewFields,
    append: appendCrew,
    remove: removeCrew,
  } = useFieldArray({
    control,
    name: "crewAssignments",
  });

  // â”€â”€â”€ useFieldArray for Tests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const {
    fields: testFields,
    append: appendTest,
    remove: removeTest,
  } = useFieldArray({
    control,
    name: "tests",
  });

  // â”€â”€â”€ Separate State for Complex Inventory Objects â”€â”€â”€â”€
  const [taskMaterials, setTaskMaterials] = useState<MaterialResource[]>(
    defaultValues.materials || [],
  );
  const [taskEquipment, setTaskEquipment] = useState<EquipmentResource[]>(
    defaultValues.equipment || [],
  );
  const [taskPPE, setTaskPPE] = useState<PPEResource[]>(
    defaultValues.ppe || [],
  );
  const [taskTracker, setTaskTracker] = useState<TaskFormData["taskTracker"]>(
    defaultValues.taskTracker,
  );

  // â”€â”€â”€ Auto-populate createdBy when step changes â”€â”€â”€
  const { setValue, getValues } = methods;

  useEffect(() => {
    const userName = user?.name || user?.email || "";
    if (currentStep === "resources" && !getValues("resourcesCreatedBy")) {
      setValue("resourcesCreatedBy", userName);
    }
    if (currentStep === "testing" && !getValues("testingCreatedBy")) {
      setValue("testingCreatedBy", userName);
    }
    if (currentStep === "tracker" && !getValues("trackerCreatedBy")) {
      setValue("trackerCreatedBy", userName);
    }
  }, [currentStep, setValue, getValues, user]);

  // â”€â”€â”€ Step Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleNext = async () => {
    const fieldsToValidate = taskStepFields[currentStep];
    const isValid = await trigger(fieldsToValidate as (keyof TaskFormData)[]);
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

  // â”€â”€â”€ Submit Handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const onSubmit = async (data: TaskFormData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const selectedCrews = crews.filter((c) =>
      data.crewAssignments.some((a) => a.crewId === c.id),
    );

    const testsWithResults = (data.tests || []).map((t) => ({
      ...t,
      results: t.results || [],
      dateAdded: t.dateAdded || new Date().toISOString().split("T")[0],
    }));

    const updatedTask: Partial<Task> = {
      ...(task || {}),
      ...data,
      tests: testsWithResults,
      crews: selectedCrews,
      resources: {
        materials: taskMaterials,
        equipment: taskEquipment,
        manpower: [],
        ppe: taskPPE,
      },
      taskTracker: taskTracker || undefined,
    };

    onSave(updatedTask);
    setLoading(false);
    handleClose();
  };

  // â”€â”€â”€ Close Handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleClose = () => {
    reset();
    setCurrentStep("basic");
    setTaskMaterials([]);
    setTaskEquipment([]);
    setTaskPPE([]);
    setTaskTracker(undefined);
    setSelectingCrewId(null);
    setSelectingWorkerType(null);
    setCrewPrice("");
    onClose();
  };

  // â”€â”€â”€ Crew Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleAddCrew = (
    crewId: string,
    workerType: WorkerType,
    price?: number,
  ) => {
    appendCrew({ crewId, workerType, price });
    setSelectingCrewId(null);
    setSelectingWorkerType(null);
    setCrewPrice("");
  };

  const handleRemoveCrew = (crewId: string) => {
    const index = crewFields.findIndex((f) => f.crewId === crewId);
    if (index !== -1) {
      removeCrew(index);
    }
  };

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative z-10"
      >
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <h2 className="text-lg font-bold text-[#021422]">
            {isEdit ? "Edit Task" : "Add New Task"}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-[#021422]" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="shrink-0 px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                    idx < currentStepIndex
                      ? "bg-[#021422] text-white"
                      : idx === currentStepIndex
                        ? "bg-[#021422] text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {idx < currentStepIndex ? "âœ“" : idx + 1}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    idx === currentStepIndex
                      ? "text-[#021422]"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      idx < currentStepIndex ? "bg-[#021422]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <FormProvider {...methods}>
          <form
            onSubmit={(e) => {
              if (currentStepIndex < STEPS.length - 1) {
                e.preventDefault();
                handleNext();
              } else {
                handleSubmit(onSubmit)(e);
              }
            }}
            className="flex-1 overflow-y-auto p-6"
          >
            <AnimatePresence mode="wait">
              {/* â”€â”€â”€ Step 1: Basic Info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              {currentStep === "basic" && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Task Title *
                      </label>
                      <input
                        {...register("title")}
                        placeholder="e.g., Pour Concrete - Pile Cap #12"
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent ${
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
                        Grid *
                      </label>
                      <input
                        {...register("grid")}
                        placeholder="e.g., BS, C4, L3"
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent ${
                          errors.grid
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200"
                        }`}
                      />
                      {errors.grid && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.grid.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Location *
                      </label>
                      <input
                        {...register("location")}
                        placeholder="e.g., Basement South"
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent ${
                          errors.location
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200"
                        }`}
                      />
                      {errors.location && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.location.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        {...register("startDate")}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent ${
                          errors.startDate
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200"
                        }`}
                      />
                      {errors.startDate && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.startDate.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Finish Date *
                      </label>
                      <input
                        type="date"
                        {...register("dueDate")}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent ${
                          errors.dueDate
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200"
                        }`}
                      />
                      {errors.dueDate && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {errors.dueDate.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Queue
                      </label>
                      <Controller
                        name="queue"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                          >
<option value="todo">TO-DO</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="uncompleted">Uncompleted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Status
                      </label>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                          >
                            <option value="ahead_of_schedule">
                              Ahead of Schedule
                            </option>
                            <option value="on_schedule">On Schedule</option>
                            <option value="behind_schedule">
                              Behind Schedule
                            </option>
                            <option value="at_risk">At Risk</option>
                          </select>
                        )}
                      />
                    </div>
                  </div>

                  {/* Crew Assignment */}
                  <CrewAssignmentSection
                    crews={crews}
                    crewFields={crewFields}
                    selectingCrewId={selectingCrewId}
                    selectingWorkerType={selectingWorkerType}
                    crewPrice={crewPrice}
                    onSelectCrew={setSelectingCrewId}
                    onSelectWorkerType={setSelectingWorkerType}
                    onSetCrewPrice={setCrewPrice}
                    onAddCrew={handleAddCrew}
                    onRemoveCrew={handleRemoveCrew}
                    onCancelSelection={() => {
                      setSelectingCrewId(null);
                      setSelectingWorkerType(null);
                      setCrewPrice("");
                    }}
                  />

                  {/* Description, Risk, Created By, Approved By */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Description
                      </label>
                      <textarea
                        {...register("description")}
                        rows={3}
                        placeholder="Detailed description of the work to be performed..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Risk Factor
                      </label>
                      <input
                        {...register("risk")}
                        placeholder="e.g., Weather dependent - no work in rain"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Created By
                      </label>
                      <input
                        {...register("createdBy")}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-gray-50"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Approved By
                      </label>
                      <input
                        {...register("approvedBy")}
                        placeholder="Name of approver"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* â”€â”€â”€ Step 2: Resources â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              {currentStep === "resources" && (
                <motion.div
                  key="resources"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <AddTaskMaterialsSection
                    materials={taskMaterials}
                    onChange={setTaskMaterials}
                    onAddToInventory={(mat) => addMaterial(mat)}
                  />
                  <AddTaskEquipmentSection
                    equipment={taskEquipment}
                    onChange={setTaskEquipment}
                    onAddToInventory={(eq) => addEquipment(eq)}
                  />
                  <AddTaskPPESection
                    ppe={taskPPE}
                    onChange={setTaskPPE}
                    onAddToInventory={(p) => addPPE(p)}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Resources Created By
                      </label>
                      <input
                        {...register("resourcesCreatedBy")}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-gray-50"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Resources Approved By
                      </label>
                      <input
                        {...register("resourcesApprovedBy")}
                        placeholder="Name of approver"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* â”€â”€â”€ Step 3: Testing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              {currentStep === "testing" && (
                <motion.div
                  key="testing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <AddTaskTestingSection
                    testFields={testFields}
                    appendTest={appendTest}
                    removeTest={removeTest}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Testing Created By
                      </label>
                      <input
                        {...register("testingCreatedBy")}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-gray-50"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Testing Approved By
                      </label>
                      <input
                        {...register("testingApprovedBy")}
                        placeholder="Name of approver"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* â”€â”€â”€ Step 4: Tracker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              {currentStep === "tracker" && (
                <motion.div
                  key="tracker"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <AddTaskTrackerSection
                    taskTracker={taskTracker}
                    onChange={setTaskTracker}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Tracker Created By
                      </label>
                      <input
                        {...register("trackerCreatedBy")}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-gray-50"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                        Tracker Approved By
                      </label>
                      <input
                        {...register("trackerApprovedBy")}
                        placeholder="Name of approver"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </FormProvider>

        {/* Footer - outside form to prevent accidental submission */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50">
          {currentStepIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          )}

          {currentStepIndex < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3 rounded-lg bg-[#021422] text-white text-sm font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className="flex-1 py-3 rounded-lg bg-[#021422] text-white text-sm font-bold hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                  Saving...
                </>
              ) : isEdit ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// â”€â”€â”€ Crew Assignment Section (useFieldArray) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface CrewAssignmentSectionProps {
  crews: Crew[];
  crewFields: (CrewAssignment & { id: string })[];
  selectingCrewId: string | null;
  selectingWorkerType: WorkerType | null;
  crewPrice: string;
  onSelectCrew: (crewId: string | null) => void;
  onSelectWorkerType: (type: WorkerType | null) => void;
  onSetCrewPrice: (price: string) => void;
  onAddCrew: (crewId: string, workerType: WorkerType, price?: number) => void;
  onRemoveCrew: (crewId: string) => void;
  onCancelSelection: () => void;
}

function CrewAssignmentSection({
  crews,
  crewFields,
  selectingCrewId,
  selectingWorkerType,
  crewPrice,
  onSelectCrew,
  onSelectWorkerType,
  onSetCrewPrice,
  onAddCrew,
  onRemoveCrew,
  onCancelSelection,
}: CrewAssignmentSectionProps) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
        Assign Crews *
      </label>

      {/* Assigned Crews */}
      {crewFields.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Assigned ({crewFields.length})
          </div>
          <div className="space-y-1.5">
            {crewFields.map((field) => {
              const crew = crews.find((c) => c.id === field.crewId);
              if (!crew) return null;
              const workerType = field.workerType;
              const price = field.price;
              return (
                <div
                  key={field.id}
                  className="flex items-center justify-between px-3 py-2 bg-[#021422]/5 rounded border-l-2 border-[#021422]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-[#021422]">
                      {crew.name}
                    </span>
                    <span className="text-gray-500 text-[10px]">
                      ({crew.trade} â€¢ {crew.size} workers)
                    </span>
                    {workerType && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#021422] text-white">
                        {workerType === "subcontractor"
                          ? "Subcontractor"
                          : "Daily Worker"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {price !== undefined && price > 0 && (
                      <span className="text-xs font-medium text-[#021422]">
                        â‚¦{price.toLocaleString()}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveCrew(crew.id)}
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
        <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
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
              className="flex-1 px-3 py-1.5 rounded text-xs font-medium bg-[#021422] text-white hover:bg-gray-800 transition-colors"
            >
              Subcontractor
            </button>
            <button
              type="button"
              onClick={() => onSelectWorkerType("daily_worker")}
              className="flex-1 px-3 py-1.5 rounded text-xs font-medium bg-[#021422] text-white hover:bg-gray-800 transition-colors"
            >
              Daily Worker
            </button>
            <button
              type="button"
              onClick={onCancelSelection}
              className="px-2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Price Input */}
      {selectingCrewId && selectingWorkerType && (
        <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
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
                className="w-full border border-gray-200 rounded pl-6 pr-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#021422] focus:border-[#021422] bg-white"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const price = parseFloat(crewPrice);
                if (!isNaN(price) && price > 0 && selectingWorkerType) {
                  onAddCrew(selectingCrewId, selectingWorkerType, price);
                }
              }}
              disabled={!crewPrice || parseFloat(crewPrice) <= 0}
              className="px-3 py-1.5 bg-[#021422] text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
        <div>
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Available (
            {
              crews.filter(
                (crew) => !crewFields.some((f) => f.crewId === crew.id),
              ).length
            }
            )
          </div>
          <div className="space-y-1">
            {crews
              .filter((crew) => !crewFields.some((f) => f.crewId === crew.id))
              .map((crew) => (
                <button
                  key={crew.id}
                  type="button"
                  onClick={() => onSelectCrew(crew.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 transition-colors text-left border border-gray-200 hover:border-gray-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-[#021422]">
                      {crew.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ({crew.trade} â€¢ {crew.size} workers)
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">+</span>
                </button>
              ))}
            {crews.filter(
              (crew) => !crewFields.some((f) => f.crewId === crew.id),
            ).length === 0 && (
              <div className="px-3 py-2 text-center text-gray-400 text-xs bg-gray-50 rounded">
                All crews assigned
              </div>
            )}
          </div>
        </div>
      )}

      {crewFields.length === 0 && !selectingCrewId && (
        <p className="text-xs text-gray-500 mt-2">Click on a crew to assign</p>
      )}
    </div>
  );
}
