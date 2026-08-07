"use client";

import { X, FileText, MapPin, User, CheckCircle, Circle, Package, Wrench, Users, Shield, MessageSquare, Clock } from "lucide-react";
import type { ProjectFileDocument, AttendanceReportFile, ScheduleReportFile } from "../../task-details/types";
import { STATUS_CONFIG, QUEUE_LABELS, TASK_TYPE_LABELS, VERSION_TYPE_CONFIG } from "../../task-details/types";

interface DocumentPreviewDrawerProps {
  doc: ProjectFileDocument | AttendanceReportFile | ScheduleReportFile | null;
  onClose: () => void;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function MsgSourceBadge({ source }: { source: string }) {
  const cnf: Record<string, string> = {
    ar: "bg-blue-100 text-blue-700",
    chat: "bg-gray-50 text-gray-400",
    system: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-[10px] px-1 py-0.5 rounded font-bold ${cnf[source] ?? "bg-gray-100 text-gray-500"}`}>
      {source.toUpperCase()}
    </span>
  );
}

function ResourceStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    delivered: "bg-green-100 text-green-700",
    in_transit: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    low_stock: "bg-red-100 text-red-700",
    on_site: "bg-green-100 text-green-700",
    off_site: "bg-gray-100 text-gray-500",
    maintenance: "bg-yellow-100 text-yellow-700",
    reserved: "bg-blue-100 text-blue-700",
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${colors[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function DocumentPreviewDrawer({ doc, onClose }: DocumentPreviewDrawerProps) {
  if (!doc) return null;

  const category = doc.document_category;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-white shadow-xl z-50 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-200 px-2 py-0.5 rounded">
            {category === "task"
              ? "Task File"
              : category === "attendance"
                ? "Attendance Report"
                : "Schedule Report"}
          </span>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-5">
          {/* ── TASK FILE ── */}
          {category === "task" && (() => {
            const t = doc as ProjectFileDocument;
            const snap = t.task_snapshot;
            const statusConfig = t.task_status ? STATUS_CONFIG[t.task_status] : null;
            const queueLabel = t.task_queue ? QUEUE_LABELS[t.task_queue] : null;
            const vCfg = t.version_type ? VERSION_TYPE_CONFIG[t.version_type] : null;
            const taskTypeLabel = t.task_type ? TASK_TYPE_LABELS[t.task_type] : null;

            return (
              <>
                {/* Title row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-[#021422] bg-gray-100 px-2 py-0.5 rounded font-mono">
                        {t.wp ?? t.task_id}
                      </span>
                      {taskTypeLabel && (
                        <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded">
                          {taskTypeLabel}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-[#021422] leading-snug">{t.task_title}</h2>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {vCfg && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${vCfg.bg} ${vCfg.text}`}>
                        v{t.version_number} · {vCfg.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Statuses */}
                <div className="flex items-center gap-2 flex-wrap">
                  {statusConfig && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                      {statusConfig.label}
                    </span>
                  )}
                  {queueLabel && (
                    <span className="text-xs text-gray-400 border border-gray-100 px-2 py-0.5 rounded">
                      {queueLabel}
                    </span>
                  )}
                  {t.pm_approved && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                      <CheckCircle size={11} /> PM Approved
                    </span>
                  )}
                </div>

                {/* Progress */}
                {t.progress != null && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Progress</span>
                      <span className="text-[#021422] font-bold">{t.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-[#021422] transition-all" style={{ width: `${t.progress}%` }} />
                    </div>
                  </div>
                )}

                {/* Details grid */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={14} className="text-gray-400 shrink-0" />
                    <span>Grid <strong className="text-[#021422]">{t.grid}</strong> · {t.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={14} className="text-gray-400 shrink-0" />
                    <span>Project Engineer: <strong className="text-[#021422]">{t.created_by_pm}</strong></span>
                  </div>
                  {t.risk && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText size={14} className="text-gray-400 shrink-0" />
                      <span>Risk: <strong className={t.risk === "High" ? "text-red-600" : t.risk === "Medium" ? "text-amber-600" : "text-green-600"}>{t.risk}</strong></span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {t.description && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</span>
                    <p className="text-sm text-gray-600 leading-relaxed">{t.description}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Schedule</span>
                  <div className="text-sm">
                    {t.is_rescheduled ? (
                      <div className="space-y-1">
                        <p className="text-gray-400">
                          <span className="line-through mr-1">{t.original_start_date} – {t.original_end_date}</span>
                          <span className="text-red-500 text-xs font-semibold">Original Schedule</span>
                        </p>
                        <p className="text-[#021422] font-medium">
                          {t.new_start_date} – {t.new_end_date}
                          <span className="text-green-600 text-xs font-semibold ml-1">Revised Reschedule</span>
                        </p>
                        <p className="text-xs text-amber-600 italic mt-1">{t.reschedule_reason}</p>
                        {t.rescheduled_by && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Rescheduled by <strong className="text-[#021422]">{t.rescheduled_by}</strong>
                            {t.reschedule_approved_by_pm && <span className="text-green-600 ml-1">· PM Approved</span>}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[#021422] font-medium">
                        {t.scheduled_start_date} – {t.scheduled_end_date}
                      </p>
                    )}
                  </div>
                </div>

                {/* Crews */}
                {t.crews && t.crews.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned Crews</span>
                    <div className="flex flex-wrap gap-2">
                      {t.crews.map((c) => (
                        <span key={c.id} className="text-xs bg-gray-100 text-[#021422] px-2 py-1 rounded font-medium">
                          {c.name}
                          <span className="text-gray-500 ml-1">({c.size} workers)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TASK TRACKER ── */}
                {snap?.taskTracker && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Task Tracker</span>
                      <span className="text-xs text-gray-500">
                        {snap.taskTracker.items.filter((i) => i.checked).length} / {snap.taskTracker.items.length} complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-[#021422]"
                        style={{ width: `${(snap.taskTracker.items.filter((i) => i.checked).length / snap.taskTracker.items.length) * 100}%` }}
                      />
                    </div>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto">
                      {snap.taskTracker.items.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 text-xs">
                          {item.checked ? (
                            <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <Circle size={12} className="text-gray-300 mt-0.5 shrink-0" />
                          )}
                          <span className={item.checked ? "text-gray-500 line-through" : "text-gray-700"}>
                            {item.description}
                          </span>
                        </div>
                      ))}
                    </div>
                    {snap.taskTracker.completedAt && (
                      <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle size={10} /> Completed {fmtDate(snap.taskTracker.completedAt)}
                      </p>
                    )}
                  </div>
                )}

                {/* ── RESOURCES ── */}
                {snap?.resources && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resources Used</span>

                    {/* Materials */}
                    {snap.resources.materials && snap.resources.materials.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <Package size={11} /> Materials
                        </span>
                        <div className="bg-gray-50 rounded-lg text-xs divide-y divide-gray-200 max-h-[240px] overflow-y-auto">
                          {snap.resources.materials.map((m) => (
                            <div key={m.id} className="flex items-center justify-between px-3 py-2 gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-[#021422] font-medium truncate">{m.name}</p>
                                <p className="text-gray-400 text-[10px]">
                                  {m.quantity} {m.unit}
                                  {m.unitCost ? ` · $${m.unitCost}/${m.unit}` : ""}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <ResourceStatusBadge status={m.status} />
                                {m.eta && <p className="text-[10px] text-gray-400 mt-0.5">ETA {fmtDate(m.eta)}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Equipment */}
                    {snap.resources.equipment && snap.resources.equipment.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <Wrench size={11} /> Equipment
                        </span>
                        <div className="bg-gray-50 rounded-lg text-xs divide-y divide-gray-200">
                          {snap.resources.equipment.map((eq) => (
                            <div key={eq.id} className="flex items-center justify-between px-3 py-2 gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-[#021422] font-medium truncate">{eq.name}</p>
                                <p className="text-gray-400 text-[10px]">
                                  {eq.location && `📍 ${eq.location}`}
                                  {eq.operator && ` · 👤 ${eq.operator}`}
                                  {eq.unitCost ? ` · $${eq.unitCost}` : ""}
                                </p>
                              </div>
                              <ResourceStatusBadge status={eq.status} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Manpower */}
                    {snap.resources.manpower && snap.resources.manpower.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <Users size={11} /> Manpower
                        </span>
                        <div className="bg-gray-50 rounded-lg text-xs divide-y divide-gray-200">
                          {snap.resources.manpower.map((mp) => (
                            <div key={mp.id} className="flex items-center justify-between px-3 py-2 gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-[#021422] font-medium">{mp.name}</p>
                                <p className="text-gray-400 text-[10px]">{mp.role}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <ResourceStatusBadge status={mp.status} />
                                {mp.notified && <span className="text-[10px] text-blue-500">Notified</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PPE */}
                    {snap.resources.ppe && snap.resources.ppe.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <Shield size={11} /> PPE Issued
                        </span>
                        <div className="bg-gray-50 rounded-lg text-xs divide-y divide-gray-200">
                          {snap.resources.ppe.map((ppe) => (
                            <div key={ppe.id} className="flex items-center justify-between px-3 py-2 gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-[#021422] font-medium">{ppe.name}</p>
                                <p className="text-gray-400 text-[10px]">
                                  {ppe.quantity} {ppe.unit}
                                  {ppe.size ? ` · Size ${ppe.size}` : ""}
                                  {ppe.unitCost ? ` · $${ppe.unitCost}` : ""}
                                </p>
                              </div>
                              <ResourceStatusBadge status={ppe.status} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── ACTIVITY TIMELINE ── */}
                {snap?.communications && snap.communications.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activity Timeline</span>
                    <div className="space-y-0">
                      {[...snap.communications]
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((msg, idx, arr) => {
                          const isLast = idx === arr.length - 1;
                          return (
                            <div key={msg.id} className="flex gap-3 text-xs">
                              <div className="flex flex-col items-center w-4 shrink-0">
                                <MessageSquare size={12} className="text-gray-300 mt-0.5" />
                                {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1" />}
                              </div>
                              <div className={`flex-1 min-w-0 ${!isLast ? "pb-3" : ""}`}>
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  <span className="font-semibold text-[#021422]">{msg.sender}</span>
                                  <span className="text-gray-400 text-[10px]">{msg.senderRole}</span>
                                  <MsgSourceBadge source={msg.source} />
                                </div>
                                <p className="text-gray-600 leading-relaxed">{msg.content}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Clock size={9} className="text-gray-300" />
                                  <p className="text-[10px] text-gray-400">{fmtDateTime(msg.timestamp)}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className="pt-3 border-t border-gray-100 text-[10px] text-gray-400">
                  Created {fmtDateTime(t.created_at)}
                </div>
              </>
            );
          })()}

          {/* ── ATTENDANCE ── */}
          {category === "attendance" && (() => {
            const a = doc as AttendanceReportFile;
            const total = a.present_count + a.absent_count + a.late_count;
            const rate = total > 0 ? Math.round((a.present_count / total) * 100) : 0;

            return (
              <>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-[#021422]">{rate}%</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Attendance Rate</p>
                  <p className="text-sm text-gray-500 mt-2">{fmtDate(a.report_date)}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-[#021422]">{a.present_count}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Present</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-[#021422]">{a.absent_count}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Absent</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-[#021422]">{a.late_count}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Late</p>
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-[#021422] transition-all" style={{ width: `${rate}%` }} />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={14} className="text-gray-400 shrink-0" />
                    <span>Crew Manager: <strong className="text-[#021422]">{a.crew_manager_name}</strong></span>
                  </div>
                  {a.linked_task_wps && a.linked_task_wps.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap text-gray-600">
                      <span className="text-gray-400">Linked tasks:</span>
                      {a.linked_task_wps.map((wp) => (
                        <span key={wp} className="font-mono text-[10px] font-bold text-[#021422] bg-gray-100 px-1.5 py-0.5 rounded">
                          {wp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 text-[10px] text-gray-400">
                  Filed at {fmtDateTime(a.created_at)}
                </div>
              </>
            );
          })()}

          {/* ── SCHEDULE ── */}
          {category === "schedule" && (() => {
            const s = doc as ScheduleReportFile;
            const total = s.on_schedule_count + s.rescheduled_count + s.delayed_count;

            return (
              <>
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-[#021422]">{s.week_label}</p>
                  <p className="text-sm text-gray-500 mt-1">{fmtDate(s.week_start)} – {fmtDate(s.week_end)}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-[#021422]">{s.on_schedule_count}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">On Schedule</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-[#021422]">
                      {s.rescheduled_count}
                      {s.rescheduled_count > 0 && <span className="text-amber-500 ml-0.5">*</span>}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Rescheduled</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-[#021422]">{s.delayed_count}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Delayed</p>
                  </div>
                </div>

                {total > 0 && (
                  <div className="space-y-1.5">
                    <div className="w-full bg-gray-100 rounded-full h-2 flex overflow-hidden">
                      <div className="h-2 bg-[#021422]" style={{ width: `${(s.on_schedule_count / total) * 100}%` }} />
                      <div className="h-2 bg-amber-300" style={{ width: `${(s.rescheduled_count / total) * 100}%` }} />
                      <div className="h-2 bg-gray-400" style={{ width: `${(s.delayed_count / total) * 100}%` }} />
                    </div>
                    <div className="flex gap-4 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1"><span className="w-2 h-1.5 rounded-sm bg-[#021422] inline-block" />On schedule</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-1.5 rounded-sm bg-amber-300 inline-block" />Rescheduled</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-1.5 rounded-sm bg-gray-400 inline-block" />Delayed</span>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 text-[10px] text-gray-400">
                  Generated {fmtDateTime(s.created_at)}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </>
  );
}
