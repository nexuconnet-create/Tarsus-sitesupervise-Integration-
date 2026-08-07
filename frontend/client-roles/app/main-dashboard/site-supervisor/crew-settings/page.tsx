"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FolderOpen,
  Settings,
  Link as LinkIcon,
  Check,
  X,
  Plus,
  Loader2,
  Users,
  Search,
  Edit2,
  Trash2,
  UserPlus,
  Upload,
  Camera,
  Bell,
} from "lucide-react";
import { staffService, clientService, crewManagerService } from "@/lib/services";
import { Toaster, toast } from "react-hot-toast";
import { getMockCrews } from "@/lib/mockData";

// Trade options for dropdown
const TRADES = [
  "Iron Worker",
  "Welder",
  "Electrician",
  "Plumber",
  "HVAC Technician",
  "Carpenter",
  "Concrete Finisher",
  "Rigger",
  "General Laborer",
  "Sheet Metal Worker",
];

// Member interface
interface Member {
  id: string;
  memberId: string;
  name: string;
  trade: string;
  phone: string;
  avatarUrl?: string;
  crewId: string;
  crewName: string;
}

// Mock members data
const MOCK_MEMBERS: Member[] = [
  { id: "m1", memberId: "IR-001", name: "John Martinez", trade: "Iron Worker", phone: "+1-555-0101", avatarUrl: "https://i.pravatar.cc/150?img=11", crewId: "crew-1", crewName: "Steel Crew A" },
  { id: "m2", memberId: "IR-002", name: "Carlos Rodriguez", trade: "Iron Worker", phone: "+1-555-0102", avatarUrl: "https://i.pravatar.cc/150?img=12", crewId: "crew-1", crewName: "Steel Crew A" },
  { id: "m3", memberId: "IR-003", name: "Mike Thompson", trade: "Iron Worker", phone: "+1-555-0103", avatarUrl: "https://i.pravatar.cc/150?img=13", crewId: "crew-1", crewName: "Steel Crew A" },
  { id: "m4", memberId: "EL-001", name: "David Kim", trade: "Electrician", phone: "+1-555-0104", avatarUrl: "https://i.pravatar.cc/150?img=14", crewId: "crew-2", crewName: "MEP Crew" },
  { id: "m5", memberId: "EL-002", name: "Sarah Chen", trade: "Electrician", phone: "+1-555-0105", avatarUrl: "https://i.pravatar.cc/150?img=15", crewId: "crew-2", crewName: "MEP Crew" },
  { id: "m6", memberId: "PL-001", name: "James Wilson", trade: "Plumber", phone: "+1-555-0106", avatarUrl: "https://i.pravatar.cc/150?img=16", crewId: "crew-2", crewName: "MEP Crew" },
  { id: "m7", memberId: "HV-001", name: "Robert Brown", trade: "HVAC Technician", phone: "+1-555-0107", avatarUrl: "https://i.pravatar.cc/150?img=17", crewId: "crew-2", crewName: "MEP Crew" },
  { id: "m8", memberId: "CP-001", name: "Chris Lee", trade: "Carpenter", phone: "+1-555-0108", avatarUrl: "https://i.pravatar.cc/150?img=18", crewId: "crew-3", crewName: "Carpenter Crew" },
  { id: "m9", memberId: "CP-002", name: "Kevin O'Brien", trade: "Carpenter", phone: "+1-555-0109", avatarUrl: "https://i.pravatar.cc/150?img=19", crewId: "crew-3", crewName: "Carpenter Crew" },
  { id: "m10", memberId: "CP-003", name: "Tom Garcia", trade: "Carpenter", phone: "+1-555-0110", avatarUrl: "https://i.pravatar.cc/150?img=20", crewId: "crew-3", crewName: "Carpenter Crew" },
  { id: "m11", memberId: "CF-001", name: "Frank Moore", trade: "Concrete Finisher", phone: "+1-555-0116", avatarUrl: "https://i.pravatar.cc/150?img=26", crewId: "crew-4", crewName: "Concrete Crew" },
  { id: "m12", memberId: "WL-001", name: "Alex Nguyen", trade: "Welder", phone: "+1-555-0111", avatarUrl: "https://i.pravatar.cc/150?img=21", crewId: "crew-1", crewName: "Steel Crew A" },
];

export default function CrewSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<
    { id: number; text: string; checked: boolean }[]
  >([]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [templates, setTemplates] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [projectName, setProjectName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplTrade, setTplTrade] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Member state
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [memberName, setMemberName] = useState("");
  const [memberTrade, setMemberTrade] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberCrewId, setMemberCrewId] = useState("");
  const [memberAvatar, setMemberAvatar] = useState("");
  const [memberAvatarPreview, setMemberAvatarPreview] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prayer notification state
  const [prayerSettings, setPrayerSettings] = useState({
    enabled: true,
    leadTime: 10,
    prayers: {
      fajr: { enabled: true, time: "05:45" },
      dhuhr: { enabled: true, time: "13:00" },
      asr: { enabled: true, time: "16:00" },
      maghrib: { enabled: true, time: "18:50" },
      isha: { enabled: true, time: "19:50" },
    },
  });

  const PRAYER_INFO = [
    { key: "fajr", name: "Fajr" },
    { key: "dhuhr", name: "Dhuhr" },
    { key: "asr", name: "Asr" },
    { key: "maghrib", name: "Maghrib" },
    { key: "isha", name: "Isha" },
  ];

  const togglePrayer = (prayerKey: string) => {
    setPrayerSettings((prev) => ({
      ...prev,
      prayers: {
        ...prev.prayers,
        [prayerKey]: {
          ...prev.prayers[prayerKey as keyof typeof prev.prayers],
          enabled:
            !prev.prayers[prayerKey as keyof typeof prev.prayers].enabled,
        },
      },
    }));
  };

  const updatePrayerTime = (prayerKey: string, time: string) => {
    setPrayerSettings((prev) => ({
      ...prev,
      prayers: {
        ...prev.prayers,
        [prayerKey]: {
          ...prev.prayers[prayerKey as keyof typeof prev.prayers],
          time,
        },
      },
    }));
  };

  const handleSavePrayerSettings = () => {
    setSaving(true);
    setTimeout(() => {
      toast.success("Prayer notification settings saved successfully!");
      setSaving(false);
    }, 500);
  };

  // Filter state
  const [filterCrew, setFilterCrew] = useState("all");
  const [filterTrade, setFilterTrade] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Get crews from mock data
  const crews = getMockCrews();

  const getProjectId = useCallback(() => {
    try {
      const proj = localStorage.getItem("selected_project");
      if (proj) {
        const parsed = JSON.parse(proj);
        return parsed.id || parsed.project_id || parsed;
      }
    } catch {}
    return null;
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      const projectId = getProjectId();

      try {
        const proj = localStorage.getItem("selected_project");
        if (proj) {
          try {
            const parsed = JSON.parse(proj);
            if (parsed.name || parsed.project_name) {
              setProjectName(parsed.name || parsed.project_name);
            }
          } catch {}
        }

        const [workRulesRes, templatesRes, notifRes, projectsRes] =
          await Promise.allSettled([
            projectId
              ? staffService.getWorkRules(projectId)
              : Promise.resolve(null),
            crewManagerService.getCrewTemplates(),
            staffService.getNotificationSettings(),
            clientService.getProjects(),
          ]);

        if (projectsRes.status === "fulfilled" && projectsRes.value?.data) {
          const data = projectsRes.value.data;
          const pList = Array.isArray(data) ? data : data.results || [];
          setProjects(pList);
          if (projectId) setSelectedProjectId(String(projectId));
        }

        if (workRulesRes.status === "fulfilled" && workRulesRes.value?.data) {
          const data = workRulesRes.value.data;
          const rulesList = Array.isArray(data)
            ? data
            : data.rules || data.results || [];
          setRules(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
            rulesList.map((r: any, idx: number) => ({
              id: r.id ?? idx + 1,
              text: r.text || r.description || r.name || r.rule || "",
              checked: r.checked ?? r.enabled ?? r.is_active ?? false,
            })),
          );
        }

        if (templatesRes.status === "fulfilled" && templatesRes.value?.data) {
          const data = templatesRes.value.data;
          const tList = Array.isArray(data) ? data : data.results || [];
          setTemplates(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
            tList.map((t: any, idx: number) => ({
              id: t.id ?? idx + 1,
              name: t.name || t.crew_name || `Template ${idx + 1}`,
              members:
                t.member_count || t.members_count || t.members?.length || 0,
              roles: t.roles || t.role_breakdown || "",
              certs: t.certifications || t.required_certifications || "",
              equipment: t.equipment || t.required_equipment || "",
              expanded: idx === 0,
            })),
          );
        }

        if (notifRes.status === "fulfilled" && notifRes.value?.data) {
          const data = notifRes.value.data;
          const notifList = Array.isArray(data)
            ? data
            : data.notifications || data.settings || data.results || [];
          setNotifications(
            notifList.map(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
              (n: any) =>
                n.message ||
                n.description ||
                n.text ||
                n.name ||
                JSON.stringify(n),
            ),
          );
        }
      } catch (err) {
        console.error("Settings fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [getProjectId]);

  const toggleRule = async (id: number) => {
    const updatedRules = rules.map((rule) =>
      rule.id === id ? { ...rule, checked: !rule.checked } : rule,
    );
    setRules(updatedRules);

    const projectId = getProjectId();
    if (projectId) {
      try {
        setSaving(true);
        await staffService.updateWorkRules(projectId, {
          rules: updatedRules.map((r) => ({ id: r.id, enabled: r.checked })),
        });
      } catch (err) {
        console.error("Failed to save rule toggle:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const createdBy = user?.id || user?.user_id;

    if (!selectedProjectId || !createdBy) {
      toast.error(
        "Please select a valid project and ensure you are logged in.",
      );
      return;
    }

    if (!tplName.trim() || !tplTrade.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: tplName,
        project: selectedProjectId,
        members: selectedMembers,
        default_trade: tplTrade,
        created_by: createdBy,
      };

      await crewManagerService.createCrewTemplate(payload);
      toast.success("Crew template created successfully!");
      setShowCreateModal(false);
      setTplName("");
      setTplTrade("");
      setSelectedMembers([]);
      window.location.reload();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to create template:", err);
      if (err.response?.data) {
        toast.error(err.response.data.message || "Validation failed");
      } else {
        toast.error(err.message || "Failed to create template");
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle member creation
  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();

    if (!memberName.trim() || !memberTrade.trim() || !memberCrewId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedCrew = crews.find((c) => c.id === memberCrewId);
    if (!selectedCrew) {
      toast.error("Please select a valid crew");
      return;
    }

    const newMember: Member = {
      id: `m${crypto.randomUUID()?.slice(0, 8)}`,
      memberId: `${memberTrade.substring(0, 2).toUpperCase()}-${String(members.filter(m => m.trade === memberTrade).length + 1).padStart(3, "0")}`,
      name: memberName.trim(),
      trade: memberTrade,
      phone: memberPhone.trim(),
      avatarUrl:
        memberAvatarPreview ||
        memberAvatar ||
        `https://i.pravatar.cc/150?img=1`,
      crewId: memberCrewId,
      crewName: selectedCrew.name,
    };

    setMembers((prev) => [...prev, newMember]);
    toast.success("Member added successfully!");

    setMemberName("");
    setMemberTrade("");
    setMemberPhone("");
    setMemberCrewId("");
    setMemberAvatar("");
    setMemberAvatarPreview(null);
    setShowMemberModal(false);
  };

  // Handle file upload for profile picture
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setMemberAvatarPreview(result);
        setMemberAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle member deletion
  const handleDeleteMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    toast.success("Member removed successfully");
  };

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesCrew = filterCrew === "all" || member.crewId === filterCrew;
    const matchesTrade = filterTrade === "all" || member.trade === filterTrade;
    const matchesSearch =
      !searchQuery ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.trade.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCrew && matchesTrade && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 pb-32 bg-[#F8F9FA] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="font-bold text-sm text-[#021422] uppercase tracking-wider">
          CREW SETTINGS & TEMPLATE
        </h1>
        <span className="text-sm font-semibold text-gray-500">
          Project: {projectName}
        </span>
      </div>

      {/* Section 1: Crew Templates Library */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">
          Crew Templates Library
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <FolderOpen size={20} className="text-[#021422]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#021422]">
              Saved Crew Configurations
            </h3>
          </div>

          <div className="space-y-6 ml-1 md:ml-8 mb-8">
            {templates.map((tpl) => (
              <div key={tpl.id}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                  <h4 className="text-sm font-medium text-gray-700">
                    {tpl.name} ({tpl.members} member
                    {tpl.members !== 1 ? "s" : ""})
                  </h4>
                </div>
                {tpl.expanded && (tpl.roles || tpl.certs || tpl.equipment) && (
                  <div className="pl-6 space-y-2 text-xs text-gray-500">
                    {tpl.roles && <p>Roles: {tpl.roles}</p>}
                    {tpl.certs && <p>Certifications: {tpl.certs}</p>}
                    {tpl.equipment && <p>Equipment: {tpl.equipment}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-[#021422] text-white text-xs font-bold uppercase rounded shadow hover:bg-gray-900 transition-colors"
            >
              Create New Template
            </button>
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-6 py-3 bg-[#007AFF] text-white text-xs font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <UserPlus size={14} />
              Add Member
            </button>
            <button className="px-6 py-3 bg-[#007AFF] text-white text-xs font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors">
              Import from Another Project
            </button>
          </div>
        </div>
      </div>

      {/* Section: Members Directory */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">
          Members Directory
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
                <option key={crew.id} value={crew.id}>
                  {crew.name}
                </option>
              ))}
            </select>
            <select
              value={filterTrade}
              onChange={(e) => setFilterTrade(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            >
              <option value="all">All Trades</option>
              {TRADES.map((trade) => (
                <option key={trade} value={trade}>
                  {trade}
                </option>
              ))}
            </select>
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Member
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Trade
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Crew
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Phone
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-gray-400 text-sm"
                    >
                      No members found
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm font-medium text-[#021422]">
                            {member.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {member.trade}
                        </span>
                        <p className="text-[10px] text-gray-400">{member.memberId}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {member.crewName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {member.phone || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Edit member"
                          >
                            <Edit2
                              size={14}
                              className="text-gray-400 hover:text-gray-600"
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors"
                            title="Remove member"
                          >
                            <Trash2
                              size={14}
                              className="text-gray-400 hover:text-red-500"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {filteredMembers.length} of {members.length} members
            </span>
            <button
              onClick={() => setShowMemberModal(true)}
              className="text-xs font-bold text-[#007AFF] hover:underline"
            >
              + Add New Member
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Work Rules & Policies */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">
          Work Rules & Policies
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings size={20} className="text-[#021422]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#021422]">
              Configurable Rule
            </h3>
          </div>

          <div className="space-y-4 ml-1 md:ml-8 mb-10">
            {rules.map((rule) => (
              <label
                key={rule.id}
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => toggleRule(rule.id)}
              >
                <div
                  className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${rule.checked ? "bg-[#007AFF] border-[#007AFF]" : "border-gray-300 group-hover:border-[#007AFF]"}`}
                >
                  {rule.checked && <Check size={14} className="text-white" />}
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors select-none">
                  {rule.text}
                </span>
              </label>
            ))}
          </div>

          <div className="ml-1 md:ml-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">
              Notification Settings
            </h4>
            <ul className="space-y-4 text-xs text-gray-600">
              {notifications.map((notif, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                  {notif}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Section: Prayer Time Notifications */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">
          Prayer Time Notifications
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-[#021422]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#021422]">
                Islamic Solat Prayer Reminders
              </h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[10px] font-medium text-gray-500">
                {prayerSettings.enabled ? "ON" : "OFF"}
              </span>
              <div
                onClick={() =>
                  setPrayerSettings((prev) => ({
                    ...prev,
                    enabled: !prev.enabled,
                  }))
                }
                className={`w-9 h-5 rounded-full transition-colors ${
                  prayerSettings.enabled ? "bg-[#007AFF]" : "bg-gray-300"
                } relative`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    prayerSettings.enabled ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
          </div>

          <div className="space-y-2 mb-3">
            {PRAYER_INFO.map((prayer) => (
              <div
                key={prayer.key}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePrayer(prayer.key)}
                    className={`w-8 h-4 rounded-full transition-colors ${
                      prayerSettings.prayers[
                        prayer.key as keyof typeof prayerSettings.prayers
                      ].enabled
                        ? "bg-[#007AFF]"
                        : "bg-gray-300"
                    } relative flex-shrink-0`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                        prayerSettings.prayers[
                          prayer.key as keyof typeof prayerSettings.prayers
                        ].enabled
                          ? "translate-x-4"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <p className="text-[11px] font-medium text-[#021422]">
                    {prayer.name}
                  </p>
                </div>
                <input
                  type="time"
                  value={
                    prayerSettings.prayers[
                      prayer.key as keyof typeof prayerSettings.prayers
                    ].time
                  }
                  onChange={(e) => updatePrayerTime(prayer.key, e.target.value)}
                  className="w-20 px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-medium text-[#021422] focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Remind</span>
              <select
                value={prayerSettings.leadTime}
                onChange={(e) =>
                  setPrayerSettings((prev) => ({
                    ...prev,
                    leadTime: parseInt(e.target.value),
                  }))
                }
                className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
              >
                <option value="5">5 min</option>
                <option value="10">10 min</option>
                <option value="15">15 min</option>
                <option value="20">20 min</option>
                <option value="30">30 min</option>
              </select>
              <span className="text-[10px] text-gray-500">before</span>
            </div>
            <button
              onClick={handleSavePrayerSettings}
              disabled={saving}
              className="px-4 py-1.5 bg-[#021422] text-white text-[10px] font-bold uppercase rounded hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Integration Settings */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">
          Integration Settings
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <LinkIcon size={20} className="text-[#021422]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#021422]">
              Connected Settings
            </h3>
          </div>

          <ul className="space-y-4 ml-1 md:ml-8 mb-10 text-xs text-gray-600">
            {[
              "Time & Attendance: Auto-sync crew check-ins",
              "Task Management: Auto-assign based on crew skills",
              "Inventory: Auto checkout table for assigned crews",
              "Finance: Auto-calculate labor costs per crew",
              "Safety: Auto-assign required training",
            ].map((setting, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                {setting}
              </li>
            ))}
          </ul>

          <div className="ml-1 md:ml-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#021422] mb-4">
              Data Export
            </h4>
            <div className="flex gap-4 flex-wrap">
              <button className="px-4 py-3 bg-[#021422] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-gray-900 transition-colors">
                Daily Roster
              </button>
              <button className="px-4 py-3 bg-[#007AFF] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors">
                Weekly Productivity
              </button>
              <button className="px-4 py-3 bg-[#021422] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-gray-900 transition-colors">
                Labour Cost Analysis
              </button>
              <button className="px-4 py-3 bg-[#007AFF] text-white text-[10px] font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors">
                Crew Utilization
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#021422]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-bold text-lg uppercase tracking-wider text-[#021422]">
                Create New Crew Designation
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Designation Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Steel Crew B"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Default Trade
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Steelwork"
                  value={tplTrade}
                  onChange={(e) => setTplTrade(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Task
                </label>
                <select
                  required
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                >
                  <option value="">Select Task</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.project_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-[#021422] text-xs font-bold uppercase rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-[#021422] text-white text-xs font-bold uppercase rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  {saving ? "Creating..." : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-[#021422]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-bold text-lg uppercase tracking-wider text-[#021422]">
                Add New Member
              </h3>
              <button
                onClick={() => setShowMemberModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. John Martinez"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Trade/Role *
                </label>
                <select
                  required
                  value={memberTrade}
                  onChange={(e) => setMemberTrade(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                >
                  <option value="">Select Trade</option>
                  {TRADES.map((trade) => (
                    <option key={trade} value={trade}>
                      {trade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Crew Category *
                </label>
                <select
                  required
                  value={memberCrewId}
                  onChange={(e) => setMemberCrewId(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                >
                  <option value="">Select Crew</option>
                  {crews.map((crew) => (
                    <option key={crew.id} value={crew.id}>
                      {crew.name} - {crew.trade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1-555-0101"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Profile Picture (optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {memberAvatarPreview ? (
                      <img
                        src={memberAvatarPreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Camera size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload size={14} />
                      {memberAvatarPreview ? "Change Photo" : "Upload Photo"}
                    </button>
                    {memberAvatarPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setMemberAvatarPreview(null);
                          setMemberAvatar("");
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="w-full mt-2 px-4 py-2 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                      >
                        Remove Photo
                      </button>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2">
                      Max file size: 5MB. Supported: JPG, PNG
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-[#021422] text-xs font-bold uppercase rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#007AFF] text-white text-xs font-bold uppercase rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus size={14} />
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}