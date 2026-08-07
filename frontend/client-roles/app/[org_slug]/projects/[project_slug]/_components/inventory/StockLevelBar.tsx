import type { StockStatus } from "@/lib/types/inventory";

interface StockLevelBarProps {
  currentStock: number;
  minStockLevel: number;
  unit: string;
  status: StockStatus;
}

function formatQty(n: number): string {
  if (Number.isInteger(n)) return String(n);
  // Strip trailing zeros after rounding to 2dp
  return parseFloat(n.toFixed(2)).toString();
}

const StockLevelBar = ({
  currentStock,
  minStockLevel,
  unit,
}: StockLevelBarProps) => {
  return (
    <span className="text-sm font-medium text-gray-700">
      {formatQty(currentStock)} {unit}
    </span>
  );
};

export default StockLevelBar;
