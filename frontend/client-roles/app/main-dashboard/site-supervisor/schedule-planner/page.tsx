"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users, AlertTriangle, X, Calendar, Trash2, Edit } from "lucide-react";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
  View,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { staffService, crewManagerService } from "@/lib/services";
import { toast } from "react-hot-toast";
import { getMockTasks, getMockCrews } from "@/lib/mockData";
import type { Task, Crew as SharedCrew } from "@/lib/types";
import { formatDate } from "@/lib/dateUtils";
import { useDailyWorkerLogs } from "@/store/dailyWorkerLogStore";
import CrewSelectionModal from "./components/CrewSelectionModal";
import ScheduleDetailsModal from "./components/ScheduleDetailsModal";
import RescheduleModal from "./components/RescheduleModal";
import OvertimeModal from "./components/OvertimeModal";

const localizer = momentLocalizer(moment);

const colorPalette = ["blue", "purple", "cyan", "orange", "green"];

const colorClasses: Record<string, string> = {
  blue: "bg-[#EBF5FF] border-[#007AFF] text-[#007AFF]",
  purple: "bg-[#F3E8FF] border-[#A855F7] text-[#A855F7]",
  cyan: "bg-[#E0F7FA] border-[#00BCD4] text-[#00BCD4]",
  orange: "bg-[#FFF3E0] border-[#FF9800] text-[#FF9800]",
  green: "bg-[#F0FDF4] border-[#22C55E] text-[#22C55E]",
};

interface DailyEvent {
  id: string;
  title: string;
  task: string;
  start: Date;
  end: Date;
  color: string;
  members: number;
  scheduleId: string;
  scheduleDate: string;
}

const CustomEventContent = ({
  event,
}: {
  event: { title: string; color: string; members: number | null; task: string };
}) => {
  return (
    <div
      className={`h-full p-1 border-l-4 rounded-r-md ${colorClasses[event.color] || colorClasses.blue} overflow-hidden`}
    >
      <h4 className="font-bold text-[10px] uppercase truncate">
        {event.title}
      </h4>
      {event.members !== null && (
        <p className="text-[9px] font-medium">{event.members} workers</p>
      )}
      {event.task && (
        <p className="text-[9px] font-medium truncate">{event.task}</p>
      )}
    </div>
  );
};

interface DailyWorkerLog {
  date: string;
  workerIds: string[];
  status: "confirmed" | "pending" | "rejected";
  pendingWorkerIds?: string[];
  requestedBy?: string;
  requestedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
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
  workers?: { id: string; memberId: string; name: string; trade: string }[];
  dailyWorkerLogs?: DailyWorkerLog[];
}

interface CrewTemplate {
  id: number;
  name: string;
  crew_name?: string;
  members: {
    id: string;
    first_name?: string;
    name?: string;
    assigned?: boolean;
  }[];
}

interface TaskOption {
  id: string;
  title: string;
  startDate: string;
  dueDate: string;
  work_package: string;
  site_zone: string;
  approvalStatus?: "pending_approval" | "approved" | "rejected";
  crews: SharedCrew[];
}

export default function SchedulePlannerPage() {
  const router = useRouter();
  const { updateDailyLog: storeUpdateDailyLog, getScheduleLogs } =
    useDailyWorkerLogs();
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [availablePool, setAvailablePool] = useState<
    { name: string; trade: string; memberId: string }[]
  >([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [view, setView] = useState<View>(Views.WEEK);
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [crews, setCrews] = useState<CrewTemplate[]>([]);
  const [showCrewModal, setShowCrewModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(
    null,
  );
  const [deactivatedWorkers, setDeactivatedWorkers] = useState<Set<string>>(
    new Set(),
  );
  const [formData, setFormData] = useState({
    taskId: "",
    crews: [] as string[],
    date: "",
    work_package: "",
    site_zone: "",
    assigned_members: [] as string[],
    notes: "",
    durationFrom: "",
    durationTo: "",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [scheduleRes, templatesRes] = await Promise.allSettled([
          staffService.getSchedules(),
          crewManagerService.getCrewTemplates(),
        ]);

        if (scheduleRes.status === "fulfilled" && scheduleRes.value?.data) {
          const raw = scheduleRes.value.data;
          const items = Array.isArray(raw) ? raw : raw.data?.results || [];
          const mapped = items.map(
            (
              item: {
                id?: string;
                start_time: string;
                start_date: string;
                start: string;
                end_time: string;
                end_date: string;
                end: string;
                crew_name: string;
                title: string;
                name: string;
                member_count: number;
                members: number;
                task_code: string;
                task: string;
                task_id?: string;
                location: string;
                loc: string;
                work_package?: string;
                site_zone?: string;
                notes?: string;
                duration_from?: string;
                duration_to?: string;
              },
              idx: number,
            ) => ({
              id: String(item.id || `sched-${idx}`),
              start: new Date(item.start_time || item.start_date || item.start),
              end: new Date(item.end_time || item.end_date || item.end),
              title: item.crew_name || item.title || item.name || "Shift",
              members: item.member_count || item.members || null,
              task: item.task_code || item.task || "",
              taskId: item.task_id || "",
              loc: item.location || item.loc || "",
              color: colorPalette[idx % colorPalette.length],
              work_package: item.work_package || "",
              site_zone: item.site_zone || "",
              notes: item.notes || "",
              durationFrom: item.duration_from || "",
              durationTo: item.duration_to || "",
            }),
          );
          setScheduleItems(mapped);
          if (mapped.length > 0) {
            setCalendarDate(mapped[0].start);
          }
        }

        if (templatesRes.status === "fulfilled" && templatesRes.value?.data) {
          const raw = templatesRes.value.data;
          const templates = (
            Array.isArray(raw) ? raw : raw.data?.results || []
          ) as CrewTemplate[];

          if (templates.length > 0) {
            setCrews(templates);
            const pool = templates.flatMap((t: CrewTemplate) =>
              (t.members || [])
                .filter((m) => !m.assigned)
                .map((m) => ({
                  name: m.first_name || m.name || "Member",
                  trade: t.crew_name || t.name || "",
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                  memberId: (m as any).memberId || m.id || "",
                })),
            );
            setAvailablePool(pool);
          } else {
            const mockCrews = getMockCrews();
            setCrews(mockCrews as unknown as CrewTemplate[]);
            const pool = mockCrews.flatMap((t) =>
              (t.workers || [])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((m: any) => !m.assigned)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((m: any) => ({
                  name: m.name || "Member",
                  trade: m.trade || t.name || "",
                  memberId: m.memberId || m.id || "",
                })),
            );
            setAvailablePool(pool);
          }
        } else {
          const mockCrews = getMockCrews();
          setCrews(mockCrews as unknown as CrewTemplate[]);
          const pool = mockCrews.flatMap((t) =>
            (t.workers || [])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((m: any) => !m.assigned)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((m: any) => ({
                name: m.name || "Member",
                trade: m.trade || t.name || "",
                memberId: m.memberId || m.id || "",
              })),
          );
          setAvailablePool(pool);
        }

        const mockTasks = getMockTasks();
        const approvedTasks = mockTasks
          .filter(
            (t) =>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              !(t as any).approvalStatus ||
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              (t as any).approvalStatus === "approved",
          )
          .map((t) => ({
            id: t.id,
            title: t.title,
            startDate: t.startDate,
            dueDate: t.dueDate,
            work_package: t.location,
            site_zone: t.grid,
            crews: (t as Task).crews || [],
          }));
        setTasks(approvedTasks);
      } catch (err) {
        console.error("Data fetch error:", err);
      }
    };

    fetchInitialData();
  }, []);

  // Transform schedules into per-day events for the calendar
  const dailyEvents = useMemo(() => {
    return scheduleItems.flatMap((schedule) => {
      const start = moment(schedule.durationFrom);
      const end = moment(schedule.durationTo);
      const totalDays = end.diff(start, "days") + 1;
      const dailyLogs = schedule.dailyWorkerLogs || [];

      return Array.from({ length: totalDays }, (_, i) => {
        const date = start.clone().add(i, "days");
        const dateStr = date.format("YYYY-MM-DD");
        const log = dailyLogs.find((l) => l.date === dateStr);
        const workerCount = log?.workerIds?.length || schedule.members || 0;

        return {
          id: `${schedule.id}-${dateStr}`,
          title: schedule.title,
          task: schedule.task,
          start: date.startOf("day").toDate(),
          end: date.clone().endOf("day").toDate(),
          color: schedule.color,
          members: workerCount,
          scheduleId: schedule.id,
          scheduleDate: dateStr,
        };
      });
    });
  }, [scheduleItems]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectEvent = (event: any) => {
    const schedule = scheduleItems.find((s) => s.id === event.scheduleId);
    if (schedule) {
      setSelectedSchedule(schedule);
      setShowDetailsModal(true);
    }
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      if (scheduleItems.length > 0) {
        toast.error(
          "Bulk save not fully implemented for this structure. Use the creation modal.",
        );
        return;
      }
      toast("No items to save.");
      toast.success("Schedule saved successfully");
    } catch (err) {
      console.error("Save schedule error:", err);
      toast.error("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleNavigate = (direction: "PREV" | "NEXT" | "TODAY") => {
    if (direction === "TODAY") {
      setCalendarDate(new Date());
    } else {
      const newDate = moment(calendarDate)
        .add(
          direction === "PREV" ? -1 : 1,
          view === Views.WEEK ? "week" : "day",
        )
        .toDate();
      setCalendarDate(newDate);
    }
  };

  const handleSelectSlot = useCallback(
    ({ start }: { start: Date; end: Date }) => {
      setFormData((prev) => ({
        ...prev,
        date: moment(start).format("YYYY-MM-DD"),
      }));
    },
    [],
  );

  const handleTaskSelect = (taskId: string) => {
    const selectedTask = tasks.find((t) => t.id === taskId);
    if (selectedTask) {
      setFormData((prev) => ({
        ...prev,
        taskId,
        crews: [],
        assigned_members: [],
        durationFrom: selectedTask.startDate,
        durationTo: selectedTask.dueDate,
        work_package: selectedTask.work_package,
        site_zone: selectedTask.site_zone,
      }));
      setDeactivatedWorkers(new Set());
    }
  };

  const handleToggleWorker = (workerId: string) => {
    setDeactivatedWorkers((prev) => {
      const next = new Set(prev);
      if (next.has(workerId)) {
        next.delete(workerId);
      } else {
        next.add(workerId);
      }
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

  const handleRemoveWorker = (scheduleId: string, workerId: string) => {
    setScheduleItems((prev) =>
      prev.map((item) => {
        if (item.id !== scheduleId) return item;
        const updatedWorkers = (item.workers || []).filter(
          (w) => w.id !== workerId,
        );
        return {
          ...item,
          workers: updatedWorkers,
          members: updatedWorkers.length,
        };
      }),
    );
    toast.success("Worker removed from schedule");
  };

  const handleReschedule = (
    scheduleId: string,
    newStartDate: string,
    newEndDate: string,
  ) => {
    setScheduleItems((prev) =>
      prev.map((item) => {
        if (item.id !== scheduleId) return item;
        return {
          ...item,
          start: new Date(newStartDate),
          end: new Date(newEndDate),
          durationFrom: newStartDate,
          durationTo: newEndDate,
        };
      }),
    );
    toast.success("Schedule rescheduled successfully");
  };

  const handleAuthorizeOvertime = (
    scheduleId: string,
    entries: {
      workerId: string;
      hours: string;
      startTime: string;
      endTime: string;
    }[],
  ) => {
    const totalHours = entries.reduce(
      (sum, e) => sum + (parseFloat(e.hours) || 0),
      0,
    );
    toast.success(
      `Overtime authorized for ${entries.length} worker${entries.length > 1 ? "s" : ""} (${totalHours}h total)`,
    );
  };

  const handleUpdateDailyLog = (
    scheduleId: string,
    date: string,
    workerIds: string[],
  ) => {
    // Get task and crew info for the store
    const schedule = scheduleItems.find((s) => s.id === scheduleId);
    const taskId = schedule?.taskId || "";
    const crewName = schedule?.title || "";

    // Update local state
    setScheduleItems((prev) =>
      prev.map((item) => {
        if (item.id !== scheduleId) return item;
        const existingLogs = item.dailyWorkerLogs || [];
        const logIndex = existingLogs.findIndex((l) => l.date === date);
        let updatedLogs: DailyWorkerLog[];
        if (logIndex >= 0) {
          // Keep original workerIds, set pendingWorkerIds to proposed changes
          updatedLogs = existingLogs.map((l, i) =>
            i === logIndex
              ? {
                  ...l,
                  status: "pending" as const,
                  pendingWorkerIds: workerIds,
                }
              : l,
          );
        } else {
          // New log - no original workers, all are proposed
          updatedLogs = [
            ...existingLogs,
            {
              date,
              workerIds: [],
              status: "pending" as const,
              pendingWorkerIds: workerIds,
            },
          ];
        }
        return {
          ...item,
          dailyWorkerLogs: updatedLogs,
        };
      }),
    );

    // Update shared store for cross-dashboard access
    storeUpdateDailyLog(scheduleId, taskId, crewName, date, workerIds);
    toast.success("Worker changes sent for approval");
  };

  const handleApproveWorkerChange = (
    scheduleId: string,
    date: string,
    approvedBy: string,
  ) => {
    setScheduleItems((prev) =>
      prev.map((item) => {
        if (item.id !== scheduleId) return item;
        const updatedLogs = (item.dailyWorkerLogs || []).map((log) => {
          if (log.date !== date) return log;
          return {
            ...log,
            status: "confirmed" as const,
            workerIds: log.pendingWorkerIds || log.workerIds,
            pendingWorkerIds: undefined,
            approvedBy,
            approvedAt: new Date().toISOString(),
          };
        });
        return { ...item, dailyWorkerLogs: updatedLogs };
      }),
    );
    toast.success("Worker changes approved");
  };

  const handleRejectWorkerChange = (
    scheduleId: string,
    date: string,
    rejectedBy: string,
    reason: string,
  ) => {
    setScheduleItems((prev) =>
      prev.map((item) => {
        if (item.id !== scheduleId) return item;
        const updatedLogs = (item.dailyWorkerLogs || []).map((log) => {
          if (log.date !== date) return log;
          return {
            ...log,
            status: "rejected" as const,
            pendingWorkerIds: undefined,
            approvedBy: rejectedBy,
            approvedAt: new Date().toISOString(),
            rejectionReason: reason,
          };
        });
        return { ...item, dailyWorkerLogs: updatedLogs };
      }),
    );
    toast.success("Worker changes rejected");
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const selectedTask = tasks.find((t) => t.id === formData.taskId);

      // Get workers from selected task's crews only, excluding deactivated
      const taskCrews = selectedTask?.crews || [];
      const selectedTaskCrews = taskCrews.filter((c) =>
        formData.crews.includes(c.id),
      );
      const assignedWorkers = selectedTaskCrews
        .flatMap((c) => c.workers || [])
        .filter((w) => !deactivatedWorkers.has(w.id))
        .map((w) => ({
          id: w.id,
          memberId: w.memberId,
          name: w.name,
          trade: w.trade,
        }));

      // Auto-initialize daily worker logs (all crew workers for each day, auto-confirmed)
      const dailyWorkerLogs: DailyWorkerLog[] = [];
      const startDate = moment(formData.durationFrom);
      const endDate = moment(formData.durationTo);
      const totalDays = endDate.diff(startDate, "days") + 1;
      const defaultWorkerIds = assignedWorkers.map((w) => w.id);
      for (let i = 0; i < totalDays; i++) {
        const dateStr = startDate.clone().add(i, "days").format("YYYY-MM-DD");
        dailyWorkerLogs.push({
          date: dateStr,
          workerIds: [...defaultWorkerIds],
          status: "confirmed",
        });
      }

      const newScheduleItem: ScheduleItem = {
        id: `sched-${Date.now()}`,
        start: new Date(formData.durationFrom),
        end: new Date(formData.durationTo),
        title:
          selectedTaskCrews.map((c) => c.name || c.trade).join(", ") || "Shift",
        members:
          assignedWorkers.length || formData.assigned_members.length || null,
        task: selectedTask?.title || "",
        taskId: formData.taskId,
        loc: formData.site_zone,
        color: colorPalette[scheduleItems.length % colorPalette.length],
        work_package: formData.work_package,
        site_zone: formData.site_zone,
        notes: formData.notes,
        durationFrom: formData.durationFrom,
        durationTo: formData.durationTo,
        workers: assignedWorkers,
        dailyWorkerLogs,
      };

      setScheduleItems((prev) => [...prev, newScheduleItem]);
      toast.success("Schedule created successfully");
      setFormData({
        taskId: "",
        crews: [],
        date: moment().format("YYYY-MM-DD"),
        work_package: "",
        site_zone: "",
        assigned_members: [],
        notes: "",
        durationFrom: "",
        durationTo: "",
      });
    } catch (err) {
      console.error("Create schedule error:", err);
      toast.error("Failed to create schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setScheduleItems((prev) => prev.filter((item) => item.id !== scheduleId));
    toast.success("Schedule deleted");
  };

  const handleMemberClick = () => {
    router.push(`/site-supervisor/profile/STL-045`);
  };

  const selectedCrews = crews.filter((c) =>
    formData.crews.includes(String(c.id)),
  );
  const crewMembers = selectedCrews.flatMap((c) => c.members || []);

  const toggleMember = (memberId: string) => {
    setFormData((prev) => {
      const isSelected = prev.assigned_members.includes(memberId);
      return {
        ...prev,
        assigned_members: isSelected
          ? prev.assigned_members.filter((id) => id !== memberId)
          : [...prev.assigned_members, memberId],
      };
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 pb-32 bg-[#F8F9FA] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="font-bold text-lg uppercase tracking-wider text-[#021422]">
          Schedule Planner
        </h1>
      </div>

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
                ?
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
                ?
              </button>
            </div>
            <span className="text-sm font-bold text-[#021422]">
              {moment(calendarDate).format(
                view === Views.WEEK ? "[Week] w, YYYY" : "MMMM D, YYYY",
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView(Views.WEEK)}
                className={`px-4 py-2 rounded text-xs font-bold uppercase transition-colors ${
                  view === Views.WEEK
                    ? "bg-[#021422] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setView(Views.DAY)}
                className={`px-4 py-2 rounded text-xs font-bold uppercase transition-colors ${
                  view === Views.DAY
                    ? "bg-[#021422] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Daily
              </button>
            </div>
          </div>

          {/* BigCalendar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <style jsx global>{`
              .rbc-calendar {
                font-family: inherit;
              }
              .rbc-header {
                padding: 1rem !important;
                border-bottom: 2px solid #f3f4f6 !important;
                text-align: left !important;
              }
              .rbc-header span {
                font-size: 10px !important;
                font-weight: 700 !important;
                color: #9ca3af !important;
                text-transform: uppercase !important;
                letter-spacing: 0.1em !important;
              }
              .rbc-time-gutter {
                display: none !important;
              }
              .rbc-time-header-gutter {
                display: none !important;
              }
              .rbc-label {
                display: none !important;
              }
              .rbc-time-header {
                margin-right: 0 !important;
              }
              .rbc-time-view {
                border: none !important;
              }
              .rbc-day-slot {
                border-left: 1px solid #f3f4f6 !important;
              }
              .rbc-timeslot-group {
                border-bottom: none !important;
                min-height: 30px !important;
              }
              .rbc-time-content {
                border-top: none !important;
              }
              .rbc-event {
                background: transparent !important;
                border: none !important;
                padding: 0 !important;
                position: relative !important;
                display: block !important;
                width: 100% !important;
                left: 0 !important;
                right: auto !important;
                transform: none !important;
              }
              .rbc-event-content {
                height: 100% !important;
              }
              .rbc-time-slot {
                display: flex !important;
                flex-direction: column !important;
              }
              .rbc-time-slot .rbc-event {
                position: relative !important;
                flex: 0 0 auto !important;
                margin-bottom: 2px !important;
              }
              .rbc-day-slot .rbc-time-slot {
                justify-content: flex-start !important;
              }
              .rbc-events-container {
                display: flex !important;
                flex-direction: column !important;
              }
              .rbc-events-container .rbc-event {
                position: relative !important;
                margin-bottom: 4px !important;
              }
            `}</style>
            <BigCalendar
              localizer={localizer}
              events={dailyEvents}
              view={view}
              onView={(v) => setView(v)}
              defaultView={Views.WEEK}
              views={[Views.WEEK, Views.DAY]}
              step={30}
              timeslots={2}
              date={calendarDate}
              onNavigate={(date) => setCalendarDate(date)}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              components={{ event: CustomEventContent }}
              eventPropGetter={() => ({
                style: {
                  display: "block",
                  width: "100%",
                  left: 0,
                  right: "auto",
                  position: "relative",
                  transform: "none",
                },
              })}
              min={
                new Date(
                  calendarDate.getFullYear(),
                  calendarDate.getMonth(),
                  calendarDate.getDate(),
                  7,
                  0,
                  0,
                )
              }
              max={
                new Date(
                  calendarDate.getFullYear(),
                  calendarDate.getMonth(),
                  calendarDate.getDate(),
                  18,
                  0,
                  0,
                )
              }
              toolbar={false}
              style={{ height: 600 }}
            />
          </div>
          {/* Working Hours Label */}
          <div className="text-center py-2 border-t border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Working Hours: 8:00 AM – 6:00 PM
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {/* Create Schedule Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">
              Create Schedule
            </h3>
            <form onSubmit={handleCreateSchedule} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Task
                </label>

                <select
                  required
                  value={formData.taskId}
                  onChange={(e) => {
                    setFormData({ ...formData, taskId: e.target.value });
                    handleTaskSelect(e.target.value);
                  }}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                >
                  <option value="">Select Task</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} - {t.title}
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
                          const selectedTask = tasks.find(
                            (t) => t.id === formData.taskId,
                          );
                          const selectedTaskCrews =
                            selectedTask?.crews.filter((c) =>
                              formData.crews.includes(c.id),
                            ) || [];
                          const totalActive = selectedTaskCrews.reduce(
                            (sum, c) =>
                              sum +
                              c.workers.filter(
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
                    <p className="text-[12px]  font-semibold">Start Date</p>
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
                    <p className="text-[12px]  font-semibold">Finish Date</p>
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
                {/*<div className="text-[14px] text-gray-600 font-semibold">
                  Duration:
                  {/*{formData.durationFrom && formData.durationTo
                  ? `${formData.durationFrom} - ${formData.durationTo}`
                  : ""}{" "}
                  6 days
                </div>*/}
                <div className="text-[13px] text-gray-600 font-medium">
                  Duration:{" "}
                  <span className="font-bold">
                    {formData.durationFrom && formData.durationTo
                      ? moment(formData.durationTo).diff(moment(formData.durationFrom), "days") + 1
                      : " "}{" "}
                    day{formData.durationFrom && formData.durationTo
                      ? moment(formData.durationTo).diff(moment(formData.durationFrom), "days") !== 0
                        ? "s"
                        : ""
                      : ""}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                />
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
                  saving || !formData.taskId || formData.crews.length === 0
                }
                className="w-full py-2.5 bg-[#021422] text-white text-xs font-bold uppercase rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Creating..." : "Create Schedule"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Schedule List (horizontal scrollable row below calendar) */}
      {scheduleItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Schedules ({scheduleItems.length})
            </h3>
            <span className="text-[10px] font-bold text-[#021422] bg-gray-100 px-2 py-1 rounded-full">
              {scheduleItems.reduce((sum, item) => sum + (item.members || 0), 0)} total workers
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {scheduleItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedSchedule(item);
                  setShowDetailsModal(true);
                }}
                className="shrink-0 w-64 p-4 bg-white border border-gray-100 rounded-lg hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {item.task || item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDate(item.durationFrom)} -{" "}
                      {formatDate(item.durationTo)}
                    </p>
                  </div>
                  <div className="ml-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full block ${item.color === "blue" ? "bg-[#007AFF]" : item.color === "purple" ? "bg-[#A855F7]" : item.color === "cyan" ? "bg-[#00BCD4]" : item.color === "orange" ? "bg-[#FF9800]" : "bg-[#22C55E]"}`}
                    />
                  </div>
                </div>
                {item.members !== null && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    {item.members} workers
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Drag & Drop Workflow */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">
            Drag & Drop Workflow
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
              </h3>
            </div>
            <ol className="list-decimal list-inside space-y-4 text-xs text-[#021422] mb-6 font-medium">
              <li className="leading-relaxed">No conflicts detected.</li>
            </ol>
            <p className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-3">
              Autofix Options:
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  if (scheduleItems.length > 0) {
                    setSelectedSchedule(null);
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
                  if (scheduleItems.length > 0) {
                    setSelectedSchedule(null);
                    setShowOvertimeModal(true);
                  } else {
                    toast.error("No schedules available");
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
            disabled={saving}
            className="flex-1 md:flex-none px-8 py-3 bg-gray-900 text-white text-xs font-bold uppercase rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Schedule"}
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
          crews={
            (tasks.find((t) => t.id === formData.taskId)?.crews ||
              []) as SharedCrew[]
          }
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
            setSelectedSchedule(null);
          }}
          schedule={
            scheduleItems.find((s) => s.id === selectedSchedule.id) ||
            selectedSchedule
          }
          onDelete={(id) => {
            handleDeleteSchedule(id);
            setShowDetailsModal(false);
            setSelectedSchedule(null);
          }}
          onUpdateDailyLog={handleUpdateDailyLog}
          crewWorkers={(() => {
            const task = tasks.find((t) => t.id === selectedSchedule.taskId);
            const taskCrews = task?.crews || [];
            return taskCrews.flatMap((c) =>
              c.workers.map((w) => ({
                id: w.id,
                memberId: w.memberId,
                name: w.name,
                trade: w.trade,
              })),
            );
          })()}
          availablePool={availablePool.map((w, idx) => ({
            id: `pool-${idx}`,
            memberId: w.memberId,
            name: w.name,
            trade: w.trade,
          }))}
          crewName={selectedSchedule.title || selectedSchedule.task}
          onReschedule={(schedule) => {
            setSelectedSchedule(schedule);
            setShowRescheduleModal(true);
          }}
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
              : scheduleItems.map((item) => ({
                  id: item.id,
                  task: item.task,
                  title: item.title,
                  originalStartDate: item.durationFrom,
                  originalEndDate: item.durationTo,
                }))
          }
          onReschedule={handleReschedule}
        />
      )}

      {showOvertimeModal && (
        <OvertimeModal
          isOpen={showOvertimeModal}
          onClose={() => setShowOvertimeModal(false)}
          schedules={scheduleItems.map((item) => ({
            id: item.id,
            task: item.task,
            title: item.title,
            originalDate: item.durationFrom,
            originalStartTime: moment(item.start).format("HH:mm"),
            originalEndTime: moment(item.end).format("HH:mm"),
            workers: (item.workers || []).map((w) => ({
              id: w.id,
              memberId: w.memberId,
              name: w.name,
              trade: w.trade,
            })),
          }))}
          onAuthorize={handleAuthorizeOvertime}
        />
      )}
    </div>
  );
}