"use client";

import { Clock } from "lucide-react";
import { HourlySlot, getWeatherEmoji } from "@/lib/weather";

interface Props {
  slots: HourlySlot[];
  selectedHour: number;
  currentHour: number;
  onSelect: (hour: number) => void;
}

export default function HourSelector({ slots, selectedHour, currentHour, onSelect }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-[#021422] text-white px-4 py-3 flex items-center gap-2">
        <Clock size={15} className="text-blue-300" />
        <span className="font-bold text-sm">Check Weather by Time</span>
        <span className="ml-auto text-[11px] text-gray-400">Tap a time to see forecast conditions</span>
      </div>
      <div className="px-3 py-3 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {slots.map((slot) => {
            const isNow = slot.hour === currentHour;
            const isSelected = slot.hour === selectedHour;

            return (
              <button
                key={slot.hour}
                onClick={() => onSelect(slot.hour)}
                className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[54px] border-2 ${
                  isSelected
                    ? "bg-white border-[#0070D4]"
                    : "bg-gray-50 border-transparent hover:border-gray-200"
                }`}
              >
                {/* Now pill */}
                {isNow && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase bg-[#0070D4] text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    Now
                  </span>
                )}

                <span className={`text-[10px] font-semibold mt-1 ${isSelected ? "text-[#0070D4]" : "text-gray-400"}`}>
                  {slot.label}
                </span>
                <span className="text-base leading-none">{getWeatherEmoji(slot.weatherCode)}</span>
                <span className={`text-xs font-bold ${isSelected ? "text-[#021422]" : "text-[#021422]"}`}>
                  {slot.temperature}°
                </span>
                {slot.precipitationProbability > 0 && (
                  <span className={`text-[9px] font-medium ${
                    slot.precipitationProbability >= 50 ? "text-[#0070D4]" : "text-gray-300"
                  }`}>
                    {slot.precipitationProbability}%
                  </span>
                )}

                {/* Selected bottom dot */}
                {isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0070D4]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
