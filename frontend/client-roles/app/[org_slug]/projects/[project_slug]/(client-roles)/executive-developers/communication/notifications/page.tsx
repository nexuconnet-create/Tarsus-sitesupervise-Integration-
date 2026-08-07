'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecAlerts from '@/components/client/dashboards/exec/ExecAlerts';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecAlertsPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const user = useAuthStore(s => s.user);

  return (
    <ExecAlerts 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}