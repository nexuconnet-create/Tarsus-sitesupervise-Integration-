import {
  formatMoney,
  formatOverrunPct,
  costOverrunTone,
} from "@/lib/format/snapshot";
import type {
  SnapshotPlannedCost,
  SnapshotActualCost,
  SnapshotCostVariance,
} from "@/lib/types/taskSnapshot";

interface SnapshotCostTableProps {
  planned: SnapshotPlannedCost;
  /** Both present only on Completed snapshots; omit for Created. */
  actual?: SnapshotActualCost;
  variance?: SnapshotCostVariance;
}

const ROWS: {
  label: string;
  key: "crew_cost" | "material_cost" | "equipment_cost" | "ppe_cost" | "total_cost";
  emphasis?: boolean;
}[] = [
  { label: "Crew", key: "crew_cost" },
  { label: "Materials", key: "material_cost" },
  { label: "Equipment", key: "equipment_cost" },
  { label: "PPE", key: "ppe_cost" },
  { label: "Total", key: "total_cost", emphasis: true },
];

export default function SnapshotCostTable({
  planned,
  actual,
  variance,
}: SnapshotCostTableProps) {
  const showActual = Boolean(actual && variance);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Cost
            </th>
            <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Planned
            </th>
            {showActual && (
              <>
                <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Actual
                </th>
                <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Variance
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr
              key={r.key}
              className={`border-b border-gray-50 last:border-0 ${
                r.emphasis ? "font-bold" : ""
              }`}
            >
              <td className="py-2 text-gray-800">{r.label}</td>
              <td className="py-2 text-right tabular-nums text-gray-800">
                {formatMoney(planned[r.key])}
              </td>
              {showActual && actual && variance && (
                <>
                  <td className="py-2 text-right tabular-nums text-gray-800">
                    {formatMoney(actual[r.key])}
                  </td>
                  <td className="py-2 text-right tabular-nums text-gray-800">
                    {formatMoney(variance[r.key])}
                  </td>
                </>
              )}
            </tr>
          ))}
          {showActual && variance && (
            <tr>
              <td className="py-2 text-gray-800">Cost overrun</td>
              <td />
              <td />
              <td
                className={`py-2 text-right font-bold tabular-nums ${
                  {
                    over: "text-red-600",
                    under: "text-green-600",
                    on: "text-gray-500",
                  }[costOverrunTone(variance.cost_overrun_pct)]
                }`}
              >
                {formatOverrunPct(variance.cost_overrun_pct)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
