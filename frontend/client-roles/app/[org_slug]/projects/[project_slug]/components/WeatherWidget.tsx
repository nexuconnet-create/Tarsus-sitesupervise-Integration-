"use client";

import { useEffect, useState } from "react";
import { CloudSun } from "lucide-react";
import {
  WeatherData,
  getConditionLabel,
  windBearing,
  fetchCurrentWeather,
  getCoords,
} from "@/lib/weather";

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { lat, lon } = await getCoords();
        const data = await fetchCurrentWeather(lat, lon);
        if (!cancelled) { setWeather(data); setError(false); }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 30 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const rows: { label: string; value: string }[] = weather
    ? [
        { label: "Condition",             value: getConditionLabel(weather.weatherCode) },
        { label: "Temperature",           value: `${weather.temperature}°C` },
        { label: "Relative Humidity",     value: `${weather.humidity}%` },
        { label: "Probability of Rainfall", value: `${weather.precipitationProbability}%` },
        { label: "Wind",                  value: `${weather.windSpeed} km/h ${windBearing(weather.windDirection)}` },
      ]
    : [];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="bg-[#021422] text-white p-3 flex items-center gap-2">
        <CloudSun size={18} className="text-blue-300" />
        <span className="font-semibold text-sm">Weather Overview</span>
      </div>
      <div className="p-4 flex-1 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#021422]" />
          </div>
        ) : error || !weather ? (
          <p className="text-sm text-gray-400 text-center py-6">Weather unavailable</p>
        ) : (
          rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{label}:</span>
              <span className="text-sm font-medium text-[#021422]">{value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
