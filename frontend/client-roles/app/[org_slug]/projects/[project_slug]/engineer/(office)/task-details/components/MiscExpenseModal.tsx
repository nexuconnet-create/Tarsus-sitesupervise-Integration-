"use client";

import { useState } from "react";
import { X, AlertCircle, Sparkles } from "lucide-react";
import type { MiscExpense, MiscExpenseInput, MiscCategoryKey } from "@/lib/types/miscExpense";
import {
  MISC_CATEGORIES,
  MISC_TEMPLATES,
  getSubCategories,
} from "@/lib/constants/miscExpense";
interface MilestoneLike {
  id: string;
  name: string;
}

interface MiscExpenseModalProps {
  onClose: () => void;
  onSubmit: (input: MiscExpenseInput) => void;
  initial?: MiscExpense | null;
  /** When provided the milestone selector is hidden and locked to this value. */
  defaultMilestoneId?: string;
  /** When provided this expense is linked to the task for auto-tracking. */
  defaultTaskId?: string;
  /** Real project milestones to populate the selector when not locked. */
  milestones?: MilestoneLike[];
}

const DEFAULT_CATEGORY: MiscCategoryKey = "admin";

// Remounted via key prop by the parent — lazy initializers, no effects needed.
export default function MiscExpenseModal({ onClose, onSubmit, initial, defaultMilestoneId, defaultTaskId, milestones = [] }: MiscExpenseModalProps) {
  const defaultMilestone = defaultMilestoneId ?? initial?.milestoneId ?? milestones[0]?.id ?? "";
  const isMilestoneLocked = !!defaultMilestoneId;

  const [milestoneId,   setMilestoneId]   = useState(defaultMilestone);
  const [category,      setCategory]      = useState<MiscCategoryKey>(initial?.category ?? DEFAULT_CATEGORY);
  const [subCategory,   setSubCategory]   = useState(initial?.subCategory ?? getSubCategories(DEFAULT_CATEGORY)[0] ?? "");
  const [expenseType,   setExpenseType]   = useState(initial?.expenseType ?? "");
  const [amountPlanned, setAmountPlanned] = useState(initial ? String(initial.amountPlanned) : "");
  const [plannedDate,   setPlannedDate]   = useState(initial?.plannedDate ?? "");
  const [notes,         setNotes]         = useState(initial?.notes ?? "");
  const [error,         setError]         = useState("");

  const subCategories = getSubCategories(category);
  const templatesForCategory = MISC_TEMPLATES.filter((t) => t.category === category);

  const handleCategoryChange = (next: MiscCategoryKey) => {
    setCategory(next);
    setSubCategory(getSubCategories(next)[0] ?? "");
  };

  const applyTemplate = (templateId: string) => {
    const tpl = MISC_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setCategory(tpl.category);
    setSubCategory(tpl.subCategory);
    setExpenseType(tpl.expenseType);
    if (tpl.defaultAmount != null) setAmountPlanned(String(tpl.defaultAmount));
    if (tpl.description && !notes) setNotes(tpl.description);
  };

  const handleSubmit = () => {
    if (!milestoneId) { setError("Select a phase / milestone"); return; }
    if (!subCategory) { setError("Sub-category is required"); return; }
    if (!expenseType.trim()) { setError("Expense type is required"); return; }
    const planned = parseFloat(amountPlanned);
    if (!amountPlanned || isNaN(planned) || planned < 0) {
      setError("Enter a valid planned amount (₦0 or more)");
      return;
    }

    onSubmit({
      milestoneId,
      taskId: defaultTaskId ?? initial?.taskId,
      category,
      subCategory,
      expenseType: expenseType.trim(),
      amountPlanned: planned,
      amountActual: 0,
      progressPercent: 0,
      autoTrack: true,
      plannedDate: plannedDate || null,
      notes: notes.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-[#021422]">
            {initial ? "Edit Expense" : "Add Misc Expense"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Milestone / Phase selector — hidden when locked from parent context */}
          {!isMilestoneLocked && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                Phase / Milestone *
              </label>
              <select
                value={milestoneId}
                onChange={(e) => { setMilestoneId(e.target.value); setError(""); }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
              >
                <option value="">— Select phase —</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Template picker */}
          {!initial && templatesForCategory.length > 0 && (
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                <Sparkles size={12} /> Start from template
              </label>
              <select
                defaultValue=""
                onChange={(e) => e.target.value && applyTemplate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
              >
                <option value="">— No template —</option>
                {templatesForCategory.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.templateName} ({t.expenseType})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as MiscCategoryKey)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
              >
                {MISC_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Sub-category */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                Sub-Category *
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
              >
                {subCategories.map((sc) => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </div>

            {/* Expense type */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                Expense Type *
              </label>
              <input
                type="text"
                value={expenseType}
                onChange={(e) => { setExpenseType(e.target.value); setError(""); }}
                placeholder="e.g. Security Guard Service"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
              />
            </div>

            {/* Planned */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                Planned Amount (PV) ₦ *
              </label>
              <input
                type="number" min="0"
                value={amountPlanned}
                onChange={(e) => { setAmountPlanned(e.target.value); setError(""); }}
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
              />
            </div>

            {/* Planned date */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                Planned Date
              </label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} /> {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-2.5 bg-[#021422] text-white rounded-lg text-sm font-bold hover:bg-[#03203a] transition-colors"
            >
              {initial ? "Save Changes" : "Add Expense"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
