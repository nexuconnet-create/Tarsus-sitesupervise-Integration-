"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
  LogOut,
  Menu,
  ChevronLeft,
  ChevronDown,
  Building2,
  Headphones,
  FileText,
  FileCheck,
  Briefcase,
  Search,
  Zap,
  Share2,
  Settings as SettingsIcon,
  Store,
  ShoppingCart,
  RefreshCw,
  Truck,
  PackageCheck,
  Video,
  Scan,
  Wallet,
} from "lucide-react";
import { useEffect } from "react";
import { inventoryService } from "@/lib/services/inventoryService";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import ProjectSwitcher from "@/components/ProjectSwitcher";
import UnreadMessagesBadge from "@/components/messaging/UnreadMessagesBadge";

interface SidebarProps {
  orgSlug: string;
  projectSlug: string;
}

const Sidebar = ({ orgSlug, projectSlug }: SidebarProps) => {
  const base = `/${orgSlug}/projects/${projectSlug}/project-manager`;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { data: projectUuid } = useProjectUuid(orgSlug, projectSlug);

  useEffect(() => {
    if (!projectUuid) return;
    inventoryService.listMaterialRequests(projectUuid, { status: "pending" })
      .then(res => setPendingRequestCount(res.data?.count ?? 0))
      .catch(() => {});
  }, [projectUuid]);

  const docCommandSubItems = [
    {
      name: "DOCUMENT DASHBOARD (Home)",
      icon: LayoutGrid,
      href: `${base}/document-command`,
      badge: 0,
    },
    {
      name: "CONTRACT MANAGEMENT",
      icon: Briefcase,
      href: `${base}/document-command/contracts`,
      badge: 0,
    },
    {
      name: "CHANGE ORDER CONTROL",
      icon: FileText,
      href: `${base}/document-command/change-orders`,
      badge: 0,
    },
    {
      name: "APPROVAL WORKFLOWS",
      icon: FileCheck,
      href: `${base}/document-command/approvals`,
      badge: 0,
    },
    {
      name: "SEARCH & DISCOVERY",
      icon: Search,
      href: `${base}/document-command/search`,
      badge: 0,
    },
    {
      name: "AI DOCUMENT ASSISTANT",
      icon: Zap,
      href: `${base}/document-command/ai-assistant`,
      badge: 0,
    },
  ];

  const vendorSubItems = [
    {
      name: "VENDOR DIRECTORY",
      icon: Store,
      href: `${base}/vendors`,
      badge: 0,
    },
    {
      name: "MATERIAL REQUESTS",
      icon: PackageCheck,
      href: `${base}/vendors/material-requests`,
      badge: pendingRequestCount,
    },
    {
      name: "PURCHASE ORDERS",
      icon: ShoppingCart,
      href: `${base}/vendors/purchase-orders`,
      badge: 0,
    },
    {
      name: "DELIVERIES",
      icon: Truck,
      href: `${base}/vendors/deliveries`,
      badge: 0,
    },
    {
      name: "CHANGE ORDERS",
      icon: RefreshCw,
      href: `${base}/vendors/change-orders`,
      badge: 0,
    },
  ];

  const pmSidebarItems = [
    {
      name: "EXECUTIVE DASHBOARD (Home)",
      icon: LayoutGrid,
      href: `${base}`,
    },
    {
      name: "TASKS",
      icon: ClipboardList,
      href: `${base}/task-details`,
    },
    {
      name: "FINANCIAL COMMAND",
      icon: CalendarCheck,
      href: `${base}/financial-command`,
    },
    {
      name: "MISC BUDGET",
      icon: Wallet,
      href: `${base}/misc-budget`,
    },
    {
      name: "RISK INTELLIGENCE",
      icon: BarChart2,
      href: `${base}/risk-intelligence`,
    },
    {
      name: "STAKEHOLDER HUB",
      icon: Box,
      href: `${base}/stakeholder-hub`,
    },
    {
      name: "DOCUMENT COMMAND",
      icon: ShieldCheck,
      href: `${base}/document-command`,
      subItems: docCommandSubItems,
    },
    {
      name: "AI STRATEGIST",
      icon: CloudSun,
      href: `${base}/ai-strategist`,
    },
    {
      name: "VIRTUAL SITE",
      icon: FolderOpen,
      href: `${base}/virtual-site`,
    },
    {
      name: "PROCUREMENT",
      icon: Store,
      href: `${base}/vendors`,
      subItems: vendorSubItems,
    },
    {
      name: "MESSAGES",
      icon: MessageCircle,
      href: `${base}/messages`,
    },
    {
      name: "CONFERENCES",
      icon: Headphones,
      href: `${base}/conference`,
    },
    {
      name: "Digital Eye",
      icon: Scan,
      href: `${base}/remote-assist`,
      subItems: [
        {
          name: "REMOTE ASSIST",
          icon: Video,
          href: `${base}/remote-assist`,
          badge: 0,
        },
        {
          name: "QA DASHBOARD",
          icon: Scan,
          href: `${base}/qa-dashboard`,
          badge: 0,
        },
      ],
    },
    {
      name: "PM SETTINGS",
      icon: SettingsIcon,
      href: `${base}/settings`,
    },
  ];
  const sidebarItems = pmSidebarItems;

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const toggleExpandItem = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName],
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
          dashboardLabel="Project Manager Dashboard"
          collapsed={isCollapsed}
        />

        <div
          className={`px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isCollapsed ? "text-center" : ""}`}
        >
          {!isCollapsed && "Main Menu"}
          {isCollapsed && "..."}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const isExpanded = expandedItems.includes(item.name);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isSubItemActive =
              hasSubItems && item.subItems.some((sub) => pathname === sub.href);

            return (
              <div key={item.href}>
                {hasSubItems ? (
                  <>
                    {/* Expandable Item */}
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
                          <div className="space-y-1 pl-6 mb-1">
                            {item.subItems.map((subItem) => {
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
                                  {subItem.badge > 0 && (
                                    <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  /* Regular Item */
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      relative flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group
                      ${isActive ? "bg-white/10 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" : "text-gray-400 hover:text-white hover:bg-white/5"}
                      ${isCollapsed ? "justify-center" : ""}
                    `}
                  >
                    <item.icon
                      size={20}
                      className={`min-w-[20px] ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                    />
                    {!isCollapsed && (
                      <span className="whitespace-nowrap overflow-hidden text-sm uppercase tracking-tight">
                        {item.name}
                      </span>
                    )}
                    {item.name === "MESSAGES" && (
                      <UnreadMessagesBadge
                        projectUuid={projectUuid}
                        collapsed={isCollapsed}
                      />
                    )}
                  </Link>
                )}
              </div>
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

export default Sidebar;
