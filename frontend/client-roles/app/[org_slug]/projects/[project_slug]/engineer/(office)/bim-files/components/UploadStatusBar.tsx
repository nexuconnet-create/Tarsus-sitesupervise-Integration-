"use client";

import { useState, useEffect, useRef } from 'react';
import { trimbleBimService } from '@/lib/services/trimbleBimService';
import type { GltfStatus } from '@/lib/types/bimFile';

interface UploadStatusBarProps {
  bimFileUuid: string;
  filename: string;
  onComplete: (bimFileUuid: string) => void;
}

// Drives the progress bar from the glb conversion lifecycle (headset-readiness),
// not the legacy Trimble push. converting → optimizing → ready.
const stageConfig: Record<
  GltfStatus,
  { color: string; icon: string; label: string; pct: number; terminal: boolean }
> = {
  pending: { color: 'bg-gray-300', icon: '⏳', label: 'Queued', pct: 8, terminal: false },
  converting: { color: 'bg-blue-500', icon: '⚙', label: 'Converting IFC → glb', pct: 45, terminal: false },
  optimizing: { color: 'bg-indigo-500', icon: '✦', label: 'Optimizing for headset', pct: 80, terminal: false },
  ready: { color: 'bg-green-500', icon: '✓', label: 'Ready for headset', pct: 100, terminal: true },
  failed: { color: 'bg-red-500', icon: '✗', label: 'Conversion failed', pct: 100, terminal: true },
  skipped: { color: 'bg-amber-500', icon: '!', label: 'Not auto-convertible', pct: 100, terminal: true },
};

const UploadStatusBar = ({ bimFileUuid, filename, onComplete }: UploadStatusBarProps) => {
  const [stage, setStage] = useState<GltfStatus>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await trimbleBimService.getBimFileStatus(bimFileUuid);
        const data = res.data;
        const gltfStage = data.gltf_status ?? 'pending';
        setStage(gltfStage);

        if (stageConfig[gltfStage]?.terminal) {
          if (gltfStage === 'failed') {
            setErrorMessage(data.gltf_error || 'Conversion failed');
          } else if (gltfStage === 'skipped') {
            setErrorMessage(
              data.gltf_error ||
                'This format can’t be auto-converted. Export as IFC first.',
            );
          }
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => onComplete(bimFileUuid), 5000);
        }
      } catch {
        // keep polling on transient errors
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [bimFileUuid, onComplete]);

  const { color, icon, label, pct, terminal } = stageConfig[stage] ?? stageConfig.pending;
  const isError = stage === 'failed' || stage === 'skipped';

  return (
    <div className={`bg-white rounded-lg border p-4 mb-3 ${isError ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-800 truncate mr-3">{filename}</span>
        <span className="text-xs font-semibold text-gray-500">{icon} {label}</span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${terminal ? color : `${color} animate-pulse`}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isError && errorMessage && (
        <p className={`mt-2 text-xs ${stage === 'failed' ? 'text-red-600' : 'text-amber-600'}`}>
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default UploadStatusBar;
