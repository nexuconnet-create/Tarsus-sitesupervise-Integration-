"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Calendar,
  Users,
  ClipboardList,
  Radio,
  Shield,
  FileText,
  BarChart3,
  Settings,
  Menu,
  MapPin,
} from "lucide-react";

interface ProjectSidebarProps {
  orgSlug: string;
  projectSlug: string;
  role: string;
}

const crewManagerNavItems = (orgSlug: string, projectSlug: string) => [
  { name: "Dashboard", icon: LayoutGrid, href: `/${orgSlug}/projects/${projectSlug}/site-supervisor` },
  { name: "Schedule Planner", icon: Calendar, href: `/${orgSlug}/projects/${projectSlug}/site-supervisor/schedule-planner` },
  { name: "Task Details", icon: ClipboardList, href: `/${orgSlug}/projects/${projectSlug}/site-supervisor/task-details` },
  { name: "Real-time Tracking", icon: Radio, href: `/${orgSlug}/projects/${projectSlug}/site-supervisor/real-time-tracking` },
  { name: "Attendance", icon: Users, href: `/${orgSlug}/projects/${projectSlug}/site-supervisor/attendance` },
  { name: "Safety", icon: Shield, href: `/${orgSlug}/projects/${projectSlug}/site-supervisor/safety` },
  { name: "Skills & Certs", icon: FileText, href: `/${orgSlug}/projects/${projectSlug}/site-supervisor/skills` },
  { name: "Performance", icon: BarChart3, href: `/${orgSlug}/projects/${projectSlug}/site-supervisor/performance-analytics` },
  { name: "Location", icon: MapPin, href: `/${orgSlug}/projects/${projectSlug}/location` },
];

export function ProjectSidebar({ orgSlug, projectSlug, role }: ProjectSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = crewManagerNavItems(orgSlug, projectSlug);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
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

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? "80px" : "280px",
        }}
        className="fixed left-0 top-0 h-screen bg-[#021422] text-white z-40 transition-colors duration-300 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg">Crew Manager</h1>
              <p className="text-xs text-gray-400 capitalize">{role}</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition group ${
                      isActive
                        ? "bg-[#0070D4] text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon size={22} />
                    {!isCollapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </motion.aside>
    </>
  );
}

export default ProjectSidebar;
