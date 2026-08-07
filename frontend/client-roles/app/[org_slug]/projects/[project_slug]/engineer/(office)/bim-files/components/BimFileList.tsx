"use client";

import { Upload } from 'lucide-react';
import type { BimFile } from '@/lib/types/bimFile';
import BimFileStatusBadge from './BimFileStatusBadge';

interface BimFileListProps {
  files: BimFile[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry: (file: BimFile) => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const relativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const formatColor: Record<string, string> = {
  IFC: 'bg-cyan-100 text-cyan-700',
  RVT: 'bg-purple-100 text-purple-700',
  DWG: 'bg-orange-100 text-orange-700',
  SKP: 'bg-pink-100 text-pink-700',
  NWD: 'bg-indigo-100 text-indigo-700',
  DWF: 'bg-teal-100 text-teal-700',
  OTHER: 'bg-gray-100 text-gray-600',
};

const BimFileList = ({ files, loading, hasMore, onLoadMore, onRetry }: BimFileListProps) => {
  if (loading && files.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#021422] mx-auto" />
        <p className="text-sm text-gray-400 mt-3">Loading files...</p>
      </div>
    );
  }

  if (!loading && files.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm">
        <Upload size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No BIM files uploaded yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Upload an IFC model — it’s converted and optimized for the headset automatically
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#021422] text-white">
              <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider">
                Filename
              </th>
              <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider w-24">
                Format
              </th>
              <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider w-28">
                Status
              </th>
              <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider w-24">
                Size
              </th>
              <th className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider w-20">
                Uploaded
              </th>
              <th className="text-right py-3 px-5 text-xs font-semibold uppercase tracking-wider w-20">
                Retry
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr
                key={file.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-5">
                  <span className="text-sm text-gray-800 truncate max-w-[200px] block">
                    {file.filename}
                  </span>
                </td>
                <td className="py-3 px-5">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${formatColor[file.file_format] || formatColor.OTHER}`}>
                    {file.file_format}
                  </span>
                </td>
                <td className="py-3 px-5">
                  <BimFileStatusBadge status={file.gltf_status} />
                </td>
                <td className="py-3 px-5">
                  <span className="text-xs text-gray-500">{formatBytes(file.file_size)}</span>
                </td>
                <td className="py-3 px-5">
                  {file.uploaded_at ? (
                    <span className="text-xs text-gray-500">{relativeTime(file.uploaded_at)}</span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="py-3 px-5 text-right">
                  {file.gltf_status === 'failed' && (
                    <button
                      onClick={() => onRetry(file)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 underline"
                    >
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-40"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      <div className="px-5 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-400">
        {files.length} file{files.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default BimFileList;
