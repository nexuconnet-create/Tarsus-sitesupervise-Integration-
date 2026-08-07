"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Settings,
  Link as LinkIcon,
  Check,
  Loader2,
  Bell,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { staffService } from "@/lib/services";
import { crewService } from "@/lib/services/crewService";
import { getErrorMessage } from "@/lib/error";
import { Toaster, toast } from "react-hot-toast";
import CrewHeader from "../component/CrewHeader";
import TemplatesLibrary from "./components/TemplatesLibrary";
import CrewTable from "./components/CrewTable";
import MembersTable from "./components/MembersTable";
import MembersDirectory from "./components/MembersDirectory";
import PoolWorkersSection from "./components/PoolWorkersSection";
import CreateEditCrewModal from "./components/CreateEditCrewModal";
import AddEditMemberModal from "./components/AddEditMemberModal";
import ImportCrewModal from "./components/ImportCrewModal";
import RegisterPoolWorkerModal from "./components/RegisterPoolWorkerModal";
import type { Crew, CrewMember, PoolWorkerDetail } from "@/lib/services/crewService";
import { orgService } from "@/lib/services/orgService";
import {
  prayerService,
  to12Hour,
  to24Hour,
  PRAYER_LEAD_TIMES,
  type PrayerName,
  type PrayerSetting,
} from "@/lib/services/prayerService";
import { crewKeys, orgKeys } from "@/lib/queryKeys";

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

export default function CrewSettingsPage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const { getProject, loading: membershipsLoading } = useMemberships();
  const { data: projectUuid } = useProjectUuid(orgSlug, projectSlug);
  const { data: orgData } = useQuery({
    queryKey: orgKeys.detail(orgSlug),
    queryFn: () => orgService.getOrg(orgSlug).then((r) => r.data),
    enabled: !!orgSlug,
  });
  const orgId = ((orgData as { id?: string })?.id ?? "") as string;
  const qc = useQueryClient();
  const project = getProject(orgSlug, projectSlug);
  const projectId = projectUuid ?? undefined;

  // ── Data queries ───────────────────────────────────────────────────────
  const { data: crewsData, isLoading: crewsLoading } = useQuery({
    queryKey: crewKeys.crews(projectId),
    queryFn: () => crewService.listCrews(projectId!).then((r) => r.data),
    enabled: !!projectId,
  });
  const crews: Crew[] = Array.isArray(crewsData) ? crewsData : crewsData?.results ?? [];

  const { data: allMembersData, isLoading: membersLoading } = useQuery({
    queryKey: crewKeys.allMembers(projectId),
    queryFn: () => crewService.listAllMembers(projectId!).then((r) => r.data),
    enabled: !!projectId,
  });
  const allMembers: FlatMember[] = Array.isArray(allMembersData)
    ? allMembersData
    : allMembersData?.results ?? [];

  const { data: poolWorkersData, isLoading: poolWorkersLoading } = useQuery({
    queryKey: crewKeys.poolWorkers(orgId),
    queryFn: () => crewService.listPoolWorkers(orgId).then((r) => r.data),
    enabled: !!orgId,
  });
  const poolWorkers: PoolWorkerDetail[] = Array.isArray(poolWorkersData)
    ? poolWorkersData
    : poolWorkersData?.results ?? [];

  // Selected crew drill-down
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);

  const { data: drillDownMembersData, isLoading: drillDownLoading } = useQuery({
    queryKey: crewKeys.members(projectId, selectedCrew?.id),
    queryFn: () => crewService.listMembers(projectId!, selectedCrew!.id).then((r) => r.data),
    enabled: !!projectId && !!selectedCrew,
  });
  const drillDownMembers: CrewMember[] = Array.isArray(drillDownMembersData)
    ? drillDownMembersData
    : drillDownMembersData?.results ?? [];

  // ── Mutations ──────────────────────────────────────────────────────────
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => crewService.deactivateCrew(projectId!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crewKeys.crews(projectId) });
      if (selectedCrew && deactivateMutation.variables === selectedCrew.id) {
        setSelectedCrew(null);
      }
      toast.success("Crew deactivated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ memberId, crewId }: { memberId: string; crewId: string }) =>
      crewService.removeMember(projectId!, crewId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crewKeys.allMembers(projectId) });
      if (selectedCrew) {
        qc.invalidateQueries({ queryKey: crewKeys.members(projectId, selectedCrew.id) });
      }
      toast.success("Member removed");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const setForemanMutation = useMutation({
    mutationFn: (id: string) => crewService.setForeman(projectId!, selectedCrew!.id, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crewKeys.members(projectId, selectedCrew?.id) });
      qc.invalidateQueries({ queryKey: crewKeys.allMembers(projectId) });
      toast.success("Foreman updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deactivatePoolWorkerMutation = useMutation({
    mutationFn: (id: string) => crewService.deactivatePoolWorker(orgId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crewKeys.poolWorkers(orgId) });
      toast.success("Pool worker deactivated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const reactivatePoolWorkerMutation = useMutation({
    mutationFn: (id: string) => crewService.reactivatePoolWorker(orgId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crewKeys.poolWorkers(orgId) });
      toast.success("Pool worker reactivated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // ── Work Rules ─────────────────────────────────────────────────────────
  const [rules, setRules] = useState<{ id: number; text: string; checked: boolean }[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!projectId) { setSettingsLoading(false); return; }
      try {
        const [workRulesRes, notifRes] = await Promise.allSettled([
          staffService.getWorkRules(projectId),
          staffService.getNotificationSettings(),
        ]);
        if (workRulesRes.status === "fulfilled" && workRulesRes.value?.data) {
          const data = workRulesRes.value.data;
          const rulesList: Record<string, unknown>[] = Array.isArray(data) ? data : data.rules || data.results || [];
          setRules(rulesList.map((r, idx) => ({
            id: (r.id as number) ?? idx + 1,
            text: (r.text || r.description || r.name || r.rule || "") as string,
            checked: (r.checked ?? r.enabled ?? r.is_active ?? false) as boolean,
          })));
        }
        if (notifRes.status === "fulfilled" && notifRes.value?.data) {
          const data = notifRes.value.data;
          const notifList: Record<string, unknown>[] = Array.isArray(data) ? data : data.notifications || data.settings || data.results || [];
          setNotifications(notifList.map((n) => (n.message || n.description || n.text || n.name || JSON.stringify(n)) as string));
        }
      } catch (err) {
        console.error("Settings fetch error:", err);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, [projectId]);

  const toggleRule = async (id: number) => {
    const updatedRules = rules.map((rule) => rule.id === id ? { ...rule, checked: !rule.checked } : rule);
    setRules(updatedRules);
    if (projectId) {
      try {
        await staffService.updateWorkRules(projectId, { rules: updatedRules.map((r) => ({ id: r.id, enabled: r.checked })) });
      } catch (err) {
        console.error("Failed to save rule toggle:", err);
      }
    }
  };

  // ── Prayer Time ────────────────────────────────────────────────────────
  const PRAYER_INFO = [
    { key: "fajr", name: "Fajr" },
    { key: "dhuhr", name: "Dhuhr" },
    { key: "asr", name: "Asr" },
    { key: "maghrib", name: "Maghrib" },
    { key: "isha", name: "Isha" },
  ] as const;

  // Browser IANA timezone (e.g. "Africa/Lagos") — used as the default when the
  // backend row has none yet. The backend validates this against the IANA list.
  const browserTz = React.useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );
  const timezoneOptions = React.useMemo<string[]>(() => {
    const supported =
      typeof (Intl as { supportedValuesOf?: (k: string) => string[] })
        .supportedValuesOf === "function"
        ? (
            Intl as { supportedValuesOf: (k: string) => string[] }
          ).supportedValuesOf("timeZone")
        : [];
    const list = supported.length ? supported : [browserTz, "UTC"];
    return list.includes(browserTz) ? list : [browserTz, ...list];
  }, [browserTz]);

  type PrayerRowState = { enabled: boolean; time: string };
  const [prayerSettings, setPrayerSettings] = useState<{
    enabled: boolean;
    leadTime: number;
    timezone: string;
    prayers: Record<PrayerName, PrayerRowState>;
  }>({
    enabled: false,
    leadTime: 10,
    timezone: browserTz,
    prayers: {
      fajr: { enabled: true, time: "05:00" },
      dhuhr: { enabled: true, time: "13:00" },
      asr: { enabled: true, time: "16:30" },
      maghrib: { enabled: true, time: "18:30" },
      isha: { enabled: true, time: "20:00" },
    },
  });

  const { data: prayerData, isLoading: prayerLoading } = useQuery<PrayerSetting>({
    queryKey: ["prayer-settings", projectId],
    queryFn: () => prayerService.getSettings(projectId!).then((r) => r.data),
    enabled: !!projectId,
  });

  // Hydrate the editable form from the server row the first time it loads and
  // whenever a fresh row arrives. Done during render (React's recommended
  // "adjust state when data changes" pattern) instead of in an effect, which
  // avoids the cascading-render lint rule.
  const [syncedRow, setSyncedRow] = useState<PrayerSetting | null>(null);
  if (prayerData && prayerData !== syncedRow) {
    setSyncedRow(prayerData);
    const byName = new Map(
      (prayerData.configs ?? []).map((c) => [c.prayer_name, c]),
    );
    const first = prayerData.configs?.[0];
    setPrayerSettings((prev) => ({
      enabled: prayerData.is_enabled,
      timezone: prayerData.timezone || browserTz,
      leadTime: first?.lead_time_minutes ?? 10,
      prayers: PRAYER_INFO.reduce(
        (acc, p) => {
          const cfg = byName.get(p.key);
          acc[p.key] = {
            enabled: cfg?.is_enabled ?? true,
            time: cfg ? to24Hour(cfg.time) : prev.prayers[p.key].time,
          };
          return acc;
        },
        {} as Record<PrayerName, PrayerRowState>,
      ),
    }));
  }

  const togglePrayer = (prayerKey: PrayerName) => {
    setPrayerSettings((prev) => ({
      ...prev,
      prayers: {
        ...prev.prayers,
        [prayerKey]: { ...prev.prayers[prayerKey], enabled: !prev.prayers[prayerKey].enabled },
      },
    }));
  };

  const updatePrayerTime = (prayerKey: PrayerName, time: string) => {
    setPrayerSettings((prev) => ({
      ...prev,
      prayers: {
        ...prev.prayers,
        [prayerKey]: { ...prev.prayers[prayerKey], time },
      },
    }));
  };

  const savePrayerMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error("No project selected.");
      // Master toggle + timezone first.
      await prayerService.updateSettings(projectId, {
        is_enabled: prayerSettings.enabled,
        timezone: prayerSettings.timezone,
      });
      // Then each prayer's toggle / time / lead time (single lead time applies
      // to all five, matching this UI's one "remind X before" control).
      await Promise.all(
        PRAYER_INFO.map((p) =>
          prayerService.updateConfig(projectId, p.key, {
            is_enabled: prayerSettings.prayers[p.key].enabled,
            time: to12Hour(prayerSettings.prayers[p.key].time),
            lead_time_minutes: prayerSettings.leadTime,
          }),
        ),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prayer-settings", projectId] });
      toast.success("Prayer notification settings saved!");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const handleSavePrayerSettings = () => savePrayerMutation.mutate();

  // ── Modal state ────────────────────────────────────────────────────────
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPoolWorkerModalOpen, setIsPoolWorkerModalOpen] = useState(false);
  const [editingPoolWorker, setEditingPoolWorker] = useState<PoolWorkerDetail | null>(null);

  const openCreateCrew = () => { setEditingCrew(null); setIsCrewModalOpen(true); };
  const openEditCrew = (crew: Crew) => { setEditingCrew(crew); setIsCrewModalOpen(true); };
  const openAddMember = () => { setEditingMember(null); setIsMemberModalOpen(true); };
  const openEditMember = (member: CrewMember) => { setEditingMember(member); setIsMemberModalOpen(true); };

  return (
    <div className="p-6 md:p-8 space-y-8 pb-32 bg-[#F8F9FA] min-h-screen">
      <CrewHeader title="Crew Settings" project={project?.name || projectSlug} />

      {/* Section 1: Crew Templates Library */}
      <TemplatesLibrary onAddMember={openAddMember} onImport={() => setIsImportModalOpen(true)} />

      {/* Section 2: Crews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422]">
            Crews
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={openAddMember}
              disabled={!projectId}
              className="px-5 py-2.5 bg-white border border-gray-200 text-[#021422] text-xs font-bold uppercase rounded shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Member
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              disabled={!projectId}
              className="px-5 py-2.5 bg-[#007AFF] text-white text-xs font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import
            </button>
            <button
              onClick={openCreateCrew}
              disabled={!projectId}
              className="px-5 py-2.5 bg-[#021422] text-white text-xs font-bold uppercase rounded shadow hover:bg-gray-900 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Crew
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {!selectedCrew ? (
            <CrewTable
              crews={crews}
              onEdit={openEditCrew}
              onDeactivate={(id) => deactivateMutation.mutate(id)}
              onViewMembers={(crew) => setSelectedCrew(crew)}
              onAddMember={(crew) => {
                setSelectedCrew(crew);
                setEditingMember(null);
                setIsMemberModalOpen(true);
              }}
              loading={crewsLoading}
              deactivatingId={deactivateMutation.isPending ? (deactivateMutation.variables as string) : undefined}
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedCrew(null)} className="p-1.5 text-gray-500 hover:text-[#021422] hover:bg-gray-100 rounded-lg transition-colors">
                    ← Back
                  </button>
                  <div>
                    <h3 className="text-sm font-bold text-[#021422]">{selectedCrew.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{selectedCrew.crew_code} · {selectedCrew.member_count} members</p>
                  </div>
                </div>
                <button onClick={openAddMember} className="px-4 py-2 bg-[#007AFF] text-white text-xs font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors">
                  Add Member
                </button>
              </div>
              <MembersTable
                members={drillDownMembers}
                crewName={selectedCrew.name}
                onEdit={openEditMember}
                onRemove={(id) => removeMemberMutation.mutate({ memberId: id, crewId: selectedCrew.id })}
                onSetForeman={(id) => setForemanMutation.mutate(id)}
                loading={drillDownLoading}
                removingId={removeMemberMutation.isPending ? (removeMemberMutation.variables?.memberId as string) : undefined}
                settingForemanId={setForemanMutation.isPending ? (setForemanMutation.variables as string) : undefined}
              />
            </>
          )}
        </div>
      </div>

      {/* Section 3: Members Directory */}
      <MembersDirectory
        members={allMembers}
        crews={crews}
        loading={membersLoading}
        onRemove={(memberId, crewId) => removeMemberMutation.mutate({ memberId, crewId })}
        removingId={removeMemberMutation.isPending ? (removeMemberMutation.variables?.memberId as string) : undefined}
        onAddMember={openAddMember}
      />

      {/* Section 4: Pool Workers */}
      <PoolWorkersSection
        poolWorkers={poolWorkers}
        loading={poolWorkersLoading}
        onRegister={() => { setEditingPoolWorker(null); setIsPoolWorkerModalOpen(true); }}
        onEdit={(worker) => { setEditingPoolWorker(worker); setIsPoolWorkerModalOpen(true); }}
        onDeactivate={(id) => deactivatePoolWorkerMutation.mutate(id)}
        onReactivate={(id) => reactivatePoolWorkerMutation.mutate(id)}
        deactivatingId={deactivatePoolWorkerMutation.isPending ? (deactivatePoolWorkerMutation.variables as string) : undefined}
        reactivatingId={reactivatePoolWorkerMutation.isPending ? (reactivatePoolWorkerMutation.variables as string) : undefined}
      />

      {/* Section 5: Work Rules & Policies */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">Work Rules & Policies</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings size={20} className="text-[#021422]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#021422]">Configurable Rules</h3>
          </div>
          <div className="space-y-4 ml-1 md:ml-8 mb-10">
            {settingsLoading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 size={16} className="animate-spin" /> Loading rules…</div>
            ) : rules.length === 0 ? (
              <p className="text-sm text-gray-400">No work rules configured.</p>
            ) : (
              rules.map((rule) => (
                <label key={rule.id} className="flex items-center gap-4 cursor-pointer group" onClick={() => toggleRule(rule.id)}>
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${rule.checked ? "bg-[#007AFF] border-[#007AFF]" : "border-gray-300 group-hover:border-[#007AFF]"}`}>
                    {rule.checked && <Check size={14} className="text-white" />}
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors select-none">{rule.text}</span>
                </label>
              ))
            )}
          </div>
          <div className="ml-1 md:ml-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">Notification Settings</h4>
            {notifications.length === 0 ? (
              <p className="text-xs text-gray-400">No notification settings available.</p>
            ) : (
              <ul className="space-y-4 text-xs text-gray-600">
                {notifications.map((notif, idx) => (
                  <li key={idx} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400" />{notif}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Section 6: Prayer Time Notifications */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">Prayer Time Notifications</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-[#021422]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#021422]">Islamic Solat Prayer Reminders</h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[10px] font-medium text-gray-500">{prayerSettings.enabled ? "ON" : "OFF"}</span>
              <div onClick={() => setPrayerSettings((prev) => ({ ...prev, enabled: !prev.enabled }))} className={`w-9 h-5 rounded-full transition-colors ${prayerSettings.enabled ? "bg-[#007AFF]" : "bg-gray-300"} relative`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${prayerSettings.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
            </label>
          </div>
          <div className="flex items-center justify-between gap-2 mb-3 p-2 bg-gray-50 rounded">
            <span className="text-[10px] font-medium text-gray-500">Timezone</span>
            <select
              value={prayerSettings.timezone}
              onChange={(e) =>
                setPrayerSettings((prev) => ({ ...prev, timezone: e.target.value }))
              }
              className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-medium text-[#021422] focus:outline-none focus:ring-1 focus:ring-[#007AFF] max-w-[60%]"
            >
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          {prayerLoading && (
            <p className="text-[10px] text-gray-400 mb-2">Loading saved settings…</p>
          )}
          <div className="space-y-2 mb-3">
            {PRAYER_INFO.map((prayer) => (
              <div key={prayer.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <button onClick={() => togglePrayer(prayer.key)} className={`w-8 h-4 rounded-full transition-colors ${prayerSettings.prayers[prayer.key as keyof typeof prayerSettings.prayers].enabled ? "bg-[#007AFF]" : "bg-gray-300"} relative flex-shrink-0`}>
                    <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${prayerSettings.prayers[prayer.key as keyof typeof prayerSettings.prayers].enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                  <p className="text-[11px] font-medium text-[#021422]">{prayer.name}</p>
                </div>
                <input type="time" value={prayerSettings.prayers[prayer.key as keyof typeof prayerSettings.prayers].time} onChange={(e) => updatePrayerTime(prayer.key, e.target.value)} className="w-20 px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-medium text-[#021422] focus:outline-none focus:ring-1 focus:ring-[#007AFF]" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Remind</span>
              <select value={prayerSettings.leadTime} onChange={(e) => setPrayerSettings((prev) => ({ ...prev, leadTime: parseInt(e.target.value) }))} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-[#007AFF]">
                {PRAYER_LEAD_TIMES.map((m) => (
                  <option key={m} value={m}>{m} min</option>
                ))}
              </select>
              <span className="text-[10px] text-gray-500">before</span>
            </div>
            <button onClick={handleSavePrayerSettings} disabled={savePrayerMutation.isPending || !projectId} className="px-4 py-1.5 bg-[#021422] text-white text-[10px] font-bold uppercase rounded hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center gap-1">
              {savePrayerMutation.isPending && <Loader2 size={12} className="animate-spin" />}
              {savePrayerMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Section 7: Integration Settings */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">Integration Settings</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <LinkIcon size={20} className="text-[#021422]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#021422]">Connected Settings</h3>
          </div>
          <ul className="space-y-4 ml-1 md:ml-8 mb-10 text-xs text-gray-600">
            {["Time & Attendance: Auto-sync crew check-ins", "Task Management: Auto-assign based on crew skills", "Inventory: Auto checkout table for assigned crews", "Finance: Auto-calculate labor costs per crew", "Safety: Auto-assign required training"].map((setting, idx) => (
              <li key={idx} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400" />{setting}</li>
            ))}
          </ul>
          <div className="ml-1 md:ml-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">Data Export</h4>
            <div className="flex gap-4 flex-wrap">
              <button className="px-4 py-3 bg-[#021422] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-gray-900 transition-colors">Daily Roster</button>
              <button className="px-4 py-3 bg-[#007AFF] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors">Weekly Productivity</button>
              <button className="px-4 py-3 bg-[#021422] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-gray-900 transition-colors">Labour Cost Analysis</button>
              <button className="px-4 py-3 bg-[#007AFF] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors">Crew Utilization</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {isCrewModalOpen && (
        <CreateEditCrewModal
          key={editingCrew?.id ?? "create-crew"}
          isOpen={isCrewModalOpen}
          onClose={() => setIsCrewModalOpen(false)}
          projectId={projectId ?? ""}
          editingCrew={editingCrew}
        />
      )}

      {isMemberModalOpen && (
        <AddEditMemberModal
          key={editingMember?.id ?? "add-member"}
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          projectId={projectId ?? ""}
          crewId={selectedCrew?.id}
          editingMember={editingMember}
        />
      )}

      {isImportModalOpen && (
        <ImportCrewModal
          key="import-crew"
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          projectId={projectId ?? ""}
        />
      )}

      {isPoolWorkerModalOpen && (
        <RegisterPoolWorkerModal
          key={editingPoolWorker?.id ?? "register-pool-worker"}
          isOpen={isPoolWorkerModalOpen}
          onClose={() => setIsPoolWorkerModalOpen(false)}
          orgId={orgId}
          editingWorker={editingPoolWorker}
        />
      )}

      <Toaster position="top-right" />
    </div>
  );
}
