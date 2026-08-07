"use client";

import { Droplets, Wind, Eye, Thermometer } from "lucide-react";
import { WeatherData, getConditionLabel, getWeatherEmoji, windBearing } from "@/lib/weather";

interface Props {
  weather: WeatherData;
  forecastLabel?: string;
}

export default function CurrentWeatherPanel({ weather, forecastLabel }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-[#021422] text-white px-3 py-2.5 flex items-center gap-2">
        <span className="text-base">{getWeatherEmoji(weather.weatherCode)}</span>
        <h3 className="font-bold text-sm">{forecastLabel ? `Forecast — ${forecastLabel}` : "Current Weather"}</h3>
      </div>
      <div className="p-3 flex flex-col gap-3">
        {/* Main reading */}
        <div className="flex items-center gap-2">
          <span className="text-xl">{getWeatherEmoji(weather.weatherCode)}</span>
          <div>
            <p className="text-2xl font-bold text-[#021422]">{weather.temperature}°C</p>
            <p className="text-xs text-gray-500 font-medium">{getConditionLabel(weather.weatherCode)}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg px-2.5 py-2 flex items-center gap-2">
            <Wind size={13} className="text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-[9px] text-gray-400 uppercase font-semibold">Wind</p>
              <p className="text-xs font-bold text-[#021422]">
                {weather.windSpeed} km/h {windBearing(weather.windDirection)}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-2.5 py-2 flex items-center gap-2">
            <Droplets size={13} className="text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-[9px] text-gray-400 uppercase font-semibold">Humidity</p>
              <p className="text-xs font-bold text-[#021422]">{weather.humidity}%</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-2.5 py-2 flex items-center gap-2">
            <Droplets size={13} className="text-indigo-400 flex-shrink-0" />
            <div>
              <p className="text-[9px] text-gray-400 uppercase font-semibold">Rain Chance</p>
              <p className="text-xs font-bold text-[#021422]">{weather.precipitationProbability}%</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-2.5 py-2 flex items-center gap-2">
            <Eye size={13} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-[9px] text-gray-400 uppercase font-semibold">Visibility</p>
              <p className="text-xs font-bold text-[#021422]">10 km</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
