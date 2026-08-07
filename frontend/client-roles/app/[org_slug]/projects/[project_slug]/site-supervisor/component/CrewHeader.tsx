import React from "react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import BackButton from "@/components/BackButton";

const ROLE_ABBREVIATIONS: Record<string, string> = {
  "PROJECT ENGINEER": "PE",
  "SITE SUPERVISOR": "SS",
  "PROJECT MANAGER": "PM",
  "STRUCTURAL ENGINEER": "SE",
  "MECHANICAL ENGINEER": "ME",
  "ELECTRICAL ENGINEER": "EE",
  "CIVIL ENGINEER": "CE",
  "SAFETY OFFICER": "SO",
  "QUALITY CONTROL": "QC",
  "HSE OFFICER": "HSE",
  "CREW MANAGER": "CM",
  CLIENT: "CL",
  VENDOR: "VD",
  ADMIN: "ADM",
  ADMINISTRATOR: "ADM",
  "SITE ENGINEER": "SE",
  "QUANTITY SURVEYOR": "QS",
  ARCHITECT: "ARCH",
};

function getRoleAbbreviation(role: string): string {
  const normalized = role.replace(/_/g, " ").toUpperCase();
  return (
    ROLE_ABBREVIATIONS[normalized] ??
    role
      .replace(/_/g, " ")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
  );
}

interface CrewHeaderProps {
  title?: string;
  subtitle?: string;
  showDateTime?: boolean;
  badge?: string;
  children?: React.ReactNode;
  project?: string | null;
  showBack?: boolean;
}

export default function CrewHeader({
  title,
  subtitle,
  showDateTime = true,
  badge,
  children,
  project,
  showBack = true,
}: CrewHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const formatDateTime = (date: Date) => {
    return (
      <>
        {date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
        {" · "}
        {date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const capitalizeTitle = (str: string) => {
    return str
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const fullName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.fullname || user?.name || user?.username || "Abdulsalam";

  const rawRole = user?.role_name || user?.role || "SITE ENGINEER";
  const roleAbbr = getRoleAbbreviation(rawRole);

  const specialization = user?.specialization || "Civil Engineer";

  return (
    <div className="flex items-center justify-between bg-white py-5 px-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        {showBack && <BackButton />}
        <div className="space-y-1">
        {badge && title && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold uppercase tracking-wide text-[#021422]">
              {badge}
            </span>
            <span className="text-sm font-medium text-gray-500">
              {capitalizeTitle(title)}
            </span>
            {project && (
              <span className="text-sm font-medium text-gray-600">· {capitalizeTitle(project)}</span>
            )}
            {children && <div className="ml-auto">{children}</div>}
          </div>
        )}
        {badge && !title && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold uppercase tracking-wide text-[#021422]">
              {badge}
            </span>
            {project && (
              <span className="text-sm font-medium text-gray-600">· {capitalizeTitle(project)}</span>
            )}
            {children && <div className="ml-auto">{children}</div>}
          </div>
        )}
        {!badge && title && (
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold uppercase tracking-wide text-[#021422]">
              {capitalizeTitle(title)}
            </h1>
            {project && (
              <span className="text-sm font-medium text-gray-600"> · {capitalizeTitle(project)}</span>
            )}
          </div>
        )}
        {!badge && !title && project && (
          <h1 className="text-sm font-bold uppercase tracking-wide text-[#021422]">
            {capitalizeTitle(project)}
          </h1>
        )}

        {subtitle && (
          <p className="text-sm font-medium text-gray-600">{subtitle}</p>
        )}

        {showDateTime && (
          <p className="text-xs font-medium text-gray-500">
            {formatDateTime(now)}
          </p>
        )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-bold text-[#021422] leading-tight">
            {fullName}
            {specialization && (
              <span className="font-normal text-gray-700 italic">
                {" "}
                ({specialization})
              </span>
            )}
          </p>
          <p className="text-xs text-left font-semibold tracking-wide text-gray-900 mt-0.5">
            Role: <span className="font-normal text-gray-700">{roleAbbr}</span>
          </p>
        </div>
        <img
          src="/images/profile.jpg"
          alt="Profile"
          className="w-16 h-16 rounded-full flex-shrink-0 ring-2 ring-[#021422]/10 object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fallback = document.createElement("div");
            fallback.className =
              "w-16 h-16 rounded-full bg-[#021422] flex items-center justify-center text-white text-base font-bold flex-shrink-0 ring-2 ring-[#021422]/10";
            fallback.textContent = getInitials(fullName);
            e.currentTarget.parentElement?.appendChild(fallback);
          }}
        />
      </div>
    </div>
  );
}
