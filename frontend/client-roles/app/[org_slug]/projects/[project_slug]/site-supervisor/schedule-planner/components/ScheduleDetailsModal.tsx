"use client";

import { X, Calendar, Trash2, Move, FileText, Check, Clock, Users } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";
import moment from "moment";
import { useState } from "react";
import DailyTrackingCalendar from "./DailyTrackingCalendar";
import DailyWorkerModal from "./DailyWorkerModal";
import RejectReasonModal from "./RejectReasonModal";
import type { OvertimeEntry, ScheduleWorker } from "@/lib/services/schedulingService";

interface Worker {
  id: string;
  memberId: string;
  name: string;
  trade: string;
}

interface PoolWorker extends Worker {
  type: "crew_member" | "pool_worker";
}

interface DayWorker {
  id: string;
  name: string;
  trade: string;
  memberId: string;
  isDayAdd: boolean;
}

interface DailyWorkerLog {
  id?: string;
  date: string;
  workerIds: string[];
  workers: DayWorker[];
  status: "confirmed" | "pending" | "rejected";
  pendingWorkerIds?: string[];
  rejectionReason?: string;
}

interface ScheduleItem {
  id: string;
  start: Date;
  end: Date;
  title: string;
  members: number | null;
  task: string;
  taskId: string;
  loc: string;
  color: string;
  work_package: string;
  site_zone: string;
  notes?: string;
  durationFrom: string;
  durationTo: string;
  createdAt?: string;
  workers?: Worker[];
  dailyWorkerLogs?: DailyWorkerLog[];
}

interface ScheduleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleItem | null;
  onDelete?: (scheduleId: string) => void;
  onReschedule?: (schedule: ScheduleItem) => void;
  onProposeRemoval: (
    scheduleId: string,
    date: string,
    removeWorkerIds: string[],
  ) => void;
  onApproveLog: (scheduleId: string, logId: string) => void;
  onRejectLog: (scheduleId: string, logId: string, reason: string) => void;
  onAddDayWorker: (date: string, worker: PoolWorker) => void;
  onRemoveDayWorker: (date: string, scheduleWorkerId: string) => void;
  availablePool?: PoolWorker[];
  crewName: string;
  overtimeEntries?: OvertimeEntry[];
  onEditOvertime?: (scheduleId: string, overtimeId: string) => void;
  onDeleteOvertime?: (scheduleId: string, overtimeId: string) => void;
  onAuthorizeOvertime?: () => void;
  rosterWorkers?: ScheduleWorker[];
  pendingRosterWorkers?: ScheduleWorker[];
  onProposeRemoveRoster?: (workerId: string) => void;
  onApproveRoster?: (workerId: string) => void;
  onRejectRoster?: (workerId: string, reason: string) => void;
  onAddRosterWorker?: () => void;
}

export default function ScheduleDetailsModal({
  isOpen,
  onClose,
  schedule,
  onDelete,
  onReschedule,
  onProposeRemoval,
  onApproveLog,
  onRejectLog,
  onAddDayWorker,
  onRemoveDayWorker,
  availablePool = [],
  crewName,
  overtimeEntries = [],
  onEditOvertime,
  onDeleteOvertime,
  onAuthorizeOvertime,
  rosterWorkers = [],
  pendingRosterWorkers = [],
  onProposeRemoveRoster,
  onApproveRoster,
  onRejectRoster,
  onAddRosterWorker,
}: ScheduleDetailsModalProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DailyWorkerLog | null>(null);
  // Roster worker whose pending change is being rejected (separate flow).
  const [rejectRosterId, setRejectRosterId] = useState<string | null>(null);

  if (!isOpen || !schedule) return null;

  const durationDays =
    moment(schedule.durationTo).diff(moment(schedule.durationFrom), "days") + 1;
  const dailyLogs = schedule.dailyWorkerLogs || [];
  const pendingLogs = dailyLogs.filter((l) => l.status === "pending");

  const selectedLog = selectedDay
    ? dailyLogs.find((l) => l.date === selectedDay)
    : null;

  const handleSaveDay = (date: string, removeWorkerIds: string[]) => {
    onProposeRemoval(schedule.id, date, removeWorkerIds);
    setSelectedDay(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  {schedule.title}
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-1 leading-tight">
                  {schedule.task || "Schedule Details"}
                </h2>
                {schedule.createdAt && (
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar size={13} className="text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Created {formatDate(schedule.createdAt)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onAuthorizeOvertime && (
                  <button
                    onClick={onAuthorizeOvertime}
                    title="Authorize Overtime"
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Clock size={16} className="text-gray-600" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Info List */}
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Location
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {schedule.loc || schedule.work_package || "N/A"}
                  </p>
                  {schedule.site_zone && (
                    <p className="text-[10px] text-gray-400">
                      Grid: {schedule.site_zone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Timeline
                  </p>
                  <div className="flex items-center gap-6 mt-1">
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold">
                        Start Date
                      </p>
                      <p className="text-xs font-semibold text-gray-900">
                        {formatDate(schedule.durationFrom)}
                      </p>
                    </div>
                    <span className="text-gray-300 text-sm">→</span>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold">
                        Finish Date
                      </p>
                      <p className="text-xs font-semibold text-gray-900">
                        {formatDate(schedule.durationTo)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mt-2 font-semibold">
                      Duration
                    </p>
                    <p className="text-xs font-semibold text-gray-900">
                      {durationDays} day{durationDays !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Tracking */}
            <div className="border-t border-gray-100 px-6 py-5">
              <DailyTrackingCalendar
                durationFrom={schedule.durationFrom}
                durationTo={schedule.durationTo}
                dailyLogs={dailyLogs}
                onSelectDay={(date) => setSelectedDay(date)}
              />
            </div>

            {/* Pending Approvals — actionable */}
            {pendingLogs.length > 0 && (
              <>
                <div className="border-t border-gray-100" />
                <div className="px-6 py-5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Pending Approvals ({pendingLogs.length})
                  </p>
                  <div className="space-y-2">
                    {pendingLogs.map((log) => (
                      <div
                        key={log.date}
                        className="border border-yellow-200 rounded-lg p-3 bg-yellow-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-gray-900">
                              {moment(log.date).format("ddd, MMM D")}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              {log.workerIds.length} →{" "}
                              {log.pendingWorkerIds?.length ??
                                log.workerIds.length}{" "}
                              workers
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() =>
                                log.id && onApproveLog(schedule.id, log.id)
                              }
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded text-[10px] font-bold hover:bg-green-700 transition-colors"
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button
                              onClick={() => setRejectTarget(log)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 text-white rounded text-[10px] font-bold hover:bg-red-600 transition-colors"
                            >
                              <X size={12} /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            {schedule.notes && (
              <>
                <div className="border-t border-gray-100" />
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={14} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Notes
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {schedule.notes}
                  </p>
                </div>
              </>
            )}

            {/* Worker Roster */}
            {(rosterWorkers.length > 0 || onAddRosterWorker) && (
              <>
                <div className="border-t border-gray-100" />
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Worker Roster ({rosterWorkers.length})
                      </span>
                      {pendingRosterWorkers.length > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                          {pendingRosterWorkers.length} pending
                        </span>
                      )}
                    </div>
                    {onAddRosterWorker && (
                      <button
                        onClick={onAddRosterWorker}
                        className="text-[10px] font-bold text-[#007AFF] hover:text-[#0062cc] px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        + Add worker
                      </button>
                    )}
                  </div>
                  {rosterWorkers.length === 0 ? (
                    <p className="text-[11px] text-gray-400 py-2">
                      No workers on the roster yet.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {rosterWorkers.map((w) => {
                        const isPending =
                          w.status === "pending_add" ||
                          w.status === "pending_remove";
                        const requesterName = w.requested_by
                          ? `${w.requested_by.first_name} ${w.requested_by.last_name}`.trim()
                          : null;
                        return (
                          <div
                            key={w.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600 shrink-0">
                                {w.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {w.name}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate">
                                  {w.trade}
                                  {isPending && requesterName
                                    ? ` · by ${requesterName}`
                                    : ""}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  w.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : w.status === "pending_add"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {w.status === "pending_add"
                                  ? "PENDING ADD"
                                  : w.status === "pending_remove"
                                  ? "PENDING REMOVE"
                                  : "ACTIVE"}
                              </span>

                              {/* Active worker → propose removal */}
                              {w.status === "active" &&
                                onProposeRemoveRoster && (
                                  <button
                                    onClick={() => onProposeRemoveRoster(w.id)}
                                    title="Propose removal"
                                    className="text-[10px] font-bold text-red-500 hover:text-red-700 px-1.5 py-1 rounded hover:bg-red-50 transition-colors"
                                  >
                                    Remove
                                  </button>
                                )}

                              {/* Pending change → approve / reject */}
                              {isPending && onApproveRoster && (
                                <button
                                  onClick={() => onApproveRoster(w.id)}
                                  title="Approve"
                                  className="w-6 h-6 flex items-center justify-center rounded-md text-green-600 hover:bg-green-100 transition-colors"
                                >
                                  <Check size={13} />
                                </button>
                              )}
                              {isPending && onRejectRoster && (
                                <button
                                  onClick={() => setRejectRosterId(w.id)}
                                  title="Reject"
                                  className="w-6 h-6 flex items-center justify-center rounded-md text-red-500 hover:bg-red-100 transition-colors"
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Overtime */}
            {overtimeEntries.length > 0 && (
              <>
                <div className="border-t border-gray-100" />
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Overtime ({overtimeEntries.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {overtimeEntries.map((ot) => (
                      <div
                        key={ot.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50"
                      >
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            {ot.hours}h — {moment(ot.date).format("MMM D")}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {ot.start_time?.slice(0, 5)} – {ot.end_time?.slice(0, 5)}
                            {ot.notes && ` · ${ot.notes}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {onEditOvertime && (
                            <button
                              onClick={() => onEditOvertime(schedule.id, ot.id)}
                              className="text-[10px] text-gray-500 hover:text-gray-900 px-1.5 py-1 rounded hover:bg-gray-100"
                            >
                              Edit
                            </button>
                          )}
                          {onDeleteOvertime && (
                            <button
                              onClick={() => onDeleteOvertime(schedule.id, ot.id)}
                              className="text-[10px] text-red-500 hover:text-red-700 px-1.5 py-1 rounded hover:bg-red-50"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-gray-100 px-6 py-4">
            <div className="flex gap-2">
              {onReschedule && (
                <button
                  onClick={() => onReschedule(schedule)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                  <Move size={14} />
                  Reschedule
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(schedule.id)}
                  className="py-2.5 px-3 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Worker Modal */}
      {selectedDay && (
        <DailyWorkerModal
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          date={selectedDay}
          crewName={crewName}
          dayWorkers={selectedLog?.workers || []}
          availablePool={availablePool}
          status={selectedLog?.status || "confirmed"}
          rejectionReason={selectedLog?.rejectionReason}
          onSave={handleSaveDay}
          onAddDayWorker={(worker) => onAddDayWorker(selectedDay, worker)}
          onRemoveDayWorker={(swId) => onRemoveDayWorker(selectedDay, swId)}
        />
      )}

      {/* Reject Reason Modal */}
      {rejectTarget && (
        <RejectReasonModal
          isOpen={!!rejectTarget}
          onClose={() => setRejectTarget(null)}
          date={moment(rejectTarget.date).format("ddd, MMM D")}
          onConfirm={(reason) => {
            if (rejectTarget.id) {
              onRejectLog(schedule.id, rejectTarget.id, reason);
            }
            setRejectTarget(null);
          }}
        />
      )}

      {/* Roster change reject reason */}
      {rejectRosterId && (
        <RejectReasonModal
          isOpen={!!rejectRosterId}
          onClose={() => setRejectRosterId(null)}
          date={
            rosterWorkers.find((w) => w.id === rejectRosterId)?.name ??
            "this worker"
          }
          onConfirm={(reason) => {
            onRejectRoster?.(rejectRosterId, reason);
            setRejectRosterId(null);
          }}
        />
      )}
    </>
  );
}
