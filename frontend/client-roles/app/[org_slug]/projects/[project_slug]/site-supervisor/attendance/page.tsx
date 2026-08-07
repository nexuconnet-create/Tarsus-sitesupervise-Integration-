"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { attendanceService } from "@/lib/services/attendanceService";
import { getErrorMessage } from "@/lib/error";
import { useAttendanceData } from "./hooks/useAttendanceData";
import { toApiStatus } from "@/lib/attendance/status";
import type { WorkerData, AttendanceStatus } from "./types";

import DailySummaryCards from "./components/DailySummaryCards";
import ScheduleFilter from "./components/ScheduleFilter";
import DateNavigator from "./components/DateNavigator";
import AttendanceTable from "./components/AttendanceTable";
import ActionButtons from "./components/ActionButtons";
import BulkMarkModal from "./components/BulkMarkModal";
import NotifyModal from "./components/NotifyModal";
import EditRecordModal from "./components/EditRecordModal";
import ScheduleBulkMarkModal from "./components/ScheduleBulkMarkModal";
import CrewHeader from "../component/CrewHeader";

export default function AttendancePage() {
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const { getProject } = useMemberships();
  const project = getProject(orgSlug, projectSlug);
  const { data: projectUuid } = useProjectUuid(orgSlug, projectSlug);
  const pid = projectUuid ?? "";

  const {
    loading,
    schedules,
    dailySummary,
    subTotal,
    cumulativeTotal,
    filteredWorkers,
    selectedDate,
    setSelectedDate,
    selectedScheduleId,
    setSelectedScheduleId,
    refreshData,
  } = useAttendanceData(projectUuid);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleBulkModal, setShowScheduleBulkModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerData | null>(null);
  const [exporting, setExporting] = useState(false);

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);

  const saveMutation = useMutation({
    mutationFn: (data: {
      status: AttendanceStatus;
      checkIn: string;
      checkOut: string;
      notes: string;
    }) => {
      if (!selectedWorker) throw new Error("No worker selected");
      const apiStatus = toApiStatus(data.status);
      const payload: {
        check_in: string | null;
        check_out: string | null;
        notes: string;
        status?: "ABSENT";
      } = {
        check_in: data.checkIn || null,
        check_out: data.checkOut || null,
        notes: data.notes,
      };
      // The backend only accepts ABSENT/ON_LEAVE on write; PRESENT/LATE/EARLY
      // are computed from check_in/check_out. Omit status entirely for attended
      // workers so the backend defaults to/computes the correct status.
      if (apiStatus) payload.status = apiStatus;
      // Use the worker's own scheduleId — in "all" mode each worker knows its schedule.
      const targetScheduleId = selectedWorker.scheduleId || selectedScheduleId;
      return selectedWorker.recordId
        ? attendanceService.updateRecord(
            pid,
            targetScheduleId,
            selectedWorker.recordId,
            payload,
          )
        : attendanceService.createRecord(pid, targetScheduleId, {
            ...payload,
            schedule_worker: selectedWorker.scheduleWorkerId,
            date: selectedDate,
          });
    },
    onSuccess: () => {
      toast.success("Attendance saved");
      refreshData();
      setShowEditModal(false);
      setSelectedWorker(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!selectedWorker?.recordId) throw new Error("No record to delete");
      const targetScheduleId = selectedWorker.scheduleId || selectedScheduleId;
      return attendanceService.deleteRecord(
        pid,
        targetScheduleId,
        selectedWorker.recordId,
      );
    },
    onSuccess: () => {
      toast.success("Record deleted");
      refreshData();
      setShowEditModal(false);
      setSelectedWorker(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      attendanceService.submit(pid, selectedScheduleId, selectedDate),
    onSuccess: () => {
      toast.success("Attendance submitted and locked");
      refreshData();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const notifyMutation = useMutation({
    mutationFn: (message: string) =>
      attendanceService.notifyAbsent(pid, selectedScheduleId, {
        date: selectedDate,
        message,
      }),
    onSuccess: () => toast.success("Absent workers notified"),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleEditWorker = (worker: WorkerData) => {
    setSelectedWorker(worker);
    setShowEditModal(true);
  };

  const handleExport = async () => {
    if (!selectedScheduleId) return;
    setExporting(true);
    try {
      const res = await attendanceService.exportCsv(
        pid,
        selectedScheduleId,
        selectedDate,
      );
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_${selectedDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 pb-32 bg-[#F8F9FA] min-h-screen">
      <CrewHeader title="Attendance" project={project?.name || projectSlug} />
      <DailySummaryCards summary={dailySummary} loading={loading} />

      <ScheduleFilter
        schedules={schedules}
        selectedScheduleId={selectedScheduleId}
        onScheduleChange={setSelectedScheduleId}
      />

      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onRefresh={refreshData}
        loading={loading}
      />

      {filteredWorkers.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center text-sm text-gray-500">
          No attendance records for this date. Select a schedule to mark attendance.
        </div>
      ) : (
        <AttendanceTable
          workers={filteredWorkers}
          loading={loading}
          selectedDate={selectedDate}
          onEditWorker={handleEditWorker}
        />
      )}

      <ActionButtons
        onAddRecord={() => toast("Use the table to edit a worker's record")}
        onBulkMark={() => setShowBulkModal(true)}
        onNotify={() => {
          if (!selectedScheduleId) { toast("Select a specific schedule first"); return; }
          setShowNotifyModal(true);
        }}
        onExport={handleExport}
        onSubmitAttendance={() => {
          if (!selectedScheduleId) { toast("Select a specific schedule first"); return; }
          submitMutation.mutate();
        }}
        onMarkScheduleAttendance={() => setShowScheduleBulkModal(true)}
        showMarkScheduleButton={!!selectedScheduleId}
        bulkMarking={submitMutation.isPending}
        notifying={notifyMutation.isPending}
        exporting={exporting}
      />

      <BulkMarkModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        schedules={
          selectedSchedule
            ? [
                {
                  ...selectedSchedule,
                  subtotalPresent: subTotal.present,
                  subtotalAbsent: subTotal.absent,
                },
              ]
            : []
        }
        subTotal={subTotal}
        cumulativeTotal={cumulativeTotal}
        selectedDate={selectedDate}
        onSubmit={() => submitMutation.mutate()}
      />

      <NotifyModal
        isOpen={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        absentCount={dailySummary.absent}
        selectedDate={selectedDate}
        onSend={(message) => notifyMutation.mutateAsync(message).then(() => {})}
      />

      <EditRecordModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedWorker(null);
        }}
        worker={selectedWorker}
        selectedDate={selectedDate}
        onSave={(data) => saveMutation.mutate(data)}
        onDelete={selectedWorker?.recordId ? () => deleteMutation.mutate() : undefined}
      />

      {selectedSchedule && (
        <ScheduleBulkMarkModal
          isOpen={showScheduleBulkModal}
          onClose={() => setShowScheduleBulkModal(false)}
          projectUuid={pid}
          scheduleId={selectedScheduleId}
          schedule={{
            id: selectedSchedule.id,
            taskName: selectedSchedule.taskName,
            title: selectedSchedule.taskName,
            durationFrom: selectedSchedule.durationFrom || selectedDate,
            durationTo: selectedSchedule.durationTo || selectedDate,
            crews: [
              {
                id: "roster",
                name: selectedSchedule.taskName,
                workers: filteredWorkers.map((w) => ({
                  id: w.scheduleWorkerId,
                  memberId: "",
                  name: w.name,
                  trade: "",
                })),
              },
            ],
          }}
          onSuccess={() => {
            setShowScheduleBulkModal(false);
            refreshData();
          }}
        />
      )}
    </div>
  );
}
