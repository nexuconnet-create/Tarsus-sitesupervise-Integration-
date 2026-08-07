export type TaskStatus = "on_schedule" | "behind_schedule" | "at_risk" | "ahead_of_schedule";
export type QueueType = "todo" | "in_progress" | "on_hold" | "uncompleted" | "completed" | "cancelled";

export type SubtaskType = "additional_resources" | "additional_crew" | "timeline_extension";
export type SubtaskStatus = "pending" | "approved" | "rejected";

export interface SubtaskRequest {
  id: string;
  taskId: string;
  title: string;
  description: string;
  type: SubtaskType | SubtaskType[];
  status: SubtaskStatus;
  requestedBy: string;
  requestedByRole?: string;
  requestedAt: string;
  materials?: MaterialResource[];
  equipment?: EquipmentResource[];
  ppe?: PPEResource[];
  additionalCrews?: Crew[];
  additionalWorkers?: Crew[];
  newStartDate?: string;
  newDueDate?: string;
  notes?: string;
  approvedBy?: string;
  approvedByRole?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export const SUBTASK_TYPE_LABELS: Record<SubtaskType, string> = {
  additional_resources: "Additional Resources",
  additional_crew: "Additional Crew",
  timeline_extension: "Timeline Extension",
};

export const SUBTASK_STATUS_CONFIG: Record<SubtaskStatus, { bg: string; text: string; dot: string; label: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500", label: "Pending" },
  approved: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500", label: "Approved" },
  rejected: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500", label: "Rejected" },
};

export const CHECKLIST_CHANGE_STATUS_CONFIG: Record<ChecklistChangeStatus, { bg: string; text: string; dot: string; label: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500", label: "Pending Approval" },
  approved: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500", label: "Approved" },
  rejected: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500", label: "Rejected" },
};

export type TaskType =
  | "concrete"
  | "steel"
  | "earthwork"
  | "finishing"
  | "mep"
  | "electrical"
  | "safety"
  | "general";

export interface TaskFilters {
  dateFrom: string;
  dateTo: string;
  status: TaskStatus | "all";
  queue: QueueType | "all";
  crews: string[];
}

export const RESCHEDULE_BADGE_CONFIG = {
  bg: "bg-gray-100",
  text: "text-gray-700",
  border: "border-gray-300",
  dot: "bg-gray-500",
  label: "Rescheduled",
} as const;

export interface CrewManagerTaskFilters {
  dateFrom: string;
  dateTo: string;
  status: TaskStatus | "all";
  queue: QueueType | "all";
  crews: string[];
  milestone: string;
  search: string;
  taskType: TaskType | "all";
  ordering: string;
}

export interface ChecklistItem {
  id: string;
  description: string;
  checked: boolean;
  enabled?: boolean;
  notes?: string;
}

export type ChecklistChangeType = "added" | "removed";
export type ChecklistChangeStatus = "pending" | "approved" | "rejected";

export interface ChecklistChange {
  id: string;
  changeType: ChecklistChangeType;
  item: ChecklistItem;
  requestedBy: string;
  requestedAt: string;
  status: ChecklistChangeStatus;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface TaskTracker {
  taskType: TaskType;
  items: ChecklistItem[];
  completedAt?: string;
  pendingChanges?: ChecklistChange[];
}

export interface Worker {
  id: string;
  name: string;
  trade: string;
  avatarUrl: string;
  phone?: string;
}

export interface Crew {
  id: string;
  name: string;
  trade: string;
  workers: Worker[];
  size: number;
}

export type WorkerType = "subcontractor" | "daily_worker" | "not_applicable";

export interface CrewAssignment {
  crewId: string;
  workerType?: WorkerType;
  price?: number;
}

export interface Task {
  id: string;
  title: string;
  grid: string;
  status: TaskStatus;
  queue: QueueType;
  progress: number;
  dueDate: string;
  startDate: string;
  crews: Crew[];
  crewAssignments: CrewAssignment[];
  location: string;
  wp?: string;
  taskType?: TaskType;
  description?: string;
  risk?: string;
  milestoneId: string;
  milestoneName?: string;
  checklistItemsCount?: number;
  is_rescheduled?: boolean;
  original_start_date?: string;
  original_end_date?: string;
  reschedule_reason?: string;
  rescheduled_by?: string;
  rescheduled_at?: string;
  taskTracker?: TaskTracker;
  tests?: TaskTest[];
  assignedWorkers?: Worker[];
  subtasks?: SubtaskRequest[];
  instructions?: TaskInstructions;
  resources?: TaskResources;
  communications?: TaskMessage[];
  notes?: TaskNote[];
  linkedDrawings?: string;
  methodStatement?: string;
  arScopeReference?: string;
  createdBy?: string;
  createdAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  trackerApprovalStatus?: ChecklistChangeStatus;
  resourcesCreatedBy?: string;
  resourcesApprovedBy?: string;
  testingCreatedBy?: string;
  testingApprovedBy?: string;
  trackerCreatedBy?: string;
  trackerApprovedBy?: string;
}

export type CastingPhaseStage =
  | "not_started"
  | "prep_work"
  | "rebar_cage"
  | "formwork"
  | "pouring"
  | "curing"
  | "stripping"
  | "completed";

export interface CastingPhaseReminder {
  label: string;
  dueDate: string;
  isOverdue: boolean;
  isUpcoming: boolean;
}

export interface CastingPhase {
  stage: CastingPhaseStage;
  startDate: string;
  estimatedCompletion: string;
  actualCompletion?: string;
  reminders: CastingPhaseReminder[];
}

export type TestType = string;

export interface TestChecklistItem {
  id: string;
  description: string;
  passed: boolean | null;
  notes?: string;
}

export interface TestResult {
  id: string;
  type: TestType;
  customLabel?: string;
  date: string;
  inspector: string;
  checklist: TestChecklistItem[];
  overallResult: "pass" | "fail" | "pending";
  reportUrl?: string;
  photos?: string[];
  notes?: string;
}

export interface TaskTest {
  id: string;
  type: TestType;
  label: string;
  dateAdded: string;
  productionDate?: string;
  results: TestResult[];
  latestResult?: TestResult;
  companyName?: string;
  notes?: string;
}

export interface QueueStats {
  todo: number;
  inProgress: number;
  onHold: number;
  forReview: number;
}

export interface PredictiveAlert {
  id: string;
  type: "warning" | "critical" | "info";
  message: string;
  relatedTaskId?: string;
  createdAt: string;
}

export const CASTING_STAGES: CastingPhaseStage[] = [
  "not_started",
  "prep_work",
  "rebar_cage",
  "formwork",
  "pouring",
  "curing",
  "stripping",
  "completed",
];

export const CASTING_STAGE_LABELS: Record<CastingPhaseStage, string> = {
  not_started: "Not Started",
  prep_work: "Prep Work",
  rebar_cage: "Rebar Cage",
  formwork: "Formwork",
  pouring: "Pouring",
  curing: "Curing",
  stripping: "Stripping",
  completed: "Completed",
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  concrete: "Concrete Work",
  steel: "Steel Work",
  earthwork: "Earthwork",
  finishing: "Finishing",
  mep: "MEP Installation",
  electrical: "Electrical Work",
  safety: "Safety Inspection",
  general: "General Work",
};

export const CHECKLIST_TEMPLATES: Record<TaskType, string[]> = {
  concrete: [
    "Verify formwork dimensions and alignment",
    "Check rebar spacing and cover",
    "Confirm rebar ties are secure",
    "Verify embedded items placement",
    "Check concrete mix design compliance",
    "Record slump test results",
    "Check concrete temperature",
    "Verify curing compound application",
    "Confirm pour sequence and rate",
    "Check for cold joints",
    "Monitor concrete placement",
    "Verify finishing operations",
    "Check joint spacing and layout",
  ],
  steel: [
    "Verify steel grade and certification",
    "Check bolt torque specifications",
    "Confirm weld procedure qualification",
    "Inspect weld quality (visual)",
    "Verify member alignment and plumb",
    "Check connection details against drawings",
    "Confirm fireproofing thickness",
    "Verify anchor bolt placement",
    "Check temporary bracing removal",
    "Document field bolt installation",
  ],
  earthwork: [
    "Verify site clearing complete",
    "Check excavation depth and width",
    "Confirm bottom elevation",
    "Verify shoring and sloping",
    "Check groundwater control",
    "Confirm compaction requirements",
    "Verify backfill material quality",
    "Check compaction test results",
    "Verify drainage provisions",
    "Confirm grade stakes accuracy",
  ],
  finishing: [
    "Verify surface preparation",
    "Check moisture content",
    "Confirm material storage conditions",
    "Verify application temperature",
    "Check primer application",
    "Confirm coating thickness",
    "Verify cure time compliance",
    "Check for defects and touch-ups",
    "Verify final appearance",
    "Document punch list items",
  ],
  mep: [
    "Verify equipment placement",
    "Check supports and hangers",
    "Confirm pipe/duct alignment",
    "Verify pressure test results",
    "Check insulation installation",
    "Confirm electrical connections",
    "Verify controls and instrumentation",
    "Check system balancing",
    "Confirm commissioning requirements",
    "Verify as-built documentation",
  ],
  electrical: [
    "Verify conduit routing and support",
    "Check wire/cable sizing and type",
    "Confirm grounding and bonding",
    "Verify panel board connections",
    "Check circuit breaker sizing",
    "Test insulation resistance",
    "Verify voltage drop calculations",
    "Check motor connections",
    "Confirm lighting fixture installation",
    "Test GFCI/AFCI protection",
    "Verify terminations are tight",
    "Document as-built drawings",
  ],
  safety: [
    "Verify PPE availability",
    "Check fall protection systems",
    "Confirm scaffolding inspection",
    "Verify excavation safety",
    "Check crane operations",
    "Confirm electrical safety",
    "Verify fire prevention measures",
    "Check confined space protocols",
    "Confirm material handling procedures",
    "Verify emergency exits accessible",
    "Check first aid kit availability",
    "Verify hazard communication signage",
  ],
  general: [
    "Verify site access and conditions",
    "Check materials delivery and storage",
    "Confirm equipment availability",
    "Verify workforce qualification",
    "Check work area preparation",
    "Confirm coordination with other trades",
    "Verify quality control requirements",
    "Check progress against schedule",
    "Document daily work log",
    "Verify cleanup procedures",
  ],
};

export interface TestCategory {
  testType: string;
  subTests: string[];
}

export const TEST_CATEGORIES: TestCategory[] = [
  {
    testType: "Soil Testing",
    subTests: [
      "Standard Penetration Test (SPT)",
      "Cone Penetration Test (CPT)",
      "Plate Load Test",
      "Vane Shear Test",
      "Pressuremeter Test",
      "Moisture Content Test",
      "Atterberg Limits - Liquid Limit",
      "Atterberg Limits - Plastic Limit",
      "Atterberg Limits - Shrinkage Limit",
      "Grain Size Analysis - Sieve",
      "Grain Size Analysis - Hydrometer",
      "Compaction Test - Standard Proctor",
      "Compaction Test - Modified Proctor",
      "Direct Shear Test",
      "Triaxial Test",
      "Unconfined Compression Test",
      "Consolidation Test",
      "Permeability Test",
      "Specific Gravity Test",
    ],
  },
  {
    testType: "Concrete Testing",
    subTests: [
      "Slump Test",
      "Flow Table Test",
      "Compaction Factor Test",
      "Vee-Bee Test",
      "Air Content Test",
      "Compressive Strength Test",
      "Split Tensile Test",
      "Flexural Strength Test",
      "Modulus of Elasticity Test",
      "Rebound Hammer Test",
      "Ultrasonic Pulse Velocity (UPV)",
      "Core Test",
      "Half-Cell Potential Test",
      "Impact Echo Test",
    ],
  },
  {
    testType: "Aggregate Testing",
    subTests: [
      "Sieve Analysis",
      "Aggregate Crushing Value Test",
      "Aggregate Impact Value Test",
      "Los Angeles Abrasion Test",
      "Specific Gravity Test",
      "Water Absorption Test",
      "Flakiness Index Test",
      "Elongation Index Test",
      "Soundness Test",
      "Bulk Density Test",
    ],
  },
  {
    testType: "Cement Testing",
    subTests: [
      "Fineness Test",
      "Standard Consistency Test",
      "Initial Setting Time Test",
      "Final Setting Time Test",
      "Soundness Test",
      "Compressive Strength Test",
      "Specific Gravity Test",
      "Heat of Hydration Test",
    ],
  },
  {
    testType: "Steel Testing",
    subTests: [
      "Tensile Test",
      "Yield Strength Test",
      "Bend Test",
      "Rebend Test",
      "Impact Test",
      "Hardness Test",
      "Chemical Composition Test",
    ],
  },
  {
    testType: "Brick/Block Testing",
    subTests: [
      "Compressive Strength Test",
      "Water Absorption Test",
      "Efflorescence Test",
      "Dimension Test",
      "Hardness Test",
      "Soundness Test",
    ],
  },
  {
    testType: "Timber Testing",
    subTests: [
      "Moisture Content Test",
      "Density Test",
      "Compression Test",
      "Bending Test",
      "Shear Test",
      "Hardness Test",
    ],
  },
  {
    testType: "Bitumen Testing",
    subTests: [
      "Penetration Test",
      "Softening Point Test",
      "Ductility Test",
      "Viscosity Test",
      "Flash Point Test",
      "Fire Point Test",
    ],
  },
  {
    testType: "Asphalt Testing",
    subTests: [
      "Marshall Stability Test",
      "Bitumen Content Test",
      "Density Test",
      "Core Cutting Test",
      "Rutting Test",
    ],
  },
  {
    testType: "Water Testing",
    subTests: [
      "pH Test",
      "Chloride Content Test",
      "Sulphate Content Test",
      "Total Dissolved Solids (TDS)",
      "Organic Impurity Test",
    ],
  },
  {
    testType: "Structural Testing",
    subTests: [
      "Load Test",
      "Deflection Test",
      "Crack Monitoring",
      "Vibration Test",
      "Structural Health Monitoring",
    ],
  },
  {
    testType: "Electrical Testing",
    subTests: [
      "Insulation Resistance Test",
      "Earth Resistance Test",
      "Continuity Test",
      "Load Test",
    ],
  },
  {
    testType: "Plumbing & HVAC Testing",
    subTests: [
      "Pressure Test",
      "Leak Test",
      "Flow Rate Test",
      "HVAC Performance Test",
    ],
  },
  {
    testType: "Custom Testing",
    subTests: [],
  },
];

export const STATUS_CONFIG: Record<
  TaskStatus,
  { bg: string; text: string; dot: string; label: string }
> = {
  ahead_of_schedule: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-500",
    label: "Ahead of Schedule",
  },
  on_schedule: {
    bg: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
    label: "On Schedule",
  },
  behind_schedule: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    dot: "bg-yellow-500",
    label: "Behind Schedule",
  },
  at_risk: {
    bg: "bg-red-100",
    text: "text-red-800",
    dot: "bg-red-500",
    label: "At Risk",
  },
};

export const QUEUE_LABELS: Record<QueueType, string> = {
  todo: "TO-DO",
  in_progress: "In Progress",
  on_hold: "On Hold",
  uncompleted: "Uncompleted",
  completed: "Completed",
  cancelled: "Cancelled",
};

export type DocumentType =
  | "drawing"
  | "method_statement"
  | "ar_scope"
  | "photo"
  | "report";

export interface TaskDocument {
  id: string;
  title: string;
  type: DocumentType;
  url?: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface MaterialResource {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  status: "delivered" | "in_transit" | "pending" | "low_stock" | "requested";
  eta?: string;
  carrier?: string;
  notes?: string;
  willGoNegative?: boolean;
  originalStock?: number;
  isNew?: boolean;
  category?: string;
  unitCost?: number;
}

export interface EquipmentResource {
  id: string;
  name: string;
  status: "pending" | "on_site" | "off_site" | "maintenance" | "reserved" | "requested";
  location?: string;
  operator?: string;
  isNew?: boolean;
  category?: string;
  condition?: string;
  unitCost?: number;
  quantity?: string;
}

export interface ManpowerResource {
  id: string;
  name: string;
  role: string;
  status: "present" | "absent" | "late";
  notified?: boolean;
  notes?: string;
}

export type PPEStatus = "on_site" | "off_site" | "maintenance" | "reserved" | "pending" | "requested";

export interface PPEResource {
  id: string;
  name: string;
  status: PPEStatus;
  ppeCategory?: string;
  size?: string;
  isNew?: boolean;
  unit?: string;
  quantity?: string;
  unitCost?: number;
}

export interface TaskResources {
  materials: MaterialResource[];
  equipment: EquipmentResource[];
  manpower: ManpowerResource[];
  ppe?: PPEResource[];
}

export type MessageSource = "chat" | "ar" | "system";

export interface TaskMessage {
  id: string;
  sender: string;
  senderRole: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  source: MessageSource;
  attachments?: string[];
  snapshotUrl?: string;
  requiresAttention?: boolean;
}

export interface TaskNote {
  id: string;
  sender: string;
  senderRole: string;
  content: string;
  timestamp: string;
  read: boolean;
  requiresAttention?: boolean;
  noteType: "update" | "attention" | "private";
  recipientRole?: string;
  attachments?: { name: string; url: string; type: string }[];
}

export interface TaskInstructions {
  documents: TaskDocument[];
}

// TYPE_CHECK: type __TaskWpCheck = Task['wp']
