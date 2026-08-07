"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Building2,
  Calendar1,
  History,
  ChartNoAxesCombined,
  Drill,
  Settings2,
  Shield,
  Package,
} from "lucide-react";
import Image from "next/image";

const sidebarItems = [
  {
    name: "Crew Dashboard",
    icon: LayoutGrid,
    href: "/main-dashboard/site-supervisor/dashboard",
  },
  {
    name: "Task Details",
    icon: ClipboardList,
    href: "/main-dashboard/site-supervisor/task-details",
  },
  {
    name: "Schedule planner",
    icon: Calendar1,
    href: "/main-dashboard/site-supervisor/schedule-planner",
  },
  {
    name: "Time & Attendance",
    icon: CalendarCheck,
    href: "/main-dashboard/site-supervisor/attendance",
  },
  {
    name: "Real Time Tracking",
    icon: History,
    href: "/main-dashboard/site-supervisor/real-time-tracking",
  },
  {
    name: "Messages",
    icon: MessageCircle,
    href: "/main-dashboard/site-supervisor/messages",
  },
  {
    name: "Conference",
    icon: Users,
    href: "/main-dashboard/site-supervisor/conference",
  },
  {
    name: "Performance Analytics",
    icon: ChartNoAxesCombined,
    href: "/main-dashboard/site-supervisor/performance-analytics",
  },
  {
    name: "Skills & Certifications",
    icon: ShieldCheck,
    href: "/main-dashboard/site-supervisor/skills",
  },
  {
    name: "Reassignment Engine",
    icon: Drill,
    href: "/main-dashboard/site-supervisor/reassignment-engine",
  },
  { name: "Safety", icon: Shield, href: "/main-dashboard/site-supervisor/safety" },
  {
    name: "Inventory",
    icon: Package,
    href: "/main-dashboard/site-supervisor/inventory-update",
  },
  {
    name: "Crew Settings",
    icon: Settings2,
    href: "/main-dashboard/site-supervisor/crew-settings",
  },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

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
          x: isMobileOpen ? 0 : 0, // Handle collision with mobile logic if needed
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

        {/* User / Dashboard Header */}
        <div
          className={`px-6 mb-6 overflow-hidden ${isCollapsed ? "opacity-0 h-0" : "opacity-100"}`}
        >
          <p className="text-sm text-gray-400 mb-2">Site Supervisor</p>
          <div className="h-px bg-gray-700 w-full" />
        </div>

        <div
          className={`px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isCollapsed ? "text-center" : ""}`}
        >
          {isCollapsed ? "..." : "Main Menu"}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)} // Close on mobile click
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group
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

export default Sidebar;
