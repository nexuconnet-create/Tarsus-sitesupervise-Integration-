"use client";

import React, { useState } from "react";
import { Users, Search, Trash2, Crown, Loader2 } from "lucide-react";
import type { Crew, CrewMember } from "@/lib/services/crewService";
import { CREW_TRADES } from "@/lib/services/crewService";

interface FlatMember {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  trade: string;
  profile_picture_url?: string;
  member_code: string;
  role: string;
  crew_name: string;
  crew_id: string;
}

interface MembersDirectoryProps {
  members: FlatMember[];
  crews: Crew[];
  loading: boolean;
  onRemove: (memberId: string, crewId: string) => void;
  removingId?: string;
  onAddMember: () => void;
}

function tradeLabelFromValue(value: string): string {
  return CREW_TRADES.find((t) => t.value === value)?.label ?? value;
}

export default function MembersDirectory({
  members,
  crews,
  loading,
  onRemove,
  removingId,
  onAddMember,
}: MembersDirectoryProps) {
  const [filterCrew, setFilterCrew] = useState("all");
  const [filterTrade, setFilterTrade] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = members.filter((m) => {
    if (filterCrew !== "all" && m.crew_name !== filterCrew) return false;
    if (filterTrade !== "all" && m.trade !== filterTrade) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !m.first_name?.toLowerCase().includes(q) &&
        !m.last_name?.toLowerCase().includes(q) &&
        !m.member_code?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">
        Crew Member List
      </h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-500">Filter:</span>
          </div>
          <select
            value={filterCrew}
            onChange={(e) => setFilterCrew(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
          >
            <option value="all">All Crews</option>
            {crews.map((crew) => (
              <option key={crew.id} value={crew.name}>{crew.name}</option>
            ))}
          </select>
          <select
            value={filterTrade}
            onChange={(e) => setFilterTrade(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
          >
            <option value="all">All Trades</option>
            {CREW_TRADES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 size={22} className="animate-spin mr-2" />
            <span>Loading members…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Member</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Trade</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Crew</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Phone</th>
                  <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">
                      {members.length === 0 ? "No members yet. Add your first member." : "No members match your filters."}
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {member.profile_picture_url ? (
                            <img src={member.profile_picture_url} alt={`${member.first_name} ${member.last_name}`} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                              {member.first_name[0]}{member.last_name[0]}
                            </div>
                          )}
                          <span className="text-sm font-medium text-[#021422]">{member.first_name} {member.last_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">{tradeLabelFromValue(member.trade)}</span>
                        <p className="text-[10px] text-gray-400">{member.member_code}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{member.crew_name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{member.phone_number || "—"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {member.role === "foreman" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                              <Crown size={10} /> Foreman
                            </span>
                          )}
                          <button
                            onClick={() => onRemove(member.id, member.crew_id)}
                            disabled={removingId === member.id}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Remove member"
                          >
                            {removingId === member.id ? (
                              <Loader2 size={14} className="animate-spin text-red-500" />
                            ) : (
                              <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Showing {filteredMembers.length} of {members.length} members
          </span>
          <button
            onClick={onAddMember}
            className="text-xs font-bold text-[#007AFF] hover:underline"
          >
            + Add New Member
          </button>
        </div>
      </div>
    </div>
  );
}
