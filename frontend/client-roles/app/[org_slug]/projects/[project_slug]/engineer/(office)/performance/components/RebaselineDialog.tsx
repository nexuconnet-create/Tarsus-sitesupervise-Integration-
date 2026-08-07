"use client";

import { useState, useEffect } from "react";
import { X, Calendar, DollarSign } from "lucide-react";
import { useRebaseline } from "@/lib/hooks/useEvm";

interface RebaselineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectUuid: string;
  currentBudget?: string;
  currentStartDate?: string;
  currentEndDate?: string;
}

export default function RebaselineDialog({
  isOpen,
  onClose,
  projectUuid,
  currentBudget = "0",
  currentStartDate = "",
  currentEndDate = "",
}: RebaselineDialogProps) {
  const [budget, setBudget] = useState(currentBudget);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);
  const [error, setError] = useState("");

  const rebaseline = useRebaseline(projectUuid);

  useEffect(() => {
    if (isOpen) {
      // This effect intentionally synchronizes the editable form with the selected baseline.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBudget(currentBudget);
      setStartDate(currentStartDate);
      setEndDate(currentEndDate);
      setError("");
    }
  }, [isOpen, currentBudget, currentStartDate, currentEndDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!budget || parseFloat(budget) < 0) {
      setError("Budget must be a positive number");
      return;
    }
    if (!startDate || !endDate) {
      setError("Both dates are required");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date");
      return;
    }

    rebaseline.mutate(
      {
        budget,
        baseline_start_date: startDate,
        baseline_end_date: endDate,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#021422]">Rebaseline Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign size={14} className="inline" /> New Budget (PV)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D4]"
              placeholder="e.g. 12500000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline" /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline" /> End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D4]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rebaseline.isPending}
              className="flex-1 px-4 py-2.5 bg-[#021422] text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {rebaseline.isPending ? "Updating..." : "Rebaseline"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
