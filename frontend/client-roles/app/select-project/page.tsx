"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useMemberships } from "@/lib/hooks/useMemberships";

export default function SelectProjectPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { memberships, loading } = useMemberships();

  useEffect(() => {
    // Wait for actual data from useMemberships, not just hydration
    if (loading) return;

    if (!user) {
      router.prefetch("/signin");
      router.replace("/signin");
      return;
    }

    if (memberships.length === 0) {
      router.prefetch("/select-org");
      router.replace("/select-org");
      return;
    }



    if (memberships.length === 1) {
      const org = memberships[0];
      router.prefetch(`/${org.org_slug}/projects`);
      router.replace(`/${org.org_slug}/projects`);
      return;
    }

    router.prefetch("/select-org");
    router.replace("/select-org");
  }, [loading, router, user, memberships]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin w-8 h-8 border-4 border-[#021422] border-t-transparent rounded-full" />
    </div>
  );
}
