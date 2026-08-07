import type { DeviceStatus } from '@/lib/types/device';

interface StatusBadgeProps {
  status: DeviceStatus;
  className?: string;
}

const statusConfig: Record<DeviceStatus, { bg: string; text: string; label: string }> = {
  ready: { bg: 'bg-green-100 text-green-800', text: 'text-green-800', label: 'Ready' },
  active: { bg: 'bg-blue-100 text-blue-800', text: 'text-blue-800', label: 'Active' },
  offline: { bg: 'bg-gray-100 text-gray-600', text: 'text-gray-600', label: 'Offline' },
  pairing: { bg: 'bg-yellow-100 text-yellow-800', text: 'text-yellow-800', label: 'Pairing' },
  calibrating: { bg: 'bg-orange-100 text-orange-800', text: 'text-orange-800', label: 'Calibrating' },
};

const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${config.bg} ${className}`}
    >
      {status === 'active' && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
      )}
      {config.label}
    </span>
  );
};

export default StatusBadge;
