"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/authStore";
import { authService } from "@/lib/services";

import {
  LayoutGrid,
  Users,
  Mail,
  FolderOpen,
  Activity,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronDown,
  Headphones,
  ShieldCheck,
  ShoppingCart,
  HardHat,
  Video,
} from "lucide-react";

interface AdminSidebarProps {
  orgSlug: string;
}

interface SidebarItem {
  name: string;
  icon: typeof LayoutGrid;
  href: string;
  subItems?: Omit<SidebarItem, 'subItems'>[];
}

const adminSidebarItems = (orgSlug: string): SidebarItem[] => [
  {
    name: "Dashboard",
    icon: LayoutGrid,
    href: `/${orgSlug}/admin`,
  },
  {
    name: "Users",
    icon: Users,
    href: `/${orgSlug}/admin/users`,
  },
  {
    name: "Invitations",
    icon: Mail,
    href: `/${orgSlug}/admin/invitations`,
  },
  {
    name: "Projects",
    icon: FolderOpen,
    href: `/${orgSlug}/admin/projects`,
  },
  {
    name: "Procurement",
    icon: ShoppingCart,
    href: `/${orgSlug}/admin/procurement`,
  },
  {
    name: "Digital Eye",
    icon: HardHat,
    href: `/${orgSlug}/admin/devices`,
    subItems: [
      {
        name: "DEVICES",
        icon: HardHat,
        href: `/${orgSlug}/admin/devices`,
      },
      {
        name: "REMOTE ASSIST",
        icon: Video,
        href: `/${orgSlug}/admin/remote-assist`,
      },
    ],
  },
  {
    name: "Activity Logs",
    icon: Activity,
    href: `/${orgSlug}/admin/activity-logs`,
  },
  {
    name: "Settings",
    icon: Settings,
    href: `/${orgSlug}/admin/settings`,
  },
];

export function AdminSidebar({ orgSlug }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Digital Eye"]);
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const sidebarItems = adminSidebarItems(orgSlug);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const toggleExpandItem = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName],
    );
  };

  const handleLogout = async () => {
    try {
      await authService.logout(refreshToken || "");
    } catch {
      // proceed with local logout even if the API call fails
    } finally {
      clearAuth();
      router.push("/signin");
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-[#021422] text-white rounded-md"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? "80px" : "280px" }}
        className={`
          fixed md:relative z-40 h-screen bg-[#021422] text-white flex flex-col font-sans border-r border-gray-800
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Collapse Toggle (desktop) */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-20 bg-[#021422] border border-gray-700 rounded-full p-1 text-white hover:bg-gray-800 transition-colors z-50"
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* Logo */}
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                <div className="flex items-center justify-center">
                  <Image
                    src="https://res.cloudinary.com/depeqzb6z/image/upload/v1769842703/logo_variant_csswfr.png"
                    alt="Site Supervise Logo"
                    width={200}
                    height={200}
                    className="object-contain"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Org Admin Header */}
        <div
          className={`px-6 mb-6 overflow-hidden transition-all duration-300 ${
            isCollapsed ? "opacity-0 h-0" : "opacity-100"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-blue-400" />
            <p className="text-sm text-gray-400">Organisation Admin Dashboard</p>
          </div>
          <div className="h-px bg-gray-700 w-full" />
        </div>

        {/* Section Label */}
        <div
          className={`px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
            isCollapsed ? "text-center" : ""
          }`}
        >
          {isCollapsed ? "..." : "Main Menu"}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {sidebarItems.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItems.includes(item.name);
            const isActive = pathname === item.href;
            const isSubItemActive =
              hasSubItems && item.subItems!.some((sub) => pathname === sub.href);

            if (hasSubItems) {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => toggleExpandItem(item.name)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group
                      ${isActive || isSubItemActive ? "bg-white/10 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" : "text-gray-400 hover:text-white hover:bg-white/5"}
                      ${isCollapsed ? "justify-center" : "justify-between"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={20}
                        className={`min-w-[20px] ${isActive || isSubItemActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                      />
                      {!isCollapsed && (
                        <span className="whitespace-nowrap overflow-hidden text-sm uppercase tracking-tight">
                          {item.name}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && !isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 pl-6 mb-1">
                          {item.subItems!.map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-xs
                                  ${isSubActive ? "bg-white/15 text-white font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"}
                                `}
                              >
                                <subItem.icon
                                  size={16}
                                  className="min-w-[16px]"
                                />
                                <span className="whitespace-nowrap overflow-hidden uppercase tracking-tight flex-1">
                                  {subItem.name}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group
                  ${
                    isActive
                      ? "bg-white/10 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
              >
                <item.icon
                  size={20}
                  className={`min-w-[20px] ${
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                  }`}
                />
                {!isCollapsed && (
                  <span className="whitespace-nowrap overflow-hidden text-sm uppercase tracking-tight">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 mt-auto border-t border-gray-800 space-y-1">
          <Link
            href="/staff/help-center"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <Headphones size={20} className="min-w-[20px]" />
            {!isCollapsed && <span className="text-sm">Help Center</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut size={20} className="min-w-[20px]" />
            {!isCollapsed && <span className="text-sm">Log out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}

export default AdminSidebar;
