"use client";

import { useState } from 'react';
import { X, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { trimbleDeviceService } from '@/lib/services/trimbleDeviceService';
import { useMemberships } from '@/lib/hooks/useMemberships';
import type { TrimbleDevice } from '@/lib/types/trimbleDevice';
import type { ProjectMembership } from '@/lib/stores/authStore';
import AssignProjectModal from './AssignProjectModal';

interface PairDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgSlug: string;
  onPaired: (device: TrimbleDevice) => void;
}

// Register → assign → done. Pairing (QR + printable PDF) is obtained afterwards
// from the device's "QR Code" button or the AR Hub → Devices on Site.
type WizardStep = 'register' | 'assign' | 'done';

const PairDeviceModal = ({ isOpen, onClose, orgSlug, onPaired }: PairDeviceModalProps) => {
  const [step, setStep] = useState<WizardStep>('register');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [createdDevice, setCreatedDevice] = useState<TrimbleDevice | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const { getProjectsByOrg } = useMemberships();

  const reset = () => {
    setName('');
    setNameError('');
    setStep('register');
    setCreatedDevice(null);
    setAssigning(false);
    setShowAssignModal(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const projects = getProjectsByOrg(orgSlug);

  const handleRegister = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Device name is required');
      return;
    }
    if (trimmed.length < 2) {
      setNameError('Device name must be at least 2 characters');
      return;
    }
    setNameError('');
    setRegistering(true);

    try {
      const res = await trimbleDeviceService.registerDevice(orgSlug, trimmed);
      setCreatedDevice(res.data);
      onPaired(res.data);
      setStep('assign');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      toast.error(axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to register device');
    } finally {
      setRegistering(false);
    }
  };

  const handleAssign = async (projectId: string, _projectName: string) => {
    if (!createdDevice) return;
    setAssigning(true);
    try {
      await trimbleDeviceService.assignDevice(projectId, createdDevice.uuid);
      toast.success('Device assigned to project');
      setShowAssignModal(false);
      setStep('done');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      toast.error(axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to assign device');
    } finally {
      setAssigning(false);
    }
  };

  const handleDone = () => {
    reset();
    onClose();
    toast.success('Device ready');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 z-10">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          {step === 'register' && (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Register New Device</h2>
              <p className="text-sm text-gray-500 mb-6">
                Enter a name for the new XR10 headset. A device token is generated automatically.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRegister();
                    }}
                    placeholder="e.g. XR10-Site-A-001"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      nameError ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                    autoFocus
                  />
                  {nameError && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle size={12} />
                      {nameError}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#021422] hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  {registering ? 'Registering...' : 'Register Device'}
                </button>
              </div>
            </>
          )}

          {step === 'assign' && createdDevice && (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Assign to Project</h2>
              <p className="text-sm text-gray-500 mb-2">
                Device: {createdDevice.name} (UUID: {createdDevice.uuid.slice(0, 8)}...)
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Assign the device to a project so it can access BIM models during AR sessions.
              </p>

              {projects.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          const proj = projects.find((p: ProjectMembership) => p.uuid === e.target.value);
                          handleAssign(e.target.value, proj?.name || '');
                        }
                      }}
                      disabled={assigning}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white disabled:opacity-50"
                      defaultValue=""
                    >
                      <option value="" disabled>Select a project...</option>
                      {projects.map((p: ProjectMembership) => (
                        <option key={p.uuid || p.slug} value={p.uuid || ''}>
                          {p.name} ({p.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-4">No projects available to assign.</p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep('register')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={() => setStep('done')}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#021422] hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Skip & Finish
                </button>
              </div>
            </>
          )}

          {step === 'done' && createdDevice && (
            <>
              <div className="flex flex-col items-center text-center py-2">
                <div className="p-3 rounded-full bg-green-50 mb-3">
                  <Check size={28} className="text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Device Registered</h2>
                <p className="text-sm text-gray-500 mb-6">
                  <span className="font-medium">{createdDevice.name}</span> is ready.
                  To pair it, open the device&apos;s <span className="font-medium">QR Code</span> action
                  (here or in the AR Hub → Devices on Site) and download the printable PDF to
                  place on the wall on site.
                </p>
              </div>

              <button
                onClick={handleDone}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>

      <AssignProjectModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        deviceName={createdDevice?.name || ''}
        orgSlug={orgSlug}
        onAssign={handleAssign}
        assigning={assigning}
      />
    </>
  );
};

export default PairDeviceModal;
