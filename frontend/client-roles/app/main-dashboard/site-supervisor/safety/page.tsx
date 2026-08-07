"use client";

import { useState } from "react";
import { User, AlertTriangle, FileText, MessageSquare, Scan, ShieldAlert, AlertCircle, ClipboardCheck, GraduationCap } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import {
  mockIncidents,
  mockInspections,
  mockNCRs,
  mockPTWs,
  mockRiskAssessments,
  mockToolboxTalks,
  mockTraining,
  type Incident,
  type Inspection,
  type NCR,
  type PTW,
  type RiskAssessment,
  type ToolboxTalk,
  type Training,
} from "@/lib/mockData/hse";
import IncidentReportModal, { type IncidentFormData } from "./components/IncidentReportModal";
import PTWModal, { type PTWFormData } from "./components/PTWModal";
import EquipmentInspectionModal, { type InspectionFormData } from "./components/EquipmentInspectionModal";
import NonConformityModal, { type NCRFormData } from "./components/NonConformityModal";
import RiskAssessmentModal, { type RiskFormData } from "./components/RiskAssessmentModal";
import ToolboxTalkModal, { type ToolboxTalkFormData } from "./components/ToolboxTalkModal";
import TrainingModal, { type TrainingFormData } from "./components/TrainingModal";

type TabType = "incidents" | "inspections" | "ncrs" | "ptws" | "risk-assessments" | "toolbox-talks" | "training";

export default function SafetyPage() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<TabType>("incidents");

  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [inspections, setInspections] = useState<Inspection[]>(mockInspections);
  const [ncrs, setNcrs] = useState<NCR[]>(mockNCRs);
  const [ptws, setPtws] = useState<PTW[]>(mockPTWs);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>(mockRiskAssessments);
  const [toolboxTalks, setToolboxTalks] = useState<ToolboxTalk[]>(mockToolboxTalks);
  const [training, setTraining] = useState<Training[]>(mockTraining);

  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isPTWModalOpen, setIsPTWModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isNCRModalOpen, setIsNCRModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isToolboxModalOpen, setIsToolboxModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);

  const safeDaysCount = 47;
  const incidentDaysCount = 3;
  const safetyRating = 94;

  const handleIncidentSubmit = (data: IncidentFormData) => {
    const newIncident: Incident = {
      id: Date.now(),
      ...data,
      status: "Open",
    };
    setIncidents((prev) => [newIncident, ...prev]);
  };

  const handlePTWSubmit = (data: PTWFormData) => {
    const newPTW: PTW = {
      id: Date.now(),
      ...data,
      status: "Active",
    };
    setPtws((prev) => [newPTW, ...prev]);
  };

  const handleInspectionSubmit = (data: InspectionFormData) => {
    const newInspection: Inspection = {
      id: Date.now(),
      ...data,
      date: new Date().toISOString().split("T")[0],
    };
    setInspections((prev) => [newInspection, ...prev]);
  };

  const handleNCRSubmit = (data: NCRFormData) => {
    const newNCR: NCR = {
      id: Date.now(),
      ...data,
    };
    setNcrs((prev) => [newNCR, ...prev]);
  };

  const handleRiskSubmit = (data: RiskFormData) => {
    const newRisk: RiskAssessment = {
      id: Date.now(),
      ...data,
      date: new Date().toISOString().split("T")[0],
    };
    setRiskAssessments((prev) => [newRisk, ...prev]);
  };

  const handleToolboxSubmit = (data: ToolboxTalkFormData) => {
    const newTalk: ToolboxTalk = {
      id: Date.now(),
      ...data,
    };
    setToolboxTalks((prev) => [newTalk, ...prev]);
  };

  const handleTrainingSubmit = (data: TrainingFormData) => {
    const newTrainingItem: Training = {
      id: Date.now(),
      ...data,
    };
    setTraining((prev) => [newTrainingItem, ...prev]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-700";
      case "Major":
      case "Minor":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Fail":
      case "Expired":
      case "Open":
        return "bg-red-100 text-red-700";
      case "Pass":
      case "Active":
      case "Closed":
      case "Conditional":
      case "In Progress":
      case "Investigating":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
      case "Low":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
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

  return (
    <div className="p-6 md:p-8 space-y-8 pb-20">
      <IncidentReportModal isOpen={isIncidentModalOpen} onClose={() => setIsIncidentModalOpen(false)} onSubmit={handleIncidentSubmit} />
      <PTWModal isOpen={isPTWModalOpen} onClose={() => setIsPTWModalOpen(false)} onSubmit={handlePTWSubmit} />
      <EquipmentInspectionModal isOpen={isInspectionModalOpen} onClose={() => setIsInspectionModalOpen(false)} onSubmit={handleInspectionSubmit} />
      <NonConformityModal isOpen={isNCRModalOpen} onClose={() => setIsNCRModalOpen(false)} onSubmit={handleNCRSubmit} />
      <RiskAssessmentModal isOpen={isRiskModalOpen} onClose={() => setIsRiskModalOpen(false)} onSubmit={handleRiskSubmit} />
      <ToolboxTalkModal isOpen={isToolboxModalOpen} onClose={() => setIsToolboxModalOpen(false)} onSubmit={handleToolboxSubmit} />
      <TrainingModal isOpen={isTrainingModalOpen} onClose={() => setIsTrainingModalOpen(false)} onSubmit={handleTrainingSubmit} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#021422]">Safety Command Center</h1>
          <p className="text-sm text-gray-500 mt-1">HSE & QA/QC Management</p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div className="flex flex-col">
            <span className="font-bold text-[#021422]">{user?.fullname || user?.username || "Crew Manager"}</span>
            <span className="text-xs text-gray-500 uppercase">{user?.role?.replace("_", " ") || "Manager"}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User size={16} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[160px]">
          <div>
            <h3 className="text-gray-500 font-semibold text-xs uppercase tracking-wide mb-2">SAFETY SCORE</h3>
            <span className="text-4xl font-bold text-[#021422]">{safetyRating}%</span>
          </div>
          <p className="text-gray-500 text-xs">Target: 95%</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[160px]">
          <div>
            <h3 className="text-gray-500 font-semibold text-xs uppercase tracking-wide mb-2">FAILED INSPECTIONS</h3>
            <span className="text-4xl font-bold text-[#021422]">{inspections.filter((i) => i.status === "Fail").length}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-700">{inspections.filter((i) => i.status === "Conditional").length}</span>
            <span className="text-gray-500 text-xs">Conditional</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[160px]">
          <div>
            <h3 className="text-gray-500 font-semibold text-xs uppercase tracking-wide mb-2">INCIDENTS MTD</h3>
            <span className="text-4xl font-bold text-[#021422]">{incidents.filter((i) => i.status !== "Closed").length}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-700">{incidents.filter((i) => i.category === "Lost Time Injury").length}</span>
            <span className="text-gray-500 text-xs">LTI</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[160px]">
          <div>
            <h3 className="text-gray-500 font-semibold text-xs uppercase tracking-wide mb-2">QA/QC STATUS</h3>
            <span className="text-4xl font-bold text-[#021422]">
              {inspections.filter((i) => i.status === "Pass").length}/{inspections.length}
            </span>
          </div>
          <p className="text-gray-500 text-xs">Passed / Total</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[160px]">
          <div>
            <h3 className="text-gray-500 font-semibold text-xs uppercase tracking-wide mb-2">SAFE DAYS</h3>
            <span className="text-4xl font-bold text-gray-700">{safeDaysCount}</span>
          </div>
          <p className="text-gray-500 text-xs">No LTI</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[160px]">
          <div>
            <h3 className="text-gray-500 font-semibold text-xs uppercase tracking-wide mb-2">INCIDENT DAYS</h3>
            <span className="text-4xl font-bold text-gray-700">{incidentDaysCount}</span>
          </div>
          <p className="text-gray-500 text-xs">This month</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[160px]">
          <div>
            <h3 className="text-gray-500 font-semibold text-xs uppercase tracking-wide mb-2">SAFETY RATING</h3>
            <span className="text-4xl font-bold text-[#021422]">{safetyRating}/100</span>
          </div>
          <p className="text-gray-500 text-xs">Performance</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[160px]">
          <div>
            <h3 className="text-gray-500 font-semibold text-xs uppercase tracking-wide mb-2">OPEN NCRs</h3>
            <span className="text-4xl font-bold text-[#021422]">{ncrs.filter((n) => n.status !== "Closed").length}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-700">{ncrs.filter((n) => n.severity === "Critical").length}</span>
            <span className="text-gray-500 text-xs">Critical</span>
          </div>
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
                <div className="space-y-3">
                  {incidents.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No incidents recorded</p>
                  ) : (
                    incidents.map((incident) => (
                      <div key={incident.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getSeverityColor(incident.severity)}`}>
                                {incident.severity}
                              </span>
                              <span className="text-xs text-gray-500">{incident.category}</span>
                            </div>
                            <p className="font-semibold text-[#021422]">{incident.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{incident.location}</span>
                              <span>{incident.date}</span>
                              <span>Reporter: {incident.reporter}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getStatusColor(incident.status)}`}>
                            {incident.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "inspections" && (
                <div className="space-y-3">
                  {inspections.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No inspections recorded</p>
                  ) : (
                    inspections.map((inspection) => (
                      <div key={inspection.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-[#021422]">{inspection.equipment}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Inspector: {inspection.inspector}</span>
                              <span>{inspection.date}</span>
                            </div>
                            {inspection.notes && <p className="text-sm text-gray-600 mt-1">{inspection.notes}</p>}
                          </div>
                          <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getStatusColor(inspection.status)}`}>
                            {inspection.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "ncrs" && (
                <div className="space-y-3">
                  {ncrs.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No NCRs recorded</p>
                  ) : (
                    ncrs.map((ncr) => (
                      <div key={ncr.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getSeverityColor(ncr.severity)}`}>
                                {ncr.severity}
                              </span>
                            </div>
                            <p className="font-semibold text-[#021422]">{ncr.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{ncr.location}</span>
                              <span>Deadline: {ncr.deadline}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getStatusColor(ncr.status)}`}>
                            {ncr.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "ptws" && (
                <div className="space-y-3">
                  {ptws.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No PTWs recorded</p>
                  ) : (
                    ptws.map((ptw) => (
                      <div key={ptw.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText size={16} className="text-gray-400" />
                              <span className="font-semibold text-[#021422]">{ptw.type}</span>
                            </div>
                            <p className="text-sm text-gray-600">{ptw.location}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Issued by: {ptw.issuedBy}</span>
                              <span>Valid until: {ptw.validUntil}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getStatusColor(ptw.status)}`}>
                            {ptw.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "risk-assessments" && (
                <div className="space-y-3">
                  {riskAssessments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No risk assessments recorded</p>
                  ) : (
                    riskAssessments.map((risk) => (
                      <div key={risk.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getRiskLevelColor(risk.riskLevel)}`}>
                                {risk.riskLevel}
                              </span>
                              <span className="text-xs text-gray-500">{risk.category}</span>
                            </div>
                            <p className="font-semibold text-[#021422]">{risk.hazard}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {risk.controls.map((control, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                  {control}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{risk.date}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "toolbox-talks" && (
                <div className="space-y-3">
                  {toolboxTalks.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No toolbox talks recorded</p>
                  ) : (
                    toolboxTalks.map((talk) => (
                      <div key={talk.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare size={16} className="text-gray-400" />
                              <span className="font-semibold text-[#021422]">{talk.topic}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{talk.crew}</span>
                              <span>{talk.date}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {talk.attendees.map((attendee, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                  {attendee}
                                </span>
                              ))}
                            </div>
                            {talk.notes && <p className="text-sm text-gray-600 mt-1">{talk.notes}</p>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "training" && (
                <div className="space-y-3">
                  {training.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No training sessions recorded</p>
                  ) : (
                    training.map((t) => (
                      <div key={t.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <GraduationCap size={16} className="text-gray-400" />
                              <span className="font-semibold text-[#021422]">{t.title}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{t.purpose}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{t.date} {t.time}</span>
                              <span>{t.duration}</span>
                              <span>Instructor: {t.instructor}</span>
                              <span>{t.location}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {t.attendees.map((attendee, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                  {attendee}
                                </span>
                              ))}
                            </div>
                            {t.notes && <p className="text-sm text-gray-600 mt-2 italic">{t.notes}</p>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 h-fit shadow-sm">
          <h2 className="text-xl font-bold text-[#021422] mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => setIsIncidentModalOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <AlertTriangle size={20} className="text-[#021422]" />
              <span className="font-semibold text-[#021422]">Report Incident</span>
            </button>
            <button
              onClick={() => setIsPTWModalOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <FileText size={20} className="text-[#021422]" />
              <span className="font-semibold text-[#021422]">Request PTW</span>
            </button>
            <button
              onClick={() => setIsInspectionModalOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <ClipboardCheck size={20} className="text-[#021422]" />
              <span className="font-semibold text-[#021422]">Log Equipment Inspection</span>
            </button>
            <button
              onClick={() => setIsNCRModalOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <AlertCircle size={20} className="text-[#021422]" />
              <span className="font-semibold text-[#021422]">Log Non-Conformity</span>
            </button>
            <button
              onClick={() => setIsRiskModalOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <ShieldAlert size={20} className="text-[#021422]" />
              <span className="font-semibold text-[#021422]">Risk Assessment</span>
            </button>
            <button
              onClick={() => setIsToolboxModalOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <MessageSquare size={20} className="text-[#021422]" />
              <span className="font-semibold text-[#021422]">Toolbox Talk</span>
            </button>
            <button
              onClick={() => setIsTrainingModalOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <GraduationCap size={20} className="text-[#021422]" />
              <span className="font-semibold text-[#021422]">Training</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#002b4d] bg-[#002b4d] hover:bg-[#001f38] transition-colors text-left">
              <Scan size={20} className="text-white" />
              <span className="font-semibold text-white">Site AR Scan Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
