import { Loader2 } from "lucide-react";

export interface POLineItem {
  uuid: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface POLineItemsTableProps {
  items: POLineItem[] | "loading";
  emptyMessage?: string;
  currencySymbol?: string;
}

export default function POLineItemsTable({
  items,
  emptyMessage = "No line items on this PO.",
  currencySymbol = "₦",
}: POLineItemsTableProps) {
  if (items === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
        <Loader2 size={14} className="animate-spin" />
        Loading items…
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-sm text-gray-400 py-2">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 pr-2 font-medium text-gray-500">Item</th>
            <th className="text-right py-2 pr-2 font-medium text-gray-500">Qty</th>
            <th className="text-right py-2 pr-2 font-medium text-gray-500">Price</th>
            <th className="text-right py-2 font-medium text-gray-500">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.uuid} className="border-b border-gray-50">
              <td className="py-2 pr-2 text-gray-900 font-medium">{item.name}</td>
              <td className="py-2 pr-2 text-right text-gray-900">{item.quantity} {item.unit}</td>
              <td className="py-2 pr-2 text-right text-gray-500">{currencySymbol}{item.unitPrice.toLocaleString()}</td>
              <td className="py-2 text-right font-semibold text-gray-900">
                {currencySymbol}{(item.quantity * item.unitPrice).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
