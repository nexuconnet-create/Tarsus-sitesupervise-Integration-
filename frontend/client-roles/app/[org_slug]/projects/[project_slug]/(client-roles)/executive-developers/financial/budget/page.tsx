'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecFinancialOverview from '@/components/client/dashboards/exec/ExecFinancialOverview';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecFinancialOverviewPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const user = useAuthStore(s => s.user);

  return (
    <ExecFinancialOverview 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}