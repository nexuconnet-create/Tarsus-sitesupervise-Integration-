"use client";

import { use } from "react";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import ConferencePage from "@/components/conference/ConferencePage";

interface PageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function EngineerConferencePage({ params }: PageProps) {
  const { org_slug, project_slug } = use(params);
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);
  return (
    <ConferencePage
      projectUuid={projectUuid}
      orgSlug={org_slug}
      projectSlug={project_slug}
    />
  );
}
