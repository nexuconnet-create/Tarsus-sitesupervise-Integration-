"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Building2 } from "lucide-react";
import { useMemberships } from "@/lib/hooks/useMemberships";

interface OrgSwitcherProps {
  currentOrg: string;
}

export function OrgSwitcher({ currentOrg }: OrgSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { getOrgs, getOrg } = useMemberships();

  const orgs = getOrgs();
  const currentOrgData = getOrg(currentOrg);

  const handleSelectOrg = (orgSlug: string) => {
    setIsOpen(false);
    router.push(`/${orgSlug}/projects`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        <Building2 size={18} className="text-[#021422]" />
        <span className="font-medium text-gray-900">
          {currentOrgData?.org || currentOrg}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-2">
            {orgs.map((org) => (
              <button
                key={org.org_slug}
                onClick={() => handleSelectOrg(org.org_slug)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition ${
                  org.org_slug === currentOrg ? "bg-blue-50 text-[#021422]" : "text-gray-700"
                }`}
              >
                <p className="font-medium">{org.org}</p>
                <p className="text-xs text-gray-500">
                  {org.is_admin ? "Administrator" : "Member"}
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default OrgSwitcher;
