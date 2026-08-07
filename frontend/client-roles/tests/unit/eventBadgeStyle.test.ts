import { describe, it, expect } from "vitest";
import { getEventBadgeStyle } from "@/components/ActivityFeedTab";

describe("getEventBadgeStyle", () => {
  it("marks reopened red", () => {
    expect(getEventBadgeStyle("reopened")).toContain("red");
  });

  it("marks completed and task_created green", () => {
    expect(getEventBadgeStyle("completed")).toContain("green");
    expect(getEventBadgeStyle("task_created")).toContain("green");
  });

  it("marks any reschedule_* event amber via the prefix rule", () => {
    expect(getEventBadgeStyle("reschedule_requested")).toContain("amber");
    expect(getEventBadgeStyle("reschedule_approved")).toContain("amber");
    expect(getEventBadgeStyle("reschedule_rejected")).toContain("amber");
  });

  it("marks any subtask_* event blue via the prefix rule", () => {
    expect(getEventBadgeStyle("subtask_created")).toContain("blue");
    expect(getEventBadgeStyle("subtask_actioned")).toContain("blue");
  });

  it("falls back to gray for anything else", () => {
    expect(getEventBadgeStyle("queue_changed")).toContain("gray");
    expect(getEventBadgeStyle("some_unknown_event")).toContain("gray");
  });
});
