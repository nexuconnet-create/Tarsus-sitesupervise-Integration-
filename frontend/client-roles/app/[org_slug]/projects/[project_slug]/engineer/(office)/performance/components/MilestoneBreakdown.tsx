"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { WbsBreakdownMilestone } from "@/lib/evm";
import { formatContractValue, type Currency } from "@/lib/types/projectDetails";

interface MilestoneBreakdownProps {
  breakdown: WbsBreakdownMilestone[];
  currency: Currency;
  /** Project-wide actual cost placeholder (no per-phase cost feed exists yet) —
   * allocated to each phase in proportion to its share of total EV, since
   * that's the only signal available for "how much of the money spent so
   * far belongs to this phase." */
  totalAc: number;
}

/** A phase that hasn't reached its own dates yet computes to a true PV of 0
 * (nothing is due to be spent). Rather than show a flat ₦0, this shows the
 * phase's own allocated budget instead — still labeled "PV" — so a phase
 * that simply hasn't started reads as "this much is planned for it" rather
 * than looking like it has no plan at all. */
function displayPv(pv: number, budget: number): number {
  return pv > 0 ? pv : budget;
}

/** Whole-currency-unit display — proportional AC allocation produces
 * fractional naira (e.g. ₦379,331,306.991); nobody needs kobo-level
 * precision on a phase rollup. */
function money(value: number, currency: Currency): string {
  return formatContractValue(Math.round(value), currency);
}

/** Fixed-width PV/EV/AC values so figures of different lengths still line up
 * in neat columns instead of shifting the whole row around. */
function ValueRow({ pv, ev, ac, currency }: { pv: number; ev: number; ac: number; currency: Currency }) {
  return (
    <span className="grid grid-cols-3 gap-4 text-[11px] text-gray-500 shrink-0">
      <span className="w-28 text-right">
        PV <span className="block font-bold text-[#021422]">{money(pv, currency)}</span>
      </span>
      <span className="w-28 text-right">
        EV <span className="block font-bold text-[#021422]">{money(ev, currency)}</span>
      </span>
      <span className="w-28 text-right">
        AC <span className="block font-bold text-[#021422]">{money(ac, currency)}</span>
      </span>
    </span>
  );
}

/** Progress by phase — PV/EV/AC for every milestone and, expanded, its
 * sub-milestones, mirroring the Level N / N.M numbering on the Milestones
 * page so the two pages read as the same WBS. */
export default function MilestoneBreakdown({ breakdown, currency, totalAc }: MilestoneBreakdownProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (breakdown.length === 0) return null;

  const totalEv = breakdown.reduce((acc, m) => acc + m.ev, 0);
  const acFor = (ev: number) => (totalEv > 0 ? totalAc * (ev / totalEv) : 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <p className="text-sm font-bold text-[#021422]">Progress by Phase</p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Planned, earned and actual cost for every milestone and sub-milestone in the WBS.
        </p>
      </div>
      <div className="divide-y divide-gray-100">
        {breakdown.map((ms, msIndex) => {
          const level = msIndex + 1;
          const isOpen = expanded[ms.id] ?? true;
          return (
            <div key={ms.id}>
              <button
                onClick={() => toggle(ms.id)}
                className="w-full flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors text-left"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <ChevronDown
                    size={13}
                    className={`text-gray-400 shrink-0 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                  />
                  <span className="text-xs font-bold text-[#021422] truncate">
                    Level {level}: {ms.name}
                  </span>
                </span>
                <ValueRow pv={displayPv(ms.pv, ms.budget)} ev={ms.ev} ac={acFor(ms.ev)} currency={currency} />
              </button>

              {isOpen && (
                <div className="pb-2">
                  {ms.subMilestones.map((sm, smIndex) => (
                    <div
                      key={sm.id}
                      className="flex items-center justify-between gap-3 pl-11 pr-5 py-2 hover:bg-gray-50/40"
                    >
                      <span className="text-xs text-[#021422] truncate">
                        {level}.{smIndex + 1} {sm.name}
                      </span>
                      <ValueRow pv={displayPv(sm.pv, sm.budget)} ev={sm.ev} ac={acFor(sm.ev)} currency={currency} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
