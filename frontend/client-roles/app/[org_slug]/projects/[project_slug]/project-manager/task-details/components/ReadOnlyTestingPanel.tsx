"use client";

import { FileText, Beaker, Calendar, Building2, ClipboardList, User, CheckCircle, FlaskConical } from "lucide-react";
import type { Task, TaskTest } from "../types";

interface ReadOnlyTestingPanelProps {
  task: Task;
}

export default function ReadOnlyTestingPanel({ task }: ReadOnlyTestingPanelProps) {
  const taskTests = task.tests || [];
  const isConcreteTask = task.taskType === "concrete";
  const hasConcreteTestResults = task.concreteTestResultsUploaded === true;

  return (
    <div className="space-y-4 mx-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#021422] uppercase tracking-wider">
          Task Tests
        </h3>
        <div className="flex items-center gap-2">
          {isConcreteTask && (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold ${
              hasConcreteTestResults
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              <FlaskConical size={12} />
              {hasConcreteTestResults ? "Test Results Uploaded" : "Test Results Required"}
            </span>
          )}
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
            {taskTests.length} test{taskTests.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Testing Authoring Section */}
      {task.testingCreatedBy || task.testingApprovedBy ? (
        <div className="bg-gray-50 rounded-xl p-4">
          <h5 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
            Testing Authoring
          </h5>
          <div className="grid grid-cols-2 gap-4">
            {task.testingCreatedBy && (
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-[#021422] flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Created By
                  </p>
                  <p className="text-sm font-semibold text-[#021422]">
                    {task.testingCreatedBy}
                  </p>
                </div>
              </div>
            )}
            {task.testingApprovedBy && (
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-green-200">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                  <CheckCircle size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">
                    Approved By
                  </p>
                  <p className="text-sm font-semibold text-[#021422]">
                    {task.testingApprovedBy}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {taskTests.map((test) => (
          <div
            key={test.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            {/* Test Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#021422]" />
                <span className="text-sm font-bold text-[#021422]">
                  {test.label || "Unnamed Test"}
                </span>
              </div>
            </div>

        {/* Test Details */}
        <div className="p-4">
          <div className="grid grid-cols-[20px_1fr] gap-x-3 gap-y-3">
            {/* Test Category */}
            <ClipboardList size={16} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Test Category</p>
              <p className="text-sm font-medium text-[#021422]">{test.type || "Not specified"}</p>
            </div>

            {/* Test Date */}
            <Calendar size={16} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Test Date</p>
              <p className="text-sm font-medium text-[#021422]">{test.dateAdded || "Not scheduled"}</p>
            </div>

            {/* Production Date */}
            <Calendar size={16} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Production Date</p>
              <p className="text-sm font-medium text-[#021422]">{test.productionDate || "Not specified"}</p>
            </div>

            {/* Company Name */}
            <Building2 size={16} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Company</p>
              <p className="text-sm font-medium text-[#021422]">{test.companyName || "Not specified"}</p>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded min-h-[40px]">
              {test.notes || "No notes added"}
            </p>
          </div>
        </div>
          </div>
        ))}
      </div>
    </div>
  );
}
