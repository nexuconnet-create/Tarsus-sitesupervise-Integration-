"use client";

import { use } from "react";
import { useMemberships } from "@/lib/hooks/useMemberships";
import MilestonesPage from "@/components/milestones/MilestonesPage";
import EngineerHeader from "../../components/EngineerHeader";

interface PageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

// MilestonesPage is pure mock data — no project UUID needed, so no backend
// call is made here.
export default function EngineerMilestonesPage({ params }: PageProps) {
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
        <EngineerHeader
          title={projectName}
          badge="MILESTONES"
        />
      }
    />
  );
}
