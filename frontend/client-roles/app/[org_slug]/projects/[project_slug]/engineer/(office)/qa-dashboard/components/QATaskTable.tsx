"use client";

import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { QATask } from '@/lib/mockData/arSessions';

interface QATaskTableProps {
  tasks: QATask[];
  loading: boolean;
  onInspect: (taskId: string) => void;
}

const priorityConfig = {
  high: { bg: 'bg-red-100', text: 'text-red-700', label: 'HIGH' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'MEDIUM' },
  low: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'LOW' },
};

const QATaskTable = ({ tasks, loading, onInspect }: QATaskTableProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <AlertTriangle size={24} className="text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No QA tasks for today</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#021422] text-white">
              <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider">Task</th>
              <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider">Location</th>
              <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider">Priority</th>
              <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider">Progress</th>
              <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider">Status</th>
              <th className="py-3 px-5" />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const priority = priorityConfig[task.priority];
              return (
                <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-5">
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{task.wp}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{task.title}</div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-sm text-gray-700">{task.location}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${priority.bg} ${priority.text}`}>
                      {task.priority === 'high' && <span className="mr-1 text-[10px]">&#x1F534;</span>}
                      {task.priority === 'medium' && <span className="mr-1 text-[10px]">&#x1F7E1;</span>}
                      {priority.label}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      task.status === 'behind'
                        ? 'bg-red-100 text-red-700'
                        : task.status === 'ahead'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}>
                      {task.status === 'behind' ? `${task.progress}% Behind` : task.status === 'ahead' ? 'Ahead' : 'On Track'}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => onInspect(task.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#021422] hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      Inspect
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QATaskTable;
