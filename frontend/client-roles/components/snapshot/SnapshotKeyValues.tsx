import type { ReactNode } from "react";

export interface KeyValueRow {
  label: string;
  value: ReactNode;
}

/** Label/value grid for the scalar sections (identity, dates, status, …). */
export default function SnapshotKeyValues({ rows }: { rows: KeyValueRow[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            {row.label}
          </dt>
          <dd className="text-sm text-gray-800 break-words">
            {row.value === "" || row.value === null || row.value === undefined
              ? "—"
              : row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
