"use client";

import { useState } from "react";
import { Check, ShoppingCart, XCircle } from "lucide-react";

type Order = { id: string; number: string; project: string; supplier: string; amount: string; status: "Submitted" | "Approved" | "Returned" };
const initialOrders: Order[] = [
  { id: "po-041", number: "PO-2026-041", project: "Downtown Office Complex", supplier: "BuildRight Supplies", amount: "₦4,850,000", status: "Submitted" },
  { id: "po-042", number: "PO-2026-042", project: "Highway Extension Project", supplier: "SteelWorks Ltd", amount: "₦8,200,000", status: "Submitted" },
];

export default function ProcurementPage() {
  const [orders, setOrders] = useState(initialOrders);
  const update = (id: string, status: Order["status"]) => setOrders((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  return <div className="p-6 md:p-8"><h1 className="text-2xl md:text-3xl font-bold text-[#021422]">Procurement</h1><p className="text-gray-500 mt-2 mb-8">Review submitted purchase orders. All decisions are local to this demo.</p><div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"><div className="p-4 border-b flex gap-2 font-semibold"><ShoppingCart size={20} className="text-[#021422]"/>Submitted purchase orders</div>{orders.map((order) => <div key={order.id} className="p-5 border-b last:border-0 flex flex-col md:flex-row gap-4 md:items-center md:justify-between"><div><p className="font-semibold text-gray-900">{order.number}</p><p className="text-sm text-gray-500 mt-1">{order.project} · {order.supplier}</p></div><div className="flex items-center gap-3"><span className="font-semibold text-[#021422]">{order.amount}</span><span className="text-xs px-2 py-1 rounded-full bg-gray-100">{order.status}</span>{order.status === "Submitted" && <><button onClick={() => update(order.id, "Approved")} className="inline-flex gap-1 items-center text-sm px-3 py-2 bg-green-600 text-white rounded-lg"><Check size={15}/>Approve</button><button onClick={() => update(order.id, "Returned")} className="inline-flex gap-1 items-center text-sm px-3 py-2 border border-red-200 text-red-700 rounded-lg"><XCircle size={15}/>Return</button></>}</div></div>)}</div></div>;
}
