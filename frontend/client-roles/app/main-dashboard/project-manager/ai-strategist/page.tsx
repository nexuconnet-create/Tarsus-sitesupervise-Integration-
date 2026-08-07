"use client";

import React, { useState } from "react";
import {
  Cpu,
  TrendingUp,
  AlertTriangle,
  Play,
  GitCompare,
  Download,
  Plus,
  Target,
  ShieldAlert,
  Clock,
  Users,
  Cloud,
} from "lucide-react";

const AIStrategist = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h1 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
            AI STRATEGIST — Intelligent Decision Support
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Project: Lagos 12-Storey Mixed-Use Development</span>
            <span className="text-gray-300">|</span>
            <span>AI Model: StrategyNet V2.3</span>
            <span className="text-gray-300">|</span>
            <span>Confidence: 92%</span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* AI Insights Dashboard */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={18} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
              AI INSIGHTS DASHBOARD
            </h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a strategic question..."
              className="flex-1 bg-white border border-gray-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0166B0]/20 focus:border-[#0166B0]"
            />
            <button className="bg-[#021422] text-white px-6 py-3 rounded-lg font-bold text-sm uppercase hover:bg-gray-800 transition-colors">
              Analyze
            </button>
          </div>
        </div>

        {/* Project Forecast */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target size={18} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
              PROJECT FORECAST
            </h2>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#021422] shrink-0" />
              Current Projection: 2027-08-15 (46 days late)
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              Probability of Delay: 87%
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              Key Risk Factors: Material delivery (45%), Labor shortage (30%), Weather (25%)
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={14} className="text-[#021422]" />
              <h3 className="text-xs font-bold text-[#021422] uppercase tracking-wider">
                AI RECOMMENDATION:
              </h3>
            </div>
            <p className="text-sm text-gray-700 font-medium mb-3">
              To recover schedule, focus on:
            </p>
            <ol className="space-y-2 pl-5 text-sm text-gray-700 font-medium list-decimal">
              <li>Accelerate Piling (add 2nd rig) — Potential recovery: 10 days</li>
              <li>Extend working hours (weekend shifts) — Potential recovery: 7 days</li>
              <li>Re-sequence MEP works — Potential recovery: 5 days</li>
            </ol>
          </div>
        </div>

        {/* Productivity Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
              PRODUCTIVITY TREND
            </h2>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between text-sm font-medium text-gray-700 py-2 border-b border-gray-50">
              <span>Concrete Crew: 85% efficiency (Target: 90%)</span>
              <span className="text-amber-600 font-bold text-xs">⚠ Needs improvement</span>
            </div>
            <div className="flex items-center justify-between text-sm font-medium text-gray-700 py-2 border-b border-gray-50">
              <span>Ironworkers: 78% efficiency (Target: 85%)</span>
              <span className="text-amber-600 font-bold text-xs">⚠ Needs attention</span>
            </div>
            <div className="flex items-center justify-between text-sm font-medium text-gray-700 py-2">
              <span>Equipment Utilization: 92% efficiency (Target: 85%)</span>
              <span className="text-emerald-600 font-bold text-xs">✓ Good</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={14} className="text-[#021422]" />
              <h3 className="text-xs font-bold text-[#021422] uppercase tracking-wider">
                AI RECOMMENDATION:
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 font-medium">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0166B0] mt-1.5 shrink-0" />
                Reallocate 2 ironworkers to concrete crew to balance efficiency
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0166B0] mt-1.5 shrink-0" />
                Schedule equipment maintenance during low-demand periods to reduce downtime
              </li>
            </ul>
          </div>
        </div>

        {/* AI Early Warning System */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert size={18} className="text-red-600" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
              AI EARLY WARNING SYSTEM
            </h2>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-4">
              <AlertTriangle size={14} />
              NEW ALERT — Detected Patterns
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                Supply Chain Risk: 3 vendors showing delivery delays (12 weeks)
              </div>
              <button className="px-3 py-1 text-[10px] font-bold text-white bg-red-600 rounded uppercase hover:bg-red-700 transition-colors">
                Escalate
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                Labor Risk: 20% drop in ironworker attendance this week
              </div>
              <button className="px-3 py-1 text-[10px] font-bold text-gray-600 border border-gray-200 rounded uppercase hover:bg-gray-50 transition-colors">
                Monitor
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                Weather Risk: Heavy rain forecast for Mar 15–17
              </div>
              <button className="px-3 py-1 text-[10px] font-bold text-gray-600 border border-gray-200 rounded uppercase hover:bg-gray-50 transition-colors">
                Prepare contingency
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={14} className="text-[#021422]" />
              <h3 className="text-xs font-bold text-[#021422] uppercase tracking-wider">
                AI RECOMMENDATION:
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 font-medium">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0166B0] mt-1.5 shrink-0" />
                Order additional material stock to mitigate supply chain risk
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0166B0] mt-1.5 shrink-0" />
                Hire temporary ironworkers to compensate attendance drop
              </li>
            </ul>
          </div>
        </div>

        {/* Scenario Planning */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <GitCompare size={18} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
              SCENARIO PLANNING
            </h2>
          </div>

          <div className="mb-4">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              What-If Scenarios:
            </p>
          </div>

          <div className="space-y-5 mb-6">
            {/* Scenario 1 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-[#021422] mb-3">Scenario 1: Add 2nd Piling Rig</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-600">
                <span>Cost: +₦15.0M</span>
                <span>Benefit: -10 days</span>
                <span>ROI: 2.3x</span>
                <span>Confidence: 95%</span>
                <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-white bg-[#021422] rounded hover:bg-gray-800 transition-colors ml-auto">
                  <Play size={12} />
                  Run Scenario
                </button>
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-[#021422] mb-3">Scenario 2: Weekend Shifts</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-600">
                <span>Cost: +₦8.0M</span>
                <span>Benefit: -7 days</span>
                <span>ROI: 2.1x</span>
                <span>Confidence: 85%</span>
                <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-white bg-[#021422] rounded hover:bg-gray-800 transition-colors ml-auto">
                  <Play size={12} />
                  Run Scenario
                </button>
              </div>
            </div>

            {/* Scenario 3 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-[#021422] mb-3">Scenario 3: Re-sequence MEP Works</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-600">
                <span>Cost: +₦5.0M</span>
                <span>Benefit: -5 days</span>
                <span>ROI: 2.7x</span>
                <span>Confidence: 90%</span>
                <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-white bg-[#021422] rounded hover:bg-gray-800 transition-colors ml-auto">
                  <Play size={12} />
                  Run Scenario
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Cpu size={14} />
              Run Custom Scenario
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <GitCompare size={14} />
              Compare All
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={14} />
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStrategist;
