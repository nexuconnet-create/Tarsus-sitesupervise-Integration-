"use client";

import type { EvmSnapshot } from "@/lib/types/evm";

interface EvmSnapshotTableProps {
  snapshots: EvmSnapshot[];
}

function formatCurrency(val: string): string {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return `₦${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function EvmSnapshotTable({ snapshots }: EvmSnapshotTableProps) {
  if (snapshots.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#021422] mb-4">Snapshot History</h3>
        <div className="text-center py-8 text-gray-400">
          No snapshots yet. Daily snapshots start at 23:55 UTC.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[#021422] mb-4">Snapshot History</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">PV</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">EV</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">AC</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">SPI</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">CPI</th>
              <th className="text-center py-3 px-2 font-medium text-gray-500">Tasks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {snapshots.map((snap) => {
              const spi = parseFloat(snap.spi);
              const cpi = parseFloat(snap.cpi);
              return (
                <tr key={snap.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2 font-medium text-[#021422]">
                    {new Date(snap.snapshot_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-600">{formatCurrency(snap.pv)}</td>
                  <td className="py-3 px-2 text-right text-green-600 font-medium">{formatCurrency(snap.ev)}</td>
                  <td className="py-3 px-2 text-right text-red-600 font-medium">{formatCurrency(snap.ac)}</td>
                  <td className={`py-3 px-2 text-right font-bold ${spi >= 1 ? "text-green-600" : spi >= 0.9 ? "text-yellow-600" : "text-red-600"}`}>
                    {spi.toFixed(4)}
                  </td>
                  <td className={`py-3 px-2 text-right font-bold ${cpi >= 1 ? "text-green-600" : cpi >= 0.9 ? "text-yellow-600" : "text-red-600"}`}>
                    {cpi.toFixed(4)}
                  </td>
                  <td className="py-3 px-2 text-center text-gray-500">
                    {snap.task_count_completed}/{snap.task_count_total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
