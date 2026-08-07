"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/lib/services";
import { clearAuthTokens } from "@/lib/authUtils";
import {
  LayoutGrid,
  ClipboardList,
  CalendarCheck,
  BarChart2,
  Box,
  ShieldCheck,
  CloudSun,
  FolderOpen,
  MessageCircle,
  Users,
  Settings,
  Headphones,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronDown,
  Building2,
  Calendar1,
  History,
  ChartNoAxesCombined,
  Settings2,
  Shield,
  Package,
  Scan,
  Video,
} from "lucide-react";
import Image from "next/image";
import ProjectSwitcher from "@/components/ProjectSwitcher";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import UnreadMessagesBadge from "@/components/messaging/UnreadMessagesBadge";

const sidebarItems = [
  {
    name: "Crew Dashboard",
    icon: LayoutGrid,
    href: "dashboard",
  },
  {
    name: "Task Details",
    icon: ClipboardList,
    href: "task-details",
  },
  {
    name: "Schedule planner",
    icon: Calendar1,
    href: "schedule-planner",
  },
  {
    name: "Time & Attendance",
    icon: CalendarCheck,
    href: "attendance",
  },
  {
    name: "Real Time Tracking",
    icon: History,
    href: "real-time-tracking",
  },
  {
    name: "Weather & Site Report",
    icon: CloudSun,
    href: "weather-site-report",
  },
  {
    name: "Messages",
    icon: MessageCircle,
    href: "messages",
  },
  {
    name: "Conference",
    icon: Users,
    href: "conference",
  },
  {
    name: "Digital Eye",
    icon: Scan,
    href: "remote-assist",
    subItems: [
      {
        name: "REMOTE ASSIST",
        icon: Video,
        href: "remote-assist",
      },
    ],
  },
  {
    name: "Performance Analytics",
    icon: ChartNoAxesCombined,
    href: "performance-analytics",
  },
  {
    name: "Skills & Certifications",
    icon: ShieldCheck,
    href: "skills",
  },
  { name: "Safety", icon: Shield, href: "safety" },
  {
    name: "Inventory",
    icon: Package,
    href: "inventory-update",
  },
  {
    name: "Crew Settings",
    icon: Settings2,
    href: "crew-settings",
  },
];

const CrewSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Digital Eye"]);
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const basePath = `/${orgSlug}/projects/${projectSlug}/site-supervisor`;
  const { data: projectUuid } = useProjectUuid(orgSlug, projectSlug);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const toggleExpandItem = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken") || "";
      await authService.logout(refreshToken);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthTokens();
      router.push("/signin");
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileSidebar}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-[#021422] text-white rounded-md"
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? "80px" : "280px",
        }}
        className={`
          fixed md:relative z-40 h-screen bg-[#021422] text-white flex flex-col font-sans border-r border-gray-800
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Toggle Button (Desktop) */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-20 bg-[#021422] border border-gray-700 rounded-full p-1 text-white hover:bg-gray-800 transition-colors z-50"
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* Logo Section */}
        <div className="p-6 flex items-center justify-center min-h-[80px]">
          {isCollapsed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center w-10 h-10"
            >
              <Image
                src="https://res.cloudinary.com/depeqzb6z/image/upload/v1774500774/gaskia_logo-04_112538_1_1_ye9l2c.png"
                alt="Gaskia Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </motion.div>
          ) : (
            <div className="flex items-center justify-center">
              <Image
                src="https://res.cloudinary.com/depeqzb6z/image/upload/v1769842703/logo_variant_csswfr.png"
                alt="Site Supervise Logo"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          )}
        </div>

        {/* Project Switcher / Dashboard Header */}
        <ProjectSwitcher
          orgSlug={orgSlug}
          projectSlug={projectSlug}
          dashboardLabel="Sitesupervisor Dashboard"
          collapsed={isCollapsed}
        />

        <div
          className={`px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isCollapsed ? "text-center" : ""}`}
        >
          {isCollapsed ? "..." : "Main Menu"}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
          {sidebarItems.map((item) => {
            const href = `${basePath}/${item.href}`;
            const isActive = pathname === href;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItems.includes(item.name);
            const isSubItemActive = hasSubItems && item.subItems!.some((sub) => pathname === `${basePath}/${sub.href}`);

            if (hasSubItems) {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => toggleExpandItem(item.name)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group
                      ${isActive || isSubItemActive ? "bg-white/10 text-white font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"}
                      ${isCollapsed ? "justify-center" : "justify-between"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={20}
                        className={`min-w-[20px] ${isActive || isSubItemActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                      />
                      {!isCollapsed && (
                        <span className="whitespace-nowrap overflow-hidden">
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
                            const isSubActive = pathname === `${basePath}/${subItem.href}`;
                            return (
                              <Link
                                key={subItem.href}
                                href={`${basePath}/${subItem.href}`}
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
                                <span className="whitespace-nowrap overflow-hidden">
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
                href={href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  relative flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group
                  ${isActive ? "bg-white/10 text-white font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"}
                  ${isCollapsed ? "justify-center" : ""}
                `}
              >
                <item.icon
                  size={20}
                  className={`min-w-[20px] ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                />
                {!isCollapsed && (
                  <span className="whitespace-nowrap overflow-hidden">
                    {item.name}
                  </span>
                )}
                {item.name === "Messages" && (
                  <UnreadMessagesBadge
                    projectUuid={projectUuid}
                    collapsed={isCollapsed}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Bottom Actions */}
        <div className="p-4 mt-auto border-t border-gray-800 space-y-1">
          <Link
            href="/staff/help-center"
            className={`
                flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors
                ${isCollapsed ? "justify-center" : ""}
             `}
          >
            <Headphones size={20} className="min-w-[20px]" />
            {!isCollapsed && <span>Help Center</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <LogOut size={20} className="min-w-[20px]" />
            {!isCollapsed && <span>Log out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default CrewSidebar;
