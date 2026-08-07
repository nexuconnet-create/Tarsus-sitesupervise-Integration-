"use client";

import { use } from "react";
import { useMemberships } from "@/lib/hooks/useMemberships";
import ProjectDetailsPage from "@/components/project-details/ProjectDetailsPage";
import EngineerHeader from "../../components/EngineerHeader";

interface PageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function EngineerProjectDetailsPage({ params }: PageProps) {
  const { org_slug, project_slug } = use(params);
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);

  const projectName =
    project && (project as { name?: string }).name
      ? (project as { name?: string }).name!
      : project_slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <ProjectDetailsPage
      canEdit={true}
      header={
        <EngineerHeader
          title={projectName}
          badge="PROJECT DETAILS"
        />
      }
    />
  );
}
