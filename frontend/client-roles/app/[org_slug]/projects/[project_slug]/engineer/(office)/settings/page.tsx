"use client";

import {
  User,
  ChevronRight,
  Play,
  FolderOpen,
  Target,
} from "lucide-react";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useMemberships } from "@/lib/hooks/useMemberships";

import PersonalDetailsModal from "./components/PersonalDetailsModal";
import WorkPolicyCard from "@/components/WorkPolicyCard";

interface SectionItemProps {
    label: string;
    hasToggle?: boolean;
    hasArrow?: boolean;
    onClick?: () => void;
}

function SectionItem({ label, hasToggle, hasArrow, onClick }: SectionItemProps) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 px-2 rounded-lg transition-colors ${onClick ? 'cursor-pointer' : ''}`}
        >
            <span className="font-medium text-[#021422]">{label}</span>
            {hasToggle && (
                <div className="w-12 h-6 bg-[#021422] rounded-full relative p-1">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                </div>
            )}
            {hasArrow && <ChevronRight size={18} className="text-gray-400" />}
        </div>
    );
}
import DigitalTwinConfigModal from "./components/DigitalTwinConfigModal";
import EngineerHeader from "../components/EngineerHeader";

interface SettingsPageProps {
    params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function SettingsPage({ params }: SettingsPageProps) {
    const { org_slug, project_slug } = use(params);
    const { getProject } = useMemberships();
    const project = getProject(org_slug, project_slug);
    const [activeModal, setActiveModal] = useState<"personal" | "ar" | null>(null);
    const user = useAuthStore((s) => s.user);
    const router = useRouter();


  return (
    <div className="space-y-6 pb-20">
      <PersonalDetailsModal isOpen={activeModal === "personal"} onClose={() => setActiveModal(null)} />
      <DigitalTwinConfigModal isOpen={activeModal === "ar"} onClose={() => setActiveModal(null)} />

      <EngineerHeader 
        title={project ? (project as { name?: string }).name : project_slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        badge="SETTINGS"
      />

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 px-4" >
                {/* User Settings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col">
                    <div className="bg-[#021422] p-5 text-center">
                        <h2 className="text-white font-bold uppercase tracking-wider text-sm">USER SETTINGS</h2>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <SectionItem label="Notification" hasToggle />
                        <SectionItem label="Personal Info" onClick={() => setActiveModal("personal")} />
                        <SectionItem label="Language" hasArrow />
                        <SectionItem label="Units" hasArrow />
                        <SectionItem label="Help & Support" hasArrow />
                        <SectionItem label="About" />
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
                            <span className="font-bold text-[#021422] uppercase">PROJECT {project?.name || project_slug} (ACTIVE)</span>
                        </div>
                        <SectionItem label="Project Details" hasArrow onClick={() => router.push(`/${org_slug}/projects/${project_slug}/engineer/settings/project-details`)} />
                        <SectionItem label="User & Role Management" hasArrow />
                        <div
                            onClick={() => router.push(`/${org_slug}/projects/${project_slug}/engineer/settings/documents`)}
                            className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 px-2 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <FolderOpen size={16} className="text-[#021422]" />
                                <span className="font-medium text-[#021422]">Project Documents</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-400" />
                        </div>
                        <div
                            onClick={() => router.push(`/${org_slug}/projects/${project_slug}/engineer/settings/milestones`)}
                            className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 px-2 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Target size={16} className="text-[#021422]" />
                                <span className="font-medium text-[#021422]">Milestones</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-400" />
                        </div>

                        <div className="mt-4">
                            <span className="font-bold text-[#021422] px-2">Notification Rule</span>
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
                        <SectionItem label="Integration & API" />
                        <SectionItem label="Data & Backup Management" hasArrow />
                        <SectionItem label="Billing & Subscription" hasArrow />
                    </div>
                </div>
            </div>

            {/* Work Policy */}
            <div className="px-4">
                <div className="mb-4">
                    <span className="font-bold text-[#021422] uppercase">Work Policy</span>
                </div>
                <WorkPolicyCard orgSlug={org_slug} />
            </div>
        </div>
    );
}
