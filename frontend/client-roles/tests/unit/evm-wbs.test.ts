import { describe, it, expect } from "vitest";
import {
  baselineBounds,
  distributionFraction,
  earnedValue,
  indices,
  milestoneBudget,
  taskFractionAt,
  pvAt,
  pvCurve,
  taskBudget,
  validateWeights,
} from "@/lib/evm";
import type { WbsBaseline } from "@/lib/evm";
import { MOCK_WBS_AC, MOCK_WBS_BAC, MOCK_WBS_BASELINE } from "@/lib/mockData/wbs";

const ms = (id: string) => MOCK_WBS_BASELINE.milestones.find((m) => m.id === id)!;
const task = (id: string) =>
  MOCK_WBS_BASELINE.milestones
    .flatMap((m) => m.subMilestones)
    .flatMap((s) => s.tasks)
    .find((t) => t.id === id)!;

// ─── Fixture reproduces the spec ────────────────────────────────────────────
// Weights are flat: every level is already a % of the whole project, so a
// milestone's sub-milestones sum to its own weight, and a sub-milestone's
// tasks sum to its own weight — not to 100 at either level.

describe("WBS fixture — matches the spec's own figures", () => {
  it("milestone budgets match the spec", () => {
    const expected: Record<string, number> = {
      "ms-1": 360_000_000,
      "ms-2": 630_000_000,
      "ms-3": 360_000_000,
      "ms-4": 270_000_000,
      "ms-5": 180_000_000,
    };
    for (const [id, budget] of Object.entries(expected)) {
      expect(milestoneBudget(MOCK_WBS_BAC, ms(id).weight)).toBeCloseTo(budget, 2);
    }
  });

  it("task weights are stored as flat % of project, matching the spec directly", () => {
    // Piling & Foundation is 10% of the whole project — no conversion, the
    // stored number is the spec's own number.
    const piling = task("t-1.2");
    expect(piling.weight).toBeCloseTo(10, 6);
    expect(taskBudget(MOCK_WBS_BAC, piling.weight)).toBeCloseTo(180_000_000, 2);

    const columns = task("t-2.1");
    expect(columns.weight).toBeCloseTo(12.5, 6);
    expect(taskBudget(MOCK_WBS_BAC, columns.weight)).toBeCloseTo(225_000_000, 2);
  });

  it("every task budget sums back to BAC", () => {
    const total = MOCK_WBS_BASELINE.milestones.reduce(
      (acc, m) =>
        acc +
        m.subMilestones.reduce((a, s) => a + s.tasks.reduce((b, t) => b + taskBudget(MOCK_WBS_BAC, t.weight), 0), 0),
      0,
    );
    expect(total).toBeCloseTo(MOCK_WBS_BAC, 2);
  });

  it("each sub-milestone's task weights sum to that sub-milestone's own weight", () => {
    for (const milestone of MOCK_WBS_BASELINE.milestones) {
      for (const subMilestone of milestone.subMilestones) {
        const total = subMilestone.tasks.reduce((acc, t) => acc + t.weight, 0);
        expect(total).toBeCloseTo(subMilestone.weight, 6);
      }
    }
  });

  it("each milestone's sub-milestone weights sum to that milestone's own weight", () => {
    for (const milestone of MOCK_WBS_BASELINE.milestones) {
      const total = milestone.subMilestones.reduce((acc, s) => acc + s.weight, 0);
      expect(total).toBeCloseTo(milestone.weight, 6);
    }
  });

  it("has 5 milestones, 14 sub-milestones and 14 tasks (one per sub-milestone), all weights valid", () => {
    expect(MOCK_WBS_BASELINE.milestones).toHaveLength(5);
    expect(MOCK_WBS_BASELINE.milestones.flatMap((m) => m.subMilestones)).toHaveLength(14);
    expect(MOCK_WBS_BASELINE.milestones.flatMap((m) => m.subMilestones).flatMap((s) => s.tasks)).toHaveLength(14);
    expect(validateWeights(MOCK_WBS_BASELINE)).toMatchObject({ valid: true, projectTotal: 100 });
  });
});

// ─── Validation ─────────────────────────────────────────────────────────────

describe("validateWeights", () => {
  it("names the offending sub-milestone rather than one global total, target is its own weight", () => {
    const broken: WbsBaseline = {
      ...MOCK_WBS_BASELINE,
      milestones: MOCK_WBS_BASELINE.milestones.map((m) =>
        m.id === "ms-3"
          ? {
              ...m,
              subMilestones: m.subMilestones.map((s) =>
                s.id === "sm-3.1"
                  ? { ...s, tasks: [...s.tasks, { id: "x", name: "Extra", weight: 15, progress: 0, startDate: "2026-06-15", finishDate: "2026-08-14", distribution: "linear" as const }] }
                  : s,
              ),
            }
          : m,
      ),
    };
    const result = validateWeights(broken);
    expect(result.valid).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toMatchObject({
      milestoneId: "ms-3",
      subMilestoneId: "sm-3.1",
      subMilestoneName: "External Walls",
      target: 8,
    });
    expect(result.issues[0].total).toBeCloseTo(23, 6); // 8 + 15 extra
    // The project total and the milestone's own sum are untouched — the
    // fault is scoped to one sub-milestone.
    expect(result.projectTotal).toBeCloseTo(100, 6);
  });

  it("names the offending milestone when its sub-milestones miss its own weight", () => {
    const broken: WbsBaseline = {
      ...MOCK_WBS_BASELINE,
      milestones: MOCK_WBS_BASELINE.milestones.map((m) =>
        m.id === "ms-3"
          ? { ...m, subMilestones: m.subMilestones.map((s) => (s.id === "sm-3.1" ? { ...s, weight: 20 } : s)) }
          : m,
      ),
    };
    const result = validateWeights(broken);
    expect(result.valid).toBe(false);
    const milestoneIssue = result.issues.find((i) => i.milestoneId === "ms-3" && !i.subMilestoneId);
    expect(milestoneIssue).toMatchObject({ milestoneName: "Superstructure — Enclosure", target: 20 });
    expect(milestoneIssue!.total).toBeCloseTo(32, 6); // 20 + 7 + 5
  });

  it("flags a project total that misses 100, target is 100", () => {
    const broken: WbsBaseline = {
      ...MOCK_WBS_BASELINE,
      milestones: MOCK_WBS_BASELINE.milestones.map((m) => (m.id === "ms-5" ? { ...m, weight: 15 } : m)),
    };
    const result = validateWeights(broken);
    expect(result.valid).toBe(false);
    expect(result.issues[0]).toMatchObject({ milestoneName: "Project total", target: 100 });
    expect(result.projectTotal).toBeCloseTo(105, 6);
  });

  it("does not fault a milestone or sub-milestone that has no children yet", () => {
    const empty: WbsBaseline = {
      bac: 100,
      milestones: [{ id: "m", name: "Empty", weight: 100, startDate: "", finishDate: "", subMilestones: [] }],
    };
    expect(validateWeights(empty).valid).toBe(true);
  });

  it("passes when a sub-milestone's single task carries its full weight, not 100", () => {
    // Piling & Foundation is weighted 10, and its one task also carries 10 —
    // not 100 — that's a valid, fully-allocated sub-milestone under flat
    // weights.
    const result = validateWeights(MOCK_WBS_BASELINE);
    expect(result.issues.find((i) => i.subMilestoneId === "sm-1.2")).toBeUndefined();
  });
});

// ─── Distribution models ────────────────────────────────────────────────────

describe("distribution models", () => {
  it("all models start at 0 and finish at 1", () => {
    for (const model of ["linear", "front_loaded", "back_loaded"] as const) {
      expect(distributionFraction(model, 0)).toBeCloseTo(0, 6);
      expect(distributionFraction(model, 1)).toBeCloseTo(1, 6);
    }
  });

  it("front-loaded leads linear, back-loaded trails it", () => {
    const front = distributionFraction("front_loaded", 0.5);
    const linear = distributionFraction("linear", 0.5);
    const back = distributionFraction("back_loaded", 0.5);
    expect(front).toBeGreaterThan(linear);
    expect(back).toBeLessThan(linear);
  });

  it("front/back-loaded are a two-segment knee, not a smooth power curve", () => {
    // Front-loaded: straight line to (40% time, 60% value), then straight
    // line to (100%, 100%) -- the construction cash-flow convention from the
    // client's own backend design, not an arbitrary exponent.
    expect(distributionFraction("front_loaded", 0.4)).toBeCloseTo(0.6, 10);
    expect(distributionFraction("front_loaded", 0.2)).toBeCloseTo(0.3, 10); // halfway to the knee
    expect(distributionFraction("front_loaded", 0.7)).toBeCloseTo(0.8, 10); // halfway past the knee

    // Back-loaded is the mirror image: knee at (60% time, 40% value).
    expect(distributionFraction("back_loaded", 0.6)).toBeCloseTo(0.4, 10);
    expect(distributionFraction("back_loaded", 0.3)).toBeCloseTo(0.2, 10);
    expect(distributionFraction("back_loaded", 0.8)).toBeCloseTo(0.7, 10);
  });

  it("is monotonic — planned spend never goes backwards", () => {
    for (const model of ["linear", "front_loaded", "back_loaded"] as const) {
      let prev = -1;
      for (let t = 0; t <= 1.0001; t += 0.05) {
        const value = distributionFraction(model, t);
        expect(value).toBeGreaterThanOrEqual(prev);
        prev = value;
      }
    }
  });

  it("clamps outside 0–1", () => {
    expect(distributionFraction("linear", -0.5)).toBe(0);
    expect(distributionFraction("linear", 2)).toBe(1);
  });

  it("interpolates a custom curve piecewise-linearly", () => {
    const curve = [0, 0.1, 0.35, 0.7, 1];
    expect(distributionFraction("custom", 0.25, curve)).toBeCloseTo(0.1, 6);
    expect(distributionFraction("custom", 0.5, curve)).toBeCloseTo(0.35, 6);
    // Halfway between the 0.1 and 0.35 knots.
    expect(distributionFraction("custom", 0.375, curve)).toBeCloseTo(0.225, 6);
  });

  it("falls back to linear when a custom curve is missing", () => {
    expect(distributionFraction("custom", 0.4)).toBeCloseTo(0.4, 6);
  });

  it("earns nothing before a task starts and everything after it finishes", () => {
    expect(taskFractionAt(task("t-1.1"), "2026-01-01")).toBe(0);
    expect(taskFractionAt(task("t-1.1"), "2026-01-15")).toBe(0);
    expect(taskFractionAt(task("t-1.1"), "2026-12-31")).toBe(1);
  });

  it("is timezone-independent", () => {
    // Site Clearance & Excavation is linear over 21 days (Jan 15 - Feb 5);
    // day 10 (Jan 25) should land at exactly 10/21 elapsed. This only lands
    // exactly if both dates parse as UTC midnight — a local parse would
    // drift by an hour across a DST boundary and lose the later decimals.
    expect(taskFractionAt(task("t-1.1"), "2026-01-25")).toBeCloseTo(10 / 21, 10);
  });

  it("two tasks in the same sub-milestone can carry different curves and earn different amounts at the same moment", () => {
    // The fixture gives every sub-milestone a single task, but the model
    // must still support two tasks under one sub-milestone behaving
    // differently — this is the concrete behavior a milestone-level curve
    // could never produce, since it would force every task under it to
    // share one shape.
    const shared = { startDate: "2026-01-01", finishDate: "2026-01-10", progress: 0 };
    const front = { id: "a", name: "Front", weight: 50, distribution: "front_loaded" as const, ...shared };
    const back = { id: "b", name: "Back", weight: 50, distribution: "back_loaded" as const, ...shared };
    expect(taskFractionAt(front, "2026-01-06")).toBeCloseTo(distributionFraction("front_loaded", 5 / 9), 10);
    expect(taskFractionAt(back, "2026-01-06")).toBeCloseTo(distributionFraction("back_loaded", 5 / 9), 10);
    expect(taskFractionAt(front, "2026-01-06")).toBeGreaterThan(taskFractionAt(back, "2026-01-06"));
  });
});

// ─── PV curve ───────────────────────────────────────────────────────────────

describe("pvCurve", () => {
  it("spans the whole WBS", () => {
    expect(baselineBounds(MOCK_WBS_BASELINE)).toEqual({ start: "2026-01-15", end: "2027-04-30" });
  });

  it("starts at 0 and closes at exactly BAC", () => {
    const curve = pvCurve(MOCK_WBS_BASELINE, { stepDays: 7 });
    expect(curve[0]).toMatchObject({ date: "2026-01-15", pv: 0 });
    expect(curve[curve.length - 1].date).toBe("2027-04-30");
    expect(curve[curve.length - 1].pv).toBeCloseTo(MOCK_WBS_BAC, 2);
  });

  it("closes at the true end date even when the step overshoots it", () => {
    const curve = pvCurve(MOCK_WBS_BASELINE, { stepDays: 90 });
    expect(curve[curve.length - 1].date).toBe("2027-04-30");
    expect(curve[curve.length - 1].pv).toBeCloseTo(MOCK_WBS_BAC, 2);
  });

  it("rises monotonically", () => {
    const curve = pvCurve(MOCK_WBS_BASELINE, { stepDays: 7 });
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].pv).toBeGreaterThanOrEqual(curve[i - 1].pv);
    }
  });

  it("counts finished tasks at their full budget, and nothing before the WBS starts", () => {
    // Every Substructure task finishes by 2026-04-02, and the Frame (started
    // 2026-03-15) has begun contributing by then.
    expect(pvAt(MOCK_WBS_BASELINE, "2026-04-02")).toBeGreaterThan(360_000_000);
    expect(pvAt(MOCK_WBS_BASELINE, "2026-01-15")).toBe(0);
  });

  it("returns nothing for an empty WBS", () => {
    expect(pvCurve({ bac: 100, milestones: [] })).toEqual([]);
    expect(baselineBounds({ bac: 100, milestones: [] })).toBeNull();
  });

  it("returns nothing when the window is inverted", () => {
    expect(pvCurve(MOCK_WBS_BASELINE, { start: "2027-01-01", end: "2026-01-01" })).toEqual([]);
  });
});

// ─── Earned value ───────────────────────────────────────────────────────────

describe("earnedValue", () => {
  it("earns a completed milestone's full budget", () => {
    const substructure = earnedValue(MOCK_WBS_BASELINE).byMilestone.find((m) => m.id === "ms-1")!;
    expect(substructure.ev).toBeCloseTo(360_000_000, 2);
    expect(substructure.progress).toBeCloseTo(100, 6);
  });

  it("earns only a small amount for a milestone with early proactive progress", () => {
    // Internal Finishes: 2% of ₦108M + External Finishes: 1% of ₦72M.
    const finishes = earnedValue(MOCK_WBS_BASELINE).byMilestone.find((m) => m.id === "ms-5")!;
    const expected = 0.02 * 108_000_000 + 0.01 * 72_000_000;
    expect(finishes.ev).toBeCloseTo(expected, 2);
  });

  it("weights partial progress by task budget, not task count", () => {
    // Frame: Columns 85% of ₦225M + Beams 60% of ₦225M + Slabs 30% of ₦180M.
    const frame = earnedValue(MOCK_WBS_BASELINE).byMilestone.find((m) => m.id === "ms-2")!;
    const expected = 0.85 * 225_000_000 + 0.6 * 225_000_000 + 0.3 * 180_000_000;
    expect(frame.ev).toBeCloseTo(expected, 2);
    expect(frame.progress).toBeCloseTo((expected / 630_000_000) * 100, 6);
  });

  it("totals the milestones", () => {
    const result = earnedValue(MOCK_WBS_BASELINE);
    expect(result.total).toBeCloseTo(result.byMilestone.reduce((a, m) => a + m.ev, 0), 2);
  });

  it("cannot exceed BAC when everything is complete", () => {
    const done: WbsBaseline = {
      ...MOCK_WBS_BASELINE,
      milestones: MOCK_WBS_BASELINE.milestones.map((m) => ({
        ...m,
        subMilestones: m.subMilestones.map((s) => ({
          ...s,
          tasks: s.tasks.map((t) => ({ ...t, progress: 100 })),
        })),
      })),
    };
    expect(earnedValue(done).total).toBeCloseTo(MOCK_WBS_BAC, 2);
  });
});

// ─── Indices ────────────────────────────────────────────────────────────────

describe("indices", () => {
  it("computes the standard EVM set", () => {
    const result = indices(1000, 900, 1200, 5000);
    expect(result.sv).toBe(-100);
    expect(result.cv).toBe(-300);
    expect(result.spi).toBeCloseTo(0.9, 6);
    expect(result.cpi).toBeCloseTo(0.75, 6);
    expect(result.eac).toBeCloseTo(6666.667, 3);
    expect(result.etc).toBeCloseTo(5466.667, 3);
    expect(result.vac).toBeCloseTo(-1666.667, 3);
  });

  it("returns null rather than infinity before any spend", () => {
    const result = indices(1000, 900, 0, 5000);
    expect(result.cpi).toBeNull();
    expect(result.eac).toBeNull();
    expect(result.etc).toBeNull();
    expect(result.vac).toBeNull();
    expect(result.spi).toBeCloseTo(0.9, 6);
  });

  it("returns a null SPI before anything is planned", () => {
    expect(indices(0, 0, 0, 5000).spi).toBeNull();
  });

  it("reports the mock project behind schedule but under budget", () => {
    // Level 3-5 tasks carry small early/proactive progress even though their
    // scheduled start is after the "as of" date, so PV for them is still 0
    // (unstarted per the plan) while EV picks up their contribution — pushing
    // CPI (EV/AC) above 1 even though SPI (EV/PV) stays below 1.
    const ev = earnedValue(MOCK_WBS_BASELINE).total;
    const pv = pvAt(MOCK_WBS_BASELINE, "2026-05-20");
    const result = indices(pv, ev, MOCK_WBS_AC, MOCK_WBS_BAC);
    expect(result.spi!).toBeLessThan(1);
    expect(result.cpi!).toBeGreaterThan(1);
    expect(result.eac!).toBeLessThan(MOCK_WBS_BAC);
  });
});
