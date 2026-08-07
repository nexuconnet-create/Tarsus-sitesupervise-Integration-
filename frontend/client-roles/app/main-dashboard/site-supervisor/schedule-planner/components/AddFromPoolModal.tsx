"use client";

import { useState, useMemo } from "react";
import { X, Search, UserPlus, Users, CheckCircle2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Worker {
  id: string;
  memberId: string;
  name: string;
  trade: string;
}

interface Crew {
  id: string;
  name: string;
  trade: string;
  workers: Worker[];
}

interface Schedule {
  id: string;
  title: string;
  task: string;
  start: Date;
  end: Date;
  assignedMemberIds: string[];
  crews: Crew[];
}

interface AddFromPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableWorkers: Worker[];
  schedules: Schedule[];
  onAddExtraWorkers: (scheduleId: string, parentCrewId: string, workerIds: string[]) => void;
}

export default function AddFromPoolModal({
  isOpen,
  onClose,
  availableWorkers,
  schedules,
  onAddExtraWorkers,
}: AddFromPoolModalProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [selectedParentCrewId, setSelectedParentCrewId] = useState<string>("");

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);

  const eligibleWorkers = useMemo(() => {
    const currentMemberIds = selectedSchedule?.assignedMemberIds || [];
    return availableWorkers.filter((w) => !currentMemberIds.includes(w.id));
  }, [availableWorkers, selectedSchedule]);

  const filteredWorkers = useMemo(() => {
    if (!search.trim()) return eligibleWorkers;
    const q = search.toLowerCase();
    return eligibleWorkers.filter(
      (w) => w.name.toLowerCase().includes(q) || w.trade.toLowerCase().includes(q)
    );
  }, [eligibleWorkers, search]);

  const toggleWorker = (workerId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(workerId)) {
        next.delete(workerId);
      } else {
        next.add(workerId);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedIds.size > 0 && selectedScheduleId && selectedParentCrewId) {
      onAddExtraWorkers(selectedScheduleId, selectedParentCrewId, Array.from(selectedIds));
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearch("");
    setSelectedScheduleId("");
    setSelectedParentCrewId("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Add Extra Workers</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Select a crew and add workers from the available pool
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>

          {/* Schedule Selection */}
          <div className="px-6 py-3 border-b border-gray-100">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">
              Schedule
            </label>
            <div className="relative">
              <select
                value={selectedScheduleId}
                onChange={(e) => {
                  setSelectedScheduleId(e.target.value);
                  setSelectedParentCrewId("");
                  setSelectedIds(new Set());
                }}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 appearance-none"
              >
                <option value="">Select schedule...</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.task || s.title} ({s.crews.length} crew{s.crews.length !== 1 ? "s" : ""})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Crew Selection */}
          {selectedSchedule && selectedSchedule.crews.length > 0 && (
            <div className="px-6 py-3 border-b border-gray-100">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">
                Crew
              </label>
              <div className="relative">
                <select
                  value={selectedParentCrewId}
                  onChange={(e) => {
                    setSelectedParentCrewId(e.target.value);
                    setSelectedIds(new Set());
                  }}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 appearance-none"
                >
                  <option value="">Select crew...</option>
                  {selectedSchedule.crews.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.workers.length} workers)
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Search */}
          {selectedParentCrewId && (
            <div className="px-6 py-3 border-b border-gray-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or trade..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>
          )}

          {/* Worker List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {!selectedScheduleId ? (
              <div className="text-center py-10 text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs">Select a schedule above</p>
              </div>
            ) : !selectedParentCrewId ? (
              <div className="text-center py-10 text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs">Select a crew to add extra workers to</p>
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs">
                  {eligibleWorkers.length === 0
                    ? "All available workers are already in this schedule"
                    : "No workers match your search"}
                </p>
              </div>
            ) : (
              filteredWorkers.map((worker) => {
                const isSelected = selectedIds.has(worker.id);
                return (
                  <div
                    key={worker.id}
                    onClick={() => toggleWorker(worker.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? "border-gray-900 bg-white"
                        : "border-transparent bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isSelected ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">
                          {worker.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {worker.memberId} • {worker.trade}
                        </p>
                      </div>
                    </div>
                    <div>
                      {isSelected ? (
                        <CheckCircle2 size={16} className="text-gray-900" />
                      ) : (
                        <UserPlus size={14} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {selectedIds.size > 0
                ? `${selectedIds.size} selected`
                : selectedParentCrewId
                  ? `${eligibleWorkers.length} available`
                  : ""}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedIds.size === 0 || !selectedScheduleId || !selectedParentCrewId}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add ({selectedIds.size})
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
