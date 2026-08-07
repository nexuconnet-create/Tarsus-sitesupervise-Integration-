"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, AlertTriangle, Calendar } from "lucide-react";
import moment from "moment";
import { schedulingService } from "@/lib/services/schedulingService";
import { taskService } from "@/lib/services/taskService";
import type {
  ScheduleListItem,
  ScheduleDetail,
  DailyLogShort,
  DailyLogWorker,
  DailyWorkerLog as ApiDailyWorkerLog,
  ScheduleConflict,
  TaskCrew,
  AvailableWorker,
  ScheduleWorker,
  OvertimeEntry,
  ProposeAddRosterBody,
} from "@/lib/services/schedulingService";
import type { TaskListItem } from "@/lib/types/api";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { schedulingKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/error";
import { toast } from "react-hot-toast";
import { formatDate } from "@/lib/dateUtils";
import { getMockCrews } from "@/lib/mockData";
import CrewSelectionModal from "./components/CrewSelectionModal";
import ScheduleDetailsModal from "./components/ScheduleDetailsModal";
import AddRosterWorkerModal from "./components/AddRosterWorkerModal";
import RescheduleModal from "./components/RescheduleModal";
import OvertimeModal from "./components/OvertimeModal";
import CrewHeader from "../component/CrewHeader";
import GanttChart from "./components/GanttChart";

const colorPalette = ["blue", "purple", "cyan", "orange", "green"];

interface DayWorker {
  id: string; // ScheduleWorker UUID
  name: string;
  trade: string;
  memberId: string;
  isDayAdd: boolean; // added for this day only (not on permanent roster)
}

/** Minimal shape needed to add a pool worker to a day. */
type DayAddTarget = { id: string; type: "crew_member" | "pool_worker" };

interface DailyWorkerLog {
  id?: string; // daily log UUID — needed for propose/approve/reject
  date: string;
  workerIds: string[]; // confirmed ScheduleWorker UUIDs
  workers: DayWorker[]; // full confirmed worker objects (carries isDayAdd)
  status: "confirmed" | "pending" | "rejected";
  pendingWorkerIds?: string[];
  rejectionReason?: string;
}

interface ScheduleItem {
  id: string;
  start: Date;
  end: Date;
  title: string;
  members: number | null;
  task: string;
  taskId: string;
  loc: string;
  color: string;
  work_package: string;
  site_zone: string;
  notes?: string;
  durationFrom: string;
  durationTo: string;
  startTime?: string | null;
  endTime?: string | null;
  createdAt?: string;
  pendingCount?: number; // roster changes awaiting review
  workers?: { id: string; memberId: string; name: string; trade: string }[];
  dailyWorkerLogs?: DailyWorkerLog[];
}

/* ─── mappers ──────────────────────────────────────────────────────────── */

const mapDayWorker = (w: DailyLogWorker): DayWorker => ({
  id: w.id,
  name: w.name,
  trade: w.trade,
  memberId: w.member_code || "",
  isDayAdd: !!w.is_day_add,
});

const mapShortLog = (l: DailyLogShort): DailyWorkerLog => ({
  id: l.id,
  date: l.date,
  workerIds: l.workers.map((w) => w.id),
  workers: l.workers.map(mapDayWorker),
  status: l.status,
  pendingWorkerIds: l.pending_workers.map((w) => w.id),
});

const mapFullLog = (l: ApiDailyWorkerLog): DailyWorkerLog => ({
  id: l.id,
  date: l.date,
  workerIds: l.workers.map((w) => w.id),
  workers: l.workers.map(mapDayWorker),
  status: l.status,
  pendingWorkerIds: l.pending_workers.map((w) => w.id),
  rejectionReason: l.rejection_reason || undefined,
});

const mapListItem = (item: ScheduleListItem, idx: number): ScheduleItem => ({
  id: item.id,
  start: new Date(item.duration_from),
  end: new Date(item.duration_to),
  title: item.task_name || "Shift",
  members: item.member_count ?? null,
  task: item.task_name || "",
  taskId: "",
  loc: "",
  color: colorPalette[idx % colorPalette.length],
  work_package: "",
  site_zone: "",
  notes: "",
  durationFrom: item.duration_from,
  durationTo: item.duration_to,
  pendingCount: item.pending_count ?? 0,
  workers: [],
  dailyWorkerLogs: [],
});

const mapDetail = (d: ScheduleDetail, color: string): ScheduleItem => ({
  id: d.id,
  start: new Date(d.duration_from),
  end: new Date(d.duration_to),
  title: d.task_name || "Shift",
  members: d.member_count ?? null,
  task: d.task_name || "",
  taskId: d.task_id || "",
  loc: d.location || "",
  color,
  work_package: d.work_package || "",
  site_zone: d.site_zone || "",
  notes: d.notes || "",
  durationFrom: d.duration_from,
  durationTo: d.duration_to,
  startTime: d.start_time,
  endTime: d.end_time,
  createdAt: d.created_at,
  workers: d.workers
    .filter((w) => w.is_active)
    .map((w) => ({
      id: w.id,
      memberId: w.member_code || "",
      name: w.name,
      trade: w.trade,
    })),
  dailyWorkerLogs: d.daily_logs.map(mapShortLog),
});

const unwrapList = <T,>(payload: any): T[] =>
  Array.isArray(payload) ? payload : payload?.results || payload?.data || [];

export default function SchedulePlannerPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const base = `/${orgSlug}/projects/${projectSlug}/site-supervisor`;
  const { getProject } = useMemberships();
  const project = getProject(orgSlug, projectSlug);
  const { data: projectUuid } = useProjectUuid(orgSlug, projectSlug);
  const queryClient = useQueryClient();
  const pid = projectUuid ?? "";

  // Static available pool — drag/drop assignment has no endpoint yet (visual stub).
  const availablePool = useMemo(
    () =>
      getMockCrews().flatMap((t: any) =>
        (t.workers || [])
          .filter((m: any) => !m.assigned)
          .map((m: any) => ({
            name: m.name || "Member",
            trade: m.trade || t.name || "",
            memberId: m.memberId || m.id || "",
          })),
      ),
    [],
  );

  // Gantt window: first visible day, anchored to the start of the week.
  const [calendarDate, setCalendarDate] = useState(
    moment().startOf("isoWeek").toDate(),
  );
  // Number of days shown across the Gantt window (7 = 1 week, 14 = 2 weeks).
  const [windowDays, setWindowDays] = useState(7);
  const [showCrewModal, setShowCrewModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [showAddRosterModal, setShowAddRosterModal] = useState(false);
  const [editingOvertimeEntry, setEditingOvertimeEntry] = useState<OvertimeEntry | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null,
  );
  const [deactivatedWorkers, setDeactivatedWorkers] = useState<Set<string>>(
    new Set(),
  );
  const [formData, setFormData] = useState({
    taskId: "",
    crews: [] as string[],
    work_package: "",
    site_zone: "",
    notes: "",
    durationFrom: "",
    durationTo: "",
    startTime: "",
    endTime: "",
  });

  /* ─── Queries ───────────────────────────────────────────────────────── */

  const { data: schedules = [], isLoading } = useQuery<ScheduleItem[]>({
    queryKey: schedulingKeys.schedules(pid),
    queryFn: async () => {
      const res = await schedulingService.listSchedules(pid);
      return unwrapList<ScheduleListItem>(res.data).map(mapListItem);
    },
    enabled: !!projectUuid,
    staleTime: 60 * 1000,
  });

  const { data: tasks = [] } = useQuery<TaskListItem[]>({
    queryKey: schedulingKeys.tasks(pid),
    queryFn: async () => {
      const res = await taskService.list(pid);
      return unwrapList<TaskListItem>(res.data);
    },
    enabled: !!projectUuid,
    staleTime: 5 * 60 * 1000,
  });

  const { data: taskCrews = [] } = useQuery<TaskCrew[]>({
    queryKey: schedulingKeys.taskCrews(pid, formData.taskId),
    queryFn: async () => {
      const res = await schedulingService.getTaskCrews(pid, formData.taskId);
      return unwrapList<TaskCrew>(res.data);
    },
    enabled: !!projectUuid && !!formData.taskId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: scheduleDetail } = useQuery<ScheduleDetail | null>({
    queryKey: schedulingKeys.schedule(pid, selectedScheduleId ?? ""),
    queryFn: async () => {
      const res = await schedulingService.getSchedule(pid, selectedScheduleId!);
      return res.data as ScheduleDetail;
    },
    enabled: !!projectUuid && !!selectedScheduleId,
  });

  const { data: dailyLogs } = useQuery<DailyWorkerLog[]>({
    queryKey: schedulingKeys.dailyLogs(pid, selectedScheduleId ?? ""),
    queryFn: async () => {
      const res = await schedulingService.listDailyLogs(
        pid,
        selectedScheduleId!,
      );
      return unwrapList<ApiDailyWorkerLog>(res.data).map(mapFullLog);
    },
    enabled: !!projectUuid && !!selectedScheduleId,
  });

  const { data: conflicts = [] } = useQuery<ScheduleConflict[]>({
    queryKey: schedulingKeys.conflicts(pid, selectedScheduleId ?? ""),
    queryFn: async () => {
      const res = await schedulingService.getConflicts(
        pid,
        selectedScheduleId!,
      );
      return unwrapList<ScheduleConflict>(res.data);
    },
    enabled: !!projectUuid && !!selectedScheduleId,
  });

  // Pool of workers available to add to a specific day (day-only adds).
  const { data: availableWorkers = [] } = useQuery<AvailableWorker[]>({
    queryKey: schedulingKeys.availableWorkers(pid, selectedScheduleId ?? ""),
    queryFn: async () => {
      const res = await schedulingService.getScheduleAvailableWorkers(
        pid,
        selectedScheduleId!,
      );
      return unwrapList<AvailableWorker>(res.data);
    },
    enabled: !!projectUuid && !!selectedScheduleId,
  });

  // Overtime entries for the selected schedule.
  const { data: overtimeEntries = [] } = useQuery<OvertimeEntry[]>({
    queryKey: schedulingKeys.overtime(pid, selectedScheduleId ?? ""),
    queryFn: async () => {
      const res = await schedulingService.listOvertime(
        pid,
        selectedScheduleId!,
      );
      return unwrapList<OvertimeEntry>(res.data);
    },
    enabled: !!projectUuid && !!selectedScheduleId,
  });

  // Full worker roster for the selected schedule (excludes day-adds).
  const { data: rosterWorkers = [] } = useQuery<ScheduleWorker[]>({
    queryKey: schedulingKeys.scheduleWorkers(pid, selectedScheduleId ?? ""),
    queryFn: async () => {
      const res = await schedulingService.listScheduleWorkers(
        pid,
        selectedScheduleId!,
      );
      return unwrapList<ScheduleWorker>(res.data);
    },
    enabled: !!projectUuid && !!selectedScheduleId,
  });

  // Pending roster changes (pending_add / pending_remove).
  const { data: pendingRosterWorkers = [] } = useQuery<ScheduleWorker[]>({
    queryKey: schedulingKeys.pendingWorkers(pid, selectedScheduleId ?? ""),
    queryFn: async () => {
      const res = await schedulingService.listPendingWorkers(
        pid,
        selectedScheduleId!,
      );
      return unwrapList<ScheduleWorker>(res.data);
    },
    enabled: !!projectUuid && !!selectedScheduleId,
  });

  const colorOf = (id: string) =>
    schedules.find((s) => s.id === id)?.color ?? "blue";

  // Merge list + detail + full daily logs into the shape the modals consume.
  const selectedSchedule: ScheduleItem | null = useMemo(() => {
    if (!selectedScheduleId) return null;
    const listItem = schedules.find((s) => s.id === selectedScheduleId) ?? null;
    if (!scheduleDetail) return listItem;
    const mapped = mapDetail(scheduleDetail, colorOf(selectedScheduleId));
    if (dailyLogs) mapped.dailyWorkerLogs = dailyLogs;
    return mapped;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScheduleId, schedules, scheduleDetail, dailyLogs]);

  /* ─── Mutations ─────────────────────────────────────────────────────── */

  const invalidateSchedules = () =>
    queryClient.invalidateQueries({
      queryKey: schedulingKeys.schedules(pid),
    });
  const invalidateLogs = (scheduleId: string) =>
    queryClient.invalidateQueries({
      queryKey: schedulingKeys.dailyLogs(pid, scheduleId),
    });
  const invalidateOvertime = (scheduleId: string) =>
    queryClient.invalidateQueries({
      queryKey: schedulingKeys.overtime(pid, scheduleId),
    });
  const invalidateRoster = (scheduleId: string) =>
    queryClient.invalidateQueries({
      queryKey: schedulingKeys.scheduleWorkers(pid, scheduleId),
    });

  const createMutation = useMutation({
    mutationFn: () => {
      const crewsPayload = formData.crews.map((crewId) => {
        const crew = taskCrews.find((c) => c.id === crewId);
        const excluded = (crew?.members || [])
          .filter((m) => deactivatedWorkers.has(m.id))
          .map((m) => m.id);
        return { crew_id: crewId, excluded_member_ids: excluded };
      });
      return schedulingService.createSchedule(pid, {
        task_id: formData.taskId,
        duration_from: formData.durationFrom,
        duration_to: formData.durationTo,
        crews: crewsPayload,
        start_time: formData.startTime || null,
        end_time: formData.endTime || null,
        notes: formData.notes,
      });
    },
    onSuccess: () => {
      invalidateSchedules();
      toast.success("Schedule created successfully");
      resetForm();
      setDeactivatedWorkers(new Set());
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => schedulingService.deleteSchedule(pid, id),
    onSuccess: () => {
      invalidateSchedules();
      toast.success("Schedule deleted");
      setShowDetailsModal(false);
      setSelectedScheduleId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({
      id,
      newFrom,
      newTo,
    }: {
      id: string;
      newFrom: string;
      newTo: string;
    }) =>
      schedulingService.reschedule(pid, id, {
        new_from: newFrom,
        new_to: newTo,
      }),
    onSuccess: (_res, vars) => {
      invalidateSchedules();
      queryClient.invalidateQueries({
        queryKey: schedulingKeys.schedule(pid, vars.id),
      });
      toast.success("Schedule rescheduled successfully");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const proposeMutation = useMutation({
    mutationFn: ({
      scheduleId,
      logId,
      removeWorkerIds,
    }: {
      scheduleId: string;
      logId: string;
      removeWorkerIds: string[];
    }) =>
      schedulingService.proposeDailyLog(
        pid,
        scheduleId,
        logId,
        removeWorkerIds,
      ),
    onSuccess: (_res, vars) => {
      invalidateLogs(vars.scheduleId);
      toast.success("Worker changes sent for approval");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const approveMutation = useMutation({
    mutationFn: ({
      scheduleId,
      logId,
    }: {
      scheduleId: string;
      logId: string;
    }) => schedulingService.approveDailyLog(pid, scheduleId, logId),
    onSuccess: (_res, vars) => {
      invalidateLogs(vars.scheduleId);
      toast.success("Worker changes approved");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: ({
      scheduleId,
      logId,
      reason,
    }: {
      scheduleId: string;
      logId: string;
      reason: string;
    }) => schedulingService.rejectDailyLog(pid, scheduleId, logId, reason),
    onSuccess: (_res, vars) => {
      invalidateLogs(vars.scheduleId);
      toast.success("Worker changes rejected");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const overtimeMutation = useMutation({
    mutationFn: ({
      scheduleId,
      payload,
    }: {
      scheduleId: string;
      payload: {
        workers: string[];
        date: string;
        start_time: string;
        end_time: string;
        notes?: string;
      };
    }) => schedulingService.createOvertime(pid, scheduleId, payload),
    onSuccess: (_res, vars) => {
      invalidateOvertime(vars.scheduleId);
    },
  });

  const updateOvertimeMutation = useMutation({
    mutationFn: ({
      scheduleId,
      overtimeId,
      payload,
    }: {
      scheduleId: string;
      overtimeId: string;
      payload: { date?: string; start_time?: string; end_time?: string; notes?: string };
    }) => schedulingService.updateOvertime(pid, scheduleId, overtimeId, payload),
    onSuccess: (_res, vars) => {
      invalidateOvertime(vars.scheduleId);
      toast.success("Overtime updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteOvertimeMutation = useMutation({
    mutationFn: ({ scheduleId, overtimeId }: { scheduleId: string; overtimeId: string }) =>
      schedulingService.deleteOvertime(pid, scheduleId, overtimeId),
    onSuccess: (_res, vars) => {
      invalidateOvertime(vars.scheduleId);
      toast.success("Overtime deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Day-only add: applied immediately (no approval). One call per selected worker.
  const addDayMutation = useMutation({
    mutationFn: ({
      scheduleId,
      logId,
      worker,
    }: {
      scheduleId: string;
      logId: string;
      worker: DayAddTarget;
    }) =>
      schedulingService.addDayWorker(
        pid,
        scheduleId,
        logId,
        worker.type === "crew_member"
          ? { crew_member_id: worker.id }
          : { pool_worker_id: worker.id },
      ),
    onSuccess: (_res, vars) => {
      invalidateLogs(vars.scheduleId);
      queryClient.invalidateQueries({
        queryKey: schedulingKeys.availableWorkers(pid, vars.scheduleId),
      });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Day-only remove: applied immediately (temporary worker, no approval).
  const removeDayMutation = useMutation({
    mutationFn: ({
      scheduleId,
      logId,
      scheduleWorkerId,
    }: {
      scheduleId: string;
      logId: string;
      scheduleWorkerId: string;
    }) =>
      schedulingService.removeDayWorker(
        pid,
        scheduleId,
        logId,
        scheduleWorkerId,
      ),
    onSuccess: (_res, vars) => {
      invalidateLogs(vars.scheduleId);
      queryClient.invalidateQueries({
        queryKey: schedulingKeys.availableWorkers(pid, vars.scheduleId),
      });
      toast.success("Day worker removed");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Refresh everything affected by a permanent-roster change: the roster list,
  // pending list, available pool, daily logs (future confirmed logs are touched
  // on approve), and the schedule list (drives the pending-count badge).
  const invalidateRosterAll = (scheduleId: string) => {
    invalidateRoster(scheduleId);
    queryClient.invalidateQueries({
      queryKey: schedulingKeys.pendingWorkers(pid, scheduleId),
    });
    queryClient.invalidateQueries({
      queryKey: schedulingKeys.availableWorkers(pid, scheduleId),
    });
    invalidateLogs(scheduleId);
    invalidateSchedules();
  };

  const proposeAddRosterMutation = useMutation({
    mutationFn: ({
      scheduleId,
      body,
    }: {
      scheduleId: string;
      body: ProposeAddRosterBody;
    }) => schedulingService.proposeAddRosterWorker(pid, scheduleId, body),
    onSuccess: (_res, vars) => {
      invalidateRosterAll(vars.scheduleId);
      toast.success("Worker proposed for the roster");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const proposeRemoveRosterMutation = useMutation({
    mutationFn: ({
      scheduleId,
      workerId,
    }: {
      scheduleId: string;
      workerId: string;
    }) => schedulingService.proposeRemoveRosterWorker(pid, scheduleId, workerId),
    onSuccess: (_res, vars) => {
      invalidateRosterAll(vars.scheduleId);
      toast.success("Removal proposed for approval");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const approveRosterMutation = useMutation({
    mutationFn: ({
      scheduleId,
      workerId,
    }: {
      scheduleId: string;
      workerId: string;
    }) => schedulingService.approveRosterWorker(pid, scheduleId, workerId),
    onSuccess: (_res, vars) => {
      invalidateRosterAll(vars.scheduleId);
      toast.success("Roster change approved");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rejectRosterMutation = useMutation({
    mutationFn: ({
      scheduleId,
      workerId,
      reason,
    }: {
      scheduleId: string;
      workerId: string;
      reason: string;
    }) => schedulingService.rejectRosterWorker(pid, scheduleId, workerId, reason),
    onSuccess: (_res, vars) => {
      invalidateRosterAll(vars.scheduleId);
      toast.success("Roster change rejected");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  /* ─── handlers ──────────────────────────────────────────────────────── */

  const resetForm = () =>
    setFormData({
      taskId: "",
      crews: [],
      work_package: "",
      site_zone: "",
      notes: "",
      durationFrom: "",
      durationTo: "",
      startTime: "",
      endTime: "",
    });

  const handleOpenSchedule = (id: string) => {
    setSelectedScheduleId(id);
    setShowDetailsModal(true);
  };

  const handleTaskSelect = (taskId: string) => {
    const selectedTask = tasks.find((t) => t.id === taskId);
    setFormData((prev) => ({
      ...prev,
      taskId,
      crews: [],
      durationFrom: selectedTask?.start_date || "",
      durationTo: selectedTask?.due_date || "",
      work_package: selectedTask?.wp_number || "",
      site_zone: selectedTask?.grid_reference || "",
    }));
    setDeactivatedWorkers(new Set());
  };

  const handleToggleWorker = (workerId: string) => {
    setDeactivatedWorkers((prev) => {
      const next = new Set(prev);
      if (next.has(workerId)) next.delete(workerId);
      else next.add(workerId);
      return next;
    });
  };

  const handleSelectCrew = (crewId: string) => {
    setFormData((prev) => {
      const isSelected = prev.crews.includes(crewId);
      return {
        ...prev,
        crews: isSelected
          ? prev.crews.filter((id) => id !== crewId)
          : [...prev.crews, crewId],
      };
    });
  };

  const logIdForDate = (date: string) =>
    selectedSchedule?.dailyWorkerLogs?.find((l) => l.date === date)?.id;

  const handleProposeRemoval = (
    scheduleId: string,
    date: string,
    removeWorkerIds: string[],
  ) => {
    const logId = logIdForDate(date);
    if (!logId) {
      toast.error("No daily log found for this day.");
      return;
    }
    proposeMutation.mutate({ scheduleId, logId, removeWorkerIds });
  };

  // Add a worker to a single day (immediate, no approval).
  const handleAddDayWorker = (date: string, worker: DayAddTarget) => {
    const logId = logIdForDate(date);
    if (!selectedScheduleId || !logId) {
      toast.error("No daily log found for this day.");
      return;
    }
    addDayMutation.mutate({ scheduleId: selectedScheduleId, logId, worker });
  };

  // Remove a day-only worker from a single day (immediate).
  const handleRemoveDayWorker = (date: string, scheduleWorkerId: string) => {
    const logId = logIdForDate(date);
    if (!selectedScheduleId || !logId) {
      toast.error("No daily log found for this day.");
      return;
    }
    removeDayMutation.mutate({
      scheduleId: selectedScheduleId,
      logId,
      scheduleWorkerId,
    });
  };

  const handleAuthorizeOvertime = async (
    scheduleId: string,
    payload: {
      workers: string[];
      date: string;
      start_time: string;
      end_time: string;
      notes?: string;
    },
  ): Promise<boolean> => {
    try {
      const res = await overtimeMutation.mutateAsync({ scheduleId, payload });
      const created = unwrapList(res.data);
      toast.success(
        `Overtime authorized for ${created.length || payload.workers.length} worker${
          payload.workers.length > 1 ? "s" : ""
        }`,
      );
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    }
  };

  const handleEditOvertime = (
    _scheduleId: string,
    overtimeId: string,
  ) => {
    const entry = overtimeEntries.find((e) => e.id === overtimeId);
    if (entry) {
      setEditingOvertimeEntry(entry);
      setShowOvertimeModal(true);
    }
  };

  const handleDeleteOvertime = (scheduleId: string, overtimeId: string) => {
    deleteOvertimeMutation.mutate({ scheduleId, overtimeId });
  };

  const handleNavigate = (direction: "PREV" | "NEXT" | "TODAY") => {
    if (direction === "TODAY") {
      setCalendarDate(moment().startOf("isoWeek").toDate());
    } else {
      const newDate = moment(calendarDate)
        .add(direction === "PREV" ? -windowDays : windowDays, "days")
        .toDate();
      setCalendarDate(newDate);
    }
  };

  const handleMemberClick = () => {
    router.push(`${base}/profile/STL-045`);
  };

  const handleSaveSchedule = () => {
    toast.success("Schedule saved successfully");
  };

  const conflictScheduleName = selectedSchedule
    ? selectedSchedule.task || selectedSchedule.title
    : "";

  return (
    <div className="p-6 md:p-8 space-y-6 pb-32 bg-[#F8F9FA] min-h-screen">
      <CrewHeader
        title="Schedule Planner"
        project={project?.name || projectSlug}
      />

      {/* Main Content: Calendar + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Section */}
        <div className="flex-1 min-w-0">
          {/* Calendar Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavigate("PREV")}
                className="px-4 py-2 bg-[#021422] text-white text-xs font-bold uppercase rounded hover:bg-gray-800 transition-colors"
              >
                ◀
              </button>
              <button
                onClick={() => handleNavigate("TODAY")}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded hover:bg-gray-300 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => handleNavigate("NEXT")}
                className="px-4 py-2 bg-[#021422] text-white text-xs font-bold uppercase rounded hover:bg-gray-800 transition-colors"
              >
                ▶
              </button>
            </div>
            <span className="text-sm font-bold text-[#021422]">
              {moment(calendarDate).format("D MMM")} –{" "}
              {moment(calendarDate)
                .add(windowDays - 1, "days")
                .format("D MMM YYYY")}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWindowDays(7)}
                className={`px-4 py-2 rounded text-xs font-bold uppercase transition-colors ${
                  windowDays === 7
                    ? "bg-[#021422] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setWindowDays(14)}
                className={`px-4 py-2 rounded text-xs font-bold uppercase transition-colors ${
                  windowDays === 14
                    ? "bg-[#021422] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                2 Weeks
              </button>
            </div>
          </div>

          {/* Gantt chart */}
          <GanttChart
            items={schedules.map((s) => ({
              id: s.id,
              title: s.title,
              task: s.task,
              color: s.color,
              members: s.members,
              durationFrom: s.durationFrom,
              durationTo: s.durationTo,
            }))}
            windowStart={calendarDate}
            windowDays={windowDays}
            onSelect={handleOpenSchedule}
          />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {/* Create Schedule Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">
              Create Schedule
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Task
                </label>
                <select
                  required
                  value={formData.taskId}
                  onChange={(e) => handleTaskSelect(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                >
                  <option value="">Select Task</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.wp_number ? `${t.wp_number} - ` : ""}
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Crew
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.taskId) setShowCrewModal(true);
                  }}
                  disabled={!formData.taskId}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-left flex items-center justify-between hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span
                    className={
                      formData.crews.length > 0
                        ? "text-[#021422]"
                        : "text-gray-400"
                    }
                  >
                    {formData.crews.length > 0
                      ? (() => {
                          const selectedTaskCrews = taskCrews.filter((c) =>
                            formData.crews.includes(c.id),
                          );
                          const totalActive = selectedTaskCrews.reduce(
                            (sum, c) =>
                              sum +
                              (c.members || []).filter(
                                (w) => !deactivatedWorkers.has(w.id),
                              ).length,
                            0,
                          );
                          return `${selectedTaskCrews.length} crew${selectedTaskCrews.length > 1 ? "s" : ""} (${totalActive} active)`;
                        })()
                      : formData.taskId
                        ? "Select Crew(s)"
                        : "Select a task first"}
                  </span>
                  <Users size={14} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Timeline
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <p className="text-[12px] font-semibold">Start Date</p>
                    <input
                      type="text"
                      readOnly
                      value={
                        formData.durationFrom
                          ? moment(formData.durationFrom).format("DD MMM YYYY")
                          : ""
                      }
                      placeholder="From"
                      className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 cursor-not-allowed"
                    />
                    <Calendar
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                  <div className="relative">
                    <p className="text-[12px] font-semibold">Finish Date</p>
                    <input
                      type="text"
                      readOnly
                      value={
                        formData.durationTo
                          ? moment(formData.durationTo).format("DD MMM YYYY")
                          : ""
                      }
                      placeholder="To"
                      className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 cursor-not-allowed"
                    />
                    <Calendar
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5">
                  Auto-populated from task details
                </p>
                <div className="text-[13px] text-gray-600 font-medium">
                  Duration:{" "}
                  <span className="font-bold">
                    {formData.durationFrom && formData.durationTo
                      ? moment(formData.durationTo).diff(
                          moment(formData.durationFrom),
                          "days",
                        ) + 1
                      : " "}{" "}
                    day
                    {formData.durationFrom && formData.durationTo
                      ? moment(formData.durationTo).diff(
                          moment(formData.durationFrom),
                          "days",
                        ) !== 0
                        ? "s"
                        : ""
                      : ""}
                  </span>
                </div>
              </div>

              {/* Shift times (optional) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Shift Times (optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                  />
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional instructions..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  !formData.taskId ||
                  formData.crews.length === 0
                }
                className="w-full py-2.5 bg-[#007AFF] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#0066D6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? "Creating..." : "Create Schedule"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Schedule List */}
      {schedules.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Schedules ({schedules.length})
            </h3>
            <span className="text-[10px] font-bold text-[#021422] bg-gray-100 px-2 py-1 rounded-full">
              {schedules.reduce((sum, item) => sum + (item.members || 0), 0)}{" "}
              total workers
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {schedules.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenSchedule(item.id)}
                className="group shrink-0 w-64 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#007AFF] hover:shadow-sm cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-[#021422] truncate flex-1">
                    {item.task || item.title || "Untitled schedule"}
                  </p>
                  {!!item.pendingCount && item.pendingCount > 0 && (
                    <span
                      title={`${item.pendingCount} roster change${item.pendingCount > 1 ? "s" : ""} awaiting review`}
                      className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-[#021422] text-[10px] font-bold shrink-0"
                    >
                      {item.pendingCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-3 text-[11px] font-medium text-gray-500">
                  <Calendar size={12} className="text-gray-400 shrink-0" />
                  <span className="truncate">
                    {formatDate(item.durationFrom)} –{" "}
                    {formatDate(item.durationTo)}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                    <Users size={12} className="text-gray-400" />
                    {typeof item.members === "number"
                      ? `${item.members} ${item.members === 1 ? "worker" : "workers"}`
                      : "No workers"}
                  </span>
                  <span className="text-[11px] font-medium text-gray-300 group-hover:text-[#007AFF] transition-colors">
                    View →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <p className="text-xs text-gray-400 text-center py-2">
          Loading schedules...
        </p>
      )}

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Drag & Drop Workflow */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">
            Drag &amp; Drop Workflow
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">
              Available Pool (Not Assigned)
            </h3>
            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
              {availablePool.length > 0 ? (
                availablePool.map((person, idx) => (
                  <div
                    key={idx}
                    onClick={handleMemberClick}
                    className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#021422] text-white flex items-center justify-center text-xs font-bold">
                        {person.name.charAt(0)}
                      </div>
                      <p className="text-xs font-medium text-[#021422]">
                        {person.name}
                      </p>
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">
                      {person.memberId} • {person.trade}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">
                  No unassigned members
                </p>
              )}
            </div>
            <p className="text-xs font-bold text-[#021422] mb-3">
              Drag to assign to:
            </p>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-[#021422] text-white px-6 py-3 rounded text-[10px] sm:text-xs font-bold uppercase whitespace-nowrap">
                Steel Crew - Wed
              </div>
              <div className="bg-gray-500 text-white px-6 py-3 rounded text-[10px] sm:text-xs font-bold uppercase whitespace-nowrap">
                Steel Crew - Wed
              </div>
              <div className="bg-[#021422] text-white px-6 py-3 rounded text-[10px] sm:text-xs font-bold uppercase whitespace-nowrap">
                Carpenter - Fri
              </div>
            </div>
          </div>
        </div>

        {/* Conflict Detection */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">
            Conflict Detection
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle
                className="text-yellow-500 fill-yellow-500"
                size={20}
              />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#021422]">
                Scheduled Conflicts
                {conflictScheduleName ? ` — ${conflictScheduleName}` : ""}
              </h3>
            </div>
            <ol className="list-decimal list-inside space-y-4 text-xs text-[#021422] mb-6 font-medium">
              {!selectedScheduleId ? (
                <li className="leading-relaxed list-none text-gray-400">
                  Open a schedule to check for conflicts.
                </li>
              ) : conflicts.length === 0 ? (
                <li className="leading-relaxed list-none">
                  No conflicts detected.
                </li>
              ) : (
                conflicts.map((c, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {moment(c.date).format("ddd, MMM D")} — worker also booked on
                    &quot;{c.conflicting_schedule_title}&quot;
                  </li>
                ))
              )}
            </ol>
            <p className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-3">
              Autofix Options:
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  if (schedules.length > 0) {
                    setShowRescheduleModal(true);
                  } else {
                    toast.error("No schedules to reschedule");
                  }
                }}
                className="bg-[#021422] text-white py-3 rounded text-[10px] font-bold uppercase hover:bg-gray-900 transition-colors"
              >
                Reschedule Task
              </button>
              <button
                onClick={() => {
                  if (selectedSchedule) {
                    setEditingOvertimeEntry(null);
                    setShowOvertimeModal(true);
                  } else {
                    toast.error("Open a schedule first");
                  }
                }}
                className="bg-gray-500 text-white py-3 rounded text-[10px] font-bold uppercase hover:bg-gray-600 transition-colors"
              >
                Authorize Overtime
              </button>
              <button className="bg-gray-700 text-white py-3 rounded text-[10px] font-bold uppercase hover:bg-gray-800 transition-colors">
                Adjust Crew Size
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-gray-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={handleSaveSchedule}
            className="flex-1 md:flex-none px-8 py-3 bg-[#007AFF] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#0066D6] transition-colors"
          >
            Save Schedule
          </button>
          <button className="flex-1 md:flex-none px-8 py-3 border border-gray-200 text-gray-700 text-xs font-bold uppercase rounded-lg hover:bg-gray-50 transition-colors">
            Notify Crews
          </button>
        </div>
        <button className="w-full md:w-auto px-8 py-3 border border-gray-200 text-gray-700 text-xs font-bold uppercase rounded-lg hover:bg-gray-50 transition-colors">
          Export to Excel
        </button>
      </div>

      {/* Modals */}
      {showCrewModal && (
        <CrewSelectionModal
          isOpen={showCrewModal}
          onClose={() => setShowCrewModal(false)}
          crews={taskCrews.map((c) => ({
            id: c.id,
            name: c.name,
            trade: c.trade,
            size: c.member_count,
            workers: (c.members || []).map((m) => ({
              id: m.id,
              memberId: m.member_code || "",
              name:
                `${m.first_name || ""} ${m.last_name || ""}`.trim() || "Member",
              trade: m.trade || c.trade,
              avatarUrl: "",
            })),
          }))}
          selectedCrewIds={formData.crews}
          deactivatedWorkers={deactivatedWorkers}
          onSelectCrew={handleSelectCrew}
          onToggleWorker={handleToggleWorker}
        />
      )}

      {showDetailsModal && selectedSchedule && (
        <ScheduleDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedScheduleId(null);
          }}
          schedule={selectedSchedule}
          onDelete={(id) => deleteMutation.mutate(id)}
          onProposeRemoval={handleProposeRemoval}
          onApproveLog={(scheduleId, logId) =>
            approveMutation.mutate({ scheduleId, logId })
          }
          onRejectLog={(scheduleId, logId, reason) =>
            rejectMutation.mutate({ scheduleId, logId, reason })
          }
          availablePool={availableWorkers.map((w) => ({
            id: w.id,
            type: w.type,
            memberId: w.member_code || w.worker_code || "",
            name: w.name,
            trade: w.trade,
          }))}
          onAddDayWorker={handleAddDayWorker}
          onRemoveDayWorker={handleRemoveDayWorker}
          crewName={selectedSchedule.title || selectedSchedule.task}
          onReschedule={() => setShowRescheduleModal(true)}
          overtimeEntries={overtimeEntries}
          onEditOvertime={handleEditOvertime}
          onDeleteOvertime={handleDeleteOvertime}
          onAuthorizeOvertime={() => {
            setEditingOvertimeEntry(null);
            setShowOvertimeModal(true);
          }}
          rosterWorkers={rosterWorkers}
          pendingRosterWorkers={pendingRosterWorkers}
          onProposeRemoveRoster={(workerId) =>
            proposeRemoveRosterMutation.mutate({
              scheduleId: selectedSchedule.id,
              workerId,
            })
          }
          onApproveRoster={(workerId) =>
            approveRosterMutation.mutate({
              scheduleId: selectedSchedule.id,
              workerId,
            })
          }
          onRejectRoster={(workerId, reason) =>
            rejectRosterMutation.mutate({
              scheduleId: selectedSchedule.id,
              workerId,
              reason,
            })
          }
          onAddRosterWorker={() => setShowAddRosterModal(true)}
        />
      )}

      {showAddRosterModal && selectedSchedule && (
        <AddRosterWorkerModal
          isOpen={showAddRosterModal}
          onClose={() => setShowAddRosterModal(false)}
          availablePool={availableWorkers}
          isSubmitting={proposeAddRosterMutation.isPending}
          onSubmit={(body: ProposeAddRosterBody) =>
            proposeAddRosterMutation.mutate(
              { scheduleId: selectedSchedule.id, body },
              { onSuccess: () => setShowAddRosterModal(false) },
            )
          }
        />
      )}

      {showRescheduleModal && (
        <RescheduleModal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          schedule={
            selectedSchedule
              ? {
                  id: selectedSchedule.id,
                  task: selectedSchedule.task,
                  title: selectedSchedule.title,
                  originalStartDate: selectedSchedule.durationFrom,
                  originalEndDate: selectedSchedule.durationTo,
                }
              : undefined
          }
          schedules={
            selectedSchedule
              ? undefined
              : schedules.map((item) => ({
                  id: item.id,
                  task: item.task,
                  title: item.title,
                  originalStartDate: item.durationFrom,
                  originalEndDate: item.durationTo,
                }))
          }
          onReschedule={(scheduleId, newStartDate, newEndDate) =>
            rescheduleMutation.mutate({
              id: scheduleId,
              newFrom: newStartDate,
              newTo: newEndDate,
            })
          }
        />
      )}

      {showOvertimeModal && (
        <OvertimeModal
          isOpen={showOvertimeModal}
          onClose={() => {
            setShowOvertimeModal(false);
            setEditingOvertimeEntry(null);
          }}
          schedule={
            selectedSchedule
              ? {
                  id: selectedSchedule.id,
                  task: selectedSchedule.task,
                  title: selectedSchedule.title,
                  originalDate: selectedSchedule.durationFrom,
                  workers: (selectedSchedule.workers || []).map((w) => ({
                    id: w.id,
                    memberId: w.memberId,
                    name: w.name,
                    trade: w.trade,
                  })),
                }
              : undefined
          }
          onAuthorize={handleAuthorizeOvertime}
          editEntry={editingOvertimeEntry}
          onUpdate={async (scheduleId, overtimeId, payload) => {
            try {
              await updateOvertimeMutation.mutateAsync({ scheduleId, overtimeId, payload });
              return true;
            } catch (err) {
              toast.error(getErrorMessage(err));
              return false;
            }
          }}
        />
      )}
    </div>
  );
}
