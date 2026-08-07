"use client";

import { useState, useMemo } from "react";
import { FileText, Scan, Upload, Camera, Eye } from "lucide-react";
import type { TaskDocument, DocumentType } from "../types";

interface InstructionsTabProps {
  documents?: TaskDocument[];
  taskId?: string;
  onUpdate?: (taskId: string, updates: Partial<{ instructions: { documents: TaskDocument[] } }>) => void;
  isReadOnly?: boolean;
}

const DOC_ICONS: Record<DocumentType, React.ElementType> = {
  drawing: FileText,
  method_statement: FileText,
  ar_scope: Scan,
  photo: Camera,
  report: FileText,
};

const DOC_COLORS: Record<DocumentType, string> = {
  drawing: "bg-blue-50 text-[#007AFF]",
  method_statement: "bg-purple-50 text-purple-600",
  ar_scope: "bg-green-50 text-green-600",
  photo: "bg-orange-50 text-orange-600",
  report: "bg-gray-50 text-gray-600",
};

export default function InstructionsTab({ documents, taskId, onUpdate, isReadOnly = false }: InstructionsTabProps) {
  const [localAdditions, setLocalAdditions] = useState<TaskDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  const allDocs = useMemo(() => {
    if (isReadOnly) return documents || [];
    const propIds = new Set((documents || []).map((d) => d.id));
    const filtered = localAdditions.filter((d) => !propIds.has(d.id));
    return [...(documents || []), ...filtered];
  }, [documents, localAdditions, isReadOnly]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !taskId) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newDoc: TaskDocument = {
        id: `doc-${taskId}-${Date.now()}`,
        title: file.name,
        type: file.type.startsWith("image/") ? "photo" : "report",
        url: ev.target?.result as string,
        uploadedAt: new Date().toISOString().split("T")[0],
        uploadedBy: "Current User",
      };
      setLocalAdditions((prev) => [...prev, newDoc]);
      onUpdate?.(taskId, { instructions: { documents: [...allDocs, newDoc] } });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (!allDocs || allDocs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <FileText size={48} className="mb-4" />
        <p className="text-sm font-semibold">No documents linked to this task</p>
        {!isReadOnly && (
          <>
            <p className="text-xs text-gray-400 mt-1">Upload drawings, method statements, or AR references</p>
            <label className="mt-4 px-4 py-2 bg-[#007AFF] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Upload size={14} />
              Upload Document
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.dwg,.doc,.docx" onChange={handleUpload} className="hidden" />
            </label>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#021422] uppercase tracking-wider">
          Linked Documents ({allDocs.length})
        </h4>
        {!isReadOnly && (
          <label className="px-3 py-1.5 bg-[#007AFF] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-blue-600 transition-colors flex items-center gap-1.5">
            <Upload size={12} />
            Upload
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.dwg,.doc,.docx" onChange={handleUpload} className="hidden" />
          </label>
        )}
      </div>

      <div className="space-y-3">
        {allDocs.map((doc: TaskDocument) => {
          const Icon = DOC_ICONS[doc.type] ?? FileText;
          const colorClass = DOC_COLORS[doc.type] ?? "bg-gray-50 text-gray-600";
          return (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#021422] truncate">{doc.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {doc.uploadedBy} &middot; {doc.uploadedAt}
                </p>
              </div>
              <button className="shrink-0 px-3 py-1.5 bg-[#007AFF] text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1">
                <Eye size={12} />
                View
              </button>
            </div>
          );
        })}
      </div>

      {uploading && (
        <div className="flex items-center justify-center py-4 text-gray-400 text-sm">
          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Uploading...
        </div>
      )}
    </div>
  );
}
