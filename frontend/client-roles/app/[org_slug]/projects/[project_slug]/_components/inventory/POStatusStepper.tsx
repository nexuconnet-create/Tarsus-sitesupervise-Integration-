"use client";

import { useState } from "react";
import { XCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import type { InventoryPO } from "@/lib/types/inventoryPO";
import { canPerformPOAction, PO_STATUS_LABELS } from "@/lib/types/inventoryPO";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import { inventoryPOFromApi } from "@/lib/transforms/inventoryPOTransforms";
import { getErrorMessage } from "@/lib/error";
import { POStatusTimeline } from "@/components/vendor-pipeline/primitives";
import type { StepDef } from "@/components/vendor-pipeline/primitives/POStatusTimeline";

interface StepInfo {
  key: string;
  label: string;
  action: string | null;
}

interface POStatusStepperProps {
  po: InventoryPO;
  projectId: string;
  userRole: string;
  onStatusChange: (updated: InventoryPO) => void;
}

const STEPS: StepInfo[] = [
  { key: "draft", label: "Draft", action: null },
  { key: "submitted", label: "Submit", action: "submit" },
  { key: "approved", label: "Approve", action: "approve" },
  { key: "sent", label: "Send", action: "mark-sent" },
  { key: "confirmed", label: "Confirm", action: "confirm-vendor-receipt" },
  { key: "shipped", label: "Ship", action: "mark-shipped" },
  { key: "received", label: "Receive", action: "receive-delivery" },
];

const STEP_ORDER = STEPS.map((s) => s.key);

function getStepIndex(status: string): number {
  const idx = STEP_ORDER.indexOf(status);
  return idx >= 0 ? idx : -1;
}

export default function POStatusStepper({ po, projectId, userRole, onStatusChange }: POStatusStepperProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const currentIdx = getStepIndex(po.status);
  const isTerminal = po.status === "cancelled" || po.status === "rejected";

  const clickableSteps = new Set(
    STEPS.filter((s) => s.action && !isTerminal && canPerformPOAction(po.status, s.action as Parameters<typeof canPerformPOAction>[1], userRole)).map((s) => s.key),
  );

  const handleStep = async (stepKey: string) => {
    const step = STEPS.find((s) => s.key === stepKey);
    if (!step?.action || loading) return;
    const can = canPerformPOAction(po.status, step.action as Parameters<typeof canPerformPOAction>[1], userRole);
    if (!can) return;

    setLoading(step.key);
    try {
      const actions: Record<string, () => Promise<{ data: unknown }>> = {
        submit: () => purchaseOrderService.submitPO(projectId, po.uuid),
        approve: () => purchaseOrderService.approvePO(projectId, po.uuid),
        reject: () => purchaseOrderService.rejectPO(projectId, po.uuid),
        "mark-sent": () => purchaseOrderService.markSent(projectId, po.uuid),
        "confirm-vendor-receipt": () => purchaseOrderService.confirmVendorReceipt(projectId, po.uuid),
        "mark-shipped": () => purchaseOrderService.markShipped(projectId, po.uuid),
        "receive-delivery": () => purchaseOrderService.receiveDelivery(projectId, po.uuid, {
          item_receipts: po.items?.map((item) => ({
            po_item_id: item.uuid,
            quantity_received: String(item.quantityOrdered),
          })) ?? [],
          actual_delivery_date: new Date().toISOString().split("T")[0],
        }),
      };
      const res = await actions[step.action]();
      const updated = inventoryPOFromApi(res.data as Parameters<typeof inventoryPOFromApi>[0]);
      onStatusChange(updated);
      toast.success(`${PO_STATUS_LABELS[updated.status]} — ${po.poNumber}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(null);
    }
  };

  return (
    <POStatusTimeline
      steps={STEPS}
      currentStepIndex={currentIdx}
      isTerminal={isTerminal}
      terminalIcon={po.status === "cancelled" ? <XCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      terminalLabel={PO_STATUS_LABELS[po.status] || po.status}
      onStepClick={handleStep}
      clickableSteps={clickableSteps}
      loadingStep={loading}
    />
  );
}
