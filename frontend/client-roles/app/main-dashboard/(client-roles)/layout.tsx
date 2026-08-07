"use client";

import { use, useState, useEffect, Suspense } from "react";
import ClientSidebar from "@/components/client/ClientSidebar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
}

function ClientDashboardLayoutInner({ children }: ClientDashboardLayoutProps) {
  const org_slug = "";
  const project_slug = "";
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientType = searchParams.get('clientType');

  // Temporarily disabled to allow authorized project members to review the client dashboard.
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Force redirect to onboarding if no clientType is selected (for testing)
  useEffect(() => {
    if (!clientType) {
      router.replace(`/onboarding`); // Or a generic client selection page
    }
  }, [clientType, router]);

  // Don't render the dashboard UI if we are about to redirect
  if (!clientType) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-[#021422] border-t-transparent rounded-full" />
      </div>
    );
  }

  let rolePath = 'client';
  if (pathname?.includes('/private-individual')) rolePath = 'private-individual';
  else if (pathname?.includes('/government-agencies')) rolePath = 'government-agencies';
  else if (pathname?.includes('/executive-developers')) rolePath = 'executive-developers';
  
  const base = `/main-dashboard/${rolePath}`;

  // Routes where sidebar should NOT appear
  const hideSidebarRoutes = [
    `${base}/ar-walkthrough`,
    `${base}/meeting`,
  ];

  const hideSidebar = hideSidebarRoutes.includes(pathname);

  return (
    <div className="flex h-screen">
      {/* Hamburger Menu Button - Only visible on mobile when sidebar should be shown */}
      {!hideSidebar && (
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg shadow-lg md:hidden hover:bg-slate-700 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar - Desktop: always visible, Mobile: modal overlay */}
      {!hideSidebar && (
        <ClientSidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
          orgSlug={org_slug}
          projectSlug={project_slug}
        />
      )}

      <main className="flex-1 bg-[#E3E3E3] overflow-y-scroll">
        {children}
      </main>
    </div>
  );
}

export default function ClientDashboardLayout({ children }: ClientDashboardLayoutProps) {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-[#021422] border-t-transparent rounded-full" />
      </div>
    }>
      <ClientDashboardLayoutInner>{children}</ClientDashboardLayoutInner>
    </Suspense>
  );
}
