'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import SharedLiveSiteView from '@/components/client/shared/SharedLiveSiteView';
import { useAuthStore } from '@/lib/stores/authStore';

export default function GovernmentAgencyLiveSiteViewPage() {
    const orgSlug = "";
  const projectSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <SharedLiveSiteView 
      user={user} 
      orgSlug={orgSlug}
      projectSlug={projectSlug}
    />
  );
}
