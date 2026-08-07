import { afterEach, describe, expect, it } from "vitest";
import { getProjectDashboardRoute } from "@/lib/urlUtils";

const originalReviewMode = process.env.NEXT_PUBLIC_CLIENT_DASHBOARD_REVIEW;

afterEach(() => {
  if (originalReviewMode === undefined) {
    delete process.env.NEXT_PUBLIC_CLIENT_DASHBOARD_REVIEW;
  } else {
    process.env.NEXT_PUBLIC_CLIENT_DASHBOARD_REVIEW = originalReviewMode;
  }
});

describe("getProjectDashboardRoute", () => {
  it("routes project engineers to their normal dashboard by default", () => {
    delete process.env.NEXT_PUBLIC_CLIENT_DASHBOARD_REVIEW;

    expect(getProjectDashboardRoute("PROJECT_ENGINEER")).toBe("engineer");
  });

  it("routes project engineers to the client dashboard in review mode", () => {
    process.env.NEXT_PUBLIC_CLIENT_DASHBOARD_REVIEW = "true";

    expect(getProjectDashboardRoute("Project Engineer")).toBe("client");
  });

  it("does not redirect other roles in review mode", () => {
    process.env.NEXT_PUBLIC_CLIENT_DASHBOARD_REVIEW = "true";

    expect(getProjectDashboardRoute("SITE_ENGINEER")).toBe("site-supervisor");
    expect(getProjectDashboardRoute("PROJECT_MANAGER")).toBe("project-manager");
  });

  it("routes actual client users to the existing client route", () => {
    expect(getProjectDashboardRoute("CLIENT")).toBe("client");
  });
});
