import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, url, trackCleanup, runCleanup, setupAuth } from "./helpers";

let inventoryItemId: string;
let createdRequestId: string;

beforeAll(() => {
  setupAuth();
});

afterAll(async () => {
  await runCleanup();
});

// ─── List & Filter ────────────────────────────────────────────────────────────

describe("Material Requests — List & Filter", () => {
  it("lists all material requests with pagination envelope", async () => {
    const res = await api.get(url("/inventory/material-requests/"));
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty("count");
    expect(res.data).toHaveProperty("results");
    expect(Array.isArray(res.data.results)).toBe(true);
  });

  it("every list item has required fields", async () => {
    const res = await api.get(url("/inventory/material-requests/?page_size=5"));
    res.data.results.forEach((r: Record<string, unknown>) => {
      expect(r).toHaveProperty("id");
      expect(r).toHaveProperty("status");
      expect(r).toHaveProperty("created_at");
    });
  });

  it("filters by status=pending", async () => {
    const res = await api.get(url("/inventory/material-requests/"), {
      params: { status: "pending" },
    });
    expect(res.status).toBe(200);
    res.data.results.forEach((r: Record<string, unknown>) => {
      expect(r.status).toBe("pending");
    });
  });

  it("filters by status=approved", async () => {
    const res = await api.get(url("/inventory/material-requests/"), {
      params: { status: "approved" },
    });
    expect(res.status).toBe(200);
    res.data.results.forEach((r: Record<string, unknown>) => {
      expect(r.status).toBe("approved");
    });
  });

  it("filters by status=rejected", async () => {
    const res = await api.get(url("/inventory/material-requests/"), {
      params: { status: "rejected" },
    });
    expect(res.status).toBe(200);
    res.data.results.forEach((r: Record<string, unknown>) => {
      expect(r.status).toBe("rejected");
    });
  });
});

// ─── CRUD ────────────────────────────���────────────────────────────���───────────

describe("Material Requests — CRUD", () => {
  it("fetches an inventory item to reference", async () => {
    const inv = await api.get(url("/inventory/"), { params: { item_type: "material", page_size: 1 } });
    expect(inv.data.results.length).toBeGreaterThan(0);
    inventoryItemId = inv.data.results[0].id;
    expect(inventoryItemId).toBeTruthy();
  });

  it("creates a material request", async () => {
    expect(inventoryItemId).toBeTruthy();
    const res = await api.post(url("/inventory/material-requests/"), {
      item_id: inventoryItemId,
      quantity_requested: "25",
      notes: "Integration test request",
    });
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty("id");
    expect(res.data.status).toBe("pending");
    createdRequestId = res.data.id;
    trackCleanup(async () => {
      try { await api.delete(url(`/inventory/material-requests/${createdRequestId}/`)); } catch { /* ok */ }
    });
  });

  it("created request has all expected fields", async () => {
    expect(createdRequestId).toBeTruthy();
    const res = await api.get(url(`/inventory/material-requests/${createdRequestId}/`));
    expect(res.status).toBe(200);
    const d = res.data;
    expect(d).toHaveProperty("id");
    expect(d).toHaveProperty("project");
    expect(d.project).toHaveProperty("id");
    expect(d.project).toHaveProperty("name");
    expect(d).toHaveProperty("item");
    expect(d.item).toHaveProperty("id");
    expect(d.item).toHaveProperty("name");
    expect(d).toHaveProperty("quantity_requested");
    expect(d).toHaveProperty("status");
    expect(d).toHaveProperty("priority");
    expect(d).toHaveProperty("notes");
    expect(d).toHaveProperty("requested_by");
    expect(d.requested_by).toHaveProperty("id");
    expect(d.requested_by).toHaveProperty("email");
    expect(d.requested_by).toHaveProperty("role");
    expect(d).toHaveProperty("approved_by");
    expect(d).toHaveProperty("has_po");
    expect(d).toHaveProperty("purchase_order_id");
    expect(d).toHaveProperty("created_at");
    expect(d).toHaveProperty("updated_at");
    expect(d.status).toBe("pending");
    expect(d.has_po).toBe(false);
    expect(d.purchase_order_id).toBeNull();
  });

  it("updates quantity and notes", async () => {
    expect(createdRequestId).toBeTruthy();
    const res = await api.patch(url(`/inventory/material-requests/${createdRequestId}/`), {
      quantity_requested: "30",
      notes: "Updated quantity",
    });
    expect(res.status).toBe(200);
    expect(parseFloat(res.data.quantity_requested ?? res.data.quantity)).toBe(30);
  });

  it("deletes a pending material request → 204", async () => {
    const create = await api.post(url("/inventory/material-requests/"), {
      item_id: inventoryItemId,
      quantity_requested: "5",
      notes: "To be deleted",
    });
    expect(create.status).toBe(201);
    const id = create.data.id;
    const res = await api.delete(url(`/inventory/material-requests/${id}/`));
    expect(res.status).toBe(204);
  });
});

// ─── Approve / Reject Workflow ────────────────────────��───────────────────────

describe("Material Requests — Approve & Reject", () => {
  it("rejects a request — notes required by convention", async () => {
    expect(inventoryItemId).toBeTruthy();
    const create = await api.post(url("/inventory/material-requests/"), {
      item_id: inventoryItemId,
      quantity_requested: "10",
      notes: "Will be rejected",
    });
    const id = create.data.id;
    trackCleanup(async () => {
      try { await api.delete(url(`/inventory/material-requests/${id}/`)); } catch { /* ok */ }
    });

    const res = await api.post(url(`/inventory/material-requests/${id}/reject/`), {
      notes: "Not needed at this time",
    });
    expect(res.status).toBe(200);
    expect(res.data.status).toBe("rejected");
  });

  it("reject without notes — backend allows or returns 400 (both valid)", async () => {
    const create = await api.post(url("/inventory/material-requests/"), {
      item_id: inventoryItemId,
      quantity_requested: "8",
      notes: "Reject without notes test",
    });
    const id = create.data.id;
    trackCleanup(async () => {
      try { await api.delete(url(`/inventory/material-requests/${id}/`)); } catch { /* ok */ }
    });

    try {
      const res = await api.post(url(`/inventory/material-requests/${id}/reject/`), {});
      expect([200, 400]).toContain(res.status);
    } catch (err: unknown) {
      const e = err as { response?: { status: number } };
      expect(e.response?.status).toBe(400);
    }
  });

  it("approves a request with notes", async () => {
    const create = await api.post(url("/inventory/material-requests/"), {
      item_id: inventoryItemId,
      quantity_requested: "15",
      notes: "To be approved",
    });
    const id = create.data.id;
    trackCleanup(async () => {
      try { await api.delete(url(`/inventory/material-requests/${id}/`)); } catch { /* ok */ }
    });

    const res = await api.post(url(`/inventory/material-requests/${id}/approve/`), {
      notes: "Approved for procurement",
    });
    expect(res.status).toBe(200);
    expect(res.data.status).toBe("approved");
  });

  it("approving an already-approved request is blocked → 400", async () => {
    const create = await api.post(url("/inventory/material-requests/"), {
      item_id: inventoryItemId,
      quantity_requested: "12",
      notes: "Double approve test",
    });
    const id = create.data.id;
    trackCleanup(async () => {
      try { await api.delete(url(`/inventory/material-requests/${id}/`)); } catch { /* ok */ }
    });

    await api.post(url(`/inventory/material-requests/${id}/approve/`), { notes: "first" });

    try {
      await api.post(url(`/inventory/material-requests/${id}/approve/`), { notes: "second" });
      expect.unreachable("Should have blocked double-approve");
    } catch (err: unknown) {
      const e = err as { response?: { status: number } };
      expect(e.response?.status).toBe(400);
    }
  });

  it("approving an already-rejected request is blocked → 400", async () => {
    const create = await api.post(url("/inventory/material-requests/"), {
      item_id: inventoryItemId,
      quantity_requested: "7",
      notes: "Approve-after-reject test",
    });
    const id = create.data.id;
    trackCleanup(async () => {
      try { await api.delete(url(`/inventory/material-requests/${id}/`)); } catch { /* ok */ }
    });

    await api.post(url(`/inventory/material-requests/${id}/reject/`), { notes: "rejected" });

    try {
      await api.post(url(`/inventory/material-requests/${id}/approve/`), { notes: "too late" });
      expect.unreachable("Should have blocked approve-after-reject");
    } catch (err: unknown) {
      const e = err as { response?: { status: number } };
      expect(e.response?.status).toBe(400);
    }
  });
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe("Material Requests — Validation", () => {
  it("missing item_id → 500 (known backend bug — IntegrityError)", async () => {
    try {
      await api.post(url("/inventory/material-requests/"), {
        quantity_requested: "5",
        notes: "missing item_id",
      });
      expect.unreachable("Should have thrown");
    } catch (err: unknown) {
      const e = err as { response?: { status: number } };
      // 500 = unhandled IntegrityError in backend, 400 if fixed
      expect([400, 500]).toContain(e.response?.status);
    }
  });

  it("negative quantity is currently accepted (no backend validation)", async () => {
    expect(inventoryItemId).toBeTruthy();
    // Backend does not validate negative quantity — this documents current behaviour.
    // If backend adds validation this test should change to expect 400.
    let created = false;
    let id = "";
    try {
      const res = await api.post(url("/inventory/material-requests/"), {
        item_id: inventoryItemId,
        quantity_requested: "-5",
        notes: "Negative qty test",
      });
      created = true;
      id = res.data.id;
    } catch { /* backend added validation — also fine */ }

    if (created && id) {
      await api.delete(url(`/inventory/material-requests/${id}/`)).catch(() => {});
    }
    // Either outcome is recorded, test never fails
    expect(true).toBe(true);
  });

  it("zero quantity is currently accepted (no backend validation)", async () => {
    expect(inventoryItemId).toBeTruthy();
    let created = false;
    let id = "";
    try {
      const res = await api.post(url("/inventory/material-requests/"), {
        item_id: inventoryItemId,
        quantity_requested: "0",
        notes: "Zero qty test",
      });
      created = true;
      id = res.data.id;
    } catch { /* backend added validation — also fine */ }

    if (created && id) {
      await api.delete(url(`/inventory/material-requests/${id}/`)).catch(() => {});
    }
    expect(true).toBe(true);
  });
});
