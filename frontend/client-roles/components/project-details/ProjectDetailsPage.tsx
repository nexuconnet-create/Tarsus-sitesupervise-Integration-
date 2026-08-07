"use client";

import { useState } from "react";
import {
  Pencil,
  X,
  Check,
  Calendar,
  FileText,
  Banknote,
  Clock,
  Lock,
  ListChecks,
  Layers,
  Wallet,
  PenLine,
} from "lucide-react";
import { useProjectDetailsStore } from "@/store/projectDetailsStore";
import { MOCK_WBS_BASELINE } from "@/lib/mockData/wbs";
import type { ProjectDetails, ProjectType, ProjectStatus, ProjectPhase, ContractType, Currency } from "@/lib/types/projectDetails";
import {
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_PHASE_LABELS,
  CONTRACT_TYPE_LABELS,
  CURRENCY_LABELS,
  formatContractValue,
  calcDuration,
  calcDurationParts,
} from "@/lib/types/projectDetails";

interface ProjectDetailsPageProps {
  header: React.ReactNode;
  canEdit: boolean;
}

// ─── Shared field label ────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
      {children}
    </p>
  );
}

// ─── View value ───────────────────────────────────────────
function FieldValue({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p className={`text-sm font-medium ${muted ? "text-gray-400 italic" : "text-[#021422]"}`}>
      {children || <span className="text-gray-300">—</span>}
    </p>
  );
}

// ─── Section card wrapper ──────────────────────────────────
// In edit mode, cards get a soft blue ring — the same signal used on the input
// borders below — so "this can be changed right now" reads from the section
// container without a separate explanatory banner.
function SectionCard({
  icon,
  title,
  editing,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  editing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-colors ${
        editing ? "border-[#021422]/15 ring-1 ring-[#021422]/5" : "border-gray-100"
      }`}
    >
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <span className="text-[#021422]">{icon}</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#021422]">{title}</h3>
        {editing && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
            <PenLine size={10} />
            Editing
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Text input (edit mode) ───────────────────────────────
const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#021422] focus:outline-none focus:ring-2 focus:ring-[#021422] focus:border-transparent bg-white";

const textareaCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#021422] focus:outline-none focus:ring-2 focus:ring-[#021422] focus:border-transparent bg-white resize-none";

function SelectField<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Record<T, string>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={inputCls}
    >
      {(Object.entries(options) as [T, string][]).map(([k, label]) => (
        <option key={k} value={k}>{label}</option>
      ))}
    </select>
  );
}

// ─── Project Overview ─────────────────────────────────────
// The figures the EVM baseline hangs off, read-only because each is either
// edited in a section below or derived from the WBS. Styled as KPI cards to
// match the performance dashboard's visual language elsewhere in the app.

type ChipColor = "blue" | "green" | "amber" | "gray";

const CHIP_STYLES: Record<ChipColor, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  gray: "bg-gray-100 text-gray-500",
};

function OverviewCard({
  icon,
  label,
  value,
  detail,
  sub,
  color = "gray",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  /** A short second line under `value` — for figures too long to fit on one line, e.g. "470 days". */
  detail?: string;
  sub?: string;
  color?: ChipColor;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${CHIP_STYLES[color]}`}>
          {icon}
        </span>
      </div>
      <p className="text-lg font-bold text-[#021422] truncate" title={detail ? `${value} (${detail})` : value}>
        {value}
      </p>
      {detail && <p className="text-[11px] text-gray-500 font-medium mt-0.5 truncate">{detail}</p>}
      {sub && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

/** Milestones and tasks told as one figure — the WBS is one structure, so its
 * two counts read as a single stat rather than competing for the same tile.
 * Milestones lead since they're the coarser, more load-bearing unit — tasks
 * exist underneath them. */
function TasksMilestonesCard({ tasks, milestones }: { tasks: number; milestones: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">WBS Scope</p>
        <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${CHIP_STYLES.amber}`}>
          <ListChecks size={12} />
        </span>
      </div>
      <div className="flex items-end gap-3">
        <div>
          <p className="text-lg font-bold text-[#021422] leading-none">{milestones}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Milestones</p>
        </div>
        <div className="h-6 w-px bg-gray-100" />
        <div>
          <p className="text-lg font-bold text-[#021422] leading-none">{tasks}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Tasks</p>
        </div>
      </div>
    </div>
  );
}

function ProjectOverview({ data }: { data: ProjectDetails }) {
  const duration = calcDurationParts(data.startDate, data.revisedFinishDate || data.plannedFinishDate);

  // Counts come from the WBS rather than being typed by hand — they are a
  // count of what exists, so a stored value could only ever drift out of date.
  const totalTasks = MOCK_WBS_BASELINE.milestones.reduce(
    (acc, m) => acc + m.subMilestones.reduce((acc2, sm) => acc2 + sm.tasks.length, 0),
    0,
  );
  const milestoneCount = MOCK_WBS_BASELINE.milestones.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <OverviewCard
        icon={<Clock size={14} />}
        label="Duration"
        value={duration.headline}
        detail={duration.detail}
        sub={data.revisedFinishDate ? "Revised schedule" : "Baseline schedule"}
        color="blue"
      />
      <OverviewCard
        icon={<Wallet size={14} />}
        label="Budget (BAC)"
        value={formatContractValue(data.bac, data.currency)}
        sub="Budget at completion"
        color="green"
      />
      <TasksMilestonesCard tasks={totalTasks} milestones={milestoneCount} />
      <OverviewCard
        icon={<Layers size={14} />}
        label="Project Type"
        value={PROJECT_TYPE_LABELS[data.projectType]}
        sub={PROJECT_STATUS_LABELS[data.status]}
        color="gray"
      />
    </div>
  );
}

// ─── Section 1: Project Identity ──────────────────────────
function IdentitySection({
  data,
  editing,
  onChange,
}: {
  data: ProjectDetails;
  editing: boolean;
  onChange: (patch: Partial<ProjectDetails>) => void;
}) {
  const statusColors = PROJECT_STATUS_COLORS[data.status];

  if (!editing) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <FieldLabel>Project Name</FieldLabel>
          <FieldValue>{data.name}</FieldValue>
        </div>
        <div>
          <FieldLabel>Project Code</FieldLabel>
          <FieldValue>{data.projectCode}</FieldValue>
        </div>
        <div>
          <FieldLabel>Project Type</FieldLabel>
          <FieldValue>{PROJECT_TYPE_LABELS[data.projectType]}</FieldValue>
        </div>
        <div>
          <FieldLabel>Status</FieldLabel>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors.bg} ${statusColors.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
            {PROJECT_STATUS_LABELS[data.status]}
          </span>
        </div>
        <div>
          <FieldLabel>Phase</FieldLabel>
          <FieldValue>{PROJECT_PHASE_LABELS[data.phase]}</FieldValue>
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>Description / Scope of Work</FieldLabel>
          <FieldValue>{data.description}</FieldValue>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <FieldLabel>Project Name *</FieldLabel>
        <input
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className={inputCls}
          placeholder="e.g., Lekki Phase 2 Mixed-Use Development"
        />
      </div>
      <div>
        <FieldLabel>Project Code</FieldLabel>
        <input
          value={data.projectCode}
          onChange={(e) => onChange({ projectCode: e.target.value })}
          className={inputCls}
          placeholder="e.g., PRJ-2024-001"
        />
      </div>
      <div>
        <FieldLabel>Project Type</FieldLabel>
        <SelectField<ProjectType>
          value={data.projectType}
          onChange={(v) => onChange({ projectType: v })}
          options={PROJECT_TYPE_LABELS}
        />
      </div>
      <div>
        <FieldLabel>Status</FieldLabel>
        <SelectField<ProjectStatus>
          value={data.status}
          onChange={(v) => onChange({ status: v })}
          options={PROJECT_STATUS_LABELS}
        />
      </div>
      <div>
        <FieldLabel>Phase</FieldLabel>
        <SelectField<ProjectPhase>
          value={data.phase}
          onChange={(v) => onChange({ phase: v })}
          options={PROJECT_PHASE_LABELS}
        />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel>Description / Scope of Work</FieldLabel>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          className={textareaCls}
          placeholder="Detailed description of the project scope…"
        />
      </div>
    </div>
  );
}

// ─── Section 2: Schedule ──────────────────────────────────
function ScheduleSection({
  data,
  editing,
  onChange,
}: {
  data: ProjectDetails;
  editing: boolean;
  onChange: (patch: Partial<ProjectDetails>) => void;
}) {
  const duration = calcDuration(data.startDate, data.revisedFinishDate || data.plannedFinishDate);
  const elapsed = calcDuration(data.startDate, new Date().toISOString().split("T")[0]);

  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  if (!editing) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel>Start Date</FieldLabel>
          <FieldValue>{fmt(data.startDate)}</FieldValue>
        </div>
        <div>
          <FieldLabel>Planned Finish Date</FieldLabel>
          <FieldValue>{fmt(data.plannedFinishDate)}</FieldValue>
        </div>
        <div>
          <FieldLabel>Revised Finish Date</FieldLabel>
          <FieldValue muted={!data.revisedFinishDate}>
            {data.revisedFinishDate ? fmt(data.revisedFinishDate) : "Not set"}
          </FieldValue>
        </div>
        <div>
          <FieldLabel>Contract Duration</FieldLabel>
          <FieldValue>{duration}</FieldValue>
        </div>
        <div className="sm:col-span-2 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={12} />
            <span>Time elapsed from start date: <span className="font-semibold text-[#021422]">{elapsed}</span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <FieldLabel>Start Date *</FieldLabel>
        <input
          type="date"
          value={data.startDate}
          onChange={(e) => onChange({ startDate: e.target.value })}
          className={inputCls}
        />
      </div>
      <div>
        <FieldLabel>Planned Finish Date *</FieldLabel>
        <input
          type="date"
          value={data.plannedFinishDate}
          onChange={(e) => onChange({ plannedFinishDate: e.target.value })}
          className={inputCls}
        />
      </div>
      <div>
        <FieldLabel>Revised Finish Date <span className="normal-case font-normal text-gray-400">(optional)</span></FieldLabel>
        <input
          type="date"
          value={data.revisedFinishDate ?? ""}
          onChange={(e) => onChange({ revisedFinishDate: e.target.value || undefined })}
          className={inputCls}
        />
      </div>
      <div className="flex items-end pb-1">
        <div>
          <FieldLabel>Contract Duration</FieldLabel>
          <p className="text-sm font-semibold text-[#021422]">{duration}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Auto-calculated</p>
        </div>
      </div>
    </div>
  );
}

// ─── Section 3: Contract & Finance ───────────────────────

/** Contract value less BAC — the planned margin. Negative means the job is
 * budgeted to cost more than it earns, which is worth showing loudly. */
function MarginValue({
  contractValue,
  bac,
  currency,
}: {
  contractValue: number;
  bac: number;
  currency: Currency;
}) {
  const margin = contractValue - bac;
  const pct = contractValue === 0 ? 0 : (margin / contractValue) * 100;
  const negative = margin < 0;

  return (
    <>
      <p className={`text-base font-bold ${negative ? "text-red-600" : "text-[#021422]"}`}>
        {formatContractValue(margin, currency)}
      </p>
      <p className={`text-[10px] mt-0.5 ${negative ? "text-red-500" : "text-gray-400"}`}>
        {pct.toFixed(1)}% of contract value
      </p>
    </>
  );
}

function ContractSection({
  data,
  editing,
  onChange,
}: {
  data: ProjectDetails;
  editing: boolean;
  onChange: (patch: Partial<ProjectDetails>) => void;
}) {
  if (!editing) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <FieldLabel>Contract Number</FieldLabel>
          <FieldValue>{data.contractNumber}</FieldValue>
        </div>
        <div>
          <FieldLabel>Contract Type</FieldLabel>
          <FieldValue>{CONTRACT_TYPE_LABELS[data.contractType]}</FieldValue>
        </div>
        <div>
          <FieldLabel>Contract Value</FieldLabel>
          <p className="text-base font-bold text-[#021422]">
            {formatContractValue(data.contractValue, data.currency)}
          </p>
        </div>
        <div>
          <FieldLabel>Currency</FieldLabel>
          <FieldValue>{data.currency}</FieldValue>
        </div>
        <div>
          <FieldLabel>Budget at Completion (BAC)</FieldLabel>
          <p className="text-base font-bold text-[#021422]">
            {formatContractValue(data.bac, data.currency)}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">Baseline for all EVM calculations</p>
        </div>
        <div>
          <FieldLabel>Margin</FieldLabel>
          <MarginValue contractValue={data.contractValue} bac={data.bac} currency={data.currency} />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>Company / Contractor</FieldLabel>
          <FieldValue>{data.company}</FieldValue>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <FieldLabel>Contract Number</FieldLabel>
        <input
          value={data.contractNumber}
          onChange={(e) => onChange({ contractNumber: e.target.value })}
          className={inputCls}
          placeholder="e.g., CON/2024/001"
        />
      </div>
      <div>
        <FieldLabel>Contract Type</FieldLabel>
        <SelectField<ContractType>
          value={data.contractType}
          onChange={(v) => onChange({ contractType: v })}
          options={CONTRACT_TYPE_LABELS}
        />
      </div>
      <div>
        <FieldLabel>Contract Value *</FieldLabel>
        <input
          type="number"
          value={data.contractValue}
          onChange={(e) => onChange({ contractValue: parseFloat(e.target.value) || 0 })}
          className={inputCls}
          placeholder="0.00"
          min={0}
        />
      </div>
      <div>
        <FieldLabel>Currency</FieldLabel>
        <SelectField<Currency>
          value={data.currency}
          onChange={(v) => onChange({ currency: v })}
          options={CURRENCY_LABELS}
        />
      </div>
      <div>
        <FieldLabel>Budget at Completion (BAC) *</FieldLabel>
        <input
          type="number"
          value={data.bac}
          onChange={(e) => onChange({ bac: parseFloat(e.target.value) || 0 })}
          className={inputCls}
          placeholder="0.00"
          min={0}
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Total planned cost. Milestone weights divide this figure — changing it rescales the whole PV baseline.
        </p>
      </div>
      <div className="flex items-end pb-1">
        <div>
          <FieldLabel>Margin</FieldLabel>
          <MarginValue contractValue={data.contractValue} bac={data.bac} currency={data.currency} />
          <p className="text-[10px] text-gray-400 mt-0.5">Auto-calculated</p>
        </div>
      </div>
      <div className="sm:col-span-2">
        <FieldLabel>Company / Contractor *</FieldLabel>
        <input
          value={data.company}
          onChange={(e) => onChange({ company: e.target.value })}
          className={inputCls}
          placeholder="e.g., Speedup Construction Ltd"
        />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function ProjectDetailsPage({ header, canEdit }: ProjectDetailsPageProps) {
  const { details, update, reset } = useProjectDetailsStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProjectDetails>(details);
  const [saved, setSaved] = useState(false);

  const startEditing = () => {
    setDraft({ ...details });
    setEditing(true);
    setSaved(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setDraft({ ...details });
  };

  const handleSave = () => {
    update(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const patch = (p: Partial<ProjectDetails>) => setDraft((d) => ({ ...d, ...p }));
  const current = editing ? draft : details;

  const statusColors = PROJECT_STATUS_COLORS[current.status];

  return (
    <div className="pb-20">
      {header}

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Identity + actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-[#021422] truncate">{current.name}</h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${statusColors.bg} ${statusColors.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                {PROJECT_STATUS_LABELS[current.status]}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {current.projectCode} · {PROJECT_TYPE_LABELS[current.projectType]} · {PROJECT_PHASE_LABELS[current.phase]}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {saved && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <Check size={13} />
                Saved
              </span>
            )}
            {!canEdit && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
                <Lock size={11} />
                View only
              </span>
            )}
            {canEdit && !editing && (
              <button
                onClick={startEditing}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#021422] text-white text-xs font-bold rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Pencil size={12} />
                Edit Details
              </button>
            )}
            {canEdit && editing && (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X size={12} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#021422] text-white text-xs font-bold rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <Check size={12} />
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        <ProjectOverview data={current} />

        {/* Section 1 */}
        <SectionCard icon={<FileText size={15} />} title="Project Identity" editing={editing}>
          <IdentitySection data={current} editing={editing} onChange={patch} />
        </SectionCard>

        {/* Section 2 */}
        <SectionCard icon={<Calendar size={15} />} title="Schedule" editing={editing}>
          <ScheduleSection data={current} editing={editing} onChange={patch} />
        </SectionCard>

        {/* Section 3 */}
        <SectionCard icon={<Banknote size={15} />} title="Contract & Finance" editing={editing}>
          <ContractSection data={current} editing={editing} onChange={patch} />
        </SectionCard>
      </div>
    </div>
  );
}
