'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import RegulatoryArchive from '@/components/client/dashboards/gov/RegulatoryArchive';
import { useAuthStore } from '@/lib/stores/authStore';

export default function GovernmentAgenciesArchivePage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <RegulatoryArchive 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}
