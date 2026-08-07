"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  FileText,
  Image,
  Video,
  MessageCircle,
  CheckCircle,
  Scale,
  Send,
  User,
  Building2,
  Shield,
} from "lucide-react";
import { MOCK_DISPUTES } from "@/lib/mockData/vendor";
import toast from "react-hot-toast";

const statusStyles: Record<string, string> = {
  filed: "bg-red-50 text-red-700 border-red-200",
  responded: "bg-amber-50 text-amber-700 border-amber-200",
  mediation: "bg-purple-50 text-purple-700 border-purple-200",
  arbitration: "bg-orange-50 text-orange-700 border-orange-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
};

const severityBadge: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

const evidenceIcons: Record<string, React.ReactNode> = {
  photo: <Image size={16} />,
  document: <FileText size={16} />,
  video: <Video size={16} />,
};

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispute = MOCK_DISPUTES.find((d) => d.id === id);

  if (!dispute) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <Scale size={48} className="mb-3 text-gray-300" />
        <p className="font-bold text-lg">Dispute not found</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-[#0D1B2A] underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="bg-white py-7 px-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push("/main-dashboard/project-manager/vendors/disputes")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D1B2A] transition-colors mb-2"
          >
            <ArrowLeft size={16} /> Back to Disputes
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#0D1B2A]">{dispute.disputeNumber}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusStyles[dispute.status]}`}>
                {dispute.status}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${severityBadge[dispute.severity]}`}>
                {dispute.severity}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Filed {new Date(dispute.filedAt).toLocaleDateString()} &middot; {dispute.filedBy}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {dispute.poNumber} &middot; {dispute.projectName} &middot; {dispute.vendorName}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Issue</h2>
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-500 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#0D1B2A]">{dispute.reason}</p>
                    <p className="text-sm text-gray-700 mt-1">{dispute.details}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <span className="text-gray-500">Amount Held:</span>
                <span className="font-bold text-lg text-[#0D1B2A]">₦{dispute.amountHeld.toLocaleString()}</span>
              </div>
            </div>

            {/* Evidence Submitted */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Evidence Submitted</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dispute.evidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                      {evidenceIcons[ev.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0D1B2A] truncate">{ev.label}</p>
                      <p className="text-xs text-gray-400">{ev.type}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 flex items-center gap-2 text-sm font-bold text-[#0D1B2A] hover:text-gray-600 transition-colors">
                <Send size={16} /> Add Evidence
              </button>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Timeline</h2>
              <div className="space-y-4">
                {dispute.timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        idx === 0 ? "bg-red-500 border-red-500" : "bg-white border-gray-300"
                      }`} />
                      {idx < dispute.timeline.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">
                          {new Date(event.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(event.time).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {event.actor === "Site Supervisor" && <User size={14} className="text-blue-500" />}
                        {event.actor === "Vendor" && <Building2 size={14} className="text-amber-500" />}
                        {event.actor === "System" && <Shield size={14} className="text-gray-400" />}
                        {event.actor === "Administrator" && <Scale size={14} className="text-purple-500" />}
                        <span className="font-medium text-sm text-[#0D1B2A]">{event.actor}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{event.action}</p>
                      {event.details && (
                        <p className="text-xs text-gray-500 mt-0.5">{event.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => toast.success("Evidence upload opened")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
                >
                  <Send size={16} /> Add Evidence
                </button>
                <button
                  onClick={() => router.push(`/main-dashboard/project-manager/vendors/disputes/${id}/chat`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle size={16} /> Message Merchant
                </button>
                <button
                  onClick={() => toast.success("Resolution accepted")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={16} /> Accept Resolution
                </button>
                <button
                  onClick={() => toast.success("Arbitration requested")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
                >
                  <Scale size={16} /> Request Arbitration
                </button>
              </div>
            </div>

            {dispute.resolution && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-6">
                <h2 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-2">Resolution</h2>
                <p className="text-sm text-green-800">{dispute.resolution}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}