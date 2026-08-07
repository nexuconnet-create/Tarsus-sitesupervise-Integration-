"use client";

import { useState, useRef } from "react";
import {
  FileText,
  Beaker,
  Calendar,
  Building2,
  ClipboardList,
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Task, TaskTest, TestResult } from "../types";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/dateUtils";

interface CrewTestingPanelProps {
  task: Task;
  onUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export default function CrewTestingPanel({
  task,
  onUpdate,
}: CrewTestingPanelProps) {
  const taskTests = task.tests || [];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingTestId, setUploadingTestId] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<"file" | "image" | null>(null);
  const [localTests, setLocalTests] = useState<TaskTest[]>(() => task.tests || []);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (taskTests.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="text-center text-gray-500">
          <Beaker size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No tests configured for this task.</p>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (
    testId: string,
    files: FileList,
    type: "file" | "image",
  ) => {
    const test = localTests.find((t) => t.id === testId);
    if (!test) return;

    setUploadingTestId(testId);
    setUploadType(type);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);

    // Convert files to base64 for storage
    const uploadPromises = Array.from(files).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    // Create new test result
    const newResult: TestResult = {
      id: `result-${Date.now()}`,
      type: test.type,
      customLabel: type === "file" ? "Test Report" : "Test Photos",
      date: new Date().toISOString().split("T")[0],
      inspector: "Crew Manager", // Would come from user context
      checklist: [],
      overallResult: "pending",
      ...(type === "file"
        ? { reportUrl: uploadedFiles[0] }
        : { photos: uploadedFiles }),
    };

    // Update local tests
    const updatedTests = localTests.map((t) => {
      if (t.id === testId) {
        return {
          ...t,
          results: [...t.results, newResult],
          latestResult: newResult,
        };
      }
      return t;
    });

    setLocalTests(updatedTests);

    // Update parent
    if (onUpdate) {
      onUpdate(task.id, { tests: updatedTests });
    }

    toast.success(
      type === "file"
        ? "Test report uploaded successfully!"
        : "Test photos uploaded successfully!",
    );

    setUploadingTestId(null);
    setUploadProgress(0);
    setShowUploadModal(false);
  };

  const handleOpenUploadModal = (testId: string) => {
    setSelectedTestId(testId);
    setShowUploadModal(true);
  };

  const handleRemoveResult = (testId: string, resultId: string) => {
    const updatedTests = localTests.map((t) => {
      if (t.id === testId) {
        const updatedResults = t.results.filter((r) => r.id !== resultId);
        return {
          ...t,
          results: updatedResults,
          latestResult: updatedResults[updatedResults.length - 1] || undefined,
        };
      }
      return t;
    });

    setLocalTests(updatedTests);

    if (onUpdate) {
      onUpdate(task.id, { tests: updatedTests });
    }

    toast.success("Result removed");
  };

  const getResultStatus = (result?: TestResult) => {
    if (!result)
      return {
        label: "Not started",
        color: "text-gray-400",
        bg: "bg-gray-100",
      };
    switch (result.overallResult) {
      case "pass":
        return { label: "Passed", color: "text-green-600", bg: "bg-green-100" };
      case "fail":
        return { label: "Failed", color: "text-red-600", bg: "bg-red-100" };
      case "pending":
        return {
          label: "Pending Review",
          color: "text-yellow-600",
          bg: "bg-yellow-100",
        };
      default:
        return {
          label: "In Progress",
          color: "text-blue-600",
          bg: "bg-blue-100",
        };
    }
  };

  return (
    <div className="space-y-4 mx-6">
      {/* Upload Modal */}
      {showUploadModal && selectedTestId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-[#021422]">
                Upload Test Results
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload test documentation or photos for this test.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const isImage = e.target.files[0].type.startsWith("image/");
                    handleFileUpload(
                      selectedTestId,
                      e.target.files,
                      isImage ? "image" : "file",
                    );
                  }
                }}
              />

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setUploadType("file");
                    fileInputRef.current?.click();
                  }}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#007AFF] hover:bg-blue-50 transition-colors flex flex-col items-center gap-2"
                >
                  <FileText size={32} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Upload Report
                  </span>
                  <span className="text-xs text-gray-400">PDF, DOC, DOCX</span>
                </button>

                <button
                  onClick={() => {
                    setUploadType("image");
                    fileInputRef.current?.click();
                  }}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#007AFF] hover:bg-blue-50 transition-colors flex flex-col items-center gap-2"
                >
                  <ImageIcon size={32} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Upload Photos
                  </span>
                  <span className="text-xs text-gray-400">JPG, PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#021422] uppercase tracking-wider">
          Task Tests
        </h3>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
          {localTests.length} test{localTests.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Test List */}
      <div className="space-y-3">
        {localTests.map((test) => {
          const resultStatus = getResultStatus(test.latestResult);
          const hasResults = test.results.length > 0;

          return (
            <div
              key={test.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Test Header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#021422]" />
                    <span className="text-sm font-bold text-[#021422]">
                      {test.label || "Unnamed Test"}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${resultStatus.bg} ${resultStatus.color}`}
                  >
                    {resultStatus.label}
                  </span>
                </div>
              </div>

              {/* Test Details */}
              <div className="p-4">
                <div className="grid grid-cols-[20px_1fr] gap-x-3 gap-y-3">
                  <ClipboardList size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Test Category
                    </p>
                    <p className="text-sm font-medium text-[#021422]">
                      {test.type || "Not specified"}
                    </p>
                  </div>

                  <Calendar size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Created Date
                    </p>
                    <p className="text-sm font-medium text-[#021422]">
                      {formatDate(test.dateAdded)}
                    </p>
                  </div>

                  <Building2 size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Company
                    </p>
                    <p className="text-sm font-medium text-[#021422]">
                      {test.companyName || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Upload Section */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Test Results
                    </p>
                    <button
                      onClick={() => handleOpenUploadModal(test.id)}
                      className="px-3 py-1.5 bg-[#007AFF] text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1.5"
                    >
                      <Upload size={14} />
                      Upload Results
                    </button>
                  </div>

                  {/* Uploaded Results */}
                  {hasResults ? (
                    <div className="space-y-2">
                      {test.results.map((result, index) => (
                        <div
                          key={result.id}
                          className="bg-gray-50 rounded-lg p-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {result.reportUrl ? (
                                <FileText size={16} className="text-blue-500" />
                              ) : (
                                <ImageIcon
                                  size={16}
                                  className="text-green-500"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-[#021422]">
                                  {result.customLabel || `Result ${index + 1}`}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(result.date)} • {result.inspector}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {result.overallResult === "pass" && (
                                <span className="flex items-center gap-1 text-xs text-green-600">
                                  <CheckCircle2 size={12} />
                                  Pass
                                </span>
                              )}
                              {result.overallResult === "fail" && (
                                <span className="flex items-center gap-1 text-xs text-red-600">
                                  <AlertCircle size={12} />
                                  Fail
                                </span>
                              )}
                              <button
                                onClick={() =>
                                  handleRemoveResult(test.id, result.id)
                                }
                                className="p-1 hover:bg-red-100 rounded transition-colors"
                                title="Remove result"
                              >
                                <X
                                  size={14}
                                  className="text-gray-400 hover:text-red-500"
                                />
                              </button>
                            </div>
                          </div>

                          {/* Preview */}
                          {result.photos && result.photos.length > 0 && (
                            <div className="mt-2 flex gap-2 overflow-x-auto">
                              {result.photos.map((photo, photoIndex) => (
                                <img
                                  key={photoIndex}
                                  src={photo}
                                  alt={`Test photo ${photoIndex + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                              ))}
                            </div>
                          )}

                          {result.reportUrl && (
                            <a
                              href={result.reportUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-xs text-[#007AFF] hover:underline"
                            >
                              <FileText size={12} />
                              View Report
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400 bg-gray-50 rounded-lg">
                      <Upload
                        size={24}
                        className="mx-auto mb-2 text-gray-300"
                      />
                      <p className="text-xs">No test results uploaded yet</p>
                      <p className="text-[10px] mt-1">
                        Click &quot;Upload Results&quot; to add files or photos
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {test.notes && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded min-h-[40px]">
                      {test.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Progress */}
      {uploadingTestId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-700">Uploading...</p>
            <div className="w-48 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-[#007AFF] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
