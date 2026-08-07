'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExecNotificationSettings from '@/components/client/dashboards/exec/ExecNotificationSettings';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ExecNotificationSettingsPage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <ExecNotificationSettings 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}