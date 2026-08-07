"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ConferencePage from "@/components/conference/ConferencePage";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";

/**
 * Landing page for shared calendar links:
 *   /conference?org=<org_slug>&project=<project_slug>&meeting=<uuid>
 *
 * Resolves the project UUID from the org/project slugs with useProjectUuid — the
 * same hook the role-scoped conference pages use — then hands off to
 * ConferencePage, which auto-joins the meeting named in `?meeting`. Auth is
 * enforced by middleware.
 */
function ConferenceEntry() {
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get("org") ?? "";
  const projectSlug = searchParams.get("project") ?? "";
  const { data: projectUuid } = useProjectUuid(orgSlug, projectSlug);
  return (
    <ConferencePage
      projectUuid={projectUuid}
      orgSlug={orgSlug}
      projectSlug={projectSlug}
    />
  );
}

export default function StandaloneConferencePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-[#021422] flex items-center justify-center">
          <Loader2 className="animate-spin text-white/60" size={32} />
        </div>
      }
    >
      <ConferenceEntry />
    </Suspense>
  );
}
