import type {
  DailySummaryData,
  ScheduleSummaryData,
  WorkerData,
  GrandTotalData,
  CumulativeTotalData,
} from "../types";

const MOCK_SCHEDULES: ScheduleSummaryData[] = [
  {
    id: "sched-1",
    taskName: "Foundation Excavation",
    crews: [
      { id: "crew-1", name: "Alpha Crew", present: 4, absent: 1 },
      { id: "crew-2", name: "Beta Crew", present: 3, absent: 0 },
    ],
    subtotalPresent: 7,
    subtotalAbsent: 1,
  },
  {
    id: "sched-2",
    taskName: "Steel Reinforcement",
    crews: [
      { id: "crew-3", name: "Steel Gang", present: 2, absent: 1 },
    ],
    subtotalPresent: 2,
    subtotalAbsent: 1,
  },
  {
    id: "sched-3",
    taskName: "Concrete Pouring",
    crews: [
      { id: "crew-4", name: "Concrete Crew", present: 5, absent: 2 },
    ],
    subtotalPresent: 5,
    subtotalAbsent: 2,
  },
];

const MOCK_DAILY_SUMMARY: DailySummaryData = {
  totalWorkers: 20,
  present: 12,
  early: 2,
  late: 3,
  absent: 5,
};

const MOCK_WORKERS: WorkerData[] = [
  { id: "w1", name: "John Martinez", crewName: "Alpha Crew", crewId: "crew-1", scheduleName: "Foundation Excavation", scheduleId: "sched-1", status: "present", checkIn: "07:00", checkOut: "17:00" },
  { id: "w2", name: "Carlos Rodriguez", crewName: "Alpha Crew", crewId: "crew-1", scheduleName: "Foundation Excavation", scheduleId: "sched-1", status: "present", checkIn: "07:05", checkOut: "17:00" },
  { id: "w3", name: "Mike Thompson", crewName: "Alpha Crew", crewId: "crew-1", scheduleName: "Foundation Excavation", scheduleId: "sched-1", status: "late", checkIn: "07:45", checkOut: "17:00" },
  { id: "w4", name: "David Kim", crewName: "Alpha Crew", crewId: "crew-1", scheduleName: "Foundation Excavation", scheduleId: "sched-1", status: "present", checkIn: "06:55", checkOut: "17:00" },
  { id: "w5", name: "Sarah Chen", crewName: "Alpha Crew", crewId: "crew-1", scheduleName: "Foundation Excavation", scheduleId: "sched-1", status: "absent" },
  { id: "w6", name: "James Wilson", crewName: "Beta Crew", crewId: "crew-2", scheduleName: "Foundation Excavation", scheduleId: "sched-1", status: "present", checkIn: "07:00", checkOut: "17:00" },
  { id: "w7", name: "Chris Lee", crewName: "Beta Crew", crewId: "crew-2", scheduleName: "Foundation Excavation", scheduleId: "sched-1", status: "present", checkIn: "07:02", checkOut: "17:00" },
  { id: "w8", name: "Kevin O'Brien", crewName: "Beta Crew", crewId: "crew-2", scheduleName: "Foundation Excavation", scheduleId: "sched-1", status: "present", checkIn: "06:58", checkOut: "17:00" },
  { id: "w9", name: "Femi Ogundimu", crewName: "Steel Gang", crewId: "crew-3", scheduleName: "Steel Reinforcement", scheduleId: "sched-2", status: "present", checkIn: "07:00", checkOut: "17:00" },
  { id: "w10", name: "Bala Mohammed", crewName: "Steel Gang", crewId: "crew-3", scheduleName: "Steel Reinforcement", scheduleId: "sched-2", status: "present", checkIn: "07:10", checkOut: "17:00" },
  { id: "w11", name: "Ade Oyelaran", crewName: "Steel Gang", crewId: "crew-3", scheduleName: "Steel Reinforcement", scheduleId: "sched-2", status: "absent" },
  { id: "w12", name: "Sunday Eze", crewName: "Concrete Crew", crewId: "crew-4", scheduleName: "Concrete Pouring", scheduleId: "sched-3", status: "present", checkIn: "07:00", checkOut: "17:00" },
  { id: "w13", name: "Emeka Nwosu", crewName: "Concrete Crew", crewId: "crew-4", scheduleName: "Concrete Pouring", scheduleId: "sched-3", status: "early", checkIn: "07:00", checkOut: "16:30" },
  { id: "w14", name: "Tunde Bakare", crewName: "Concrete Crew", crewId: "crew-4", scheduleName: "Concrete Pouring", scheduleId: "sched-3", status: "present", checkIn: "07:05", checkOut: "17:00" },
  { id: "w15", name: "Ibrahim Musa", crewName: "Concrete Crew", crewId: "crew-4", scheduleName: "Concrete Pouring", scheduleId: "sched-3", status: "late", checkIn: "08:00", checkOut: "17:00" },
  { id: "w16", name: "Chinedu Okafor", crewName: "Concrete Crew", crewId: "crew-4", scheduleName: "Concrete Pouring", scheduleId: "sched-3", status: "present", checkIn: "06:55", checkOut: "17:00" },
  { id: "w17", name: "Yusuf Abdullahi", crewName: "Concrete Crew", crewId: "crew-4", scheduleName: "Concrete Pouring", scheduleId: "sched-3", status: "absent" },
  { id: "w18", name: "Kola Adeleke", crewName: "Concrete Crew", crewId: "crew-4", scheduleName: "Concrete Pouring", scheduleId: "sched-3", status: "absent" },
];

export function getMockSchedulesForDate(_date: string): ScheduleSummaryData[] {
  return MOCK_SCHEDULES;
}

export function getMockDailySummary(_date: string): DailySummaryData {
  return MOCK_DAILY_SUMMARY;
}

export function getMockGrandTotal(_date: string): GrandTotalData {
  return {
    present: MOCK_SCHEDULES.reduce((acc, s) => acc + s.subtotalPresent, 0),
    absent: MOCK_SCHEDULES.reduce((acc, s) => acc + s.subtotalAbsent, 0),
  };
}

export function getMockWorkersForDate(_date: string): WorkerData[] {
  return MOCK_WORKERS;
}

export function getMockWorkersForSchedule(scheduleId: string): WorkerData[] {
  return MOCK_WORKERS.filter((w) => w.scheduleId === scheduleId);
}

export function getMockScheduleById(scheduleId: string): ScheduleSummaryData | undefined {
  return MOCK_SCHEDULES.find((s) => s.id === scheduleId);
}

export function getMockCumulativeTotal(_date: string): CumulativeTotalData {
  return {
    present: 156,
    absent: 24,
  };
}
