"use client";

import { useState, useMemo } from "react";
import {
  X,
  Plus,
  Search,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

/** A worker confirmed on this specific day's log. */
interface DayWorker {
  id: string; // ScheduleWorker UUID
  name: string;
  trade: string;
  memberId: string;
  isDayAdd: boolean; // true = added for this day only
}

/** A worker that can be pulled in from the available pool. */
interface PoolWorker {
  id: string; // CrewMember or PoolWorker UUID
  type: "crew_member" | "pool_worker";
  memberId: string;
  name: string;
  trade: string;
}

interface DailyWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  crewName: string;
  dayWorkers: DayWorker[];
  availablePool?: PoolWorker[];
  status: "confirmed" | "pending" | "rejected";
  rejectionReason?: string;
  /** Roster removals → approval workflow (propose). */
  onSave: (date: string, removeWorkerIds: string[]) => void;
  /** Add a pool worker to this day only — applied immediately. */
  onAddDayWorker: (worker: PoolWorker) => void;
  /** Remove a day-only worker from this day — applied immediately. */
  onRemoveDayWorker: (scheduleWorkerId: string) => void;
}

function StatusBadge({
  status,
}: {
  status: "confirmed" | "pending" | "rejected";
}) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-bold">
        <Clock size={10} /> Pending Approval
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
        <XCircle size={10} /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">
      <CheckCircle2 size={10} /> Confirmed
    </span>
  );
}

export default function DailyWorkerModal({
  isOpen,
  onClose,
  date,
  crewName,
  dayWorkers,
  availablePool = [],
  status,
  rejectionReason,
  onSave,
  onAddDayWorker,
  onRemoveDayWorker,
}: DailyWorkerModalProps) {
  const [showPool, setShowPool] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPoolIds, setSelectedPoolIds] = useState<Set<string>>(new Set());
  // Roster removals are staged and submitted together for approval.
  const [stagedRemovals, setStagedRemovals] = useState<Set<string>>(new Set());

  const isLocked = status === "pending";

  // Roster workers still shown (minus anything staged for removal) + day-adds.
  const visibleWorkers = useMemo(
    () => dayWorkers.filter((w) => !stagedRemovals.has(w.id)),
    [dayWorkers, stagedRemovals],
  );

  // Don't offer pool workers who are already on the day (matched by member code).
  const assignedCodes = useMemo(
    () => new Set(dayWorkers.map((w) => w.memberId).filter(Boolean)),
    [dayWorkers],
  );

  const poolWorkers = useMemo(() => {
    return availablePool.filter((w) => {
      if (w.memberId && assignedCodes.has(w.memberId)) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) || w.trade.toLowerCase().includes(q)
      );
    });
  }, [availablePool, assignedCodes, search]);

  const handleRemoveClick = (worker: DayWorker) => {
    if (worker.isDayAdd) {
      // Day-only workers are temporary → remove immediately, no approval.
      onRemoveDayWorker(worker.id);
    } else {
      // Roster workers → stage for the approval workflow.
      setStagedRemovals((prev) => new Set(prev).add(worker.id));
    }
  };

  const togglePoolWorker = (workerId: string) => {
    setSelectedPoolIds((prev) => {
      const next = new Set(prev);
      if (next.has(workerId)) next.delete(workerId);
      else next.add(workerId);
      return next;
    });
  };

  const handleAddSelected = () => {
    // Each selected worker is added to the day immediately.
    poolWorkers
      .filter((w) => selectedPoolIds.has(w.id))
      .forEach((w) => onAddDayWorker(w));
    setSelectedPoolIds(new Set());
    setShowPool(false);
    setSearch("");
  };

  const handleRequestApproval = () => {
    const removeWorkerIds = [...stagedRemovals];
    if (removeWorkerIds.length === 0) return;
    onSave(date, removeWorkerIds);
    handleClose();
  };

  const handleClose = () => {
    setShowPool(false);
    setSearch("");
    setSelectedPoolIds(new Set());
    setStagedRemovals(new Set());
    onClose();
  };

  if (!isOpen) return null;

  const displayDate = moment(date).format("dddd, MMM D YYYY");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
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
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  {crewName}
                </p>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">
                  {displayDate}
                </h3>
                <div className="mt-2">
                  <StatusBadge status={status} />
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Rejection Reason */}
          {status === "rejected" && rejectionReason && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-100">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-red-600 uppercase">
                    Rejection Reason
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Assigned Workers */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Workers ({visibleWorkers.length})
              </span>
              {!isLocked && (
                <button
                  onClick={() => setShowPool(!showPool)}
                  className="text-[10px] font-bold text-gray-900 hover:text-gray-600 transition-colors flex items-center gap-1"
                >
                  <Plus size={12} />
                  Add from pool
                </button>
              )}
            </div>

            {/* Worker List */}
            {visibleWorkers.length > 0 ? (
              <div className="space-y-1">
                {visibleWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-bold">
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900 flex items-center gap-1.5">
                          {worker.name}
                          {worker.isDayAdd && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[8px] font-bold uppercase">
                              Day
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {worker.memberId} • {worker.trade}
                        </p>
                      </div>
                    </div>
                    {!isLocked && (
                      <button
                        onClick={() => handleRemoveClick(worker)}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        title={worker.isDayAdd ? "Remove day worker" : "Remove"}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs">No workers assigned to this day</p>
              </div>
            )}

            {/* Add from Pool Section */}
            {showPool && !isLocked && (
              <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <div className="relative">
                    <Search
                      size={12}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search workers..."
                      className="w-full pl-7 pr-3 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {poolWorkers.length > 0 ? (
                    poolWorkers.map((worker) => {
                      const isSelected = selectedPoolIds.has(worker.id);
                      return (
                        <button
                          key={worker.id}
                          onClick={() => togglePoolWorker(worker.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 transition-colors text-left border-l-2 ${
                            isSelected
                              ? "bg-gray-100 border-gray-900"
                              : "border-transparent hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "border-gray-900 bg-gray-900"
                                  : "border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 10 10"
                                  fill="none"
                                >
                                  <path
                                    d="M2 5L4 7L8 3"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-bold">
                              {worker.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-900">
                                {worker.name}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {worker.trade}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3 py-4 text-center text-xs text-gray-400">
                      No workers available
                    </div>
                  )}
                </div>
                {poolWorkers.length > 0 && (
                  <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-[10px] text-gray-500">
                      {selectedPoolIds.size} selected
                    </p>
                    <button
                      onClick={handleAddSelected}
                      disabled={selectedPoolIds.size === 0}
                      className="px-3 py-1.5 bg-gray-900 text-white rounded text-[10px] font-bold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Add Selected
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pending message */}
            {isLocked && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700">
                  This day is pending approval. You cannot make changes until it
                  is approved or rejected.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {visibleWorkers.length} worker
              {visibleWorkers.length !== 1 ? "s" : ""} assigned
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
              >
                {isLocked ? "Close" : "Cancel"}
              </button>
              {!isLocked && (
                <button
                  onClick={handleRequestApproval}
                  disabled={stagedRemovals.size === 0}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Request Approval
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
