"use client";

import { useState } from "react";
import { X, Edit } from "lucide-react";
import { motion } from "framer-motion";
import type { Task } from "../types";
import InstructionsTab from "./InstructionsTab";
import ResourcesTab from "./ResourcesTab";
import CommunicationsTab from "@/components/CommunicationsTab";
import ProgressTab from "./ProgressTab";
import { useParams } from "next/navigation";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";

type Tab = "instructions" | "resources" | "communications" | "progress";

interface WorkPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onEdit: (task: Task) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export default function WorkPackageModal({
  isOpen,
  onClose,
  task,
  onEdit,
  onUpdate,
}: WorkPackageModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("instructions");
  const params = useParams();
  const { data: projectUuid } = useProjectUuid(
    params?.org_slug as string,
    params?.project_slug as string,
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-10"
      >
        <div className="shrink-0 px-6 py-4 flex justify-between items-start bg-white border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#021422] bg-gray-100 px-2 py-1 rounded">{task.id}</span>
              <span className="text-xs font-semibold text-[#021422]">{task.title}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Work Package Quick View</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClose(); onEdit(task); }}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              title="Edit Task"
            >
              <Edit size={16} className="text-[#021422]" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X size={18} className="text-[#021422]" />
            </button>
          </div>
        </div>

        <div className="px-6 md:px-8 flex items-center gap-4 border-b border-gray-100 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: "instructions" as Tab, label: "Instructions" },
            { id: "resources" as Tab, label: "Resources" },
            { id: "communications" as Tab, label: "Communications" },
            { id: "progress" as Tab, label: "Progress" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-3 px-6 rounded-full border transition-all whitespace-nowrap text-sm font-medium
                ${activeTab === tab.id
                  ? "border-[#021422] bg-[#021422] text-white shadow-md"
                  : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
          {activeTab === "instructions" && (
            <InstructionsTab documents={task.instructions?.documents} taskId={task.id} />
          )}
          {activeTab === "resources" && (
            <ResourcesTab resources={task.resources} taskId={task.id} crews={task.crews} />
          )}
          {activeTab === "communications" && (
            <CommunicationsTab projectId={projectUuid ?? ""} taskId={task.id} />
          )}
          {activeTab === "progress" && (
            <ProgressTab task={task} onUpdate={onUpdate} />
          )}
        </div>
      </motion.div>
    </div>
  );
}
