"use client";
import BackButton from "@/components/BackButton";

import { use } from "react";
import { useMemberships } from "@/lib/hooks/useMemberships";
import MilestonesPage from "@/components/milestones/MilestonesPage";

interface PageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

// MilestonesPage is pure mock data — no project UUID needed, so no backend
// call is made here.
export default function PMMilestonesPage({ params }: PageProps) {
  const { org_slug, project_slug } = use(params);
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);

  const projectName =
    project && (project as { name?: string }).name
      ? (project as { name?: string }).name!
      : project_slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <MilestonesPage
      projectName={projectName}
      header={
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <BackButton /><span className="text-sm font-bold text-[#021422] bg-white px-2 py-1 rounded">MILESTONES</span>
            <h1 className="text-lg font-bold text-[#021422]">{projectName}</h1>
          </div>
        </div>
      }
    />
  );
}
