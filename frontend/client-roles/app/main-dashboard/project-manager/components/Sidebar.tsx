"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { authService } from "@/lib/services";
import { clearAuthTokens } from "@/lib/authUtils";

import {
  LayoutDashboard,
  BarChart2,
  Cpu,
  Users,
  ShoppingCart,
  FolderOpen,
  ShieldCheck,
  FileText,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  Headphones,
  Video,
  MessageCircle,
  Monitor,
  Store,
  Inbox,
  Truck,
  RefreshCw,
  Scale,
  Calendar,
  ListTodo,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileSearch,
  FileArchive,
  UserCog,
  Lock,
  Briefcase,
  Target,
  Activity,
  Globe,
  PieChart,
} from "lucide-react";

const sidebarSections = [
  {
    label: "DASHBOARD",
    items: [
      { name: "Executive Dashboard", icon: LayoutDashboard, href: "/main-dashboard/project-manager" },
      { name: "EVM Performance", icon: BarChart2, href: "/main-dashboard/project-manager/evm" },
      { name: "Financial Dashboard", icon: PieChart, href: "/main-dashboard/project-manager/financial-command" },
    ],
  },
  {
    label: "AI & INTELLIGENCE",
    items: [
      { name: "AI Document Assistant", icon: FileText, href: "/main-dashboard/project-manager/document-command/ai-assistant" },
      { name: "AI Strategist", icon: Cpu, href: "/main-dashboard/project-manager/ai-strategist" },
      { name: "Virtual Site", icon: Globe, href: "/main-dashboard/project-manager/virtual-site" },
    ],
  },
  {
    label: "COLLABORATION",
    items: [
      { name: "Video Conferencing", icon: Video, href: "/main-dashboard/project-manager/conference" },
      { name: "Messaging", icon: MessageCircle, href: "/main-dashboard/project-manager/messages" },
      { name: "Remote Assist", icon: Monitor, href: "/main-dashboard/project-manager/remote-assist" },
    ],
  },
  {
    label: "PROCUREMENT",
    items: [
      { name: "Vendor Directory", icon: Store, href: "/main-dashboard/project-manager/vendors" },
      { name: "My Requisitions", icon: Inbox, href: "/main-dashboard/project-manager/vendors/requisitions" },
      { name: "Purchase Orders", icon: ShoppingCart, href: "/main-dashboard/project-manager/vendors/purchase-orders" },
      { name: "Vendor Deliveries", icon: Truck, href: "/main-dashboard/project-manager/vendors/deliveries" },
      { name: "Change Orders", icon: RefreshCw, href: "/main-dashboard/project-manager/vendors/change-orders" },
      { name: "Dispute Management", icon: Scale, href: "/main-dashboard/project-manager/vendors/disputes" },
    ],
  },
  {
    label: "Project",
    items: [
      { name: "Schedule Planner", icon: Calendar, href: "/main-dashboard/project-manager/schedule" },
      { name: "Task Details", icon: ListTodo, href: "/main-dashboard/project-manager/tasks" },
      { name: "Progress Tracking", icon: TrendingUp, href: "/main-dashboard/project-manager/progress" },
    ],
  },
  {
    label: "Risk & Compliance",
    items: [
      { name: "Risk Intelligence", icon: AlertTriangle, href: "/main-dashboard/project-manager/risk-intelligence" },
      { name: "Compliance", icon: CheckCircle, href: "/main-dashboard/project-manager/compliance" },
      { name: "Audit Trail", icon: FileSearch, href: "/main-dashboard/project-manager/audit-trail" },
    ],
  },
  {
    label: "Documents",
    items: [
      { name: "Document Dashboard", icon: LayoutDashboard, href: "/main-dashboard/project-manager/document-command" },
      { name: "Document Archive", icon: FileArchive, href: "/main-dashboard/project-manager/document-command/archive" },
    ],
  },
  {
    label: "Stakeholders",
    items: [
      { name: "Stakeholder Hub", icon: Users, href: "/main-dashboard/project-manager/stakeholder-hub" },
      { name: "Communications", icon: MessageCircle, href: "/main-dashboard/project-manager/stakeholder-hub/communications" },
      { name: "Engagement Analytics", icon: Activity, href: "/main-dashboard/project-manager/stakeholder-hub/analytics" },
    ],
  },
  {
    label: "Settings",
    items: [
      { name: "PM Settings", icon: Settings, href: "/main-dashboard/project-manager/settings" },
      { name: "User Management", icon: UserCog, href: "/main-dashboard/project-manager/user-management" },
      { name: "Security", icon: Lock, href: "/main-dashboard/project-manager/security" },
    ],
  },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["DASHBOARD"]);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const toggleExpandSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
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

  const isActive = (href: string) => pathname === href;
  const isSectionActive = (items: { href: string }[]) => items.some((item) => pathname === item.href);

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
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${isCollapsed ? "-rotate-90" : "rotate-90"}`}
          />
        </button>

        {/* Logo Section */}
        <div className="p-4 flex items-center justify-center min-h-[70px]">
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
                width={180}
                height={180}
                className="object-contain"
              />
            </div>
          )}
        </div>

        {/* User / Dashboard Header */}
        <div
          className={`px-4 mb-4 overflow-hidden transition-all duration-300 ${isCollapsed ? "opacity-0 h-0" : "opacity-100"}`}
        >
          <p className="text-xs text-gray-400 mb-2">
            Project Manager Dashboard
          </p>
          <div className="h-px bg-gray-700 w-full" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1">
          {sidebarSections.map((section) => {
            const sectionActive = isSectionActive(section.items);
            const isExpanded = expandedSections.includes(section.label);

            const SectionIcon = section.items[0].icon;
            return (
              <div key={section.label}>
                {/* Section Header */}
                <button
                  onClick={() => toggleExpandSection(section.label)}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group text-left
                    ${sectionActive ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}
                    ${isCollapsed ? "justify-center" : "justify-between"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <SectionIcon
                      size={18}
                      className={`min-w-[18px] ${sectionActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                    />
                    {!isCollapsed && (
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {section.label}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {/* Sub Items */}
                <AnimatePresence>
                  {isExpanded && !isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5 pl-4 mb-1">
                        {section.items.map((item) => {
                          const active = isActive(item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={`
                                flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors group text-xs
                                ${active ? "bg-white/15 text-white font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"}
                              `}
                            >
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <item.icon
                                  size={14}
                                  className={`flex-shrink-0 ${active ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                                />
                                <span className="whitespace-nowrap overflow-hidden text-[11px] uppercase tracking-tight">
                                  {item.name}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Footer / Bottom Actions */}
        <div className="p-3 mt-auto border-t border-gray-800 space-y-1">
          <Link
            href="/staff/help-center"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <Headphones size={18} className="min-w-[18px]" />
            {!isCollapsed && <span className="text-xs">Help Center</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <LogOut size={18} className="min-w-[18px]" />
            {!isCollapsed && <span className="text-xs">Log out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Tab Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#021422] border-t border-gray-800 z-50">
        <div className="flex justify-around items-center py-2 px-1">
          {[
            { name: "Dashboard", icon: LayoutDashboard, href: "/main-dashboard/project-manager" },
            { name: "EVM", icon: BarChart2, href: "/main-dashboard/project-manager/evm" },
            { name: "AI", icon: Cpu, href: "/main-dashboard/project-manager/ai-strategist" },
            { name: "Procurement", icon: ShoppingCart, href: "/main-dashboard/project-manager/vendors" },
            { name: "Settings", icon: Settings, href: "/main-dashboard/project-manager/settings" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                isActive(item.href) ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <item.icon size={18} />
              <span className="text-[9px] font-bold uppercase tracking-wider">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
