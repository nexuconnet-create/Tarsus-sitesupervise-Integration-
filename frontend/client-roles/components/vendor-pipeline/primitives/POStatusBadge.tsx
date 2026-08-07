import type { InventoryPOStatus } from "@/lib/types/inventoryPO";
import { PO_STATUS_LABELS, PO_STATUS_STYLES } from "@/lib/types/inventoryPO";

interface POStatusBadgeProps {
  status: InventoryPOStatus;
  className?: string;
}

export default function POStatusBadge({ status, className = "" }: POStatusBadgeProps) {
  const s = PO_STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border} ${className}`}>
      {PO_STATUS_LABELS[status]}
    </span>
  );
}
