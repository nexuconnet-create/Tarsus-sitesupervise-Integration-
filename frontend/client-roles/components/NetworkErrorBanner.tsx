"use client";

import { WifiOff, RefreshCw } from "lucide-react";

interface NetworkErrorBannerProps {
  isError: boolean;
  onRetry: () => void;
}

export default function NetworkErrorBanner({ isError, onRetry }: NetworkErrorBannerProps) {
  if (!isError) return null;

  return (
    <div className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-[#021422] px-4 py-2 text-sm font-medium text-white shadow-sm">
      <WifiOff size={15} />
      <span>Unable to load data — check your connection</span>
      <button
        onClick={onRetry}
        className="ml-2 flex items-center gap-1 rounded bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30 transition-colors"
      >
        <RefreshCw size={12} />
        Retry
      </button>
    </div>
  );
}
