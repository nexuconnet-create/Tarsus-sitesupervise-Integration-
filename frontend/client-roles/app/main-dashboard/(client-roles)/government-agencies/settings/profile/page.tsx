'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AgencyProfile from '@/components/client/dashboards/gov/AgencyProfile';
import { useAuthStore } from '@/lib/stores/authStore';

export default function GovernmentAgenciesProfilePage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <AgencyProfile 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}
