"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, FileText, MessageSquare, Scan, ShieldAlert, AlertCircle, ClipboardCheck, GraduationCap } from "lucide-react";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { useMemberships } from "@/lib/hooks/useMemberships";
import CrewHeader from "../component/CrewHeader";
import {
  hseService,
  type ApiIncident,
  type ApiInspection,
  type ApiNCR,
  type ApiPermit,
  type ApiRiskAssessment,
  type ApiToolboxTalk,
  type ApiTraining,
  type CreateIncidentBody,
  type CreateInspectionBody,
  type CreateNCRBody,
  type CreatePermitBody,
  type CreateRiskAssessmentBody,
  type CreateToolboxTalkBody,
  type CreateTrainingBody,
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
  NCR_SEVERITY_LABELS,
  NCR_STATUS_LABELS,
  PTW_TYPE_LABELS,
  RISK_CATEGORY_LABELS,
  RISK_LEVEL_LABELS,
} from "@/lib/services/hseService";
import { hseKeys } from "@/lib/queryKeys";
import { AnimatePresence } from "framer-motion";
import IncidentReportModal from "@/app/[org_slug]/projects/[project_slug]/_components/hse/IncidentReportModal";
import PTWModal from "@/app/[org_slug]/projects/[project_slug]/_components/hse/PTWModal";
import EquipmentInspectionModal from "@/app/[org_slug]/projects/[project_slug]/_components/hse/EquipmentInspectionModal";
import NonConformityModal from "@/app/[org_slug]/projects/[project_slug]/_components/hse/NonConformityModal";
import RiskAssessmentModal from "@/app/[org_slug]/projects/[project_slug]/_components/hse/RiskAssessmentModal";
import ToolboxTalkModal from "@/app/[org_slug]/projects/[project_slug]/_components/hse/ToolboxTalkModal";
import TrainingModal from "@/app/[org_slug]/projects/[project_slug]/_components/hse/TrainingModal";

interface SafetyPageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

type TabType = "incidents" | "inspections" | "ncrs" | "ptws" | "risk-assessments" | "toolbox-talks" | "training";

export default function SafetyPage({ params }: SafetyPageProps) {
  const { org_slug, project_slug } = use(params);
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>("incidents");

  // ─── Queries ──────────────────────────────────────────────────────────────
  const { data: incidents = [], isLoading: incidentsLoading } = useQuery<ApiIncident[]>({
    queryKey: hseKeys.incidents(projectUuid ?? ""),
    queryFn: async () => {
      const res = await hseService.getIncidents(projectUuid!);
      return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
    },
    enabled: !!projectUuid,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const { data: inspections = [], isLoading: inspectionsLoading } = useQuery<ApiInspection[]>({
    queryKey: hseKeys.inspections(projectUuid ?? ""),
    queryFn: async () => {
      const res = await hseService.getInspections(projectUuid!);
      return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
    },
    enabled: !!projectUuid,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const { data: ncrs = [], isLoading: ncrsLoading } = useQuery<ApiNCR[]>({
    queryKey: hseKeys.ncrs(projectUuid ?? ""),
    queryFn: async () => {
      const res = await hseService.getNCRs(projectUuid!);
      return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
    },
    enabled: !!projectUuid,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const { data: ptws = [], isLoading: ptwsLoading } = useQuery<ApiPermit[]>({
    queryKey: hseKeys.permits(projectUuid ?? ""),
    queryFn: async () => {
      const res = await hseService.getPermits(projectUuid!);
      return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
    },
    enabled: !!projectUuid,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const { data: riskAssessments = [], isLoading: riskLoading } = useQuery<ApiRiskAssessment[]>({
    queryKey: hseKeys.riskAssessments(projectUuid ?? ""),
    queryFn: async () => {
      const res = await hseService.getRiskAssessments(projectUuid!);
      return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
    },
    enabled: !!projectUuid,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const { data: toolboxTalks = [], isLoading: toolboxLoading } = useQuery<ApiToolboxTalk[]>({
    queryKey: hseKeys.toolboxTalks(projectUuid ?? ""),
    queryFn: async () => {
      const res = await hseService.getToolboxTalks(projectUuid!);
      return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
    },
    enabled: !!projectUuid,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const { data: training = [], isLoading: trainingLoading } = useQuery<ApiTraining[]>({
    queryKey: hseKeys.trainings(projectUuid ?? ""),
    queryFn: async () => {
      const res = await hseService.getTrainings(projectUuid!);
      return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
    },
    enabled: !!projectUuid,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  // ─── Mutations ────────────────────────────────────────────────────────────
  const createIncidentMutation = useMutation({
    mutationFn: async ({ data, files }: { data: CreateIncidentBody; files?: File[] }) => {
      const res = await hseService.createIncident(projectUuid ?? "", data);
      const created: ApiIncident = res.data;
      if (files?.length && created.uuid) {
        await Promise.all(
          files.map((file) => hseService.uploadEvidence(projectUuid ?? "", created.uuid, file))
        );
      }
      return created;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hseKeys.incidents(projectUuid ?? "") }),
  });

  const createInspectionMutation = useMutation({
    mutationFn: (data: CreateInspectionBody) => hseService.createInspection(projectUuid ?? "", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hseKeys.inspections(projectUuid ?? "") }),
  });

  const createNCRMutation = useMutation({
    mutationFn: (data: CreateNCRBody) => hseService.createNCR(projectUuid ?? "", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hseKeys.ncrs(projectUuid ?? "") }),
  });

  const createPermitMutation = useMutation({
    mutationFn: (data: CreatePermitBody) => hseService.createPermit(projectUuid ?? "", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hseKeys.permits(projectUuid ?? "") }),
  });

  const createRiskMutation = useMutation({
    mutationFn: (data: CreateRiskAssessmentBody) => hseService.createRiskAssessment(projectUuid ?? "", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hseKeys.riskAssessments(projectUuid ?? "") }),
  });

  const createToolboxMutation = useMutation({
    mutationFn: (data: CreateToolboxTalkBody) => hseService.createToolboxTalk(projectUuid ?? "", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hseKeys.toolboxTalks(projectUuid ?? "") }),
  });

  const createTrainingMutation = useMutation({
    mutationFn: (data: CreateTrainingBody) => hseService.createTraining(projectUuid ?? "", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hseKeys.trainings(projectUuid ?? "") }),
  });

  // ─── Modal state ──────────────────────────────────────────────────────────
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isPTWModalOpen, setIsPTWModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isNCRModalOpen, setIsNCRModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isToolboxModalOpen, setIsToolboxModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);

  const [selectedIncident, setSelectedIncident] = useState<ApiIncident | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<ApiInspection | null>(null);
  const [selectedNCR, setSelectedNCR] = useState<ApiNCR | null>(null);
  const [selectedPTW, setSelectedPTW] = useState<ApiPermit | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<ApiRiskAssessment | null>(null);
  const [selectedTalk, setSelectedTalk] = useState<ApiToolboxTalk | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<ApiTraining | null>(null);

  const safeDaysCount = 47;
  const incidentDaysCount = 3;
  const safetyRating = 94;

  // ─── Color helpers ────────────────────────────────────────────────────────
  const getSeverityColor = (s: string) => {
    switch (s) {
      case "CRITICAL": return "bg-red-100 text-red-700";
      case "MAJOR": return "bg-orange-100 text-orange-700";
      case "MINOR": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getIncidentStatusColor = (s: string) => {
    switch (s) {
      case "OPEN": return "bg-red-100 text-red-700";
      case "INVESTIGATING": return "bg-blue-100 text-blue-700";
      case "CLOSED": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getInspectionStatusColor = (s: string) => {
    switch (s) {
      case "FAIL": return "bg-red-100 text-red-700";
      case "PASS": return "bg-green-100 text-green-700";
      case "CONDITIONAL": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getNCRStatusColor = (s: string) => {
    switch (s) {
      case "OPEN": return "bg-red-100 text-red-700";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-700";
      case "CLOSED": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPTWStatusColor = (s: string) => {
    switch (s?.toUpperCase()) {
      case "ACTIVE": return "bg-green-100 text-green-700";
      case "EXPIRED": return "bg-red-100 text-red-700";
      case "REVOKED": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getRiskLevelColor = (l: string) => {
    switch (l) {
      case "HIGH": return "bg-red-100 text-red-700";
      case "MEDIUM": return "bg-orange-100 text-orange-700";
      case "LOW": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getNCRSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "bg-red-100 text-red-700";
      case "MAJOR":    return "bg-orange-100 text-orange-700";
      case "MINOR":    return "bg-yellow-100 text-yellow-700";
      default:         return "bg-gray-100 text-gray-700";
    }
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: "incidents", label: "Incidents", count: incidents.length },
    { key: "inspections", label: "Inspections", count: inspections.length },
    { key: "ncrs", label: "Non-Conformities", count: ncrs.length },
    { key: "ptws", label: "PTWs", count: ptws.length },
    { key: "risk-assessments", label: "Risk Assessments", count: riskAssessments.length },
    { key: "toolbox-talks", label: "Toolbox Talks", count: toolboxTalks.length },
    { key: "training", label: "Training", count: training.length },
  ];

  const loadingRow = (
    <div className="border border-gray-100 rounded-xl p-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </div>
  );

  return (
    <div>
      <AnimatePresence>
        {isIncidentModalOpen && (
          <IncidentReportModal
            isOpen
            onClose={() => { setSelectedIncident(null); setIsIncidentModalOpen(false); }}
            onSubmit={(data, files) => createIncidentMutation.mutate({ data, files })}
            record={selectedIncident}
            projectUuid={projectUuid}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isPTWModalOpen && (
          <PTWModal
            isOpen
            onClose={() => { setSelectedPTW(null); setIsPTWModalOpen(false); }}
            onSubmit={(data) => createPermitMutation.mutate(data)}
            record={selectedPTW}
            projectUuid={projectUuid ?? ""}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isInspectionModalOpen && (
          <EquipmentInspectionModal
            isOpen
            onClose={() => { setSelectedInspection(null); setIsInspectionModalOpen(false); }}
            onSubmit={(data) => createInspectionMutation.mutate(data)}
            record={selectedInspection}
            projectUuid={projectUuid ?? ""}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isNCRModalOpen && (
          <NonConformityModal
            isOpen
            onClose={() => { setSelectedNCR(null); setIsNCRModalOpen(false); }}
            onSubmit={(data) => createNCRMutation.mutate(data)}
            record={selectedNCR}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isRiskModalOpen && (
          <RiskAssessmentModal
            isOpen
            onClose={() => { setSelectedRisk(null); setIsRiskModalOpen(false); }}
            onSubmit={(data) => createRiskMutation.mutate(data)}
            record={selectedRisk}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isToolboxModalOpen && (
          <ToolboxTalkModal
            isOpen
            onClose={() => { setSelectedTalk(null); setIsToolboxModalOpen(false); }}
            onSubmit={(data) => createToolboxMutation.mutate(data)}
            record={selectedTalk}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isTrainingModalOpen && (
          <TrainingModal
            isOpen
            onClose={() => { setSelectedTraining(null); setIsTrainingModalOpen(false); }}
            onSubmit={(data) => createTrainingMutation.mutate(data)}
            record={selectedTraining}
          />
        )}
      </AnimatePresence>

      <CrewHeader
        title={project ? (project as { name?: string }).name ?? project_slug : project_slug}
        badge="HSE/QA"
      />

      <div className="space-y-6 pb-20 p-4 md:p-8 pt-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[100px]">
            <div>
              <h3 className="text-gray-500 font-semibold text-[10px] uppercase tracking-wide mb-0.5">SAFETY SCORE</h3>
              <span className="text-xl font-bold text-[#021422]">{safetyRating}%</span>
            </div>
            <p className="text-gray-500 text-[10px]">Target: 95%</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[100px]">
            <div>
              <h3 className="text-gray-500 font-semibold text-[10px] uppercase tracking-wide mb-0.5">FAILED INSPECTIONS</h3>
              <span className="text-xl font-bold text-[#021422]">{inspections.filter((i) => i.status === "FAIL").length}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-gray-700">{inspections.filter((i) => i.status === "CONDITIONAL").length}</span>
              <span className="text-gray-500 text-[10px]">Conditional</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[100px]">
            <div>
              <h3 className="text-gray-500 font-semibold text-[10px] uppercase tracking-wide mb-0.5">INCIDENTS MTD</h3>
              <span className="text-xl font-bold text-[#021422]">{incidents.filter((i) => i.status !== "CLOSED").length}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-gray-700">{incidents.filter((i) => i.category === "LOST_TIME_INJURY").length}</span>
              <span className="text-gray-500 text-[10px]">LTI</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[100px]">
            <div>
              <h3 className="text-gray-500 font-semibold text-[10px] uppercase tracking-wide mb-0.5">QA/QC STATUS</h3>
              <span className="text-xl font-bold text-[#021422]">
                {inspections.filter((i) => i.status === "PASS").length}/{inspections.length}
              </span>
            </div>
            <p className="text-gray-500 text-[10px]">Passed / Total</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[100px]">
            <div>
              <h3 className="text-gray-500 font-semibold text-[10px] uppercase tracking-wide mb-0.5">SAFE DAYS</h3>
              <span className="text-xl font-bold text-gray-700">{safeDaysCount}</span>
            </div>
            <p className="text-gray-500 text-[10px]">No LTI</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[100px]">
            <div>
              <h3 className="text-gray-500 font-semibold text-[10px] uppercase tracking-wide mb-0.5">INCIDENT DAYS</h3>
              <span className="text-xl font-bold text-gray-700">{incidentDaysCount}</span>
            </div>
            <p className="text-gray-500 text-[10px]">This month</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[100px]">
            <div>
              <h3 className="text-gray-500 font-semibold text-[10px] uppercase tracking-wide mb-0.5">SAFETY RATING</h3>
              <span className="text-xl font-bold text-[#021422]">{safetyRating}/100</span>
            </div>
            <p className="text-gray-500 text-[10px]">Performance</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[100px]">
            <div>
              <h3 className="text-gray-500 font-semibold text-[10px] uppercase tracking-wide mb-0.5">OPEN NCRs</h3>
              <span className="text-xl font-bold text-[#021422]">{ncrs.filter((n) => n.status !== "CLOSED").length}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-gray-700">{ncrs.filter((n) => n.severity === "CRITICAL").length}</span>
              <span className="text-gray-500 text-[10px]">Critical</span>
            </div>
          </div>
        </div>

        {/* Safety KPI Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="bg-[#021422] text-white p-4">
            <h2 className="text-sm font-semibold tracking-widest uppercase">Safety KPI Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">PACKAGE</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">P.O.B.</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Man-Hour Exposure</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Package Total Man-Hour</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Project Total Man-Hour</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Man-Hour YTD</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Total Man-Hour Without LTI</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 bg-white">
                  <td className="py-3 px-4 text-sm text-gray-800 uppercase">CIVIL WORK (PROPOSED CONCRETE BEAM FOR LADOL OPERATIONS AT LADOL BASE)</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">132</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">9</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">1,188</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">1,188</td>
                  <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">159,792</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right font-bold text-lg">159,792</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-3 font-semibold text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.key
                        ? "text-[#021422] border-b-2 border-[#021422]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              <div className="p-4 max-h-[500px] overflow-y-auto">
                {activeTab === "incidents" && (
                  <div className="space-y-2">
                    {incidentsLoading ? [1,2,3].map((i) => <div key={i}>{loadingRow}</div>) :
                    incidents.length === 0 ? <p className="text-center text-gray-500 py-8">No incidents recorded</p> :
                    incidents.map((incident) => (
                      <div key={incident.uuid} className="border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => { setSelectedIncident(incident); setIsIncidentModalOpen(true); }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getSeverityColor(incident.severity)}`}>
                                {INCIDENT_SEVERITY_LABELS[incident.severity]}
                              </span>
                              <span className="text-xs text-gray-500">{INCIDENT_CATEGORY_LABELS[incident.category]}</span>
                            </div>
                            <p className="font-semibold text-[#021422] text-sm">{incident.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{incident.location}</span>
                              <span>{new Date(incident.date_occurred).toLocaleDateString()}</span>
                              <span>Reporter: {incident.reporter}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getIncidentStatusColor(incident.status)}`}>
                            {INCIDENT_STATUS_LABELS[incident.status]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "inspections" && (
                  <div className="space-y-2">
                    {inspectionsLoading ? [1,2,3].map((i) => <div key={i}>{loadingRow}</div>) :
                    inspections.length === 0 ? <p className="text-center text-gray-500 py-8">No inspections recorded</p> :
                    inspections.map((inspection) => (
                      <div key={inspection.uuid} className="border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => { setSelectedInspection(inspection); setIsInspectionModalOpen(true); }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-[#021422] text-sm">{inspection.inspection_type}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Inspector: {inspection.inspector}</span>
                              <span>{new Date(inspection.date_inspected).toLocaleDateString()}</span>
                              <span>{inspection.location}</span>
                            </div>
                            {inspection.notes && <p className="text-sm text-gray-600 mt-1">{inspection.notes}</p>}
                          </div>
                          <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getInspectionStatusColor(inspection.status)}`}>
                            {inspection.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "ncrs" && (
                  <div className="space-y-2">
                    {ncrsLoading ? [1,2,3].map((i) => <div key={i}>{loadingRow}</div>) :
                    ncrs.length === 0 ? <p className="text-center text-gray-500 py-8">No NCRs recorded</p> :
                    ncrs.map((ncr) => (
                      <div key={ncr.uuid} className="border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => { setSelectedNCR(ncr); setIsNCRModalOpen(true); }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getNCRSeverityColor(ncr.severity)}`}>
                                {NCR_SEVERITY_LABELS[ncr.severity]}
                              </span>
                              <span className="text-xs text-gray-500">Reporter: {ncr.reporter}</span>
                            </div>
                            <p className="font-semibold text-[#021422] text-sm">{ncr.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{ncr.location}</span>
                              <span>Deadline: {ncr.deadline ? new Date(ncr.deadline).toLocaleDateString() : "—"}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getNCRStatusColor(ncr.status)}`}>
                            {NCR_STATUS_LABELS[ncr.status]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "ptws" && (
                  <div className="space-y-2">
                    {ptwsLoading ? [1,2,3].map((i) => <div key={i}>{loadingRow}</div>) :
                    ptws.length === 0 ? <p className="text-center text-gray-500 py-8">No PTWs recorded</p> :
                    ptws.map((ptw) => (
                      <div key={ptw.uuid} className="border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => { setSelectedPTW(ptw); setIsPTWModalOpen(true); }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText size={15} className="text-gray-400" />
                              <span className="font-semibold text-[#021422] text-sm">{PTW_TYPE_LABELS[ptw.type]}</span>
                            </div>
                            <p className="text-sm text-gray-600">{ptw.location}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              {ptw.issued_to_name && <span>Issued to: {ptw.issued_to_name}</span>}
                              <span>Valid until: {ptw.validUntil ? new Date(ptw.validUntil).toLocaleDateString() : "—"}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getPTWStatusColor(ptw.status)}`}>
                            {ptw.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "risk-assessments" && (
                  <div className="space-y-2">
                    {riskLoading ? [1,2,3].map((i) => <div key={i}>{loadingRow}</div>) :
                    riskAssessments.length === 0 ? <p className="text-center text-gray-500 py-8">No risk assessments recorded</p> :
                    riskAssessments.map((risk) => {
                      const controlItems = risk.controls ? risk.controls.split("\n").filter(Boolean) : [];
                      return (
                        <div key={risk.uuid} className="border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => { setSelectedRisk(risk); setIsRiskModalOpen(true); }}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getRiskLevelColor(risk.risk_level)}`}>
                                  {RISK_LEVEL_LABELS[risk.risk_level]}
                                </span>
                                <span className="text-xs text-gray-500">{RISK_CATEGORY_LABELS[risk.category]}</span>
                              </div>
                              <p className="font-semibold text-[#021422] text-sm">{risk.description}</p>
                              {controlItems.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {controlItems.slice(0, 3).map((c, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{c}</span>
                                  ))}
                                  {controlItems.length > 3 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">+{controlItems.length - 3}</span>}
                                </div>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                {risk.date_assessed ? new Date(risk.date_assessed).toLocaleDateString() : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === "toolbox-talks" && (
                  <div className="space-y-2">
                    {toolboxLoading ? [1,2,3].map((i) => <div key={i}>{loadingRow}</div>) :
                    toolboxTalks.length === 0 ? <p className="text-center text-gray-500 py-8">No toolbox talks recorded</p> :
                    toolboxTalks.map((talk) => {
                      const attendees = talk.attendees ? talk.attendees.split(",").map((a) => a.trim()).filter(Boolean) : [];
                      return (
                        <div key={talk.uuid} className="border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => { setSelectedTalk(talk); setIsToolboxModalOpen(true); }}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <MessageSquare size={15} className="text-gray-400" />
                                <span className="font-semibold text-[#021422] text-sm">{talk.topic}</span>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                {talk.crew && <span>{talk.crew}</span>}
                                <span>{talk.date_conducted ? new Date(talk.date_conducted).toLocaleDateString() : "—"}</span>
                                {talk.conductor && <span>By: {talk.conductor}</span>}
                              </div>
                              {attendees.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {attendees.slice(0, 4).map((a, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{a}</span>
                                  ))}
                                  {attendees.length > 4 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">+{attendees.length - 4}</span>}
                                </div>
                              )}
                              {talk.notes && <p className="text-sm text-gray-600 mt-1">{talk.notes}</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === "training" && (
                  <div className="space-y-2">
                    {trainingLoading ? [1,2,3].map((i) => <div key={i}>{loadingRow}</div>) :
                    training.length === 0 ? <p className="text-center text-gray-500 py-8">No training sessions recorded</p> :
                    training.map((t) => {
                      const attendees = t.attendees ? t.attendees.split(",").map((a) => a.trim()).filter(Boolean) : [];
                      return (
                        <div key={t.uuid} className="border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => { setSelectedTraining(t); setIsTrainingModalOpen(true); }}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <GraduationCap size={15} className="text-gray-400" />
                                <span className="font-semibold text-[#021422] text-sm">{t.programme_name}</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{t.purpose}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span>{t.date ? new Date(t.date).toLocaleDateString() : "—"}{t.time ? ` ${t.time}` : ""}</span>
                                <span>{t.duration} min</span>
                                {t.instructor_name && <span>Instructor: {t.instructor_name}</span>}
                                <span>{t.location}</span>
                              </div>
                              {attendees.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {attendees.slice(0, 4).map((a, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{a}</span>
                                  ))}
                                  {attendees.length > 4 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">+{attendees.length - 4}</span>}
                                </div>
                              )}
                              {t.notes && <p className="text-sm text-gray-600 mt-2 italic">{t.notes}</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 h-fit shadow-sm">
            <h2 className="text-lg font-bold text-[#021422] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { icon: <AlertTriangle size={18} className="text-[#021422]" />, label: "Report Incident", onClick: () => setIsIncidentModalOpen(true) },
                { icon: <FileText size={18} className="text-[#021422]" />, label: "Request PTW", onClick: () => setIsPTWModalOpen(true) },
                { icon: <ClipboardCheck size={18} className="text-[#021422]" />, label: "Log Equipment Inspection", onClick: () => setIsInspectionModalOpen(true) },
                { icon: <AlertCircle size={18} className="text-[#021422]" />, label: "Log Non-Conformity", onClick: () => setIsNCRModalOpen(true) },
                { icon: <ShieldAlert size={18} className="text-[#021422]" />, label: "Risk Assessment", onClick: () => setIsRiskModalOpen(true) },
                { icon: <MessageSquare size={18} className="text-[#021422]" />, label: "Toolbox Talk", onClick: () => setIsToolboxModalOpen(true) },
                { icon: <GraduationCap size={18} className="text-[#021422]" />, label: "Training", onClick: () => setIsTrainingModalOpen(true) },
              ].map(({ icon, label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  {icon}
                  <span className="font-semibold text-[#021422] text-sm">{label}</span>
                </button>
              ))}
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#002b4d] bg-[#002b4d] hover:bg-[#001f38] transition-colors text-left">
                <Scan size={18} className="text-white" />
                <span className="font-semibold text-white text-sm">Site AR Scan Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
