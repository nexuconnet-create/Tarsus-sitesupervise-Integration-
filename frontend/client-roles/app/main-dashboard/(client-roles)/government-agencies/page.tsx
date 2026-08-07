'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import GovernmentAgencyDashboard from '@/components/client/dashboards/GovernmentAgencyDashboard';
import { useAuthStore } from '@/lib/stores/authStore';
import { useMemberships } from '@/lib/hooks/useMemberships';

export default function GovernmentAgenciesPage() {
    const orgSlug = "";
  const projectSlug = "";
  
  const { getProject } = useMemberships();
  const project = getProject(orgSlug, projectSlug);
  const user = useAuthStore(s => s.user);

  return (
    <GovernmentAgencyDashboard 
      user={user} 
      project={project} 
      orgSlug={orgSlug} 
      projectSlug={projectSlug} 
    />
  );
}
