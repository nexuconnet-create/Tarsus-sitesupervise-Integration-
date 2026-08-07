"use client";

import React from "react";
import { Shield, AlertTriangle, XCircle, CheckCircle2, Clock } from "lucide-react";
import type { PersonnelCertification } from "@/lib/mockData/skills";

interface HSECertsTabProps {
  certifications: PersonnelCertification[];
  onEdit?: (cert: PersonnelCertification) => void;
}

export default function HSECertsTab({ certifications, onEdit }: HSECertsTabProps) {
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

  const validCount = certifications.filter(c => c.status === "valid").length;
  const expiringCount = certifications.filter(c => c.status === "expiring").length;
  const expiredCount = certifications.filter(c => c.status === "expired").length;

  return (
    <div className="space-y-6">
      {/* HSE Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <CheckCircle2 size={20} className="text-gray-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-[#021422]">{validCount}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Valid</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <Clock size={20} className="text-gray-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-[#021422]">{expiringCount}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Expiring</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <XCircle size={20} className="text-red-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-red-700">{expiredCount}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Expired</p>
        </div>
      </div>

      {/* HSE Certifications List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#021422] px-4 py-3 flex items-center gap-2">
          <Shield size={16} className="text-white" />
          <span className="font-bold text-sm uppercase tracking-wider text-white">HSE Certifications</span>
        </div>

        <div className="divide-y divide-gray-100">
          {certifications.length === 0 ? (
            <div className="text-center py-12">
              <Shield size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No HSE certifications recorded</p>
            </div>
          ) : (
            certifications.map((cert) => {
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
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs capitalize">
                          {cert.role.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{cert.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Issued: {cert.issueDate}</span>
                        {cert.expiryDate && <span>Expires: {cert.expiryDate}</span>}
                        <span>{cert.issuingBody}</span>
                      </div>
                      {cert.certificateNumber && (
                        <p className="text-xs text-gray-400 mt-1">Cert #: {cert.certificateNumber}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${badge.color}`}>
                      <BadgeIcon size={12} />
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
