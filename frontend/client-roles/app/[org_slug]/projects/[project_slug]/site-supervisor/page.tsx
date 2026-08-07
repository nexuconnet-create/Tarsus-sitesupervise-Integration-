"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CrewManagerPage() {
  const router = useRouter();
  const params = useParams();
  
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;

  useEffect(() => {
    router.replace(`/${orgSlug}/projects/${projectSlug}/site-supervisor/dashboard`);
  }, [router, orgSlug, projectSlug]);

  return null;
}
