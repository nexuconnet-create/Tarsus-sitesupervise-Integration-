"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, User, Calendar, FileText, Package, Users, CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react";
import type { SubtaskRequest, SubtaskStatus } from "../types";
import { SUBTASK_STATUS_CONFIG, SUBTASK_TYPE_LABELS } from "../types";

interface SubtaskCardProps {
  subtask: SubtaskRequest;
  onApprove?: (subtaskId: string) => void;
  onReject?: (subtaskId: string, reason: string) => void;
  showActions?: boolean;
}

export default function SubtaskCard({ subtask, onApprove, onReject }: SubtaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const statusConfig = SUBTASK_STATUS_CONFIG[subtask.status];
  const types = Array.isArray(subtask.type) ? subtask.type : [subtask.type];
  const typeLabels = types.map((t) => SUBTASK_TYPE_LABELS[t]).join(", ");

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject?.(subtask.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason("");
    }
  };

  const hasResources = subtask.materials?.length || subtask.equipment?.length || subtask.ppe?.length;
  const hasCrew = subtask.additionalCrews?.length || subtask.additionalWorkers?.length;
  const hasTimeline = subtask.newStartDate || subtask.newDueDate;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                      {statusConfig.label}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {typeLabels}
                      </span>
                    </div>
            <h3 className="text-sm font-bold text-[#021422]">{subtask.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{subtask.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {subtask.status === "pending" && (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove?.(subtask.id);
                  }}
                  className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  title="Approve"
                >
                  <CheckCircle size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRejectModal(true);
                  }}
                  className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  title="Reject"
                >
                  <XCircle size={14} />
                </button>
              </div>
            )}
            <button className="p-1 text-gray-400 hover:text-gray-600">
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Meta info row */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <User size={12} />
            {subtask.requestedBy}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {new Date(subtask.requestedAt).toLocaleDateString()}
          </span>
          {subtask.status === "approved" && subtask.approvedBy && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle size={12} />
              Approved by {subtask.approvedBy}
            </span>
          )}
          {subtask.status === "rejected" && subtask.approvedBy && (
            <span className="flex items-center gap-1 text-red-600">
              <XCircle size={12} />
              Rejected by {subtask.approvedBy}
            </span>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          {/* Full Description */}
          <div className="mb-4">
            <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
              Description
            </h4>
            <p className="text-sm text-gray-700">{subtask.description}</p>
          </div>

          {/* Resources Section */}
          {hasResources && (
            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 flex items-center gap-1">
                <Package size={12} />
                Resources
              </h4>
              <div className="space-y-2">
                {subtask.materials && subtask.materials.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-bold text-gray-700 mb-2">Materials</p>
                    <div className="space-y-1">
                      {subtask.materials.map((material) => (
                        <div key={material.id} className="flex items-center justify-between text-xs">
                          <span>{material.name}</span>
                          <span className="text-gray-500">{material.quantity} {material.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
{subtask.equipment && subtask.equipment.length > 0 && (
									<div className="bg-gray-50 rounded-lg p-3">
										<p className="text-xs font-bold text-gray-700 mb-2">Equipment</p>
										<div className="space-y-1">
											{subtask.equipment.map((equipment) => (
												<div key={equipment.id} className="flex items-center justify-between text-xs">
													<span>{equipment.name}</span>
													<span className={`px-1.5 py-0.5 rounded text-xs ${
														equipment.status === "on_site" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
													}`}>
														{equipment.status}
													</span>
												</div>
											))}
										</div>
									</div>
								)}
								{subtask.ppe && subtask.ppe.length > 0 && (
									<div className="bg-gray-50 rounded-lg p-3">
										<p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
											<Shield size={10} />
											PPE
										</p>
										<div className="space-y-1">
											{subtask.ppe.map((item) => (
												<div key={item.id} className="flex items-center justify-between text-xs">
													<span>{item.name}</span>
													<span className="text-gray-500">
														{item.quantity} {item.unit || 'pcs'}
														{item.size && ` • ${item.size}`}
													</span>
												</div>
											))}
										</div>
									</div>
								)}
              </div>
            </div>
          )}

          {/* Crew Section */}
          {hasCrew && (
            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 flex items-center gap-1">
                <Users size={12} />
                Additional Crew
              </h4>
              <div className="space-y-2">
                {subtask.additionalCrews && subtask.additionalCrews.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {subtask.additionalCrews.map((crew) => (
                      <span key={crew.id} className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {crew.name} ({crew.trade})
                      </span>
                    ))}
                  </div>
                )}
                {subtask.additionalWorkers && subtask.additionalWorkers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {subtask.additionalWorkers.map((worker) => (
                      <span key={worker.id} className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {worker.name} - {worker.trade}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline Section */}
          {hasTimeline && (
            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 flex items-center gap-1">
                <Calendar size={12} />
                Timeline Changes
              </h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
                {subtask.newStartDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">New Start Date:</span>
                    <span className="font-medium">{subtask.newStartDate}</span>
                  </div>
                )}
                {subtask.newDueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">New Finish Date:</span>
                    <span className="font-medium">{subtask.newDueDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {subtask.notes && (
            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 flex items-center gap-1">
                <FileText size={12} />
                Notes
              </h4>
              <p className="text-sm text-gray-700">{subtask.notes}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {subtask.status === "rejected" && subtask.rejectionReason && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-red-500 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-700">Rejection Reason:</p>
                  <p className="text-xs text-red-600 mt-1">{subtask.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[#021422] mb-4">Reject Subtask</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this subtask.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none mb-4"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
