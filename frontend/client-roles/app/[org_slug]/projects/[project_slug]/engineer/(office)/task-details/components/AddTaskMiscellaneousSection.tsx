"use client";

import { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import type { MiscellaneousItem, MiscCategory } from "../types";
import { MISC_CATEGORY_LABELS } from "../types";

interface AddTaskMiscellaneousSectionProps {
  items: MiscellaneousItem[];
  onChange: (items: MiscellaneousItem[]) => void;
}

const CATEGORY_OPTIONS: { value: MiscCategory; label: string }[] = [
  { value: "utility", label: "Utility" },
  { value: "transport", label: "Transport" },
  { value: "permit", label: "Permit" },
  { value: "levy", label: "Levy" },
  { value: "sundry", label: "Sundry" },
  { value: "other", label: "Other" },
];

const CATEGORY_COLORS: Record<MiscCategory, string> = {
  utility: "bg-blue-100 text-blue-700",
  transport: "bg-orange-100 text-orange-700",
  permit: "bg-purple-100 text-purple-700",
  levy: "bg-pink-100 text-pink-700",
  sundry: "bg-yellow-100 text-yellow-700",
  other: "bg-gray-100 text-gray-600",
};

export default function AddTaskMiscellaneousSection({
  items,
  onChange,
}: AddTaskMiscellaneousSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<MiscCategory>("other");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!name.trim()) {
      setError("Item name is required");
      return;
    }
    const parsedCost = parseFloat(cost);
    if (!cost || isNaN(parsedCost) || parsedCost < 0) {
      setError("Enter a valid cost (₦0 or more)");
      return;
    }

    const newItem: MiscellaneousItem = {
      id: `misc-${Date.now()}`,
      name: name.trim(),
      category,
      cost: parsedCost,
      notes: notes.trim() || undefined,
    };

    onChange([...items, newItem]);
    setName("");
    setCategory("other");
    setCost("");
    setNotes("");
    setError("");
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const total = items.reduce((sum, i) => sum + i.cost, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">
          Miscellaneous Costs
        </label>
        {items.length > 0 && (
          <span className="text-xs font-bold text-[#021422]">
            Total: ₦{total.toLocaleString()}
          </span>
        )}
      </div>

      {/* Item list */}
      {items.length > 0 && (
        <div className="space-y-2 mb-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${CATEGORY_COLORS[item.category]}`}
                >
                  {MISC_CATEGORY_LABELS[item.category]}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#021422] truncate">
                    {item.name}
                  </p>
                  {item.notes && (
                    <p className="text-[10px] text-gray-400 truncate">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className="text-sm font-bold text-[#021422]">
                  ₦{item.cost.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="e.g. NEPA Bill, Site Permit Fee"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MiscCategory)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                Cost (₦) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  ₦
                </span>
                <input
                  type="number"
                  min="0"
                  value={cost}
                  onChange={(e) => {
                    setCost(e.target.value);
                    setError("");
                  }}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                Description
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent bg-white"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} />
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 py-2 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-gray-900 transition-colors"
            >
              Add Miscellaneous
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setName("");
                setCost("");
                setNotes("");
                setError("");
                setCategory("other");
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#021422] hover:text-[#021422] transition-colors"
        >
          <Plus size={16} />
          Add Miscellaneous Cost
        </button>
      )}
    </div>
  );
}
