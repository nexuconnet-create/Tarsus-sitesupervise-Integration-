"use client";

import { useState, useMemo } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import type { AttendanceStatus } from "@/lib/types/attendance";
import { attendanceService } from "@/lib/services/attendanceService";
import { getErrorMessage } from "@/lib/error";
import { formatDate } from "@/lib/dateUtils";

interface Worker {
  id: string;
  memberId: string;
  name: string;
  trade: string;
  crew: string;
}

interface Schedule {
  id: string;
  taskName: string;
  title: string;
  durationFrom: string;
  durationTo: string;
  crews: {
    id: string;
    name: string;
    workers: {
      id: string;
      memberId: string;
      name: string;
      trade: string;
    }[];
  }[];
}

interface ScheduleBulkMarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule;
  projectUuid: string;
  scheduleId: string;
  onSuccess: () => void;
}

const STATUS_OPTIONS: {
  value: AttendanceStatus;
  label: string;
  color: string;
}[] = [
  { value: "present", label: "Present", color: "bg-green-500" },
  { value: "absent", label: "Absent", color: "bg-red-500" },
];

const STATUS_DROPDOWN_CLASSES: Record<string, string> = {
  present: "bg-green-50 border-green-200 text-green-700",
  absent: "bg-red-50 border-red-200 text-red-700",
};

export default function ScheduleBulkMarkModal({
  isOpen,
  onClose,
  schedule,
  projectUuid,
  scheduleId,
  onSuccess,
}: ScheduleBulkMarkModalProps) {
  const [loading, setLoading] = useState(false);
  const [applyingToAll, setApplyingToAll] = useState<AttendanceStatus | null>(
    null,
  );

  const allWorkers: Worker[] = useMemo(() => {
    return schedule.crews.flatMap((crew) =>
      crew.workers.map((w) => ({
        id: w.id,
        memberId: w.memberId,
        name: w.name,
        trade: w.trade,
        crew: crew.name,
      })),
    );
  }, [schedule]);

  const dates: string[] = useMemo(() => {
    const result: string[] = [];
    const start = new Date(schedule.durationFrom);
    const end = new Date(schedule.durationTo);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      result.push(d.toISOString().split("T")[0]);
    }
    return result;
  }, [schedule.durationFrom, schedule.durationTo]);

  const isSunday = (dateStr: string) => new Date(dateStr).getDay() === 0;

  const [attendance, setAttendance] = useState<
    Record<string, Record<string, AttendanceStatus>>
  >(() => {
    const initial: Record<string, Record<string, AttendanceStatus>> = {};
    dates.forEach((date) => {
      initial[date] = {};
      allWorkers.forEach((worker) => {
        initial[date][worker.id] = "present";
      });
    });
    return initial;
  });

  const handleStatusChange = (
    date: string,
    workerId: string,
    status: AttendanceStatus,
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [workerId]: status,
      },
    }));
  };

  const applyToAll = (status: AttendanceStatus) => {
    setApplyingToAll(status);
    setAttendance((prev) => {
      const updated = { ...prev };
      dates.forEach((date) => {
        if (!isSunday(date)) {
          updated[date] = {};
          allWorkers.forEach((worker) => {
            updated[date][worker.id] = status;
          });
        }
      });
      return updated;
    });
    setTimeout(() => setApplyingToAll(null), 300);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const workingDays = dates.filter((d) => !isSunday(d));

      // Check if all cells have the same status — if so, use the single-call bulkMarkSchedule.
      const allSameStatus = workingDays.every((date) =>
        allWorkers.every(
          (worker) => (attendance[date]?.[worker.id] || "present") === "present",
        ),
      );
      const allAbsent = workingDays.every((date) =>
        allWorkers.every(
          (worker) => (attendance[date]?.[worker.id] || "present") === "absent",
        ),
      );

      if (allSameStatus || allAbsent) {
        // Single API call for the entire schedule.
        const status = allAbsent ? "ABSENT" : "PRESENT";
        await attendanceService.bulkMarkSchedule(projectUuid, scheduleId, {
          status,
        });
        toast.success("Schedule attendance marked");
        onSuccess();
        onClose();
      } else {
        // Mixed statuses — one bulk-mark call per working day.
        const results = await Promise.allSettled(
          workingDays.map((date) =>
            attendanceService.bulkMark(projectUuid, scheduleId, {
              date,
              entries: allWorkers.map((worker) => ({
                schedule_worker_id: worker.id,
                status:
                  (attendance[date]?.[worker.id] || "present") === "absent"
                    ? "ABSENT"
                    : "PRESENT",
              })),
            }),
          ),
        );

        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length === workingDays.length) {
          toast.error(getErrorMessage((failed[0] as PromiseRejectedResult).reason));
        } else {
          if (failed.length > 0) {
            toast.error(
              `${failed.length} of ${workingDays.length} day(s) could not be marked (locked or non-working).`,
            );
          }
          toast.success("Schedule attendance marked");
          onSuccess();
          onClose();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const totalRecords = dates.length * allWorkers.length;
  const excusedDays = dates.filter(isSunday).length;
  const editableRecords = totalRecords - excusedDays * allWorkers.length;

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Mark Schedule Attendance
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {schedule.title} — {formatDate(schedule.durationFrom)} to{" "}
              {formatDate(schedule.durationTo)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
              Apply to All (Mon-Sat):
            </span>
            <div className="flex gap-1">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => applyToAll(opt.value)}
                  disabled={applyingToAll !== null}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${opt.color} text-white hover:opacity-90 disabled:opacity-50`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-gray-500">
            <span className="font-bold">{allWorkers.length}</span> workers ×{" "}
            <span className="font-bold">{dates.length - excusedDays}</span> days
            = <span className="font-bold">{editableRecords}</span> records to
            mark
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="sticky left-0 bg-gray-50 z-10 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                  Worker
                </th>
                {dates.map((date) => {
                  const sun = isSunday(date);
                  return (
                    <th
                      key={date}
                      className={`px-2 py-3 text-center text-[9px] font-bold uppercase tracking-wider whitespace-nowrap ${
                        sun ? "bg-gray-100 text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {formatDateShort(date)}
                      {sun && (
                        <span className="block text-[8px] font-normal">
                          (Excused)
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {allWorkers.map((worker) => (
                <tr
                  key={worker.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="sticky left-0 bg-white z-10 px-4 py-2 whitespace-nowrap">
                    <div className="text-xs font-semibold text-gray-900">
                      {worker.name}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {worker.crew}
                    </div>
                  </td>
                  {dates.map((date) => {
                    const sun = isSunday(date);
                    const status = attendance[date]?.[worker.id] || "present";
                    return (
                      <td
                        key={`${date}-${worker.id}`}
                        className={`px-2 py-2 text-center ${sun ? "bg-gray-50" : ""}`}
                      >
                        {sun ? (
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                            Exc
                          </span>
                        ) : (
                          <select
                            value={status}
                            onChange={(e) =>
                              handleStatusChange(
                                date,
                                worker.id,
                                e.target.value as AttendanceStatus,
                              )
                            }
                            className={`w-full px-1 py-1 rounded border text-[10px] font-bold uppercase cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                              STATUS_DROPDOWN_CLASSES[status]
                            }`}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total cumulative attendance */}
        {/*<div className="h-1/12px] text-gray-600">
          Cummulative Attendance
          <p>Total Present: 40, Total Absent: 10</p>
        </div>
        <div className="">
          Total Records: <p>Total Present: 20, Total Absent: 10</p>
        </div>*/}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 bg-[#021422] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Submit Attendance
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
