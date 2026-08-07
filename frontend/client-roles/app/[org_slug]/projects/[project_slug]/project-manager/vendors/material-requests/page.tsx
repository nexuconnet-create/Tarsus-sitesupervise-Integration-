"use client";
import BackButton from "@/components/BackButton";
 

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2, ClipboardList, Check, XCircle, ShoppingCart, ArrowLeft } from "lucide-react";
import { inventoryService } from "@/lib/services/inventoryService";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { getErrorMessage } from "@/lib/error";
import type { BackendMaterialRequest } from "@/lib/transforms/inventoryTransforms";

type TabStatus = "pending" | "approved" | "rejected";

function resolveRequestedBy(value: unknown): string {
  if (!value) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    return String(v.fullname || v.email || v.first_name || "—");
  }
  return "—";
}

function resolveItemName(req: BackendMaterialRequest): string {
  // item_name as plain string (ideal)
  if (req.item_name) return req.item_name;
  // item as nested object { name, ... }
  if (req.item && typeof req.item === "object") {
    const obj = req.item as Record<string, unknown>;
    return String(obj.name || obj.item_name || "—");
  }
  return "—";
}

function resolveItemUnit(req: BackendMaterialRequest): string {
  if (req.item && typeof req.item === "object") {
    const obj = req.item as Record<string, unknown>;
    return String(obj.unit || "");
  }
  return "";
}

const STATUS_TABS: { label: string; value: TabStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

export default function MaterialRequestsPage() {
  const router = useRouter();
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const base = `/${orgSlug}/projects/${projectSlug}/project-manager`;
  const { data: projectUuid } = useProjectUuid(orgSlug, projectSlug);

  const [activeTab, setActiveTab] = useState<TabStatus>("pending");
  const [requests, setRequests] = useState<BackendMaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<BackendMaterialRequest | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const fetchRequests = useCallback(async (status: TabStatus) => {
    if (!projectUuid) return;
    setLoading(true);
    try {
      const res = await inventoryService.listMaterialRequests(projectUuid ?? "", { status });
      const raw = res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
      setRequests(raw);
      if (status === "pending") setPendingCount(res.data?.count ?? raw.length);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [projectUuid]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests(activeTab);
  }, [activeTab, fetchRequests]);

  // Keep pending badge count fresh when switching away
  useEffect(() => {
    if (activeTab !== "pending" && projectUuid) {
      inventoryService.listMaterialRequests(projectUuid ?? "", { status: "pending" })
        .then(res => setPendingCount(res.data?.count ?? 0))
        .catch(() => {});
    }
  }, [activeTab, projectUuid]);

  const handleApprove = async (req: BackendMaterialRequest) => {
    const id = req.id;
    if (!id) return;
    setActionLoading(`approve-${id}`);
    try {
      await inventoryService.approveMaterialRequest(projectUuid ?? "", id);
      setRequests(prev => prev.filter(r => r.id !== id));
      setPendingCount(c => Math.max(0, c - 1));
      toast.success(`Request for "${resolveItemName(req)}" approved`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (req: BackendMaterialRequest) => {
    setRejectTarget(req);
    setRejectNotes("");
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    const id = rejectTarget.id;
    if (!id) return;
    setActionLoading(`reject-${id}`);
    try {
      await inventoryService.rejectMaterialRequest(projectUuid ?? "", id, { notes: rejectNotes });
      setRequests(prev => prev.filter(r => r.id !== id));
      setPendingCount(c => Math.max(0, c - 1));
      toast.success(`Request for "${resolveItemName(rejectTarget)}" rejected`);
      setRejectTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white py-7 px-4 border-b border-gray-100">
        <button
          onClick={() => router.push(`${base}/vendors`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <div className="flex items-center gap-3"><BackButton /><h1 className="text-2xl font-bold text-[#021422]">Material Requests</h1></div>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and action material requests submitted by engineers
          </p>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`relative px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                activeTab === tab.value
                  ? "bg-white text-[#021422] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.value === "pending" && pendingCount > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-[#0166B0]" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ClipboardList size={48} className="mx-auto mb-3 opacity-40" />
              <p className="font-bold text-gray-500 mb-1">
                No {activeTab} requests
              </p>
              <p className="text-sm">
                {activeTab === "pending"
                  ? "Engineers haven't submitted any material requests yet"
                  : `No ${activeTab} requests to show`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Item</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Quantity</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Priority</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Requested By</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Notes</th>
                    {activeTab === "pending" && (
                      <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                    )}
                    {activeTab === "approved" && (
                      <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Next Step</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, idx) => (
                    <motion.tr
                      key={req.id ?? idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-[#021422]">
                        <div>{resolveItemName(req)}</div>
                        {resolveItemUnit(req) && (
                          <div className="text-xs text-gray-400">{resolveItemUnit(req)}</div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {req.quantity_requested ?? "—"}
                      </td>
                      <td className="py-4 px-4">
                        {req.priority ? (
                          <span className={`text-xs px-2 py-1 rounded-full font-bold capitalize ${PRIORITY_COLORS[req.priority.toLowerCase()] ?? "bg-gray-100 text-gray-600"}`}>
                            {req.priority}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {resolveRequestedBy(req.requested_by_name || req.requested_by)}
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-4 px-4 text-gray-500 max-w-[180px] truncate">
                        {req.notes || "—"}
                      </td>

                      {activeTab === "pending" && (
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(req)}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === `approve-${req.id}`
                                ? <Loader2 size={12} className="animate-spin" />
                                : <Check size={12} />}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(req)}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === `reject-${req.id}`
                                ? <Loader2 size={12} className="animate-spin" />
                                : <XCircle size={12} />}
                              Reject
                            </button>
                          </div>
                        </td>
                      )}

                      {activeTab === "approved" && (
                        <td className="py-4 px-4">
                          <div className="flex justify-end">
                            <button
                              onClick={() => router.push(`${base}/vendors/purchase-orders/new`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                            >
                              <ShoppingCart size={12} />
                              Create PO
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reject reason modal */}
      {rejectTarget && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setRejectTarget(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[#021422]">Reject Request</h2>
            <p className="text-sm text-gray-600">
              Rejecting request for <span className="font-semibold">{resolveItemName(rejectTarget)}</span>. Please provide a reason.
            </p>
            <textarea
              value={rejectNotes}
              onChange={e => setRejectNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Item already in stock, budget not approved..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectNotes.trim() || !!actionLoading}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading?.startsWith("reject-") && <Loader2 size={14} className="animate-spin" />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
