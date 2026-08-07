"use client";

import React, { useState } from "react";
import {
  BarChart3,
  ZoomIn,
  Download,
  RefreshCw,
  Maximize2,
} from "lucide-react";

interface SCurveChartProps {
  spi?: number;
  cpi?: number;
  eac?: string;
  dataAvailable?: boolean;
}

const months = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
];

const yearLabels = ["2026", "", "", "", "", "", "", "", "", "", "", "", "2027", "", "", "", "", ""];

const maxVal = 1.8;
const yTicks = [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800];

const chartW = 900;
const chartH = 320;
const padL = 60;
const padR = 30;
const padT = 20;
const padB = 50;
const plotW = chartW - padL - padR;
const plotH = chartH - padT - padB;

const toY = (val: number) => padT + plotH - (val / maxVal) * plotH;
const toX = (i: number) => padL + (i / (months.length - 1)) * plotW;

const planned = [0, 0.05, 0.1, 0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88, 0.95, 1.02, 1.15, 1.3, 1.45, 1.6, 1.8];
const earned  = [0, 0.03, 0.07, 0.12, 0.2, 0.28, 0.35, 0.42, 0.5, 0.58, 0.68, 0.78, 0.88, 1.0, 1.15, 1.32, 1.5, 0];
const actual  = [0, 0.04, 0.09, 0.15, 0.24, 0.34, 0.44, 0.54, 0.64, 0.74, 0.84, 0.94, 1.0, 1.12, 1.28, 1.44, 0, 0];

const buildPath = (data: number[]) =>
  data
    .map((v, i) => {
      const x = toX(i);
      const y = toY(v);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

const currentDateIdx = 1.58;

const SCurveChart: React.FC<SCurveChartProps> = ({
  spi = 0.776,
  cpi = 0.953,
  eac = "₦1.888B",
  dataAvailable = false,
}) => {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-[#021422]" />
        <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
          S-CURVE — Cumulative Progress (%)
        </h2>
      </div>
      {!dataAvailable ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm font-medium text-gray-500">
          S-curve data is not available for the selected project.
        </div>
      ) : (
      <div className={`bg-white border border-gray-200 rounded-lg p-5 ${fullscreen ? "fixed inset-0 z-50 p-8" : ""}`}>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartW} ${chartH + padB}`}
            className={`w-full ${fullscreen ? "h-full" : "h-auto"}`}
            style={{ maxHeight: fullscreen ? "calc(100vh - 200px)" : "400px" }}
          >
            {/* Y-axis gridlines + labels */}
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={padL}
                  y1={toY(tick / 1000)}
                  x2={chartW - padR}
                  y2={toY(tick / 1000)}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={padL - 8}
                  y={toY(tick / 1000) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#6b7280"
                  fontFamily="monospace"
                >
                  {tick === 0 ? "0" : tick >= 1000 ? `${tick / 1000}B` : `${tick}M`}
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {months.map((m, i) => (
              <g key={i}>
                <text
                  x={toX(i)}
                  y={chartH - padT + 20}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                  fontFamily="monospace"
                >
                  {m}
                </text>
                {yearLabels[i] && (
                  <text
                    x={toX(i)}
                    y={chartH - padT + 35}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#9ca3af"
                    fontFamily="monospace"
                  >
                    {yearLabels[i]}
                  </text>
                )}
              </g>
            ))}

            {/* Current date marker */}
            <line
              x1={toX(currentDateIdx)}
              y1={padT}
              x2={toX(currentDateIdx)}
              y2={toY(0)}
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
            <text
              x={toX(currentDateIdx)}
              y={padT - 5}
              textAnchor="middle"
              fontSize="9"
              fill="#ef4444"
              fontFamily="monospace"
              fontWeight="bold"
            >
              ▼ Today
            </text>

            {/* Lines */}
            <path d={buildPath(planned)} fill="none" stroke="#021422" strokeWidth="2" strokeDasharray="6,3" />
            <path d={buildPath(earned)} fill="none" stroke="#021422" strokeWidth="2" />
            <path d={buildPath(actual)} fill="none" stroke="#9ca3af" strokeWidth="2" />

            {/* Data points for earned line */}
            {earned.map((v, i) => {
              if (v === 0 && i > 0) return null;
              return (
                <circle
                  key={`earned-${i}`}
                  cx={toX(i)}
                  cy={toY(v)}
                  r="3"
                  fill="#021422"
                />
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            LEGEND:
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 border-t-2 border-dashed border-[#021422]" />
            <span className="text-xs text-gray-600">Planned (PV)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 border-t-2 border-[#021422]" />
            <span className="text-xs text-gray-600">Earned (EV)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 border-t-2 border-gray-400" />
            <span className="text-xs text-gray-600">Actual (AC)</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-bold text-[#021422]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Current Date: 19 Feb 2026
          </span>
          <span className="text-gray-300">|</span>
          <span>SPI: {spi}</span>
          <span className="text-gray-300">|</span>
          <span>CPI: {cpi}</span>
          <span className="text-gray-300">|</span>
          <span>EAC: {eac}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <ZoomIn size={14} />
            Zoom
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <Download size={14} />
            Download
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <Maximize2 size={14} />
            Full Screen
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default SCurveChart;
