'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ComplianceIssues from '@/components/client/dashboards/gov/ComplianceIssues';
import { useAuthStore } from '@/lib/stores/authStore';

export default function GovernmentAgenciesIssuesPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const user = useAuthStore(s => s.user);

  return (
    <ComplianceIssues 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}
