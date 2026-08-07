"use client";

import { Check, X } from 'lucide-react';
import type { ChecklistResult } from '@/lib/types/report';

interface ChecklistResultsTableProps {
  results: ChecklistResult[];
}

const ChecklistResultsTable = ({ results }: ChecklistResultsTableProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#021422] text-white">
              <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider">
                Checklist Item
              </th>
              <th className="text-right py-3 px-5 text-xs font-semibold uppercase tracking-wider w-32">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr
                key={result.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-5">
                  <span className="text-sm text-gray-700">{result.description}</span>
                </td>
                <td className="py-3 px-5 text-right">
                  {result.passed ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                      <Check size={14} />
                      PASSED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600">
                      <X size={14} />
                      FAILED
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span>
          {results.filter((r) => r.passed).length} of {results.length} passed
        </span>
        <span>
          {results.filter((r) => !r.passed).length} failed
        </span>
      </div>
    </div>
  );
};

export default ChecklistResultsTable;
