"use client";

import React, { useState } from "react";
import { X, Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { crewService } from "@/lib/services/crewService";
import { clientService } from "@/lib/services/client";
import { getErrorMessage } from "@/lib/error";
import toast from "react-hot-toast";
import type { Crew, CrewMember } from "@/lib/services/crewService";
import { crewKeys, projectKeys } from "@/lib/queryKeys";

interface ImportCrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

type Step = "select-project" | "select-crew" | "select-members";

export default function ImportCrewModal({
  isOpen,
  onClose,
  projectId,
}: ImportCrewModalProps) {
  const qc = useQueryClient();

  const [step, setStep] = useState<Step>("select-project");
  const [sourceProjectId, setSourceProjectId] = useState("");
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: projectKeys.list(),
    queryFn: () => clientService.getProjects().then((r) => r.data),
    enabled: isOpen,
  });

  const { data: sourceCrewsData, isLoading: sourceCrewsLoading } = useQuery({
    queryKey: crewKeys.crews(sourceProjectId),
    queryFn: () => crewService.listCrews(sourceProjectId).then((r) => r.data),
    enabled: !!sourceProjectId && step === "select-crew",
  });

  const { data: sourceMembersData, isLoading: sourceMembersLoading } = useQuery({
    queryKey: crewKeys.members(sourceProjectId, selectedCrew?.id),
    queryFn: () =>
      crewService.listMembers(sourceProjectId, selectedCrew!.id).then((r) => r.data),
    enabled: !!sourceProjectId && !!selectedCrew && step === "select-members",
  });

  const importMutation = useMutation({
    mutationFn: () =>
      crewService.importCrew(projectId, {
        source_crew_id: selectedCrew!.id,
        member_ids: selectedMemberIds,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crewKeys.crews(projectId) });
      toast.success("Crew imported successfully");
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const projects: { id: string; name: string }[] =
    Array.isArray(projectsData) ? projectsData : projectsData?.results ?? [];
  const sourceCrews: Crew[] = Array.isArray(sourceCrewsData) ? sourceCrewsData : sourceCrewsData?.results ?? [];
  const sourceMembers: CrewMember[] = Array.isArray(sourceMembersData) ? sourceMembersData : sourceMembersData?.results ?? [];
  const filteredProjects = projects.filter((p) => p.id !== projectId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#021422]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step !== "select-project" && (
              <button
                onClick={() => {
                  if (step === "select-members") setStep("select-crew");
                  else setStep("select-project");
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={16} className="text-gray-500" />
              </button>
            )}
            <h3 className="font-bold text-lg uppercase tracking-wider text-[#021422]">
              Import from Another Project
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-6 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <span className={step === "select-project" ? "text-[#007AFF]" : ""}>1. Project</span>
          <ChevronRight size={12} />
          <span className={step === "select-crew" ? "text-[#007AFF]" : ""}>2. Crew</span>
          <ChevronRight size={12} />
          <span className={step === "select-members" ? "text-[#007AFF]" : ""}>3. Members</span>
        </div>

        <div className="p-6 min-h-[260px]">
          {/* Step 1 */}
          {step === "select-project" && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-600">Select the source project to import from:</p>
              {projectsLoading ? (
                <div className="flex items-center gap-2 text-gray-400 py-4">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs">Loading projects…</span>
                </div>
              ) : filteredProjects.length === 0 ? (
                <p className="text-xs text-gray-400 py-4">No other projects found in this organisation.</p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {filteredProjects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSourceProjectId(p.id); setStep("select-crew"); }}
                      className="w-full text-left p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-[#021422] hover:bg-gray-100 hover:border-[#007AFF] transition-all"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step === "select-crew" && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-600">Select the crew to import:</p>
              {sourceCrewsLoading ? (
                <div className="flex items-center gap-2 text-gray-400 py-4">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs">Loading crews…</span>
                </div>
              ) : sourceCrews.length === 0 ? (
                <p className="text-xs text-gray-400 py-4">No active crews in that project.</p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {sourceCrews.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCrew(c); setSelectedMemberIds([]); setStep("select-members"); }}
                      className="w-full text-left p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-[#007AFF] transition-all"
                    >
                      <p className="text-xs font-medium text-[#021422]">{c.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{c.member_count} members · {c.crew_code}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3 */}
          {step === "select-members" && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-600">
                Select members to import from <strong>{selectedCrew?.name}</strong>:
              </p>
              {sourceMembersLoading ? (
                <div className="flex items-center gap-2 text-gray-400 py-4">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs">Loading members…</span>
                </div>
              ) : sourceMembers.length === 0 ? (
                <p className="text-xs text-gray-400 py-4">No active members in that crew.</p>
              ) : (
                <>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    <span>{selectedMemberIds.length} of {sourceMembers.length} selected</span>
                    <button
                      onClick={() =>
                        setSelectedMemberIds(
                          selectedMemberIds.length === sourceMembers.length
                            ? []
                            : sourceMembers.map((m) => m.id)
                        )
                      }
                      className="text-[#007AFF] hover:underline"
                    >
                      {selectedMemberIds.length === sourceMembers.length ? "Deselect all" : "Select all"}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {sourceMembers.map((m) => (
                      <label
                        key={m.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.includes(m.id)}
                          onChange={() => toggleMember(m.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#007AFF] focus:ring-[#007AFF]"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          {m.profile_picture_url ? (
                            <img src={m.profile_picture_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                              {m.first_name[0]}{m.last_name[0]}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium text-[#021422]">{m.first_name} {m.last_name}</p>
                            <p className="text-[10px] text-gray-400">{m.trade || m.member_code}</p>
                          </div>
                        </div>
                        {m.role === "foreman" && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Foreman</span>
                        )}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer — only on step 3 */}
        {step === "select-members" && (
          <div className="px-6 pb-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-[#021422] text-xs font-bold uppercase rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => importMutation.mutate()}
              disabled={importMutation.isPending || selectedMemberIds.length === 0}
              className="flex-1 py-3 bg-[#021422] text-white text-xs font-bold uppercase rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {importMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {importMutation.isPending ? "Importing..." : "Import Crew"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
