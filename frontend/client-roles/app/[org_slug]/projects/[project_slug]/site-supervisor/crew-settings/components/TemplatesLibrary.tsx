"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { FolderOpen, Plus, Loader2, X } from "lucide-react";
import { crewManagerService, clientService } from "@/lib/services";
import { toast } from "react-hot-toast";

interface Template {
  id: number;
  name: string;
  members: number;
  roles: string;
  certs: string;
  equipment: string;
  expanded: boolean;
}

interface TemplatesLibraryProps {
  onAddMember: () => void;
  onImport: () => void;
}

export default function TemplatesLibrary({ onAddMember, onImport }: TemplatesLibraryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplTrade, setTplTrade] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  useEffect(() => {
    crewManagerService.getCrewTemplates().then((res) => {
      const data = res.data;
      const tList = Array.isArray(data) ? data : data.results || [];
      setTemplates(
        tList.map((t: any, idx: number) => ({
          id: t.id ?? idx + 1,
          name: t.name || t.crew_name || `Template ${idx + 1}`,
          members: t.member_count || t.members_count || t.members?.length || 0,
          roles: t.roles || t.role_breakdown || "",
          certs: t.certifications || t.required_certifications || "",
          equipment: t.equipment || t.required_equipment || "",
          expanded: idx === 0,
        })),
      );
    }).catch(() => {});

    clientService.getProjects().then((res) => {
      const data = res.data;
      setProjects(Array.isArray(data) ? data : data.results || []);
    }).catch(() => {});
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const createdBy = user?.id || user?.user_id;

    if (!selectedProjectId || !createdBy) {
      toast.error("Please select a valid project and ensure you are logged in.");
      return;
    }
    if (!tplName.trim() || !tplTrade.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      await crewManagerService.createCrewTemplate({
        name: tplName,
        project: selectedProjectId,
        members: [],
        default_trade: tplTrade,
        created_by: createdBy,
      });
      toast.success("Crew template created successfully!");
      setShowCreateModal(false);
      setTplName("");
      setTplTrade("");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to create template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
            {templates.length === 0 ? (
              <p className="text-xs text-gray-400">No templates yet.</p>
            ) : (
              templates.map((tpl) => (
                <div key={tpl.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <h4 className="text-sm font-medium text-gray-700">
                      {tpl.name} ({tpl.members} member{tpl.members !== 1 ? "s" : ""})
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
              ))
            )}
          </div>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-[#021422] text-white text-xs font-bold uppercase rounded shadow hover:bg-gray-900 transition-colors"
            >
              Create New Template
            </button>
            <button
              onClick={onAddMember}
              className="px-6 py-3 bg-[#007AFF] text-white text-xs font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <FolderOpen size={14} />
              Add Member
            </button>
            <button
              onClick={onImport}
              className="px-6 py-3 bg-[#007AFF] text-white text-xs font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors"
            >
              Import from Another Project
            </button>
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
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name || p.project_name}</option>
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
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {saving ? "Creating..." : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
