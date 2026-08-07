"use client";

import { useState } from "react";
import { X, MapPin, Users, Calendar, FileText, User, CheckCircle, ListChecks } from "lucide-react";
import type { Task, ChecklistChange, Crew as LocalCrew, SubtaskRequest } from "../types";
import { STATUS_CONFIG, QUEUE_LABELS } from "../types";
import CrewPanel from "./CrewPanel";
import InstructionsTab from "./InstructionsTab";
import CommunicationsTab from "@/components/CommunicationsTab";
import CrewResourcesTab from "./CrewResourcesTab";
import CrewTestingPanel from "./CrewTestingPanel";
import ReadOnlyTaskTracker from "../../../engineer/(office)/task-details/components/ReadOnlyTaskTracker";
import ProgressTab from "../../../engineer/(office)/task-details/components/ProgressTab";
import SubtasksTab from "../../../engineer/(office)/task-details/components/SubtasksTab";
import UpdateQueueStatusModal from "../../../engineer/(office)/task-details/components/UpdateQueueStatusModal";
// Activity tab temporarily disabled — to be re-added later
// import ActivityFeedTab from "@/components/ActivityFeedTab";
import type { Milestone } from "@/lib/types/milestone";
import type { SubTaskCreatePayload } from "@/lib/services/subtaskService";
import { formatDate } from "@/lib/dateUtils";
import { useParams } from "next/navigation";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";

type DrawerTab =
  | "overview"
  | "crew"
  | "tracker"
  | "testing"
  | "instructions"
  | "resources"
  | "subtasks"
  | "communications"
  | "progress";
// | "activity"  // Activity tab temporarily disabled — to be re-added later

interface CrewTaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onSubmitChanges?: (taskId: string, changes: ChecklistChange[]) => void;
  crews?: LocalCrew[];
  milestones?: Milestone[];
  onCreateSubtask?: (taskId: string, payload: SubTaskCreatePayload) => Promise<void>;
  onApproveSubtask?: (subtaskId: string) => Promise<void>;
  onRejectSubtask?: (subtaskId: string, reason: string) => Promise<void>;
  onUpdateSubtask?: (subtaskId: string, updated: SubtaskRequest) => void;
}

const CrewTaskDetailDrawer = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  crews,
  milestones,
  onCreateSubtask,
  onApproveSubtask,
  onRejectSubtask,
  onUpdateSubtask,
}: CrewTaskDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const [showQueueStatusModal, setShowQueueStatusModal] = useState(false);
  const params = useParams();
  const orgSlug = params?.org_slug as string;
  const projectSlug = params?.project_slug as string;
  const { data: projectUuid } = useProjectUuid(orgSlug, projectSlug);

  const handleChecklistProgressChange = (progressPercent: number) => {
    if (!task) return;
    onUpdate?.(task.id, { progress: progressPercent });
  };

  if (!isOpen || !task) return null;

  const statusConfig = STATUS_CONFIG[task.status];
  const milestoneName = milestones?.find((m) => m.id === task.milestoneId)?.name ?? task.milestoneName;

  const tabs: { id: DrawerTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "instructions", label: "Instructions" },
    { id: "resources", label: "Resources" },
    { id: "testing", label: "Testing" },
    { id: "tracker", label: "Task Tracker" },
    { id: "subtasks", label: "Subtasks" },
    // { id: "activity", label: "Activity" },  // temporarily disabled — re-add later
    { id: "communications", label: "Communications" },
    { id: "progress", label: "Progress" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
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

        {/* Header */}
        <div className="sticky top-0 z-20 bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-bold text-[#021422] bg-white px-2 py-1 rounded">
                {task.wp || task.id}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
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
              <button
                onClick={() => setShowQueueStatusModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                <ListChecks size={12} />
                Update Status
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-[#021422]" />
              </button>
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#021422] mt-3 leading-tight">
            {task.title}
          </h2>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mt-4 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#007AFF] text-[#007AFF]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "overview" && (
            <div className="p-6 space-y-6">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Location
                    </span>
                  </div>
                  <p className="font-semibold text-[#021422]">
                    {task.grid || "N/A"}
                  </p>
                  {task.location && (
                    <p className="text-sm text-gray-500 mt-1">
                      {task.location}
                    </p>
                  )}
                </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Start Date
                </span>
              </div>
              <p className="font-semibold text-[#021422]">
                {formatDate(task.startDate)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Finish Date
                </span>
              </div>
              <p className="font-semibold text-[#021422]">
                {formatDate(task.dueDate)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                Duration
              </span>
              <p className="text-sm font-semibold text-[#021422]">
                {Math.ceil((new Date(task.dueDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Assigned Crews
                </span>
              </div>
              <p className="font-semibold text-[#021422]">
                {(task.crews?.length || 1)} crew{(task.crews?.length || 1) > 1 ? "s" : ""} assigned
              </p>
            </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Progress
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#007AFF] rounded-full"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[#021422]">
                      {task.progress}%
                    </span>
                  </div>
                </div>
              </div>

{/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                Description
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Task Authoring */}
          {(task.createdBy || task.approvedBy) && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                Task Approval
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  {task.createdBy && (
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-[#021422] flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Created By</p>
                        <p className="text-sm font-semibold text-[#021422]">{task.createdBy}</p>
                        {task.createdAt && (
                          <p className="text-[10px] text-gray-400">on {formatDate(task.createdAt.split("T")[0])}</p>
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
                        <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">Approved By</p>
                        <p className="text-sm font-semibold text-[#021422]">{task.approvedBy}</p>
                        {task.approvedAt && (
                          <p className="text-[10px] text-gray-400">on {formatDate(task.approvedAt.split("T")[0])}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

          {activeTab === "crew" && (
            <div className="p-6">
              <CrewPanel task={task} />
            </div>
          )}

{activeTab === "tracker" && (
  <ReadOnlyTaskTracker
    taskTracker={task.taskTracker}
    taskId={task.id}
    projectUuid={projectUuid ?? ""}
    onUpdate={(tracker) => onUpdate?.(task.id, { taskTracker: tracker })}
    onProgressChange={handleChecklistProgressChange}
    trackerCreatedBy={task.trackerCreatedBy}
    trackerApprovedBy={task.trackerApprovedBy}
  />
)}

          {activeTab === "subtasks" && (
            <SubtasksTab
              task={task}
              allCrews={crews}
              onCreateSubtask={onCreateSubtask ? (payload) => onCreateSubtask(task.id, payload) : undefined}
              onApproveSubtask={onApproveSubtask}
              onRejectSubtask={onRejectSubtask}
              onUpdateSubtask={onUpdateSubtask}
            />
          )}

          {activeTab === "testing" && <CrewTestingPanel task={task} />}

          {activeTab === "instructions" && (
            <InstructionsTab
              documents={task.instructions?.documents || []}
              taskId={task.id}
            />
          )}

          {activeTab === "resources" && (
            <CrewResourcesTab task={task} />
          )}

          {/* Activity tab temporarily disabled — to be re-added later
          {activeTab === "activity" && projectUuid && (
            <div className="p-6">
              <ActivityFeedTab projectUuid={projectUuid} taskId={task.id} />
            </div>
          )} */}

          {activeTab === "communications" && (
            <CommunicationsTab
              projectId={projectUuid ?? ""}
              taskId={task.id}
            />
          )}

          {activeTab === "progress" && (
            <ProgressTab
              task={task}
              onUpdate={(taskId, updates) => onUpdate?.(taskId, updates)}
            />
          )}
        </div>
      </div>

      <UpdateQueueStatusModal
        isOpen={showQueueStatusModal}
        onClose={() => setShowQueueStatusModal(false)}
        task={task}
        onSave={(taskId, updates) => {
          onUpdate?.(taskId, updates);
          setShowQueueStatusModal(false);
        }}
      />
    </div>
  );
};

export default CrewTaskDetailDrawer;
