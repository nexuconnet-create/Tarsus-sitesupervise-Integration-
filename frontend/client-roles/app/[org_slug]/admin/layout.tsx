"use client";

import { use, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useAuthStore } from "@/lib/stores/authStore";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface OrgAdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ org_slug: string }>;
}

export default function OrgAdminLayout({ children, params }: OrgAdminLayoutProps) {
  const { org_slug } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, loading } = useMemberships();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      if (pathname !== "/signin") {
        router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
      }
      return;
    }
    if (!isAdmin(org_slug)) {
      router.replace(`/${org_slug}/projects`);
    }
  }, [org_slug, user, isAdmin, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-[#021422] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !isAdmin(org_slug)) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar orgSlug={org_slug} />
      <main className="flex-1 bg-[#E3E3E3] overflow-y-scroll">{children}</main>
    </div>
  );
}
