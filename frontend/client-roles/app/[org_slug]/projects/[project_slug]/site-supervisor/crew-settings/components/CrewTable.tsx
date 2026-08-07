"use client";

import React, { useState } from "react";
import { Edit2, Trash2, Users, UserPlus, Loader2, AlertTriangle } from "lucide-react";
import type { Crew } from "@/lib/services/crewService";
import { CREW_TRADES } from "@/lib/services/crewService";

interface CrewTableProps {
  crews: Crew[];
  onEdit: (crew: Crew) => void;
  onDeactivate: (id: string) => void;
  onViewMembers: (crew: Crew) => void;
  onAddMember: (crew: Crew) => void;
  loading: boolean;
  deactivatingId?: string;
}

function tradeLabelFromValue(value: string): string {
  return CREW_TRADES.find((t) => t.value === value)?.label ?? value;
}

export default function CrewTable({
  crews,
  onEdit,
  onDeactivate,
  onViewMembers,
  onAddMember,
  loading,
  deactivatingId,
}: CrewTableProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 size={24} className="animate-spin mr-2" />
        <span>Loading crews…</span>
      </div>
    );
  }

  if (crews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Users size={40} className="mb-3 opacity-40" />
        <p className="font-medium text-gray-500">No crews yet</p>
        <p className="text-sm mt-1">Create a crew to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Trade</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Code</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Members</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {crews.map((crew) => (
            <tr
              key={crew.id}
              onClick={() => onViewMembers(crew)}
              className="hover:bg-blue-50/50 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3 font-medium text-[#021422]">{crew.name}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {tradeLabelFromValue(crew.trade)}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 font-mono text-xs">{crew.crew_code}</td>
              <td className="px-4 py-3 text-gray-600">{crew.member_count}</td>
              <td className="px-4 py-3">
                {crew.is_active ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  {confirmId === crew.id ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                      <AlertTriangle size={14} className="text-red-500" />
                      <span className="text-xs text-red-700">Deactivate?</span>
                      <button
                        onClick={() => {
                          setConfirmId(null);
                          onDeactivate(crew.id);
                        }}
                        disabled={deactivatingId === crew.id}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {deactivatingId === crew.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          "Yes"
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onAddMember(crew)}
                        title="Add member"
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <UserPlus size={15} />
                      </button>
                      <button
                        onClick={() => onEdit(crew)}
                        title="Edit crew"
                        className="p-1.5 text-gray-500 hover:text-[#021422] hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      {crew.is_active && (
                        <button
                          onClick={() => setConfirmId(crew.id)}
                          title="Deactivate crew"
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
