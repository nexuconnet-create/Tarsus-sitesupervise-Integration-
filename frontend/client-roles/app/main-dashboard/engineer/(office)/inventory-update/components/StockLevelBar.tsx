import type { StockStatus } from "@/lib/types/inventory";

interface StockLevelBarProps {
  currentStock: number;
  minStockLevel: number;
  unit: string;
  status: StockStatus;
}

const StockLevelBar = ({
  currentStock,
  minStockLevel,
  unit,
}: StockLevelBarProps) => {
  return (
    <span className="text-sm font-medium text-gray-700">
      {currentStock} {unit}
    </span>
  );
};

export default StockLevelBar;
