"use client";

import { create } from "zustand";
import type {
  Requisition,
  Quote,
  PurchaseOrder,
  Invoice,
  RequisitionItem,
  RequisitionStatus,
  QuoteStatus,
  POStatus,
  InvoiceStatus,
  DeliveryStatus,
  EscrowStatus,
  RequisitionAttachment,
} from "@/lib/types/vendor";
import {
  MOCK_REQUISITIONS,
  MOCK_PURCHASE_ORDERS,
  MOCK_QUOTES,
} from "@/lib/mockData/vendor";

// ─── Store Interface ─────────────────────────────────────────────────────────

interface VendorStore {
  requisitions: Requisition[];
  purchaseOrders: PurchaseOrder[];

  addRequisition: (req: Requisition) => void;
  updateRequisition: (id: string, updates: Partial<Requisition>) => void;
  setRequisitionStatus: (id: string, status: RequisitionStatus) => void;

  addQuote: (requisitionId: string, quote: Quote) => void;
  updateQuote: (requisitionId: string, quoteId: string, updates: Partial<Quote>) => void;
  setQuoteStatus: (requisitionId: string, quoteId: string, status: QuoteStatus) => void;
  counterQuote: (requisitionId: string, quoteId: string, counterData: { counterAmount: number; counterDelivery: string; counterNotes: string }) => void;

  addPurchaseOrder: (po: PurchaseOrder) => void;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => void;
  setPOStatus: (id: string, status: POStatus) => void;
  setDeliveryStatus: (id: string, status: DeliveryStatus) => void;
  setEscrowStatus: (id: string, status: EscrowStatus) => void;

  generateDeliveryQR: (id: string) => void;
  scanDeliveryQR: (id: string, scannedBy: { userId: string; name: string; role: string }) => void;
  reportDeliveryIssue: (id: string, issue: { reason: string; description?: string; reportedBy: string; photos?: string[] }) => void;
  releaseEscrow: (id: string) => void;

  submitInvoice: (poId: string, invoice: Invoice) => void;
  setInvoiceStatus: (poId: string, status: InvoiceStatus) => void;
}

// ─── Store Factory ──────────────────────────────────────────────────────────

export const useVendorStore = create<VendorStore>((set) => ({
  requisitions: [...MOCK_REQUISITIONS],
  purchaseOrders: [...MOCK_PURCHASE_ORDERS],

  addRequisition: (req) =>
    set((state) => ({ requisitions: [req, ...state.requisitions] })),

  updateRequisition: (id, updates) =>
    set((state) => ({
      requisitions: state.requisitions.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  setRequisitionStatus: (id, status) =>
    set((state) => ({
      requisitions: state.requisitions.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    })),

  addQuote: (requisitionId, quote) =>
    set((state) => ({
      requisitions: state.requisitions.map((r) =>
        r.id === requisitionId
          ? { ...r, quotes: [...r.quotes, quote] }
          : r
      ),
    })),

  updateQuote: (requisitionId, quoteId, updates) =>
    set((state) => ({
      requisitions: state.requisitions.map((r) =>
        r.id === requisitionId
          ? {
              ...r,
              quotes: r.quotes.map((q) =>
                q.id === quoteId ? { ...q, ...updates } : q
              ),
            }
          : r
      ),
    })),

  setQuoteStatus: (requisitionId, quoteId, status) =>
    set((state) => ({
      requisitions: state.requisitions.map((r) =>
        r.id === requisitionId
          ? {
              ...r,
              quotes: r.quotes.map((q) =>
                q.id === quoteId ? { ...q, status } : q
              ),
            }
          : r
      ),
    })),

  counterQuote: (requisitionId, quoteId, counterData) =>
    set((state) => ({
      requisitions: state.requisitions.map((r) =>
        r.id === requisitionId
          ? {
              ...r,
              quotes: r.quotes.map((q) =>
                q.id === quoteId
                  ? {
                      ...q,
                      status: "countered" as QuoteStatus,
                      counterAmount: counterData.counterAmount,
                      counterDelivery: counterData.counterDelivery,
                      counterNotes: counterData.counterNotes,
                    }
                  : q
              ),
            }
          : r
      ),
    })),

  addPurchaseOrder: (po) =>
    set((state) => ({
      purchaseOrders: [po, ...state.purchaseOrders],
    })),

  updatePurchaseOrder: (id, updates) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id ? { ...po, ...updates } : po
      ),
    })),

  setPOStatus: (id, status) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id ? { ...po, status } : po
      ),
    })),

  setDeliveryStatus: (id, status) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id ? { ...po, deliveryStatus: status } : po
      ),
    })),

  setEscrowStatus: (id, status) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id ? { ...po, escrowStatus: status } : po
      ),
    })),

  generateDeliveryQR: (id) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id
          ? {
              ...po,
              qrToken: `qr-${po.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              qrGeneratedAt: new Date().toISOString(),
            }
          : po
      ),
    })),

  scanDeliveryQR: (id, scannedBy) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id
          ? {
              ...po,
              status: "delivered" as POStatus,
              deliveryStatus: "delivered" as DeliveryStatus,
              qrScannedBy: {
                userId: scannedBy.userId,
                name: scannedBy.name,
                role: scannedBy.role,
                scannedAt: new Date().toISOString(),
              },
              escrowStatus: po.deliveryIssue ? ("held" as EscrowStatus) : ("released" as EscrowStatus),
            }
          : po
      ),
    })),

  reportDeliveryIssue: (id, issue) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id
          ? {
              ...po,
              deliveryIssue: {
                reason: issue.reason,
                description: issue.description,
                reportedAt: new Date().toISOString(),
                reportedBy: issue.reportedBy,
                photos: issue.photos,
              },
              escrowStatus: "held" as EscrowStatus,
            }
          : po
      ),
    })),

  releaseEscrow: (id) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id ? { ...po, escrowStatus: "released" as EscrowStatus } : po
      ),
    })),

  submitInvoice: (poId, invoice) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === poId
          ? { ...po, invoice, invoiceStatus: "submitted" as InvoiceStatus }
          : po
      ),
    })),

  setInvoiceStatus: (poId, status) =>
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === poId ? { ...po, invoiceStatus: status } : po
      ),
    })),
}));
