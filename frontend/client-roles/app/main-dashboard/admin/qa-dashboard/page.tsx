"use client";

import { CheckCircle2, ClipboardCheck, FileCheck2 } from "lucide-react";

export default function QaDashboardPage() {
  const cards = [{ label: "Open inspections", value: 4, icon: ClipboardCheck }, { label: "Passed checks", value: 18, icon: CheckCircle2 }, { label: "Reports ready", value: 6, icon: FileCheck2 }];
  return <div className="p-6 md:p-8"><h1 className="text-2xl md:text-3xl font-bold text-[#021422]">QA Dashboard</h1><p className="text-gray-500 mt-2 mb-8">A local QA overview for stakeholder review.</p><div className="grid md:grid-cols-3 gap-4">{cards.map((card) => <div key={card.label} className="bg-white rounded-xl border shadow-sm p-5"><card.icon className="text-[#021422] mb-4"/><p className="text-2xl font-bold">{card.value}</p><p className="text-sm text-gray-500">{card.label}</p></div>)}</div></div>;
}
