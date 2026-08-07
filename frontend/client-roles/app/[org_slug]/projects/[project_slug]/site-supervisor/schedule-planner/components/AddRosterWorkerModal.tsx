"use client";

import { useMemo, useState } from "react";
import { X, Search, UserPlus } from "lucide-react";
import type {
  AvailableWorker,
  ProposeAddRosterBody,
} from "@/lib/services/schedulingService";

interface AddRosterWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePool: AvailableWorker[];
  isSubmitting?: boolean;
  onSubmit: (body: ProposeAddRosterBody) => void;
}

type Mode = "pool" | "adhoc";

/**
 * Picker for proposing a worker onto the permanent schedule roster.
 * Two paths:
 *   - choose an available worker (crew member → crew_member_id, pool worker → name+trade)
 *   - enter an ad-hoc worker (name + trade)
 * Once submitted the worker enters the roster as `pending_add` awaiting approval.
 */
export default function AddRosterWorkerModal({
  isOpen,
  onClose,
  availablePool,
  isSubmitting = false,
  onSubmit,
}: AddRosterWorkerModalProps) {
  const [mode, setMode] = useState<Mode>("pool");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [trade, setTrade] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availablePool;
    return availablePool.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        (w.trade || "").toLowerCase().includes(q),
    );
  }, [availablePool, query]);

  if (!isOpen) return null;

  const selected = availablePool.find((w) => w.id === selectedId) || null;

  const canSubmit =
    mode === "pool"
      ? !!selected
      : name.trim().length > 0 && trade.trim().length > 0;

  const handleSubmit = () => {
    if (isSubmitting) return;
    if (mode === "pool") {
      if (!selected) return;
      // The propose-add API only accepts crew_member_id or name+trade.
      // Crew members link by id; pool workers are proposed as named ad-hoc workers.
      const body: ProposeAddRosterBody =
        selected.type === "crew_member"
          ? { crew_member_id: selected.id }
          : { name: selected.name, trade: selected.trade };
      onSubmit(body);
    } else {
      onSubmit({ name: name.trim(), trade: trade.trim() });
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-[#007AFF]" />
            <h3 className="text-base font-bold text-gray-900">
              Add Worker to Roster
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="px-6 pt-4">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setMode("pool")}
              className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-colors ${
                mode === "pool"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Available workers
            </button>
            <button
              onClick={() => setMode("adhoc")}
              className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-colors ${
                mode === "adhoc"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              New worker
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {mode === "pool" ? (
            <>
              <div className="relative mb-3">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search workers..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1.5">
                {filtered.length === 0 ? (
                  <p className="text-[11px] text-gray-400 text-center py-6">
                    No available workers found.
                  </p>
                ) : (
                  filtered.map((w) => {
                    const isSel = w.id === selectedId;
                    return (
                      <button
                        key={w.id}
                        onClick={() => setSelectedId(w.id)}
                        className={`w-full flex items-center justify-between py-2 px-3 rounded-lg border text-left transition-colors ${
                          isSel
                            ? "border-[#007AFF] bg-blue-50"
                            : "border-gray-100 bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {w.name}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {w.trade || "—"}
                            {w.crew_name ? ` · ${w.crew_name}` : ""}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            w.type === "crew_member"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {w.type === "crew_member" ? "CREW" : "POOL"}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Worker name"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Trade
                </label>
                <input
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  placeholder="e.g. Electrician"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="px-4 py-2 bg-[#007AFF] text-white rounded-lg text-xs font-bold hover:bg-[#0062cc] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Proposing..." : "Propose to roster"}
          </button>
        </div>
      </div>
    </div>
  );
}
