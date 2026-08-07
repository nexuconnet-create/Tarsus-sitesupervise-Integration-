"use client";

import React from "react";
import { Award, XCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import type { PersonnelCertification, PersonnelRole } from "@/lib/mockData/skills";

interface PersonnelCertsTabProps {
  certifications: PersonnelCertification[];
  onEdit?: (cert: PersonnelCertification) => void;
}

const roleLabels: Record<PersonnelRole, string> = {
  foreman: "Foreman",
  safety_officer: "Safety Officer",
  worker: "Worker",
  operator: "Operator",
  electrician: "Electrician",
  welder: "Welder",
};

export default function PersonnelCertsTab({ certifications, onEdit }: PersonnelCertsTabProps) {
  const getStatusBadge = (status: string, expiryDate: string) => {
    if (status === "expired") {
      return { color: "bg-red-100 text-red-700", icon: XCircle, label: "Expired" };
    }
    if (status === "expiring") {
      return { color: "bg-gray-100 text-gray-700", icon: AlertTriangle, label: "Expiring Soon" };
    }
    if (!expiryDate) {
      return { color: "bg-gray-100 text-gray-700", icon: CheckCircle2, label: "No Expiry" };
    }
    return { color: "bg-gray-100 text-gray-700", icon: CheckCircle2, label: "Valid" };
  };

  const groupedByRole = certifications.reduce((acc, cert) => {
    if (!acc[cert.role]) acc[cert.role] = [];
    acc[cert.role].push(cert);
    return acc;
  }, {} as Record<PersonnelRole, PersonnelCertification[]>);

  const roleOrder: PersonnelRole[] = ["foreman", "safety_officer", "operator", "electrician", "welder", "worker"];

  return (
    <div className="space-y-6">
      {roleOrder.map((role) => {
        const certs = groupedByRole[role];
        if (!certs || certs.length === 0) return null;

        return (
          <div key={role} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-[#021422] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={16} />
                <span className="font-bold text-sm uppercase tracking-wider">{roleLabels[role]} Certifications</span>
              </div>
              <span className="text-xs font-semibold">{certs.length} cert{certs.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="divide-y divide-gray-100">
              {certs.map((cert) => {
                const badge = getStatusBadge(cert.status, cert.expiryDate);
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
                          <span className="font-semibold text-[#021422]">{cert.holderName}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{cert.certificateNumber || "No ID"}</span>
                        </div>
                        <p className="text-sm text-gray-700">{cert.name}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Issued: {cert.issueDate}</span>
                          {cert.expiryDate && <span>Expires: {cert.expiryDate}</span>}
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
        );
      })}

      {certifications.length === 0 && (
        <div className="text-center py-12">
          <Award size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No personnel certifications recorded</p>
        </div>
      )}
    </div>
  );
}
