"use client";

import React, { useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { crewService, CREW_TRADES } from "@/lib/services/crewService";
import type { Crew } from "@/lib/services/crewService";
import { getErrorMessage } from "@/lib/error";
import { crewKeys } from "@/lib/queryKeys";
import toast from "react-hot-toast";

interface CreateEditCrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  editingCrew?: Crew | null;
}

export default function CreateEditCrewModal({
  isOpen,
  onClose,
  projectId,
  editingCrew,
}: CreateEditCrewModalProps) {
  const qc = useQueryClient();
  const isEdit = !!editingCrew;

  const [name, setName] = useState(() => editingCrew?.name ?? "");
  const [trade, setTrade] = useState(() => editingCrew?.trade ?? CREW_TRADES[0].value);
  const [isActive, setIsActive] = useState(() => editingCrew?.is_active ?? true);

  const mutation = useMutation({
    mutationFn: () => {
      if (isEdit && editingCrew) {
        return crewService.updateCrew(projectId, editingCrew.id, { name, trade, is_active: isActive });
      }
      return crewService.createCrew(projectId, { name, trade, is_active: isActive });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crewKeys.crews(projectId) });
      toast.success(isEdit ? "Crew updated" : "Crew created");
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#021422]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="font-bold text-lg uppercase tracking-wider text-[#021422]">
            {isEdit ? "Edit Crew" : "Create New Crew"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Crew Name *
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Steel Crew A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Trade *
            </label>
            <select
              required
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
            >
              {CREW_TRADES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {isEdit && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Status
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isActive ? "bg-[#007AFF]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-gray-600">
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-[#021422] text-xs font-bold uppercase rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !name.trim()}
              className="flex-1 py-3 bg-[#021422] text-white text-xs font-bold uppercase rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Crew"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
