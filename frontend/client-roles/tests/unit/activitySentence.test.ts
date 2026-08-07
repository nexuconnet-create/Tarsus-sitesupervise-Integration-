import { describe, it, expect } from "vitest";
import { renderActivitySentence } from "@/components/ActivityFeedTab";
import type { TaskActivityEventType } from "@/lib/types/api";

describe("renderActivitySentence — one representative payload per event type", () => {
  // Pins the contract between backend `details` keys and the rendered line.
  // If the backend renames a key, the matching case here goes red.
  const cases: Array<[TaskActivityEventType, Record<string, unknown>, string]> = [
    ["task_created", { approval_status: "approved" }, "Task created (approved)"],
    ["status_changed", { old: "on_schedule", new: "at_risk" }, 'Status changed from "on_schedule" to "at_risk"'],
    ["queue_changed", { old: "todo", new: "in_progress" }, 'Moved from "todo" to "in_progress"'],
    ["assigned", { crew_name: "Alpha Crew" }, "Assigned to Alpha Crew"],
    ["reschedule_requested", { reason: "rain delay" }, "Reschedule requested — rain delay"],
    ["reschedule_approved", { old_start_date: "2026-01-01", new_start_date: "2026-01-05" }, "Reschedule approved — 2026-01-01 → 2026-01-05"],
    ["reschedule_rejected", { rejection_reason: "no slack" }, "Reschedule rejected — no slack"],
    ["subtask_created", { title: "Pour footing" }, "Subtask created: Pour footing"],
    ["subtask_actioned", { action: "approved", title: "Pour footing" }, "Subtask approved: Pour footing"],
    ["checklist_item_checked", { description: "Rebar tied" }, "Checked: Rebar tied"],
    ["checklist_item_unchecked", { description: "Rebar tied" }, "Unchecked: Rebar tied"],
    ["progress_updated", { old: "40", new: "60" }, "Progress updated: 40% → 60%"],
    ["file_attached", { file_name: "drawing.pdf" }, "File attached: drawing.pdf"],
    ["completed", {}, "Task completed"],
    ["reopened", { reason: "snag found" }, "Task reopened — snag found"],
  ];

  it.each(cases)("%s renders its sentence", (event, details, expected) => {
    expect(renderActivitySentence(event, details)).toBe(expected);
  });
});

describe("renderActivitySentence — missing keys degrade to placeholders", () => {
  it("uses ? placeholders for absent old/new values", () => {
    expect(renderActivitySentence("queue_changed", {})).toBe(
      'Moved from "?" to "?"',
    );
    expect(renderActivitySentence("progress_updated", {})).toBe(
      "Progress updated: 0% → 0%",
    );
  });

  it("never prints the literal string 'undefined'", () => {
    for (const event of [
      "assigned",
      "reschedule_requested",
      "subtask_created",
      "file_attached",
      "reopened",
    ] as TaskActivityEventType[]) {
      expect(renderActivitySentence(event, {})).not.toContain("undefined");
    }
  });
});

describe("renderActivitySentence — unknown event type", () => {
  it("de-snake-cases an unrecognised event instead of crashing", () => {
    expect(
      renderActivitySentence(
        "some_future_event" as TaskActivityEventType,
        {},
      ),
    ).toBe("some future event");
  });
});
