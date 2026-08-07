'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecVendorManagement from '@/components/client/dashboards/exec/ExecVendorManagement';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecVendorManagementPage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <ExecVendorManagement 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}