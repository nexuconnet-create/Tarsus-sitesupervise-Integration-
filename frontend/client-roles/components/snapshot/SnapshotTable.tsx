import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
}

interface SnapshotTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string | number;
}

/** Generic read-only table for the list sections of a snapshot. */
export default function SnapshotTable<T>({
  columns,
  rows,
  rowKey,
}: SnapshotTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left">
            {columns.map((col) => (
              <th
                key={col.header}
                className={`pb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400 ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)} className="border-b border-gray-50 last:border-0">
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={`py-2 text-gray-800 ${
                    col.align === "right" ? "text-right tabular-nums" : "text-left"
                  }`}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
