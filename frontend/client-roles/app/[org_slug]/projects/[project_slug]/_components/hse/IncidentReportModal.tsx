"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, AlertTriangle, Camera, Trash2, ZoomIn, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  ApiIncident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
  CreateIncidentBody,
} from "@/lib/services/hseService";
import { hseService } from "@/lib/services/hseService";
import {
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
} from "@/lib/services/hseService";

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateIncidentBody, files?: File[]) => void;
  record?: ApiIncident | null;
  projectUuid?: string;
}

export type { CreateIncidentBody as IncidentFormData };

interface PhotoEntry {
  file: File;
  previewUrl: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PHOTOS = 5;

const CATEGORIES: IncidentCategory[] = [
  "NEAR_MISS",
  "LOST_TIME_INJURY",
  "RESTRICTED_WORK_CASE",
  "MEDICAL_TREATMENT_CASE",
  "FIRST_AID_CASE",
  "UNSAFE_ACTS_CONDITIONS",
  "OCCUPATIONAL_ILLNESS",
];

const SEVERITIES: IncidentSeverity[] = ["MINOR", "MAJOR", "CRITICAL"];
const STATUSES: IncidentStatus[] = ["OPEN", "INVESTIGATING", "CLOSED"];

const severityColor = (s: IncidentSeverity) => {
  switch (s) {
    case "CRITICAL": return "bg-red-100 text-red-700 border-red-200";
    case "MAJOR": return "bg-orange-100 text-orange-700 border-orange-200";
    case "MINOR": return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
};

const statusColor = (s: IncidentStatus) => {
  switch (s) {
    case "OPEN": return "bg-red-100 text-red-700";
    case "INVESTIGATING": return "bg-blue-100 text-blue-700";
    case "CLOSED": return "bg-gray-100 text-gray-700";
  }
};

export default function IncidentReportModal({ isOpen, onClose, onSubmit, record, projectUuid }: IncidentReportModalProps) {
  const [formData, setFormData] = useState<CreateIncidentBody>({
    category: "NEAR_MISS",
    description: "",
    severity: "MINOR",
    location: "",
    date_occurred: new Date().toISOString().split("T")[0],
    status: "OPEN",
  });
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch full incident detail (with evidence URLs) when viewing a record
  useEffect(() => {
    if (!record || !projectUuid) return;
    hseService.getIncident(projectUuid, record.uuid).then((res) => {
      const data = res.data?.data || res.data;
      setEvidenceUrls(Array.isArray(data.evidence) ? data.evidence : []);
    }).catch((err) => {
      console.error("Failed to load incident evidence", err);
      setEvidenceUrls([]);
    });
  }, [record, projectUuid]);

  const addFiles = (files: FileList | File[]) => {
    setFileError(null);
    const incoming = Array.from(files);
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      setFileError(`Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }
    const toAdd: PhotoEntry[] = [];
    for (const file of incoming.slice(0, remaining)) {
      if (!file.type.startsWith("image/")) {
        setFileError("Only image files are accepted (JPG, PNG, HEIC).");
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB per photo.`);
        continue;
      }
      toAdd.push({ file, previewUrl: URL.createObjectURL(file) });
    }
    if (toAdd.length) setPhotos((prev) => [...prev, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    setFileError(null);
  };

   
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData, photos.map((p) => p.file));
    onClose();
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
    setFileError(null);
    setFormData({ category: "NEAR_MISS", description: "", severity: "MINOR", location: "", date_occurred: new Date().toISOString().split("T")[0], status: "OPEN" });
  };

  // ─── Detail View ─────────────────────────────────────────────────────────
  if (record) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <AnimatePresence>
          <motion.div
            key="incident-detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
          >
            {/* Lightbox */}
            {lightboxIndex !== null && evidenceUrls[lightboxIndex] && (
              <div
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                onClick={() => setLightboxIndex(null)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={evidenceUrls[lightboxIndex]}
                  alt="Evidence"
                  className="max-w-full max-h-full rounded-xl object-contain"
                />
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {evidenceUrls.length > 1 && (
                    <span className="text-white/70 text-sm font-medium">
                      {lightboxIndex + 1} / {evidenceUrls.length}
                    </span>
                  )}
                  <button
                    className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
                    onClick={() => setLightboxIndex(null)}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}

            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={24} className="text-[#021422]" />
                  <h2 className="text-2xl font-bold text-[#021422]">Incident Detail</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${severityColor(record.severity)}`}>
                    {INCIDENT_SEVERITY_LABELS[record.severity]}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                    {INCIDENT_CATEGORY_LABELS[record.category]}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${statusColor(record.status)}`}>
                    {INCIDENT_STATUS_LABELS[record.status]}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-[#021422] bg-gray-50 rounded-lg p-4">{record.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                    <p className="text-sm font-medium text-[#021422]">{record.location}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date Occurred</p>
                    <p className="text-sm font-medium text-[#021422]">
                      {new Date(record.date_occurred).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reported By</p>
                  <p className="text-sm font-medium text-[#021422]">{record.reporter}</p>
                </div>

                {evidenceUrls.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Evidence ({evidenceUrls.length} photo{evidenceUrls.length > 1 ? "s" : ""})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {evidenceUrls.map((url, i) => (
                        <div
                          key={i}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
                          onClick={() => setLightboxIndex(i)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                            <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ─── Create View ──────────────────────────────────────────────────────────
  const canAddMore = photos.length < MAX_PHOTOS;

  return (
    <>
      {/* Lightbox */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setLightboxIndex(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[lightboxIndex].previewUrl}
            alt="Preview"
            className="max-w-full max-h-full rounded-xl object-contain"
          />
          <button
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
            onClick={() => setLightboxIndex(null)}
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <AnimatePresence>
          <motion.div
            key="incident-create"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={24} className="text-[#021422]" />
                  <h2 className="text-2xl font-bold text-[#021422]">New Incident Report</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as IncidentCategory })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{INCIDENT_CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what happened"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Severity</label>
                  <div className="grid grid-cols-3 gap-3">
                    {SEVERITIES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, severity: s })}
                        className={`py-3 px-4 rounded-lg font-semibold border-2 transition-colors text-sm ${
                          formData.severity === s
                            ? s === "CRITICAL" ? "bg-red-100 border-red-500 text-red-800"
                            : s === "MAJOR" ? "bg-orange-100 border-orange-500 text-orange-800"
                            : "bg-yellow-100 border-yellow-500 text-yellow-800"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {INCIDENT_SEVERITY_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#021422]">Location</label>
                    <input
                      required
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Block A, 3rd Floor"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#021422]">Date of Incident</label>
                    <input
                      required
                      type="date"
                      value={formData.date_occurred}
                      onChange={(e) => setFormData({ ...formData, date_occurred: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Status</label>
                  <div className="grid grid-cols-3 gap-3">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: s })}
                        className={`py-3 px-4 rounded-lg font-semibold border-2 transition-colors text-sm ${
                          formData.status === s
                            ? "bg-[#021422] border-[#021422] text-white"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {INCIDENT_STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ─── Photo Evidence ─────────────────────────────────── */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#021422]">
                      Photo Evidence <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    {photos.length > 0 && (
                      <span className="text-xs text-gray-400">{photos.length}/{MAX_PHOTOS} photos</span>
                    )}
                  </div>

                  {/* Thumbnail grid + add button */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {photos.map((p, i) => (
                        <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.previewUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setLightboxIndex(i)}
                              className="opacity-0 group-hover:opacity-100 bg-white/90 text-[#021422] rounded-full p-1.5 transition-all"
                            >
                              <ZoomIn size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removePhoto(i)}
                              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1.5 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Drop zone — hidden once limit reached */}
                  {canAddMore && (
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center gap-3 rounded-lg border border-dashed cursor-pointer transition-all px-4 py-3 ${
                        isDragging
                          ? "border-[#021422] bg-blue-50/60"
                          : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isDragging ? "bg-[#021422]/10" : "bg-gray-200"}`}>
                        {photos.length === 0 ? (
                          <Camera size={14} className={isDragging ? "text-[#021422]" : "text-gray-400"} />
                        ) : (
                          <Plus size={14} className={isDragging ? "text-[#021422]" : "text-gray-400"} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700">
                          {isDragging
                            ? "Drop photos here"
                            : photos.length === 0
                            ? <span>Drag & drop or <span className="text-[#021422] font-semibold underline underline-offset-2">browse</span></span>
                            : <span>Add more photos <span className="text-[#021422] font-semibold underline underline-offset-2">browse</span></span>
                          }
                        </p>
                        <p className="text-[11px] text-gray-400">JPG, PNG, HEIC · Max 5 MB each · Up to {MAX_PHOTOS}</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
                      />
                    </div>
                  )}

                  {fileError && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <span>⚠</span> {fileError}
                    </p>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors"
                  >
                    Submit Report
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-4 bg-white border border-gray-200 text-[#021422] rounded-lg font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
