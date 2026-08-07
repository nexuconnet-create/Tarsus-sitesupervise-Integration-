import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, url, trackCleanup, runCleanup, createPOAndGetId, setupAuth } from "./helpers";

let shippedPoId: string;
let shippedPoItemId: string;
let grnId: string;

beforeAll(async () => {
  setupAuth();
});

afterAll(async () => {
  await runCleanup();
});

async function ensureShippedPO(): Promise<void> {
  if (shippedPoId) return;

  shippedPoId = await createPOAndGetId({
    supplier_name: "GRN Test Supplier",
    order_date: "2026-05-04",
  });
  trackCleanup(async () => {
    try {
      const status = (await api.get(url(`/inventory/purchase-orders/${shippedPoId}/`))).data.status;
      if (status === "draft") await api.delete(url(`/inventory/purchase-orders/${shippedPoId}/`));
    } catch { /* ok */ }
  });

  const inv = await api.get(url("/inventory/"), { params: { item_type: "material", page_size: 1 } });
  const add = await api.post(url(`/inventory/purchase-orders/${shippedPoId}/items/add/`), {
    inventory_item_id: inv.data.results[0].id,
    quantity: "100",
    unit_price: "1",
  });
  shippedPoItemId = add.data.id;

  await api.post(url(`/inventory/purchase-orders/${shippedPoId}/submit/`));
  await api.post(url(`/inventory/purchase-orders/${shippedPoId}/approve/`));
  await api.post(url(`/inventory/purchase-orders/${shippedPoId}/mark-sent/`));
  await api.post(url(`/inventory/purchase-orders/${shippedPoId}/confirm-vendor-receipt/`));
  await api.post(url(`/inventory/purchase-orders/${shippedPoId}/mark-shipped/`));
}

// NOTE: Project Engineer role cannot create GRNs per API docs (PM/Admin only).
// The GRN endpoints return 403 for this user. These tests verify that behaviour
// and test read-only endpoints that are accessible.

describe("GRN — List", () => {
  it("lists GRNs for a shipped PO", async () => {
    await ensureShippedPO();
    const res = await api.get(url(`/inventory/purchase-orders/${shippedPoId}/grns/`));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.results) || Array.isArray(res.data)).toBe(true);
  });
});

describe("GRN — Create (role-restricted)", () => {
  it("returns 403 when Engineer tries to create GRN", async () => {
    await ensureShippedPO();
    try {
      await api.post(url(`/inventory/purchase-orders/${shippedPoId}/grns/`), {
        po_item_id: shippedPoItemId,
        received_date: "2026-05-04",
        quantity_received: 50,
        quantity_accepted: 50,
        quantity_rejected: 0,
      });
      expect.unreachable("Should have thrown 403");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number } };
      expect(axiosErr.response?.status).toBe(403);
    }
  });
});

describe("GRN — PO Item Summary", () => {
  it("returns item summary for shipped PO", async () => {
    await ensureShippedPO();
    const res = await api.get(url(`/inventory/purchase-orders/${shippedPoId}/grns/po-item-summary/`));
    expect(res.status).toBe(200);
    expect(res.data.results || res.data).toBeTruthy();
  });
});
