"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

interface ProjectHealthScorecardProps {
  healthScore?: number;
  schedule?: number;
  budget?: number;
  quality?: number;
  safety?: number;
}

const getIndicatorColor = (value: number): string => {
  if (value >= 80) return "bg-emerald-400";
  if (value >= 60) return "bg-amber-400";
  return "bg-red-400";
};

const getIndicatorRing = (value: number): string => {
  if (value >= 80) return "ring-emerald-400/30";
  if (value >= 60) return "ring-amber-400/30";
  return "ring-red-400/30";
};

const ProjectHealthScorecard: React.FC<ProjectHealthScorecardProps> = ({
  healthScore = 0,
  schedule = 0,
  budget = 0,
  quality = 0,
  safety = 0,
}) => {
  const categories = [
    { label: "SCHEDULE", value: schedule },
    { label: "BUDGET", value: budget },
    { label: "QUALITY", value: quality },
    { label: "SAFETY", value: safety },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-[#021422]" />
        <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
          PROJECT HEALTH SCORECARD
        </h2>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#021422] uppercase tracking-wider">
              HEALTH SCORE: {healthScore}/100
            </span>
          </div>

          <span className="text-gray-200">|</span>

          {categories.map((cat) => (
            <React.Fragment key={cat.label}>
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${getIndicatorColor(cat.value)} ring-2 ${getIndicatorRing(cat.value)}`}
                />
                <span className="text-sm font-bold text-[#021422] uppercase tracking-wider">
                  {cat.label}: {cat.value}%
                </span>
              </div>
              <span className="text-gray-200">|</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectHealthScorecard;
