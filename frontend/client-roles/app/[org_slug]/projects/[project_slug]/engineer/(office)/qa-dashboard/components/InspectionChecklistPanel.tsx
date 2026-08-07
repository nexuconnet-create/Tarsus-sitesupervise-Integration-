"use client";

import { Check, Loader2, Square, X } from 'lucide-react';
import type { ARChecklistItem, ChecklistItemStatus } from '@/lib/types/arSession';

interface InspectionChecklistPanelProps {
  items: ARChecklistItem[];
  active: boolean;
}

const statusConfig: Record<ChecklistItemStatus, { icon: typeof Check; color: string; label: string }> = {
  completed: { icon: Check, color: 'text-green-500', label: 'Completed' },
  in_progress: { icon: Loader2, color: 'text-blue-500', label: 'In Progress' },
  pending: { icon: Square, color: 'text-gray-300', label: 'Pending' },
  failed: { icon: X, color: 'text-red-500', label: 'Failed' },
};

const InspectionChecklistPanel = ({ items, active }: InspectionChecklistPanelProps) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
        <p className="text-gray-500 text-sm">No checklist items</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {active && (
        <div className="bg-blue-50 border-b border-blue-200 px-5 py-2.5 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-medium text-blue-700">Voice Commands Active</span>
        </div>
      )}

      <div className="p-5">
        <div className="space-y-1">
          {items.map((item) => {
            const config = statusConfig[item.status];
            const Icon = config.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Icon
                  size={18}
                  className={`${config.color} ${item.status === 'in_progress' ? 'animate-spin' : ''} flex-shrink-0`}
                />
                <span className={`text-sm flex-1 ${item.status === 'completed' ? 'text-gray-400' : 'text-gray-700'}`}>
                  {item.description}
                </span>
                <span className={`text-xs font-medium ${item.status === 'completed' ? 'text-green-600' : item.status === 'in_progress' ? 'text-blue-600' : item.status === 'failed' ? 'text-red-600' : 'text-gray-400'}`}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>
            {items.filter((i) => i.status === 'completed').length}/{items.length} completed
          </span>
          {active && <span className="text-gray-300">Voice-activated</span>}
        </div>
      </div>
    </div>
  );
};

export default InspectionChecklistPanel;
