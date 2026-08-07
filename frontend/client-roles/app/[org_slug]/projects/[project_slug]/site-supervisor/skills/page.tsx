"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useMemberships } from "@/lib/hooks/useMemberships";
import {
  Award,
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Plus,
  Search,
} from "lucide-react";
import { staffService } from "@/lib/services";
import CrewHeader from "../component/CrewHeader";

export default function SkillsPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const { getProject } = useMemberships();
  const project = getProject(orgSlug, projectSlug);
  const [loading, setLoading] = useState(true);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [daysFilter, setDaysFilter] = useState(30);

  const getProjectId = useCallback(() => {
    try {
      if (project) {
        return (project as any).id || (project as any).project_id;
      }
    } catch {}
    return null;
  }, [project]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const projectId = getProjectId();

    try {
      const results = await Promise.allSettled([
        staffService.getCertifications(),
        projectId
          ? staffService.getExpiringCertifications(projectId, daysFilter)
          : Promise.resolve(null),
      ]);

      if (results[0].status === "fulfilled" && results[0].value?.data) {
        const data = results[0].value.data;
        setCertifications(Array.isArray(data) ? data : data.results || []);
      }

      if (results[1].status === "fulfilled" && results[1].value?.data) {
        const data = results[1].value.data;
        setExpiring(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Certifications fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [getProjectId, daysFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const filteredCerts = certifications.filter((cert) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (
      cert.worker_name ||
      cert.name ||
      cert.holder_name ||
      ""
    ).toLowerCase();
    const certName = (
      cert.certification_name ||
      cert.cert_name ||
      cert.title ||
      ""
    ).toLowerCase();
    return name.includes(q) || certName.includes(q);
  });

  const getStatusBadge = (cert: any) => {
    const expDate = cert.expiry_date || cert.expiration_date || cert.expires_at;
    if (!expDate)
      return {
        color: "text-gray-500 bg-gray-50",
        label: "No Expiry",
        icon: Shield,
      };

    const exp = new Date(expDate);
    const now = new Date();
    const daysLeft = Math.ceil(
      (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysLeft < 0)
      return {
        color: "text-red-600 bg-red-50",
        label: "Expired",
        icon: XCircle,
      };
    if (daysLeft <= 30)
      return {
        color: "text-yellow-600 bg-yellow-50",
        label: `${daysLeft}d left`,
        icon: Clock,
      };
    return {
      color: "text-green-600 bg-green-50",
      label: "Valid",
      icon: CheckCircle2,
    };
  };

  const validCount = certifications.filter((c) => {
    const exp = c.expiry_date || c.expiration_date || c.expires_at;
    if (!exp) return true;
    return new Date(exp) > new Date();
  }).length;
  const expiredCount = certifications.length - validCount;

  return (
    <div className="p-6 md:p-8 space-y-8 pb-32 bg-[#F8F9FA] min-h-screen">
      <CrewHeader title="Skills & Certifications" project={project?.name || projectSlug} />
      <div className="flex justify-end bg-white p-4 rounded-lg shadow-sm -mt-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search worker or cert..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#007AFF] w-56"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col items-center">
            <div className="bg-[#021422] text-white w-full py-2 text-center text-xs font-bold uppercase tracking-wider">
              Total Certs
            </div>
            <div className="p-4 flex flex-col items-center justify-center flex-1">
              <Award size={20} className="text-[#007AFF] mb-2" />
              <span className="text-3xl font-bold text-[#021422]">
                {loading ? "—" : certifications.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col items-center">
            <div className="bg-[#021422] text-white w-full py-2 text-center text-xs font-bold uppercase tracking-wider">
              Valid
            </div>
            <div className="p-4 flex flex-col items-center justify-center flex-1">
              <CheckCircle2 size={20} className="text-green-500 mb-2" />
              <span className="text-3xl font-bold text-[#22C55E]">
                {loading ? "—" : validCount}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col items-center">
            <div className="bg-[#021422] text-white w-full py-2 text-center text-xs font-bold uppercase tracking-wider">
              Expiring Soon
            </div>
            <div className="p-4 flex flex-col items-center justify-center flex-1">
              <AlertTriangle size={20} className="text-yellow-500 mb-2" />
              <span className="text-3xl font-bold text-[#F59E0B]">
                {loading ? "—" : expiring.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col items-center">
            <div className="bg-[#021422] text-white w-full py-2 text-center text-xs font-bold uppercase tracking-wider">
              Expired
            </div>
            <div className="p-4 flex flex-col items-center justify-center flex-1">
              <XCircle size={20} className="text-red-500 mb-2" />
              <span className="text-3xl font-bold text-[#EF4444]">
                {loading ? "—" : expiredCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expiring Certifications Alert */}
      {expiring.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Expiring Within {daysFilter} Days
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 overflow-hidden">
            <div className="bg-[#F59E0B] text-white p-4 flex items-center gap-3">
              <AlertTriangle size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Upcoming Expirations
              </h3>
            </div>
            <div className="p-6">
              <div className="flex gap-3 mb-6">
                {[7, 14, 30, 60, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDaysFilter(d)}
                    className={`px-4 py-2 text-[10px] font-bold uppercase rounded transition-colors ${daysFilter === d ? "bg-[#021422] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
              <ul className="space-y-3">
                {expiring.map((cert: any, idx: number) => (
                  <li
                    key={cert.id ?? idx}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <span className="font-semibold text-sm text-[#021422]">
                        {cert.worker_name ||
                          cert.holder_name ||
                          cert.name ||
                          "—"}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        —{" "}
                        {cert.certification_name ||
                          cert.cert_name ||
                          cert.title ||
                          ""}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-yellow-600">
                      Expires:{" "}
                      {cert.expiry_date ||
                        cert.expiration_date ||
                        cert.expires_at ||
                        "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* All Certifications Table */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          All Certifications
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#021422] text-white p-4 flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Certification Registry
            </h3>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-[#007AFF]" />
                <span className="ml-3 text-sm text-gray-500">
                  Loading certifications...
                </span>
              </div>
            ) : filteredCerts.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 text-left text-xs font-bold uppercase text-[#021422] pl-4">
                      Worker
                    </th>
                    <th className="py-3 text-left text-xs font-bold uppercase text-[#021422]">
                      Certification
                    </th>
                    <th className="py-3 text-center text-xs font-bold uppercase text-[#021422]">
                      Issued
                    </th>
                    <th className="py-3 text-center text-xs font-bold uppercase text-[#021422]">
                      Expiry
                    </th>
                    <th className="py-3 text-center text-xs font-bold uppercase text-[#021422]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCerts.map((cert: any, idx: number) => {
                    const badge = getStatusBadge(cert);
                    const BadgeIcon = badge.icon;
                    return (
                      <tr
                        key={cert.id ?? idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 pl-4">
                          <div className="font-semibold text-sm text-[#021422]">
                            {cert.worker_name ||
                              cert.holder_name ||
                              cert.name ||
                              "—"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {cert.crew_name ||
                              cert.crew ||
                              cert.department ||
                              ""}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="font-medium text-sm text-[#021422]">
                            {cert.certification_name ||
                              cert.cert_name ||
                              cert.title ||
                              "—"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {cert.issuer || cert.issuing_body || ""}
                          </div>
                        </td>
                        <td className="py-4 text-center text-xs text-gray-600">
                          {cert.issue_date ||
                            cert.issued_date ||
                            cert.issued_at ||
                            "—"}
                        </td>
                        <td className="py-4 text-center text-xs text-gray-600">
                          {cert.expiry_date ||
                            cert.expiration_date ||
                            cert.expires_at ||
                            "—"}
                        </td>
                        <td className="py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${badge.color}`}
                          >
                            <BadgeIcon size={12} />
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Award size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">
                  {searchQuery
                    ? "No matching certifications found"
                    : "No certifications recorded yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
