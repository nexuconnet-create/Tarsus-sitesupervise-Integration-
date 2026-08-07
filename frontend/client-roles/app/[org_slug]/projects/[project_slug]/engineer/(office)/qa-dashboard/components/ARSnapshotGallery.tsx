"use client";

import { useState } from 'react';
import { Camera, X, Clock, MapPin } from 'lucide-react';
import type { ARSnapshot } from '@/lib/types/arSession';

interface ARSnapshotGalleryProps {
  snapshots: ARSnapshot[];
}

const ARSnapshotGallery = ({ snapshots }: ARSnapshotGalleryProps) => {
  const [selected, setSelected] = useState<ARSnapshot | null>(null);

  if (snapshots.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
        <Camera size={24} className="text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No snapshots captured yet</p>
        <p className="text-xs text-gray-400 mt-1">Snapshots from XR10 appear here in real-time</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {snapshots.map((snap) => (
            <button
              key={snap.id}
              onClick={() => setSelected(snap)}
              className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square cursor-pointer"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {snap.thumbnailUrl || snap.url ? (
                  <img src={snap.thumbnailUrl || snap.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={28} className="text-gray-400 group-hover:text-gray-500 transition-colors" />
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1.5">
                <p className="text-[10px] font-medium truncate">{snap.location}</p>
                <p className="text-[9px] text-gray-300">
                  {new Date(snap.capturedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {snap.issueId && (
                <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 z-10 overflow-hidden">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="bg-gray-900 flex items-center justify-center" style={{ minHeight: 300 }}>
              {selected.url ? (
                <img src={selected.url} alt="AR Snapshot" className="w-full h-full object-contain" />
              ) : (
                <Camera size={48} className="text-gray-600" />
              )}
            </div>

            <div className="p-5">
              <h3 className="text-sm font-bold text-gray-900">AR Snapshot</h3>
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(selected.capturedAt).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {selected.location}
                </span>
                <span className="text-gray-400">{selected.engineerName}</span>
              </div>
              {selected.issueId && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Issue flagged in this snapshot
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARSnapshotGallery;
