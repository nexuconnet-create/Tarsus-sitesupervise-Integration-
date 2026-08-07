'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecFinancialReports from '@/components/client/dashboards/exec/ExecFinancialReports';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecFinancialReportsPage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <ExecFinancialReports 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}