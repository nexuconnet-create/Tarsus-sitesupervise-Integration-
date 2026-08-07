"use client";

import { create } from "zustand";
import type {
  MiscExpense,
  MiscExpenseInput,
  ProjectMiscBudget,
  MiscCategoryKey,
  MiscExpenseStatus,
  ProjectEvm,
} from "@/lib/types/miscExpense";
import {
  getMockMiscExpenses,
  getMockProjectMiscBudgets,
  computeProjectEvm,
} from "@/lib/mockData/miscExpenses";

// Derive status from progress, preserving terminal states.
// Approved/rejected statuses are never overridden by progress changes.
function deriveStatus(progress: number, current: MiscExpenseStatus): MiscExpenseStatus {
  if (current === "approved" || current === "rejected") return current;
  if (progress >= 100) return "completed";
  if (progress > 0) return "partial";
  return "pending";
}

// EV = PV × progress% — always driven by progress, never by status.
// Approval is financial sign-off only; rejected is the only status that zeroes EV.
function earnedValueFor(amountPlanned: number, progress: number, status: MiscExpenseStatus): number {
  if (status === "rejected") return 0;
  if (progress >= 100) return amountPlanned;
  if (progress > 0) return amountPlanned * (progress / 100);
  return 0;
}

interface MiscExpenseState {
  expenses: MiscExpense[];
  budgets: ProjectMiscBudget[];

  // ── Expense CRUD ──
  // TODO(backend): replace with miscExpenseService calls when API is live.
  addExpense: (milestoneId: string, projectId: string, input: MiscExpenseInput, requestedBy?: string) => void;
  updateExpense: (id: string, input: Partial<MiscExpenseInput>) => void;
  removeExpense: (id: string) => void;
  updateProgress: (id: string, progressPercent: number, amountActual?: number) => void;
  /**
   * Called whenever the parent task's checklist progress changes.
   * Updates all non-terminal expenses for that task where autoTrack = true.
   */
  syncExpensesToTaskProgress: (taskId: string, milestoneId: string, taskProgressPercent: number) => void;
  approveExpense: (id: string, approver: string) => void;
  rejectExpense: (id: string, reason: string, approver: string) => void;

  // ── Budget allocation (approval workflow) ──
  setBudget: (projectId: string, category: MiscCategoryKey, allocatedBudget: number, pm: string) => void;
  proposeBudget: (projectId: string, category: MiscCategoryKey, allocatedBudget: number, engineer: string) => void;
  approveBudget: (id: string, approver: string) => void;
  rejectBudget: (id: string, reason: string, approver: string) => void;

  // ── Selectors ──
  getMilestoneExpenses: (milestoneId: string) => MiscExpense[];
  getProjectExpenses: (projectId: string) => MiscExpense[];
  getProjectBudgets: (projectId: string) => ProjectMiscBudget[];
  getProjectEvm: (projectId: string) => ProjectEvm;
}

function recalcBudgets(
  budgets: ProjectMiscBudget[],
  expenses: MiscExpense[],
): ProjectMiscBudget[] {
  return budgets.map((b) => {
    const spent = expenses
      .filter((e) => e.projectId === b.projectId && e.category === b.category)
      .reduce((sum, e) => sum + e.amountActual, 0);
    return { ...b, spentToDate: spent, remainingBudget: b.allocatedBudget - spent };
  });
}

export const useMiscExpenseStore = create<MiscExpenseState>()((set, get) => ({
  expenses: getMockMiscExpenses(),
  budgets: getMockProjectMiscBudgets(),

  addExpense: (milestoneId, projectId, input, requestedBy = "You") => {
    set((state) => {
      const progress = input.progressPercent ?? 0;
      const status = deriveStatus(progress, "pending");
      const expense: MiscExpense = {
        id: `misc-${Date.now()}`,
        taskId: input.taskId,
        milestoneId,
        projectId,
        category: input.category,
        subCategory: input.subCategory,
        expenseType: input.expenseType,
        amountPlanned: input.amountPlanned,
        amountActual: input.amountActual ?? 0,
        earnedValue: earnedValueFor(input.amountPlanned, progress, status),
        status,
        progressPercent: progress,
        autoTrack: input.autoTrack ?? true,
        plannedDate: input.plannedDate ?? null,
        actualDate: status === "completed" ? new Date().toISOString().slice(0, 10) : null,
        requestedBy,
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
        receiptUrls: input.receiptUrls ?? [],
        notes: input.notes ?? "",
        currency: "NGN",
      };
      const expenses = [expense, ...state.expenses];
      return { expenses, budgets: recalcBudgets(state.budgets, expenses) };
    });
  },

  updateExpense: (id, input) => {
    set((state) => {
      const expenses = state.expenses.map((e) => {
        if (e.id !== id) return e;
        const amountPlanned = input.amountPlanned ?? e.amountPlanned;
        const progress = input.progressPercent ?? e.progressPercent;
        const status = deriveStatus(progress, e.status);
        return {
          ...e,
          milestoneId: input.milestoneId ?? e.milestoneId,
          category: input.category ?? e.category,
          subCategory: input.subCategory ?? e.subCategory,
          expenseType: input.expenseType ?? e.expenseType,
          amountPlanned,
          amountActual: input.amountActual ?? e.amountActual,
          progressPercent: progress,
          autoTrack: input.autoTrack ?? e.autoTrack,
          plannedDate: input.plannedDate ?? e.plannedDate,
          notes: input.notes ?? e.notes,
          status,
          earnedValue: earnedValueFor(amountPlanned, progress, status),
        };
      });
      return { expenses, budgets: recalcBudgets(state.budgets, expenses) };
    });
  },

  removeExpense: (id) => {
    set((state) => {
      const expenses = state.expenses.filter((e) => e.id !== id);
      return { expenses, budgets: recalcBudgets(state.budgets, expenses) };
    });
  },

  updateProgress: (id, progressPercent, amountActual) => {
    set((state) => {
      const expenses = state.expenses.map((e) => {
        if (e.id !== id) return e;
        const status = deriveStatus(progressPercent, e.status);
        return {
          ...e,
          progressPercent,
          amountActual: amountActual ?? e.amountActual,
          status,
          earnedValue: earnedValueFor(e.amountPlanned, progressPercent, status),
          actualDate:
            status === "completed" && !e.actualDate
              ? new Date().toISOString().slice(0, 10)
              : e.actualDate,
        };
      });
      return { expenses, budgets: recalcBudgets(state.budgets, expenses) };
    });
  },

  syncExpensesToTaskProgress: (taskId, milestoneId, taskProgressPercent) => {
    set((state) => {
      const expenses = state.expenses.map((e) => {
        // Only sync expenses that belong to this task+milestone and are auto-tracking.
        // Approval is financial sign-off only — approved expenses still track progress.
        // Only rejected expenses are excluded (work cancelled, EV locked at 0 forever).
        const belongsToTask = e.taskId === taskId || (!e.taskId && e.milestoneId === milestoneId);
        if (!belongsToTask) return e;
        if (!e.autoTrack) return e;
        if (e.status === "rejected") return e;

        const progress = taskProgressPercent;
        const status = deriveStatus(progress, e.status);
        return {
          ...e,
          progressPercent: progress,
          status,
          earnedValue: earnedValueFor(e.amountPlanned, progress, status),
          actualDate:
            status === "completed" && !e.actualDate
              ? new Date().toISOString().slice(0, 10)
              : e.actualDate,
        };
      });
      return { expenses, budgets: recalcBudgets(state.budgets, expenses) };
    });
  },

  approveExpense: (id, approver) => {
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id
          ? { ...e, status: "approved", approvedBy: approver, approvedAt: new Date().toISOString(), rejectionReason: null }
          : e,
      ),
    }));
  },

  rejectExpense: (id, reason, approver) => {
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id
          ? { ...e, status: "rejected", approvedBy: approver, approvedAt: new Date().toISOString(), rejectionReason: reason }
          : e,
      ),
    }));
  },

  setBudget: (projectId, category, allocatedBudget, pm) => {
    set((state) => {
      const existing = state.budgets.find((b) => b.projectId === projectId && b.category === category);
      let budgets: ProjectMiscBudget[];
      if (existing) {
        budgets = state.budgets.map((b) =>
          b.id === existing.id
            ? { ...b, allocatedBudget, remainingBudget: allocatedBudget - b.spentToDate, status: "approved", proposedBy: pm, approvedBy: pm, approvedAt: new Date().toISOString(), rejectionReason: null }
            : b,
        );
      } else {
        budgets = [
          ...state.budgets,
          {
            id: `budget-${Date.now()}`,
            projectId,
            category,
            allocatedBudget,
            spentToDate: 0,
            remainingBudget: allocatedBudget,
            status: "approved",
            proposedBy: pm,
            approvedBy: pm,
            approvedAt: new Date().toISOString(),
            rejectionReason: null,
          },
        ];
      }
      return { budgets: recalcBudgets(budgets, state.expenses) };
    });
  },

  proposeBudget: (projectId, category, allocatedBudget, engineer) => {
    set((state) => ({
      budgets: recalcBudgets(
        [
          ...state.budgets,
          {
            id: `budget-${Date.now()}`,
            projectId,
            category,
            allocatedBudget,
            spentToDate: 0,
            remainingBudget: allocatedBudget,
            status: "pending",
            proposedBy: engineer,
            approvedBy: null,
            approvedAt: null,
            rejectionReason: null,
          },
        ],
        state.expenses,
      ),
    }));
  },

  approveBudget: (id, approver) => {
    set((state) => ({
      budgets: state.budgets.map((b) =>
        b.id === id
          ? { ...b, status: "approved", approvedBy: approver, approvedAt: new Date().toISOString(), rejectionReason: null }
          : b,
      ),
    }));
  },

  rejectBudget: (id, reason, approver) => {
    set((state) => ({
      budgets: state.budgets.map((b) =>
        b.id === id
          ? { ...b, status: "rejected", approvedBy: approver, approvedAt: new Date().toISOString(), rejectionReason: reason }
          : b,
      ),
    }));
  },

  getMilestoneExpenses: (milestoneId) => get().expenses.filter((e) => e.milestoneId === milestoneId),
  getProjectExpenses: (projectId) => get().expenses.filter((e) => e.projectId === projectId),
  getProjectBudgets: (projectId) => get().budgets.filter((b) => b.projectId === projectId),
  getProjectEvm: (projectId) => computeProjectEvm(projectId, get().expenses),
}));
