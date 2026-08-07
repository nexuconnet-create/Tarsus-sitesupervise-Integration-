"use client";

import React from "react";
import {
  AlertTriangle,
  Bell,
  Monitor,
  Globe,
  User,
} from "lucide-react";

interface PMHeaderProps {
  projectName: string;
  userName: string;
  alertCount: number;
  notificationCount: number;
}

const PMHeader: React.FC<PMHeaderProps> = ({
  projectName,
  userName,
  alertCount,
  notificationCount,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Branding + Project */}
        <div className="flex flex-col gap-1">
          <h1 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
            SITE SUPERVISE — PROJECT MANAGER DASHBOARD
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className="font-semibold text-[#021422]">{projectName}</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
              <AlertTriangle size={14} />
              {alertCount} Alert{alertCount !== 1 ? "s" : ""}
            </span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="flex items-center gap-1.5 text-blue-600 font-medium">
              <Bell size={14} />
              {notificationCount} Notif{notificationCount !== 1 ? "s" : ""}
            </span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <Monitor size={14} />
              Mobile
            </span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <Globe size={14} />
              Web
            </span>
          </div>
        </div>

        {/* Right: User */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#021422] flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-[#021422]">{userName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PMHeader;
