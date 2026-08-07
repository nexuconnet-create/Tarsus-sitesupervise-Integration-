"use client";

import { AlertTriangle, Wind, CloudRain, ArrowRight } from "lucide-react";
import { WeatherData } from "@/lib/weather";

// ─── Mock impacts (shown until backend/real logic is wired) ───────────────────
const MOCK_IMPACTS = [
  {
    type: "wind" as const,
    icon: <Wind size={15} className="text-yellow-600 flex-shrink-0" />,
    label: "High Wind Warning",
    detail: "35 km/h",
    action: "No crane ops until 14:00",
  },
  {
    type: "rain" as const,
    icon: <CloudRain size={15} className="text-blue-500 flex-shrink-0" />,
    label: "Rain Forecast",
    detail: "60% chance at 2PM",
    action: "Concrete pour at risk",
  },
];

// ─── Actual logic (uncomment when backend / real-time data is ready) ──────────
// function deriveImpacts(weather: WeatherData) { ... }

const TYPE_STYLES = {
  storm: { bar: "bg-red-500",    bg: "bg-red-50",     border: "border-red-200",   badge: "bg-red-100 text-red-700",    dot: "bg-red-500"    },
  wind:  { bar: "bg-yellow-400", bg: "bg-yellow-50",  border: "border-yellow-200",badge: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-400" },
  rain:  { bar: "bg-blue-400",   bg: "bg-blue-50",    border: "border-blue-200",  badge: "bg-blue-100 text-blue-700",  dot: "bg-blue-400"   },
};

export default function WorkabilityImpact({ weather: _weather }: { weather: WeatherData }) {
  const impacts = MOCK_IMPACTS; // replace with deriveImpacts(_weather) when ready

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-[#021422] text-white px-3 py-2.5 flex items-center gap-2">
        <AlertTriangle size={14} className="text-yellow-400" />
        <h3 className="font-bold text-sm">Workability Impact</h3>
        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300">
          {impacts.length} Active {impacts.length === 1 ? "Warning" : "Warnings"}
        </span>
      </div>

      <div className="p-3 flex flex-col gap-2">
        {impacts.map((item, i) => {
          const s = TYPE_STYLES[item.type];
          return (
            <div key={i} className={`rounded-lg border ${s.border} ${s.bg} overflow-hidden flex`}>
              {/* Left accent bar */}
              <div className={`w-1 flex-shrink-0 ${s.bar}`} />

              <div className="flex-1 px-3 py-2.5">
                {/* Top row: icon + label + detail badge */}
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-xs font-bold text-gray-800">{item.label}</span>
                  <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>
                    {item.detail}
                  </span>
                </div>

                {/* Action row */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <ArrowRight size={11} className="text-gray-400 flex-shrink-0" />
                  <p className="text-xs text-gray-600">{item.action}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
