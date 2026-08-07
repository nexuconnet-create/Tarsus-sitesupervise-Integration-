"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAttendanceData } from "./hooks/useAttendanceData";
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

export default function AttendancePage() {
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
  } = useAttendanceData();

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleBulkModal, setShowScheduleBulkModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerData | null>(null);

  const [bulkMarking, setBulkMarking] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleEditWorker = (worker: WorkerData) => {
    setSelectedWorker(worker);
    setShowEditModal(true);
  };

  const handleSaveRecord = (data: { status: AttendanceStatus; checkIn: string; checkOut: string; notes: string }) => {
    console.log("Save record:", { worker: selectedWorker, ...data });
  };

  const handleDeleteRecord = () => {
    console.log("Delete record:", selectedWorker);
  };

  const handleBulkMarkSubmit = () => {
    setShowBulkModal(false);
    refreshData();
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      toast.success("Attendance exported successfully");
      setExporting(false);
    }, 1000);
  };

  const handleSubmitAttendance = () => {
    toast.success("Attendance submitted successfully");
  };

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);

  return (
    <div className="p-6 md:p-8 space-y-8 pb-32 bg-[#F8F9FA] min-h-screen">
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

      <AttendanceTable
        workers={filteredWorkers}
        loading={loading}
        selectedDate={selectedDate}
        onEditWorker={handleEditWorker}
      />

      <ActionButtons
        onAddRecord={() => toast.success("Add Record clicked")}
        onBulkMark={() => setShowBulkModal(true)}
        onNotify={() => setShowNotifyModal(true)}
        onExport={handleExport}
        onSubmitAttendance={handleSubmitAttendance}
        onMarkScheduleAttendance={() => setShowScheduleBulkModal(true)}
        showMarkScheduleButton={!!selectedScheduleId}
        bulkMarking={bulkMarking}
        notifying={notifying}
        exporting={exporting}
      />

<BulkMarkModal
      isOpen={showBulkModal}
      onClose={() => setShowBulkModal(false)}
      schedules={schedules}
      subTotal={subTotal}
      cumulativeTotal={cumulativeTotal}
      selectedDate={selectedDate}
      onSubmit={handleBulkMarkSubmit}
    />

      <NotifyModal
        isOpen={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        absentCount={dailySummary.absent}
        selectedDate={selectedDate}
      />

      <EditRecordModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedWorker(null);
        }}
        worker={selectedWorker}
        selectedDate={selectedDate}
        onSave={handleSaveRecord}
        onDelete={handleDeleteRecord}
      />

      {selectedSchedule && (
        <ScheduleBulkMarkModal
          isOpen={showScheduleBulkModal}
          onClose={() => setShowScheduleBulkModal(false)}
          schedule={{
            id: selectedSchedule.id,
            taskName: selectedSchedule.taskName,
            title: selectedSchedule.taskName,
            durationFrom: selectedDate,
            durationTo: selectedDate,
            crews: [],
          }}
          projectId={1}
          onSuccess={() => {
            setShowScheduleBulkModal(false);
            refreshData();
          }}
        />
      )}
    </div>
  );
}
