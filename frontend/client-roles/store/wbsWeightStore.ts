"use client";

import { create } from "zustand";
import type { DistributionModel } from "@/lib/evm";
import { LAGOS_WBS_WEIGHTS } from "@/lib/mockData/wbs";

// Milestone/sub-milestone/task weight, and task dates/distribution, live
// here rather than on the real Milestone/Task types because the backend has
// no such columns yet — this is the mock layer described in Phase 1, keyed
// by the real milestone/task id (and the mock sub-milestone id) so it
// survives a refetch. Task weight/distribution live here too since mock
// tasks come from a plain function (getMockTasks), not a store, so there is
// nowhere else for an edit to persist.
//
// Seeded from the Lagos WBS spec's own weights/curves (LAGOS_WBS_WEIGHTS) so
// the baseline is fully reviewable on load — a PM can hit "Approve Baseline"
// immediately, or edit first, rather than starting from a blank weight sheet.

/** A "custom" task starts here — identical to linear — until the PM drags a
 * knot. Five points: elapsed-time fractions 0, 0.25, 0.5, 0.75, 1. */
export const DEFAULT_CUSTOM_CURVE = [0, 0.25, 0.5, 0.75, 1];

export type BaselineStatus = "draft" | "locked";

/** A snapshot of every weight/date/distribution field at the moment a
 * baseline was approved — enough to reconstruct exactly what PV curve was
 * locked in as version N. */
export interface BaselineVersion {
  version: number;
  approvedAt: string;
  /** Why this version superseded the last one. Absent on version 1 — there's
   * nothing to explain a change against yet. */
  reason?: string;
  snapshot: {
    milestoneWeight: Record<string, number>;
    subMilestoneWeight: Record<string, number>;
    taskWeight: Record<string, number>;
    taskDistribution: Record<string, DistributionModel>;
    taskCustomCurve: Record<string, number[]>;
    taskStartDate: Record<string, string>;
    taskFinishDate: Record<string, string>;
  };
}

interface WbsWeightState {
  /** milestoneId → % of project. Absent = not yet set by the PM. */
  milestoneWeight: Record<string, number>;
  /** subMilestoneId → % of project. Absent = not yet set by the PM. */
  subMilestoneWeight: Record<string, number>;
  /** taskId → % of project. Absent = not yet set by the PM. */
  taskWeight: Record<string, number>;
  /** taskId → spend curve. Absent = "linear". */
  taskDistribution: Record<string, DistributionModel>;
  /** taskId → cumulative spend fractions, only meaningful when that task's
   * distribution is "custom". Absent = DEFAULT_CUSTOM_CURVE. */
  taskCustomCurve: Record<string, number[]>;
  /** taskId → start/finish date override. Absent = the real Task's own
   * startDate/dueDate. A PM can narrow a task's PV window here without
   * touching the real task record (a different feature's data). */
  taskStartDate: Record<string, string>;
  taskFinishDate: Record<string, string>;

  /** "locked" once approved — weight/distribution edits should be blocked in
   * the UI until a rebaseline is explicitly started. */
  baselineStatus: BaselineStatus;
  /** Every approved version, oldest first. Length is the current version
   * number once at least one approval has happened. */
  baselineHistory: BaselineVersion[];

  setMilestoneWeights: (weights: Record<string, number>) => void;
  setSubMilestoneWeights: (weights: Record<string, number>) => void;
  setTaskWeights: (weights: Record<string, number>) => void;
  setTaskDistribution: (taskId: string, distribution: DistributionModel) => void;
  setTaskCustomCurve: (taskId: string, curve: number[]) => void;
  setTaskDates: (taskId: string, startDate: string, finishDate: string) => void;
  removeMilestone: (milestoneId: string) => void;
  removeSubMilestone: (subMilestoneId: string) => void;

  /** Lock the current weights in as the next baseline version. `reason`
   * explains what changed since the last version — prompted for at the
   * point of *re-approval*, not when editing is unlocked, since that's when
   * the actual change is known. Ignored (and not shown) on version 1, which
   * doesn't supersede anything. */
  approveBaseline: (reason?: string) => void;
  /** Unlock editing again. Weights stay exactly as they were at the last
   * approval — the PM adjusts from there rather than starting from scratch. */
  startRebaseline: () => void;
}

export const useWbsWeightStore = create<WbsWeightState>((set) => ({
  milestoneWeight: { ...LAGOS_WBS_WEIGHTS.milestoneWeight },
  subMilestoneWeight: { ...LAGOS_WBS_WEIGHTS.subMilestoneWeight },
  taskWeight: { ...LAGOS_WBS_WEIGHTS.taskWeight },
  taskDistribution: { ...LAGOS_WBS_WEIGHTS.taskDistribution },
  taskCustomCurve: { ...LAGOS_WBS_WEIGHTS.taskCustomCurve },
  taskStartDate: {},
  taskFinishDate: {},
  baselineStatus: "draft",
  baselineHistory: [],

  setMilestoneWeights: (weights) =>
    set((state) => ({ milestoneWeight: { ...state.milestoneWeight, ...weights } })),

  setSubMilestoneWeights: (weights) =>
    set((state) => ({ subMilestoneWeight: { ...state.subMilestoneWeight, ...weights } })),

  setTaskWeights: (weights) => set((state) => ({ taskWeight: { ...state.taskWeight, ...weights } })),

  setTaskDistribution: (taskId, distribution) =>
    set((state) => ({
      taskDistribution: { ...state.taskDistribution, [taskId]: distribution },
      // A task switching into "custom" for the first time starts from the
      // linear-equivalent default rather than an undefined curve.
      taskCustomCurve:
        distribution === "custom" && !state.taskCustomCurve[taskId]
          ? { ...state.taskCustomCurve, [taskId]: DEFAULT_CUSTOM_CURVE }
          : state.taskCustomCurve,
    })),

  setTaskCustomCurve: (taskId, curve) =>
    set((state) => ({ taskCustomCurve: { ...state.taskCustomCurve, [taskId]: curve } })),

  setTaskDates: (taskId, startDate, finishDate) =>
    set((state) => ({
      taskStartDate: { ...state.taskStartDate, [taskId]: startDate },
      taskFinishDate: { ...state.taskFinishDate, [taskId]: finishDate },
    })),

  removeMilestone: (milestoneId) =>
    set((state) => ({
      milestoneWeight: Object.fromEntries(
        Object.entries(state.milestoneWeight).filter(([id]) => id !== milestoneId),
      ),
    })),

  removeSubMilestone: (subMilestoneId) =>
    set((state) => ({
      subMilestoneWeight: Object.fromEntries(
        Object.entries(state.subMilestoneWeight).filter(([id]) => id !== subMilestoneId),
      ),
    })),

  approveBaseline: (reason) =>
    set((state) => ({
      baselineStatus: "locked",
      baselineHistory: [
        ...state.baselineHistory,
        {
          version: state.baselineHistory.length + 1,
          approvedAt: new Date().toISOString(),
          reason: state.baselineHistory.length > 0 ? reason : undefined,
          snapshot: {
            milestoneWeight: { ...state.milestoneWeight },
            subMilestoneWeight: { ...state.subMilestoneWeight },
            taskWeight: { ...state.taskWeight },
            taskDistribution: { ...state.taskDistribution },
            taskCustomCurve: { ...state.taskCustomCurve },
            taskStartDate: { ...state.taskStartDate },
            taskFinishDate: { ...state.taskFinishDate },
          },
        },
      ],
    })),

  startRebaseline: () => set({ baselineStatus: "draft" }),
}));
