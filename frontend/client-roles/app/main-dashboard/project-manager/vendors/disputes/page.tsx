"use client";

import React, { useState, useEffect } from "react";
import {
  Scale,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  BarChart3,
  Download,
  Eye,
  MessageSquare,
  FileText,
  Camera,
  Video,
  Shield,
  Send,
  UserCheck,
  XCircle,
} from "lucide-react";

const disputes = [
  { id: 1, disputeId: "DIS-2026-001", vendor: "First Materials", issueType: "Quality", amount: "N45.0M", status: "Escalated", filed: "Feb 28" },
  { id: 2, disputeId: "DIS-2026-002", vendor: "PillingPro Ltd", issueType: "Delivery", amount: "N12.0M", status: "In Review", filed: "Mar 01" },
  { id: 3, disputeId: "DIS-2026-003", vendor: "SteelCo Nig", issueType: "Payment", amount: "N22.0M", status: "Resolved", filed: "Feb 25" },
];

const timeline = [
  { date: "Feb 28 10:30", event: "Site Supervisor reports quality FAIL" },
  { date: "Feb 28 11:00", event: "Vendor notified" },
  { date: "Mar 01 09:00", event: 'Vendor responds: "Batch certificate shows correct mix"' },
  { date: "Mar 02 14:00", event: "Dispute escalated to mediation" },
];

const VendorDisputesPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(disputes[0]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Disputes...</div>;
  }

  return (
    <div className="pb-24 text-[#021422]">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
            DISPUTE MANAGEMENT — Vendor Disputes
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Project: Lagos 12-Storey Mixed-Use Development</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Open: 2</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> Resolved: 7</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><AlertTriangle size={12} className="text-red-500" /> Escalated: 1</span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Dispute Register */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">DISPUTE REGISTER</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left py-2 pr-2">#</th>
                  <th className="text-left py-2 pr-2">Dispute ID</th>
                  <th className="text-left py-2 pr-2">Vendor</th>
                  <th className="text-left py-2 pr-2">Issue Type</th>
                  <th className="text-left py-2 pr-2">Amount</th>
                  <th className="text-left py-2 pr-2">Status</th>
                  <th className="text-left py-2 pr-2">Filed</th>
                  <th className="text-left py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDispute(d)}
                    className={`border-b border-gray-50 cursor-pointer transition-colors ${selectedDispute?.id === d.id ? "bg-blue-50/50" : "hover:bg-gray-50/50"}`}
                  >
                    <td className="py-3 pr-2 font-bold text-gray-500">{d.id}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{d.disputeId}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{d.vendor}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{d.issueType}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{d.amount}</td>
                    <td className="py-3 pr-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        d.status === "Escalated" ? "text-red-700 bg-red-50" : d.status === "Resolved" ? "text-emerald-700 bg-emerald-50" : "text-gray-700 bg-gray-100"
                      }`}>
                        {d.status === "Escalated" && <AlertTriangle size={10} />}
                        {d.status === "Resolved" && <CheckCircle size={10} />}
                        {d.status === "In Review" && <Clock size={10} />}
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{d.filed}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><Eye size={14} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-[#0166B0] hover:bg-blue-50 rounded transition-colors"><MessageSquare size={14} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><FileText size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors"><Plus size={14} /> New Dispute</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><BarChart3 size={14} /> Analytics</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Download size={14} /> Export</button>
          </div>
        </div>

        {/* Active Dispute Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">ACTIVE DISPUTE DETAILS</h2>
          </div>
          <div className="mb-4 py-3 border-b border-gray-100">
            <span className="text-sm font-bold text-[#021422]">{selectedDispute?.disputeId}: Quality Dispute — {selectedDispute?.vendor}</span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 py-2">
              <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Issue:</span>
                <p className="text-sm font-medium text-gray-700">Concrete slump test FAILED (45mm vs spec 80-120mm)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2">
              <Scale size={16} className="text-[#021422] mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Held:</span>
                <p className="text-sm font-bold text-gray-700">N45,000,000</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2">
              <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status:</span>
                <p className="text-sm font-medium text-gray-700 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Escalated — Mediation Required</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="py-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Timeline:</span>
              <div className="mt-3 space-y-3 relative pl-4 border-l-2 border-gray-200">
                {timeline.map((t, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#0166B0] border-2 border-white" />
                    <div className="text-xs font-bold text-gray-500">{t.date}</div>
                    <div className="text-sm font-medium text-gray-700">{t.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="py-3 border-t border-gray-100 mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Evidence:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-700 bg-gray-100 rounded"><Camera size={10} /> AR Slump Test Photo</span>
              <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-700 bg-gray-100 rounded"><Video size={10} /> Video</span>
              <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-700 bg-gray-100 rounded"><FileText size={10} /> Batch Code: RMX-2026-004</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors"><Plus size={14} /> Add Evidence</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#021422] rounded hover:bg-gray-800 transition-colors"><MessageSquare size={14} /> Message Vendor</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors"><CheckCircle size={14} /> Accept Resolution</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Shield size={14} /> Request Arbitration</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDisputesPage;
