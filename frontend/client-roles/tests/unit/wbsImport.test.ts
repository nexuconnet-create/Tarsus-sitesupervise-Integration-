import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { parseWbsWorkbook } from "@/lib/excel/wbsImport";

/** Builds an in-memory .xlsx File from a header row + data rows, the same
 * shape a PM would produce by filling in the template. */
function makeWorkbookFile(rows: unknown[][], fileName = "wbs.xlsx"): File {
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "WBS");
  const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return new File([buffer], fileName, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

const HEADERS = [
  "Milestone",
  "Milestone Weight %",
  "Sub-Milestone",
  "Sub-Milestone Weight %",
  "Task",
  "Task Weight %",
  "Distribution",
  "Start Date",
  "Finish Date",
];

const VALID_ROWS = [
  HEADERS,
  ["Substructure", 20, "Piling & Foundation", 10, "Mobilize Rig", 3, "front_loaded", "2026-02-05", "2026-02-14"],
  ["Substructure", 20, "Piling & Foundation", 10, "Drive Piles", 5, "linear", "2026-02-12", "2026-03-05"],
  ["Substructure", 20, "Piling & Foundation", 10, "Pile Caps", 2, "back_loaded", "2026-03-03", "2026-03-12"],
  ["Frame", 35, "Columns", 35, "Columns", 35, "custom", "2026-03-15", "2026-06-14"],
];

describe("parseWbsWorkbook — happy path", () => {
  it("groups rows into milestones -> sub-milestones with their task rows", async () => {
    const result = await parseWbsWorkbook(makeWorkbookFile(VALID_ROWS));
    expect(result.errors).toEqual([]);
    expect(result.milestones).toHaveLength(2);

    const substructure = result.milestones.find((m) => m.name === "Substructure")!;
    expect(substructure).toMatchObject({ weight: 20 });
    expect(substructure.subMilestones).toHaveLength(1);

    const piling = substructure.subMilestones[0];
    expect(piling).toMatchObject({ name: "Piling & Foundation", weight: 10 });
    expect(piling.tasks).toEqual([
      { title: "Mobilize Rig", weight: 3, distribution: "front_loaded", startDate: "2026-02-05", finishDate: "2026-02-14" },
      { title: "Drive Piles", weight: 5, distribution: "linear", startDate: "2026-02-12", finishDate: "2026-03-05" },
      { title: "Pile Caps", weight: 2, distribution: "back_loaded", startDate: "2026-03-03", finishDate: "2026-03-12" },
    ]);
  });

  it("accepts a milestone/sub-milestone-only row with no task", async () => {
    const rows = [HEADERS, ["Handover", 5, "Sign-off", 5, "", "", "", "", ""]];
    const result = await parseWbsWorkbook(makeWorkbookFile(rows));
    expect(result.errors).toEqual([]);
    expect(result.milestones[0].subMilestones[0].tasks).toEqual([]);
  });

  it("accepts distribution values case-insensitively", async () => {
    const rows = [HEADERS, ["Roofing", 10, "Roof Sheets", 10, "Roof Sheets", 10, "BACK_LOADED", "2026-08-01", "2026-08-15"]];
    const result = await parseWbsWorkbook(makeWorkbookFile(rows));
    expect(result.errors).toEqual([]);
    expect(result.milestones[0].subMilestones[0].tasks[0].distribution).toBe("back_loaded");
  });

  it("reads a real Excel date cell (serial number) the same as a typed ISO string", async () => {
    // A JS Date in the source array becomes a genuine Excel serial-number
    // cell once written to .xlsx — the same shape a date column typed
    // directly into Excel produces, as opposed to a "YYYY-MM-DD" text cell.
    const rows = [
      HEADERS,
      ["Substructure", 20, "Clearance", 20, "Clearance", 20, "linear", new Date(Date.UTC(2026, 0, 15)), "2026-02-05"],
    ];
    const result = await parseWbsWorkbook(makeWorkbookFile(rows));
    expect(result.errors).toEqual([]);
    expect(result.milestones[0].subMilestones[0].tasks[0].startDate).toBe("2026-01-15");
  });
});

describe("parseWbsWorkbook — rejects rather than guesses", () => {
  it("fails the whole file when a required header is missing", async () => {
    const badHeaders = ["Milestone", "Weight", "Sub-Milestone", "Sub-Milestone Weight %", "Distribution", "Start Date", "Finish Date"];
    const result = await parseWbsWorkbook(makeWorkbookFile([badHeaders, ["Substructure", 20, "Clearance", 20, "linear", "2026-01-15", "2026-02-05"]]));
    expect(result.milestones).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/Missing required column/);
    expect(result.errors[0]).toMatch(/Milestone Weight %/);
  });

  it("reports a specific row number for a bad milestone weight", async () => {
    const rows = [HEADERS, ["Substructure", "twenty", "Clearance", 20, "", "", "", "", ""]];
    const result = await parseWbsWorkbook(makeWorkbookFile(rows));
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/^Row 2:/);
    expect(result.errors[0]).toMatch(/Milestone Weight %/);
  });

  it("rejects a milestone weight out of 0-100 range", async () => {
    const rows = [HEADERS, ["Substructure", 150, "Clearance", 20, "", "", "", "", ""]];
    const result = await parseWbsWorkbook(makeWorkbookFile(rows));
    expect(result.errors[0]).toMatch(/between 0 and 100/);
  });

  it("rejects a sub-milestone weight out of 0-100 range", async () => {
    const rows = [HEADERS, ["Substructure", 20, "Clearance", 150, "", "", "", "", ""]];
    const result = await parseWbsWorkbook(makeWorkbookFile(rows));
    expect(result.errors[0]).toMatch(/Sub-Milestone Weight %/);
  });

  it("rejects an unrecognized distribution value on a task row", async () => {
    const rows = [HEADERS, ["Substructure", 20, "Clearance", 20, "Clearance", 20, "steady", "2026-01-15", "2026-02-05"]];
    const result = await parseWbsWorkbook(makeWorkbookFile(rows));
    expect(result.errors[0]).toMatch(/Distribution.*must be one of/);
  });

  it("rejects a finish date on or before the start date", async () => {
    const rows = [HEADERS, ["Substructure", 20, "Clearance", 20, "Clearance", 20, "linear", "2026-02-05", "2026-02-05"]];
    const result = await parseWbsWorkbook(makeWorkbookFile(rows));
    expect(result.errors[0]).toMatch(/Finish Date.*must be after/);
  });

  it("rejects a task row with a bad weight without dropping the milestone silently", async () => {
    const rows = [HEADERS, ["Substructure", 20, "Piling", 20, "Piling", "half", "linear", "2026-01-15", "2026-02-05"]];
    const result = await parseWbsWorkbook(makeWorkbookFile(rows));
    expect(result.errors[0]).toMatch(/Task Weight %.*Piling/);
  });

  it("rejects a milestone whose repeated rows disagree on weight", async () => {
    const rows = [
      HEADERS,
      ["Substructure", 20, "Piling", 10, "Piling", 10, "linear", "2026-01-15", "2026-02-05"],
      ["Substructure", 25, "Slab", 10, "Slab", 10, "linear", "2026-01-15", "2026-02-05"],
    ];
    const result = await parseWbsWorkbook(makeWorkbookFile(rows));
    expect(result.errors[0]).toMatch(/different weight/);
  });

  it("rejects a sub-milestone whose repeated rows disagree on weight", async () => {
    const rows = [
      HEADERS,
      ["Substructure", 20, "Piling", 10, "Mobilize", 5, "linear", "2026-01-15", "2026-02-05"],
      ["Substructure", 20, "Piling", 15, "Drive", 5, "linear", "2026-01-15", "2026-02-05"],
    ];
    const result = await parseWbsWorkbook(makeWorkbookFile(rows));
    expect(result.errors[0]).toMatch(/different weight/);
  });

  it("rejects an empty sheet", async () => {
    const result = await parseWbsWorkbook(makeWorkbookFile([HEADERS]));
    expect(result.errors).toEqual(["The sheet has no data rows."]);
  });
});
