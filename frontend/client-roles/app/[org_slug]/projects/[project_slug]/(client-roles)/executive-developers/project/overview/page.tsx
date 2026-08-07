'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecutiveDeveloperDashboard from '@/components/client/dashboards/exec/ExecutiveDeveloperDashboard';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecutiveDeveloperDashboardPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const user = useAuthStore(s => s.user);

  return (
    <ExecutiveDeveloperDashboard 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}
