"use client";

import { useState } from "react";
import { Calendar, User, CheckCircle, XCircle, Clock } from "lucide-react";
import type { SubtaskRequest, SubtaskType } from "../types";
import { SUBTASK_STATUS_CONFIG, SUBTASK_TYPE_LABELS } from "../types";
import RejectReasonModal from "./RejectReasonModal";

interface TimelineExtensionCardProps {
  subtask: SubtaskRequest;
  onApprove?: (subtaskId: string) => void;
  onReject?: (subtaskId: string, reason: string) => void;
}

export default function TimelineExtensionCard({
  subtask,
  onApprove,
  onReject,
}: TimelineExtensionCardProps) {
  const statusConfig = SUBTASK_STATUS_CONFIG[subtask.status];
  const isPending = subtask.status === "pending";
  const [showRejectModal, setShowRejectModal] = useState(false);

  const types = Array.isArray(subtask.type) ? subtask.type : [subtask.type];

  const handleApprove = () => {
    if (onApprove) {
      onApprove(subtask.id);
    }
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h5 className="font-bold text-sm text-[#021422]">{subtask.title}</h5>
          <p className="text-xs text-gray-500 mt-0.5">{subtask.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {isPending && (
            <>
              <button
                onClick={handleApprove}
                className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                title="Approve"
              >
                <CheckCircle size={14} />
              </button>
              <button
                onClick={handleReject}
                className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                title="Reject"
              >
                <XCircle size={14} />
              </button>
            </>
          )}
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Type Badges */}
      {types.length > 1 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {types.map((type) => (
            <span
              key={type}
              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600"
            >
              {SUBTASK_TYPE_LABELS[type]}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        {subtask.newStartDate && (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase">New Start</p>
              <p className="text-xs font-medium text-[#021422]">{subtask.newStartDate}</p>
            </div>
          </div>
        )}
        {subtask.newDueDate && (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase">New Due</p>
              <p className="text-xs font-medium text-[#021422]">{subtask.newDueDate}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>Requested by {subtask.requestedBy}</span>
        </div>
        {subtask.approvedBy && (
          <div className="flex items-center gap-1 text-green-600">
            <User size={12} />
            <span>Approver: {subtask.approvedBy}</span>
          </div>
        )}
        {subtask.rejectedBy && (
          <div className="flex items-center gap-1 text-red-600">
            <User size={12} />
            <span>Rejected by {subtask.rejectedBy}</span>
          </div>
        )}
      </div>

      {subtask.notes && (
        <div className="mb-3 p-2 bg-white rounded-lg border border-gray-100">
          <p className="text-xs text-gray-600">{subtask.notes}</p>
        </div>
      )}

      {subtask.rejectionReason && (
        <div className="mb-3 p-2 bg-red-50 rounded-lg border border-red-100">
          <p className="text-xs text-red-600">Rejection Reason: {subtask.rejectionReason}</p>
        </div>
      )}

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={(reason) => onReject?.(subtask.id, reason)}
        title="Reject Timeline Extension"
      />
    </div>
  );
}
