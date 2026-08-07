'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecPerformanceTrends from '@/components/client/dashboards/exec/ExecPerformanceTrends';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecPerformanceTrendsPage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <ExecPerformanceTrends 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}