'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ComplianceAnalytics from '@/components/client/dashboards/gov/ComplianceAnalytics';
import { useAuthStore } from '@/lib/stores/authStore';

export default function GovernmentAgenciesAnalyticsPage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <ComplianceAnalytics 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}
