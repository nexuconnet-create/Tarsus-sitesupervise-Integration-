"use client";

import { useState, useRef } from "react";
import {
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Pencil,
  Trash2,
  X,
  GripVertical,
  AlertCircle,
  Send,
  User,
} from "lucide-react";
import type {
  TaskTracker as TaskTrackerType,
  ChecklistItem,
  ChecklistChange,
} from "../types";
import { TASK_TYPE_LABELS } from "../types";
import RejectReasonModal from "./RejectReasonModal";
import toast from "react-hot-toast";

interface ReadOnlyTaskTrackerProps {
  taskTracker: TaskTrackerType | undefined;
  onUpdate?: (tracker: TaskTrackerType) => void;
  onApproveChanges?: (taskId: string) => void;
  onRejectChanges?: (taskId: string, reason: string) => void;
  taskId?: string;
  trackerCreatedBy?: string;
  trackerApprovedBy?: string;
}

export default function ReadOnlyTaskTracker({
  taskTracker,
  onUpdate,
  onApproveChanges,
  onRejectChanges,
  taskId,
  trackerCreatedBy,
  trackerApprovedBy,
}: ReadOnlyTaskTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  if (!taskTracker) {
    return (
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="text-center text-gray-500">
          <p className="text-sm">
            No task tracker configured for this task.
          </p>
        </div>
      </div>
    );
  }

  {/* Tracker Authoring Section */}
  {trackerCreatedBy || trackerApprovedBy ? (
    <div className="bg-gray-50 rounded-xl p-4">
      <h5 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
        Tracker Authoring
      </h5>
      <div className="grid grid-cols-2 gap-4">
        {trackerCreatedBy && (
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-[#021422] flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Created By
              </p>
              <p className="text-sm font-semibold text-[#021422]">
                {trackerCreatedBy}
              </p>
            </div>
          </div>
        )}
        {trackerApprovedBy && (
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-green-200">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
              <CheckCircle size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">
                Approved By
              </p>
              <p className="text-sm font-semibold text-[#021422]">
                {trackerApprovedBy}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null}

  const { taskType, items, pendingChanges } = taskTracker;
  const enabledItems = items.filter((item) => item.enabled);
  const checkedCount = enabledItems.filter((item) => item.checked).length;
  const totalEnabled = enabledItems.length;
  const progressPercent =
    totalEnabled > 0
      ? Math.round((checkedCount / totalEnabled) * 100)
      : 0;

  const hasPendingChanges =
    pendingChanges && pendingChanges.some((c) => c.status === "pending");

  const pendingAddItems: ChecklistChange[] =
    pendingChanges?.filter(
      (c) => c.status === "pending" && c.changeType === "added"
    ) || [];

  const pendingRemoveItems: ChecklistChange[] =
    pendingChanges?.filter(
      (c) => c.status === "pending" && c.changeType === "removed"
    ) || [];

  const handleToggleItem = (itemId: string) => {
    if (!onUpdate) return;
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onUpdate({ ...taskTracker, items: updatedItems });
  };

  const handleApprove = () => {
    if (!onApproveChanges || !taskId) return;
    onApproveChanges(taskId);
  };

  const handleRejectConfirm = (reason: string) => {
    if (!onRejectChanges || !taskId) return;
    onRejectChanges(taskId, reason);
    setShowRejectModal(false);
  };

  // Edit mode handlers
  const handleStartEditing = () => {
    setEditedItems([...items]);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setEditedItems([]);
    setNewItemText("");
    setDraggedIndex(null);
    dragOverIndexRef.current = null;
    setIsEditing(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setEditedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: `new-${Date.now()}`,
      description: newItemText.trim(),
      checked: false,
      enabled: true,
    };
    setEditedItems((prev) => [...prev, newItem]);
    setNewItemText("");
  };

  const handleAddItemKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndexRef.current = index;
  };

  const handleDrop = () => {
    if (draggedIndex === null || dragOverIndexRef.current === null) return;
    if (draggedIndex === dragOverIndexRef.current) {
      setDraggedIndex(null);
      return;
    }
    const updatedItems = [...editedItems];
    const [draggedItem] = updatedItems.splice(draggedIndex, 1);
    updatedItems.splice(dragOverIndexRef.current, 0, draggedItem);
    setEditedItems(updatedItems);
    setDraggedIndex(null);
    dragOverIndexRef.current = null;
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    dragOverIndexRef.current = null;
  };

  const handleSaveChanges = () => {
    if (!onUpdate) return;
    onUpdate({ ...taskTracker, items: editedItems });
    handleCancelEditing();
    toast.success("Checklist updated");
  };

  return (
    <div className="space-y-4">
      {/* Pending Changes Banner */}
      {hasPendingChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle size={16} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-yellow-800">
                Checklist Changes Pending Approval
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {pendingAddItems.length > 0 &&
                  `${pendingAddItems.length} item(s) to add`}
                {pendingAddItems.length > 0 &&
                  pendingRemoveItems.length > 0 &&
                  ", "}
                {pendingRemoveItems.length > 0 &&
                  `${pendingRemoveItems.length} item(s) to remove`}
                . Review below and approve or reject.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Header */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-[#021422]">
              {TASK_TYPE_LABELS[taskType]} Checklist
            </h3>
            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">
              {checkedCount}/{totalEnabled} Complete
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && !hasPendingChanges && (
              <button
                onClick={handleStartEditing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-[#0a2a3c] transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              progressPercent === 100 ? "bg-green-600" : "bg-green-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {progressPercent}% Complete
          </span>
          {progressPercent === 100 && (
            <span className="text-xs font-bold text-green-600">
              All Complete
            </span>
          )}
        </div>
      </div>

      {/* Edit Mode Banner */}
      {isEditing && (
        <div className="p-3 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-gray-500" />
              <span className="text-sm font-semibold text-[#021422]">
                Editing Checklist
              </span>
              <span className="text-xs text-gray-500">
                Drag to reorder, add or remove items
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelEditing}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                <X size={14} />
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-[#0a2a3c] transition-colors"
              >
                <Send size={14} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-2">
          {/* Existing items */}
          {(isEditing ? editedItems : enabledItems).map((item, index) => {
            const isPendingRemove = !isEditing && pendingRemoveItems.some(
              (c) => c.item.id === item.id
            );

            return (
              <div
                key={item.id}
                draggable={isEditing}
                onDragStart={isEditing ? () => handleDragStart(index) : undefined}
                onDragOver={isEditing ? (e) => handleDragOver(e, index) : undefined}
                onDrop={isEditing ? handleDrop : undefined}
                onDragEnd={isEditing ? handleDragEnd : undefined}
                onClick={() => !isEditing && !isPendingRemove && handleToggleItem(item.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                  isEditing
                    ? "cursor-grab active:cursor-grabbing"
                    : !isPendingRemove
                    ? "cursor-pointer"
                    : ""
                } ${
                  isEditing && draggedIndex === index
                    ? "opacity-50 border-gray-400 bg-gray-50"
                    : isPendingRemove
                    ? "bg-red-50 border-red-300 border-dashed opacity-60"
                    : item.checked
                    ? "bg-green-50 border-green-300"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Drag Handle */}
                {isEditing && (
                  <div className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5 cursor-grab">
                    <GripVertical size={16} />
                  </div>
                )}

                {/* Step Number */}
                <div className="text-[10px] font-bold text-gray-400 uppercase shrink-0 mt-0.5 min-w-[32px]">
                  {index + 1}
                </div>

                {/* Checkbox (view mode) */}
                {!isEditing && (
                  <div className="mt-0.5 shrink-0">
                    {isPendingRemove ? (
                      <Minus size={20} className="text-red-500" />
                    ) : item.checked ? (
                      <CheckSquare size={20} className="text-green-600" />
                    ) : (
                      <Square size={20} className="text-gray-300" />
                    )}
                  </div>
                )}

                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isPendingRemove
                        ? "text-red-500 line-through"
                        : item.checked
                        ? "text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    {item.description}
                  </p>
                  {isPendingRemove && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded font-semibold">
                      Pending Removal
                    </span>
                  )}
                </div>

                {/* Remove button (edit mode) */}
                {isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(item.id);
                    }}
                    className="flex-shrink-0 mt-0.5 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}

          {/* Pending add items (visual diff) */}
          {!isEditing && pendingAddItems.map((change) => (
            <div
              key={change.id}
              className="flex items-start gap-3 p-4 rounded-xl border bg-green-50 border-green-300 border-dashed"
            >
              <div className="mt-0.5 shrink-0">
                <Plus size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700">
                  {change.item.description}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-semibold">
                  Pending Addition
                </span>
              </div>
            </div>
          ))}

          {enabledItems.length === 0 && pendingAddItems.length === 0 && !isEditing && (
            <p className="text-sm text-gray-400 text-center py-4">
              No enabled checklist items
            </p>
          )}

          {/* Add new item (edit mode) */}
          {isEditing && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={handleAddItemKeyDown}
                placeholder="Type a new checklist item..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
              <button
                onClick={handleAddItem}
                disabled={!newItemText.trim()}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-[#021422] text-white rounded-lg text-sm font-bold hover:bg-[#0a2a3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          )}
        </div>
      )}

      {/* Approve/Reject Buttons */}
      {hasPendingChanges && !isEditing && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleApprove}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
          >
            <CheckCircle size={16} />
            Approve Changes
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
          >
            <XCircle size={16} />
            Reject Changes
          </button>
        </div>
      )}

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectConfirm}
        title="Reject Checklist Changes"
      />
    </div>
  );
}
