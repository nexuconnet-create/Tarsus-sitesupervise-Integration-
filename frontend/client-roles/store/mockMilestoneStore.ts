"use client";

import { create } from "zustand";
import { LAGOS_WBS_MILESTONES } from "@/lib/mockData/wbs";
import { calcDuration } from "@/lib/types/milestone";
import type { Milestone } from "@/lib/types/milestone";

// Milestone CRUD, entirely client-side — no network call. Seeded from
// LAGOS_WBS_MILESTONES (lib/mockData/wbs.ts) — the Lagos 12-storey WBS spec —
// so the Milestones/Performance pages show a real, reviewable EVM baseline on
// load instead of an empty list, for client-facing demos as much as testing.
// Its wbs-ms-N ids line up with LAGOS_WBS_TASKS' milestoneId.

interface MilestoneInput {
  name: string;
  description?: string;
  start_date: string;
  finish_date: string;
}

interface MockMilestoneState {
  milestones: Milestone[];
  create: (data: MilestoneInput) => Milestone;
  update: (id: string, data: MilestoneInput) => void;
  remove: (id: string) => void;
  /** Moves a milestone to 0-indexed `newIndex` and renumbers everyone's
   * `order` to match — how an engineer corrects "this should be Level 3, not
   * Level 5" after the fact, since level is just array position. */
  reorder: (id: string, newIndex: number) => void;
}

let nextMockId = 1;

export const useMockMilestoneStore = create<MockMilestoneState>((set, get) => ({
  milestones: LAGOS_WBS_MILESTONES,

  create: (data) => {
    const milestone: Milestone = {
      id: `mock-ms-${nextMockId++}`,
      name: data.name,
      description: data.description,
      startDate: data.start_date,
      finishDate: data.finish_date,
      duration: calcDuration(data.start_date, data.finish_date),
      projectId: "mock",
      order: get().milestones.length,
    };
    set((state) => ({ milestones: [...state.milestones, milestone] }));
    return milestone;
  },

  update: (id, data) =>
    set((state) => ({
      milestones: state.milestones.map((m) =>
        m.id === id
          ? {
              ...m,
              name: data.name,
              description: data.description,
              startDate: data.start_date,
              finishDate: data.finish_date,
              duration: calcDuration(data.start_date, data.finish_date),
            }
          : m,
      ),
    })),

  remove: (id) => set((state) => ({ milestones: state.milestones.filter((m) => m.id !== id) })),

  reorder: (id, newIndex) =>
    set((state) => {
      const from = state.milestones.findIndex((m) => m.id === id);
      if (from === -1) return state;
      const clamped = Math.max(0, Math.min(newIndex, state.milestones.length - 1));
      if (clamped === from) return state;

      const next = [...state.milestones];
      const [moved] = next.splice(from, 1);
      next.splice(clamped, 0, moved);

      return { milestones: next.map((m, i) => ({ ...m, order: i })) };
    }),
}));
