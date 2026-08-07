"use client";

import { X, Calendar, MapPin, Trash2, Move, FileText } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";
import moment from "moment";
import { useState } from "react";
import DailyTrackingCalendar from "./DailyTrackingCalendar";
import DailyWorkerModal from "./DailyWorkerModal";

interface Worker {
  id: string;
  memberId: string;
  name: string;
  trade: string;
}

interface DailyWorkerLog {
  date: string;
  workerIds: string[];
  status: "confirmed" | "pending" | "rejected";
  pendingWorkerIds?: string[];
  requestedBy?: string;
  requestedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
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
  workers?: Worker[];
  dailyWorkerLogs?: DailyWorkerLog[];
}

interface ScheduleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleItem | null;
  onDelete?: (scheduleId: string) => void;
  onReschedule?: (schedule: ScheduleItem) => void;
  onUpdateDailyLog: (
    scheduleId: string,
    date: string,
    workerIds: string[],
  ) => void;
  crewWorkers: Worker[];
  availablePool: Worker[];
  crewName: string;
}

export default function ScheduleDetailsModal({
  isOpen,
  onClose,
  schedule,
  onDelete,
  onReschedule,
  onUpdateDailyLog,
  crewWorkers,
  availablePool,
  crewName,
}: ScheduleDetailsModalProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  if (!isOpen || !schedule) return null;

  const scheduleDate = moment(schedule.start).format("dddd, DD MMM YYYY");
  const durationDays =
    moment(schedule.durationTo).diff(moment(schedule.durationFrom), "days") + 1;
  const dailyLogs = schedule.dailyWorkerLogs || [];

  const selectedLog = selectedDay
    ? dailyLogs.find((l) => l.date === selectedDay)
    : null;

  const handleSaveDay = (date: string, workerIds: string[]) => {
    onUpdateDailyLog(schedule.id, date, workerIds);
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
                <div className="flex items-center gap-2 mt-2">
                  <Calendar size={13} className="text-gray-400" />
                  <span className="text-sm text-gray-500">{scheduleDate}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} className="text-gray-600" />
              </button>
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
                    <span className="text-gray-300 text-sm">â†’</span>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold">
                        {" "}
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

            {/* Pending Worker Change Requests (read-only for crew manager) */}
            {dailyLogs.some((l) => l.status === "pending") && (
              <>
                <div className="border-t border-gray-100" />
                <div className="px-6 py-5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Pending Approvals (
                    {dailyLogs.filter((l) => l.status === "pending").length})
                  </p>
                  <div className="space-y-2">
                    {dailyLogs
                      .filter((l) => l.status === "pending")
                      .map((log) => (
                        <div
                          key={log.date}
                          className="border border-yellow-200 rounded-lg p-3 bg-yellow-50"
                        >
                          <p className="text-xs font-bold text-gray-900">
                            {moment(log.date).format("ddd, MMM D")}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {log.workerIds.length} â†’{" "}
                            {log.pendingWorkerIds?.length ||
                              log.workerIds.length}{" "}
                            workers
                          </p>
                          <p className="text-[10px] text-yellow-600 mt-1">
                            Awaiting approval from Project Engineer
                          </p>
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
          crewWorkers={crewWorkers}
          assignedWorkerIds={
            selectedLog?.workerIds || crewWorkers.map((w) => w.id)
          }
          availablePool={availablePool}
          status={selectedLog?.status || "confirmed"}
          rejectionReason={selectedLog?.rejectionReason}
          onSave={handleSaveDay}
        />
      )}
    </>
  );
}
