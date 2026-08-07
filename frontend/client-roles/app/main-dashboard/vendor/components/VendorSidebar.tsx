"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { authService } from "@/lib/services";
import { clearAuthTokens } from "@/lib/authUtils";
import { MOCK_NOTIFICATIONS } from "@/lib/mockData/vendorNotifications";

import {
  LayoutGrid,
  Inbox,
  ShoppingCart,
  RefreshCw,
  Package,
  User,
  MessageCircle,
  LogOut,
  Menu,
  ChevronLeft,
  Headphones,
  Truck,
  Bell,
  FileText,
  Scale,
} from "lucide-react";

function NairaIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20V4" />
      <path d="M4 4L14 16V4" />
      <path d="M14 4V20" />
      <path d="M20 4V20" />
      <path d="M2 12H22" />
    </svg>
  );
}

const vendorSidebarItems = [
  {
    name: "DASHBOARD",
    icon: LayoutGrid,
    href: "/main-dashboard/vendor",
  },
  {
    name: "REQUISITIONS INBOX",
    icon: Inbox,
    href: "/main-dashboard/vendor/requisitions",
  },
  {
    name: "PURCHASE ORDERS",
    icon: ShoppingCart,
    href: "/main-dashboard/vendor/purchase-orders",
  },
  {
    name: "INVOICES",
    icon: FileText,
    href: "/main-dashboard/vendor/invoices",
  },
  {
    name: "CHANGE ORDERS",
    icon: RefreshCw,
    href: "/main-dashboard/vendor/change-orders",
  },
  {
    name: "DELIVERIES",
    icon: Truck,
    href: "/main-dashboard/vendor/deliveries",
  },
  {
    name: "NOTIFICATIONS",
    icon: Bell,
    href: "/main-dashboard/vendor/notifications",
  },
  {
    name: "DISPUTES",
    icon: Scale,
    href: "/main-dashboard/vendor/disputes",
  },
  {
    name: "PAYOUTS",
    icon: NairaIcon,
    href: "/main-dashboard/vendor/payouts",
  },
  {
    name: "STOCK MANAGEMENT",
    icon: Package,
    href: "/main-dashboard/vendor/stock",
  },
  {
    name: "PROFILE",
    icon: User,
    href: "/main-dashboard/vendor/profile",
  },
  {
    name: "MESSAGES",
    icon: MessageCircle,
    href: "/main-dashboard/vendor/messages",
  },
];

const VendorSidebar = () => {
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
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-[#0D1B2A] text-white rounded-md"
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
          fixed md:relative z-40 h-screen bg-[#0D1B2A] text-white flex flex-col font-sans border-r border-gray-800
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Toggle Button (Desktop) */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-20 bg-[#0D1B2A] border border-gray-700 rounded-full p-1 text-white hover:bg-gray-800 transition-colors z-50"
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
          <p className="text-sm text-gray-400 mb-2">
            Vendor Dashboard (Nexucon)
          </p>
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
          {vendorSidebarItems.map((item) => {
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
                {item.name === "NOTIFICATIONS" && (
                  <span
                    className={`ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ${isCollapsed ? "" : ""}`}
                  >
                    {MOCK_NOTIFICATIONS.filter((n) => !n.read).length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Bottom Actions */}
        <div className="p-4 mt-auto border-t border-gray-800 space-y-1">
          <Link
            href="/help"
            className={`
              flex items-center gap-3 px-3 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <Headphones size={20} className="min-w-[20px]" />
            {!isCollapsed && <span className="text-sm">Help Center</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <LogOut size={20} className="min-w-[20px]" />
            {!isCollapsed && <span className="text-sm">Log out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default VendorSidebar;
