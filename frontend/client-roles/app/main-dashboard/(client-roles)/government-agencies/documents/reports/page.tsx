'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import InspectionReports from '@/components/client/dashboards/gov/InspectionReports';
import { useAuthStore } from '@/lib/stores/authStore';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function GovernmentAgenciesInspectionReportsPage() {
    const orgSlug = "";
  const projectSlug = "";
  
  const { getProject } = useMemberships();
  const project = getProject(orgSlug, projectSlug);
  const user = useAuthStore(s => s.user);

  return (
    <InspectionReports 
      user={user} 
      project={project} 
      orgSlug={orgSlug} 
      projectSlug={projectSlug} 
    />
  );
}
