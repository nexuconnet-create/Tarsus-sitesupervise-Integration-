'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecProfileSettings from '@/components/client/dashboards/exec/ExecProfileSettings';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecProfileSettingsPage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <ExecProfileSettings 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}