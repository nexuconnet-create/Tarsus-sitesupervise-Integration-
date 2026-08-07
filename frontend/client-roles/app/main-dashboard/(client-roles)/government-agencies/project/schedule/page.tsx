'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ActiveProjects from '@/components/client/dashboards/gov/ActiveProjects';
import { useAuthStore } from '@/lib/stores/authStore';

export default function GovernmentAgenciesActiveProjectsPage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <ActiveProjects 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}
