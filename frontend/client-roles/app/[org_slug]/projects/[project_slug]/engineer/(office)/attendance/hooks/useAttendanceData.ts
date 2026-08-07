"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { schedulingService } from "@/lib/services/schedulingService";
import { attendanceService } from "@/lib/services/attendanceService";
import type {
  ScheduleListItem,
  ScheduleWorker,
  DailyWorkerLog as ApiDailyLog,
} from "@/lib/services/schedulingService";
import type { AttendanceRecord } from "@/lib/services/attendanceService";
import { attendanceKeys, schedulingKeys } from "@/lib/queryKeys";
import { toUiStatus } from "@/lib/attendance/status";
import type {
  ScheduleData,
  WorkerData,
  DailySummaryData,
  CrewData,
} from "../types";

const todayStr = () => new Date().toISOString().split("T")[0];

const unwrapList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  const obj = payload as { results?: T[]; data?: T[] } | undefined;
  return obj?.results ?? obj?.data ?? [];
};

/** Base schedule shape from the list endpoint (counts filled in later). */
interface ScheduleBase {
  id: string;
  taskName: string;
  durationFrom: string;
  durationTo: string;
}

interface UseAttendanceDataReturn {
  loading: boolean;
  schedules: ScheduleData[];
  dailySummary: DailySummaryData;
  crews: CrewData[];
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
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("all");

  const pid = projectUuid ?? "";

  // All project schedules (with their date ranges).
  const { data: allSchedules = [], isLoading: schedulesLoading } = useQuery<
    ScheduleBase[]
  >({
    queryKey: schedulingKeys.schedules(pid),
    queryFn: async () => {
      const res = await schedulingService.listSchedules(pid);
      return unwrapList<ScheduleListItem>(res.data).map((s) => ({
        id: s.id,
        taskName: s.task_name,
        durationFrom: s.duration_from,
        durationTo: s.duration_to,
      }));
    },
    enabled: !!projectUuid,
    staleTime: 60 * 1000,
  });

  // Only schedules whose date range covers the selected day are relevant.
  const activeSchedules = useMemo(
    () =>
      allSchedules.filter(
        (s) => s.durationFrom <= selectedDate && selectedDate <= s.durationTo,
      ),
    [allSchedules, selectedDate],
  );

  // One query per active schedule: fetch its records + that day's roster +
  // the permanent roster, and merge them into table rows. Runs in parallel;
  // a single schedule failing only blanks its own group, not the whole page.
  const workerQueries = useQueries({
    queries: activeSchedules.map((schedule) => ({
      queryKey: attendanceKeys.rows(schedule.id, selectedDate),
      queryFn: async (): Promise<WorkerData[]> => {
        const [recRes, logRes, rosterRes] = await Promise.all([
          attendanceService.listRecords(pid, schedule.id, selectedDate),
          schedulingService.listDailyLogs(pid, schedule.id),
          schedulingService.listScheduleWorkers(pid, schedule.id),
        ]);
        const records = unwrapList<AttendanceRecord>(recRes.data);
        const logs = unwrapList<ApiDailyLog>(logRes.data);
        const roster = unwrapList<ScheduleWorker>(rosterRes.data);
        const dayLog = logs.find((l) => l.date === selectedDate);
        const recordByWorker = new Map(
          records.map((r) => [r.schedule_worker, r]),
        );

        // Expected roster for the day → one row each; status comes from the
        // matching record, or "unmarked" when no record exists yet. Daily logs
        // take precedence (they include day-adds/removes); fall back to the
        // schedule's permanent roster when no daily log exists yet for the day.
        const expectedWorkers =
          (dayLog?.workers.length ?? 0) > 0
            ? dayLog!.workers
            : roster.map((w) => ({
                id: w.id,
                name: w.name,
                trade: w.trade,
              }));

        return expectedWorkers.map((w) => {
          const rec = recordByWorker.get(w.id);
          return {
            id: w.id,
            name: w.name,
            trade: w.trade,
            crewName: rec?.crew_name ?? "",
            crewId: "",
            scheduleName: schedule.taskName,
            scheduleId: schedule.id,
            taskId: "",
            status: rec ? toUiStatus(rec.status) : "unmarked",
            checkIn: rec?.check_in ?? undefined,
            checkOut: rec?.check_out ?? undefined,
            notes: rec?.notes ?? undefined,
          };
        });
      },
      enabled: !!projectUuid,
    })),
  });

  const workersLoading = workerQueries.some((q) => q.isPending);

  // Flatten all schedules' rows into one project-wide list. The dependency
  // array must keep a constant size, so we use the stable queries array.
  const workers: WorkerData[] = useMemo(
    () => workerQueries.flatMap((q) => q.data ?? []),
    [workerQueries],
  );

  // Table filter — the summary stays project-wide regardless of this selection.
  const filteredWorkers = useMemo(
    () =>
      selectedScheduleId === "all"
        ? workers
        : workers.filter((w) => w.scheduleId === selectedScheduleId),
    [workers, selectedScheduleId],
  );

  const countBy = (rows: WorkerData[], status: string) =>
    rows.filter((w) => w.status === status).length;

  // Per-schedule cards: counts derived from that schedule's rows.
  const schedules: ScheduleData[] = useMemo(
    () =>
      activeSchedules.map((s) => {
        const rows = workers.filter((w) => w.scheduleId === s.id);
        const crewNames = [
          ...new Set(rows.map((w) => w.crewName).filter(Boolean)),
        ];
        return {
          id: s.id,
          taskId: "",
          taskName: s.taskName,
          crewName: crewNames.join(", "),
          crewId: "",
          durationFrom: s.durationFrom,
          durationTo: s.durationTo,
          workers: rows,
          totalWorkers: rows.length,
          present: countBy(rows, "present"),
          absent: countBy(rows, "absent"),
          late: countBy(rows, "late"),
          early: countBy(rows, "early"),
        };
      }),
    [activeSchedules, workers],
  );

  // Project-wide daily summary (all active schedules).
  const dailySummary: DailySummaryData = useMemo(
    () => ({
      totalWorkers: workers.length,
      present: countBy(workers, "present"),
      late: countBy(workers, "late"),
      early: countBy(workers, "early"),
      absent: countBy(workers, "absent"),
      totalSchedules: activeSchedules.length,
    }),
    [workers, activeSchedules.length],
  );

  // Crew rollup — grouped from rows since there's no per-crew endpoint.
  const crews: CrewData[] = useMemo(() => {
    const map = new Map<string, CrewData>();
    for (const w of workers) {
      const key = w.crewName || "Unassigned";
      const entry = map.get(key) ?? {
        id: key,
        name: key,
        members: 0,
        present: 0,
        absent: 0,
      };
      entry.members += 1;
      if (w.status === "absent") entry.absent += 1;
      else if (w.status !== "unmarked") entry.present += 1;
      map.set(key, entry);
    }
    return [...map.values()];
  }, [workers]);

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["attendance"] });
    queryClient.invalidateQueries({ queryKey: schedulingKeys.schedules(pid) });
  }, [queryClient, pid]);

  return {
    loading: schedulesLoading || workersLoading,
    schedules,
    dailySummary,
    crews,
    workers,
    filteredWorkers,
    selectedDate,
    setSelectedDate,
    selectedScheduleId,
    setSelectedScheduleId,
    refreshData,
  };
}
