"use client";

import { Camera, User, Clock, Layers } from 'lucide-react';
import type { InspectionReport } from '@/lib/types/report';

interface SessionSummarySectionProps {
  report: InspectionReport;
}

const SessionSummarySection = ({ report }: SessionSummarySectionProps) => {
  const rows = [
    { icon: Camera, label: 'Device', value: `${report.deviceName} (SN: ${report.deviceSerial})` },
    { icon: User, label: 'Engineer', value: report.engineerName },
    { icon: Clock, label: 'Duration', value: `${report.durationMin} minutes` },
    { icon: Layers, label: 'BIM Model', value: report.bimModelVersion },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <row.icon size={16} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-500 min-w-[80px]">{row.label}:</span>
            <span className="text-sm text-gray-900">{row.value}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 md:col-span-2">
          <Camera size={16} className="text-gray-400 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-500 min-w-[80px]">Snapshots:</span>
          <span className="text-sm text-gray-900">{report.snapshotCount} AR snapshots captured</span>
        </div>
      </div>
    </div>
  );
};

export default SessionSummarySection;
