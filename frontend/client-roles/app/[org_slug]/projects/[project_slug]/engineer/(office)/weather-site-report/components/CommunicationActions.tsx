"use client";

import { Megaphone, FileText, MessageSquare } from "lucide-react";

interface Props {
  windWarning: boolean;
  rainWarning: boolean;
  onNotifyCrew: () => void;
  onGenerateReport: () => void;
  onAdviseClient: () => void;
}

export default function CommunicationActions({
  windWarning,
  rainWarning,
  onNotifyCrew,
  onGenerateReport,
  onAdviseClient,
}: Props) {
  const crewMessage = [
    windWarning && "High wind warning. Crane ops suspended.",
    rainWarning && "Rain forecast 2PM–4PM. Concrete pour at risk.",
  ]
    .filter(Boolean)
    .join(" ") || "No active weather warnings.";

  const clientMessage = [
    windWarning && "High wind conditions may impact crane operations today.",
    rainWarning && "Forecasted rain at 2PM may delay concrete pour by up to 4 hours.",
  ]
    .filter(Boolean)
    .join(" ") || "Site operations proceeding normally.";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-[#021422] text-white p-4 flex items-center gap-2">
        <Megaphone size={16} className="text-yellow-400" />
        <h3 className="font-bold text-sm">Communication Actions</h3>
      </div>
      <div className="p-5 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onNotifyCrew}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-bold bg-[#021422] hover:bg-gray-800 text-white px-4 py-3 rounded-lg transition-colors"
        >
          <Megaphone size={15} />
          Notify All Crew
        </button>
        <button
          onClick={onGenerateReport}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-bold border border-gray-200 hover:bg-gray-50 text-[#021422] px-4 py-3 rounded-lg transition-colors"
        >
          <FileText size={15} />
          Generate Daily Report
        </button>
        <button
          onClick={onAdviseClient}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-bold bg-[#0070D4] hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
        >
          <MessageSquare size={15} />
          Advise Client
        </button>
      </div>
      {/* Pre-fill previews */}
      <div className="px-5 pb-5 space-y-2">
        <div className="bg-gray-50 rounded-lg px-3 py-2 flex gap-2">
          <Megaphone size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 italic">&quot;{crewMessage}&quot;</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2 flex gap-2">
          <MessageSquare size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 italic">&quot;{clientMessage}&quot;</p>
        </div>
      </div>
    </div>
  );
}
