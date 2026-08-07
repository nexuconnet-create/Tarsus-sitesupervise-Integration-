"use client";

import {
  FileText,
  Beaker,
  Calendar,
  Building2,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Task, TaskTest, TestResult } from "../types";
import { formatDate } from "@/lib/dateUtils";

interface CrewTestingPanelProps {
  task: Task;
}

export default function CrewTestingPanel({ task }: CrewTestingPanelProps) {
  const taskTests = task.tests || [];

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#021422] uppercase tracking-wider">
          Task Tests
        </h3>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
          {taskTests.length} test{taskTests.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Test List */}
      <div className="space-y-3">
        {taskTests.map((test) => {
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

                {/* Test Results */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Test Results
                  </p>

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
                                <CheckCircle2 size={16} className="text-green-500" />
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
                            </div>
                          </div>

                          {/* Photo preview */}
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
                      <Beaker size={24} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-xs">No test results uploaded yet</p>
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
    </div>
  );
}
