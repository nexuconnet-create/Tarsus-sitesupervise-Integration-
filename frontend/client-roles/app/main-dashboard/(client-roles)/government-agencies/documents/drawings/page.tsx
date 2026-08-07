'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ApprovedPlans from '@/components/client/dashboards/gov/ApprovedPlans';
import { useAuthStore } from '@/lib/stores/authStore';

export default function GovernmentAgenciesApprovedPlansPage() {
    const orgSlug = "";
  const user = useAuthStore(s => s.user);

  return (
    <ApprovedPlans 
      user={user} 
      orgSlug={orgSlug} 
    />
  );
}
