import type {
  Task,
  Crew,
  MaterialResource,
  EquipmentResource,
  PPEResource,
  CrewAssignment,
} from "../types";

export interface CostLineItem {
  name: string;
  detail: string;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

export interface CostBreakdown {
  crews: CostLineItem[];
  materials: CostLineItem[];
  equipment: CostLineItem[];
  ppe: CostLineItem[];
  crewTotal: number;
  materialTotal: number;
  equipmentTotal: number;
  ppeTotal: number;
  grandTotal: number;
}

export function calculateCrewCost(
  assignments: CrewAssignment[],
  crews: Crew[]
): CostLineItem[] {
  return assignments
    .filter((a) => a.price && a.price > 0)
    .map((a) => {
      const crew = crews.find((c) => c.id === a.crewId);
      const label =
        a.workerType === "subcontractor"
          ? "Subcontractor"
          : a.workerType === "daily_worker"
          ? "Daily Worker"
          : "";
      const isDailyWorker = a.workerType === "daily_worker";
      return {
        name: crew?.name || a.crewId,
        detail: label ? `${crew?.trade || ""} - ${label}` : crew?.trade || "",
        quantity: isDailyWorker ? (crew?.size || 1) : 1,
        unit: isDailyWorker ? "worker" : "crew",
        unitCost: a.price || 0,
        total: isDailyWorker ? (a.price || 0) * (crew?.size || 1) : (a.price || 0),
      };
    });
}

export function calculateMaterialCost(
  materials: MaterialResource[]
): CostLineItem[] {
  return materials
    .filter((m) => m.unitCost && m.unitCost > 0)
    .map((m) => {
      const qty = parseFloat(m.quantity) || 0;
      return {
        name: m.name,
        detail: m.category || "",
        quantity: qty,
        unit: m.unit,
        unitCost: m.unitCost || 0,
        total: qty * (m.unitCost || 0),
      };
    });
}

export function calculateEquipmentCost(
  equipment: EquipmentResource[]
): CostLineItem[] {
  return equipment
    .filter((e) => e.unitCost && e.unitCost > 0)
    .map((e) => {
      const qty = parseFloat(e.quantity || "1") || 1;
      return {
        name: e.name,
        detail: e.category || "",
        quantity: qty,
        unit: "unit",
        unitCost: e.unitCost || 0,
        total: qty * (e.unitCost || 0),
      };
    });
}

export function calculatePPECost(ppe: PPEResource[]): CostLineItem[] {
  return ppe
    .filter((p) => p.unitCost && p.unitCost > 0)
    .map((p) => {
      const qty = parseFloat(p.quantity || "1") || 1;
      return {
        name: p.name,
        detail: p.size ? `Size: ${p.size}` : "",
        quantity: qty,
        unit: p.unit || "pcs",
        unitCost: p.unitCost || 0,
        total: qty * (p.unitCost || 0),
      };
    });
}

export function sumLineItems(items: CostLineItem[]): number {
  return items.reduce((sum, item) => sum + item.total, 0);
}

export function getCostBreakdown(
  task: Task,
  crews: Crew[] = []
): CostBreakdown {
  const crewAssignments = task.crewAssignments || [];
  const materials = task.resources?.materials || [];
  const equipment = task.resources?.equipment || [];
  const ppe = task.resources?.ppe || [];

  const crews_ = calculateCrewCost(crewAssignments, crews);
  const materials_ = calculateMaterialCost(materials);
  const equipment_ = calculateEquipmentCost(equipment);
  const ppe_ = calculatePPECost(ppe);

  const crewTotal = sumLineItems(crews_);
  const materialTotal = sumLineItems(materials_);
  const equipmentTotal = sumLineItems(equipment_);
  const ppeTotal = sumLineItems(ppe_);

  return {
    crews: crews_,
    materials: materials_,
    equipment: equipment_,
    ppe: ppe_,
    crewTotal,
    materialTotal,
    equipmentTotal,
    ppeTotal,
    grandTotal: crewTotal + materialTotal + equipmentTotal + ppeTotal,
  };
}

export function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

interface DailyWorkerLog {
  date: string;
  workerIds: string[];
  status: "confirmed" | "pending" | "rejected";
  pendingWorkerIds?: string[];
}

export function calculateCrewCostFromDailyLogs(
  assignments: CrewAssignment[],
  crews: Crew[],
  dailyLogs: DailyWorkerLog[]
): CostLineItem[] {
  // Only use confirmed daily logs for cost calculation
  const confirmedLogs = dailyLogs.filter((l) => l.status === "confirmed");

  return assignments
    .filter((a) => a.price && a.price > 0)
    .map((a) => {
      const crew = crews.find((c) => c.id === a.crewId);
      const label =
        a.workerType === "subcontractor"
          ? "Subcontractor"
          : a.workerType === "daily_worker"
          ? "Daily Worker"
          : "";
      const isDailyWorker = a.workerType === "daily_worker";

      let total: number;
      let quantity: number;
      let detail: string;

      if (isDailyWorker && confirmedLogs.length > 0) {
        const totalWorkerDays = confirmedLogs.reduce((sum, log) => sum + log.workerIds.length, 0);
        const originalWorkerDays = confirmedLogs.length * (crew?.size || 1);
        const extraWorkerDays = Math.max(0, totalWorkerDays - originalWorkerDays);

        quantity = totalWorkerDays;
        total = (a.price || 0) * totalWorkerDays;

        if (extraWorkerDays > 0) {
          detail = `${crew?.trade || ""} - ${originalWorkerDays} original + ${extraWorkerDays} extra worker-days`;
        } else {
          detail = `${crew?.trade || ""} - ${totalWorkerDays} worker-days`;
        }
      } else {
        quantity = isDailyWorker ? (crew?.size || 1) : 1;
        total = isDailyWorker ? (a.price || 0) * (crew?.size || 1) : (a.price || 0);
        detail = label ? `${crew?.trade || ""} - ${label}` : crew?.trade || "";
      }

      return {
        name: crew?.name || a.crewId,
        detail,
        quantity,
        unit: isDailyWorker ? "worker-day" : "crew",
        unitCost: a.price || 0,
        total,
      };
    });
}
