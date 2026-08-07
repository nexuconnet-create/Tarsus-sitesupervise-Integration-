"use client";

import { useState } from "react";
import { X, MapPin, User, CheckCircle, XCircle, Pencil, RefreshCw, Calendar, ListChecks, Clock, Send, FlaskConical } from "lucide-react";
import type { Task, SubtaskRequest, Crew, PendingRescheduleRequest, TestResult } from "../types";
import { STATUS_CONFIG, QUEUE_LABELS, RESCHEDULE_BADGE_CONFIG } from "../types";
import type { SubTaskCreatePayload } from "@/lib/services/subtaskService";
import UpdateQueueStatusModal from "./UpdateQueueStatusModal";
import RequestRescheduleModal from "./RequestRescheduleModal";
import type { Milestone } from "@/lib/types/milestone";
import { useAuthStore } from "@/lib/stores/authStore";
import ReadOnlyTaskTracker from "./ReadOnlyTaskTracker";
import ReadOnlyTestingPanel from "./ReadOnlyTestingPanel";
import InstructionsTab from "./InstructionsTab";
import ResourcesTab from "./ResourcesTab";
import SubtasksTab from "./SubtasksTab";
import CommunicationsTab from "@/components/CommunicationsTab";
import ProgressTab from "./ProgressTab";
import TimelineExtensionCard from "./TimelineExtensionCard";
import RejectReasonModal from "./RejectReasonModal";
import CostTab from "./CostTab";
import ConcreteTestResultModal from "./ConcreteTestResultModal";
// Activity tab temporarily disabled — to be re-added later
// import ActivityFeedTab from "@/components/ActivityFeedTab";
import { useTaskReopen } from "@/lib/hooks/useTaskReopen";
import { getCostBreakdown, formatCurrency } from "../utils/costCalculator";
import { formatDate } from "@/lib/dateUtils";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { useSyncTaskProgress } from "@/lib/hooks/useMiscExpenses";

type DrawerTab =
  | "overview"
  | "tracker"
  | "testing"
  | "instructions"
  | "resources"
  | "subtasks"
  | "communications"
  | "progress"
  | "cost";
// | "activity"  // Activity tab temporarily disabled — to be re-added later

interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
  isOpen: boolean;
  milestones: Milestone[];
  /** Full list of project crews — forwarded to the Create-Subtask modal */
  crews?: Crew[];
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onApproveTask?: (taskId: string) => void;
  onRejectTask?: (taskId: string, reason: string) => void;
  onApproveSubtask?: (subtaskId: string) => void;
  onRejectSubtask?: (subtaskId: string, reason: string) => void;
  onCreateSubtask?: (taskId: string, payload: SubTaskCreatePayload) => Promise<void>;
  onUpdateSubtask?: (subtaskId: string, updated: SubtaskRequest) => void;
  onApproveChecklistChanges?: (taskId: string) => void;
  onRejectChecklistChanges?: (taskId: string, reason: string) => void;
  onEdit?: (task: Task) => void;
  onReschedule?: (task: Task) => void;
  onRequestReschedule?: (taskId: string, request: PendingRescheduleRequest) => void;
  onApproveRescheduleRequest?: (taskId: string) => void;
  onRejectRescheduleRequest?: (taskId: string) => void;
}

export default function TaskDetailDrawer({
  task,
  onClose,
  isOpen,
  milestones,
  crews,
  onUpdate,
  onApproveTask,
  onRejectTask,
  onApproveSubtask,
  onRejectSubtask,
  onCreateSubtask,
  onUpdateSubtask,
  onApproveChecklistChanges,
  onRejectChecklistChanges,
  onEdit,
  onReschedule,
  onRequestReschedule,
  onApproveRescheduleRequest,
  onRejectRescheduleRequest,
}: TaskDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showQueueStatusModal, setShowQueueStatusModal] = useState(false);
  const [showRequestRescheduleModal, setShowRequestRescheduleModal] = useState(false);
  const [showConcreteTestModal, setShowConcreteTestModal] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isPM = user?.role === "PROJECT_MANAGER";

  const params = useParams();
  const { data: projectUuid } = useProjectUuid(
    params?.org_slug as string,
    params?.project_slug as string,
  );
  const syncProgressMutation = useSyncTaskProgress(projectUuid);
  const reopenMutation = useTaskReopen(projectUuid ?? "", task?.id ?? "");
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState("");

  // Handle saving concrete test result
  const handleSaveConcreteTestResult = (result: TestResult) => {
    if (!task) return;
    const existingTests = task.tests || [];
    const newTest = {
      id: `test-${Date.now()}`,
      type: result.type,
      label: result.customLabel || result.type,
      dateAdded: result.date,
      companyName: undefined,
      notes: result.notes,
      results: [result],
      latestResult: result,
    };
    onUpdate(task.id, {
      tests: [...existingTests, newTest],
      concreteTestResultsUploaded: true,
    });
    toast.success("Concrete test result uploaded successfully");
  };

  // Called by the checklist tracker whenever items are toggled.
  // Updates task.progress and cascades to auto-tracking expenses.
  const handleChecklistProgressChange = (progressPercent: number) => {
    if (!task) return;
    onUpdate(task.id, { progress: progressPercent });
    if (task.milestoneId) {
      syncProgressMutation.mutate({
        task_id: task.id,
        milestone_id: task.milestoneId,
        progress_percent: progressPercent,
      });
    }
  };

  if (!isOpen || !task) return null;

  const statusConfig = STATUS_CONFIG[task.status];
  const milestoneName = milestones.find((m) => m.id === task.milestoneId)?.name;

  const tabs: { id: DrawerTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "instructions", label: "Instructions" },
    { id: "resources", label: "Resources" },
    { id: "subtasks", label: "Subtasks" },
    { id: "testing", label: "Testing" },
    { id: "tracker", label: "Task Tracker" },
    { id: "cost", label: "Cost" },
    // { id: "activity", label: "Activity" },  // temporarily disabled — re-add later
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
              {milestoneName && (
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                  {milestoneName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {task.taskType === "concrete" && (
                <button
                  onClick={() => setShowConcreteTestModal(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    task.concreteTestResultsUploaded
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  <FlaskConical size={12} />
                  {task.concreteTestResultsUploaded ? "Test Results Uploaded" : "Upload Test Results"}
                </button>
              )}
              <button
                onClick={() => setShowQueueStatusModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                <ListChecks size={12} />
                Update Status
              </button>
              {isPM ? (
                <>
                  <button
                    onClick={() => onEdit?.(task)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => onReschedule?.(task)}
                    disabled={!task.pm_approved}
                    title={!task.pm_approved ? "Task must be PM-approved before rescheduling" : "Reschedule task"}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      task.pm_approved
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <RefreshCw size={12} />
                    Reschedule
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowRequestRescheduleModal(true)}
                  disabled={!!task.pendingRescheduleRequest}
                  title={task.pendingRescheduleRequest ? "Edit request already pending PM approval" : "Request to edit task dates"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    task.pendingRescheduleRequest
                      ? "bg-amber-100 text-amber-700 cursor-not-allowed"
                      : "bg-[#021422] text-white hover:bg-gray-800"
                  }`}
                >
                  {task.pendingRescheduleRequest ? (
                    <><Clock size={12} />Pending Approval</>
                  ) : (
                    <><Send size={12} />Request Edit</>
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-[#021422]" />
              </button>
          </div>
        </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <h2 className="text-xl font-bold text-[#021422]">
              {task.title}
              {task.is_rescheduled && <span className="ml-1 text-gray-500">*</span>}
            </h2>
            {task.is_rescheduled && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${RESCHEDULE_BADGE_CONFIG.bg} ${RESCHEDULE_BADGE_CONFIG.text} ${RESCHEDULE_BADGE_CONFIG.border}`}>
                <RefreshCw size={10} />
                RESCHEDULED
              </span>
            )}
          </div>
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
                    Grid {task.grid} — {task.location}
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

              {/* Reschedule Info */}
              {task.is_rescheduled && (
                <div className={`rounded-xl p-4 border ${RESCHEDULE_BADGE_CONFIG.bg} ${RESCHEDULE_BADGE_CONFIG.border}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <RefreshCw size={14} className="text-gray-600" />
                    <span className={`text-xs font-bold uppercase tracking-wider ${RESCHEDULE_BADGE_CONFIG.text}`}>
                      Reschedule History
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar size={11} className="text-gray-400" />
                        <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Original Dates</p>
                      </div>
                      <p className="text-sm font-semibold text-[#021422]">
                        {task.original_start_date ?? task.startDate} → {task.original_end_date ?? task.dueDate}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar size={11} className="text-gray-400" />
                        <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">New Dates</p>
                      </div>
                      <p className="text-sm font-semibold text-[#021422]">
                        {task.startDate} → {task.dueDate}
                      </p>
                    </div>
                  </div>
                  {task.reschedule_reason && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Reason</p>
                      <p className="text-sm text-gray-700">{task.reschedule_reason}</p>
                    </div>
                  )}
                  {task.rescheduled_by && (
                    <p className="text-[10px] text-gray-500 font-semibold mt-2">
                      Rescheduled by {task.rescheduled_by}{task.rescheduled_at ? ` on ${task.rescheduled_at.split("T")[0]}` : ""}
                    </p>
                  )}
                </div>
              )}

              {/* Pending Edit Request */}
              {task.pendingRescheduleRequest && (
                <div className="rounded-xl p-4 border border-amber-200 bg-amber-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={14} className="text-amber-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      Pending Edit Request
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white rounded-lg p-3 border border-amber-100">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar size={11} className="text-gray-400" />
                        <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Proposed Dates</p>
                      </div>
                      <p className="text-sm font-semibold text-[#021422]">
                        {task.pendingRescheduleRequest.newStartDate} → {task.pendingRescheduleRequest.newDueDate}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-amber-100">
                      <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Requested By</p>
                      <p className="text-sm font-semibold text-[#021422]">{task.pendingRescheduleRequest.requestedBy}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(task.pendingRescheduleRequest.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-amber-100 mb-3">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Reason</p>
                    <p className="text-sm text-gray-700">{task.pendingRescheduleRequest.reason}</p>
                  </div>
                  {isPM && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApproveRescheduleRequest?.(task.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={13} />
                        Approve
                      </button>
                      <button
                        onClick={() => onRejectRescheduleRequest?.(task.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300 transition-colors"
                      >
                        <XCircle size={13} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Estimated Cost */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-400">
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

              {(task.createdBy || task.approvedBy || task.rejectedBy || task.approvalStatus) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                      Task Approval
                    </h4>
                    {task.approvalStatus && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          task.approvalStatus === "approved"
                            ? "bg-green-100 text-green-700"
                            : task.approvalStatus === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {task.approvalStatusDisplay ?? task.approvalStatus}
                      </span>
                    )}
                  </div>
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

                    {/* Approve/Reject Buttons for Task — driven by approval_status
                        (falls back to legacy approvedBy/rejectedBy when absent). */}
                    {(task.approvalStatus
                      ? task.approvalStatus === "pending"
                      : !task.approvedBy && !task.rejectedBy) && (
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

              {/* Reopen Task — PM only, only when COMPLETED */}
              {isPM && task.queue === "completed" && (
                <div className="rounded-xl p-4 border border-red-200 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-red-700 tracking-wider">
                        Task Completed
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Reopen this task to continue working on it.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowReopenModal(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                    >
                      <RefreshCw size={12} />
                      Reopen Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "tracker" && (
            <ReadOnlyTaskTracker
              taskTracker={task.taskTracker}
              taskId={task.id}
              projectUuid={projectUuid}
              onUpdate={(tracker) =>
                onUpdate(task.id, { taskTracker: tracker })
              }
              onProgressChange={handleChecklistProgressChange}
              onApproveChanges={onApproveChecklistChanges}
              onRejectChanges={onRejectChecklistChanges}
              trackerCreatedBy={task.trackerCreatedBy}
              trackerApprovedBy={task.trackerApprovedBy}
            />
          )}

          {activeTab === "cost" && <CostTab task={task} crews={task.crews} />}

          {/* Activity tab temporarily disabled — to be re-added later
          {activeTab === "activity" && projectUuid && (
            <ActivityFeedTab projectUuid={projectUuid} taskId={task.id} />
          )} */}

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

          {activeTab === "subtasks" && (
            <SubtasksTab
              task={task}
              allCrews={crews}
              onCreateSubtask={(payload) => onCreateSubtask?.(task.id, payload) ?? Promise.resolve()}
              onUpdateSubtask={(subtaskId, updated) => onUpdateSubtask?.(subtaskId, updated)}
              onApproveSubtask={(id) => onApproveSubtask?.(id)}
              onRejectSubtask={(id, reason) => onRejectSubtask?.(id, reason)}
            />
          )}

          {activeTab === "communications" && (
            <CommunicationsTab
              projectId={projectUuid ?? ""}
              taskId={task.id}
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

      {/* Request Reschedule Modal (non-PM) */}
      <RequestRescheduleModal
        isOpen={showRequestRescheduleModal}
        onClose={() => setShowRequestRescheduleModal(false)}
        task={task}
        onSubmit={(taskId, request) => {
          onRequestReschedule?.(taskId, request);
          setShowRequestRescheduleModal(false);
        }}
      />

      {/* Update Queue & Status Modal */}
      <UpdateQueueStatusModal
        isOpen={showQueueStatusModal}
        onClose={() => setShowQueueStatusModal(false)}
        task={task}
        onSave={(taskId, updates) => {
          onUpdate(taskId, updates);
          setShowQueueStatusModal(false);
          toast.success("Queue & status updated");
        }}
      />

      {/* Concrete Test Result Modal */}
      <ConcreteTestResultModal
        isOpen={showConcreteTestModal}
        onClose={() => setShowConcreteTestModal(false)}
        onSave={handleSaveConcreteTestResult}
      />

      {/* Reopen Task Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => { setShowReopenModal(false); setReopenReason(""); }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#021422] mb-2">Reopen Task</h3>
            <p className="text-sm text-gray-500 mb-4">
              Provide a reason for reopening this completed task (min 10 characters).
            </p>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Reason for reopening..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] resize-none"
            />
            {reopenReason.length > 0 && reopenReason.length < 10 && (
              <p className="text-xs text-red-500 mt-1">Reason must be at least 10 characters.</p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setShowReopenModal(false); setReopenReason(""); }}
                className="flex-1 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (reopenReason.trim().length < 10) return;
                  reopenMutation.mutate(reopenReason.trim(), {
                    onSuccess: () => {
                      setShowReopenModal(false);
                      setReopenReason("");
                    },
                  });
                }}
                disabled={reopenReason.trim().length < 10 || reopenMutation.isPending}
                className="flex-1 px-3 py-2.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {reopenMutation.isPending ? "Reopening..." : "Reopen Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
