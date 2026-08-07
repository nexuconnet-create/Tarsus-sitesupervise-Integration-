'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecProcurementDashboard from '@/components/client/dashboards/exec/ExecProcurementDashboard';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecProcurementDashboardPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const user = useAuthStore(s => s.user);

  return (
    <ExecProcurementDashboard 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}