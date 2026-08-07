"use client";

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';
import type { ProjectMembership } from '@/lib/stores/authStore';

interface AssignProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceName: string;
  orgSlug: string;
  onAssign: (projectId: string, projectName: string) => Promise<void>;
  assigning: boolean;
}

const AssignProjectModal = ({
  isOpen,
  onClose,
  deviceName,
  orgSlug,
  onAssign,
  assigning,
}: AssignProjectModalProps) => {
  const { getProjectsByOrg } = useMemberships();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const projects = getProjectsByOrg(orgSlug);

  const handleConfirm = async () => {
    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }
    setError('');
    const project = projects.find((p: ProjectMembership) => p.uuid === selectedProjectId);
    await onAssign(selectedProjectId, project?.name || 'Unknown Project');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-1">Assign to Project</h2>
        <p className="text-sm text-gray-500 mb-6">
          Assign {deviceName} to a project
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setError('');
              }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white ${
                error ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select a project...</option>
              {projects.map((p: ProjectMembership) => (
                <option key={p.uuid || p.slug} value={p.uuid || ''}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
            {error && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle size={12} />
                {error}
              </p>
            )}
            {projects.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">
                No projects available in this organization. Create a project first.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={assigning || !selectedProjectId}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#021422] hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            {assigning ? 'Assigning...' : 'Assign Device'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignProjectModal;
