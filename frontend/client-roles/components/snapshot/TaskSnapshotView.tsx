import SnapshotSection from "./SnapshotSection";
import SnapshotKeyValues from "./SnapshotKeyValues";
import SnapshotTable, { type Column } from "./SnapshotTable";
import SnapshotCostTable from "./SnapshotCostTable";
import {
  formatDate,
  formatDateTime,
  formatDecimal,
  formatMoney,
  formatPercent,
  formatWorkerCount,
} from "@/lib/format/snapshot";
import type { TaskFileListItem } from "@/lib/types/api";
import type {
  TaskSnapshot,
  CreatedSnapshot,
  RescheduledSnapshot,
  CompletedSnapshot,
  SnapshotCrewAssignment,
  SnapshotMaterial,
  SnapshotEquipment,
  SnapshotPpe,
  SnapshotSubtask,
  SnapshotTestingRecord,
  SnapshotMiscCost,
  SnapshotInstructionDocument,
} from "@/lib/types/taskSnapshot";

interface TaskSnapshotViewProps {
  file: TaskFileListItem;
  snapshot: TaskSnapshot;
}

export default function TaskSnapshotView({
  file,
  snapshot,
}: TaskSnapshotViewProps) {
  const s = snapshot;

  const crewColumns: Column<SnapshotCrewAssignment>[] = [
    { header: "Crew", cell: (c) => c.crew_name || "—" },
    { header: "Trade", cell: (c) => c.trade || "—" },
    { header: "Type", cell: (c) => c.worker_type || "—" },
    {
      header: "Rate",
      align: "right",
      // Flat-priced crews carry flat_price; daily crews carry daily_rate.
      cell: (c) =>
        c.worker_type === "flat"
          ? formatMoney(c.flat_price)
          : `${formatMoney(c.daily_rate)}/day`,
    },
    {
      header: "Days",
      align: "right",
      cell: (c) => `${formatDecimal(c.days_worked)} / ${formatDecimal(c.planned_days)}`,
    },
    {
      header: "Workers",
      align: "right",
      cell: (c) => formatWorkerCount(c.planned_worker_count, c.actual_worker_count),
    },
  ];

  const materialColumns: Column<SnapshotMaterial>[] = [
    { header: "Item", cell: (m) => m.item_name },
    { header: "Unit", cell: (m) => m.unit || "—" },
    { header: "Req.", align: "right", cell: (m) => formatDecimal(m.quantity_required) },
    { header: "Used", align: "right", cell: (m) => formatDecimal(m.quantity_used) },
    { header: "Unit cost", align: "right", cell: (m) => formatMoney(m.unit_cost) },
  ];

  const equipmentColumns: Column<SnapshotEquipment>[] = [
    { header: "Item", cell: (e) => e.item_name },
    { header: "Req.", align: "right", cell: (e) => formatDecimal(e.quantity_required) },
    { header: "Used", align: "right", cell: (e) => formatDecimal(e.quantity_used) },
    {
      header: "Days",
      align: "right",
      cell: (e) => `${formatDecimal(e.actual_days)} / ${formatDecimal(e.planned_days)}`,
    },
    { header: "Cost", align: "right", cell: (e) => formatMoney(e.cost) },
  ];

  const ppeColumns: Column<SnapshotPpe>[] = [
    { header: "Item", cell: (p) => p.item_name },
    { header: "Unit", cell: (p) => p.unit || "—" },
    { header: "Req.", align: "right", cell: (p) => formatDecimal(p.quantity_required) },
    { header: "Issued", align: "right", cell: (p) => formatDecimal(p.quantity_issued) },
    { header: "Unit cost", align: "right", cell: (p) => formatMoney(p.unit_cost) },
  ];

  const subtaskColumns: Column<SnapshotSubtask>[] = [
    { header: "Title", cell: (t) => t.title },
    { header: "Type", cell: (t) => t.types.join(", ") || "—" },
    { header: "Status", cell: (t) => t.status },
    { header: "Approved by", cell: (t) => t.approved_by?.full_name ?? "—" },
  ];

  const testingColumns: Column<SnapshotTestingRecord>[] = [
    { header: "Test", cell: (t) => t.test_name },
    { header: "Category", cell: (t) => t.test_category },
    { header: "Company", cell: (t) => t.testing_company || "—" },
    { header: "Result", cell: (t) => t.result ?? "Pending" },
    { header: "Inspector", cell: (t) => t.inspector ?? "—" },
    { header: "Date", cell: (t) => formatDate(t.result_date) },
  ];

  const miscColumns: Column<SnapshotMiscCost>[] = [
    { header: "Title", cell: (m) => m.title },
    { header: "Category", cell: (m) => m.category || "—" },
    { header: "Amount", align: "right", cell: (m) => formatMoney(m.amount) },
  ];

  const docColumns: Column<SnapshotInstructionDocument>[] = [
    { header: "Title", cell: (d) => d.title },
    { header: "Category", cell: (d) => d.category || "—" },
    { header: "Uploaded by", cell: (d) => d.uploaded_by?.full_name ?? "—" },
    { header: "Uploaded", cell: (d) => formatDate(d.uploaded_at) },
  ];

  return (
    <div className="space-y-3">
      {/* ── Identity ── */}
      <SnapshotSection title="Task">
        <SnapshotKeyValues
          rows={[
            { label: "WP number", value: s.identity.wp_number },
            { label: "Title", value: s.identity.title },
            { label: "Type", value: s.identity.task_type },
            { label: "Grid reference", value: s.identity.grid_reference },
            { label: "Location", value: s.identity.location },
            { label: "Milestone", value: s.identity.milestone_name },
            { label: "Description", value: s.identity.description },
          ]}
        />
      </SnapshotSection>

      {/* ── Schedule / status / progress ── */}
      <SnapshotSection title="Schedule & Status">
        <SnapshotKeyValues
          rows={[
            { label: "Start date", value: formatDate(s.dates.start_date) },
            { label: "Due date", value: formatDate(s.dates.due_date) },
            { label: "Queue", value: s.status.queue_display },
            { label: "Status", value: s.status.status_display },
            {
              label: "Progress",
              value: `${formatPercent(s.progress.percentage)} (${s.progress.checklists_completed}/${s.progress.checklists_total} checklists)`,
            },
            { label: "Assigned engineer", value: s.assigned_engineer?.full_name ?? "—" },
            {
              label: "Workers",
              value: formatWorkerCount(s.worker_counts.planned, s.worker_counts.actual),
            },
          ]}
        />
      </SnapshotSection>

      {/* ── Milestone-specific: approval / reschedule / completion ── */}
      {file.milestone_type === "created" && (
        <SnapshotSection title="Approval">
          <SnapshotKeyValues
            rows={[
              { label: "Status", value: (s as CreatedSnapshot).approval.status },
              {
                label: "Approved by",
                value: (s as CreatedSnapshot).approval.approved_by?.full_name ?? "—",
              },
              {
                label: "Approved at",
                value: formatDateTime((s as CreatedSnapshot).approval.approved_at),
              },
              {
                label: "Rejection reason",
                value: (s as CreatedSnapshot).approval.rejection_reason,
              },
            ]}
          />
        </SnapshotSection>
      )}

      {file.milestone_type === "rescheduled" && (
        <SnapshotSection title="Reschedule">
          <SnapshotKeyValues
            rows={[
              {
                label: "Original start",
                value: formatDate((s as RescheduledSnapshot).reschedule.original_start_date),
              },
              {
                label: "Original due",
                value: formatDate((s as RescheduledSnapshot).reschedule.original_due_date),
              },
              {
                label: "Revised start",
                value: formatDate((s as RescheduledSnapshot).reschedule.revised_start_date),
              },
              {
                label: "Revised due",
                value: formatDate((s as RescheduledSnapshot).reschedule.revised_due_date),
              },
              { label: "Reason", value: (s as RescheduledSnapshot).reschedule.reason },
              {
                label: "Requested by",
                value: (s as RescheduledSnapshot).reschedule.requested_by?.full_name ?? "—",
              },
              {
                label: "Approved by",
                value: (s as RescheduledSnapshot).reschedule.approved_by?.full_name ?? "—",
              },
            ]}
          />
        </SnapshotSection>
      )}

      {file.milestone_type === "completed" && (
        <SnapshotSection title="Completion">
          <SnapshotKeyValues
            rows={[
              {
                label: "Completion #",
                value: (s as CompletedSnapshot).completion.sequence_number,
              },
              {
                label: "Final progress",
                value: formatPercent((s as CompletedSnapshot).completion.final_progress),
              },
              {
                label: "Completed at",
                value: formatDateTime((s as CompletedSnapshot).completion.completion_date),
              },
            ]}
          />
        </SnapshotSection>
      )}

      {/* ── Crew ── */}
      <SnapshotSection title="Crew Assignments" isEmpty={s.crew_assignments.length === 0}>
        <SnapshotTable
          columns={crewColumns}
          rows={s.crew_assignments}
          rowKey={(c, i) => `${c.crew_id}-${i}`}
        />
      </SnapshotSection>

      {/* ── Inventory ── */}
      <SnapshotSection title="Materials" isEmpty={s.inventory.materials.length === 0}>
        <SnapshotTable columns={materialColumns} rows={s.inventory.materials} rowKey={(m) => m.item_uuid} />
      </SnapshotSection>
      <SnapshotSection title="Equipment" isEmpty={s.inventory.equipment.length === 0}>
        <SnapshotTable columns={equipmentColumns} rows={s.inventory.equipment} rowKey={(e) => e.item_uuid} />
      </SnapshotSection>
      <SnapshotSection title="PPE" isEmpty={s.inventory.ppe.length === 0}>
        <SnapshotTable columns={ppeColumns} rows={s.inventory.ppe} rowKey={(p) => p.item_uuid} />
      </SnapshotSection>

      {/* ── Instruction documents ── */}
      <SnapshotSection
        title="Instruction Documents"
        isEmpty={s.instruction_documents.length === 0}
      >
        <SnapshotTable columns={docColumns} rows={s.instruction_documents} rowKey={(d) => d.id} />
      </SnapshotSection>

      {/* ── Subtasks ── */}
      <SnapshotSection title="Sub-tasks" isEmpty={s.subtasks.length === 0}>
        <SnapshotTable columns={subtaskColumns} rows={s.subtasks} rowKey={(t) => t.id} />
      </SnapshotSection>

      {/* ── Testing ── */}
      <SnapshotSection title="Testing Records" isEmpty={s.testing_records.length === 0}>
        <SnapshotTable
          columns={testingColumns}
          rows={s.testing_records}
          rowKey={(t, i) => `${t.test_id}-${t.result_id ?? i}`}
        />
      </SnapshotSection>

      {/* ── Misc costs ── */}
      <SnapshotSection title="Miscellaneous Costs" isEmpty={s.misc_costs.length === 0}>
        <SnapshotTable columns={miscColumns} rows={s.misc_costs} rowKey={(m) => m.id} />
      </SnapshotSection>

      {/* ── Cost (Created: planned only; Completed: planned/actual/variance) ── */}
      {file.milestone_type === "created" && (
        <SnapshotSection title="Planned Cost">
          <SnapshotCostTable planned={(s as CreatedSnapshot).planned_cost} />
        </SnapshotSection>
      )}
      {file.milestone_type === "completed" && (
        <SnapshotSection title="Cost — Planned vs Actual">
          <SnapshotCostTable
            planned={(s as CompletedSnapshot).planned_cost}
            actual={(s as CompletedSnapshot).actual_cost}
            variance={(s as CompletedSnapshot).cost_variance}
          />
        </SnapshotSection>
      )}
    </div>
  );
}
