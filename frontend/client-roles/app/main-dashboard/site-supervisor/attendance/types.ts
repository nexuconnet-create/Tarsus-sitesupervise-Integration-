export type AttendanceStatus = "present" | "absent" | "late" | "early";

export interface DailySummaryData {
  totalWorkers: number;
  present: number;
  early: number;
  late: number;
  absent: number;
}

export interface CrewSummaryData {
  id: string;
  name: string;
  present: number;
  absent: number;
}

export interface ScheduleSummaryData {
  id: string;
  taskName: string;
  crews: CrewSummaryData[];
  subtotalPresent: number;
  subtotalAbsent: number;
}

export interface WorkerData {
  id: string;
  name: string;
  crewName: string;
  crewId: string;
  scheduleName: string;
  scheduleId: string;
  status: AttendanceStatus | "unmarked";
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

export interface GrandTotalData {
  present: number;
  absent: number;
}

export interface CumulativeTotalData {
  present: number;
  absent: number;
}
