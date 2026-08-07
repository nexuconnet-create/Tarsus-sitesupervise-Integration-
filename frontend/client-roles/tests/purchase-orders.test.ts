import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { api, url, trackCleanup, runCleanup, createPOAndGetId, setupAuth } from "./helpers";

let poId: string;
let poNumber: string;
let poItemId: string;

beforeAll(async () => {
  setupAuth();
});

afterAll(async () => {
  await runCleanup();
});

describe("Purchase Orders — List & Filter", () => {
  it("lists purchase orders", async () => {
    const res = await api.get(url("/inventory/purchase-orders/"));
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty("count");
    expect(Array.isArray(res.data.results)).toBe(true);
  });

  it("filters by status=draft", async () => {
    const res = await api.get(url("/inventory/purchase-orders/"), {
      params: { status: "draft" },
    });
    expect(res.status).toBe(200);
    res.data.results.forEach((po: Record<string, unknown>) => {
      expect(po.status).toBe("draft");
    });
  });

  it("filters by supplier_name", async () => {
    const res = await api.get(url("/inventory/purchase-orders/"), {
      params: { supplier_name: "Dangote" },
    });
    expect(res.status).toBe(200);
  });

  it("filters by date range", async () => {
    const res = await api.get(url("/inventory/purchase-orders/"), {
      params: { order_date_after: "2026-01-01", order_date_before: "2026-12-31" },
    });
    expect(res.status).toBe(200);
  });
});

describe("Purchase Orders — CRUD & Lifecycle", () => {
  const supplierName = "Integration Test Supplier";

  it("creates a PO with supplier_name", async () => {
    poId = await createPOAndGetId({
      supplier_name: supplierName,
      order_date: "2026-05-04",
      expected_delivery_date: "2026-05-15",
      notes: "Created by integration test",
    });
    expect(poId).toBeTruthy();
    trackCleanup(async () => {
      try {
        const status = (await api.get(url(`/inventory/purchase-orders/${poId}/`))).data.status;
        if (status === "draft") await api.delete(url(`/inventory/purchase-orders/${poId}/`));
        else if (!["shipped", "received"].includes(status)) {
          await api.post(url(`/inventory/purchase-orders/${poId}/cancel/`));
        }
      } catch { /* ok */ }
    });
  });

  it("gets PO detail", async () => {
    const res = await api.get(url(`/inventory/purchase-orders/${poId}/`));
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty("po_number");
    poNumber = res.data.po_number;
    expect(res.data.supplier).toBeDefined();
    expect(res.data.status).toBe("draft");
  });

  it("updates PO metadata", async () => {
    const res = await api.patch(url(`/inventory/purchase-orders/${poId}/`), {
      expected_delivery_date: "2026-05-20",
      notes: "Updated: supplier confirmed delay",
    });
    expect(res.status).toBe(200);
    expect(res.data.expected_delivery_date).toBe("2026-05-20");
  });

  it("adds a line item to draft PO", async () => {
    const inv = await api.get(url("/inventory/"), { params: { item_type: "material", page_size: 1 } });
    const itemId = inv.data.results[0].id;
    const res = await api.post(url(`/inventory/purchase-orders/${poId}/items/add/`), {
      inventory_item_id: itemId,
      quantity: "50",
      unit_price: "1",
      notes: "Test line item",
    });
    expect(res.status).toBe(201);
    poItemId = res.data.id;
  });

  it("updates a line item", async () => {
    const res = await api.patch(url(`/inventory/purchase-orders/${poId}/items/${poItemId}/update/`), {
      quantity: "75",
      notes: "Updated quantity",
    });
    expect(res.status).toBe(200);
  });

  it("lists line items", async () => {
    const res = await api.get(url(`/inventory/purchase-orders/${poId}/items/`));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.results || res.data)).toBe(true);
  });

  // === Lifecycle ===
  it("submits PO (draft → submitted)", async () => {
    const res = await api.post(url(`/inventory/purchase-orders/${poId}/submit/`));
    expect(res.status).toBe(200);
    expect(res.data.status).toBe("submitted");
  });

  it("approves PO (submitted → approved)", async () => {
    const res = await api.post(url(`/inventory/purchase-orders/${poId}/approve/`));
    expect(res.status).toBe(200);
    expect(res.data.status).toBe("approved");
  });

  it("marks sent (approved → sent)", async () => {
    const res = await api.post(url(`/inventory/purchase-orders/${poId}/mark-sent/`));
    expect(res.status).toBe(200);
    expect(res.data.status).toBe("sent");
  });

  it("confirms vendor receipt (sent → confirmed)", async () => {
    const res = await api.post(url(`/inventory/purchase-orders/${poId}/confirm-vendor-receipt/`));
    expect(res.status).toBe(200);
    expect(res.data.status).toBe("confirmed");
  });

  it("marks shipped (confirmed → shipped)", async () => {
    const res = await api.post(url(`/inventory/purchase-orders/${poId}/mark-shipped/`));
    expect(res.status).toBe(200);
    expect(res.data.status).toBe("shipped");
  });
});

describe("Purchase Orders — Edge Cases", () => {
  it("rejects submit with empty items → 404", async () => {
    const id = await createPOAndGetId({
      supplier_name: "Empty PO Test",
      order_date: "2026-05-04",
    });
    try {
      await api.post(url(`/inventory/purchase-orders/${id}/submit/`));
      expect.unreachable("Should have thrown");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number } };
      expect(axiosErr.response?.status).toBe(400);
    }
    await api.delete(url(`/inventory/purchase-orders/${id}/`));
  });

  it("approve from wrong status → 400", async () => {
    try {
      await api.post(url(`/inventory/purchase-orders/${poId}/approve/`));
      expect.unreachable("Should have thrown 400");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number } };
      expect(axiosErr.response?.status).toBe(400);
    }
  });

  it("cancel a non-shipped PO", async () => {
    const id = await createPOAndGetId({
      supplier_name: "Cancel Test Supplier",
      order_date: "2026-05-04",
    });
    const inv = await api.get(url("/inventory/"), { params: { item_type: "material", page_size: 1 } });
    await api.post(url(`/inventory/purchase-orders/${id}/items/add/`), {
      inventory_item_id: inv.data.results[0].id,
      quantity: "10",
      unit_price: "1",
    });
    await api.post(url(`/inventory/purchase-orders/${id}/submit/`));
    const res = await api.post(url(`/inventory/purchase-orders/${id}/cancel/`));
    expect(res.status).toBe(200);
    expect(res.data.status).toBe("cancelled");
  });

  it("receive delivery (full)", async () => {
    const id = await createPOAndGetId({
      supplier_name: "Receive Test Supplier",
      order_date: "2026-05-04",
    });
    const inv = await api.get(url("/inventory/"), { params: { item_type: "material", page_size: 1 } });
    await api.post(url(`/inventory/purchase-orders/${id}/items/add/`), {
      inventory_item_id: inv.data.results[0].id,
      quantity: "10",
      unit_price: "1",
    });
    await api.post(url(`/inventory/purchase-orders/${id}/submit/`));
    await api.post(url(`/inventory/purchase-orders/${id}/approve/`));
    await api.post(url(`/inventory/purchase-orders/${id}/mark-sent/`));
    await api.post(url(`/inventory/purchase-orders/${id}/confirm-vendor-receipt/`));
    await api.post(url(`/inventory/purchase-orders/${id}/mark-shipped/`));
    const res = await api.post(url(`/inventory/purchase-orders/${id}/receive-delivery/`), {});
    expect(res.status).toBe(200);
    expect(res.data.status).toBe("received");
  });
});

describe("Purchase Orders — PO Line Item Summary", () => {
  it("gets PO item summary", async () => {
    const res = await api.get(url(`/inventory/purchase-orders/${poId}/grns/po-item-summary/`));
    expect(res.status).toBe(200);
    expect(res.data.results || res.data).toBeTruthy();
  });
});
