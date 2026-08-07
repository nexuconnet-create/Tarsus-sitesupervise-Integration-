'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import RegulatoryArchive from '@/components/client/dashboards/gov/RegulatoryArchive';
import { useAuthStore } from '@/lib/stores/authStore';

export default function GovernmentAgenciesArchivePage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const user = useAuthStore(s => s.user);

  return (
    <RegulatoryArchive 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}
