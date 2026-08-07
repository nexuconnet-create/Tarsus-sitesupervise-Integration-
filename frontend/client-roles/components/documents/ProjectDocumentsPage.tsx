"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import {
  FileText, Upload, X, Trash2, FileSpreadsheet,
  File, Image as ImageIcon, Search, Plus, Info, FolderOpen, Layers, Download,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { milestoneService } from "@/lib/services/milestoneService";
import { documentService } from "@/lib/services/documentService";
import { milestoneKeys, documentKeys } from "@/lib/queryKeys";
import type { InstructionDocument, InstructionDocFileType, DocumentCategory } from "@/lib/types/projectDocuments";
import type { Milestone } from "@/lib/types/milestone";
import type { MilestoneApiResponse, DocumentApiResponse } from "@/lib/types/api";
import {
  getFileTypeFromName,
  formatFileSize,
  DOCUMENT_CATEGORY_LABELS,
} from "@/lib/types/projectDocuments";
import { calcDuration } from "@/lib/types/milestone";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/error";

interface ProjectDocumentsPageProps {
  projectId: string;
  projectName: string;
  header: React.ReactNode;
}

function milestoneFromApi(api: MilestoneApiResponse): Milestone {
  return {
    id: api.id,
    name: api.name,
    description: api.description || undefined,
    startDate: api.start_date,
    finishDate: api.finish_date,
    duration: calcDuration(api.start_date, api.finish_date),
    projectId: api.project.id,
    order: 0,
  };
}

function documentFromApi(api: DocumentApiResponse, milestoneId: string): InstructionDocument {
  const fileName = api.file_url?.split("/").pop() ?? "document";
  return {
    id: api.id,
    category: (api.category as DocumentCategory) ?? "drawings",
    title: api.title,
    description: api.description || undefined,
    fileName,
    fileType: getFileTypeFromName(fileName),
    fileSize: "",
    uploadedBy: api.uploaded_by.fullname ?? `${api.uploaded_by.first_name} ${api.uploaded_by.last_name}`.trim(),
    uploadedAt: api.created_at,
    projectId: "",
    fileUrl: api.file_url,
    milestoneId,
  };
}

// ─── Helpers ──────────────────────────────────────────────

function FileIcon({ type, size = 20 }: { type: InstructionDocFileType; size?: number }) {
  if (type === "pdf") return <FileText size={size} className="shrink-0 text-red-500" />;
  if (type === "xlsx" || type === "xls") return <FileSpreadsheet size={size} className="shrink-0 text-emerald-600" />;
  if (type === "docx" || type === "doc") return <FileText size={size} className="shrink-0 text-blue-500" />;
  if (type === "png" || type === "jpg") return <ImageIcon size={size} className="shrink-0 text-purple-500" />;
  return <File size={size} className="shrink-0 text-gray-400" />;
}

const FILE_TYPE_BG: Record<InstructionDocFileType, string> = {
  pdf: "bg-red-50", docx: "bg-blue-50", doc: "bg-blue-50",
  xlsx: "bg-emerald-50", xls: "bg-emerald-50", pptx: "bg-orange-50",
  png: "bg-purple-50", jpg: "bg-purple-50", mpp: "bg-amber-50", other: "bg-gray-50",
};

// ─── Upload Form ───────────────────────────────────────────

function UploadForm({
  projectId,
  milestones,
  category,
  defaultMilestoneId,
  onUploaded,
}: {
  projectId: string;
  milestones: Milestone[];
  category: DocumentCategory;
  defaultMilestoneId: string;
  onUploaded: () => void;
}) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [milestoneId, setMilestoneId] = useState(defaultMilestoneId);
  const [error, setError] = useState("");

  const effectiveMilestoneId = milestoneId || milestones[0]?.id || "";

  const ACCEPTED = ".pdf,.doc,.docx,.xls,.xlsx,.pptx,.mpp,.png,.jpg,.jpeg";

  const selectedMilestoneName = milestones.find(m => m.id === milestoneId)?.name ?? "";

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) =>
      documentService.upload(projectId, effectiveMilestoneId, formData),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: documentKeys.all(projectId) });
      await qc.refetchQueries({ queryKey: documentKeys.all(projectId) });
      toast.success("Document uploaded");
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      onUploaded();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file);
    setTitle((prev) => prev || file.name.replace(/\.[^.]+$/, ""));
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { setError("Please select a file."); return; }
    if (!title.trim()) { setError("Please enter a document title."); return; }
    if (!milestoneId && milestones.length === 0) { setError("No milestones available. Create a milestone first."); return; }
    setError("");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("category", category);
    if (description.trim()) formData.append("description", description.trim());
    formData.append("file", selectedFile);

    uploadMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Milestone selector */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Milestone *</label>
        <select value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]/20 focus:border-[#021422] transition-colors">
          <option value="">Select a milestone...</option>
          {milestones.map((ms) => (<option key={ms.id} value={ms.id}>{ms.name}</option>))}
        </select>
      </div>

      {/* Category label */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-gray-200">
        <FolderOpen size={13} className="text-gray-400 shrink-0" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{DOCUMENT_CATEGORY_LABELS[category]}</p>
        </div>
      </div>

      {/* Upload destination hint */}
      {selectedMilestoneName && (
        <div className="px-3 py-2 bg-gray-50 rounded-xl text-xs text-gray-600">
          Uploading to <span className="font-bold text-[#021422]">{selectedMilestoneName}</span>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex items-center gap-3 rounded-xl border cursor-pointer px-4 py-4 transition-colors ${
          dragging ? "border-[#021422] bg-[#021422]/5" : selectedFile ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50 hover:border-gray-300"
        }`}
      >
        <input ref={fileInputRef} type="file" accept={ACCEPTED} className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-100`}>
          <Upload size={14} className="text-gray-500" />
        </div>
        {selectedFile ? (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">{selectedFile.name}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{formatFileSize(selectedFile.size)}</p>
          </div>
        ) : (
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600">Drop file or <span className="font-bold text-[#021422]">browse</span></p>
            <p className="text-[10px] text-gray-400 mt-0.5">{ACCEPTED.replace(/\./g, "").replace(/,/g, " · ").toUpperCase()}</p>
          </div>
        )}
        {selectedFile && (
          <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setTitle(""); }}
            className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 shrink-0 transition-colors">
            <X size={9} className="text-gray-400" />
          </button>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Document Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Formwork Method Statement"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422]/20 focus:border-[#021422] transition-colors" />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
          Description <span className="normal-case font-normal text-gray-400">(optional)</span>
        </label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
          placeholder="Brief summary of what this document covers…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422]/20 focus:border-[#021422] resize-none transition-colors" />
      </div>

      {error && (<div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
        <span className="text-xs text-red-600 font-medium">{error}</span>
      </div>)}

      <button type="submit" disabled={uploadMutation.isPending}
        className="w-full py-3 rounded-xl bg-[#021422] text-white text-sm font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
        <Plus size={14} /> Upload Document
      </button>
    </form>
  );
}

// ─── Document Card ─────────────────────────────────────────

function DocumentCard({ doc, milestones, onDelete }: { doc: InstructionDocument; milestones: Milestone[]; onDelete: () => void }) {
  const milestoneName = milestones.find((m) => m.id === doc.milestoneId)?.name;
  const iconBg = FILE_TYPE_BG[doc.fileType] ?? "bg-gray-50";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm group hover:shadow-md hover:border-gray-200 transition-all">
      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
        className="flex gap-3 p-4 cursor-pointer">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
          <FileIcon type={doc.fileType} size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-sm text-[#021422] truncate leading-tight">{doc.title}</p>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{doc.fileName} · {doc.fileSize} · {doc.uploadedBy} · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
          {doc.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{doc.description}</p>}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#021422]/8 text-[#021422] text-[10px] font-bold">{DOCUMENT_CATEGORY_LABELS[doc.category]}</span>
            {milestoneName && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
                <Layers size={8} /> {milestoneName}
              </span>
            )}
          </div>
        </div>
      </a>
      <div className="flex items-center gap-1 px-4 pb-3">
        {doc.fileUrl && (
          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-gray-500 hover:text-[#021422] hover:bg-gray-100 transition-colors"
            onClick={(e) => e.stopPropagation()}>
            <Download size={11} /> Download
          </a>
        )}
        <button onClick={onDelete}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────

const CATEGORIES: DocumentCategory[] = ["drawings", "wbs", "project_cost", "other"];

export default function ProjectDocumentsPage({ projectId, projectName, header }: ProjectDocumentsPageProps) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState("");
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>("drawings");
  const [uploadKey, setUploadKey] = useState(0);

  const milestonesQuery = useQuery({
    queryKey: milestoneKeys.lists(projectId),
    queryFn: async () => {
      const res = await milestoneService.list(projectId);
      const raw = res.data as MilestoneApiResponse[] | { results?: MilestoneApiResponse[] };
      const arr = Array.isArray(raw) ? raw : (raw?.results ?? []);
      return arr.map(milestoneFromApi)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));
    },
    placeholderData: (prev) => prev,
  });

  const milestones = milestonesQuery.data ?? [];

  const docsQuery = useQuery({
    queryKey: selectedMilestoneId
      ? documentKeys.byMilestone(projectId, selectedMilestoneId)
      : [...documentKeys.all(projectId), "all"],
    queryFn: async () => {
      if (selectedMilestoneId) {
        const res = await documentService.list(projectId, selectedMilestoneId);
        return (res.data as unknown as DocumentApiResponse[]).map((d) => documentFromApi(d, selectedMilestoneId));
      }
      const results = await Promise.all(
        milestones.map(ms =>
          documentService.list(projectId, ms.id).then(res =>
            (res.data as unknown as DocumentApiResponse[]).map((d) => documentFromApi(d, ms.id)),
          ),
        ),
      );
      return results.flat();
    },
    enabled: milestones.length > 0,
    placeholderData: (prev) => prev,
  });

  const allDocs = docsQuery.data ?? [];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const doc of allDocs) {
      counts[doc.category] = (counts[doc.category] || 0) + 1;
    }
    return counts;
  }, [allDocs]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentService.delete(projectId, selectedMilestoneId || milestones.find(m => allDocs.find(d => d.id === id)?.milestoneId === m.id)?.id || "", id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.all(projectId) });
      toast.success("Document deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const filtered = allDocs.filter(
    (d) =>
      d.category === activeCategory &&
      (d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.fileName.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="pb-20">
      {header}

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: Document area */}
          <div className="lg:col-span-3 space-y-4">

            {/* Milestone selector */}
            <select
              value={selectedMilestoneId}
              onChange={(e) => setSelectedMilestoneId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#021422]/20 focus:border-[#021422] transition-colors"
            >
              <option value="">All Milestones</option>
              {milestones.map((ms) => (
                <option key={ms.id} value={ms.id}>{ms.name}</option>
              ))}
            </select>

            {/* Category tabs */}
            <div className="flex gap-1 border-b border-gray-200">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                    activeCategory === cat ? "border-[#021422] text-[#021422]" : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}>
                  {DOCUMENT_CATEGORY_LABELS[cat]}
                  {categoryCounts[cat] !== undefined && (
                    <span className="ml-1.5 text-[10px] font-normal text-gray-400">{categoryCounts[cat]}</span>
                  )}
                </button>
              ))}
            </div>

            <div>
              <h2 className="font-bold text-[#021422] text-sm">{DOCUMENT_CATEGORY_LABELS[activeCategory]}</h2>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or file name…"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021422]/20 focus:border-[#021422] bg-white transition-colors" />
            </div>

            {docsQuery.isPending ? (
              <div className="text-center text-sm text-gray-400 py-8">Loading documents...</div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-14 flex flex-col items-center gap-3 text-center">
                <FileText size={32} className="text-gray-300" />
                <p className="text-sm font-medium text-gray-400">
                  {allDocs.length === 0 ? "No documents uploaded yet" : "No documents match your search"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} milestones={milestones} onDelete={() => deleteMutation.mutate(doc.id)} />
                ))}
              </div>
            )}
          </div>

          {/* Right: Upload Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
              <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                <h2 className="font-bold text-sm text-[#021422] uppercase tracking-widest">
                  Upload Document
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Attached automatically to all tasks in the same milestone
                </p>
              </div>
              <div className="p-5">
                <UploadForm
                  key={uploadKey}
                  projectId={projectId}
                  milestones={milestones}
                  category={activeCategory}
                  defaultMilestoneId={selectedMilestoneId}
                  onUploaded={() => setUploadKey((k) => k + 1)}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
