"use client";

import { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, Glasses, QrCode } from 'lucide-react';
import { trimbleDeviceService } from '@/lib/services/trimbleDeviceService';
import { mockProjectDevices } from '@/lib/mockData/devices';
import type { ProjectDeviceAssignment } from '@/lib/types/trimbleDevice';
import PairingQrModal from './PairingQrModal';

interface ProjectDeviceListProps {
  projectUuid?: string;
}

const ProjectDeviceList = ({ projectUuid }: ProjectDeviceListProps) => {
  const [devices, setDevices] = useState<ProjectDeviceAssignment[]>([]);
  const [loading, setLoading] = useState(!!projectUuid);
  const [qrTarget, setQrTarget] = useState<ProjectDeviceAssignment | null>(null);
  const closeQr = useCallback(() => setQrTarget(null), []);

  useEffect(() => {
    if (!projectUuid) return;
    const fetchDevices = async () => {
      try {
        const res = await trimbleDeviceService.listProjectDevices(projectUuid);
        const list = Array.isArray(res.data) ? res.data : [];
        setDevices(list);
      } catch {
        setDevices(mockProjectDevices);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, [projectUuid]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-16 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <Glasses size={16} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            Devices on Site
          </h3>
          {devices.length > 0 && (
            <span className="text-xs text-gray-400 ml-auto">{devices.length} device{devices.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-sm text-gray-400">No devices assigned to this project</p>
          <p className="text-xs text-gray-300 mt-1">
            Register and assign devices from the Admin &gt; Devices page
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {devices.map((assignment) => (
            <DeviceRow
              key={assignment.id}
              assignment={assignment}
              onShowQr={() => setQrTarget(assignment)}
            />
          ))}
        </div>
      )}

      {projectUuid && qrTarget && (
        <PairingQrModal
          key={qrTarget.device_uuid}
          isOpen
          onClose={closeQr}
          projectUuid={projectUuid}
          deviceUuid={qrTarget.device_uuid}
          deviceName={qrTarget.device_name}
        />
      )}
    </div>
  );
};

interface DeviceRowProps {
  assignment: ProjectDeviceAssignment;
  onShowQr: () => void;
}

const DeviceRow = ({ assignment, onShowQr }: DeviceRowProps) => {
  const isOnline =
    !!assignment.device_uuid;

  return (
    <div className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg ${isOnline ? 'bg-blue-50' : 'bg-gray-100'}`}>
          <Glasses size={16} className={isOnline ? 'text-blue-600' : 'text-gray-400'} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{assignment.device_name}</p>
          <p className="text-xs text-gray-400">
            {assignment.project_name} &middot; {new Date(assignment.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onShowQr}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          title="Show pairing QR / download PDF"
        >
          <QrCode size={14} />
          Pairing QR
        </button>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
            isOnline
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi size={12} />
              Active
            </>
          ) : (
            <>
              <WifiOff size={12} />
              Inactive
            </>
          )}
        </span>
      </div>
    </div>
  );
};

export default ProjectDeviceList;
