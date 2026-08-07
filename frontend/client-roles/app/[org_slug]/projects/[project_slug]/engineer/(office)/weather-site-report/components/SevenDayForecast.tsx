"use client";

import { CalendarDays } from "lucide-react";
import { ForecastDay, getWeatherEmoji } from "@/lib/weather";

interface Props {
  forecast: ForecastDay[];
}

export default function SevenDayForecast({ forecast }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-[#021422] text-white p-4 flex items-center gap-2">
        <CalendarDays size={16} className="text-blue-300" />
        <h3 className="font-bold text-sm">7-Day Forecast</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1.5">
          {forecast.map((day, i) => {
            const isToday = i === 0;
            return (
              <div
                key={day.date}
                className={`relative flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border-2 transition-all ${
                  isToday
                    ? "bg-white border-[#0070D4]"
                    : "bg-gray-50 border-transparent"
                }`}
              >
                {/* Today pill */}
                {isToday && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase bg-[#0070D4] text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    Today
                  </span>
                )}

                <p className={`text-[10px] font-bold uppercase mt-1 ${isToday ? "text-[#0070D4]" : "text-gray-400"}`}>
                  {day.label}
                </p>
                <span className="text-lg leading-none">{getWeatherEmoji(day.weatherCode)}</span>
                <p className={`text-xs font-bold ${isToday ? "text-[#021422]" : "text-[#021422]"}`}>
                  {day.tempMax}°
                </p>
                <p className="text-[10px] text-gray-400">{day.tempMin}°</p>
                {day.precipProbability > 0 && (
                  <p className={`text-[9px] font-medium ${
                    day.precipProbability >= 60 ? "text-[#0070D4]" : "text-gray-300"
                  }`}>
                    {day.precipProbability}%
                  </p>
                )}

                {/* Today bottom dot */}
                {isToday && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0070D4]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
