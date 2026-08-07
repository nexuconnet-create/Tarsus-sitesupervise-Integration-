"use client";

import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Home,
  LogOut,
  Settings,
  Users,
  X,
  Briefcase,
  DollarSign,
  FileText,
  MessageSquare,
  Scan
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { clearAuthTokens } from "../../lib/authUtils";
import { authService } from "../../lib/services";

interface SidebarChild {
  label: string;
  href: string;
}

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  children?: SidebarChild[];
}

interface ClientSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  orgSlug?: string;
  projectSlug?: string;
}

export default function ClientSidebar({
  isMobileOpen = false,
  onMobileClose,
  orgSlug = "",
  projectSlug = "",
}: ClientSidebarProps) {
  return (
    <Suspense fallback={<div className="w-64 bg-[#021422] text-white h-screen"></div>}>
      <ClientSidebarContent
        isMobileOpen={isMobileOpen}
        onMobileClose={onMobileClose}
        orgSlug={orgSlug}
        projectSlug={projectSlug}
      />
    </Suspense>
  );
}

function ClientSidebarContent({
  isMobileOpen = false,
  onMobileClose,
  orgSlug = "",
  projectSlug = "",
}: ClientSidebarProps) {
  const searchParams = useSearchParams();
  const clientType = searchParams?.get("clientType") || "Client";
  const pathname = usePathname() || "/";
  
  let rolePath = 'client';
  if (pathname?.includes('/private-individual')) rolePath = 'private-individual';
  else if (pathname?.includes('/government-agencies')) rolePath = 'government-agencies';
  else if (pathname?.includes('/executive-developers')) rolePath = 'executive-developers';
  
  const base = orgSlug && projectSlug
    ? `/${orgSlug}/projects/${projectSlug}/${rolePath}`
    : `/main-dashboard/${rolePath}`;

  const querySuffix = searchParams?.get("clientType") ? `?clientType=${encodeURIComponent(searchParams.get("clientType")!)}` : "";

  const defaultSidebarItems: SidebarItem[] = [
    {
      icon: <Home className="w-4 h-4" />,
      label: "DASHBOARD",
      children: [
        { label: "LIVE SITE VIEW", href: `${base}/live-site-view` },
        { label: "PROGRESS TIMELINE", href: `${base}/timeline` },
        { label: "AR WALKTHROUGH", href: `${base}/ar-walkthrough` }, // Keeping existing AR route
      ],
    },
    {
      icon: <Briefcase className="w-4 h-4" />,
      label: "PROJECT",
      children: [
        { label: "PROJECT OVERVIEW", href: `${base}/project/overview` },
        { label: "PROJECT SCHEDULE", href: `${base}/project/schedule` },
        { label: "PROGRESS REPORTS", href: `${base}/project/reports` },
        { label: "SITE PHOTOS & VIDEOS", href: `${base}/project/media` },
      ],
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: "FINANCIAL",
      children: [
        { label: "BUDGET & COST", href: `${base}/financial/budget` },
        { label: "INVOICES", href: `${base}/financial/invoices` },
        { label: "PAYMENTS", href: `${base}/financial/payments` },
        { label: "FINANCIAL REPORTS", href: `${base}/financial/reports` },
        { label: "FINANCIAL STATUS", href: `${base}/financial-status` }, // Keeping existing
      ],
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "DOCUMENTS",
      children: [
        { label: "ALL DOCUMENTS", href: `${base}/documents/all` },
        { label: "CONTRACTS", href: `${base}/documents/contracts` },
        { label: "DRAWINGS & PLANS", href: `${base}/documents/drawings` },
        { label: "REPORTS", href: `${base}/documents/reports` },
      ],
    },
    {
      icon: <MessageSquare className="w-4 h-4" />,
      label: "COMMUNICATION",
      children: [
        { label: "MESSAGES", href: `${base}/communication/messages` },
        { label: "MEETINGS", href: `${base}/communication/meetings` },
        { label: "NOTIFICATIONS", href: `${base}/communication/notifications` },
        { label: "MEETING SCHEDULE (LEGACY)", href: `${base}/meeting-schedule` }, // Keeping existing
        { label: "MEETING (LEGACY)", href: `${base}/meeting` }, // Keeping existing
      ],
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: "TEAM",
      children: [
        { label: "PROJECT TEAM", href: `${base}/team/project-team` },
        { label: "VENDORS", href: `${base}/team/vendors` },
        { label: "CONTACT DIRECTORY", href: `${base}/team/directory` },
      ],
    },
    {
      icon: <Settings className="w-4 h-4" />,
      label: "SETTINGS",
      children: [
        { label: "PROFILE", href: `${base}/settings/profile` },
        { label: "NOTIFICATIONS", href: `${base}/settings/notifications` },
        { label: "SECURITY", href: `${base}/settings/security` },
      ],
    },
  ];

  const privateIndividualItems: SidebarItem[] = [
    {
      icon: <Home className="w-4 h-4" />,
      label: "DASHBOARD",
      children: [
        { label: "LIVE SITE VIEW", href: `${base}/live-site-view` },
        { label: "MY PROPERTY PROGRESS", href: `${base}/project/overview` },
        { label: "CONSTRUCTION PHOTOS", href: `${base}/project/media` },
        { label: "KEY MILESTONES", href: `${base}/timeline` },
      ],
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: "INVESTMENT",
      children: [
        { label: "PAYMENT SCHEDULE", href: `${base}/financial/payments` },
        { label: "INVESTMENT SUMMARY", href: `${base}/financial/reports` },
        { label: "FINANCIAL REPORTS", href: `${base}/documents/reports` },
      ],
    },
    {
      icon: <MessageSquare className="w-4 h-4" />,
      label: "COMMUNICATION",
      children: [
        { label: "CHAT WITH PM", href: `${base}/communication/messages` },
        { label: "DOCUMENT REQUESTS", href: `${base}/documents/all` },
        { label: "SITE VISIT SCHEDULE", href: `${base}/meeting-schedule` },
      ],
    },
    {
      icon: <Settings className="w-4 h-4" />,
      label: "SETTINGS",
      children: [
        { label: "PROFILE", href: `${base}/settings/profile` },
        { label: "NOTIFICATION PREFERENCES", href: `${base}/settings/notifications` },
        { label: "SECURITY", href: `${base}/settings/security` },
      ],
    },
  ];

  const governmentAgencyItems: SidebarItem[] = [
    {
      icon: <Home className="w-4 h-4" />,
      label: "DASHBOARD",
      children: [
        { label: "LIVE SITE VIEW", href: `${base}/live-site-view` },
        { label: "COMPLIANCE DASHBOARD", href: `${base}/project/overview` },
        { label: "INSPECTION REPORTS", href: `${base}/documents/reports` },
        { label: "ACTIVE PROJECTS", href: `${base}/project/schedule` },
      ],
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "REGULATORY",
      children: [
        { label: "APPROVALS", href: `${base}/regulatory/approvals` },
        { label: "COMPLIANCE ISSUES", href: `${base}/regulatory/issues` },
        { label: "COMPLIANCE ANALYTICS", href: `${base}/regulatory/analytics` },
      ],
    },
    {
      icon: <Scan className="w-4 h-4" />,
      label: "TERSUS S1 SCANNER",
      children: [
        { label: "SCAN INGESTION LOGS", href: `${base}/tersus/ingestion-logs` },
        { label: "3DGS & LIDAR VIEWER", href: `${base}/tersus/viewer` },
        { label: "BIM DEVIATION ANALYSIS", href: `${base}/tersus/bim-comparison` },
        { label: "QC DASHBOARD", href: `${base}/tersus/qc-dashboard` },
      ],
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "DOCUMENTS",
      children: [
        { label: "APPROVED PLANS", href: `${base}/documents/drawings` },
        { label: "INSPECTION REPORTS", href: `${base}/documents/reports` },
        { label: "REGULATORY ARCHIVE", href: `${base}/documents/all` },
      ],
    },
    {
      icon: <Settings className="w-4 h-4" />,
      label: "SETTINGS",
      children: [
        { label: "AGENCY PROFILE", href: `${base}/settings/profile` },
        { label: "NOTIFICATION PREFERENCES", href: `${base}/settings/notifications` },
        { label: "SECURITY", href: `${base}/settings/security` },
      ],
    },
  ];

  const executiveDeveloperItems: SidebarItem[] = [
    {
      icon: <Home className="w-4 h-4" />,
      label: "DASHBOARD",
      children: [
        { label: "LIVE SITE VIEW", href: `${base}/live-site-view` },
        { label: "PORTFOLIO DASHBOARD", href: `${base}/project/overview` },
        { label: "FINANCIAL OVERVIEW", href: `${base}/financial/budget` },
        { label: "PERFORMANCE TRENDS", href: `${base}/timeline` },
      ],
    },
    {
      icon: <Briefcase className="w-4 h-4" />,
      label: "PROJECTS",
      children: [
        { label: "ACTIVE PROJECTS", href: `${base}/project/schedule` },
        { label: "PROJECT ANALYTICS", href: `${base}/project/reports` },
        { label: "CREATE PROJECT", href: `${base}/project/create` },
      ],
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: "PROCUREMENT",
      children: [
        { label: "VENDOR MANAGEMENT", href: `${base}/team/vendors` },
        { label: "VENDOR PERFORMANCE", href: `${base}/team/vendor-performance` },
        { label: "PROCUREMENT DASHBOARD", href: `${base}/procurement` },
      ],
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "EXECUTIVE",
      children: [
        { label: "BOARD REPORTS", href: `${base}/documents/reports` },
        { label: "FINANCIAL REPORTS", href: `${base}/financial/reports` },
        { label: "EXECUTIVE ALERTS", href: `${base}/communication/notifications` },
      ],
    },
    {
      icon: <Settings className="w-4 h-4" />,
      label: "SETTINGS",
      children: [
        { label: "PROFILE", href: `${base}/settings/profile` },
        { label: "NOTIFICATION PREFERENCES", href: `${base}/settings/notifications` },
        { label: "SECURITY", href: `${base}/settings/security` },
      ],
    },
  ];

  const sidebarItems = 
    clientType === "Private-Individual" ? privateIndividualItems : 
    clientType === "Government Agency" ? governmentAgencyItems : 
    clientType === "Executive Developer" ? executiveDeveloperItems :
    defaultSidebarItems;

  // open all collapses by default
  const initialExpanded = sidebarItems.map((i) => i.label);
  const [expandedItems, setExpandedItems] = useState<string[]>(initialExpanded);
  const router = useRouter();

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

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          w-64 bg-[#021422] text-white h-full min-h-screen overflow-y-auto
          fixed md:relative inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg md:hidden transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Section */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center">
              <Image
                src="https://res.cloudinary.com/depeqzb6z/image/upload/v1769842703/logo_variant_csswfr.png"
                alt="Site Supervise Logo"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-bold uppercase">{clientType} DASHBOARD</div>
        </div>

        <div className="p-4">
          <div className="text-xs text-slate-400 mb-4">MAIN MENU</div>

          {sidebarItems.map((item) => (
            <div key={item.label} className="mb-2">
              {(() => {
                const parentActive = item.children
                  ? item.children.some(
                    (c) => pathname === c.href || pathname.startsWith(c.href),
                  )
                  : pathname === "/admin" || pathname === "/";

                return (
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={`w-full flex items-center justify-between p-2 text-nowrap text-sm rounded transition-colors ${parentActive ? "bg-white/10" : "hover:bg-white/10"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="text-xs">{item.label}</span>
                    </div>
                    {item.children &&
                      item.children.length > 0 &&
                      (expandedItems.includes(item.label) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      ))}
                  </button>
                );
              })()}

              {expandedItems.includes(item.label) && item.children && (
                <div className="ml-6 mt-1">
                  {item.children.map((child) => {
                    const isActive =
                      pathname === child.href ||
                      pathname.startsWith(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={`${child.href}${querySuffix}`}
                        className={`block w-full text-left p-2 text-xs rounded transition-colors ${isActive
                            ? "bg-white/10 text-white"
                            : "text-gray-400 hover:bg-white/10"
                          }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="absolute1 bottom-0 w-full p-4 border-t border-gray-800">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-2 text-sm hover:bg-white/10 p-2 rounded transition-colors w-full"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help Center</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm hover:bg-white/10 p-2 rounded transition-colors w-full mt-2 text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
