'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import SharedLiveSiteView from '@/components/client/shared/SharedLiveSiteView';
import { useAuthStore } from '@/lib/stores/authStore';

export default function GovernmentAgencyLiveSiteViewPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const user = useAuthStore(s => s.user);

  return (
    <SharedLiveSiteView 
      user={user} 
      orgSlug={orgSlug}
      projectSlug={projectSlug}
    />
  );
}
