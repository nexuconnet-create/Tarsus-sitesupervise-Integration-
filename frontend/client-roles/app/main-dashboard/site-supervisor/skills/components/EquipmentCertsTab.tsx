"use client";

import React from "react";
import { Truck, AlertTriangle, XCircle, CheckCircle2, Wrench } from "lucide-react";
import type { EquipmentCertification } from "@/lib/mockData/skills";

interface EquipmentCertsTabProps {
  certifications: EquipmentCertification[];
  onEdit?: (cert: EquipmentCertification) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Crane: <Truck size={16} />,
  "Heavy Machinery": <Wrench size={16} />,
  "Construction Equipment": <Wrench size={16} />,
  "Power Tools": <Wrench size={16} />,
  default: <Truck size={16} />,
};

export default function EquipmentCertsTab({ certifications, onEdit }: EquipmentCertsTabProps) {
  const getStatusBadge = (status: string) => {
    if (status === "expired") {
      return { color: "bg-red-100 text-red-700", icon: XCircle, label: "Expired" };
    }
    if (status === "expiring") {
      return { color: "bg-gray-100 text-gray-700", icon: AlertTriangle, label: "Expiring Soon" };
    }
    return { color: "bg-gray-100 text-gray-700", icon: CheckCircle2, label: "Valid" };
  };

  const groupedByCategory = certifications.reduce((acc, cert) => {
    const cat = cert.equipmentCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(cert);
    return acc;
  }, {} as Record<string, EquipmentCertification[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedByCategory).map(([category, certs]) => (
        <div key={category} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-[#021422] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              {categoryIcons[category] || categoryIcons.default}
              <span className="font-bold text-sm uppercase tracking-wider">{category}</span>
            </div>
            <span className="text-xs font-semibold">{certs.length} cert{certs.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="divide-y divide-gray-100">
            {certs.map((cert) => {
              const badge = getStatusBadge(cert.status);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={cert.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onEdit?.(cert)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#021422]">{cert.equipmentName}</span>
                        <span className="text-xs text-gray-400">({cert.equipmentId})</span>
                      </div>
                      <p className="text-sm text-gray-700">{cert.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Issued: {cert.issueDate}</span>
                        <span>Expires: {cert.expiryDate}</span>
                        <span>{cert.issuingBody}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${badge.color}`}>
                      <BadgeIcon size={12} />
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {certifications.length === 0 && (
        <div className="text-center py-12">
          <Truck size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No equipment certifications recorded</p>
        </div>
      )}
    </div>
  );
}
