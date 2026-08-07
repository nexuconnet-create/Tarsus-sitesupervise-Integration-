'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecFinancialOverview from '@/components/client/dashboards/exec/ExecFinancialOverview';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecFinancialOverviewPage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <ExecFinancialOverview 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}