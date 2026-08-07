"use client";

import { PenTool, MapPin, Ruler, Mic, Camera } from 'lucide-react';
import type { AnnotationTool } from '@/lib/types/collaboration';
import toast from 'react-hot-toast';

interface AnnotationToolbarProps {
  activeTool: AnnotationTool | null;
  onSelectTool: (tool: AnnotationTool) => void;
}

const tools: { key: AnnotationTool; icon: typeof PenTool; label: string; color: string }[] = [
  { key: 'draw', icon: PenTool, label: 'Draw', color: 'text-blue-600' },
  { key: 'pin', icon: MapPin, label: 'Pin', color: 'text-orange-600' },
  { key: 'measure', icon: Ruler, label: 'Measure', color: 'text-teal-600' },
  { key: 'voice', icon: Mic, label: 'Voice', color: 'text-green-600' },
  { key: 'capture', icon: Camera, label: 'Capture', color: 'text-purple-600' },
];

const AnnotationToolbar = ({ activeTool, onSelectTool }: AnnotationToolbarProps) => {
  const handleClick = (tool: AnnotationTool) => {
    onSelectTool(tool);
    toast('Annotation tools coming soon', { icon: '🔧' });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2">
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => {
          const isActive = activeTool === tool.key;
          const Icon = tool.icon;
          return (
            <button
              key={tool.key}
              onClick={() => handleClick(tool.key)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }
              `}
            >
              <Icon size={16} className={isActive ? 'text-blue-600' : tool.color} />
              {tool.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AnnotationToolbar;
