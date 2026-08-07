"use client";

import { useState } from "react";
import {
  X,
  MapPin,
  Flag,
  User,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";
import type { Task, TaskNote } from "../types";
import { STATUS_CONFIG, QUEUE_LABELS } from "../types";
import ReadOnlyTaskTracker from "./ReadOnlyTaskTracker";
import ReadOnlyTestingPanel from "./ReadOnlyTestingPanel";
import InstructionsTab from "./InstructionsTab";
import ResourcesTab from "./ResourcesTab";
import CommunicationsTab from "./CommunicationsTab";
import ProgressTab from "./ProgressTab";
import TimelineExtensionCard from "./TimelineExtensionCard";
import RejectReasonModal from "./RejectReasonModal";
import CostTab from "./CostTab";
import { getCostBreakdown, formatCurrency } from "../utils/costCalculator";
import { formatDate } from "@/lib/dateUtils";

type DrawerTab =
  | "overview"
  | "tracker"
  | "testing"
  | "instructions"
  | "resources"
  | "communications"
  | "progress"
  | "cost";

interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
  isOpen: boolean;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onApproveTask?: (taskId: string) => void;
  onRejectTask?: (taskId: string, reason: string) => void;
  onApproveSubtask?: (subtaskId: string) => void;
  onRejectSubtask?: (subtaskId: string, reason: string) => void;
  onApproveChecklistChanges?: (taskId: string) => void;
  onRejectChecklistChanges?: (taskId: string, reason: string) => void;
  onSendNote?: (
    taskId: string,
    note: {
      content: string;
      noteType?: TaskNote["noteType"];
      requiresAttention?: boolean;
    },
  ) => void;
}

export default function TaskDetailDrawer({
  task,
  onClose,
  isOpen,
  onUpdate,
  onApproveTask,
  onRejectTask,
  onApproveSubtask,
  onRejectSubtask,
  onApproveChecklistChanges,
  onRejectChecklistChanges,
}: TaskDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!isOpen || !task) return null;

  const statusConfig = STATUS_CONFIG[task.status];

  const tabs: { id: DrawerTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "instructions", label: "Instructions" },
    { id: "resources", label: "Resources" },
    { id: "testing", label: "Testing" },
    { id: "tracker", label: "Task Tracker" },
    { id: "cost", label: "Cost" },
    { id: "communications", label: "Communications" },
    { id: "progress", label: "Progress" },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white h-full w-full max-w-3xl overflow-y-auto shadow-2xl flex flex-col"
        style={{ animation: "slideInRight 0.3s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        <div className="sticky top-0 z-20 bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-bold text-[#021422] bg-white px-2 py-1 rounded">
                {task.wp}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                ></span>
                {statusConfig.label}
              </span>
              <span className="text-xs font-semibold text-[#021422] bg-white px-2 py-1 rounded border border-gray-200">
                {QUEUE_LABELS[task.queue]}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-[#021422]" />
              </button>
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#021422] mt-2">
            {task.title}
          </h2>
        </div>

        <div className="sticky top-[88px] bg-white border-b border-gray-100 z-10 px-6">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 px-3 py-2.5 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#021422] text-[#021422]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Location
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#021422]">
                    Grid {task.grid} â€” {task.location}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Progress
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          task.progress >= 75
                            ? "bg-green-500"
                            : task.progress >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[#021422]">
                      {task.progress}%
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Start Date
                  </span>
                  <p className="text-sm font-semibold text-[#021422]">
                    {task.startDate}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Finish Date
                  </span>
                  <p className="text-sm font-semibold text-[#021422]">
                    {task.dueDate}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Duration
                  </span>
                  <p className="text-sm font-semibold text-[#021422]">
                    {Math.ceil(
                      (new Date(task.dueDate).getTime() -
                        new Date(task.startDate).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </p>
                </div>
              </div>

              {/* Estimated Cost */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-400">
                  â‚¦
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Estimated Cost
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#021422]">
                  {formatCurrency(
                    getCostBreakdown(task, task.crews).grandTotal,
                  )}
                </p>
              </div>

              {task.description && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
                  Assigned Crews
                </h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#021422] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {task.crews[0]?.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#021422]">
                        {task.crews.map((c) => c.name).join(", ")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {task.crews.map((c) => c.trade).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {(task.createdBy || task.approvedBy || task.rejectedBy) && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
                    Task Authoring
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {task.createdBy && (
                        <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-[#021422] flex items-center justify-center">
                            <User size={14} className="text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Created By
                            </p>
                            <p className="text-sm font-semibold text-[#021422]">
                              {task.createdBy}
                            </p>
                            {task.createdAt && (
                              <p className="text-[10px] text-gray-400">
                                on {formatDate(task.createdAt.split("T")[0])}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {task.approvedBy && (
                        <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-green-200">
                          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                            <CheckCircle size={14} className="text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">
                              Approved By
                            </p>
                            <p className="text-sm font-semibold text-[#021422]">
                              {task.approvedBy}
                            </p>
                            {task.approvedAt && (
                              <p className="text-[10px] text-gray-400">
                                on {formatDate(task.approvedAt.split("T")[0])}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {task.rejectedBy && (
                        <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-red-200">
                          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                            <XCircle size={14} className="text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">
                              Rejected By
                            </p>
                            <p className="text-sm font-semibold text-[#021422]">
                              {task.rejectedBy}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rejection Reason */}
                    {task.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs font-semibold text-red-600">
                          Rejection Reason:
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          {task.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Approve/Reject Buttons for Task */}
                    {!task.approvedBy && !task.rejectedBy && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => onApproveTask?.(task.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle size={14} />
                          Approve Task
                        </button>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                        >
                          <XCircle size={14} />
                          Reject Task
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline Extension Subtasks */}
              {task.subtasks &&
                task.subtasks.filter((s) => {
                  const types = Array.isArray(s.type) ? s.type : [s.type];
                  return types.includes("timeline_extension");
                }).length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
                      Subtask Timeline Extension
                    </h4>
                    <div className="space-y-3">
                      {task.subtasks
                        .filter((s) => {
                          const types = Array.isArray(s.type)
                            ? s.type
                            : [s.type];
                          return types.includes("timeline_extension");
                        })
                        .map((subtask) => (
                          <TimelineExtensionCard
                            key={subtask.id}
                            subtask={subtask}
                            onApprove={onApproveSubtask}
                            onReject={onRejectSubtask}
                          />
                        ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {activeTab === "tracker" && (
            <ReadOnlyTaskTracker
              taskTracker={task.taskTracker}
              taskId={task.id}
              onUpdate={(tracker) =>
                onUpdate(task.id, { taskTracker: tracker })
              }
              onApproveChanges={onApproveChecklistChanges}
              onRejectChanges={onRejectChecklistChanges}
              trackerCreatedBy={task.trackerCreatedBy}
              trackerApprovedBy={task.trackerApprovedBy}
            />
          )}

          {activeTab === "cost" && <CostTab task={task} crews={task.crews} />}

          {activeTab === "testing" && <ReadOnlyTestingPanel task={task} />}

          {activeTab === "instructions" && (
            <InstructionsTab
              documents={task.instructions?.documents}
              isReadOnly
            />
          )}

          {activeTab === "resources" && (
            <ResourcesTab
              resources={task.resources}
              task={task}
              taskId={task.id}
              crews={task.crews}
              onUpdate={onUpdate}
              onApproveSubtask={onApproveSubtask}
              onRejectSubtask={onRejectSubtask}
            />
          )}

          {activeTab === "communications" && (
            <CommunicationsTab
              messages={task.communications}
              taskId={task.id}
              onUpdate={onUpdate}
            />
          )}

          {activeTab === "progress" && (
            <ProgressTab task={task} onUpdate={onUpdate} />
          )}
        </div>
      </div>

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={(reason) => onRejectTask?.(task.id, reason)}
        title="Reject Task"
      />
    </div>
  );
}
