"use client";

import { useMemo, useState, Fragment } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Receipt,
  TrendingUp,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { useAllProjectExpenses } from "@/lib/hooks/useMiscExpenses";
import { useWbsBaseline } from "@/lib/hooks/useWbsBaseline";
import { pvAt, earnedValue, pvEvBreakdown } from "@/lib/evm";
import { MOCK_WBS_AC, MOCK_WBS_AS_OF } from "@/lib/mockData/wbs";
import { miscExpenseService } from "@/lib/services/miscExpenseService";
import { miscExpenseToPayload } from "@/lib/transforms/miscExpenseTransforms";
import { miscExpenseKeys, milestoneKeys } from "@/lib/queryKeys";
import { milestoneService } from "@/lib/services/milestoneService";
import type {
  MiscExpense,
  MiscExpenseInput,
  MiscCategoryKey,
} from "@/lib/types/miscExpense";
import {
  MISC_CATEGORY_LABELS,
  MISC_STATUS_LABELS,
  MISC_STATUS_COLORS,
} from "@/lib/constants/miscExpense";
import MiscExpenseModal from "@/app/[org_slug]/projects/[project_slug]/engineer/(office)/task-details/components/MiscExpenseModal";
import MilestoneBreakdown from "@/app/[org_slug]/projects/[project_slug]/engineer/(office)/performance/components/MilestoneBreakdown";

function fmt(n: number): string {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="text-sm font-bold text-[#021422]">{value}</p>
      {hint && <p className="text-[11px] font-medium text-gray-400">{hint}</p>}
    </div>
  );
}

function StatusDot({ pv, ev }: { pv: number; ev: number }) {
  const pct = pv > 0 ? Math.round((ev / pv) * 100) : 0;
  const dot =
    pct >= 100
      ? "bg-green-500"
      : pct >= 85
        ? "bg-yellow-400"
        : pct > 0
          ? "bg-orange-400"
          : "border border-gray-300 bg-white";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
      <span className="text-xs text-gray-500">{pct}%</span>
    </span>
  );
}

export default function MiscBudgetView() {
  const params = useParams();
  const orgSlug = params?.org_slug as string;
  const projectSlug = params?.project_slug as string;

  const { data: projectUuid } = useProjectUuid(orgSlug, projectSlug);

  // ── Data ────────────────────────────────────────────────────────────────
  const { data: expenses = [], isLoading: expensesLoading } =
    useAllProjectExpenses(projectUuid);

  // Core (labour/material/equipment) EVM comes from the mock WBS baseline —
  // same source as the engineer Performance page, pinned to the mock
  // baseline's own "as of" date so figures stay stable rather than drifting
  // as real time passes. Misc expenses stay on the real API/expenses list;
  // an empty backend just means an empty misc-expense table, not a crash.
  const { baseline, currency } = useWbsBaseline();

  // Fetch milestones so we can display names instead of raw UUIDs
  const { data: milestones = [] } = useQuery({
    queryKey: milestoneKeys.lists(projectUuid ?? ""),
    queryFn: async () => {
      const res = await milestoneService.list(projectUuid!);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!projectUuid,
    staleTime: 60_000,
  });

  // ── Mutations ───────────────────────────────────────────────────────────
  const qc = useQueryClient();

  const invalidateMiscData = () => {
    qc.invalidateQueries({ queryKey: miscExpenseKeys.byProject(projectUuid ?? "") });
    qc.invalidateQueries({ queryKey: miscExpenseKeys.evm(projectUuid ?? "") });
  };

  const addMisc = useMutation({
    mutationFn: (input: MiscExpenseInput) =>
      miscExpenseService.create(projectUuid!, miscExpenseToPayload(input)),
    onSuccess: () => {
      invalidateMiscData();
      toast.success("Expense added");
      setModalOpen(false);
      setEditing(null);
    },
    onError: () => toast.error("Failed to add expense"),
  });

  const updateMisc = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<MiscExpenseInput> }) =>
      miscExpenseService.update(
        projectUuid!,
        id,
        miscExpenseToPayload(input as MiscExpenseInput),
      ),
    onSuccess: () => {
      invalidateMiscData();
      toast.success("Expense updated");
      setModalOpen(false);
      setEditing(null);
    },
    onError: () => toast.error("Failed to update expense"),
  });

  const deleteMisc = useMutation({
    mutationFn: (expenseId: string) =>
      miscExpenseService.remove(projectUuid!, expenseId),
    onSuccess: () => {
      invalidateMiscData();
      toast.success("Expense deleted");
    },
    onError: () => toast.error("Failed to delete expense"),
  });

  // ── UI state ────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MiscExpense | null>(null);
  const [expandedMs, setExpandedMs] = useState<Record<string, boolean>>({});
  const toggleMs = (id: string) =>
    setExpandedMs((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── Derived EVM numbers ─────────────────────────────────────────────────
  const core = useMemo(
    () => ({ pv: pvAt(baseline, MOCK_WBS_AS_OF), ev: earnedValue(baseline).total, ac: MOCK_WBS_AC }),
    [baseline],
  );
  const miscTotals = useMemo(
    () =>
      expenses.reduce(
        (acc, e) => ({ pv: acc.pv + e.amountPlanned, ev: acc.ev + e.earnedValue, ac: acc.ac + e.amountActual }),
        { pv: 0, ev: 0, ac: 0 },
      ),
    [expenses],
  );
  const combined = {
    pv: core.pv + miscTotals.pv,
    ev: core.ev + miscTotals.ev,
    ac: core.ac + miscTotals.ac,
  };

  const coreSPI = core.pv > 0 ? core.ev / core.pv : 1;
  const coreCPI = core.ac > 0 ? core.ev / core.ac : 1;
  const combSPI = combined.pv > 0 ? combined.ev / combined.pv : 1;
  const combCPI = combined.ac > 0 ? combined.ev / combined.ac : 1;

  // Core WBS PV/EV per phase — its own "Milestones / Phases" section further
  // down the page, entirely separate from misc expenses.
  const coreBreakdown = useMemo(() => pvEvBreakdown(baseline, MOCK_WBS_AS_OF), [baseline]);

  // ── Misc by milestone/sub-milestone ─────────────────────────────────────
  // Rows come from the WBS baseline itself (every milestone and its
  // sub-milestones), not from whichever milestones happen to already have a
  // misc expense — so the phase list is always complete. Misc expenses only
  // carry a milestoneId (no sub-milestone granularity), so totals attach at
  // the milestone level; sub-milestones list for context only.
  const byMilestone = useMemo(() => {
    const expensesByMilestone = new Map<string, MiscExpense[]>();
    for (const exp of expenses) {
      const list = expensesByMilestone.get(exp.milestoneId) ?? [];
      list.push(exp);
      expensesByMilestone.set(exp.milestoneId, list);
    }

    return baseline.milestones.map((m, msIndex) => {
      const msExpenses = expensesByMilestone.get(m.id) ?? [];
      const totals = msExpenses.reduce(
        (acc, e) => ({
          pv: acc.pv + e.amountPlanned,
          ev: acc.ev + e.earnedValue,
          ac: acc.ac + e.amountActual,
        }),
        { pv: 0, ev: 0, ac: 0 },
      );
      return {
        milestoneId: m.id,
        milestoneName: m.name,
        level: msIndex + 1,
        subMilestones: m.subMilestones.map((sm, smIndex) => ({
          id: sm.id,
          name: sm.name,
          number: `${msIndex + 1}.${smIndex + 1}`,
        })),
        pv: totals.pv,
        ev: totals.ev,
        ac: totals.ac,
        expenses: msExpenses,
      };
    });
  }, [expenses, baseline]);

  // ── AI insight ──────────────────────────────────────────────────────────
  const insight = useMemo(() => {
    const worst = byMilestone
      .map((row) => ({
        name: row.milestoneName,
        pct: row.pv > 0 ? (row.ev / row.pv) * 100 : 100,
      }))
      .filter((r) => r.pct < 100)
      .sort((a, b) => a.pct - b.pct)[0];
    if (!worst) return null;
    return `${worst.name} misc expenses are at ${Math.round(worst.pct)}% vs planned — consider accelerating to avoid schedule impact.`;
  }, [byMilestone]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (exp: MiscExpense) => {
    setEditing(exp);
    setModalOpen(true);
  };

  const handleSubmit = (input: MiscExpenseInput) => {
    if (editing) {
      updateMisc.mutate({ id: editing.id, input });
    } else {
      addMisc.mutate(input);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl">
      {/* ══ EVM CARD ══ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-[#021422] px-5 py-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest">
              Earned Value Management
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Miscellaneous Expenses · {expenses.length} item
              {expenses.length !== 1 ? "s" : ""}
            </p>
          </div>
          <TrendingUp size={17} className="text-gray-500" />
        </div>

        <div className="divide-y divide-gray-100">
          {/* ── CORE ── */}
          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Core Costs (Labour · Materials · Equipment)
            </p>
            <div className="grid grid-cols-5 gap-4">
              <Metric label="PV" value={fmt(core.pv)} />
              <Metric label="EV" value={fmt(core.ev)} />
              <Metric label="AC" value={fmt(core.ac)} />
              <Metric
                label="SPI"
                value={coreSPI.toFixed(2)}
                hint={coreSPI >= 1 ? "On schedule" : "Behind"}
              />
              <Metric
                label="CPI"
                value={coreCPI.toFixed(2)}
                hint={coreCPI >= 1 ? "Under budget" : "Over budget"}
              />
            </div>
          </div>

          {/* ── MILESTONES / PHASES (core WBS PV/EV/AC — separate from misc) ── */}
          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Milestones / Phases
            </p>
            <MilestoneBreakdown breakdown={coreBreakdown} currency={currency} totalAc={MOCK_WBS_AC} />
          </div>

          {/* ── MISC BY MILESTONE ── */}
          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Miscellaneous by Phase
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2.5 text-left  text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Phase
                  </th>
                  <th className="pb-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    PV
                  </th>
                  <th className="pb-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    EV
                  </th>
                  <th className="pb-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    AC
                  </th>
                  <th className="pb-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody>
                {expensesLoading && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-gray-400">
                      Loading…
                    </td>
                  </tr>
                )}
                {!expensesLoading && byMilestone.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-xs text-gray-400"
                    >
                      No miscellaneous expenses added yet
                    </td>
                  </tr>
                )}
                {byMilestone.map((row) => {
                  // "₦0" would read as broken data — there's simply no misc
                  // expense recorded against this phase yet, which is a
                  // different fact from "this phase is worth nothing." A
                  // dash says that honestly, matching how the sub-milestone
                  // rows already show "—" for the same reason.
                  const hasMiscData = row.expenses.length > 0;
                  return (
                  <Fragment key={row.milestoneId}>
                    <tr className="border-b border-gray-50">
                      <td className="py-2.5 text-sm font-medium text-[#021422]">
                        Level {row.level}: {row.milestoneName}
                      </td>
                      <td className="py-2.5 text-right text-sm text-gray-600">
                        {hasMiscData ? fmt(row.pv) : "—"}
                      </td>
                      <td className="py-2.5 text-right text-sm text-gray-600">
                        {hasMiscData ? fmt(row.ev) : "—"}
                      </td>
                      <td className="py-2.5 text-right text-sm text-gray-600">
                        {hasMiscData ? fmt(row.ac) : "—"}
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex justify-end">
                          {hasMiscData ? <StatusDot pv={row.pv} ev={row.ev} /> : <span className="text-xs text-gray-300">—</span>}
                        </div>
                      </td>
                    </tr>
                    {row.subMilestones.map((sm) => (
                      <tr key={sm.id} className="border-b border-gray-50">
                        <td className="py-1.5 pl-6 text-xs text-gray-500">
                          {sm.number} {sm.name}
                        </td>
                        <td className="py-1.5 text-right text-xs text-gray-300">—</td>
                        <td className="py-1.5 text-right text-xs text-gray-300">—</td>
                        <td className="py-1.5 text-right text-xs text-gray-300">—</td>
                        <td className="py-1.5 text-right text-xs text-gray-300">—</td>
                      </tr>
                    ))}
                  </Fragment>
                  );
                })}
              </tbody>
              {expenses.length > 0 && (
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td className="pt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Total
                    </td>
                    <td className="pt-3 text-right text-sm font-bold text-[#021422]">
                      {fmt(miscTotals.pv)}
                    </td>
                    <td className="pt-3 text-right text-sm font-bold text-[#021422]">
                      {fmt(miscTotals.ev)}
                    </td>
                    <td className="pt-3 text-right text-sm font-bold text-[#021422]">
                      {fmt(miscTotals.ac)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* ── COMBINED ── */}
          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Combined — Core + Misc
            </p>
            <div className="grid grid-cols-5 gap-4">
              <Metric label="PV" value={fmt(combined.pv)} />
              <Metric label="EV" value={fmt(combined.ev)} />
              <Metric label="AC" value={fmt(combined.ac)} />
              <Metric
                label="SPI"
                value={combSPI.toFixed(2)}
                hint={combSPI >= 1 ? "On schedule" : "Behind"}
              />
              <Metric
                label="CPI"
                value={combCPI.toFixed(2)}
                hint={combCPI >= 1 ? "Under budget" : "Over budget"}
              />
            </div>
          </div>

          {/* ── AI INSIGHT ── */}
          {insight && (
            <div className="px-5 py-3.5 flex items-start gap-3 bg-amber-50/50">
              <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 shrink-0">
                AI Insight
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">{insight}</p>
            </div>
          )}
        </div>
      </div>

      {/* ══ MANAGE EXPENSES — grouped by milestone ══ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-gray-100">
          <p className="text-sm font-bold text-[#021422]">Manage Expenses</p>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-[#03203a] transition-colors"
          >
            <Plus size={13} /> Add Expense
          </button>
        </div>

        {!expensesLoading && expenses.length === 0 ? (
          <div className="flex flex-col items-center py-14">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Receipt size={15} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">
              No expenses yet
            </p>
            <p className="text-xs text-gray-400">
              Add admin, HSE, professional, site, or contingency costs
            </p>
          </div>
        ) : (
          <div>
            {byMilestone.map((msRow, idx) => {
              const isOpen = expandedMs[msRow.milestoneId] !== false; // default open
              return (
                <div
                  key={msRow.milestoneId}
                  className={idx > 0 ? "border-t border-gray-100" : ""}
                >
                  {/* Milestone header row */}
                  <button
                    onClick={() => toggleMs(msRow.milestoneId)}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <ChevronDown size={14} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={14} className="text-gray-400" />
                      )}
                      <span className="text-xs font-bold text-[#021422] uppercase tracking-wide">
                        Level {msRow.level}: {msRow.milestoneName}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {msRow.expenses.length} item
                        {msRow.expenses.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        PV <b className="text-[#021422]">{fmt(msRow.pv)}</b>
                      </span>
                      <span>
                        EV <b className="text-[#021422]">{fmt(msRow.ev)}</b>
                      </span>
                      <span>
                        AC <b className="text-[#021422]">{fmt(msRow.ac)}</b>
                      </span>
                    </div>
                  </button>

                  {/* Expense rows */}
                  {isOpen && (
                    <div className="overflow-x-auto border-t border-gray-100">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-5 py-2.5 text-left   text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                              Type
                            </th>
                            <th className="px-5 py-2.5 text-left   text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                              Category
                            </th>
                            <th className="px-5 py-2.5 text-right  text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                              PV
                            </th>
                            <th className="px-5 py-2.5 text-right  text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                              EV
                            </th>
                            <th className="px-5 py-2.5 text-right  text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                              AC
                            </th>
                            <th className="px-5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                              Status
                            </th>
                            <th className="px-5 py-2.5" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {msRow.expenses.map((exp) => (
                            <tr
                              key={exp.id}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-5 py-3">
                                <p className="font-semibold text-[#021422]">
                                  {exp.expenseType}
                                </p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  {exp.subCategory}
                                </p>
                              </td>
                              <td className="px-5 py-3 text-gray-500 text-sm">
                                {
                                  MISC_CATEGORY_LABELS[
                                    exp.category as MiscCategoryKey
                                  ]
                                }
                              </td>
                              <td className="px-5 py-3 text-right text-gray-700">
                                {fmt(exp.amountPlanned)}
                              </td>
                              <td className="px-5 py-3 text-right text-gray-700">
                                {fmt(exp.earnedValue)}
                              </td>
                              <td className="px-5 py-3 text-right text-gray-700">
                                {fmt(exp.amountActual)}
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${MISC_STATUS_COLORS[exp.status]}`}
                                >
                                  {MISC_STATUS_LABELS[exp.status]}
                                  {exp.status === "partial"
                                    ? ` ${exp.progressPercent}%`
                                    : ""}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    onClick={() => openEdit(exp)}
                                    className="text-gray-300 hover:text-gray-600 transition-colors"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    onClick={() => deleteMisc.mutate(exp.id)}
                                    disabled={deleteMisc.isPending}
                                    className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-40"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <MiscExpenseModal
          key={editing?.id ?? "new"}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
          initial={editing}
          milestones={milestones.map((m) => ({ id: m.id, name: m.name }))}
        />
      )}
    </div>
  );
}
