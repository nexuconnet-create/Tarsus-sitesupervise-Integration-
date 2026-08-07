"use client";

import { AlertTriangle, CheckCircle, ExternalLink, FileText } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const styles =
    s.includes("behind")   ? "bg-yellow-100 text-yellow-700" :
    s.includes("at risk")  ? "bg-red-100 text-red-700" :
    s.includes("ahead")    ? "bg-green-100 text-green-700" :
    s.includes("on track") ? "bg-green-100 text-green-700" :
    s.includes("complete") ? "bg-blue-100 text-blue-700" :
                             "bg-gray-100 text-gray-600";
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex-shrink-0 ${styles}`}>
      {status}
    </span>
  );
}

export interface AlertItem {
  id: string | number;
  title: string;
  description: string;
  severity: "critical" | "warning";
  status?: string;
  actionType?: "review_task" | "change_order" | "notify_team";
  taskId?: string | number;
}

interface Props {
  alerts: AlertItem[];
  onReviewTask?: (taskId: string | number) => void;
  onApproveChangeOrder?: () => void;
  onNotifyTeam?: (alert: AlertItem) => void;
}

export default function CriticalAlerts({ alerts, onReviewTask, onApproveChangeOrder, onNotifyTeam }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-3">
        <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
        <p className="text-sm font-medium text-green-700">No critical alerts — all performance metrics on track.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-red-700 text-white p-4 flex items-center gap-2">
        <AlertTriangle size={16} />
        <h3 className="font-bold text-sm">Critical Alerts ({alerts.length})</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <AlertTriangle
              size={16}
              className={`flex-shrink-0 mt-0.5 ${alert.severity === "critical" ? "text-red-500" : "text-yellow-500"}`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-[#021422]">{alert.title}</p>
                {alert.status && <StatusBadge status={alert.status} />}
              </div>
              <p className="text-xs text-gray-500">{alert.description}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {alert.actionType === "review_task" && alert.taskId && (
                <button
                  onClick={() => onReviewTask?.(alert.taskId!)}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-[#021422] hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink size={11} />
                  Engineer Review Required
                </button>
              )}
              {alert.actionType === "change_order" && (
                <button
                  onClick={onApproveChangeOrder}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  <FileText size={11} />
                  Approve Change Order
                </button>
              )}
              {alert.actionType === "notify_team" && (
                <button
                  onClick={() => onNotifyTeam?.(alert)}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-[#021422] hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink size={11} />
                  Engineer Review Required
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
