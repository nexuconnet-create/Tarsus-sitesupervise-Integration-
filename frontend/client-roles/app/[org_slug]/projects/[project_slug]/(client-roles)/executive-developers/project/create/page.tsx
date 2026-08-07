'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecCreateProject from '@/components/client/dashboards/exec/ExecCreateProject';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecCreateProjectPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const user = useAuthStore(s => s.user);

  return (
    <ExecCreateProject 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}