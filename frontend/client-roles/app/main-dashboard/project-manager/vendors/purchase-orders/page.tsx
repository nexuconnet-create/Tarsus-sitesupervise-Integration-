"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Eye,
  MessageSquare,
  Edit,
  Plus,
  BarChart3,
  Download,
  Layers,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  Phone,
  Share2,
  Filter,
  ChevronDown,
  AlertTriangle,
  Package,
} from "lucide-react";

const purchaseOrders = [
  { id: 1, poNumber: "PO-2026-045", vendor: "First Materials", items: "Cement", amount: "N45.0M", issueDate: "Mar 02", delivery: "Mar 12", status: "Dispatched" },
  { id: 2, poNumber: "PO-2026-044", vendor: "SteelCo Nig", items: "Rebar", amount: "N22.0M", issueDate: "Mar 01", delivery: "Mar 10", status: "Delivered" },
  { id: 3, poNumber: "PO-2026-043", vendor: "ElectraTech", items: "Equipment", amount: "N8.5M", issueDate: "Feb 28", delivery: "Mar 05", status: "In Transit" },
  { id: 4, poNumber: "PO-2026-042", vendor: "PillingPro ltd", items: "Foundation", amount: "N12.0M", issueDate: "Feb 27", delivery: "Mar 15", status: "Pending" },
];

const PurchaseOrdersPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Purchase Orders...</div>;
  }

  return (
    <div className="pb-24 text-[#021422]">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
            PURCHASE ORDER DASHBOARD
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Project: Lagos 12-Storey Mixed-Use Development</span>
            <span className="text-gray-300">|</span>
            <span>Total: 38</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active: 12</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> Completed: 24</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1"><AlertTriangle size={12} className="text-red-500" /> Cancelled: 2</span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Search by PO number, vendor, status..." className="flex-1 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none" />
            <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-gray-500 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <Filter size={12} /> Filters: All Status <ChevronDown size={10} />
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">ACTIVE PURCHASE ORDERS</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left py-2 pr-2">#</th>
                  <th className="text-left py-2 pr-2">PO Number</th>
                  <th className="text-left py-2 pr-2">Vendor</th>
                  <th className="text-left py-2 pr-2">Items</th>
                  <th className="text-left py-2 pr-2">Amount</th>
                  <th className="text-left py-2 pr-2">Issue Date</th>
                  <th className="text-left py-2 pr-2">Delivery</th>
                  <th className="text-left py-2 pr-2">Status</th>
                  <th className="text-left py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 pr-2 font-bold text-gray-500">{po.id}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{po.poNumber}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{po.vendor}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{po.items}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{po.amount}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{po.issueDate}</td>
                    <td className="py-3 pr-2 font-medium text-gray-700">{po.delivery}</td>
                    <td className="py-3 pr-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${po.status === "Delivered" ? "text-emerald-700 bg-emerald-50" : po.status === "Dispatched" ? "text-blue-700 bg-blue-50" : po.status === "In Transit" ? "text-amber-700 bg-amber-50" : "text-gray-700 bg-gray-100"}`}>
                        {po.status === "Delivered" && <CheckCircle size={10} />}
                        {po.status === "In Transit" && <Truck size={10} />}
                        {po.status === "Dispatched" && <Package size={10} />}
                        {po.status === "Pending" && <Clock size={10} />}
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><Eye size={14} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-[#0166B0] hover:bg-blue-50 rounded transition-colors"><MessageSquare size={14} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><Edit size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors"><Plus size={14} /> Create PO</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><BarChart3 size={14} /> Analytics</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Download size={14} /> Export</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Layers size={14} /> Bulk Actions</button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={16} className="text-[#021422]" />
            <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">LIVE DELIVERY TRACKING</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 py-3 border-b border-gray-100">
            <span className="flex items-center gap-1"><Truck size={12} className="text-[#021422]" /> Truck #T-442</span>
            <span className="text-gray-300">|</span>
            <span>Driver: Ahmed</span>
            <span className="text-gray-300">|</span>
            <span>0803 123 4567</span>
            <span className="text-gray-300">|</span>
            <span>PO-2026-045</span>
            <span className="text-gray-300">|</span>
            <span>ETA: 45 min</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1 text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</span>
          </div>
          <div className="bg-gray-100 rounded-lg aspect-[21/9] relative overflow-hidden border border-gray-200 mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Live Map Showing Route from Merchant to Site</p>
              </div>
            </div>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.2) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            </div>
            <div className="absolute top-1/3 left-1/4 w-1/2 h-0.5 bg-[#0166B0] rotate-12 opacity-60" />
            <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-[#0166B0] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-[42%] right-1/4 w-2 h-2 rounded-full bg-emerald-500 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0166B0] rounded hover:bg-blue-700 transition-colors"><Phone size={14} /> Call Driver</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#021422] rounded hover:bg-gray-800 transition-colors"><MessageSquare size={14} /> Message Driver</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Share2 size={14} /> Share Location</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"><Eye size={14} /> View Details</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrdersPage;
