"use client";

import { useState, useMemo, Fragment } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  X,
  ChevronDown,
  Search,
  Percent,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  History,
  ShieldCheck,
  Upload,
  Download,
  FileSpreadsheet,
  Layers,
} from "lucide-react";
import type { Milestone } from "@/lib/types/milestone";
import { calcDuration } from "@/lib/types/milestone";
import { STATUS_CONFIG } from "@/app/[org_slug]/projects/[project_slug]/engineer/(office)/task-details/types";
import toast from "react-hot-toast";
import { useMockMilestoneStore } from "@/store/mockMilestoneStore";
import {
  DISTRIBUTION_LABELS,
  milestoneBudget,
  taskBudget,
  validateWeights,
  type DistributionModel,
  type WbsBaseline,
} from "@/lib/evm";
import { useWbsBaseline } from "@/lib/hooks/useWbsBaseline";
import { formatContractValue } from "@/lib/types/projectDetails";
import { downloadWbsTemplate } from "@/lib/excel/wbsTemplate";
import { parseWbsWorkbook, type WbsImportResult } from "@/lib/excel/wbsImport";

/** Weights are entered to 1dp on this page — round for display and for the
 * number input's value so floating-point rebalancing never shows as
 * "33.333333333336%". */
const round1 = (n: number) => Math.round(n * 10) / 10;

interface MilestonesPageProps {
  projectName: string;
  header: React.ReactNode;
}

export default function MilestonesPage({ projectName, header }: MilestonesPageProps) {
  // Milestone list is pure mock data (mockMilestoneStore) — no network calls.
  // The PV/EV baseline (milestone -> sub-milestone -> task, layered with
  // client-side weights/dates/distribution) comes from a hook shared with the
  // performance page, so an edit made here shows up there without a second
  // copy of this derivation.
  const milestoneStore = useMockMilestoneStore();
  const {
    milestones,
    baseline: wbsBaseline,
    subMilestoneStore,
    tasks,
    bac,
    currency,
    weightStore,
    getMilestoneWeight,
    getSubMilestoneWeight,
    getTaskDistribution,
    getTaskCustomCurve,
    unassignedTasksFor,
    projectWeightTotal,
    projectWeightValid,
    subMilestoneIssueFor,
    taskIssueFor,
  } = useWbsBaseline();

  // No auto-balance: rescaling every sibling proportionally to force a sum of
  // 100% would decide, on the system's behalf, which milestone/sub-milestone/
  // task absorbs the difference — that's a judgment call only the engineer
  // entering the numbers can make. Off-target weights just stay flagged
  // until someone edits them by hand.

  const handleMilestoneWeightChange = (id: string, value: string) => {
    if (weightStore.baselineStatus === "locked") return;
    const num = parseFloat(value);
    weightStore.setMilestoneWeights({ [id]: Number.isFinite(num) ? num : 0 });
  };

  const handleSubMilestoneWeightChange = (id: string, value: string) => {
    if (weightStore.baselineStatus === "locked") return;
    const num = parseFloat(value);
    weightStore.setSubMilestoneWeights({ [id]: Number.isFinite(num) ? num : 0 });
  };

  const handleTaskWeightChange = (id: string, value: string) => {
    if (weightStore.baselineStatus === "locked") return;
    const num = parseFloat(value);
    weightStore.setTaskWeights({ [id]: Number.isFinite(num) ? num : 0 });
  };

  const handleTaskDistributionChange = (taskId: string, value: DistributionModel) => {
    if (weightStore.baselineStatus === "locked") return;
    weightStore.setTaskDistribution(taskId, value);
  };

  const handleTaskDatesChange = (taskId: string, startDate: string, finishDate: string) => {
    if (weightStore.baselineStatus === "locked") return;
    weightStore.setTaskDates(taskId, startDate, finishDate);
  };

  const [expandedCurveTaskId, setExpandedCurveTaskId] = useState<string | null>(null);

  const handleTaskCustomCurveChange = (taskId: string, knotIndex: number, pct: number) => {
    if (weightStore.baselineStatus === "locked") return;
    const curve = [...getTaskCustomCurve(taskId)];
    const clamped = Math.min(100, Math.max(0, pct)) / 100;
    // Clamp to neighbours so the curve stays monotonic — PV can only rise.
    const lo = curve[knotIndex - 1] ?? 0;
    const hi = curve[knotIndex + 1] ?? 1;
    curve[knotIndex] = Math.min(hi, Math.max(lo, clamped));
    weightStore.setTaskCustomCurve(taskId, curve);
  };

  // Baseline approval / lock — once approved, weight edits are blocked in the
  // UI until a rebaseline is explicitly started, so a locked PMB can't drift
  // by accident. Guards mirror the disabled inputs below in case anything
  // ever calls these handlers directly.
  const isLocked = weightStore.baselineStatus === "locked";
  const currentVersion = weightStore.baselineHistory.length;
  const latestVersion = weightStore.baselineHistory[currentVersion - 1];
  const allWeightsValid = wbsBaseline.milestones.every(
    (m) => !subMilestoneIssueFor(m.id) && m.subMilestones.every((sm) => !taskIssueFor(sm.id)),
  );
  const canApprove = milestones.length > 0 && projectWeightValid && allWeightsValid;

  // Unset milestones default to an even split (see useWbsBaseline), which
  // always sums to exactly 100% by construction — showing a green "100%"
  // badge for that would look like a reviewed, correct baseline when nobody
  // has actually entered a weight yet. Only show the real validation once at
  // least one milestone has an explicit, PM-entered value.
  const hasExplicitWeights = milestones.some((m) => m.id in weightStore.milestoneWeight);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rebaselineReason, setRebaselineReason] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const handleApproveBaseline = () => {
    weightStore.approveBaseline(rebaselineReason.trim() || undefined);
    setShowApproveModal(false);
    setRebaselineReason("");
    toast.success(`Baseline approved — version ${currentVersion + 1} locked`);
  };

  const handleStartRebaseline = () => {
    weightStore.startRebaseline();
    toast.success("Baseline unlocked for editing");
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [weight, setWeight] = useState(0);
  // Level = 1-indexed position in the milestone list. Prefilled with the
  // next open slot, but editable — an engineer who picked the wrong spot (or
  // just wants to reorder the WBS) corrects it here rather than through a
  // separate drag-and-drop step.
  const [level, setLevel] = useState(1);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [subMilestoneModalMilestoneId, setSubMilestoneModalMilestoneId] = useState<string | null>(null);
  const [taskModalSubMilestoneId, setTaskModalSubMilestoneId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteSubMilestoneTargetId, setDeleteSubMilestoneTargetId] = useState<string | null>(null);

  // Sub-milestone create/edit — a small inline form inside the sub-milestone
  // modal, mirroring the milestone create/edit form on the main page.
  const [editingSubMilestoneId, setEditingSubMilestoneId] = useState<string | null>(null);
  const [subMilestoneName, setSubMilestoneName] = useState("");
  const [subMilestoneWeight, setSubMilestoneWeight] = useState(0);

  // Excel import — parses client-side, then shows the same validation this
  // page already has before anything is written. Milestones/sub-milestones
  // import fully (create-or-update by name); task rows can only set
  // weight/distribution/dates on a task that already exists under that
  // milestone — this page has no way to create a Task, that object lives in
  // a different feature (task-details).
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<WbsImportResult | null>(null);
  const [importFileName, setImportFileName] = useState("");

  const resetImport = () => {
    setImportResult(null);
    setImportFileName("");
  };

  const handleImportFile = async (file: File) => {
    setImportFileName(file.name);
    setImportResult(await parseWbsWorkbook(file));
  };

  const importPreviewBaseline: WbsBaseline | null =
    importResult && importResult.errors.length === 0
      ? {
          bac,
          milestones: importResult.milestones.map((m) => ({
            id: m.name,
            name: m.name,
            weight: m.weight,
            startDate: "",
            finishDate: "",
            subMilestones: m.subMilestones.map((sm) => ({
              id: `${m.name}::${sm.name}`,
              name: sm.name,
              weight: sm.weight,
              startDate: "",
              finishDate: "",
              tasks: sm.tasks.map((t) => ({
                id: t.title,
                name: t.title,
                weight: t.weight,
                progress: 0,
                startDate: t.startDate,
                finishDate: t.finishDate,
                distribution: t.distribution,
              })),
            })),
          })),
        }
      : null;
  const importValidation = importPreviewBaseline ? validateWeights(importPreviewBaseline) : null;

  const handleConfirmImport = () => {
    if (!importResult || importResult.errors.length > 0) return;
    if (isLocked) return;

    let milestonesCreated = 0;
    let milestonesUpdated = 0;
    let subMilestonesCreated = 0;
    let subMilestonesUpdated = 0;
    let taskRowsApplied = 0;
    let taskRowsSkipped = 0;

    for (const parsed of importResult.milestones) {
      const existingMilestone = milestones.find((m) => m.name.toLowerCase() === parsed.name.toLowerCase());
      let milestoneId: string;

      if (existingMilestone) {
        milestoneId = existingMilestone.id;
        milestonesUpdated++;
      } else {
        milestoneId = milestoneStore.create({
          name: parsed.name,
          start_date: new Date().toISOString().slice(0, 10),
          finish_date: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
        }).id;
        milestonesCreated++;
      }
      weightStore.setMilestoneWeights({ [milestoneId]: parsed.weight });

      const existingSubs = subMilestoneStore.subMilestones.filter((sm) => sm.milestoneId === milestoneId);
      const milestoneTasks = tasks.filter((t) => t.milestoneId === milestoneId);

      for (const parsedSub of parsed.subMilestones) {
        const existingSub = existingSubs.find((sm) => sm.name.toLowerCase() === parsedSub.name.toLowerCase());
        let subMilestoneId: string;

        if (existingSub) {
          subMilestoneId = existingSub.id;
          subMilestonesUpdated++;
        } else {
          subMilestoneId = subMilestoneStore.create({ name: parsedSub.name, milestoneId }).id;
          subMilestonesCreated++;
        }
        weightStore.setSubMilestoneWeights({ [subMilestoneId]: parsedSub.weight });

        for (const parsedTask of parsedSub.tasks) {
          const match = milestoneTasks.find((t) => t.title.toLowerCase() === parsedTask.title.toLowerCase());
          if (match) {
            weightStore.setTaskWeights({ [match.id]: parsedTask.weight });
            weightStore.setTaskDistribution(match.id, parsedTask.distribution);
            weightStore.setTaskDates(match.id, parsedTask.startDate, parsedTask.finishDate);
            subMilestoneStore.assignTask(match.id, subMilestoneId);
            taskRowsApplied++;
          } else {
            taskRowsSkipped++;
          }
        }
      }
    }

    toast.success(
      `Imported: ${milestonesCreated} new milestone(s), ${milestonesUpdated} updated; ` +
        `${subMilestonesCreated} new sub-milestone(s), ${subMilestonesUpdated} updated; ` +
        `${taskRowsApplied} task row(s) applied` +
        (taskRowsSkipped > 0 ? `, ${taskRowsSkipped} skipped (no matching task).` : "."),
    );
    setShowImportModal(false);
    resetImport();
  };

  const duration = calcDuration(startDate, finishDate);
  const isEditing = !!editingId;

  const searchFiltered = useMemo(
    () => milestones.filter((ms) => ms.name.toLowerCase().includes(search.toLowerCase())),
    [milestones, search],
  );

  const resetForm = () => {
    setName("");
    setDescription("");
    setStartDate("");
    setFinishDate("");
    setError("");
    setEditingId(null);
    // Default a new milestone's weight to whatever headroom is left below
    // 100%, so the project total doesn't jump further off-balance by default.
    setWeight(Math.max(0, round1(100 - projectWeightTotal)));
    // Next open slot at the bottom of the list — the common case — but still
    // just a starting value the engineer can overwrite.
    setLevel(milestones.length + 1);
  };

  const handleEdit = (ms: Milestone) => {
    setName(ms.name);
    setDescription(ms.description || "");
    setStartDate(ms.startDate);
    setFinishDate(ms.finishDate);
    setWeight(round1(getMilestoneWeight(ms.id)));
    setLevel(milestones.findIndex((m) => m.id === ms.id) + 1);
    setEditingId(ms.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Milestone name is required."); return; }
    if (!startDate) { setError("Start date is required."); return; }
    if (!finishDate) { setError("Finish date is required."); return; }
    if (new Date(finishDate) <= new Date(startDate)) { setError("Finish date must be after start date."); return; }
    if (!Number.isInteger(level) || level < 1) { setError("Level must be a whole number of 1 or more."); return; }
    setError("");

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      start_date: startDate,
      finish_date: finishDate,
    };

    // Weight is already a disabled input while locked, but guard the persist
    // too — a locked baseline shouldn't gain an unaccounted-for weight just
    // because a new milestone's name/dates were still editable.
    const persistWeight = weightStore.baselineStatus !== "locked";

    if (isEditing) {
      milestoneStore.update(editingId, data);
      if (persistWeight) weightStore.setMilestoneWeights({ [editingId]: weight });
      milestoneStore.reorder(editingId, level - 1);
      toast.success("Milestone updated");
    } else {
      const created = milestoneStore.create(data);
      if (persistWeight) weightStore.setMilestoneWeights({ [created.id]: weight });
      milestoneStore.reorder(created.id, level - 1);
      toast.success("Milestone created");
    }
    resetForm();
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      milestoneStore.remove(deleteTargetId);
      weightStore.removeMilestone(deleteTargetId);
      if (editingId === deleteTargetId) resetForm();
      setDeleteTargetId(null);
      toast.success("Milestone deleted");
    }
  };

  const resetSubMilestoneForm = (milestoneId: string) => {
    setEditingSubMilestoneId(null);
    setSubMilestoneName("");
    const ms = wbsBaseline.milestones.find((m) => m.id === milestoneId);
    const msWeight = ms?.weight ?? 0;
    const subTotal = ms?.subMilestones.reduce((acc, sm) => acc + sm.weight, 0) ?? 0;
    setSubMilestoneWeight(Math.max(0, round1(msWeight - subTotal)));
  };

  const handleSubMilestoneSubmit = (e: React.FormEvent, milestoneId: string) => {
    e.preventDefault();
    if (!subMilestoneName.trim() || isLocked) return;

    if (editingSubMilestoneId) {
      subMilestoneStore.update(editingSubMilestoneId, { name: subMilestoneName.trim(), milestoneId });
      weightStore.setSubMilestoneWeights({ [editingSubMilestoneId]: subMilestoneWeight });
      toast.success("Sub-milestone updated");
    } else {
      const created = subMilestoneStore.create({ name: subMilestoneName.trim(), milestoneId });
      weightStore.setSubMilestoneWeights({ [created.id]: subMilestoneWeight });
      toast.success("Sub-milestone created");
    }
    resetSubMilestoneForm(milestoneId);
  };

  const handleDeleteSubMilestoneConfirm = () => {
    if (deleteSubMilestoneTargetId) {
      subMilestoneStore.remove(deleteSubMilestoneTargetId);
      weightStore.removeSubMilestone(deleteSubMilestoneTargetId);
      if (editingSubMilestoneId === deleteSubMilestoneTargetId) setEditingSubMilestoneId(null);
      setDeleteSubMilestoneTargetId(null);
      toast.success("Sub-milestone deleted");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {header}

      <div className="px-4">
        {/* Baseline status */}
        {milestones.length > 0 && (
          <div
            className={`flex flex-wrap items-center justify-between gap-3 mb-4 p-4 rounded-xl border ${
              isLocked ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isLocked ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
              </span>
              <div>
                <p className="text-xs font-bold text-[#021422]">
                  {isLocked
                    ? `Baseline approved — version ${currentVersion}`
                    : currentVersion > 0
                      ? `Rebaselining from version ${currentVersion}`
                      : "Baseline not yet approved"}
                </p>
                <p className="text-[11px] text-gray-400">
                  {isLocked && latestVersion
                    ? `Locked ${new Date(latestVersion.approvedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}${latestVersion.reason ? ` — ${latestVersion.reason}` : ""}`
                    : isLocked
                      ? "Weight edits are locked in the milestones below."
                      : "Weights are editable. Approve once they're finalized to lock the PMB."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {currentVersion > 0 && (
                <button
                  onClick={() => setShowHistory((v) => !v)}
                  className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-[#021422]"
                >
                  <History size={11} />
                  History ({currentVersion})
                </button>
              )}
              {isLocked ? (
                <button
                  onClick={handleStartRebaseline}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-white transition-colors"
                >
                  <Unlock size={12} />
                  Start Rebaseline
                </button>
              ) : (
                <button
                  onClick={() => setShowApproveModal(true)}
                  disabled={!canApprove}
                  title={!canApprove ? "Milestone weights must sum to 100%, sub-milestone weights must sum to their milestone, and task weights must sum to their sub-milestone, first" : undefined}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#021422] text-white text-xs font-bold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShieldCheck size={12} />
                  Approve Baseline
                </button>
              )}
            </div>
          </div>
        )}

        {showHistory && currentVersion > 0 && (
          <div className="mb-4 -mt-2 bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {weightStore.baselineHistory
              .slice()
              .reverse()
              .map((v) => (
                <div key={v.version} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#021422]">Version {v.version}</span>
                    {v.reason && <span className="text-xs text-gray-500 ml-2">{v.reason}</span>}
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0">
                    {new Date(v.approvedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 px-4">
        {/* Left: Milestone List */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between mb-2 gap-2">
            <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider">
              Milestones ({searchFiltered.length})
            </h3>
            <div className="flex items-center gap-2">
              {milestones.length > 0 &&
                (hasExplicitWeights ? (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      projectWeightValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {projectWeightValid ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                    {projectWeightValid
                      ? "100% of PV"
                      : `${round1(projectWeightTotal)}% of PV — ${
                          projectWeightTotal < 100
                            ? `short ${round1(100 - projectWeightTotal)}%`
                            : `over ${round1(projectWeightTotal - 100)}%`
                        }`}
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500"
                    title="Weights haven't been set yet — this is an even split across milestones, not a reviewed baseline."
                  >
                    Not yet weighted
                  </span>
                ))}
              <button
                onClick={() => setShowImportModal(true)}
                disabled={isLocked}
                title={isLocked ? "Baseline is locked — start a rebaseline to import" : undefined}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <Upload size={12} />
                Import from Excel
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search milestones..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] focus:border-transparent bg-white"
            />
          </div>

          {searchFiltered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Calendar size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">
                {milestones.length === 0 ? "No milestones yet" : "No milestones match your search"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {milestones.length === 0
                  ? "Create your first milestone to start grouping tasks."
                  : "Try a different search term."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchFiltered.map((ms) => {
                const wbsMs = wbsBaseline.milestones.find((m) => m.id === ms.id);
                const msSubMilestones = wbsMs?.subMilestones ?? [];
                const msWeight = getMilestoneWeight(ms.id);
                const subIssue = subMilestoneIssueFor(ms.id);
                const hasExplicitSubWeights = msSubMilestones.some((sm) => sm.id in weightStore.subMilestoneWeight);
                const level = milestones.findIndex((m) => m.id === ms.id) + 1;
                return (
                  <div
                    key={ms.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-[#021422] truncate">
                            Level {level}: {ms.name}
                          </h4>
                        </div>
                        {ms.description && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{ms.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {ms.startDate} — {ms.finishDate}
                          </span>
                          <span className="font-semibold text-[#021422]">{ms.duration} days</span>
                        </div>

                        {/* PV weight — % of project, derived budget. A labeled,
                            tinted sub-panel so it reads as one related group of
                            controls instead of a loose field sharing a row. No
                            distribution here — that lives on the task, where the
                            real dates are. */}
                        <div className="mt-3 p-2.5 bg-gray-50 rounded-lg">
                          <div className="flex items-end gap-3">
                            <div>
                              <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider mb-1">Weight</p>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={round1(msWeight)}
                                  onChange={(e) => handleMilestoneWeightChange(ms.id, e.target.value)}
                                  min={0}
                                  max={100}
                                  step={0.1}
                                  disabled={isLocked}
                                  className="w-14 border border-gray-200 rounded px-1.5 py-1 text-xs font-bold text-[#021422] text-right bg-white focus:outline-none focus:ring-1 focus:ring-[#021422] disabled:bg-gray-100 disabled:text-gray-400"
                                />
                                <span className="text-xs text-gray-400">%</span>
                              </div>
                            </div>
                            <div className="ml-auto text-right">
                              <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider mb-1">Budget</p>
                              <p className="text-sm font-bold text-[#021422]">
                                {formatContractValue(milestoneBudget(bac, msWeight), currency)}
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEdit(ms)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#021422] hover:bg-gray-100 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(ms.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Sub-milestones list right here on the card — no need to
                        open the modal just to see what's under a milestone.
                        The modal (via "Manage") is still where they're
                        created/edited/deleted and where tasks live. */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                            Sub-milestones ({msSubMilestones.length})
                          </span>
                          {msSubMilestones.length > 0 &&
                            (hasExplicitSubWeights ? (
                              <span
                                className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                                  subIssue ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {subIssue ? <AlertTriangle size={9} /> : <CheckCircle2 size={9} />}
                                {round1(subIssue?.total ?? msWeight)}%
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-gray-400">Not yet weighted</span>
                            ))}
                        </span>
                        <button
                          onClick={() => { resetSubMilestoneForm(ms.id); setSubMilestoneModalMilestoneId(ms.id); }}
                          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 shrink-0"
                        >
                          Manage
                          <ChevronDown size={12} className="-rotate-90" />
                        </button>
                      </div>

                      {msSubMilestones.length === 0 ? (
                        <p className="text-[11px] text-gray-400">No sub-milestones yet.</p>
                      ) : (
                        <div className="space-y-0.5">
                          {msSubMilestones.map((sm, subIdx) => (
                            <button
                              key={sm.id}
                              onClick={() => { resetSubMilestoneForm(ms.id); setSubMilestoneModalMilestoneId(ms.id); }}
                              className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 text-left transition-colors"
                            >
                              <span className="min-w-0 flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-gray-400 shrink-0">
                                  {level}.{subIdx + 1}
                                </span>
                                <span className="text-xs text-[#021422] truncate">{sm.name}</span>
                              </span>
                              <span className="flex items-center gap-2 shrink-0">
                                {sm.startDate && sm.finishDate && (
                                  <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 rounded px-1.5 py-0.5">
                                    {sm.startDate} — {sm.finishDate}
                                  </span>
                                )}
                                <span className="text-[11px] font-bold text-[#021422] w-10 text-right">
                                  {round1(getSubMilestoneWeight(sm.id, sm.weight))}%
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Create/Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#021422] uppercase tracking-wider">
                {isEditing ? "Edit Milestone" : "Create Milestone"}
              </h3>
              {isEditing && (
                <button onClick={resetForm} className="p-1 rounded text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                  Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Foundation Phase"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief description of this phase..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                    Finish Date *
                  </label>
                  <input
                    type="date"
                    value={finishDate}
                    onChange={(e) => setFinishDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] focus:border-transparent"
                  />
                </div>
              </div>

              {startDate && finishDate && duration > 0 && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
                  Duration: <span className="font-bold text-[#021422]">{duration} days</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                  Weight (% of PV) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    min={0}
                    max={100}
                    step={0.1}
                    disabled={isLocked}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <Percent size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                  Level *
                </label>
                <input
                  type="number"
                  value={level}
                  onChange={(e) => setLevel(parseInt(e.target.value, 10) || 1)}
                  min={1}
                  max={isEditing ? milestones.length : milestones.length + 1}
                  step={1}
                  className="w-20 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-center font-bold text-[#021422] focus:outline-none focus:ring-2 focus:ring-[#021422] focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 flex items-center justify-between">
                <span>Milestone budget</span>
                <span className="font-bold text-[#021422]">{formatContractValue(milestoneBudget(bac, weight), currency)}</span>
              </div>

              {isLocked && (
                <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Baseline is locked. Weight can&apos;t be set here until a rebaseline is started.
                </p>
              )}

              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#021422] text-white rounded-lg text-sm font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                {isEditing ? "Update Milestone" : "Create Milestone"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Sub-milestone manager modal */}
      {subMilestoneModalMilestoneId && (() => {
        const ms = milestones.find((m) => m.id === subMilestoneModalMilestoneId);
        const wbsMs = wbsBaseline.milestones.find((m) => m.id === subMilestoneModalMilestoneId);
        if (!ms || !wbsMs) return null;
        const subIssue = subMilestoneIssueFor(ms.id);
        const hasExplicitSubWeights = wbsMs.subMilestones.some((sm) => sm.id in weightStore.subMilestoneWeight);
        const milestoneLevel = milestones.findIndex((m) => m.id === ms.id) + 1;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSubMilestoneModalMilestoneId(null)}
            />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative z-10">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#021422] truncate">
                    Level {milestoneLevel}: {ms.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Sub-milestone weights — % of the whole project, should total {round1(wbsMs.weight)}% for this milestone
                  </p>
                </div>
                <button
                  onClick={() => setSubMilestoneModalMilestoneId(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-2.5 border-b border-gray-100 shrink-0">
                {hasExplicitSubWeights ? (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      subIssue ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {subIssue ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                    {subIssue
                      ? `${round1(subIssue.total)}% of ${round1(subIssue.target)}% milestone — ${
                          subIssue.total < subIssue.target
                            ? `short ${round1(subIssue.target - subIssue.total)}%`
                            : `over ${round1(subIssue.total - subIssue.target)}%`
                        }`
                      : `${round1(wbsMs.weight)}% of ${round1(wbsMs.weight)}% milestone — fully allocated`}
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500"
                    title="No sub-milestone weights entered yet — this is an even split, not a reviewed value."
                  >
                    Not yet weighted
                  </span>
                )}
              </div>

              <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
                {wbsMs.subMilestones.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">
                    No sub-milestones yet. Create one below to start grouping tasks.
                  </p>
                )}
                {wbsMs.subMilestones.map((sm, subIndex) => {
                  const taskIssue = taskIssueFor(sm.id);
                  const hasExplicitTaskWeights = sm.tasks.some((t) => t.id in weightStore.taskWeight);
                  const smWeight = getSubMilestoneWeight(sm.id, sm.weight);
                  const smTaskDistributions = new Set(sm.tasks.map((t) => t.distribution));
                  const smDistributionLabel =
                    smTaskDistributions.size === 1
                      ? DISTRIBUTION_LABELS[[...smTaskDistributions][0]]
                      : smTaskDistributions.size > 1
                        ? "Mixed"
                        : null;
                  return (
                    <div key={sm.id} className="border border-gray-200 rounded-lg p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#021422] truncate">
                            {milestoneLevel}.{subIndex + 1} {sm.name}
                            {smDistributionLabel && (
                              <span className="font-normal text-gray-400"> ({smDistributionLabel})</span>
                            )}
                          </p>
                          {sm.startDate && sm.finishDate ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 bg-gray-100 rounded px-2 py-1 mt-1.5">
                              <Calendar size={11} className="text-gray-500" />
                              {sm.startDate} — {sm.finishDate}
                              <span className="text-gray-400 font-bold">· {calcDuration(sm.startDate, sm.finishDate)} days</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              Dates derive from its tasks — add a task to set them.
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingSubMilestoneId(sm.id);
                              setSubMilestoneName(sm.name);
                              setSubMilestoneWeight(round1(sm.weight));
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#021422] hover:bg-gray-100 transition-colors"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => setDeleteSubMilestoneTargetId(sm.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Weight/budget — same tinted-panel pattern as the milestone
                          card, so the two levels read as the same kind of control. */}
                      <div className="mt-2.5 p-2.5 bg-gray-50 rounded-lg flex items-end gap-3">
                        <div>
                          <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider mb-1">Weight</p>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={round1(smWeight)}
                              onChange={(e) => handleSubMilestoneWeightChange(sm.id, e.target.value)}
                              min={0}
                              max={100}
                              step={0.1}
                              disabled={isLocked}
                              className="w-14 border border-gray-200 rounded px-1.5 py-1 text-xs font-bold text-[#021422] text-right bg-white focus:outline-none focus:ring-1 focus:ring-[#021422] disabled:bg-gray-100 disabled:text-gray-400"
                            />
                            <span className="text-xs text-gray-400">%</span>
                          </div>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider mb-1">Budget</p>
                          <p className="text-sm font-bold text-[#021422]">
                            {formatContractValue(milestoneBudget(bac, smWeight), currency)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setTaskModalSubMilestoneId(sm.id)}
                        className="mt-2.5 pt-2.5 border-t border-gray-100 w-full flex items-center justify-between text-left group"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                            Tasks ({sm.tasks.length})
                          </span>
                          {sm.tasks.length > 0 &&
                            (hasExplicitTaskWeights ? (
                              <span
                                className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                                  taskIssue ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {taskIssue ? <AlertTriangle size={9} /> : <CheckCircle2 size={9} />}
                                {round1(taskIssue?.total ?? sm.weight)}%
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-gray-400">Not yet weighted</span>
                            ))}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:text-blue-700">
                          View Details
                          <ChevronDown size={12} className="-rotate-90" />
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={(e) => handleSubMilestoneSubmit(e, ms.id)}
                className="px-6 py-3 border-t border-gray-100 shrink-0 flex items-end gap-2"
              >
                <div className="flex-1">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                    {editingSubMilestoneId ? "Edit sub-milestone" : "New sub-milestone"}
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[9px] font-bold normal-case tracking-normal">
                      {milestoneLevel}.
                      {editingSubMilestoneId
                        ? wbsMs.subMilestones.findIndex((s) => s.id === editingSubMilestoneId) + 1
                        : wbsMs.subMilestones.length + 1}
                    </span>
                  </label>
                  <input
                    value={subMilestoneName}
                    onChange={(e) => setSubMilestoneName(e.target.value)}
                    placeholder="e.g., Piling & Foundation"
                    disabled={isLocked}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div className="w-20">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Weight</label>
                  <input
                    type="number"
                    value={subMilestoneWeight}
                    onChange={(e) => setSubMilestoneWeight(parseFloat(e.target.value) || 0)}
                    min={0}
                    max={100}
                    step={0.1}
                    disabled={isLocked}
                    className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#021422] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                {editingSubMilestoneId && (
                  <button
                    type="button"
                    onClick={() => resetSubMilestoneForm(ms.id)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLocked}
                  className="px-3 py-2 rounded-lg bg-[#021422] text-white text-xs font-bold hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Plus size={13} />
                  {editingSubMilestoneId ? "Save" : "Add"}
                </button>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Task weights modal — a real <table> so columns line up by construction,
          regardless of task-title or status-label length. Rendered once, driven
          by taskModalSubMilestoneId. Dates and the distribution curve are set
          here, per task — this is where PV is actually computed from. */}
      {taskModalSubMilestoneId && (() => {
        const parentMs = wbsBaseline.milestones.find((m) =>
          m.subMilestones.some((sm) => sm.id === taskModalSubMilestoneId),
        );
        const sm = parentMs?.subMilestones.find((s) => s.id === taskModalSubMilestoneId);
        const realMilestone = parentMs ? milestones.find((m) => m.id === parentMs.id) : undefined;
        if (!parentMs || !sm || !realMilestone) return null;
        const taskIssue = taskIssueFor(sm.id);
        const hasExplicitTaskWeights = sm.tasks.some((t) => t.id in weightStore.taskWeight);
        const unassigned = unassignedTasksFor(realMilestone.id);
        const milestoneLevel = milestones.findIndex((m) => m.id === realMilestone.id) + 1;
        const subMilestoneNumber = parentMs.subMilestones.findIndex((s) => s.id === sm.id) + 1;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setTaskModalSubMilestoneId(null)} />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col relative z-10">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#021422] truncate">
                    {milestoneLevel}.{subMilestoneNumber} {sm.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Task weights — % of the whole project, should total {round1(sm.weight)}% for this sub-milestone.
                    Dates and curve drive PV directly.
                  </p>
                </div>
                <button
                  onClick={() => setTaskModalSubMilestoneId(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-2.5 border-b border-gray-100 shrink-0">
                {hasExplicitTaskWeights ? (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      taskIssue ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {taskIssue ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                    {taskIssue
                      ? `${round1(taskIssue.total)}% of ${round1(taskIssue.target)}% sub-milestone — ${
                          taskIssue.total < taskIssue.target
                            ? `short ${round1(taskIssue.target - taskIssue.total)}%`
                            : `over ${round1(taskIssue.total - taskIssue.target)}%`
                        }`
                      : `${round1(sm.weight)}% of ${round1(sm.weight)}% sub-milestone — fully allocated`}
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500"
                    title="No task weights entered yet — this is an even split, not a reviewed value."
                  >
                    Not yet weighted
                  </span>
                )}
              </div>

              <div className="overflow-y-auto flex-1">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left px-6 py-2 text-[11px] font-bold uppercase text-[#021422] tracking-wider w-16">WBS #</th>
                      <th className="text-left px-3 py-2 text-[11px] font-bold uppercase text-[#021422] tracking-wider">Task</th>
                      <th className="text-left px-3 py-2 text-[11px] font-bold uppercase text-[#021422] tracking-wider">Start Date</th>
                      <th className="text-left px-3 py-2 text-[11px] font-bold uppercase text-[#021422] tracking-wider">Finish Date</th>
                      <th className="text-left px-3 py-2 text-[11px] font-bold uppercase text-[#021422] tracking-wider">Duration</th>
                      <th className="text-right px-3 py-2 text-[11px] font-bold uppercase text-[#021422] tracking-wider">Weight</th>
                      <th className="text-left px-3 py-2 text-[11px] font-bold uppercase text-[#021422] tracking-wider">Distribution</th>
                      <th className="text-right px-3 py-2 text-[11px] font-bold uppercase text-[#021422] tracking-wider">Value</th>
                      <th className="text-right px-6 py-2 text-[11px] font-bold uppercase text-[#021422] tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sm.tasks.map((task, index) => {
                      const realTask = tasks.find((t) => t.id === task.id);
                      const tsc = realTask ? STATUS_CONFIG[realTask.status] : undefined;
                      const isCurveOpen = expandedCurveTaskId === task.id;
                      return (
                        <Fragment key={task.id}>
                          <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 align-top">
                            <td className="px-6 py-2.5 text-xs text-gray-400 font-semibold whitespace-nowrap">
                              {milestoneLevel}.{subMilestoneNumber}.{index + 1}
                            </td>
                            <td className="px-3 py-2.5 text-xs text-[#021422] max-w-[160px]">{task.name}</td>
                            <td className="px-3 py-2.5">
                              <input
                                type="date"
                                value={task.startDate}
                                onChange={(e) => handleTaskDatesChange(task.id, e.target.value, task.finishDate)}
                                disabled={isLocked}
                                className="w-32 border border-gray-200 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#021422] disabled:bg-gray-50 disabled:text-gray-400"
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <input
                                type="date"
                                value={task.finishDate}
                                onChange={(e) => handleTaskDatesChange(task.id, task.startDate, e.target.value)}
                                disabled={isLocked}
                                className="w-32 border border-gray-200 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#021422] disabled:bg-gray-50 disabled:text-gray-400"
                              />
                            </td>
                            <td className="px-3 py-2.5 text-xs text-gray-500 font-semibold whitespace-nowrap">
                              {task.startDate && task.finishDate ? `${calcDuration(task.startDate, task.finishDate)} days` : "—"}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center justify-end gap-0.5">
                                <input
                                  type="number"
                                  value={round1(task.weight)}
                                  onChange={(e) => handleTaskWeightChange(task.id, e.target.value)}
                                  min={0}
                                  max={100}
                                  step={0.1}
                                  disabled={isLocked}
                                  className="w-14 border border-gray-200 rounded px-1.5 py-1 text-xs font-semibold text-right focus:outline-none focus:ring-1 focus:ring-[#021422] disabled:bg-gray-50 disabled:text-gray-400"
                                />
                                <span className="text-[10px] text-gray-400">%</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <select
                                value={getTaskDistribution(task.id)}
                                onChange={(e) => {
                                  const v = e.target.value as DistributionModel;
                                  handleTaskDistributionChange(task.id, v);
                                  setExpandedCurveTaskId(v === "custom" ? task.id : (isCurveOpen ? null : expandedCurveTaskId));
                                }}
                                disabled={isLocked}
                                className="border border-gray-200 rounded px-1.5 py-1 text-[11px] text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#021422] disabled:bg-gray-100 disabled:text-gray-400"
                              >
                                {Object.entries(DISTRIBUTION_LABELS).map(([key, label]) => (
                                  <option key={key} value={key}>{label}</option>
                                ))}
                              </select>
                              {getTaskDistribution(task.id) === "custom" && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedCurveTaskId(isCurveOpen ? null : task.id)}
                                  className="block mt-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                                >
                                  {isCurveOpen ? "Hide curve" : "Edit curve"}
                                </button>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 whitespace-nowrap">
                              {formatContractValue(taskBudget(bac, task.weight), currency)}
                            </td>
                            <td className="px-6 py-2.5">
                              {tsc && (
                                <span
                                  className={`float-right inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${tsc.bg} ${tsc.text}`}
                                >
                                  <span className={`w-1 h-1 rounded-full shrink-0 ${tsc.dot}`} />
                                  {tsc.label}
                                </span>
                              )}
                            </td>
                          </tr>
                          {isCurveOpen && getTaskDistribution(task.id) === "custom" && (
                            <tr className="border-b border-gray-50 bg-gray-50/70">
                              <td colSpan={9} className="px-6 py-2.5">
                                <div className="flex items-center gap-3">
                                  <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider shrink-0">
                                    % spent at
                                  </span>
                                  {[1, 2, 3].map((knotIndex) => (
                                    <div key={knotIndex} className="flex items-center gap-1">
                                      <span className="text-[10px] text-gray-400">{knotIndex * 25}% time</span>
                                      <input
                                        type="number"
                                        value={round1(getTaskCustomCurve(task.id)[knotIndex] * 100)}
                                        onChange={(e) =>
                                          handleTaskCustomCurveChange(task.id, knotIndex, parseFloat(e.target.value) || 0)
                                        }
                                        min={0}
                                        max={100}
                                        step={1}
                                        disabled={isLocked}
                                        className="w-11 border border-gray-200 rounded px-1 py-0.5 text-[10px] font-semibold text-right bg-white focus:outline-none focus:ring-1 focus:ring-[#021422] disabled:bg-gray-100 disabled:text-gray-400"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>

                {unassigned.length > 0 && (
                  <div className="px-6 py-3 border-t border-gray-100">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">
                      Unassigned tasks in {realMilestone.name} ({unassigned.length})
                    </p>
                    <div className="space-y-1.5">
                      {unassigned.map((t) => (
                        <div key={t.id} className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-[#021422] truncate">{t.title}</span>
                          <button
                            onClick={() => !isLocked && subMilestoneStore.assignTask(t.id, sm.id)}
                            disabled={isLocked}
                            className="shrink-0 px-2 py-1 rounded border border-gray-200 text-[10px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            Add to {sm.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-3 border-t border-gray-100 shrink-0 flex justify-end">
                <button
                  onClick={() => setTaskModalSubMilestoneId(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Excel import modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setShowImportModal(false); resetImport(); }}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#021422]">Import WBS from Excel</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Milestones and sub-milestones import fully. Task rows only set weight/dates/curve on a task that
                  already exists under that milestone — this page can&apos;t create new tasks.
                </p>
              </div>
              <button
                onClick={() => { setShowImportModal(false); resetImport(); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4">
              {!importResult && (
                <div className="space-y-4">
                  <button
                    onClick={downloadWbsTemplate}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Download size={14} />
                    Download template (.xlsx)
                  </button>

                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-10 cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition-colors">
                    <FileSpreadsheet size={28} className="text-gray-300" />
                    <span className="text-xs font-bold text-gray-500">Click to choose a .xlsx file</span>
                    <span className="text-[11px] text-gray-400">Must match the template columns exactly</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImportFile(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              )}

              {importResult && importResult.errors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <p className="text-xs font-bold text-[#021422] truncate">{importFileName}</p>
                    <button onClick={resetImport} className="text-[11px] font-bold text-blue-600 hover:text-blue-700 shrink-0">
                      Choose a different file
                    </button>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 space-y-1.5 max-h-64 overflow-y-auto">
                    {importResult.errors.map((err, i) => (
                      <p key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                        <span>{err}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {importResult && importResult.errors.length === 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <p className="text-xs font-bold text-[#021422] truncate">{importFileName}</p>
                    <button onClick={resetImport} className="text-[11px] font-bold text-blue-600 hover:text-blue-700 shrink-0">
                      Choose a different file
                    </button>
                  </div>

                  {importValidation && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold mb-3 ${
                        importValidation.valid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {importValidation.valid ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                      {importValidation.valid
                        ? "Weights check out — milestones sum to 100%, sub-milestones sum to their milestone, tasks sum to their sub-milestone"
                        : `${importValidation.issues.length} weight issue(s) in the file — importable, but review afterward`}
                    </span>
                  )}

                  <div className="space-y-2">
                    {importResult.milestones.map((m) => {
                      const existingMilestone = milestones.find((em) => em.name.toLowerCase() === m.name.toLowerCase());
                      return (
                        <div key={m.name} className="border border-gray-100 rounded-lg p-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#021422] truncate flex items-center gap-1.5">
                              <Layers size={11} className="text-gray-400" />
                              {m.name}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                existingMilestone ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {existingMilestone ? "Will update" : "New"}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{round1(m.weight)}%</p>
                          {m.subMilestones.length > 0 && (
                            <div className="mt-1.5 space-y-1 pl-3 border-l border-gray-100">
                              {m.subMilestones.map((sm) => (
                                <div key={sm.name}>
                                  <p className="text-[11px] font-semibold text-gray-600">
                                    {sm.name} — {round1(sm.weight)}%
                                  </p>
                                  {sm.tasks.length > 0 && (
                                    <p className="text-[11px] text-gray-500">
                                      {sm.tasks
                                        .map((t) => `${t.title} (${round1(t.weight)}%, ${DISTRIBUTION_LABELS[t.distribution]})`)
                                        .join(", ")}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {importResult && importResult.errors.length === 0 && (
              <div className="px-6 py-3 border-t border-gray-100 shrink-0 flex justify-end gap-3">
                <button
                  onClick={() => { setShowImportModal(false); resetImport(); }}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-4 py-2 rounded-lg bg-[#021422] text-white text-xs font-bold hover:bg-gray-900 transition-colors"
                >
                  Confirm Import ({importResult.milestones.length} milestone{importResult.milestones.length === 1 ? "" : "s"})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approve baseline modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowApproveModal(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10">
            <h3 className="text-sm font-bold text-[#021422]">
              {currentVersion > 0 ? `Approve baseline version ${currentVersion + 1}?` : "Approve baseline?"}
            </h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              This locks every milestone, sub-milestone and task weight/date/curve in as the project management
              baseline (PMB). PV calculations use this from now on. You can unlock it later with &quot;Start
              Rebaseline&quot; if the schedule or scope changes.
            </p>
            {currentVersion > 0 && (
              <div className="mt-4">
                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                  Reason for change
                </label>
                <textarea
                  value={rebaselineReason}
                  onChange={(e) => setRebaselineReason(e.target.value)}
                  rows={2}
                  placeholder="e.g., Extend timeline by 2 months due to piling delay"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#021422] focus:border-transparent resize-none"
                />
              </div>
            )}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveBaseline}
                className="flex-1 py-2.5 rounded-lg bg-[#021422] text-white text-sm font-bold hover:bg-gray-900 transition-colors"
              >
                Approve & Lock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete milestone confirmation modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTargetId(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10">
            <h3 className="text-sm font-bold text-[#021422]">Delete milestone?</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              This action cannot be undone. Its sub-milestones and their task weight assignments will be removed;
              the underlying tasks themselves will remain.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete sub-milestone confirmation modal */}
      {deleteSubMilestoneTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteSubMilestoneTargetId(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10">
            <h3 className="text-sm font-bold text-[#021422]">Delete sub-milestone?</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              This action cannot be undone. Its tasks will become unassigned rather than deleted.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteSubMilestoneTargetId(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubMilestoneConfirm}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
