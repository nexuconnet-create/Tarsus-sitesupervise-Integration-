"use client";

import { create } from "zustand";

export interface DailyWorkerLog {
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

export interface ScheduleDailyLogs {
  scheduleId: string;
  taskId: string;
  crewName: string;
  logs: DailyWorkerLog[];
}

interface DailyWorkerLogState {
  scheduleLogs: ScheduleDailyLogs[];
  getScheduleLogs: (scheduleId: string) => DailyWorkerLog[];
  getTaskPendingLogs: (taskId: string) => { scheduleId: string; crewName: string; log: DailyWorkerLog }[];
  getTaskCrewWorkerDays: (taskId: string) => { crewName: string; days: number; actualWorkerDays: number }[];
  updateDailyLog: (scheduleId: string, taskId: string, crewName: string, date: string, workerIds: string[]) => void;
  approveWorkerChange: (scheduleId: string, date: string, approvedBy: string) => void;
  rejectWorkerChange: (scheduleId: string, date: string, rejectedBy: string, reason: string) => void;
}

export const useDailyWorkerLogs = create<DailyWorkerLogState>((set, get) => ({
  scheduleLogs: [],

  getScheduleLogs: (scheduleId: string) => {
    const found = get().scheduleLogs.find((s) => s.scheduleId === scheduleId);
    return found?.logs || [];
  },

  getTaskPendingLogs: (taskId: string) => {
    const pending: { scheduleId: string; crewName: string; log: DailyWorkerLog }[] = [];
    get().scheduleLogs.forEach((scheduleLog) => {
      if (scheduleLog.taskId === taskId) {
        scheduleLog.logs.forEach((log) => {
          if (log.status === "pending") {
            pending.push({
              scheduleId: scheduleLog.scheduleId,
              crewName: scheduleLog.crewName,
              log,
            });
          }
        });
      }
    });
    return pending;
  },

  getTaskCrewWorkerDays: (taskId: string) => {
    const crewMap: Record<string, { days: number; actualWorkerDays: number }> = {};

    get().scheduleLogs.forEach((scheduleLog) => {
      if (scheduleLog.taskId === taskId) {
        scheduleLog.logs.forEach((log) => {
          if (log.status === "confirmed") {
            const current = log.pendingWorkerIds?.length || log.workerIds.length;
            if (!crewMap[scheduleLog.crewName]) {
              crewMap[scheduleLog.crewName] = { days: 0, actualWorkerDays: 0 };
            }
            crewMap[scheduleLog.crewName].actualWorkerDays += current;
            crewMap[scheduleLog.crewName].days += 1;
          }
        });
      }
    });

    return Object.entries(crewMap).map(([crewName, data]) => ({
      crewName,
      days: data.days,
      actualWorkerDays: data.actualWorkerDays,
    }));
  },

  updateDailyLog: (scheduleId: string, taskId: string, crewName: string, date: string, workerIds: string[]) => {
    set((state) => {
      const existing = state.scheduleLogs.find((s) => s.scheduleId === scheduleId);
      if (existing) {
        return {
          scheduleLogs: state.scheduleLogs.map((s) => {
            if (s.scheduleId !== scheduleId) return s;
            const logIndex = s.logs.findIndex((l) => l.date === date);
            if (logIndex >= 0) {
              const updatedLogs = s.logs.map((l, i) =>
                i === logIndex
                  ? { ...l, status: "pending" as const, pendingWorkerIds: workerIds }
                  : l
              );
              return { ...s, logs: updatedLogs };
            }
            return {
              ...s,
              logs: [...s.logs, { date, workerIds: [], status: "pending" as const, pendingWorkerIds: workerIds }],
            };
          }),
        };
      }
      return {
        scheduleLogs: [
          ...state.scheduleLogs,
          {
            scheduleId,
            taskId,
            crewName,
            logs: [{ date, workerIds: [], status: "pending" as const, pendingWorkerIds: workerIds }],
          },
        ],
      };
    });
  },

  approveWorkerChange: (scheduleId: string, date: string, approvedBy: string) => {
    set((state) => ({
      scheduleLogs: state.scheduleLogs.map((s) => {
        if (s.scheduleId !== scheduleId) return s;
        return {
          ...s,
          logs: s.logs.map((l) => {
            if (l.date !== date || l.status !== "pending") return l;
            return {
              ...l,
              status: "confirmed" as const,
              workerIds: l.pendingWorkerIds || l.workerIds,
              pendingWorkerIds: undefined,
              approvedBy,
              approvedAt: new Date().toISOString(),
            };
          }),
        };
      }),
    }));
  },

  rejectWorkerChange: (scheduleId: string, date: string, rejectedBy: string, reason: string) => {
    set((state) => ({
      scheduleLogs: state.scheduleLogs.map((s) => {
        if (s.scheduleId !== scheduleId) return s;
        return {
          ...s,
          logs: s.logs.map((l) => {
            if (l.date !== date || l.status !== "pending") return l;
            return {
              ...l,
              status: "rejected" as const,
              pendingWorkerIds: undefined,
              approvedBy: rejectedBy,
              approvedAt: new Date().toISOString(),
              rejectionReason: reason,
            };
          }),
        };
      }),
    }));
  },
}));
