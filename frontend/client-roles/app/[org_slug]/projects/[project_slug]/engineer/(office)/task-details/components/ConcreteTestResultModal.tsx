"use client";

import { useState } from "react";
import { X, Upload, CheckCircle, XCircle, Plus, Trash2 } from "lucide-react";
import type { TestResult, TestChecklistItem } from "../types";

const createLocalId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random()}`;

interface ConcreteTestResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (result: TestResult) => void;
}

const CONCRETE_TEST_TYPES = [
  "Slump Test",
  "Flow Table Test",
  "Compaction Factor Test",
  "Vee-Bee Test",
  "Air Content Test",
  "Compressive Strength Test",
  "Split Tensile Test",
  "Flexural Strength Test",
  "Modulus of Elasticity Test",
  "Rebound Hammer Test",
  "Ultrasonic Pulse Velocity (UPV)",
  "Core Test",
  "Half-Cell Potential Test",
  "Impact Echo Test",
];

export default function ConcreteTestResultModal({
  isOpen,
  onClose,
  onSave,
}: ConcreteTestResultModalProps) {
  const [testType, setTestType] = useState(CONCRETE_TEST_TYPES[0]);
  const [customTestType, setCustomTestType] = useState("");
  const [inspector, setInspector] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [overallResult, setOverallResult] = useState<"pass" | "fail" | "pending">("pending");
  const [notes, setNotes] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [checklist, setChecklist] = useState<TestChecklistItem[]>([
    { id: "check-initial", description: "", passed: null },
  ]);

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    setChecklist((prev) => [
      ...prev,
      { id: `check-${Date.now()}`, description: "", passed: null },
    ]);
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChecklistChange = (id: string, field: keyof TestChecklistItem, value: string | boolean | null) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setPhotos((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const result: TestResult = {
      id: createLocalId("result"),
      type: testType === "Custom" ? customTestType : testType,
      customLabel: testType === "Custom" ? customTestType : undefined,
      date,
      inspector,
      checklist: checklist.filter((item) => item.description.trim() !== ""),
      overallResult,
      reportUrl: reportFile ? URL.createObjectURL(reportFile) : undefined,
      photos: photos.map((photo) => URL.createObjectURL(photo)),
      notes: notes || undefined,
    };

    onSave(result);
    handleClose();
  };

  const handleClose = () => {
    setTestType(CONCRETE_TEST_TYPES[0]);
    setCustomTestType("");
    setInspector("");
    setDate(new Date().toISOString().split("T")[0]);
    setOverallResult("pending");
    setNotes("");
    setReportFile(null);
    setPhotos([]);
    setChecklist([{ id: `check-${Date.now()}`, description: "", passed: null }]);
    onClose();
  };

  const isFormValid = () => {
    const testTypeName = testType === "Custom" ? customTestType : testType;
    return testTypeName.trim() !== "" && inspector.trim() !== "";
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
          <h2 className="text-base font-bold text-[#021422]">Upload Concrete Test Result</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-[#021422]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Test Type Selection */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
              Test Type *
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
            >
              {CONCRETE_TEST_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value="Custom">Custom Test</option>
            </select>
          </div>

          {/* Custom Test Type Input */}
          {testType === "Custom" && (
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                Custom Test Name *
              </label>
              <input
                type="text"
                value={customTestType}
                onChange={(e) => setCustomTestType(e.target.value)}
                placeholder="Enter test name..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
            </div>
          )}

          {/* Inspector and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                Inspector Name *
              </label>
              <input
                type="text"
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                placeholder="Enter inspector name..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                Test Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Overall Result */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
              Overall Result *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOverallResult("pass")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  overallResult === "pass"
                    ? "bg-green-100 text-green-700 border-2 border-green-500"
                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <CheckCircle size={16} />
                Pass
              </button>
              <button
                type="button"
                onClick={() => setOverallResult("fail")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  overallResult === "fail"
                    ? "bg-red-100 text-red-700 border-2 border-red-500"
                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <XCircle size={16} />
                Fail
              </button>
              <button
                type="button"
                onClick={() => setOverallResult("pending")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  overallResult === "pending"
                    ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-500"
                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                Pending
              </button>
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                Test Checklist
              </label>
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="flex items-center gap-1 text-xs font-bold text-[#007AFF] hover:text-blue-700"
              >
                <Plus size={12} />
                Add Item
              </button>
            </div>
            <div className="space-y-2">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleChecklistChange(item.id, "description", e.target.value)}
                    placeholder="Checklist item..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  />
                  <select
                    value={item.passed === null ? "" : item.passed ? "pass" : "fail"}
                    onChange={(e) =>
                      handleChecklistChange(
                        item.id,
                        "passed",
                        e.target.value === "" ? null : e.target.value === "pass"
                      )
                    }
                    className="w-24 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
                  >
                    <option value="">N/A</option>
                    <option value="pass">Pass</option>
                    <option value="fail">Fail</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Report Upload */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
              Test Report (PDF, DOC, DOCX)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-[#007AFF] transition-colors">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                className="hidden"
                id="report-upload"
              />
              <label htmlFor="report-upload" className="cursor-pointer">
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {reportFile ? reportFile.name : "Click to upload report"}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
              </label>
            </div>
          </div>

          {/* Photos Upload */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
              Test Photos
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-[#007AFF] transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload photos</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB each</p>
              </label>
            </div>
            {photos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-xs text-gray-600">{photo.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional observations, deviations, or comments..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="flex-1 py-2.5 rounded-lg bg-[#021422] text-white text-sm font-bold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Test Result
          </button>
        </div>
      </div>
    </div>
  );
}
