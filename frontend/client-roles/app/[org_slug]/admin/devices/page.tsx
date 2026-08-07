"use client";

import { use, useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';
import { trimbleDeviceService } from '@/lib/services/trimbleDeviceService';
import { mockDevices } from '@/lib/mockData/devices';
import type { TrimbleDevice } from '@/lib/types/trimbleDevice';
import DeviceCard from './components/DeviceCard';
import PairDeviceModal from './components/PairDeviceModal';
import PairingQrModal from '@/components/ar/PairingQrModal';
import AssignProjectModal from './components/AssignProjectModal';
import toast from 'react-hot-toast';

interface DevicesPageProps {
  params: Promise<{ org_slug: string }>;
}

export default function DevicesPage({ params }: DevicesPageProps) {
  const { org_slug } = use(params);
  const { getOrg } = useMemberships();
  const org = getOrg(org_slug);

  const [devices, setDevices] = useState<TrimbleDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [qrTarget, setQrTarget] = useState<TrimbleDevice | null>(null);
  const [assignTarget, setAssignTarget] = useState<TrimbleDevice | null>(null);
  const [assigning, setAssigning] = useState(false);

  const fetchDevices = async () => {
    try {
      const res = await trimbleDeviceService.listDevices(org_slug);
      const list = Array.isArray(res.data) ? res.data : [];
      setDevices(list);
    } catch {
      setDevices(mockDevices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchDevices();
    };
    init();
  }, []);

  const handleRename = async (deviceUuid: string, newName: string) => {
    try {
      await trimbleDeviceService.renameDevice(org_slug, deviceUuid, newName);
      setDevices((prev) =>
        prev.map((d) => (d.uuid === deviceUuid ? { ...d, name: newName } : d)),
      );
      toast.success('Device renamed');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      toast.error(axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to rename device');
    }
  };

  const handleOpenAssign = (device: TrimbleDevice) => {
    setAssignTarget(device);
  };

  const handleAssign = async (projectId: string, _projectName: string) => {
    if (!assignTarget) return;
    setAssigning(true);
    try {
      const res = await trimbleDeviceService.assignDevice(projectId, assignTarget.uuid);
      const data = res.data;
      setDevices((prev) =>
        prev.map((d) =>
          d.uuid === assignTarget.uuid
            ? {
                ...d,
                current_project_id: data.project_id,
                current_project_name: data.project_name,
              }
            : d,
        ),
      );
      toast.success(`Assigned to ${data.project_name}`);
      setAssignTarget(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      toast.error(axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to assign device');
    } finally {
      setAssigning(false);
    }
  };

  const handleShowQr = (device: TrimbleDevice) => {
    if (!device.current_project_id) {
      toast.error('Assign the device to a project first');
      return;
    }
    setQrTarget(device);
  };

  const handleUnassign = async (deviceUuid: string) => {
    const device = devices.find((d) => d.uuid === deviceUuid);
    if (!device?.current_project_id) {
      toast.error('Device is not assigned to a project');
      return;
    }
    try {
      await trimbleDeviceService.unassignDevice(device.current_project_id, deviceUuid);
      setDevices((prev) =>
        prev.map((d) =>
          d.uuid === deviceUuid
            ? { ...d, current_project_id: null, current_project_name: null }
            : d,
        ),
      );
      toast.success('Device unassigned');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      toast.error(axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to unassign device');
    }
  };

  const handleDeactivate = async (deviceUuid: string) => {
    try {
      await trimbleDeviceService.deactivateDevice(org_slug, deviceUuid);
      setDevices((prev) =>
        prev.map((d) => (d.uuid === deviceUuid ? { ...d, is_active: false } : d)),
      );
      toast.success('Device deactivated');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      toast.error(axiosErr.response?.data?.error || axiosErr.response?.data?.message || 'Failed to deactivate device');
    }
  };

  const handlePaired = (device: TrimbleDevice) => {
    setDevices((prev) => {
      const exists = prev.find((d) => d.uuid === device.uuid);
      if (exists) {
        return prev.map((d) => (d.uuid === device.uuid ? device : d));
      }
      return [...prev, device];
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#021422]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <PairDeviceModal
        isOpen={isPairModalOpen}
        onClose={() => setIsPairModalOpen(false)}
        orgSlug={org_slug}
        onPaired={handlePaired}
      />

      {qrTarget && qrTarget.current_project_id && (
        <PairingQrModal
          key={qrTarget.uuid}
          isOpen
          onClose={() => setQrTarget(null)}
          projectUuid={qrTarget.current_project_id}
          deviceUuid={qrTarget.uuid}
          deviceName={qrTarget.name}
        />
      )}

      <AssignProjectModal
        isOpen={assignTarget !== null}
        onClose={() => setAssignTarget(null)}
        deviceName={assignTarget?.name || ''}
        orgSlug={org_slug}
        onAssign={handleAssign}
        assigning={assigning}
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">DEVICE MANAGEMENT</h1>
        {org && (
          <p className="text-sm text-gray-500 mt-1">{org.org}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchDevices}
            className="text-sm font-medium text-red-700 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide mb-4">
          Trimble XR10 Devices
        </h2>

        {devices.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <p className="text-gray-500 mb-4">No devices registered yet</p>
            <button
              onClick={() => setIsPairModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#021422] hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Register New Device
            </button>
          </div>
        ) : (
          <>
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onRename={handleRename}
                onAssign={handleOpenAssign}
                onShowQr={handleShowQr}
                onUnassign={handleUnassign}
                onDeactivate={handleDeactivate}
              />
            ))}

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => setIsPairModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#021422] hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Register New Device
              </button>
              <button
                onClick={fetchDevices}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
