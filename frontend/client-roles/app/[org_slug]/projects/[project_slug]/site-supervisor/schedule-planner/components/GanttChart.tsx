"use client";

import React, { useMemo } from "react";
import moment from "moment";

export interface GanttItem {
  id: string;
  title: string;
  task: string;
  color: string;
  members: number | null;
  /** ISO date strings. */
  durationFrom: string;
  durationTo: string;
}

interface GanttChartProps {
  items: GanttItem[];
  /** First day of the visible window. */
  windowStart: Date;
  /** Number of days shown in the window. */
  windowDays: number;
  onSelect: (scheduleId: string) => void;
}

/**
 * A lightweight CSS-grid Gantt chart. Each schedule is one row; its bar spans
 * the days between durationFrom and durationTo, clipped to the visible window.
 * Monochrome by design — bars carry no status color; meaning lives in the labels.
 */
export default function GanttChart({
  items,
  windowStart,
  windowDays,
  onSelect,
}: GanttChartProps) {
  const start = useMemo(
    () => moment(windowStart).startOf("day"),
    [windowStart],
  );
  const end = useMemo(
    () => start.clone().add(windowDays - 1, "days"),
    [start, windowDays],
  );

  // Header day cells.
  const days = useMemo(
    () =>
      Array.from({ length: windowDays }, (_, i) =>
        start.clone().add(i, "days"),
      ),
    [start, windowDays],
  );

  // 1 label column + one column per day.
  const gridTemplate = `220px repeat(${windowDays}, minmax(0, 1fr))`;
  const today = moment().startOf("day");

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
        <p className="text-sm text-gray-400">
          No schedules yet — create one to see it on the timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
      <div className="min-w-[760px]">
        {/* Header row */}
        <div
          className="grid border-b border-gray-200"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Schedule
          </div>
          {days.map((d) => {
            const isToday = d.isSame(today, "day");
            const isWeekend = d.day() === 0 || d.day() === 6;
            return (
              <div
                key={d.format("YYYY-MM-DD")}
                className={`py-3 text-center ${isWeekend ? "bg-gray-50/60" : ""}`}
              >
                <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                  {d.format("ddd")}
                </div>
                <div
                  className={`mt-0.5 text-[13px] font-semibold ${
                    isToday ? "text-[#021422]" : "text-gray-500"
                  }`}
                >
                  {isToday ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#021422] text-white text-[11px]">
                      {d.format("D")}
                    </span>
                  ) : (
                    d.format("D")
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Schedule rows */}
        {items.map((item) => {
          const barStart = moment(item.durationFrom).startOf("day");
          const barEnd = moment(item.durationTo).startOf("day");

          // Clip the bar to the visible window.
          const clippedStart = moment.max(barStart, start.clone());
          const clippedEnd = moment.min(barEnd, end.clone());
          const visible = clippedEnd.isSameOrAfter(clippedStart);

          // Does the real bar extend beyond the visible window edges?
          const overflowsLeft = barStart.isBefore(start);
          const overflowsRight = barEnd.isAfter(end);

          const startCol = clippedStart.diff(start, "days") + 2; // +2: col 1 is label
          const span = clippedEnd.diff(clippedStart, "days") + 1;

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="group grid items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70 cursor-pointer transition-colors"
              style={{ gridTemplateColumns: gridTemplate, minHeight: 60 }}
            >
              {/* Label */}
              <div className="px-5 min-w-0">
                <p className="text-[13px] font-semibold text-[#021422] truncate">
                  {item.task || item.title || "Untitled schedule"}
                </p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                  {typeof item.members === "number"
                    ? `${item.members} ${item.members === 1 ? "worker" : "workers"}`
                    : "No workers assigned"}
                </p>
              </div>

              {/* Timeline grid background + bar */}
              <div
                className="relative grid h-full"
                style={{
                  gridColumn: `2 / span ${windowDays}`,
                  gridTemplateColumns: `repeat(${windowDays}, minmax(0, 1fr))`,
                }}
              >
                {/* day gridlines / weekend shading */}
                {days.map((d) => {
                  const isWeekend = d.day() === 0 || d.day() === 6;
                  return (
                    <div
                      key={d.format("YYYY-MM-DD")}
                      className={`border-l border-gray-100 ${
                        isWeekend ? "bg-gray-50/60" : ""
                      } ${d.isSame(today, "day") ? "bg-gray-100/50" : ""}`}
                    />
                  );
                })}

                {/* the bar */}
                {visible && (
                  <div
                    className="absolute inset-y-0 flex items-center"
                    style={{
                      left: `${((startCol - 2) / windowDays) * 100}%`,
                      width: `${(span / windowDays) * 100}%`,
                    }}
                  >
                    <div
                      title={`${item.task || item.title} • ${moment(
                        item.durationFrom,
                      ).format("D MMM")} – ${moment(item.durationTo).format(
                        "D MMM",
                      )}`}
                      className={`w-full h-5 mx-1.5 bg-[#007AFF] flex items-center px-3 overflow-hidden transition-all group-hover:bg-[#0066D6] ${
                        overflowsLeft ? "rounded-l-none" : "rounded-l-full"
                      } ${overflowsRight ? "rounded-r-none" : "rounded-r-full"}`}
                    >
                      <span className="text-[11px] font-medium text-white truncate">
                        {item.task || item.title}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
