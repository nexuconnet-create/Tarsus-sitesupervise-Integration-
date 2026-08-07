"use client";

import { use, useState, useEffect } from "react";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";
import { adminService } from "@/lib/services";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import { Loader2, ShoppingCart, Check, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/error";

interface AdminProcurementPageProps {
  params: Promise<{ org_slug: string }>;
}

interface SubmittedPO {
  uuid: string;
  id?: string;
  po_number: string;
  project_id: string;
  project_name: string;
  supplier: { name: string } | null;
  total_amount: string;
  order_date: string;
  created_by: { fullname: string } | null;
  status: string;
}

export default function AdminProcurementPage({ params }: AdminProcurementPageProps) {
  const { org_slug } = use(params);
  const { loading: guardLoading } = useAdminGuard(org_slug);

  const [loading, setLoading] = useState(true);
  const [submittedPOs, setSubmittedPOs] = useState<SubmittedPO[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (guardLoading) return;

    const fetchSubmittedPOs = async () => {
      try {
        setLoading(true);
        const projectsRes = await adminService.getProjects(org_slug);
        const raw = projectsRes.data;
        const projects: { uuid: string; name: string }[] = Array.isArray(raw)
          ? raw
          : (raw?.results ?? raw?.data?.results ?? []);

        const poResults = await Promise.all(
          projects.map(async (project) => {
            try {
              const res = await purchaseOrderService.listPOs(project.uuid, { status: "submitted" });
              const pos = res.data?.results ?? res.data ?? [];
              return (Array.isArray(pos) ? pos : []).map((po: Record<string, unknown>) => ({
                ...po,
                uuid: (po.uuid as string) || (po.id as string) || "",
                project_id: project.uuid,
                project_name: project.name,
              }));
            } catch {
              return [];
            }
          }),
        );

        setSubmittedPOs(poResults.flat() as SubmittedPO[]);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchSubmittedPOs();
  }, [org_slug, guardLoading]);

  const handleApprove = async (po: SubmittedPO) => {
    setActionLoading(`approve-${po.uuid}`);
    try {
      await purchaseOrderService.approvePO(po.project_id, po.uuid);
      setSubmittedPOs((prev) => prev.filter((p) => p.uuid !== po.uuid));
      toast.success(`${po.po_number} approved`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (po: SubmittedPO) => {
    setActionLoading(`reject-${po.uuid}`);
    try {
      await purchaseOrderService.rejectPO(po.project_id, po.uuid);
      setSubmittedPOs((prev) => prev.filter((p) => p.uuid !== po.uuid));
      toast.success(`${po.po_number} rejected â€” returned to draft`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (guardLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#0166B0]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#021422]">Procurement Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">
          Purchase orders submitted by Project Managers awaiting your approval
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {submittedPOs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">PO #</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Project</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Supplier</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Total Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Order Date</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Created By</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submittedPOs.map((po, idx) => (
                  <motion.tr
                    key={po.uuid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-[#021422]">{po.po_number}</td>
                    <td className="py-4 px-4 text-gray-600">{po.project_name}</td>
                    <td className="py-4 px-4 text-gray-600">{po.supplier?.name ?? "â€”"}</td>
                    <td className="py-4 px-4 font-bold text-[#021422]">
                      â‚¦{parseFloat(po.total_amount || "0").toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-gray-500">
                      {po.order_date ? new Date(po.order_date).toLocaleDateString() : "â€”"}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{po.created_by?.fullname ?? "â€”"}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(po)}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === `approve-${po.uuid}`
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Check size={12} />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(po)}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === `reject-${po.uuid}`
                            ? <Loader2 size={12} className="animate-spin" />
                            : <XCircle size={12} />}
                          Reject
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <ShoppingCart size={48} className="mx-auto mb-3 opacity-40" />
            <p className="font-bold text-gray-500 mb-1">No purchase orders pending approval</p>
            <p className="text-sm">Submitted POs from Project Managers will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
