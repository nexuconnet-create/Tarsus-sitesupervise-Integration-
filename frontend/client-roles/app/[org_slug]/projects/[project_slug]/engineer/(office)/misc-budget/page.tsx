"use client";

import { use } from "react";
import { useMemberships } from "@/lib/hooks/useMemberships";
import EngineerHeader from "../components/EngineerHeader";
import MiscBudgetView from "@/app/[org_slug]/projects/[project_slug]/_components/misc-budget/MiscBudgetView";

interface Props {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function EngineerMiscBudgetPage({ params }: Props) {
  const { org_slug, project_slug } = use(params);
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);

  return (
    <div className="min-h-screen">
      <EngineerHeader
        badge="Earned Value Management"
        title={project?.name || project_slug}
      />
      <MiscBudgetView />
    </div>
  );
}
