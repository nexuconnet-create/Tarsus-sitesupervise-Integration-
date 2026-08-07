"use client";

import { useMemberships } from "@/lib/hooks/useMemberships";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, FolderOpen } from "lucide-react";
import ProjectDocumentsPage from "@/components/documents/ProjectDocumentsPage";

export default function PMProjectDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;

  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const { data: _projectUuid } = useProjectUuid(org_slug, project_slug);
  const projectUuid = _projectUuid ?? project_slug;

  const projectName =
    project && (project as { name?: string }).name
      ? (project as { name?: string }).name!
      : project_slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const backHref = `/${org_slug}/projects/${project_slug}/project-manager/settings`;

  return (
    <ProjectDocumentsPage
      projectId={projectUuid}
      projectName={projectName}
      header={
        <div className="flex items-center justify-between bg-white py-5 px-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(backHref)}
              className="flex items-center gap-1 text-gray-400 hover:text-[#021422] transition-colors text-xs font-medium"
            >
              <ChevronLeft size={14} />
              Settings
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <FolderOpen size={14} className="text-[#021422]" />
              <span className="text-sm font-bold uppercase tracking-wide text-[#021422]">
                PROJECT DOCUMENTS
              </span>
              <span className="text-sm font-medium text-gray-500">{projectName}</span>
            </div>
          </div>
        </div>
      }
    />
  );
}
