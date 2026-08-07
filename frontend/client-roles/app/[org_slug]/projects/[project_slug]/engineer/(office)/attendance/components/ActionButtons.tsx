"use client";

import { Download, Plus, Bell } from "lucide-react";

interface ActionButtonsProps {
  onExport: () => void;
  onAddStaff: () => void;
  onNotifyAbsent: () => void;
  onExportExcel: () => void;
  exporting: boolean;
  notifying: boolean;
}

export default function ActionButtons({
  onExport,
  onAddStaff,
  onNotifyAbsent,
  onExportExcel,
  exporting,
  notifying,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <button
        onClick={onExport}
        disabled={exporting}
        className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Download size={18} />
        {exporting ? "Exporting..." : "Export Daily Report"}
      </button>
      
      {/* <button
        onClick={onExportExcel}
        disabled={exporting}
        className="px-6 py-3 bg-[#0070D4] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <FileSpreadsheet size={18} />
        Export to Excel
      </button> */}
      
      <button
        onClick={onAddStaff}
        className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center gap-2"
      >
        <Plus size={18} />
        Add Staff
      </button>
      
      <button
        onClick={onNotifyAbsent}
        disabled={notifying}
        className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Bell size={18} />
        {notifying ? "Sending..." : "Notify Absent"}
      </button>
    </div>
  );
}
