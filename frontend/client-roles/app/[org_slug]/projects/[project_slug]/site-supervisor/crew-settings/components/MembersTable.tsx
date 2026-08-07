"use client";

import React, { useState } from "react";
import { Edit2, Trash2, Star, Loader2, Users, AlertTriangle, Crown } from "lucide-react";
import type { CrewMember } from "@/lib/services/crewService";

interface MembersTableProps {
  members: CrewMember[];
  crewName: string;
  onEdit: (member: CrewMember) => void;
  onRemove: (id: string) => void;
  onSetForeman: (id: string) => void;
  loading: boolean;
  removingId?: string;
  settingForemanId?: string;
}

export default function MembersTable({
  members,
  crewName,
  onEdit,
  onRemove,
  onSetForeman,
  loading,
  removingId,
  settingForemanId,
}: MembersTableProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Loader2 size={22} className="animate-spin mr-2" />
        <span>Loading members…</span>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Users size={36} className="mb-3 opacity-40" />
        <p className="font-medium text-gray-500">No members in {crewName}</p>
        <p className="text-sm mt-1">Add the first member to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Member</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Code</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Trade</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {member.profile_picture_url ? (
                    <img
                      src={member.profile_picture_url}
                      alt={`${member.first_name} ${member.last_name}`}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      {member.first_name[0]}{member.last_name[0]}
                    </div>
                  )}
                  <span className="font-medium text-[#021422]">
                    {member.first_name} {member.last_name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500 font-mono text-xs">{member.member_code}</td>
              <td className="px-4 py-3 text-gray-600">{member.trade || "—"}</td>
              <td className="px-4 py-3 text-gray-600">{member.phone_number || "—"}</td>
              <td className="px-4 py-3">
                {member.role === "foreman" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <Crown size={11} />
                    Foreman
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Worker</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {confirmId === member.id ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                      <AlertTriangle size={14} className="text-red-500" />
                      <span className="text-xs text-red-700">Remove?</span>
                      <button
                        onClick={() => {
                          setConfirmId(null);
                          onRemove(member.id);
                        }}
                        disabled={removingId === member.id}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {removingId === member.id ? (
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
                      {member.role !== "foreman" && (
                        <button
                          onClick={() => onSetForeman(member.id)}
                          disabled={settingForemanId === member.id}
                          title="Set as foreman"
                          className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {settingForemanId === member.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Star size={14} />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(member)}
                        title="Edit member"
                        className="p-1.5 text-gray-500 hover:text-[#021422] hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmId(member.id)}
                        title="Remove member"
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
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
