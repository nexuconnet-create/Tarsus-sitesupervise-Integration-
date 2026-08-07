"use client";

import { FileText, Scan, Upload, Camera, Eye } from "lucide-react";
import type { TaskDocument, DocumentType } from "../types";

interface InstructionsTabProps {
  documents?: TaskDocument[];
  taskId?: string;
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

export default function InstructionsTab({ documents, taskId, isReadOnly = false }: InstructionsTabProps) {
  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <FileText size={48} className="mb-4" />
        <p className="text-sm font-semibold">No documents linked to this task</p>
        {!isReadOnly && (
          <p className="text-xs text-gray-400 mt-1">Documents will appear here when added</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-[#021422] uppercase tracking-wider">
        Linked Documents ({documents.length})
      </h4>

      <div className="space-y-3">
        {documents.map((doc: TaskDocument) => {
          const Icon = DOC_ICONS[doc.type];
          const colorClass = DOC_COLORS[doc.type];
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
    </div>
  );
}
