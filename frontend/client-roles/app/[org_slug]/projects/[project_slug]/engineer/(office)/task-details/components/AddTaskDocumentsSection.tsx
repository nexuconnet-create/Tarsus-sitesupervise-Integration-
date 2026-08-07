"use client";

import { useState } from "react";
import { Plus, Trash2, FileText, Link as LinkIcon } from "lucide-react";
import type { TaskDocument } from "../types";

interface AddTaskDocumentsSectionProps {
  documents: TaskDocument[];
  linkedDrawings: string;
  methodStatement: string;
  arScopeReference: string;
  onDocumentsChange: (docs: TaskDocument[]) => void;
  onLinkedDrawingsChange: (value: string) => void;
  onMethodStatementChange: (value: string) => void;
  onArScopeChange: (value: string) => void;
}

const DOC_TYPES = [
  { value: "drawing", label: "Drawing" },
  { value: "method_statement", label: "Method Statement" },
  { value: "ar_scope", label: "AR Scope" },
  { value: "photo", label: "Photo" },
  { value: "report", label: "Report" },
];

export default function AddTaskDocumentsSection({
  documents,
  linkedDrawings,
  methodStatement,
  arScopeReference,
  onDocumentsChange,
  onLinkedDrawingsChange,
  onMethodStatementChange,
  onArScopeChange,
}: AddTaskDocumentsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("drawing");

  const handleAdd = () => {
    if (!docName.trim()) return;
const newDoc: TaskDocument = {
  id: `doc-${Date.now()}`,
  title: docName,
  type: docType as TaskDocument["type"],
  url: "",
  uploadedAt: new Date().toISOString(),
  uploadedBy: "",
};
    onDocumentsChange([...documents, newDoc]);
    setShowForm(false);
    setDocName("");
  };

  const handleRemove = (id: string) => {
    onDocumentsChange(documents.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Reference Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Linked Drawing
          </label>
          <div className="relative">
            <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={linkedDrawings}
              onChange={(e) => onLinkedDrawingsChange(e.target.value)}
              placeholder="e.g., A-304"
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Method Statement
          </label>
          <div className="relative">
            <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={methodStatement}
              onChange={(e) => onMethodStatementChange(e.target.value)}
              placeholder="e.g., MS-22"
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            AR Scope Reference
          </label>
          <div className="relative">
            <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={arScopeReference}
              onChange={(e) => onArScopeChange(e.target.value)}
              placeholder="e.g., AR-2024-BS"
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-white">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={16} className="text-gray-400" />
              Attached Documents ({documents.length})
            </h4>
          </div>
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <div key={doc.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{doc.type.replace("_", " ")}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(doc.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Document */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Attach Document
        </button>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Add Document</h4>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Document Type
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Document Name
            </label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g., Foundation Detail Drawing"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!docName.trim()}
              className="flex-1 py-2 bg-[#021422] text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
            >
              Add Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
