"use client";

import { useState } from "react";
import { X, Users, User, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types matching the shared types
interface Worker {
  id: string;
  memberId: string;
  name: string;
  trade: string;
  avatarUrl: string;
  phone?: string;
}

interface Crew {
  id: string;
  name: string;
  trade: string;
  size: number;
  workers: Worker[];
}

interface CrewSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  crews: Crew[];
  selectedCrewIds: string[];
  deactivatedWorkers: Set<string>;
  onSelectCrew: (crewId: string) => void;
  onToggleWorker: (workerId: string) => void;
}

export default function CrewSelectionModal({
  isOpen,
  onClose,
  crews,
  selectedCrewIds,
  deactivatedWorkers,
  onSelectCrew,
  onToggleWorker,
}: CrewSelectionModalProps) {
  const [expandedCrewId, setExpandedCrewId] = useState<string | null>(selectedCrewIds[0] || null);

  if (!isOpen) return null;

  const activeWorkers = (crew: Crew) =>
    crew.workers.filter((w) => !deactivatedWorkers.has(w.id));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-[#021422]">Select Crew(s)</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {crews.length} crew{crews.length !== 1 ? "s" : ""} from this task
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={16} className="text-[#021422]" />
            </button>
          </div>

          {/* Crew List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {crews.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users size={40} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No crews assigned to this task</p>
              </div>
            ) : (
              crews.map((crew) => {
                const isSelected = selectedCrewIds.includes(crew.id);
                const isExpanded = expandedCrewId === crew.id;
                const activeCount = activeWorkers(crew).length;
                const totalCount = crew.workers.length;

                return (
                  <div
                    key={crew.id}
                    className={`border rounded-xl overflow-hidden transition-all ${
                      isSelected
                        ? "border-[#021422] bg-[#021422]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {/* Crew Header */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#021422] flex items-center justify-center text-white font-bold text-sm">
                          {crew.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#021422]">{crew.name}</p>
                          <p className="text-xs text-gray-500">
                            {crew.trade} • {activeCount}/{totalCount} active
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectCrew(crew.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            isSelected
                              ? "bg-[#021422] text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </button>
                        <button
                          onClick={() =>
                            setExpandedCrewId(isExpanded ? null : crew.id)
                          }
                          className="p-1.5 text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Workers List */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 px-4 pb-3">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider my-3">
                          Workers ({totalCount})
                        </p>
                        <div className="space-y-1">
                          {crew.workers.map((worker) => {
                            const isDeactivated = deactivatedWorkers.has(worker.id);
                            return (
                              <div
                                key={worker.id}
                                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                                  isDeactivated ? "bg-gray-50 opacity-50" : "bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                      isDeactivated
                                        ? "bg-gray-200 text-gray-400"
                                        : "bg-blue-100 text-blue-600"
                                    }`}
                                  >
                                    {worker.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p
                                      className={`text-xs font-medium ${
                                        isDeactivated ? "text-gray-400 line-through" : "text-[#021422]"
                                      }`}
                                    >
                                      {worker.name}
                                    </p>
                                     <p className="text-[10px] text-gray-500">{worker.memberId} • {worker.trade}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => onToggleWorker(worker.id)}
                                  className={`p-1 rounded transition-colors ${
                                    isDeactivated
                                      ? "text-gray-400 hover:text-gray-600"
                                      : "text-green-500 hover:text-green-600"
                                  }`}
                                  title={isDeactivated ? "Activate worker" : "Deactivate worker"}
                                >
                                  {isDeactivated ? (
                                    <ToggleLeft size={20} />
                                  ) : (
                                    <ToggleRight size={20} />
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {selectedCrewIds.length > 0
                ? `${selectedCrewIds.length} crew${selectedCrewIds.length > 1 ? "s" : ""} selected`
                : "No crew selected"}
            </p>
            <button
              onClick={onClose}
              disabled={selectedCrewIds.length === 0}
              className="px-4 py-2 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedCrewIds.length > 0 ? "Confirm Selection" : "Cancel"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
