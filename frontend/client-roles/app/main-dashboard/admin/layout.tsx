"use client";

import Sidebar from "./components/Sidebar";
import { usePathname } from "next/navigation";
import { AdminProvider } from "@/lib/mock/AdminContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideSidebarRoutes = [
    "/main-dashboard/admin/messages",
    "/main-dashboard/admin/conference",
  ];

  const hideSidebar = hideSidebarRoutes.includes(pathname);

  return (
    <AdminProvider>
      <div className="flex h-screen">
        {!hideSidebar && <Sidebar />}
        <main className="flex-1 bg-[#E3E3E3] overflow-y-scroll">{children}</main>
      </div>
    </AdminProvider>
  );
}
