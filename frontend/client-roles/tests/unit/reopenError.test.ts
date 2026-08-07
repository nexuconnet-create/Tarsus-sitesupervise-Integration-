import { describe, it, expect } from "vitest";
import { mapReopenError } from "@/lib/hooks/useTaskReopen";

/** Build an axios-shaped error. */
function axiosError(status: number, data?: unknown) {
  return { response: { status, data } };
}

describe("mapReopenError", () => {
  it("maps 409 to the completed-only message, ignoring the body", () => {
    // 409 is checked before body parsing, so a stray reason/message must not win.
    expect(
      mapReopenError(axiosError(409, { message: "whatever", reason: ["x"] })),
    ).toBe("Only completed tasks can be reopened.");
  });

  it("maps 403 to a permission message", () => {
    expect(mapReopenError(axiosError(403, { detail: "Not allowed." }))).toBe(
      "You don't have permission to reopen this task.",
    );
  });

  it("uses the serializer's reason[0] on a 400 field error", () => {
    expect(
      mapReopenError(
        axiosError(400, {
          reason: ["Ensure this field has at least 10 characters."],
        }),
      ),
    ).toBe("Ensure this field has at least 10 characters.");
  });

  it("uses the service message on a 400 without a reason array", () => {
    expect(
      mapReopenError(
        axiosError(400, { message: "A reason is required to reopen a task." }),
      ),
    ).toBe("A reason is required to reopen a task.");
  });

  it("prefers reason over message when a 400 carries both", () => {
    expect(
      mapReopenError(
        axiosError(400, { reason: ["from reason"], message: "from message" }),
      ),
    ).toBe("from reason");
  });

  it("falls back generically on a network error with no response", () => {
    expect(mapReopenError(new Error("Network Error"))).toBe(
      "Failed to reopen task",
    );
  });

  it("falls back generically on a 500 with an empty body", () => {
    expect(mapReopenError(axiosError(500, {}))).toBe("Failed to reopen task");
  });
});
