"use client";
 

import { useState, useEffect } from 'react';
import { Glasses, Wifi, WifiOff, Clock, CheckCircle2 } from 'lucide-react';
import type { TrimbleDevice } from '@/lib/types/trimbleDevice';

interface DeviceCardProps {
  device: TrimbleDevice;
  onRename: (deviceUuid: string, name: string) => Promise<void>;
  onAssign: (device: TrimbleDevice) => void;
  onShowQr: (device: TrimbleDevice) => void;
  onUnassign: (deviceUuid: string) => Promise<void>;
  onDeactivate: (deviceUuid: string) => Promise<void>;
}

const DeviceCard = ({
  device,
  onRename,
  onAssign,
  onShowQr,
  onUnassign,
  onDeactivate,
}: DeviceCardProps) => {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(device.name);
  const [unassigning, setUnassigning] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setNow(Date.now()), 0);
    const interval = setInterval(() => setNow(Date.now()), 120000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const isOnline = device.last_seen_at
    ? now - new Date(device.last_seen_at).getTime() < 5 * 60 * 1000
    : false;
  const isAssigned = !!device.current_project_id;

  const handleRename = async () => {
    if (!renameValue.trim() || renameValue.trim() === device.name) {
      setRenaming(false);
      return;
    }
    await onRename(device.uuid, renameValue.trim());
    setRenaming(false);
  };

  const handleUnassign = async () => {
    setUnassigning(true);
    try {
      await onUnassign(device.uuid);
    } finally {
      setUnassigning(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await onDeactivate(device.uuid);
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Glasses size={24} className="text-blue-600" />
          </div>
          <div>
            {renaming ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') setRenaming(false);
                  }}
                  onBlur={handleRename}
                  className="px-2 py-1 text-base font-semibold border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>
            ) : (
              <h3 className="text-base font-semibold text-gray-900">{device.name}</h3>
            )}
            <p className="text-xs text-gray-400 mt-0.5">UUID: {device.uuid.slice(0, 8)}...</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
              isOnline
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {isOnline ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </>
            ) : (
              <>
                <WifiOff size={12} />
                Offline
              </>
            )}
          </span>
          {!device.is_active && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-red-100 text-red-700">
              Inactive
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <Clock size={14} className="text-gray-400" />
          {device.paired_at
            ? `Paired: ${new Date(device.paired_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : 'Not paired'}
        </span>
        <span className="text-gray-300">|</span>
        <span className="flex items-center gap-1.5">
          {isOnline ? (
            <Wifi size={14} className="text-green-500" />
          ) : (
            <WifiOff size={14} className="text-gray-400" />
          )}
          {device.last_seen_at
            ? `Last seen: ${Math.round((now - new Date(device.last_seen_at).getTime()) / 60000)} min ago`
            : 'Never seen'}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <CheckCircle2 size={14} className={isAssigned ? 'text-green-500' : 'text-gray-400'} />
        <span>
          {isAssigned
            ? `Assigned to: ${device.current_project_name}`
            : 'Not assigned to any project'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setRenameValue(device.name);
            setRenaming(true);
          }}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Rename
        </button>

        <button
          onClick={() => onAssign(device)}
          className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          Assign
        </button>

        <button
          onClick={() => onShowQr(device)}
          disabled={!device.is_active}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40"
        >
          QR Code
        </button>

        {isAssigned && (
          <button
            onClick={handleUnassign}
            disabled={unassigning}
            className="px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {unassigning ? 'Unassigning...' : 'Unassign'}
          </button>
        )}

        {device.is_active && (
          <button
            onClick={handleDeactivate}
            disabled={deactivating}
            className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {deactivating ? 'Deactivating...' : 'Deactivate'}
          </button>
        )}
      </div>
    </div>
  );
};

export default DeviceCard;
