"use client";

import { Camera } from "lucide-react";
import { useSnapshotNow } from "@/lib/hooks/useEvm";

interface SnapshotNowButtonProps {
  projectUuid: string;
}

export default function SnapshotNowButton({ projectUuid }: SnapshotNowButtonProps) {
  const snapshotNow = useSnapshotNow(projectUuid);

  return (
    <button
      onClick={() => snapshotNow.mutate()}
      disabled={snapshotNow.isPending}
      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-[#021422] hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      <Camera size={16} />
      {snapshotNow.isPending ? "Creating..." : "Snapshot Now"}
    </button>
  );
}
