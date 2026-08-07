'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecActiveProjects from '@/components/client/dashboards/exec/ExecActiveProjects';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecActiveProjectsPage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <ExecActiveProjects 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}