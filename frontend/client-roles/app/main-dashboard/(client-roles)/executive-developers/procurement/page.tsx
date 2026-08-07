'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecProcurementDashboard from '@/components/client/dashboards/exec/ExecProcurementDashboard';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecProcurementDashboardPage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <ExecProcurementDashboard 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}