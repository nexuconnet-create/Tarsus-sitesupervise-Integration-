'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecVendorPerformance from '@/components/client/dashboards/exec/ExecVendorPerformance';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecVendorPerformancePage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <ExecVendorPerformance 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}