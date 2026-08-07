"use client";

import { useState, use } from "react";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useAttendanceData } from "./hooks/useAttendanceData";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { attendanceService } from "@/lib/services/attendanceService";
import { getErrorMessage } from "@/lib/error";

import DateNavigator from "./components/DateNavigator";
import ScheduleFilter from "./components/ScheduleFilter";
import AttendanceTable from "./components/AttendanceTable";
import ActionButtons from "./components/ActionButtons";
import EngineerHeader from "../components/EngineerHeader";

interface AttendancePageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function AttendancePage({ params }: AttendancePageProps) {
  const { org_slug, project_slug } = use(params);
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);
  const pid = projectUuid ?? "";

  const {
    loading,
    schedules,
    filteredWorkers,
    selectedDate,
    setSelectedDate,
    selectedScheduleId,
    setSelectedScheduleId,
    refreshData,
  } = useAttendanceData(projectUuid);

  const [exporting, setExporting] = useState(false);

  // Export and notify are per-schedule on the backend, so they require a
  // specific schedule selection (not the "all" rollup view).
  const requireSchedule = () => {
    if (selectedScheduleId === "all") {
      toast("Select a specific schedule first");
      return false;
    }
    return true;
  };

  const handleExport = async () => {
    if (!requireSchedule()) return;
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

  const notifyMutation = useMutation({
    mutationFn: () =>
      attendanceService.notifyAbsent(pid, selectedScheduleId, {
        date: selectedDate,
        message: "",
      }),
    onSuccess: () => toast.success("Absent workers notified"),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleNotifyAbsent = () => {
    if (requireSchedule()) notifyMutation.mutate();
  };

  // No endpoint for ad-hoc staff add from this screen (roster add is the
  // deferred schedule-planner flow) — kept as a stub.
  const handleAddStaff = () =>
    toast("Add staff is managed in the schedule planner");

  return (
    <div className="">
      <EngineerHeader
        title={
          project
            ? (project as { name?: string }).name
            : project_slug
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")
        }
        badge="ATTENDANCE & LABOUR MANAGEMENT"
      />

      <div className="space-y-6 pb-20 p-4 md:p-8 pt-8 bg-[#F8F9FA] min-h-screen">
        <div className="flex flex-wrap gap-4 items-stretch">
          <div className="flex-1 min-w-[400px]">
            <DateNavigator
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onRefresh={refreshData}
              loading={loading}
            />
          </div>
          <div className="flex-1 min-w-[400px]">
            <ScheduleFilter
              schedules={schedules}
              selectedScheduleId={selectedScheduleId}
              onScheduleChange={setSelectedScheduleId}
              loading={loading}
            />
          </div>
        </div>

        <AttendanceTable
          workers={filteredWorkers}
          schedules={schedules}
          loading={loading}
          selectedDate={selectedDate}
          selectedScheduleId={selectedScheduleId}
        />

        <ActionButtons
          onExport={handleExport}
          onAddStaff={handleAddStaff}
          onNotifyAbsent={handleNotifyAbsent}
          onExportExcel={handleExport}
          exporting={exporting}
          notifying={notifyMutation.isPending}
        />
      </div>
    </div>
  );
}
