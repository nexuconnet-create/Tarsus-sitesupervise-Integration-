"use client";

import { PenTool } from 'lucide-react';
import type { Annotation } from '@/lib/types/collaboration';

interface AnnotationCanvasProps {
  annotations: Annotation[];
}

const AnnotationCanvas = ({ annotations }: AnnotationCanvasProps) => {
  const latest = annotations.length > 0 ? annotations[0] : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      {annotations.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400">No annotations yet. Use the tools below to annotate the live feed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            Recent Annotations
          </h3>
          {latest && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <PenTool size={14} className="text-blue-500" />
                <span className="text-xs font-semibold text-blue-600 uppercase">Your Annotation</span>
              </div>
              <p className="text-sm text-gray-800 font-medium">&ldquo;{latest.content}&rdquo;</p>
              <p className="text-xs text-gray-400 mt-1.5">
                {new Date(latest.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
          {annotations.length > 1 && (
            <div className="space-y-2 pl-1">
              {annotations.slice(1).map((ann) => (
                <div key={ann.id} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-gray-300 mt-0.5">•</span>
                  <div>
                    <p className="text-sm text-gray-500">{ann.content}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(ann.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnnotationCanvas;
