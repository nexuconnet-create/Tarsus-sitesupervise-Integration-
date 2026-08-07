"use client";

import type { GltfStatus } from '@/lib/types/bimFile';

interface BimFileStatusBadgeProps {
  status: GltfStatus;
}

// Tracks headset-readiness (glb conversion + optimization), not the legacy
// Trimble push. `pending`/`converting`/`optimizing` are in-progress states.
const config: Record<GltfStatus, { bg: string; label: string; spin?: boolean }> = {
  pending: { bg: 'bg-gray-100 text-gray-600', label: 'Queued' },
  converting: { bg: 'bg-blue-100 text-blue-700', label: 'Converting', spin: true },
  optimizing: { bg: 'bg-indigo-100 text-indigo-700', label: 'Optimizing', spin: true },
  ready: { bg: 'bg-green-100 text-green-700', label: 'Ready' },
  failed: { bg: 'bg-red-100 text-red-700', label: 'Failed' },
  skipped: { bg: 'bg-amber-100 text-amber-700', label: 'Not convertible' },
};

const BimFileStatusBadge = ({ status }: BimFileStatusBadgeProps) => {
  const { bg, label, spin } = config[status] ?? config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${bg}`}
    >
      {spin && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {label}
    </span>
  );
};

export default BimFileStatusBadge;
