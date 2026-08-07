'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecCreateProject from '@/components/client/dashboards/exec/ExecCreateProject';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecCreateProjectPage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <ExecCreateProject 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}