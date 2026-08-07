"use client";

import { use, useState } from "react";
import { Calendar } from "lucide-react";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useEvmSummary, useEvmTrend, useEvmSnapshots } from "@/lib/hooks/useEvm";
import EngineerHeader from "@/app/[org_slug]/projects/[project_slug]/engineer/(office)/components/EngineerHeader";
import EvmKpiCards from "@/app/[org_slug]/projects/[project_slug]/engineer/(office)/performance/components/EvmKpiCards";
import EvmSCurveChart, {
  type EvmTrendGranularity,
} from "@/app/[org_slug]/projects/[project_slug]/engineer/(office)/performance/components/EvmSCurveChart";
import EvmSnapshotTable from "@/app/[org_slug]/projects/[project_slug]/engineer/(office)/performance/components/EvmSnapshotTable";
import RebaselineDialog from "@/app/[org_slug]/projects/[project_slug]/engineer/(office)/performance/components/RebaselineDialog";
import SnapshotNowButton from "@/app/[org_slug]/projects/[project_slug]/engineer/(office)/performance/components/SnapshotNowButton";

interface PMPerformancePageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

// EvmSCurveChart now speaks daily/weekly/monthly granularity; this page's
// real-API trend hook still speaks 30d/90d/all — a small local adapter
// rather than changing the real API's query shape (out of scope here).
const RANGE_TO_GRANULARITY: Record<"30d" | "90d" | "all", EvmTrendGranularity> = {
  "30d": "daily",
  "90d": "weekly",
  all: "monthly",
};
const GRANULARITY_TO_RANGE: Record<EvmTrendGranularity, "30d" | "90d" | "all"> = {
  daily: "30d",
  weekly: "90d",
  monthly: "all",
};

export default function PMPerformancePage({ params }: PMPerformancePageProps) {
  const { org_slug, project_slug } = use(params);
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);
  const [trendRange, setTrendRange] = useState<"30d" | "90d" | "all">("30d");
  const [showRebaseline, setShowRebaseline] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useEvmSummary(projectUuid ?? undefined);
  const { data: trendData, isLoading: trendLoading } = useEvmTrend(projectUuid ?? undefined, trendRange);
  const { data: snapshots, isLoading: snapshotsLoading } = useEvmSnapshots(projectUuid ?? undefined);

  return (
    <div className="bg-[#E3E3E3] min-h-screen">
      <div className="flex items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[#021422]">Performance (EVM)</h1>
        </div>
        <div className="flex items-center gap-3">
          {projectUuid && <SnapshotNowButton projectUuid={projectUuid} />}
          <button
            onClick={() => setShowRebaseline(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0070D4] text-white rounded-lg text-sm font-medium hover:bg-[#005bb5] transition-colors"
          >
            Rebaseline
          </button>
        </div>
      </div>

      <div className="space-y-6 p-4 md:p-8 pt-8 pb-20">
        <div>
          <h2 className="text-lg text-[#021422]">
            Project: {project?.name || project_slug}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white">
            <Calendar size={18} className="text-gray-500" />
            <span className="text-gray-700 text-sm">
              {summary?.as_of
                ? new Date(summary.as_of).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Loading..."}
            </span>
          </div>
        </div>

        {summaryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 animate-pulse h-28" />
            ))}
          </div>
        ) : summary ? (
          <EvmKpiCards
            pv={summary.pv}
            ev={summary.ev}
            ac={summary.ac}
            spi={summary.spi}
            cpi={summary.cpi}
            scheduleStatusTag={summary.schedule_status_tag}
            costStatusTag={summary.cost_status_tag}
          />
        ) : (
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-400">
            No EVM data. Set a budget via Rebaseline to get started.
          </div>
        )}

        {trendLoading ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 h-96 animate-pulse" />
        ) : (
          <EvmSCurveChart
            data={trendData || []}
            range={RANGE_TO_GRANULARITY[trendRange]}
            onRangeChange={(g) => setTrendRange(GRANULARITY_TO_RANGE[g])}
            projectBudget={summary?.pv}
          />
        )}

        {snapshotsLoading ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 h-48 animate-pulse" />
        ) : (
          <EvmSnapshotTable snapshots={snapshots || []} />
        )}
      </div>

      {projectUuid && (
        <>
          <RebaselineDialog
            isOpen={showRebaseline}
            onClose={() => setShowRebaseline(false)}
            projectUuid={projectUuid}
            currentBudget={summary?.pv}
          />
        </>
      )}
    </div>
  );
}
