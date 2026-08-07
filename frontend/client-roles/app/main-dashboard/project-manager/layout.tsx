
"use client";

import Sidebar from "./components/Sidebar";
import { usePathname } from "next/navigation";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Routes where sidebar should NOT appear
  const hideSidebarRoutes = [
       "/main-dashboard/project-manager/messages",
    "/main-dashboard/project-manager/conference",
  ];

  const hideSidebar = hideSidebarRoutes.includes(pathname);

  return (
    <div className="flex h-screen">
      {!hideSidebar && <Sidebar />}
      <main className="flex-1 bg-[#E3E3E3] overflow-y-scroll">
        {children}
      </main>
    </div>
  );
}
