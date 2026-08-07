'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ApprovalsDashboard from '@/components/client/dashboards/gov/ApprovalsDashboard';
import { useAuthStore } from '@/lib/stores/authStore';

export default function GovernmentAgenciesApprovalsPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const user = useAuthStore(s => s.user);

  return (
    <ApprovalsDashboard 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}
