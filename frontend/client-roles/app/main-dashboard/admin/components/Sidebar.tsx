"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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

const adminSidebarItems = [
  {
    name: "Dashboard",
    icon: LayoutGrid,
    href: "/main-dashboard/admin",
  },
  {
    name: "Users",
    icon: Users,
    href: "/main-dashboard/admin/users",
  },
  {
    name: "Invitations",
    icon: Mail,
    href: "/main-dashboard/admin/invitations",
  },
  {
    name: "Projects",
    icon: FolderOpen,
    href: "/main-dashboard/admin/projects",
  },
  {
    name: "Procurement",
    icon: ShoppingCart,
    href: "/main-dashboard/admin/procurement",
  },
  {
    name: "Activity Logs",
    icon: Activity,
    href: "/main-dashboard/admin/activity-logs",
  },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const [isDigitalEyeOpen, setIsDigitalEyeOpen] = useState(true);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

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
          x: isMobileOpen ? 0 : 0,
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

        {/* Dashboard Header */}
        <div
          className={`px-6 mb-6 overflow-hidden transition-all duration-300 ${
            isCollapsed ? "opacity-0 h-0" : "opacity-100"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-blue-400" />
            <p className="text-sm text-gray-400">
              Organisation Admin Dashboard
            </p>
          </div>
          <div className="h-px bg-gray-700 w-full" />
        </div>

        <div
          className={`px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
            isCollapsed ? "text-center" : ""
          }`}
        >
          {!isCollapsed && "Main Menu"}
          {isCollapsed && "..."}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
          {adminSidebarItems.map((item) => {
            const isActive = pathname === item.href;

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
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
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
          <div>
            <button
              onClick={() => setIsDigitalEyeOpen((open) => !open)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group text-gray-400 hover:text-white hover:bg-white/5 ${isCollapsed ? "justify-center" : "justify-between"}`}
            >
              <span className="flex items-center gap-3"><HardHat size={20} className="min-w-[20px]" />{!isCollapsed && <span className="text-sm uppercase tracking-tight">Digital Eye</span>}</span>
              {!isCollapsed && <ChevronDown size={16} className={`transition-transform ${isDigitalEyeOpen ? "rotate-180" : ""}`} />}
            </button>
            {isDigitalEyeOpen && !isCollapsed && <div className="pl-6 space-y-1 mb-1">
              <Link href="/main-dashboard/admin/devices" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5"><HardHat size={16}/>DEVICES</Link>
              <Link href="/main-dashboard/admin/remote-assist" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5"><Video size={16}/>REMOTE ASSIST</Link>
            </div>}
          </div>
          <Link
            href="/main-dashboard/admin/settings"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${pathname === "/main-dashboard/admin/settings" ? "bg-white/10 text-white font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"} ${isCollapsed ? "justify-center" : ""}`}
          >
            <Settings size={20} className="min-w-[20px]" />
            {!isCollapsed && <span className="text-sm uppercase tracking-tight">Settings</span>}
          </Link>
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
            {!isCollapsed && <span className="text-sm">Help Center</span>}
          </Link>
          <Link
            href="/"
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <LogOut size={20} className="min-w-[20px]" />
            {!isCollapsed && <span className="text-sm">Exit demo</span>}
          </Link>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
