import type { StockStatus } from "@/lib/types/inventory";

interface StockBadgeProps {
  status: StockStatus;
  size?: "sm" | "md";
}

const StockBadge = ({ status }: StockBadgeProps) => {
  const statusConfig: Record<StockStatus, { color: string; label: string }> = {
    good: { color: "bg-green-500", label: "In Stock" },
    low: { color: "bg-amber-500", label: "Low Stock" },
    out: { color: "bg-red-500", label: "Out of Stock" },
  };

  const { color, label } = statusConfig[status];

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  );
};

export default StockBadge;
