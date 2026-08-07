"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, MessageSquare, Plus, X, Loader2, UserCircle, Menu, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { messagingService } from "@/lib/services/messaging";
import { adminService } from "@/lib/services/admin";
import { getErrorMessage } from "@/lib/error";
import { useAuthStore } from "@/lib/stores/authStore";
import type { MessagingTarget } from "@/lib/hooks/useChatSocket";
import type { PrivateChatRoom } from "@/lib/types/messaging";
import ChatPanel from "./ChatPanel";

const ROLE_ABBREVIATIONS: Record<string, string> = {
  "PROJECT ENGINEER": "PE",
  "SITE SUPERVISOR": "SS",
  "PROJECT MANAGER": "PM",
  "STRUCTURAL ENGINEER": "SE",
  "MECHANICAL ENGINEER": "ME",
  "ELECTRICAL ENGINEER": "EE",
  "CIVIL ENGINEER": "CE",
  "SAFETY OFFICER": "SO",
  "QUALITY CONTROL": "QC",
  "HSE OFFICER": "HSE",
  "CREW MANAGER": "CM",
  CLIENT: "CL",
  VENDOR: "VD",
  ADMIN: "ADM",
  "SITE ENGINEER": "SE",
  "QUANTITY SURVEYOR": "QS",
  ARCHITECT: "ARCH",
};

function getRoleAbbreviation(role: string): string {
  const normalized = role.replace(/_/g, " ").toUpperCase();
  return (
    ROLE_ABBREVIATIONS[normalized] ??
    role
      .replace(/_/g, " ")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
  );
}

interface MessagesViewProps {
  projectUuid: string | null | undefined;
  projectName?: string;
}

interface DirectoryUser {
  uuid: string;
  name: string;
}

export default function MessagesView({
  projectUuid,
  projectName,
}: MessagesViewProps) {
  const myUuid = useAuthStore((s) => s.user?.uuid);
  const user = useAuthStore((s) => s.user);
  const [rooms, setRooms] = useState<PrivateChatRoom[]>([]);
  // null = no explicit selection yet → defaults to the project room (derived below).
  const [target, setTarget] = useState<MessagingTarget | null>(null);
  const [selectedRoomUuid, setSelectedRoomUuid] = useState<string | null>(null);
  const [showNewDM, setShowNewDM] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Effective target: explicit selection, else the project room once available.
  const activeTarget: MessagingTarget | null =
    target ?? (projectUuid ? { kind: "project", projectUuid } : null);

  useEffect(() => {
    if (!projectUuid) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await messagingService.listPrivateRooms(projectUuid);
        if (!cancelled) setRooms(Array.isArray(res.data) ? res.data : []);
      } catch {
        /* non-fatal */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectUuid]);

  const selectProject = () => {
    if (!projectUuid) return;
    setSelectedRoomUuid(null);
    setTarget({ kind: "project", projectUuid });
    setSidebarOpen(false);
  };

  const selectRoom = (room: PrivateChatRoom) => {
    setSelectedRoomUuid(room.uuid);
    setTarget({ kind: "private", roomUuid: room.uuid });
    setSidebarOpen(false);
  };

  const handleStartDM = async (user: DirectoryUser) => {
    if (!projectUuid) return;
    try {
      const res = await messagingService.createPrivateRoom(projectUuid, user.uuid);
      const room = res.data;
      setRooms((prev) =>
        prev.some((r) => r.uuid === room.uuid) ? prev : [room, ...prev],
      );
      setShowNewDM(false);
      selectRoom(room);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (projectUuid === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!projectUuid) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-gray-500">
        No project selected. Pick a project to open messages.
      </div>
    );
  }

  const isProjectActive = activeTarget?.kind === "project";

  const formatDateTime = (date: Date) => {
    return (
      <>
        {date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
        {" · "}
        {date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const capitalizeTitle = (str: string) => {
    return str
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const fullName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.fullname || user?.name || user?.username || "";

  const rawRole = user?.role_name || user?.role || "";
  const roleAbbr = rawRole ? getRoleAbbreviation(rawRole) : "";
  const specialization = user?.specialization || "";

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between bg-white py-5 px-4 shrink-0 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back"
          >
            <ChevronLeft size={20} className="text-[#021422]" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-[#021422]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold uppercase tracking-wide text-[#021422]">
                Project Communication
              </h1>
              <span className="text-sm font-medium text-gray-600">
                · {capitalizeTitle(projectName || "Project")}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              {formatDateTime(now)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {fullName && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#021422] leading-tight">
                {fullName}
                {specialization && (
                  <span className="font-normal text-gray-700 italic">
                    {" "}({specialization})
                  </span>
                )}
              </p>
              {roleAbbr && (
                <p className="text-xs text-left font-semibold tracking-wide text-gray-900 mt-0.5">
                  Role: <span className="font-normal text-gray-700">{roleAbbr}</span>
                </p>
              )}
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/profile.jpg"
            alt="Profile"
            className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-[#021422]/10 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = document.createElement("div");
              fallback.className =
                "w-10 h-10 rounded-full bg-[#021422] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-[#021422]/10";
              fallback.textContent = getInitials(fullName);
              e.currentTarget.parentElement?.appendChild(fallback);
            }}
          />
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0 p-4 relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Conversation sidebar */}
        <div
          className={`w-72 bg-white rounded-r-2xl shadow-sm border border-gray-100 flex flex-col shrink-0 transition-transform duration-300 z-40
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:rounded-2xl lg:translate-x-0 lg:relative lg:z-auto
            fixed left-0 top-[80px] bottom-0 lg:static`}
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-xs tracking-wide uppercase text-[#021422]">
              Conversations
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewDM(true)}
                className="text-[#0070D4] hover:text-[#005bb5]"
                title="New direct message"
              >
                <Plus size={18} />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {/* Project room */}
            <button
              onClick={selectProject}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                isProjectActive
                  ? "bg-[#021422] text-white"
                  : "hover:bg-gray-50 text-[#021422]"
              }`}
            >
              <Users size={16} />
              <span className="text-xs font-bold">Project Chat Room</span>
            </button>

            <div className="px-3 pt-3 pb-1.5 text-[10px] uppercase font-bold text-gray-400">
              Direct Messages
            </div>
            {rooms.length === 0 ? (
              <p className="px-3 text-[11px] text-gray-400">No direct messages yet.</p>
            ) : (
              rooms.map((room) => {
                const active = selectedRoomUuid === room.uuid;
                return (
                  <button
                    key={room.uuid}
                    onClick={() => selectRoom(room)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      active
                        ? "bg-[#021422] text-white"
                        : "hover:bg-gray-50 text-[#021422]"
                    }`}
                  >
                    <UserCircle size={16} />
                    <span className="text-xs font-medium truncate">
                      {room.other_participant_name}
                    </span>
                    {room.unread_count > 0 && (
                      <span className="ml-auto bg-[#0070D4] text-white text-[9px] rounded-full px-1.5 py-0.5">
                        {room.unread_count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat panel */}
        {activeTarget ? (
          <ChatPanel
            projectUuid={projectUuid}
            target={activeTarget}
            title={
              activeTarget.kind === "project"
                ? "Project Chat Room"
                : rooms.find((r) => r.uuid === selectedRoomUuid)
                    ?.other_participant_name || "Direct Message"
            }
            subtitle={
              activeTarget.kind === "project"
                ? "Everyone on the project"
                : "Direct message"
            }
          />
        ) : (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <MessageSquare size={36} className="text-gray-300" />
              <p className="text-sm">Select a conversation</p>
            </div>
          </div>
        )}
      </div>

      {showNewDM && (
        <NewDMModal
          projectUuid={projectUuid}
          myUuid={myUuid}
          onClose={() => setShowNewDM(false)}
          onPick={handleStartDM}
        />
      )}
    </div>
  );
}

function NewDMModal({
  projectUuid,
  myUuid,
  onClose,
  onPick,
}: {
  projectUuid: string;
  myUuid?: string;
  onClose: () => void;
  onPick: (user: DirectoryUser) => void;
}) {
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminService.getUsers({ project: projectUuid });
        const raw = Array.isArray(res.data)
          ? res.data
          : (res.data?.results ?? res.data?.data ?? []);
        const mapped: DirectoryUser[] = raw
          .map((u: Record<string, unknown>) => ({
            uuid: String(u.uuid ?? u.id ?? ""),
            name: String(
              u.fullname ?? u.name ?? u.username ?? u.email ?? "Unknown",
            ),
          }))
          .filter((u: DirectoryUser) => u.uuid && u.uuid !== myUuid);
        if (!cancelled) setUsers(mapped);
      } catch {
        if (!cancelled)
          setError("Could not load project members. You may not have access.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectUuid, myUuid]);

  const filtered = useMemo(
    () =>
      users.filter((u) =>
        u.name.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [users, search],
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[#021422]">New Direct Message</h3>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members…"
            className="w-full px-4 py-2 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#0070D4]"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <p className="text-sm text-gray-500 text-center py-6 px-4">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No members found.
            </p>
          ) : (
            filtered.map((u) => (
              <button
                key={u.uuid}
                onClick={() => onPick(u)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left"
              >
                <UserCircle size={22} className="text-gray-400" />
                <span className="text-sm font-medium text-[#021422]">
                  {u.name}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
