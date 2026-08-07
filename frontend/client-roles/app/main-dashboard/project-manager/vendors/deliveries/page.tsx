"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  Scan,
  Droplets,
  Eye,
  FileText,
  Shield,
} from "lucide-react";

const pendingVerifications = [
  { id: 1, deliveryId: "DLV-2026-023", vendor: "First Materials", items: "Cement", qty: "500 bags", arrived: "Today 14:30", status: "Pending" },
  { id: 2, deliveryId: "DLV-2026-022", vendor: "SteelCo Nig", items: "Rebar", qty: "200 pcs", arrived: "Today 11:00", status: "Pending" },
  { id: 3, deliveryId: "DLV-2026-021", vendor: "PillingPro Ltd", items: "Equipment", qty: "5 units", arrived: "Today 11:30", status: "Verified" },
];

const VendorDeliveriesPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(pendingVerifications[0]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Deliveries...</div>;
  }

  return (
    <div className="pb-24 text-[#021422]">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
            VENDOR DELIVERIES — Quality Verification
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Project: Lagos 12-Storey Mixed-Use Development</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><Clock size={12} className="text-amber-500" /> Pending Verification: 3</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> Verified: 15</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><XCircle size={12} className="text-red-500" /> Rejected: 2</span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">PENDING VERIFICATIONS</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left py-2 pr-2">#</th>
                  <th className="text-left py-2 pr-2">Delivery ID</th>
                  <th className="text-left py-2 pr-2">Vendor</th>
                  <th className="text-left py-2 pr-2">Items</th>
                  <th className="text-left py-2 pr-2">Qty</th>
                  <th className="text-left py-2 pr-2">Arrived</th>
                  <th className="text-left py-2 pr-2">Status</th>
                  <th className="text-left py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingVerifications.map((v) => (
                  <tr key={v.id} onClick={() => setSelectedDelivery(v)} className={`border-b border-gray-50 cursor-pointer transition-colors ${selectedDelivery?.id === v.id ? "bg-blue-50/50" : "hover:bg-gray-50/50"}`}>
                    <td className="py-3 pr-2 font-bold text-gray-500">{v.id}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{v.deliveryId}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{v.vendor}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{v.items}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{v.qty}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{v.arrived}</td>
                    <td className="py-3 pr-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${v.status === "Verified" ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"}`}>
                        {v.status === "Verified" ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {v.status === "Pending" ? (
                          <>
                            <button className="px-2 py-1 text-[10px] font-bold text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors">Verify</button>
                            <button className="px-2 py-1 text-[10px] font-bold text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors">Reject</button>
                          </>
                        ) : (
                          <button className="px-2 py-1 text-[10px] font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">View</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors"><CheckCircle size={14} /> Verify All</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><FileText size={14} /> Bulk Actions</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><FileText size={14} /> Quality Report</button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Scan size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">AR QUALITY VERIFICATION</h2>
          </div>
          <div className="mb-4 py-3 border-b border-gray-100">
            <span className="text-sm font-bold text-[#021422]">{selectedDelivery?.deliveryId} — {selectedDelivery?.items} Delivery</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#021422] rounded hover:bg-gray-800 transition-colors"><Camera size={14} /> Capture Delivery Photo</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors"><Scan size={14} /> AR Scan Batch Code</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#021422] rounded hover:bg-gray-800 transition-colors"><Droplets size={14} /> Capture Slump Test</button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Batch Code: <span className="text-[#021422]">CMT-2026-008</span></span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">Verified: <CheckCircle size={12} className="text-emerald-500" /></span>
              <span className="text-gray-300">|</span>
              <span>Slump Test: <span className="text-[#021422]">85mm</span> (Spec: 80-120mm)</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">Status: <CheckCircle size={12} className="text-emerald-500" /> <span className="text-emerald-600">PASS</span></span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors"><CheckCircle size={14} /> Accept Delivery</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors"><XCircle size={14} /> Report Issue</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><FileText size={14} /> View Certificate</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDeliveriesPage;
