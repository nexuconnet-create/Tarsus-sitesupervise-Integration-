"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Truck, Check, Package, ArrowRight, Calendar, AlertTriangle, Loader2, X } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import { getErrorMessage } from "@/lib/error";
import toast from "react-hot-toast";
import { POStatusBadge, GRNReceiveForm, DeliveryPhotoUpload } from "@/components/vendor-pipeline/primitives";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { inventoryPOFromApi } from "@/lib/transforms/inventoryPOTransforms";

interface VerifyPageProps {
  params: Promise<{ org_slug: string; project_slug: string; poUuid: string }>;
}

export default function VerifyPage({ params }: VerifyPageProps) {
  const { org_slug, project_slug, poUuid } = use(params);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);
  const isAuthenticated = !!user;

  const [loading, setLoading] = useState(true);
  const [po, setPo] = useState<ReturnType<typeof inventoryPOFromApi> | null>(null);
  const [poError, setPoError] = useState("");

  // Report issue form
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportPhotos, setReportPhotos] = useState<File[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  // Manual code entry
  const [deliveryCode, setDeliveryCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchPO = async () => {
      if (!poUuid || poUuid === "undefined") {
        if (!cancelled) setLoading(false);
        return;
      }
      if (!projectUuid || !isAuthenticated) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const res = await purchaseOrderService.getPO(projectUuid, poUuid);
        if (!cancelled) {
          const transformed = inventoryPOFromApi(res.data as Parameters<typeof inventoryPOFromApi>[0]);
          setPo(transformed);
        }
      } catch (err) {
        if (!cancelled) {
          setPoError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPO();
    return () => { cancelled = true; };
  }, [poUuid, projectUuid, isAuthenticated]);

  const [showGRN, setShowGRN] = useState(false);

  const reasons = [
    "Wrong quantity", "Damaged materials", "Wrong material",
    "Quality concern", "Late delivery", "Other",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${po ? "bg-emerald-100" : "bg-blue-100"}`}>
            <Truck className={`w-8 h-8 ${po ? "text-emerald-600" : "text-blue-600"}`} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Verification</h1>
          <p className="text-sm text-gray-500 mt-1">
            {po ? "Delivery code verified" : "Verify a purchase order delivery"}
          </p>
        </div>

        {/* QR-scan result: PO found */}
        {po && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">PO Number</p>
                <p className="text-lg font-bold text-[#021422] font-mono">{po.poNumber}</p>
              </div>
              <POStatusBadge status={po.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Supplier</p>
                <p className="font-medium text-gray-900">{po.supplierName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Project</p>
                <p className="font-medium text-gray-900">{project?.name || project_slug}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Items</p>
                <p className="font-medium text-gray-900">{po.itemsCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="font-medium text-gray-900">₦{po.totalAmount.toLocaleString()}</p>
              </div>
              {po.expectedDeliveryDate && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400">Expected Delivery</p>
                  <p className="font-medium text-gray-900">{new Date(po.expectedDeliveryDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {(po.status === "shipped" || po.status === "partial") && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowGRN(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Check size={16} />
                  Receive Delivery
                </button>
                <button
                  onClick={() => setReportOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <AlertTriangle size={16} />
                  Report Issue
                </button>
              </div>
            )}

            {po.status === "received" && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <p className="text-sm font-medium text-emerald-800">Delivery already confirmed</p>
                <p className="text-xs text-emerald-600 mt-1">
                  This PO was received on {po.actualDeliveryDate ? new Date(po.actualDeliveryDate).toLocaleDateString() : "a previous date"}.
                </p>
              </div>
            )}
          </div>
        )}

        {/* GRN Receive Form */}
        {showGRN && po && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Receive Delivery</h3>
              <button onClick={() => setShowGRN(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <GRNReceiveForm
              key={po?.uuid}
              po={po}
              projectId={projectUuid!}
              lineItems={po.items?.map((i: { uuid: string; inventoryItemName: string; quantityOrdered: number; inventoryItemUnit: string; unitPrice: number }) => ({
                uuid: i.uuid,
                name: i.inventoryItemName,
                quantity: i.quantityOrdered,
                unit: i.inventoryItemUnit,
                unitPrice: i.unitPrice,
              })) ?? "loading"}
              onComplete={(updated) => { setPo(updated); setShowGRN(false); }}
            />
          </div>
        )}

        {/* Report Issue Form */}
        {reportOpen && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Report Issue</h3>
              <button onClick={() => setReportOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select an issue...</option>
                {reasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <DeliveryPhotoUpload
              photos={reportPhotos}
              onPhotosChange={setReportPhotos}
              maxPhotos={5}
            />

            <button
              disabled={!reportReason || reportLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {reportLoading && <Loader2 size={14} className="animate-spin" />}
              Submit Issue
            </button>

            <p className="text-xs text-gray-400">
              The project manager will be notified about this issue.
            </p>
          </div>
        )}

        {/* Not authenticated or PO not found */}
        {!po && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center space-y-4">
            {poUuid && poUuid !== "undefined" ? (
              <>
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="w-7 h-7 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">PO scanned successfully.</p>
                {isAuthenticated ? (
                  <p className="text-sm text-gray-500">
                    {poError || "Could not load PO details. Check your project access."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">Sign in to confirm delivery.</p>
                    <button
                      onClick={() => router.push(`/signin?redirect=/${org_slug}/projects/${project_slug}/po-verify/${poUuid}`)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign In <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Enter the delivery code from the delivery ticket.
                </p>
                <form onSubmit={(e) => { e.preventDefault(); if (!deliveryCode.trim()) return; setSubmittedCode(deliveryCode.trim()); }} className="space-y-3">
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={deliveryCode}
                      onChange={(e) => setDeliveryCode(e.target.value)}
                      placeholder="e.g. PO-0042"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!deliveryCode.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Package size={16} />
                    Look Up Delivery
                  </button>
                </form>

                {submittedCode && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <p className="text-sm font-medium text-amber-800">Code entered: {submittedCode}</p>
                    <p className="text-xs text-amber-600 mt-1">Sign in to view details and confirm delivery.</p>
                    <button
                      onClick={() => router.push(`/signin?redirect=/${org_slug}/projects/${project_slug}/po-verify/${submittedCode}`)}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign In <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">
          Delivery code is printed on the delivery ticket attached to the truck.
        </p>
      </div>
    </div>
  );
}
