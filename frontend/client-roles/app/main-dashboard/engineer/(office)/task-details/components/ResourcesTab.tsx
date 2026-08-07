"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Truck, Wrench, Users, Package, Shield, Clock, CheckCircle2, XCircle, User } from "lucide-react";
import type { TaskResources, Task, SubtaskRequest } from "../types";
import SubtaskCard from "./SubtaskCard";
import RejectReasonModal from "./RejectReasonModal";
import { useDailyWorkerLogs } from "@/store/dailyWorkerLogStore";
import moment from "moment";

interface ResourcesTabProps {
  resources?: TaskResources;
  task?: Task;
  taskId: string;
  crews?: {
    id: string;
    name: string;
    trade: string;
    size: number;
    workers: { id: string; name: string; trade: string; avatarUrl: string; phone?: string }[];
  }[];
  onUpdate?: (taskId: string, updates: Partial<{ resources: TaskResources }>) => void;
  onApproveSubtask?: (subtaskId: string) => void;
  onRejectSubtask?: (subtaskId: string, reason: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  delivered: "Delivered",
  in_transit: "In Transit",
  pending: "Pending",
  low_stock: "Low Stock",
  on_site: "On Site",
  off_site: "Off Site",
  maintenance: "Maintenance",
  reserved: "Reserved",
  present: "Present",
  absent: "Absent",
  late: "Late",
};

const STATUS_COLORS: Record<string, string> = {
  delivered: "bg-green-100 text-green-700",
  in_transit: "bg-orange-100 text-orange-700",
  pending: "bg-gray-100 text-gray-600",
  low_stock: "bg-red-100 text-red-700",
  on_site: "bg-green-100 text-green-700",
  off_site: "bg-gray-100 text-gray-600",
  maintenance: "bg-yellow-100 text-yellow-700",
  reserved: "bg-blue-100 text-blue-700",
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-yellow-100 text-yellow-700",
};

export default function ResourcesTab({
  resources,
  task,
  taskId,
  crews,
  onUpdate,
  onApproveSubtask,
  onRejectSubtask,
}: ResourcesTabProps) {
  const [openSection, setOpenSection] = useState<string | null>("materials");
  const [openCrews, setOpenCrews] = useState<Set<string>>(new Set(crews?.map((c) => c.id) ?? []));
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingSubtaskId, setRejectingSubtaskId] = useState<string | null>(null);
  const [rejectingWorkerLog, setRejectingWorkerLog] = useState<{ scheduleId: string; date: string } | null>(null);

  const { getTaskPendingLogs, getTaskCrewWorkerDays, approveWorkerChange, rejectWorkerChange } = useDailyWorkerLogs();

const materials = resources?.materials || [];
	const equipment = resources?.equipment || [];
	const ppe = resources?.ppe || [];

  // Get resource and crew subtasks
  const resourceSubtasks =
    task?.subtasks?.filter((s) => {
      const types = Array.isArray(s.type) ? s.type : [s.type];
      return (types.includes("additional_resources") || types.includes("additional_crew")) && s.status !== "rejected";
    }) ?? [];
  const pendingResourceSubtasks = resourceSubtasks.filter((s) => s.status === "pending");
  const approvedResourceSubtasks = resourceSubtasks.filter((s) => s.status === "approved");

  // Get pending worker change requests
  const pendingWorkerLogs = getTaskPendingLogs(taskId);

  // Get crew worker-days for display
  const crewWorkerDays = getTaskCrewWorkerDays(taskId);

  const handleApproveSubtask = (subtaskId: string) => {
    onApproveSubtask?.(subtaskId);
  };

  const handleRejectSubtask = (subtaskId: string) => {
    setRejectingSubtaskId(subtaskId);
    setRejectingWorkerLog(null);
    setShowRejectModal(true);
  };

  const handleRejectWorkerLog = (scheduleId: string, date: string) => {
    setRejectingWorkerLog({ scheduleId, date });
    setRejectingSubtaskId(null);
    setShowRejectModal(true);
  };

  const handleConfirmReject = (reason: string) => {
    if (rejectingSubtaskId) {
      onRejectSubtask?.(rejectingSubtaskId, reason);
    }
    if (rejectingWorkerLog) {
      rejectWorkerChange(rejectingWorkerLog.scheduleId, rejectingWorkerLog.date, "Project Engineer", reason);
    }
    setRejectingSubtaskId(null);
    setRejectingWorkerLog(null);
  };

  const toggle = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const toggleCrew = (crewId: string) => {
    setOpenCrews((prev) => {
      const next = new Set(prev);
      if (next.has(crewId)) {
        next.delete(crewId);
      } else {
        next.add(crewId);
      }
      return next;
    });
  };

  if (!resources) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Wrench size={48} className="mb-4" />
        <p className="text-sm font-semibold">No resources tracked for this task</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-[#021422] uppercase tracking-wider">
        Task Resources
      </h4>

      {/* Resources Authoring Section */}
{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(task as any)?.resourcesCreatedBy || (task as any)?.resourcesApprovedBy ? (
        <div className="bg-gray-50 rounded-xl p-4">
          <h5 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
            Resources Authoring
          </h5>
          <div className="grid grid-cols-2 gap-4">
{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(task as any)?.resourcesCreatedBy && (
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-[#021422] flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Created By
                  </p>
                  <p className="text-sm font-semibold text-[#021422]">
{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(task as any)?.resourcesCreatedBy}
                  </p>
                </div>
              </div>
            )}
{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(task as any)?.resourcesApprovedBy && (
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-green-200">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">
                    Approved By
                  </p>
                  <p className="text-sm font-semibold text-[#021422]">
{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(task as any)?.resourcesApprovedBy}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {/* Materials */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggle("materials")}
            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-[#007AFF]" />
              <span className="text-sm font-bold text-[#021422]">Materials ({materials.length})</span>
            </div>
            {openSection === "materials" ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {openSection === "materials" && (
            <div className="p-4 space-y-2">
              {materials.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No materials listed</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-bold uppercase text-gray-500 border-b border-gray-100">
                      <th className="text-left pb-2 font-medium">Material</th>
                      <th className="text-left pb-2 font-medium">Qty</th>
                      <th className="text-left pb-2 font-medium">Status</th>
                      <th className="text-left pb-2 font-medium hidden md:table-cell">ETA / Carrier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {materials.map((mat) => (
                      <tr key={mat.id} className="align-top">
                        <td className="py-2.5 font-medium text-[#021422]">{mat.name}</td>
                        <td className="py-2.5 text-gray-600">{mat.quantity} {mat.unit}</td>
                        <td className="py-2.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[mat.status] || "bg-gray-100 text-gray-600"}`}>
                            {mat.status === "in_transit" && <Truck size={10} />}
                            {STATUS_LABELS[mat.status] || mat.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-500 text-xs hidden md:table-cell">
                          {mat.eta && <span>{mat.eta}</span>}
                          {mat.carrier && <span className="block text-gray-400">{mat.carrier}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Equipment */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggle("equipment")}
            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Wrench size={16} className="text-[#007AFF]" />
              <span className="text-sm font-bold text-[#021422]">Equipment ({equipment.length})</span>
            </div>
            {openSection === "equipment" ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {openSection === "equipment" && (
            <div className="p-4 space-y-2">
              {equipment.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No equipment listed</p>
              ) : (
                <div className="space-y-2">
                  {equipment.map((eq) => (
                    <div key={eq.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-[#021422]/10 flex items-center justify-center shrink-0">
                        <Wrench size={14} className="text-[#021422]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#021422]">{eq.name}</p>
                        <p className="text-xs text-gray-400">
                          {eq.location && `at ${eq.location}`}
                          {eq.operator && ` - ${eq.operator}`}
                        </p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[eq.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[eq.status] || eq.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
</div>
				)}
			</div>

			{/* PPE */}
			<div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
				<button
					onClick={() => toggle("ppe")}
					className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
				>
					<div className="flex items-center gap-2">
						<Shield size={16} className="text-[#007AFF]" />
						<span className="text-sm font-bold text-[#021422]">PPE ({ppe.length})</span>
					</div>
					{openSection === "ppe" ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
				</button>
				{openSection === "ppe" && (
					<div className="p-4 space-y-2">
						{ppe.length === 0 ? (
							<p className="text-sm text-gray-400 text-center py-4">No PPE listed</p>
						) : (
							<div className="space-y-2">
								{ppe.map((item) => (
									<div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
										<div className="w-8 h-8 rounded-lg bg-[#021422]/10 flex items-center justify-center shrink-0">
											<Shield size={14} className="text-[#021422]" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-semibold text-sm text-[#021422]">{item.name}</p>
											<p className="text-xs text-gray-400">
												{item.quantity && `${item.quantity} ${item.unit || 'pcs'}`}
												{item.size && ` � Size: ${item.size}`}
											</p>
										</div>
										<span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[item.status] || "bg-gray-100 text-gray-600"}`}>
											{STATUS_LABELS[item.status] || item.status}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Manpower */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggle("manpower")}
            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#007AFF]" />
              <span className="text-sm font-bold text-[#021422]">
                Manpower ({crews?.length ?? 0} {crews?.length === 1 ? "crew" : "crews"})
              </span>
            </div>
            {openSection === "manpower" ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>

          {openSection === "manpower" && (
            <div className="divide-y divide-gray-100">
              {!crews || crews.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6 px-4">No crews assigned</p>
              ) : (
                crews.map((crew) => {
                  const isOpen = openCrews.has(crew.id);
                  const crewData = crewWorkerDays.find((c) => c.crewName === crew.name);
                  const days = crewData?.days || 0;
                  const planned = crew.size * days;
                  const actual = crewData?.actualWorkerDays || planned;
                  const extra = Math.max(0, actual - planned);
                  return (
                    <div key={crew.id}>
                      <button
                        onClick={() => toggleCrew(crew.id)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#021422] flex items-center justify-center shrink-0">
                            <span className="text-white text-[10px] font-bold uppercase">
                              {crew.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-[#021422]">{crew.name}</p>
                            <p className="text-xs text-gray-400">{crew.trade}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">
                            {actual}/{planned} worker-days
                            {extra > 0 && (
                              <span className="text-orange-600 ml-1">(+{extra})</span>
                            )}
                          </span>
                          {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-3 space-y-1">
                          {crew.workers.map((worker) => (
                            <div key={worker.id} className="flex items-center gap-3 py-2 pl-2">
                              <img
                                src={worker.avatarUrl}
                                alt={worker.name}
                                className="w-7 h-7 rounded-full object-cover shrink-0 bg-gray-100"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#021422] leading-tight">{worker.name}</p>
                                <p className="text-xs text-gray-400">{worker.trade}</p>
                              </div>
                              {worker.phone && (
                                <span className="text-xs text-gray-400 shrink-0">{worker.phone}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Worker Change Requests */}
        {pendingWorkerLogs.length > 0 && (
          <div className="mt-6 bg-yellow-50 rounded-xl border border-yellow-200 overflow-hidden">
            <div className="px-4 py-3 bg-yellow-100 border-b border-yellow-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-yellow-700" />
                <span className="text-sm font-bold text-yellow-800">Worker Change Requests</span>
              </div>
              <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold">
                {pendingWorkerLogs.length} pending
              </span>
            </div>
            <div className="p-4 space-y-2">
              {pendingWorkerLogs.map(({ scheduleId, crewName, log }) => (
                <div key={`${scheduleId}-${log.date}`} className="bg-white border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{crewName}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {moment(log.date).format("ddd, MMM D")}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {log.workerIds.length} ? {log.pendingWorkerIds?.length || log.workerIds.length} workers
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveWorkerChange(scheduleId, log.date, "Project Engineer")}
                        className="px-3 py-1.5 bg-green-600 text-white rounded text-[10px] font-bold hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectWorkerLog(scheduleId, log.date)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded text-[10px] font-bold hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subtasks Section - At the bottom */}
        {resourceSubtasks.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-[#021422] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={16} />
                <span className="text-sm font-bold">Subtask Resource Requests</span>
              </div>
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                {pendingResourceSubtasks.length} pending
              </span>
            </div>

            <div className="p-4 space-y-3">
              {/* Pending Subtasks */}
              {pendingResourceSubtasks.map((subtask) => (
                <SubtaskCard
                  key={subtask.id}
                  subtask={subtask}
                  showActions={true}
                  onApprove={() => handleApproveSubtask(subtask.id)}
                  onReject={() => handleRejectSubtask(subtask.id)}
                />
              ))}

              {/* Approved Subtasks (Read-only) */}
              {approvedResourceSubtasks.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
                    Approved Resources
                  </p>
                  {approvedResourceSubtasks.map((subtask) => (
                    <SubtaskCard
                      key={subtask.id}
                      subtask={subtask}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectingSubtaskId(null);
        }}
        onConfirm={handleConfirmReject}
        title="Reject Subtask"
      />
    </div>
  );
}