'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AgencyNotifications from '@/components/client/dashboards/gov/AgencyNotifications';
import { useAuthStore } from '@/lib/stores/authStore';

export default function GovernmentAgenciesNotificationsPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const user = useAuthStore(s => s.user);

  return (
    <AgencyNotifications 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}
