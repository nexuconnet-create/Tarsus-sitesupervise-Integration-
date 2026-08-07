'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ComplianceDashboard from '@/components/client/dashboards/gov/ComplianceDashboard';
import { useAuthStore } from '@/lib/stores/authStore';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function GovernmentAgenciesOverviewPage() {
    const orgSlug = "";
  const projectSlug = "";
  
  const { getProject } = useMemberships();
  const project = getProject(orgSlug, projectSlug);
  const user = useAuthStore(s => s.user);

  return (
    <ComplianceDashboard 
      user={user} 
      project={project} 
      orgSlug={orgSlug} 
      projectSlug={projectSlug} 
    />
  );
}
