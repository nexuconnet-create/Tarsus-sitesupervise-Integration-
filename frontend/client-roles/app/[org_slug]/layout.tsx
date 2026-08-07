"use client";

import { use, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useAuthStore } from "@/lib/stores/authStore";

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ org_slug: string }>;
}

export default function OrgLayout({ children, params }: OrgLayoutProps) {
  const { org_slug } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const { hasAccessToOrg, loading } = useMemberships();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      if (pathname !== "/signin") {
        router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
      }
      return;
    }
    if (!hasAccessToOrg(org_slug)) {
      router.replace("/select-org");
    }
  }, [loading, user, hasAccessToOrg, org_slug, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-[#021422] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !hasAccessToOrg(org_slug)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
