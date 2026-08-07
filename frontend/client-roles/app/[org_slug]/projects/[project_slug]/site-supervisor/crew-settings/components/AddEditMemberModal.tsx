"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Loader2, Camera, Upload, UserPlus, Crown, Check, Search, ChevronDown } from "lucide-react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { crewService } from "@/lib/services/crewService";
import type { Crew, CrewMember, AvailablePoolWorker } from "@/lib/services/crewService";
import { getErrorMessage } from "@/lib/error";
import { crewKeys } from "@/lib/queryKeys";
import toast from "react-hot-toast";

interface AddEditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  crewId?: string;
  editingMember?: CrewMember | null;
}

export default function AddEditMemberModal({
  isOpen,
  onClose,
  projectId,
  crewId: crewIdProp,
  editingMember,
}: AddEditMemberModalProps) {
  const qc = useQueryClient();
  const isEdit = !!editingMember;
  const isStandalone = !crewIdProp && !isEdit;
  const crewId = crewIdProp ?? editingMember?.id ?? "";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"pool" | "manual">("pool");
  const [firstName, setFirstName] = useState(() => editingMember?.first_name ?? "");
  const [lastName, setLastName] = useState(() => editingMember?.last_name ?? "");
  const [phone, setPhone] = useState(() => editingMember?.phone_number ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    () => editingMember?.profile_picture_url || null,
  );
  const [selectedCrewId, setSelectedCrewId] = useState<string>(crewIdProp ?? "");
  const [setAsForeman, setSetAsForeman] = useState(false);
  // Multi-select pool workers (Set of UUIDs)
  const [selectedPoolWorkerIds, setSelectedPoolWorkerIds] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const targetCrewId = isStandalone ? selectedCrewId : (crewIdProp ?? "");

  const { data: crewsData } = useQuery({
    queryKey: crewKeys.crews(projectId),
    queryFn: () => crewService.listCrews(projectId).then((r) => r.data),
    enabled: isStandalone && isOpen && !!projectId,
  });
  const crews: Crew[] = Array.isArray(crewsData) ? crewsData : crewsData?.results ?? [];
  const activeCrews = crews.filter((c) => c.is_active);

  const { data: availableWorkersData, isLoading: availableLoading } = useQuery({
    queryKey: ["available-workers", projectId, targetCrewId, searchQuery],
    queryFn: () =>
      crewService
        .getAvailablePoolWorkers(projectId, targetCrewId, searchQuery || undefined)
        .then((r) => r.data),
    enabled: !!projectId && !!targetCrewId && mode === "pool" && !isEdit,
  });
  const availableWorkers: AvailablePoolWorker[] = availableWorkersData ?? [];

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const E164_REGEX = /^\+[1-9]\d{6,14}$/;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP images are allowed");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const togglePoolWorker = (id: string) => {
    setSelectedPoolWorkerIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      // Clear foreman flag whenever the selection moves away from exactly 1
      if (next.size !== 1) setSetAsForeman(false);
      return next;
    });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!targetCrewId) throw new Error("Please select a crew");

      if (mode === "pool" && !isEdit) {
        if (selectedPoolWorkerIds.size === 0) throw new Error("Please select at least one pool worker");
        const res = await crewService.bulkAddPoolWorkersToCrew(
          projectId,
          targetCrewId,
          Array.from(selectedPoolWorkerIds),
        );
        // Set foreman when exactly one worker was added and checkbox is ticked
        if (setAsForeman && selectedPoolWorkerIds.size === 1) {
          const responseData = res.data as CrewMember[] | { data?: CrewMember[] };
          const members: CrewMember[] = Array.isArray(responseData)
            ? responseData
            : responseData.data ?? [];
          const memberId = Array.isArray(members) ? members[0]?.id : null;
          if (memberId) {
            await crewService.setForeman(projectId, targetCrewId, memberId);
          }
        }
        return res;
      }

      const fd = new FormData();
      fd.append("first_name", firstName.trim());
      fd.append("last_name", lastName.trim());
      if (phone.trim()) fd.append("phone_number", phone.trim());
      if (photoFile) fd.append("profile_picture", photoFile);
      if (isEdit && editingMember) {
        return crewService.updateMember(projectId, targetCrewId, editingMember.id, fd);
      }
      const res = await crewService.addMember(projectId, targetCrewId, fd);
      if (setAsForeman && res.data?.id) {
        await crewService.setForeman(projectId, targetCrewId, res.data.id);
      }
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crewKeys.members(projectId, targetCrewId) });
      qc.invalidateQueries({ queryKey: crewKeys.crews(projectId) });
      const count = selectedPoolWorkerIds.size;
      toast.success(
        isEdit ? "Member updated" :
        mode === "pool"
          ? count > 1
            ? `${count} members added to crew`
            : setAsForeman
            ? "Pool worker assigned & set as foreman"
            : "Pool worker assigned to crew"
        : setAsForeman ? "Member added & set as foreman" : "Member added"
      );
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCrewId) {
      toast.error("Please select a crew");
      return;
    }
    if (mode === "pool" && !isEdit) {
      if (selectedPoolWorkerIds.size === 0) {
        toast.error("Please select at least one pool worker");
        return;
      }
      mutation.mutate();
      return;
    }
    if (!firstName.trim() || !lastName.trim()) return;
    if (phone.trim() && !E164_REGEX.test(phone.trim())) {
      toast.error("Phone number must be in E.164 format, e.g. +2348012345678");
      return;
    }
    mutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#021422]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="font-bold text-lg uppercase tracking-wider text-[#021422]">
            {isEdit ? "Edit Member" : "Add New Member"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Mode tabs — only when creating */}
        {!isEdit && (
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => setMode("pool")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                mode === "pool"
                  ? "text-[#007AFF] border-b-2 border-[#007AFF]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              From Pool
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                mode === "manual"
                  ? "text-[#007AFF] border-b-2 border-[#007AFF]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Manual Entry
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[72vh]">
          {/* Crew selector — only in standalone mode */}
          {isStandalone && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Select Crew *
              </label>
              <select
                required
                value={selectedCrewId}
                onChange={(e) => { setSelectedCrewId(e.target.value); setSelectedPoolWorkerIds(new Set()); }}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
              >
                <option value="">— Choose a crew —</option>
                {activeCrews.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.crew_code})
                  </option>
                ))}
              </select>
              {activeCrews.length === 0 && (
                <p className="text-[10px] text-amber-600">No active crews. Create a crew first.</p>
              )}
            </div>
          )}

          {/* ── From Pool mode ── */}
          {mode === "pool" && !isEdit && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Pool Workers *
              </label>
              {!targetCrewId ? (
                <p className="text-xs text-gray-400 py-2">Select a crew first to see available pool workers.</p>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  {/* Dropdown trigger */}
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((o) => !o)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 border rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#007AFF] ${
                      dropdownOpen ? "border-[#007AFF] ring-2 ring-[#007AFF]" : "border-gray-200"
                    }`}
                  >
                    <span className={selectedPoolWorkerIds.size > 0 ? "text-[#021422]" : "text-gray-400"}>
                      {selectedPoolWorkerIds.size === 0
                        ? "Select pool workers…"
                        : `${selectedPoolWorkerIds.size} worker${selectedPoolWorkerIds.size > 1 ? "s" : ""} selected`}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown panel */}
                  {dropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {/* Search inside dropdown */}
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search by name…"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Worker list */}
                      <div className="max-h-72 overflow-y-auto">
                        {availableLoading ? (
                          <div className="flex items-center justify-center gap-2 text-gray-400 py-6">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="text-xs">Loading workers…</span>
                          </div>
                        ) : availableWorkers.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-6">
                            {searchQuery ? "No workers match your search." : "No available pool workers for this crew."}
                          </p>
                        ) : (
                          availableWorkers.map((w) => (
                            <label
                              key={w.id}
                              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                                selectedPoolWorkerIds.has(w.id)
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedPoolWorkerIds.has(w.id)}
                                onChange={() => togglePoolWorker(w.id)}
                                className="w-4 h-4 text-[#007AFF] focus:ring-[#007AFF] rounded flex-shrink-0"
                              />
                              {w.profile_picture_url ? (
                                <img
                                  src={w.profile_picture_url}
                                  alt={`${w.first_name} ${w.last_name}`}
                                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                  {w.first_name?.[0]}{w.last_name?.[0]}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-[#021422] truncate">
                                  {w.first_name} {w.last_name}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate">
                                  {w.worker_code} · {w.trade}
                                </p>
                              </div>
                              <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                w.status === "standby" ? "bg-blue-100 text-blue-700" :
                                w.status === "on_site" ? "bg-green-100 text-green-700" :
                                "bg-gray-100 text-gray-600"
                              }`}>
                                {w.status}
                              </span>
                            </label>
                          ))
                        )}
                      </div>

                      {/* Footer — count + done */}
                      {selectedPoolWorkerIds.size > 0 && (
                        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50">
                          <span className="text-[10px] font-semibold text-[#007AFF]">
                            {selectedPoolWorkerIds.size} selected
                          </span>
                          <button
                            type="button"
                            onClick={() => setDropdownOpen(false)}
                            className="text-[10px] font-bold text-white bg-[#007AFF] px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Manual Entry mode (or edit mode) ── */}
          {(mode === "manual" || isEdit) && (
            <>
              {/* Profile picture */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Profile Picture (optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Camera size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload size={14} />
                      {photoPreview ? "Change Photo" : "Upload Photo"}
                    </button>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={() => { setPhotoPreview(null); setPhotoFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="w-full mt-2 px-4 py-2 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                      >
                        Remove Photo
                      </button>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2">Max 5MB. Accepted: JPG, PNG, WebP</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  First Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Last Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Martinez"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +2348012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="^\+[1-9]\d{6,14}$"
                  title="Phone number must be in E.164 format (e.g. +2348012345678)"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                />
                <p className="text-[10px] text-gray-400 pt-0.5">
                  Include country code with <span className="font-semibold text-gray-500">+</span> prefix, e.g. +2348012345678
                </p>
              </div>
            </>
          )}

          {/* Set as Foreman — edit, manual, or pool mode with exactly 1 worker selected */}
          {(isEdit || mode === "manual" || (mode === "pool" && selectedPoolWorkerIds.size === 1)) && (
            <label className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
              <div
                onClick={() => setSetAsForeman((v) => !v)}
                className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                  setAsForeman
                    ? "bg-amber-500 border-amber-500"
                    : "border-amber-300"
                }`}
              >
                {setAsForeman && <Check size={14} className="text-white" />}
              </div>
              <div className="flex items-center gap-2">
                <Crown size={14} className="text-amber-500" />
                <span className="text-xs font-medium text-amber-800">Set as Foreman</span>
              </div>
            </label>
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
              disabled={
                mutation.isPending ||
                (isStandalone && !selectedCrewId) ||
                (!isEdit && mode === "pool" && selectedPoolWorkerIds.size === 0) ||
                (!isEdit && mode === "manual" && (!firstName.trim() || !lastName.trim()))
              }
              className="flex-1 py-3 bg-[#007AFF] text-white text-xs font-bold uppercase rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UserPlus size={14} />
              )}
              {mutation.isPending
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : mode === "pool" && selectedPoolWorkerIds.size > 1
                ? `Add ${selectedPoolWorkerIds.size} Members`
                : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
