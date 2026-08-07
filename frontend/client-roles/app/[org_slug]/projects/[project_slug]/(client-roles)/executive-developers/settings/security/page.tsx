'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecSecuritySettings from '@/components/client/dashboards/exec/ExecSecuritySettings';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecSecuritySettingsPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const user = useAuthStore(s => s.user);

  return (
    <ExecSecuritySettings 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}