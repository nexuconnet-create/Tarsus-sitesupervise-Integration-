import { describe, it, expect } from "vitest";
import {
  formatMoney,
  formatDate,
  formatDecimal,
  formatPercent,
  formatWorkerCount,
  costOverrunTone,
  formatOverrunPct,
} from "@/lib/format/snapshot";

describe("formatMoney", () => {
  it("prefixes Naira and forces 2 decimals with thousands grouping", () => {
    expect(formatMoney("1500")).toBe("₦1,500.00");
    expect(formatMoney("1234567.5")).toBe("₦1,234,567.50");
  });

  it("keeps a real zero distinct from a missing value", () => {
    expect(formatMoney("0")).toBe("₦0.00");
    expect(formatMoney(null)).toBe("—");
    expect(formatMoney("")).toBe("—");
  });

  it("returns em-dash for non-numeric input rather than NaN", () => {
    expect(formatMoney("abc")).toBe("—");
  });
});

describe("formatDate / formatDecimal / formatPercent", () => {
  it("formats an ISO date and dashes null", () => {
    expect(formatDate("2026-03-01T09:00:00Z")).toContain("2026");
    expect(formatDate(null)).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
  });

  it("formats decimals plainly and dashes null", () => {
    expect(formatDecimal("12.5")).toBe("12.5");
    expect(formatDecimal("0")).toBe("0");
    expect(formatDecimal(null)).toBe("—");
  });

  it("formats percentages", () => {
    expect(formatPercent(60)).toBe("60%");
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(null)).toBe("—");
  });
});

describe("formatWorkerCount", () => {
  it("shows a single number when planned equals actual", () => {
    expect(formatWorkerCount(8, 8)).toBe("8");
    expect(formatWorkerCount(0, 0)).toBe("0");
  });

  it("splits planned vs actual when they differ", () => {
    expect(formatWorkerCount(6, 8)).toBe("6 planned / 8 actual");
  });

  it("treats null as zero", () => {
    expect(formatWorkerCount(null, 3)).toBe("0 planned / 3 actual");
    expect(formatWorkerCount(null, null)).toBe("0");
  });
});

describe("costOverrunTone / formatOverrunPct", () => {
  it("classifies over / under / on", () => {
    expect(costOverrunTone(12)).toBe("over");
    expect(costOverrunTone(-5)).toBe("under");
    expect(costOverrunTone(0)).toBe("on");
    expect(costOverrunTone(null)).toBe("on");
  });

  it("signs the percentage explicitly", () => {
    expect(formatOverrunPct(12)).toBe("+12%");
    expect(formatOverrunPct(-5)).toBe("-5%");
    expect(formatOverrunPct(0)).toBe("0%");
    expect(formatOverrunPct(null)).toBe("—");
  });
});
