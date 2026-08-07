"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import VendorSidebar from "./components/VendorSidebar";
import { useAuthStore } from "@/lib/stores/authStore";


const ALLOWED_ROLES = [
  "PROJECT_MANAGER",
  "PROJECT_ENGINEER",
  "MECHANICAL_ENGINEER",
  "ELECTRICAL_ENGINEER",
  "QUANTITY_SURVEYOR",
];

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    const role = (user?.role || user?.role_name || "").toUpperCase();
    if (!ALLOWED_ROLES.includes(role)) {
      router.replace("/select-project");
    }
  }, [hasHydrated, user, router]);

  const hideSidebarRoutes = ["/main-dashboard/vendor/messages"];
  const hideSidebar = hideSidebarRoutes.includes(pathname);

  return (
    <div className="flex h-screen">
      {!hideSidebar && <VendorSidebar />}
      <main className="flex-1 bg-[#E3E3E3] overflow-y-scroll">{children}</main>
    </div>
  );
}
