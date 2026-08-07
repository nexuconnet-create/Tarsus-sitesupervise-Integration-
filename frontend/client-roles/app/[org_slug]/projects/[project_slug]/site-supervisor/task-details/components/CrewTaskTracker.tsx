"use client";

import { useState, useRef } from "react";
import {
  CheckCircle2,
  Circle,
  Pencil,
  Plus,
  Trash2,
  Send,
  X,
  Clock,
  AlertCircle,
  GripVertical,
} from "lucide-react";
import type {
  TaskTracker,
  ChecklistItem,
  Task,
  ChecklistChange,
} from "../types";
import { TASK_TYPE_LABELS } from "../types";
import toast from "react-hot-toast";
import { taskService } from "@/lib/services/taskService";
import { getErrorMessage } from "@/lib/error";

interface CrewTaskTrackerProps {
  taskTracker?: TaskTracker;
  taskId?: string;
  projectUuid?: string;
  onUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onSubmitChanges?: (taskId: string, changes: ChecklistChange[]) => void;
}

const CrewTaskTracker = ({
  taskTracker,
  taskId,
  projectUuid,
  onUpdate,
  onSubmitChanges,
}: CrewTaskTrackerProps) => {
  const [localItems, setLocalItems] = useState<ChecklistItem[]>(() => taskTracker?.items ?? []);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  const hasPendingChanges =
    taskTracker?.pendingChanges && taskTracker.pendingChanges.length > 0;

  if (!taskTracker || !taskTracker.items || taskTracker.items.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={28} className="text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-600 mb-1">
          No Task Tracker
        </h3>
        <p className="text-xs text-gray-400">
          This task does not have a checklist configured
        </p>
      </div>
    );
  }

  // Use local items if available, otherwise use props
  const items = localItems.length > 0 ? localItems : taskTracker.items;
  const completedCount = items.filter((item) => item.checked).length;
  const totalCount = items.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  const handleToggleItem = (itemId: string) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );

    // Optimistic local update
    setLocalItems(updatedItems);

    // Update parent if onUpdate is provided
    if (onUpdate && taskId) {
      const updatedTaskTracker: TaskTracker = {
        ...taskTracker,
        items: updatedItems,
        completedAt: updatedItems.every((item) => item.checked)
          ? new Date().toISOString()
          : undefined,
      };

      onUpdate(taskId, { taskTracker: updatedTaskTracker });
    }

    // Persist to DB
    if (projectUuid && taskId) {
      taskService
        .toggleChecklistItem(projectUuid, taskId, itemId)
        .then(() => {
          // Compute new progress after successful toggle
          const enabled = updatedItems.filter((i) => i.enabled !== false);
          const checked = enabled.filter((i) => i.checked).length;
          const newProgress = enabled.length > 0
            ? Math.round((checked / enabled.length) * 100)
            : 0;
          if (onUpdate && taskId) {
            onUpdate(taskId, { progress: newProgress });
          }
        })
        .catch((err) => {
          // Roll back the optimistic update on failure
          setLocalItems(items);
          if (onUpdate && taskId) {
            const rollbackTracker: TaskTracker = {
              ...taskTracker,
              items,
            };
            onUpdate(taskId, { taskTracker: rollbackTracker });
          }
          toast.error(getErrorMessage(err));
        });
    }

    // Show toast for completion
    const toggledItem = updatedItems.find((item) => item.id === itemId);
    if (toggledItem?.checked) {
      toast.success(`Item completed: ${toggledItem.description}`);
    }

    // Show toast when all items are completed
    if (updatedItems.every((item) => item.checked)) {
      toast.success("All checklist items completed!");
    }
  };

  const handleStartEditing = () => {
    setEditedItems([...items]);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setEditedItems([]);
    setNewItemText("");
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

  const handleSubmitChanges = () => {
    if (!taskId || !onSubmitChanges) return;

    const originalItems = taskTracker.items;
    const changes: ChecklistChange[] = [];
    const now = new Date().toISOString();

    // Find added items (items in editedItems not in originalItems)
    for (const item of editedItems) {
      const exists = originalItems.some((orig) => orig.id === item.id);
      if (!exists) {
        changes.push({
          id: `change-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          changeType: "added",
          item,
          requestedBy: "Current User",
          requestedAt: now,
          status: "pending",
        });
      }
    }

    // Find removed items (items in originalItems not in editedItems)
    for (const origItem of originalItems) {
      const stillExists = editedItems.some((item) => item.id === origItem.id);
      if (!stillExists) {
        changes.push({
          id: `change-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          changeType: "removed",
          item: origItem,
          requestedBy: "Current User",
          requestedAt: now,
          status: "pending",
        });
      }
    }

    if (changes.length === 0) {
      toast("No changes detected");
      handleCancelEditing();
      return;
    }

    onSubmitChanges(taskId, changes);
    handleCancelEditing();
    toast.success("Changes submitted for approval!");
  };

  // Build display items: if pending changes exist, show the proposed state
  const getDisplayItems = () => {
    if (!hasPendingChanges) return items;

    let displayItems = [...items];
    for (const change of taskTracker.pendingChanges!) {
      if (change.status !== "pending") continue;
      if (change.changeType === "added") {
        displayItems.push({ ...change.item, _isPendingAdd: true } as ChecklistItem & { _isPendingAdd?: boolean });
      } else if (change.changeType === "removed") {
        displayItems = displayItems.map((item) =>
          item.id === change.item.id
            ? ({ ...item, _isPendingRemove: true } as ChecklistItem & { _isPendingRemove?: boolean })
            : item
        );
      }
    }
    return displayItems;
  };

  const displayItems = isEditing
    ? editedItems
    : (getDisplayItems() as ChecklistItem[]);

  const pendingAddCount =
    taskTracker.pendingChanges?.filter(
      (c) => c.status === "pending" && c.changeType === "added"
    ).length || 0;
  const pendingRemoveCount =
    taskTracker.pendingChanges?.filter(
      (c) => c.status === "pending" && c.changeType === "removed"
    ).length || 0;

  return (
    <div className="p-6">
      {/* Pending Changes Banner */}
      {hasPendingChanges && !isEditing && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock size={18} className="text-yellow-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800">
                Pending Approval
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {pendingAddCount > 0 && `${pendingAddCount} item(s) to add`}
                {pendingAddCount > 0 && pendingRemoveCount > 0 && ", "}
                {pendingRemoveCount > 0 &&
                  `${pendingRemoveCount} item(s) to remove`}
                . Waiting for site engineer approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-[#021422]">
              {TASK_TYPE_LABELS[taskTracker.taskType] || "Task"} Checklist
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {completedCount} of {totalCount} items completed
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-bold text-[#021422]">
                {progressPercentage}%
              </span>
            </div>
            {!isEditing && !hasPendingChanges && (
              <button
                onClick={handleStartEditing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-[#0a2a3c] transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Edit mode action bar */}
      {isEditing && (
        <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-gray-500" />
              <span className="text-sm font-semibold text-[#021422]">
                Editing Checklist
              </span>
              <span className="text-xs text-gray-500">
                Drag to reorder, add or remove items, then submit for approval
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
                onClick={handleSubmitChanges}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-[#0a2a3c] transition-colors"
              >
                <Send size={14} />
                Submit Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Items */}
      <div className="space-y-2">
        {displayItems.map((item, index) => {
          const isPendingAdd = (item as ChecklistItem & { _isPendingAdd?: boolean })._isPendingAdd;
          const isPendingRemove = (item as ChecklistItem & { _isPendingRemove?: boolean })._isPendingRemove;

          return (
            <div
              key={item.id}
              draggable={isEditing}
              onDragStart={isEditing ? () => handleDragStart(index) : undefined}
              onDragOver={isEditing ? (e) => handleDragOver(e, index) : undefined}
              onDrop={isEditing ? handleDrop : undefined}
              onDragEnd={isEditing ? handleDragEnd : undefined}
              className={`p-4 border rounded-lg transition-all ${
                isEditing
                  ? "cursor-grab active:cursor-grabbing"
                  : !isPendingRemove
                  ? "cursor-pointer"
                  : ""
              } ${
                isEditing && draggedIndex === index
                  ? "opacity-50 border-gray-400 bg-gray-50"
                  : isPendingAdd
                  ? "bg-green-50 border-green-300 border-dashed"
                  : isPendingRemove
                  ? "bg-red-50 border-red-300 border-dashed line-through opacity-60"
                  : item.checked
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-gray-200 hover:border-gray-300"
              } ${!item.enabled ? "opacity-50" : ""}`}
              onClick={() =>
                !isEditing &&
                !isPendingRemove &&
                item.enabled &&
                handleToggleItem(item.id)
              }
            >
              <div className="flex items-start gap-3">
                {/* Drag Handle (edit mode) */}
                {isEditing && (
                  <div className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5 cursor-grab">
                    <GripVertical size={16} />
                  </div>
                )}

                {/* Step Label */}
                <div className="text-[10px] font-bold text-gray-400 uppercase shrink-0 mt-0.5 min-w-[32px]">
                  {index + 1}
                </div>

                {/* Checkbox */}
                {!isEditing && (
                  <div
                    className="flex-shrink-0 mt-0.5 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isPendingRemove && item.enabled) {
                        handleToggleItem(item.id);
                      }
                    }}
                  >
                    {item.checked ? (
                      <CheckCircle2
                        size={20}
                        className="text-green-500"
                      />
                    ) : (
                      <Circle
                        size={20}
                        className="text-gray-300 hover:text-gray-400"
                      />
                    )}
                  </div>
                )}

                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      isPendingAdd
                        ? "text-green-700"
                        : isPendingRemove
                        ? "text-red-500 line-through"
                        : item.checked
                        ? "text-green-700"
                        : "text-[#021422]"
                    }`}
                  >
                    {item.description}
                  </p>

                  {isPendingAdd && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-semibold">
                      Pending Add
                    </span>
                  )}
                  {isPendingRemove && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded font-semibold">
                      Pending Remove
                    </span>
                  )}

                  {item.notes && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Note: {item.notes}
                    </p>
                  )}

                  {!item.enabled && !isPendingRemove && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                      Not applicable
                    </span>
                  )}
                </div>

                {/* Remove button in edit mode */}
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
            </div>
          );
        })}
      </div>

      {/* Add new item in edit mode */}
      {isEditing && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleAddItemKeyDown}
            placeholder="Type a new checklist item..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAddItem}
            disabled={!newItemText.trim()}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      )}

      {/* Summary footer */}
      {allCompleted && !isEditing && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Checklist completed on{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      )}

    </div>
  );
};

export default CrewTaskTracker;
