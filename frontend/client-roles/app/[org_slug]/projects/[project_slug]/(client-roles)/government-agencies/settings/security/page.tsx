'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AgencySecurity from '@/components/client/dashboards/gov/AgencySecurity';
import { useAuthStore } from '@/lib/stores/authStore';

export default function GovernmentAgenciesSecurityPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const user = useAuthStore(s => s.user);

  return (
    <AgencySecurity 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}
