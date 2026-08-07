"use client";

import { Camera, Mic, Phone, Flag, Square } from 'lucide-react';
import type { QASession } from '@/lib/types/arSession';
import BatteryBar from '@/components/ar/BatteryBar';
import SignalStrengthBar from '@/components/ar/SignalStrengthBar';

interface ActiveARSessionPanelProps {
  session: QASession | null;
  loading: boolean;
}

const ActiveARSessionPanel = ({ session, loading }: ActiveARSessionPanelProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-48 bg-gray-100 rounded mb-4" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm">
        <Camera size={32} className="text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No active AR session</p>
        <p className="text-xs text-gray-400 mt-1">Start a session on the Trimble XR10 to begin</p>
      </div>
    );
  }

  const hasIssues = session.issues.length > 0;
  const issue = hasIssues ? session.issues[0] : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Active AR Session: {session.wpReference}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {session.taskTitle} — {session.location}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{session.durationMin} min</span>
            <SignalStrengthBar strength="strong" />
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl relative flex items-center justify-center mb-4 overflow-hidden" style={{ minHeight: 180 }}>
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-blue-500" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-blue-500" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-blue-500" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-blue-500" />

          <div className="text-center">
            <Camera size={40} className="text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">LIVE VIEW</p>
            <p className="text-gray-500 text-[10px] mt-1">XR10 — {session.engineerName}</p>
          </div>

          {issue && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white px-3 py-2">
              <p className="text-xs font-bold">JOINT #7 MISALIGNMENT DETECTED</p>
              <p className="text-[10px] opacity-90">
                Deviation: {issue.deviationMm}mm (Tolerance: ±{issue.toleranceMm?.max}mm)
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className={`flex items-center gap-1.5 text-xs font-medium ${session.voiceActive ? 'text-green-600' : 'text-gray-400'}`}>
            <Mic size={14} />
            {session.voiceActive ? 'Voice Commands Active' : 'Voice Off'}
          </div>
          {hasIssues && (
            <span className="ml-auto text-xs text-red-600 font-medium">
              {session.issues.length} issue{session.issues.length !== 1 ? 's' : ''} detected
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <Camera size={14} />
            Capture AR Snap
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
            <Flag size={14} />
            Flag Issue
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Phone size={14} />
            Call Office
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
            <Square size={14} />
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveARSessionPanel;
