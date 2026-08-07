"use client";

import { useState, useMemo } from "react";
import type {
  DailySummaryData,
  ScheduleSummaryData,
  WorkerData,
  GrandTotalData,
  CumulativeTotalData,
} from "../types";
import {
  getMockSchedulesForDate,
  getMockDailySummary,
  getMockGrandTotal,
  getMockWorkersForDate,
  getMockCumulativeTotal,
} from "../utils/mockData";

interface UseAttendanceDataReturn {
  loading: boolean;
  schedules: ScheduleSummaryData[];
  dailySummary: DailySummaryData;
  subTotal: GrandTotalData;
  cumulativeTotal: CumulativeTotalData;
  workers: WorkerData[];
  filteredWorkers: WorkerData[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedScheduleId: string;
  setSelectedScheduleId: (id: string) => void;
  refreshData: () => void;
}

export function useAttendanceData(): UseAttendanceDataReturn {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");

  const schedules = useMemo(() => getMockSchedulesForDate(selectedDate), [selectedDate]);
  const dailySummary = useMemo(() => getMockDailySummary(selectedDate), [selectedDate]);
  const grandTotal = useMemo(() => getMockGrandTotal(selectedDate), [selectedDate]);
  const cumulativeTotal = useMemo(() => getMockCumulativeTotal(selectedDate), [selectedDate]);
  const workers = useMemo(() => getMockWorkersForDate(selectedDate), [selectedDate]);

  const filteredWorkers = !selectedScheduleId
    ? workers
    : workers.filter((w) => w.scheduleId === selectedScheduleId);

  return {
    loading: false,
    schedules,
    dailySummary,
    subTotal: grandTotal,
    cumulativeTotal,
    workers,
    filteredWorkers,
    selectedDate,
    setSelectedDate,
    selectedScheduleId,
    setSelectedScheduleId,
    refreshData: () => {},
  };
}
