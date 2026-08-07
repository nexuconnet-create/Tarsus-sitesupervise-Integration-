export type {
  Task,
  TaskStatus,
  QueueType,
  TaskType,
  Crew,
  Worker,
  TaskTest,
  TestResult,
  TaskTracker,
  ChecklistItem,
  ChecklistChange,
  ChecklistChangeType,
  ChecklistChangeStatus,
  TaskFilters,
  TaskDocument,
  TaskResources,
  MaterialResource,
  EquipmentResource,
  PPEResource,
  ManpowerResource,
  TaskMessage,
  TaskNote,
  PredictiveAlert,
  MessageSource,
} from "@/app/main-dashboard/engineer/(office)/task-details/types";

export {
  STATUS_CONFIG,
  QUEUE_LABELS,
  TASK_TYPE_LABELS,
  CHECKLIST_TEMPLATES,
  CHECKLIST_CHANGE_STATUS_CONFIG,
  TEST_CATEGORIES,
  CASTING_STAGES,
  CASTING_STAGE_LABELS,
} from "@/app/main-dashboard/engineer/(office)/task-details/types";

import type {
  TaskStatus as EngineerTaskStatus,
  QueueType as EngineerQueueType,
} from "@/app/main-dashboard/engineer/(office)/task-details/types";

// Crew manager specific filter interface (simplified)
export interface CrewManagerTaskFilters {
  dateFrom: string;
  dateTo: string;
  status: EngineerTaskStatus | "all";
  queue: EngineerQueueType | "all";
}
