"use client";

import { useEffect, useState } from 'react';
import SignalStrengthBar from '@/components/ar/SignalStrengthBar';

interface SessionHeaderProps {
  engineer: { name: string; role: string; device: string };
  startTime: string;
  signalStrength: 'strong' | 'moderate' | 'weak';
}

const SessionHeader = ({ engineer, startTime, signalStrength }: SessionHeaderProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const update = () => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="bg-white py-3 px-5 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-700">
            Connected to: {engineer.name} ({engineer.role}) — {engineer.device}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-mono font-semibold text-gray-900">
          Session Duration: {formatted}
        </span>
        <span className="text-gray-300">|</span>
        <SignalStrengthBar strength={signalStrength} />
      </div>
    </div>
  );
};

export default SessionHeader;
