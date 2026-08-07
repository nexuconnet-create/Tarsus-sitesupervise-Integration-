"use client";

import { useState } from "react";
import { Glasses, Power, Wifi } from "lucide-react";

export default function DevicesPage() {
  const [active, setActive] = useState(true);
  return <div className="p-6 md:p-8"><h1 className="text-2xl md:text-3xl font-bold text-[#021422]">Digital Eye devices</h1><p className="text-gray-500 mt-2 mb-8">Mock device management for the stakeholder demo.</p><div className="max-w-xl bg-white border rounded-xl shadow-sm p-5"><div className="flex items-center justify-between"><div className="flex gap-3 items-center"><div className="p-3 rounded-lg bg-[#021422]/10"><Glasses className="text-[#021422]"/></div><div><p className="font-semibold">XR10 Site A #1</p><p className="text-xs text-gray-500">Assigned to Downtown Office Complex</p></div></div><span className={`text-xs px-2 py-1 rounded-full ${active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{active ? "Active" : "Inactive"}</span></div><div className="mt-5 flex items-center justify-between"><span className="text-sm text-gray-600 flex items-center gap-2"><Wifi size={16}/>Online recently</span><button onClick={() => setActive((value) => !value)} className="text-sm inline-flex items-center gap-2 text-red-700"><Power size={16}/>{active ? "Deactivate" : "Reactivate"}</button></div></div></div>;
}
