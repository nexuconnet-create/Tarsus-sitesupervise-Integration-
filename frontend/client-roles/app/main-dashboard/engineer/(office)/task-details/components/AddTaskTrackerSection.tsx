"use client";

import { useState, useRef } from "react";
import { ChevronDown, Plus, X, GripVertical } from "lucide-react";
import type { TaskType, ChecklistItem } from "../types";
import { TASK_TYPE_LABELS, CHECKLIST_TEMPLATES } from "../types";

interface AddTaskTrackerSectionProps {
  taskTracker: { taskType: TaskType; items: ChecklistItem[] } | undefined;
  onChange: (tracker: { taskType: TaskType; items: ChecklistItem[] }) => void;
}

const TASK_TYPES: TaskType[] = [
  "concrete",
  "steel",
  "earthwork",
  "finishing",
  "mep",
  "electrical",
  "safety",
  "general",
];

export default function AddTaskTrackerSection({
  taskTracker,
  onChange,
}: AddTaskTrackerSectionProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customItemText, setCustomItemText] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  const selectedType = taskTracker?.taskType || "general";
  const items = taskTracker?.items || [];

  const handleTypeSelect = (type: TaskType) => {
    const templateItems = CHECKLIST_TEMPLATES[type];
    const newItems: ChecklistItem[] = templateItems.map((desc, idx) => ({
      id: `template-${idx}`,
      description: desc,
      enabled: true,
      checked: false,
    }));
    onChange({ taskType: type, items: newItems });
    setIsDropdownOpen(false);
  };

  const toggleItem = (itemId: string) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, enabled: !item.enabled } : item
    );
    onChange({ taskType: selectedType, items: updatedItems });
  };

  const removeItem = (itemId: string) => {
    const updatedItems = items.filter((item) => item.id !== itemId);
    onChange({ taskType: selectedType, items: updatedItems });
  };

  const addCustomItem = () => {
    if (!customItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      description: customItemText.trim(),
      enabled: true,
      checked: false,
    };
    onChange({ taskType: selectedType, items: [...items, newItem] });
    setCustomItemText("");
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndexRef.current = index;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null || dragOverIndexRef.current === null) return;
    if (draggedIndex === dragOverIndexRef.current) {
      setDraggedIndex(null);
      return;
    }
    const updatedItems = [...items];
    const [draggedItem] = updatedItems.splice(draggedIndex, 1);
    updatedItems.splice(dragOverIndexRef.current, 0, draggedItem);
    onChange({ taskType: selectedType, items: updatedItems });
    setDraggedIndex(null);
    dragOverIndexRef.current = null;
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    dragOverIndexRef.current = null;
  };

  return (
    <div className="space-y-6">
      {/* Task Type Selection */}
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
          Task Type
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-[#021422] hover:bg-gray-50 transition-colors"
          >
            <span>{TASK_TYPE_LABELS[selectedType]}</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {TASK_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeSelect(type)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                    type === selectedType ? "bg-blue-50" : ""
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      type === selectedType ? "bg-[#007AFF]" : "bg-gray-300"
                    }`}
                  />
                  {TASK_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checklist Items */}
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
          Checklist Items
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Drag to reorder. Toggle items on/off to include in task tracking.
        </p>
        <div className="space-y-1">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                draggedIndex === index
                  ? "opacity-50 border-[#007AFF] bg-blue-50"
                  : item.enabled
                  ? "bg-white border-gray-200 hover:border-gray-300"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              {/* Step Label */}
              <div className="text-[10px] font-bold text-gray-500 uppercase shrink-0 min-w-[40px]">
                Step {index + 1}
              </div>

              {/* Drag Handle */}
              <div className="text-gray-400 hover:text-gray-600 shrink-0 cursor-grab">
                <GripVertical size={16} />
              </div>

              {/* Description */}
              <span
                className={`flex-1 text-sm ${
                  item.enabled ? "text-[#021422]" : "text-gray-500 line-through"
                }`}
              >
                {item.description}
              </span>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                  item.enabled ? "bg-[#021422]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    item.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-1 text-gray-400 hover:text-red-500 shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border border-gray-200">
              No checklist items. Select a task type above to load template items.
            </div>
          )}
        </div>
      </div>

      {/* Add Custom Item */}
      <div>
        <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
          Add Custom Item
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customItemText}
            onChange={(e) => setCustomItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomItem();
              }
            }}
            placeholder="Enter custom checklist item..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
          />
          <button
            type="button"
            onClick={addCustomItem}
            disabled={!customItemText.trim()}
            className="px-4 py-2 bg-[#021422] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

