"use client";

import { use } from "react";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import ProjectDocumentsPage from "@/components/documents/ProjectDocumentsPage";
import EngineerHeader from "../../components/EngineerHeader";

interface PageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function EngineerProjectDocumentsPage({ params }: PageProps) {
  const { org_slug, project_slug } = use(params);
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const { data: projectUuid, isLoading } = useProjectUuid(org_slug, project_slug);

  const projectName =
    project && (project as { name?: string }).name
      ? (project as { name?: string }).name!
      : project_slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  if (isLoading) {
    return (
      <>
        <EngineerHeader title={projectName} badge="PROJECT DOCUMENTS" />
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          Loading project...
        </div>
      </>
    );
  }

  if (!projectUuid) {
    return (
      <>
        <EngineerHeader title={projectName} badge="PROJECT DOCUMENTS" />
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-red-500">
          Project not found
        </div>
      </>
    );
  }

  return (
    <ProjectDocumentsPage
      projectId={projectUuid}
      projectName={projectName}
      header={
        <EngineerHeader
          title={projectName}
          badge="PROJECT DOCUMENTS"
        />
      }
    />
  );
}
