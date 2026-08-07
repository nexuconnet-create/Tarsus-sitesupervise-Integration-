export type AttendanceStatus = "present" | "absent" | "late" | "early";

export interface WorkerData {
  id: string;
  name: string;
  trade: string;
  crewName: string;
  crewId: string;
  scheduleName: string;
  scheduleId: string;
  taskId: string;
  status: AttendanceStatus | "unmarked";
  scheduled?: string;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

export interface ScheduleData {
  id: string;
  taskId: string;
  taskName: string;
  crewName: string;
  crewId: string;
  durationFrom: string;
  durationTo: string;
  workers: WorkerData[];
  totalWorkers: number;
  present: number;
  absent: number;
  late: number;
  early: number;
}

export interface DailySummaryData {
  totalWorkers: number;
  present: number;
  late: number;
  early: number;
  absent: number;
  totalSchedules: number;
}

export interface CrewData {
  id: string;
  name: string;
  members: number;
  present: number;
  absent: number;
}
