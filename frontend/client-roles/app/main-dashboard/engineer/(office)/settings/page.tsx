"use client";

import { ChevronRight, Play } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useMemberships } from "@/lib/hooks/useMemberships";

import PersonalDetailsModal from "./components/PersonalDetailsModal";
import DigitalTwinConfigModal from "./components/DigitalTwinConfigModal";

const SectionItem = ({
  label,
  hasToggle,
  hasArrow,
  onClick,
}: {
  label: string;
  hasToggle?: boolean;
  hasArrow?: boolean;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between py-4 px-2 rounded-lg transition-colors hover:bg-gray-50 ${onClick ? "cursor-pointer" : ""}`}
  >
    <span className="font-medium text-[#021422]">{label}</span>
    {hasToggle && (
      <div className="w-12 h-6 bg-[#021422] rounded-full relative p-1">
        <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
      </div>
    )}
    {hasArrow && <ChevronRight size={18} className="text-gray-400" />}
  </div>
);

export default function SettingsPage() {
  const [activeModal, setActiveModal] = useState<"personal" | "ar" | null>(null);
  const user = useAuthStore((s) => s.user);
  const { memberships } = useMemberships();

  const allProjects = memberships.flatMap((m) => m.projects);
  const activeProject = allProjects[0] ?? null;

  const displayName = user?.fullname || user?.name || user?.username || "Superintendent";
  const displayRole = user?.role_name || user?.role?.replace(/_/g, " ") || "Engineer";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 pb-20">
      <PersonalDetailsModal isOpen={activeModal === "personal"} onClose={() => setActiveModal(null)} />
      <DigitalTwinConfigModal isOpen={activeModal === "ar"} onClose={() => setActiveModal(null)} />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-white py-5 px-4">
        <h1 className="text-2xl font-bold text-[#021422]">Settings & Administration</h1>
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="font-semibold text-sm text-[#021422]">{displayName}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">{displayRole}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#021422] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {/* User Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col">
          <div className="bg-[#021422] p-5 text-center">
            <h2 className="text-white font-bold uppercase tracking-wider text-sm">USER SETTINGS</h2>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <SectionItem label="Notification" hasToggle />
            <SectionItem label="Personal Info" onClick={() => setActiveModal("personal")} hasArrow />
            <SectionItem label="Language" hasArrow />
            <SectionItem label="Units" hasArrow />
            <SectionItem label="Help & Support" hasArrow />
            <SectionItem label="About" hasArrow />
            <SectionItem label="Logout" hasArrow />
          </div>
        </div>

        {/* Project Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col">
          <div className="bg-[#021422] p-5 text-center">
            <h2 className="text-white font-bold uppercase tracking-wider text-sm">PROJECT SETTINGS</h2>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="py-4 text-center">
              <span className="font-bold text-[#021422] uppercase">
                PROJECT {activeProject?.name || "N/A"} (ACTIVE)
              </span>
            </div>
            <SectionItem label="Project Details" hasArrow />
            <SectionItem label="User & Role Management" hasArrow />

            <div className="mt-4 px-2">
              <span className="font-bold text-[#021422]">Notification Rule</span>
            </div>

            <div
              onClick={() => setActiveModal("ar")}
              className="mt-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[#021422]">Digital Twin & AR Config</span>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
              <div className="pl-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#021422]">
                  <Play size={12} className="fill-current" />
                  <span>3d Model Source</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#021422]">
                  <Play size={12} className="fill-current" />
                  <span>AR Site Calibration</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col">
          <div className="bg-[#021422] p-5 text-center">
            <h2 className="text-white font-bold uppercase tracking-wider text-sm">SYSTEM SETTINGS</h2>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="py-4 text-center">
              <span className="font-bold text-[#021422]">Visible only to Super-Admins</span>
            </div>
            <SectionItem label="Integration & API" hasArrow />
            <SectionItem label="Data & Backup Management" hasArrow />
            <SectionItem label="Billing & Subscription" hasArrow />
          </div>
        </div>
      </div>
    </div>
  );
}
