"use client";

import { Camera, Radio } from 'lucide-react';

interface LiveFeedViewerProps {
  token: string | null;
  url: string | null;
  activeIssue?: { title: string; deviation: string } | null;
  loading: boolean;
}

const LiveFeedViewer = ({ token: _token, url: _url, activeIssue, loading }: LiveFeedViewerProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
        <div className="bg-gray-900 h-[400px] flex items-center justify-center">
          <div className="w-12 h-12 bg-gray-700 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-900 relative flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-cyan-500" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-cyan-500" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-cyan-500" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-cyan-500" />

        <div className="absolute top-3 right-12 flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-full">
          <Radio size={12} className="text-red-500" />
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">LIVE</span>
        </div>

        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <Camera size={32} className="text-gray-500" />
          </div>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">
            LIVE CAMERA FEED FROM XR10
          </p>
          <p className="text-gray-500 text-[10px]">Jane Doe&apos;s View — Level 7, Mech Room</p>
        </div>

        {activeIssue && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white px-4 py-3">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <p className="text-xs font-bold">{activeIssue.title}</p>
            </div>
            <p className="text-[10px] opacity-90">Current deviation: {activeIssue.deviation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveFeedViewer;
