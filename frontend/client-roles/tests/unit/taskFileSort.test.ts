import { describe, it, expect } from "vitest";
import { sortFilesChronologically } from "@/components/TaskFilesTab";
import type { TaskFileListItem } from "@/lib/types/api";

/** Minimal TaskFileListItem with a controllable label + timestamp. */
function file(
  label: string,
  generated_at: string,
  milestone_type: TaskFileListItem["milestone_type"] = "created",
): TaskFileListItem {
  return {
    id: label,
    milestone_type,
    milestone_type_display: milestone_type,
    sequence_number: null,
    label,
    generated_at,
    generated_by: null,
    task_wp_number: "WP-001",
    task_title: "Test task",
  };
}

// The lifecycle in true chronological order. The API returns them ordered by
// milestone_type string, i.e. alphabetically: completed < created < rescheduled.
const created = file("Created", "2026-01-01T09:00:00Z", "created");
const reschedule1 = file("Reschedule 1", "2026-02-01T09:00:00Z", "rescheduled");
const completion1 = file("Completion 1", "2026-03-01T09:00:00Z", "completed");
const completion2 = file("Completion 2", "2026-04-01T09:00:00Z", "completed");

const labels = (files: TaskFileListItem[]) => files.map((f) => f.label);

describe("sortFilesChronologically", () => {
  it("returns an empty array unchanged", () => {
    expect(sortFilesChronologically([])).toEqual([]);
  });

  it("returns a single file unchanged", () => {
    expect(labels(sortFilesChronologically([created]))).toEqual(["Created"]);
  });

  it("reorders the API's alphabetical order into a real timeline", () => {
    // As the backend actually returns it: completions first, then created, then reschedule.
    const apiOrder = [completion1, completion2, created, reschedule1];
    expect(labels(sortFilesChronologically(apiOrder))).toEqual([
      "Created",
      "Reschedule 1",
      "Completion 1",
      "Completion 2",
    ]);
  });

  it("is idempotent on already-chronological input (safe to keep after the backend fix)", () => {
    const ordered = [created, reschedule1, completion1, completion2];
    expect(labels(sortFilesChronologically(ordered))).toEqual(labels(ordered));
  });

  it("does not mutate the input array (react-query cache safety)", () => {
    const apiOrder = [completion1, created];
    const snapshot = [...apiOrder];
    sortFilesChronologically(apiOrder);
    expect(apiOrder).toEqual(snapshot);
  });
});
