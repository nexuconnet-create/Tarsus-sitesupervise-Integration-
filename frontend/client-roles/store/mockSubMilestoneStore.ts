"use client";

import { create } from "zustand";
import { LAGOS_WBS_SUB_MILESTONES, LAGOS_WBS_TASK_SUB_MILESTONE } from "@/lib/mockData/wbs";

// Sub-milestones (the tier between Milestone and Task) exist only inside the
// EVM/WBS feature — the real Milestone/Task types (lib/types) have no such
// concept, and nothing outside this feature needs one. Kept as a separate
// mock-only store, same reasoning as mockMilestoneStore: synchronous, no
// network, entirely client-side. Seeded from the Lagos WBS spec so it lines
// up with mockMilestoneStore and LAGOS_WBS_TASKS out of the box.
//
// A task's sub-milestone assignment lives here too (taskSubMilestone), not on
// the real Task, since Task is shared with the task board/checklist features
// this work must not touch.

export interface SubMilestone {
  id: string;
  name: string;
  milestoneId: string;
  order: number;
}

interface SubMilestoneInput {
  name: string;
  milestoneId: string;
}

interface MockSubMilestoneState {
  subMilestones: SubMilestone[];
  /** taskId → subMilestoneId. Absent = not yet assigned to a sub-milestone. */
  taskSubMilestone: Record<string, string>;

  create: (data: SubMilestoneInput) => SubMilestone;
  update: (id: string, data: SubMilestoneInput) => void;
  remove: (id: string) => void;
  assignTask: (taskId: string, subMilestoneId: string) => void;
  unassignTask: (taskId: string) => void;
}

let nextMockId = 1;

export const useMockSubMilestoneStore = create<MockSubMilestoneState>((set, get) => ({
  subMilestones: LAGOS_WBS_SUB_MILESTONES,
  taskSubMilestone: { ...LAGOS_WBS_TASK_SUB_MILESTONE },

  create: (data) => {
    const subMilestone: SubMilestone = {
      id: `mock-sm-${nextMockId++}`,
      name: data.name,
      milestoneId: data.milestoneId,
      order: get().subMilestones.filter((sm) => sm.milestoneId === data.milestoneId).length,
    };
    set((state) => ({ subMilestones: [...state.subMilestones, subMilestone] }));
    return subMilestone;
  },

  update: (id, data) =>
    set((state) => ({
      subMilestones: state.subMilestones.map((sm) =>
        sm.id === id ? { ...sm, name: data.name, milestoneId: data.milestoneId } : sm,
      ),
    })),

  remove: (id) =>
    set((state) => ({
      subMilestones: state.subMilestones.filter((sm) => sm.id !== id),
      taskSubMilestone: Object.fromEntries(
        Object.entries(state.taskSubMilestone).filter(([, smId]) => smId !== id),
      ),
    })),

  assignTask: (taskId, subMilestoneId) =>
    set((state) => ({ taskSubMilestone: { ...state.taskSubMilestone, [taskId]: subMilestoneId } })),

  unassignTask: (taskId) =>
    set((state) => ({
      taskSubMilestone: Object.fromEntries(
        Object.entries(state.taskSubMilestone).filter(([id]) => id !== taskId),
      ),
    })),
}));
