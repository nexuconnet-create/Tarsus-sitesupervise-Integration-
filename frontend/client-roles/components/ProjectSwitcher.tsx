"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, FolderOpen, Building2 } from "lucide-react";
import { useMemberships, type AllProjects } from "@/lib/hooks/useMemberships";
import { useAuthStore } from "@/lib/stores/authStore";
import { buildProjectUrl, getProjectDashboardRoute } from "@/lib/urlUtils";

interface ProjectSwitcherProps {
  orgSlug: string;
  projectSlug: string;
  /** Small caption above the project name, e.g. "Project Engineer Dashboard". */
  dashboardLabel?: string;
  /** When the sidebar is collapsed, render a compact icon-only trigger. */
  collapsed?: boolean;
}

/**
 * Minimal project / organization switcher for the dashboard sidebar header.
 *
 * Lets a user belonging to multiple projects (across one or more orgs) jump
 * between them without logging out. All data comes from `useMemberships()` —
 * no API calls. Switching navigates to the target project's role dashboard;
 * the project layout's `ProjectUuidSync` re-derives the UUID on arrival.
 */
const ProjectSwitcher = ({
  orgSlug,
  projectSlug,
  dashboardLabel,
  collapsed = false,
}: ProjectSwitcherProps) => {
  const router = useRouter();
  const { allProjects, getProject } = useMemberships();
  const setSelectedProjectUuid = useAuthStore((s) => s.setSelectedProjectUuid);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = getProject(orgSlug, projectSlug);
  const currentName = current?.name ?? projectSlug;

  // Group every project the user can access by organization.
  const grouped = allProjects.reduce<
    Record<string, { orgName: string; projects: AllProjects[] }>
  >((acc, p) => {
    const bucket = (acc[p.org_slug] ??= { orgName: p.org_name, projects: [] });
    bucket.projects.push(p);
    return acc;
  }, {});
  const orgGroups = Object.entries(grouped);

  // Only multiple destinations make the switcher interactive.
  const hasChoices = allProjects.length > 1;

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSwitch = (target: AllProjects) => {
    setOpen(false);
    if (target.org_slug === orgSlug && target.slug === projectSlug) return;
    if (target.uuid) setSelectedProjectUuid(target.uuid);
    const route = getProjectDashboardRoute(target.role) ?? "location";
    router.push(buildProjectUrl(target.org_slug, target.slug, route));
  };

  const popover = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute left-3 right-3 top-full z-50 mt-1 max-h-[60vh] overflow-y-auto custom-scrollbar rounded-xl border border-gray-700 bg-[#0A1A2A] shadow-2xl py-2"
        >
          {orgGroups.map(([oSlug, group]) => (
            <div key={oSlug} className="mb-1 last:mb-0">
              <p className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                <Building2 size={11} /> {group.orgName}
              </p>
              {group.projects.map((p) => {
                const isCurrent = p.org_slug === orgSlug && p.slug === projectSlug;
                return (
                  <button
                    key={`${p.org_slug}/${p.slug}`}
                    onClick={() => handleSwitch(p)}
                    disabled={isCurrent}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                      isCurrent ? "bg-white/5 cursor-default" : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{p.role}</p>
                    </div>
                    {isCurrent && (
                      <Check size={15} className="min-w-[15px] text-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          <div className="mt-1 border-t border-gray-700 pt-1">
            <button
              onClick={() => {
                setOpen(false);
                router.push(`/${orgSlug}/projects`);
              }}
              className="w-full px-3 py-2 text-left text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              All projects
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.push("/select-org");
              }}
              className="w-full px-3 py-2 text-left text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              Switch organization →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Collapsed: icon-only trigger ──────────────────────────────────────────
  if (collapsed) {
    if (!hasChoices) return null;
    return (
      <div ref={containerRef} className="relative px-3 mb-4 flex justify-center">
        <button
          onClick={() => setOpen((v) => !v)}
          title={`${currentName} — switch project`}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <FolderOpen size={18} />
        </button>
        {popover}
      </div>
    );
  }

  // ── Expanded ──────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative px-6 mb-6">
      {hasChoices ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className="group -mx-2 w-[calc(100%+1rem)] flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left"
        >
          <div className="flex-1 min-w-0">
            {dashboardLabel && (
              <p className="text-[11px] text-gray-500 mb-0.5 truncate">
                {dashboardLabel}
              </p>
            )}
            <p className="text-sm font-semibold text-white truncate">{currentName}</p>
          </div>
          <ChevronDown
            size={15}
            className={`min-w-[15px] text-gray-500 group-hover:text-white transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      ) : (
        <div>
          {dashboardLabel && (
            <p className="text-[11px] text-gray-500 mb-0.5 truncate">{dashboardLabel}</p>
          )}
          <p className="text-sm font-semibold text-white truncate">{currentName}</p>
        </div>
      )}

      <div className="h-px bg-gray-700 w-full mt-4" />

      {popover}
    </div>
  );
};

export default ProjectSwitcher;
