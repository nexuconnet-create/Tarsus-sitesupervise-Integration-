"use client";

import { create } from "zustand";
import type { ProjectDetails } from "@/lib/types/projectDetails";

// Describes the same project as MOCK_WBS_BASELINE in lib/mockData/wbs.ts — the
// schedule and BAC here are what that WBS is denominated in, so the overview,
// the milestone weights and the EVM curves all agree. Keep them in step.
const MOCK_DEFAULT: ProjectDetails = {
  name: "Lagos 12-Storey Mixed-Use Development",
  projectCode: "LAG-2026-001",
  projectType: "mixed_use",
  status: "active",
  phase: "construction",
  description:
    "A 12-storey mixed-use development comprising ground-floor retail, 4 floors of commercial office space, and 7 floors of residential apartments. The project includes piled foundations, basement parking, and full MEP fit-out.",
  startDate: "2026-01-15",
  plannedFinishDate: "2027-04-30",
  revisedFinishDate: "",
  contractNumber: "LAG/CONT/2026/001",
  contractType: "lump_sum",
  contractValue: 2_070_000_000,
  bac: 1_800_000_000,
  currency: "NGN",
  company: "Speedup Construction Ltd",
};

interface ProjectDetailsState {
  details: ProjectDetails;
  isDirty: boolean;
  update: (patch: Partial<ProjectDetails>) => void;
  reset: () => void;
}

export const useProjectDetailsStore = create<ProjectDetailsState>((set) => ({
  details: MOCK_DEFAULT,
  isDirty: false,
  update: (patch) =>
    set((state) => ({
      details: { ...state.details, ...patch },
      isDirty: true,
    })),
  reset: () => set({ details: MOCK_DEFAULT, isDirty: false }),
}));
