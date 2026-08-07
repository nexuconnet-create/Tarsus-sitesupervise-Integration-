"use client";

import { Camera, Box } from 'lucide-react';
import type { ReportIssue } from '@/lib/types/report';

interface IssuesDetectedListProps {
  issues: ReportIssue[];
}

const IssuesDetectedList = ({ issues }: IssuesDetectedListProps) => {
  if (issues.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
        <p className="text-sm text-green-600 font-medium">No issues detected</p>
        <p className="text-xs text-gray-400 mt-1">All items passed inspection</p>
      </div>
    );
  }

  const highCount = issues.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase bg-red-100 text-red-700">
          {highCount} High Severity
        </span>
      </div>

      {issues.map((issue) => (
        <div
          key={issue.id}
          className="bg-white rounded-xl border border-red-200 p-5 shadow-sm"
        >
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-900">{issue.title}</h4>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
              Issue
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Measured</p>
              <p className="text-sm font-bold text-gray-900">{issue.measured}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Tolerance</p>
              <p className="text-sm font-bold text-gray-900">{issue.tolerance}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-red-400 uppercase mb-0.5">Deviation</p>
              <p className="text-sm font-bold text-red-700">{issue.deviation}</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">AI Root Cause</p>
            <p className="text-sm text-gray-700">{issue.aiRootCause}</p>
          </div>

          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Camera size={12} />
              View AR Snapshot
            </button>
            {issue.bimElementId && (
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <Box size={12} />
                View BIM Element
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IssuesDetectedList;
