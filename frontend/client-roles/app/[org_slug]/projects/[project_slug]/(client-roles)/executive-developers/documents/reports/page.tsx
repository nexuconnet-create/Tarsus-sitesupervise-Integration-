'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecBoardReports from '@/components/client/dashboards/exec/ExecBoardReports';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecBoardReportsPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const user = useAuthStore(s => s.user);

  return (
    <ExecBoardReports 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}