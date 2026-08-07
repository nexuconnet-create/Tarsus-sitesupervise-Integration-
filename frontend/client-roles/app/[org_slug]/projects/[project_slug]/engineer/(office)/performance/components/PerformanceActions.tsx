"use client";

import { Download, Share2, Eye } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  onExport: () => void;
  onShare: () => void;
}

export default function PerformanceActions({ onExport, onShare }: Props) {
  return (
    <div className="flex flex-wrap gap-3 justify-end pt-2">
      <button
        onClick={onExport}
        className="flex items-center gap-2 text-sm bg-white border border-gray-200 hover:bg-gray-50 text-[#021422] px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
      >
        <Download size={15} />
        Export Report
      </button>
      <button
        onClick={onShare}
        className="flex items-center gap-2 text-sm bg-white border border-gray-200 hover:bg-gray-50 text-[#021422] px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
      >
        <Share2 size={15} />
        Share with Team
      </button>
      <button
        onClick={() => toast("AR Verification is coming soon.", { icon: "🕶️" })}
        className="flex items-center gap-2 text-sm bg-[#021422] hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
      >
        <Eye size={15} />
        Request AR Verification
      </button>
    </div>
  );
}
