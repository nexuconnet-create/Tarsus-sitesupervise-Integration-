"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { schedulingService } from "@/lib/services/schedulingService";
import {
  attendanceService,
  type AttendanceRecord,
  type DailySummary,
} from "@/lib/services/attendanceService";
import type {
  ScheduleListItem,
  DailyWorkerLog as ApiDailyLog,
} from "@/lib/services/schedulingService";
import { schedulingKeys } from "@/lib/queryKeys";
import { toUiStatus } from "@/lib/attendance/status";
import type {
  DailySummaryData,
  ScheduleSummaryData,
  WorkerData,
  GrandTotalData,
  CumulativeTotalData,
} from "../types";

const EMPTY_SUMMARY: DailySummaryData = {
  totalWorkers: 0,
  present: 0,
  early: 0,
  late: 0,
  absent: 0,
};

const todayStr = () => new Date().toISOString().split("T")[0];

const unwrapList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  const obj = payload as { results?: T[]; data?: T[] } | undefined;
  return obj?.results ?? obj?.data ?? [];
};

// ── Atomic query result shape ────────────────────────────────────────────────

interface AttendanceQueryResult {
  workers: WorkerData[];
  dailySummary: DailySummaryData;
  subTotal: GrandTotalData;
  scheduleSummary: unknown;
  cumulative: CumulativeTotalData;
}

// ── Return type ──────────────────────────────────────────────────────────────

interface UseAttendanceDataReturn {
  loading: boolean;
  schedules: ScheduleSummaryData[];
  dailySummary: DailySummaryData;
  scheduleSummary: unknown;
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

export function useAttendanceData(
  projectUuid: string | undefined,
): UseAttendanceDataReturn {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");

  const pid = projectUuid ?? "";

  // Schedules — drives the filter dropdown.
  const { data: schedules = [] } = useQuery<ScheduleSummaryData[]>({
    queryKey: schedulingKeys.schedules(pid),
    queryFn: async () => {
      const res = await schedulingService.listSchedules(pid);
      return unwrapList<ScheduleListItem>(res.data).map((s) => ({
        id: s.id,
        taskName: s.task_name,
        crews: [],
        subtotalPresent: 0,
        subtotalAbsent: 0,
        durationFrom: s.duration_from,
        durationTo: s.duration_to,
      }));
    },
    enabled: !!projectUuid,
    staleTime: 60 * 1000,
  });

  // ── Determine which schedules to query ─────────────────────────────────────
  const isAll = selectedScheduleId === "";
  const activeScheduleIds = useMemo(
    () =>
      isAll
        ? schedules.map((s) => s.id)
        : selectedScheduleId
          ? [selectedScheduleId]
          : [],
    [isAll, schedules, selectedScheduleId],
  );

  // ── Single atomic query ────────────────────────────────────────────────────
  // Fetches all data in one queryFn so everything settles together.
  const { data, isLoading } = useQuery<AttendanceQueryResult>({
    queryKey: [
      "attendance",
      pid,
      isAll ? "all" : selectedScheduleId,
      selectedDate,
    ],
    queryFn: async () => {
      // 1. Fetch records + daily logs for every active schedule in parallel.
      const perSchedule = await Promise.all(
        activeScheduleIds.map(async (sid) => {
          const [recRes, logRes] = await Promise.all([
            attendanceService.listRecords(pid, sid, selectedDate),
            schedulingService.listDailyLogs(pid, sid),
          ]);
          return {
            scheduleId: sid,
            records: unwrapList<AttendanceRecord>(recRes.data),
            dailyLogs: unwrapList<ApiDailyLog>(logRes.data),
          };
        }),
      );

      // 2. For specific-schedule mode, also fetch summary + extras.
      let backendSummary: DailySummary | null = null;
      let scheduleSummaryData: unknown = null;
      let cumulativeData: CumulativeTotalData = { present: 0, absent: 0 };

      if (!isAll && selectedScheduleId) {
        const [sumRes, schedSumRes, cumRes] = await Promise.all([
          attendanceService.getSummary(pid, selectedScheduleId, selectedDate),
          attendanceService.getScheduleSummary(
            pid,
            selectedScheduleId,
            selectedDate,
          ),
          attendanceService.getCumulative(
            pid,
            selectedScheduleId,
            selectedDate,
          ),
        ]);
        backendSummary = (sumRes.data ?? null) as DailySummary | null;
        scheduleSummaryData = schedSumRes.data ?? null;
        const c = cumRes.data ?? {};
        cumulativeData = { present: c.present ?? 0, absent: c.absent ?? 0 };
      }

      // 3. Build worker rows by matching records against the daily-log roster.
      const allRecords = perSchedule.flatMap((s) => s.records);
      const recordByWorker = new Map(
        allRecords.map((r) => [r.schedule_worker, r]),
      );
      const workers: WorkerData[] = [];

      for (const entry of perSchedule) {
        const dayLog =
          entry.dailyLogs.find((l) => l.date === selectedDate) ?? null;
        const expected = dayLog?.workers ?? [];
        const scheduleName =
          schedules.find((s) => s.id === entry.scheduleId)?.taskName ?? "";

        for (const w of expected) {
          const rec = recordByWorker.get(w.id);
          workers.push({
            id: w.id,
            scheduleWorkerId: w.id,
            recordId: rec?.id,
            name: w.name,
            crewName: rec?.crew_name ?? "",
            crewId: "",
            scheduleName,
            scheduleId: entry.scheduleId,
            status: rec ? toUiStatus(rec.status) : "unmarked",
            checkIn: rec?.check_in ?? undefined,
            checkOut: rec?.check_out ?? undefined,
            notes: rec?.notes ?? undefined,
          });
        }
      }

      // 4. Compute daily summary — prefer backend summary when available.
      const countBy = (status: string) =>
        workers.filter((w) => w.status === status).length;

      const dailySummary: DailySummaryData = backendSummary
        ? {
            totalWorkers: backendSummary.total_workers,
            present: backendSummary.present,
            early: backendSummary.early,
            late: backendSummary.late,
            absent: backendSummary.absent,
          }
        : {
            totalWorkers: workers.length,
            present: countBy("present"),
            early: countBy("early"),
            late: countBy("late"),
            absent: countBy("absent"),
          };

      const subTotal: GrandTotalData = {
        present: dailySummary.present + dailySummary.late + dailySummary.early,
        absent: dailySummary.absent,
      };

      return {
        workers,
        dailySummary,
        subTotal,
        scheduleSummary: scheduleSummaryData,
        cumulative: cumulativeData,
      };
    },
    enabled: !!projectUuid && activeScheduleIds.length > 0,
    staleTime: 30_000,
  });

  // ── Extract results (safe defaults while loading) ──────────────────────────
  const workers = data?.workers ?? [];
  const dailySummary = data?.dailySummary ?? EMPTY_SUMMARY;
  const subTotal = data?.subTotal ?? { present: 0, absent: 0 };
  const scheduleSummary = data?.scheduleSummary ?? null;
  const cumulativeTotal = data?.cumulative ?? { present: 0, absent: 0 };

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["attendance"] });
    queryClient.invalidateQueries({ queryKey: schedulingKeys.all(pid) });
  }, [queryClient, pid]);

  return {
    loading: isLoading,
    schedules,
    dailySummary,
    scheduleSummary,
    subTotal,
    cumulativeTotal,
    workers,
    filteredWorkers: workers,
    selectedDate,
    setSelectedDate,
    selectedScheduleId,
    setSelectedScheduleId,
    refreshData,
  };
}
