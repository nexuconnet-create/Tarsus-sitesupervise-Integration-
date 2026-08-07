"use client";

import { use, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Lock, Unlock } from "lucide-react";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useWbsBaseline } from "@/lib/hooks/useWbsBaseline";
import {
  pvAt,
  pvCurve,
  earnedValue,
  indices,
  deriveScheduleTag,
  deriveCostTag,
  baselineBounds,
  taskFractionAt,
  taskBudget,
  pvEvBreakdown,
} from "@/lib/evm";
import { MOCK_WBS_AC, MOCK_WBS_AS_OF } from "@/lib/mockData/wbs";
import type { EvmSummary, EvmTrendPoint } from "@/lib/types/evm";
import EngineerHeader from "../components/EngineerHeader";
import EvmKpiCards from "./components/EvmKpiCards";
import EvmSCurveChart, { type EvmTrendGranularity } from "./components/EvmSCurveChart";
import TopBottomTasks, { type TaskPerformanceItem } from "./components/TopBottomTasks";
import CriticalAlerts, { type AlertItem } from "./components/CriticalAlerts";
import MilestoneBreakdown from "./components/MilestoneBreakdown";

interface PerformancePageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

// Pure mock data — no backend calls. PV/EV/SPI/CPI are computed from the WBS
// baseline (milestone weights + task progress), the same source the
// milestones page edits, via the shared useWbsBaseline hook. AC is a
// placeholder (MOCK_WBS_AC) until labour/material/vendor cost feeds exist.
export default function PerformancePage({ params }: PerformancePageProps) {
  const { org_slug, project_slug } = use(params);
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const [trendRange, setTrendRange] = useState<EvmTrendGranularity>("weekly");

  const { baseline, weightStore, currency } = useWbsBaseline();
  const baselineVersion = weightStore.baselineHistory.length;
  const baselineLocked = weightStore.baselineStatus === "locked";

  const summary: EvmSummary | null = useMemo(() => {
    if (baseline.milestones.length === 0) return null;
    // Pinned to the mock baseline's own "as of" date rather than real
    // wall-clock today — task progress is static mock data calibrated for
    // this date, so PV must be evaluated at the same date or SPI drifts
    // worse every day that passes in real life without anyone touching it.
    const asOf = MOCK_WBS_AS_OF;
    const pv = pvAt(baseline, asOf);
    const ev = earnedValue(baseline).total;
    const idx = indices(pv, ev, MOCK_WBS_AC, baseline.bac);
    return {
      pv: String(Math.round(pv)),
      ev: String(Math.round(ev)),
      ac: String(Math.round(MOCK_WBS_AC)),
      spi: idx.spi !== null ? idx.spi.toFixed(4) : "0",
      cpi: idx.cpi !== null ? idx.cpi.toFixed(4) : "0",
      schedule_status_tag: deriveScheduleTag(idx.spi),
      cost_status_tag: deriveCostTag(idx.cpi),
      as_of: asOf,
    };
  }, [baseline]);

  // PV is a genuine plan that runs all the way to project completion, so its
  // curve is plotted to the project's actual finish date — reaching the full
  // BAC. EV/AC have no time dimension in this model (task progress isn't
  // date-stamped, so there's no real historical series for them), so their
  // curves are synthesized by scaling PV's own shape so they land on today's
  // real totals — projected across the whole timeline the same way PV is, so
  // all three lines run the full width of the chart. This is a projection,
  // not reconstructed history: it assumes SPI/CPI hold roughly steady for the
  // rest of the project, which is a guess, not a fact — a genuine trend needs
  // real snapshot history to replace this with.
  const trend: EvmTrendPoint[] = useMemo(() => {
    if (baseline.milestones.length === 0) return [];
    const bounds = baselineBounds(baseline);
    if (!bounds) return [];
    const stepDays = trendRange === "daily" ? 1 : trendRange === "weekly" ? 7 : 30;
    const points = pvCurve(baseline, { end: bounds.end, stepDays });
    const evTotal = earnedValue(baseline).total;
    const pvToday = pvAt(baseline, MOCK_WBS_AS_OF);
    const evScale = pvToday > 0 ? evTotal / pvToday : 0;
    const acScale = pvToday > 0 ? MOCK_WBS_AC / pvToday : 0;
    return points.map((p) => {
      const evAtPoint = p.pv * evScale;
      const acAtPoint = p.pv * acScale;
      const idx = indices(p.pv, evAtPoint, acAtPoint, baseline.bac);
      return {
        date: p.date,
        pv: String(Math.round(p.pv)),
        ev: String(Math.round(evAtPoint)),
        ac: String(Math.round(acAtPoint)),
        spi: idx.spi !== null ? idx.spi.toFixed(4) : "0",
        cpi: idx.cpi !== null ? idx.cpi.toFixed(4) : "0",
      };
    });
  }, [baseline, trendRange]);

  // Per-task schedule variance: how far actual progress is from what that
  // task's own curve/dates say should be done by today — each task carries
  // its own plan now, so this compares like against like rather than a task
  // against its whole milestone's shape.
  const taskVariances = useMemo(() => {
    // AC has no per-task feed (just a flat project-wide placeholder), so a
    // task's share is allocated by its share of total EV -- same approach
    // used on the "Progress by Phase" breakdown, for the same reason.
    const totalEv = earnedValue(baseline).total;
    return baseline.milestones.flatMap((m) =>
      m.subMilestones.flatMap((sm) =>
        sm.tasks.map((t) => {
          const budget = taskBudget(baseline.bac, t.weight);
          const pv = budget * taskFractionAt(t, MOCK_WBS_AS_OF);
          const ev = budget * (t.progress / 100);
          const ac = totalEv > 0 ? MOCK_WBS_AC * (ev / totalEv) : 0;
          return {
            id: t.id,
            name: t.name,
            milestoneName: m.name,
            variancePct: t.progress - taskFractionAt(t, MOCK_WBS_AS_OF) * 100,
            spi: pv > 0 ? ev / pv : null,
            cpi: ac > 0 ? ev / ac : null,
          };
        }),
      ),
    );
  }, [baseline]);

  const topTasks: TaskPerformanceItem[] = useMemo(
    () =>
      [...taskVariances]
        .filter((t) => t.variancePct > 0)
        .sort((a, b) => b.variancePct - a.variancePct)
        .slice(0, 3)
        .map((t) => ({ id: t.id, name: t.name, variancePct: t.variancePct, status: t.milestoneName, spi: t.spi, cpi: t.cpi })),
    [taskVariances],
  );

  const bottomTasks: TaskPerformanceItem[] = useMemo(
    () =>
      [...taskVariances]
        .filter((t) => t.variancePct < 0)
        .sort((a, b) => a.variancePct - b.variancePct)
        .slice(0, 3)
        .map((t) => ({ id: t.id, name: t.name, variancePct: Math.abs(t.variancePct), status: t.milestoneName, spi: t.spi, cpi: t.cpi })),
    [taskVariances],
  );

  // "Critical" = more than 15 points behind where the schedule says it
  // should be — same threshold shape as the old mock alert set (-22/-15/-8).
  const alerts: AlertItem[] = useMemo(() => {
    const behindAlerts: AlertItem[] = taskVariances
      .filter((t) => t.variancePct < -15)
      .sort((a, b) => a.variancePct - b.variancePct)
      .slice(0, 3)
      .map((t) => ({
        id: t.id,
        title: `${t.name} is ${Math.abs(t.variancePct).toFixed(0)}% behind schedule`,
        description: `Milestone: ${t.milestoneName}. Expected further along by today's date — review with the crew.`,
        severity: t.variancePct < -25 ? "critical" : "warning",
        status: "Behind Schedule",
        actionType: "review_task",
        taskId: t.id,
      }));

    const idx = indices(pvAt(baseline, MOCK_WBS_AS_OF), earnedValue(baseline).total, MOCK_WBS_AC, baseline.bac);
    if (idx.cpi !== null && idx.cpi < 0.9) {
      behindAlerts.push({
        id: "cost-overrun",
        title: `Actual cost is running ${((1 - idx.cpi) * 100).toFixed(0)}% over earned value`,
        description: "Cost performance index is below 0.90 — review cost feeds once labour/material/vendor data is wired in.",
        severity: idx.cpi < 0.8 ? "critical" : "warning",
        status: "Over Budget",
        actionType: "change_order",
      });
    }

    return behindAlerts;
  }, [baseline, taskVariances]);

  const breakdown = useMemo(() => pvEvBreakdown(baseline, MOCK_WBS_AS_OF), [baseline]);

  const handleReviewTask = () => toast("Open this task in Task Details to review it.");
  const handleChangeOrder = () => toast("Change orders aren't wired up yet — this is a mock alert.");

  return (
    <div className="bg-[#E3E3E3] min-h-screen">
      <EngineerHeader
        title={project?.name ?? project_slug}
        badge="PERFORMANCE"
      />

      <div className="space-y-6 p-4 md:p-8 pt-8 pb-20">
        {baselineVersion > 0 && (
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg ${
              baselineLocked ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            {baselineLocked ? <Lock size={14} /> : <Unlock size={14} />}
            <span className="text-sm font-semibold">
              {baselineLocked ? `Baseline v${baselineVersion} approved` : `Rebaselining from v${baselineVersion}`}
            </span>
          </div>
        )}

        {summary ? (
          <EvmKpiCards
            pv={summary.pv}
            ev={summary.ev}
            ac={summary.ac}
            bac={String(Math.round(baseline.bac))}
            spi={summary.spi}
            cpi={summary.cpi}
            scheduleStatusTag={summary.schedule_status_tag}
            costStatusTag={summary.cost_status_tag}
          />
        ) : (
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-400">
            Set up milestones and weights to see performance data.
          </div>
        )}

        <EvmSCurveChart
          data={trend}
          range={trendRange}
          onRangeChange={setTrendRange}
          projectBudget={String(Math.round(baseline.bac))}
          asOfDate={MOCK_WBS_AS_OF}
        />

        <MilestoneBreakdown breakdown={breakdown} currency={currency} totalAc={MOCK_WBS_AC} />

        <CriticalAlerts alerts={alerts} onReviewTask={handleReviewTask} onApproveChangeOrder={handleChangeOrder} />

        <TopBottomTasks topTasks={topTasks} bottomTasks={bottomTasks} onViewTask={handleReviewTask} />
      </div>
    </div>
  );
}
