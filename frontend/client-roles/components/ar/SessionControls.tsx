"use client";

import { Square, Download, FileText } from 'lucide-react';

interface SessionControlsProps {
  onEndSession: () => void;
  onSaveRecording: () => void;
  onGenerateReport: () => void;
  ending: boolean;
  saving: boolean;
  generating: boolean;
}

const SessionControls = ({
  onEndSession,
  onSaveRecording,
  onGenerateReport,
  ending,
  saving,
  generating,
}: SessionControlsProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={onEndSession}
        disabled={ending}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
      >
        <Square size={16} />
        {ending ? 'Ending...' : 'End Session'}
      </button>
      <button
        onClick={onSaveRecording}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
      >
        <Download size={16} />
        {saving ? 'Saving...' : 'Save Recording'}
      </button>
      <button
        onClick={onGenerateReport}
        disabled={generating}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#021422] hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
      >
        <FileText size={16} />
        {generating ? 'Generating...' : 'Generate AR Report'}
      </button>
    </div>
  );
};

export default SessionControls;
