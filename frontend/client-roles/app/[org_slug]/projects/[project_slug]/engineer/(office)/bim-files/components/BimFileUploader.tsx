"use client";

import { useState, useRef } from "react";
import { Upload, File } from "lucide-react";
import type { BimFileFormat } from "@/lib/types/bimFile";

const ACCEPTED_EXTENSIONS: Record<string, BimFileFormat> = {
  ifc: "IFC",
};

const ACCEPT_STRING = ".ifc";

interface BimFileUploaderProps {
  onUpload: (file: File, format?: BimFileFormat, arSessionId?: number) => void;
  uploading: boolean;
  arSessions: { id: number; name: string }[];
}

const BimFileUploader = ({
  onUpload,
  uploading,
  arSessions,
}: BimFileUploaderProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<BimFileFormat | null>(
    null,
  );
  const [formatOverride, setFormatOverride] = useState<BimFileFormat | "">("");
  const [arSessionId, setArSessionId] = useState<number | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectFormat = (filename: string): BimFileFormat | null => {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext && ACCEPTED_EXTENSIONS[ext] ? ACCEPTED_EXTENSIONS[ext] : null;
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    const format = detectFormat(file.name);
    setDetectedFormat(format);
    setFormatOverride("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    const format = (formatOverride || detectedFormat) as
      | BimFileFormat
      | undefined;
    onUpload(selectedFile, format, arSessionId);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
        Upload BIM Model
      </h3>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-400 bg-blue-50"
            : selectedFile
              ? "border-green-300 bg-green-50"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_STRING}
          onChange={handleChange}
          className="hidden"
        />

        {selectedFile ? (
          <div>
            <File size={28} className="text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-800">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatBytes(selectedFile.size)}
            </p>
            {detectedFormat && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                {detectedFormat}
              </span>
            )}
            <p className="text-xs text-gray-400 mt-2">Click to change file</p>
          </div>
        ) : (
          <div>
            <Upload size={28} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">
              Drop a BIM file here or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">Accepted: IFC only</p>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Format
            </label>
            <select
              value={formatOverride || detectedFormat || ""}
              onChange={(e) =>
                setFormatOverride(e.target.value as BimFileFormat | "")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">
                {detectedFormat ? `Auto: ${detectedFormat}` : "Auto-detect"}
              </option>
              {Object.values(ACCEPTED_EXTENSIONS).map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt}
                </option>
              ))}
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          {arSessions.length > 0 && (
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                AR Session
              </label>
              <select
                value={arSessionId ?? ""}
                onChange={(e) =>
                  setArSessionId(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">(none)</option>
                {arSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="px-5 py-2 text-sm font-medium text-white bg-[#021422] hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {uploading ? 'Uploading...' : 'Upload BIM Model'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BimFileUploader;
