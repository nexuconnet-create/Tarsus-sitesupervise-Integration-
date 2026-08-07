"use client";

import { use } from "react";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { useMemberships } from "@/lib/hooks/useMemberships";
import MessagesView from "@/components/messaging/MessagesView";

interface PageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function EngineerMessagesPage({ params }: PageProps) {
  const { org_slug, project_slug } = use(params);
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);
  const { getProject } = useMemberships();
  const projectName = getProject(org_slug, project_slug)?.name;
  return <MessagesView projectUuid={projectUuid} projectName={projectName} />;
}
