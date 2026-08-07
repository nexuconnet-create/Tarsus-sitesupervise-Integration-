import type { ReactNode } from "react";

interface SnapshotSectionProps {
  title: string;
  /** When true, the body collapses to muted "None recorded." (matches PDF). */
  isEmpty?: boolean;
  children?: ReactNode;
}

export default function SnapshotSection({
  title,
  isEmpty,
  children,
}: SnapshotSectionProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <h4 className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-500 border-b border-gray-100">
        {title}
      </h4>
      <div className="p-4">
        {isEmpty ? (
          <p className="text-xs italic text-gray-400">None recorded.</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
