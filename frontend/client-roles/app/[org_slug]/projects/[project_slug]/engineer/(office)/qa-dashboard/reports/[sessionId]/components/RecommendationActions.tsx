"use client";

import { Lightbulb } from 'lucide-react';
import type { Recommendation } from '@/lib/types/report';

interface RecommendationActionsProps {
  recommendations: Recommendation[];
  reportId: string;
  onSendToContractor: () => void;
  onApproveWork: () => void;
  onReinspect: () => void;
}

const RecommendationActions = ({
  recommendations,
  reportId: _reportId,
  onSendToContractor,
  onApproveWork,
  onReinspect,
}: RecommendationActionsProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={18} className="text-yellow-500" />
          <h3 className="text-sm font-bold text-gray-900">Recommendations</h3>
        </div>

        <ol className="space-y-3 mb-6">
          {recommendations.map((rec, idx) => (
            <li key={rec.id} className="flex gap-3">
              <span className="text-sm font-bold text-gray-400 flex-shrink-0">{idx + 1}.</span>
              <span className="text-sm text-gray-700">{rec.text}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap gap-2 px-5 pb-5">
        <button
          onClick={onSendToContractor}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#021422] hover:bg-gray-800 rounded-lg transition-colors"
        >
          Send to Contractor
        </button>
        <button
          onClick={onApproveWork}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          Approve Work
        </button>
        <button
          onClick={onReinspect}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Request Re-inspection
        </button>
      </div>
    </div>
  );
};

export default RecommendationActions;
