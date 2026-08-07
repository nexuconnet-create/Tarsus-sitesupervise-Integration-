'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecVendorManagement from '@/components/client/dashboards/exec/ExecVendorManagement';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecVendorManagementPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const user = useAuthStore(s => s.user);

  return (
    <ExecVendorManagement 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}