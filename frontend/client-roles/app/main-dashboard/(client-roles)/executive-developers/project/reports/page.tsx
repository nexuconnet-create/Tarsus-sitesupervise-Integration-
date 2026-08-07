'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecProjectAnalytics from '@/components/client/dashboards/exec/ExecProjectAnalytics';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecProjectAnalyticsPage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <ExecProjectAnalytics 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}