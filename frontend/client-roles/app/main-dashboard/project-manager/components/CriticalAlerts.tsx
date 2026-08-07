"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Eye,
  Check,
  Plus,
  Share2,
  Bell,
} from "lucide-react";

export interface Alert {
  id: number | string;
  severity: "urgent" | "warning" | "insight" | "resolved";
  message: string;
  viewed?: boolean;
  acknowledged?: boolean;
}

interface CriticalAlertsProps {
  alerts?: Alert[];
}

const severityConfig = {
  urgent: {
    icon: <AlertCircle size={14} />,
    color: "text-red-600",
    dot: "bg-red-500",
    label: "URGENT",
  },
  warning: {
    icon: <AlertTriangle size={14} />,
    color: "text-amber-600",
    dot: "bg-amber-500",
    label: "WARNING",
  },
  insight: {
    icon: <Lightbulb size={14} />,
    color: "text-blue-600",
    dot: "bg-blue-500",
    label: "INSIGHT",
  },
  resolved: {
    icon: <CheckCircle size={14} />,
    color: "text-emerald-600",
    dot: "bg-emerald-500",
    label: "RESOLVED",
  },
};

const CriticalAlerts: React.FC<CriticalAlertsProps> = ({
  alerts = [],
}) => {
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<number | string>>(
    () => new Set(),
  );

  const handleAcknowledge = (id: number | string) => {
    setAcknowledgedIds((previous) => new Set(previous).add(id));
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={18} className="text-[#021422]" />
        <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
          CRITICAL ALERTS & RECOMMENDATIONS
        </h2>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="space-y-4">
          {alerts.length === 0 && (
            <p className="py-4 text-center text-sm font-medium text-gray-500">
              No critical alerts for this project.
            </p>
          )}
          {alerts.map((alert) => {
            const cfg = severityConfig[alert.severity];
            const acknowledged =
              alert.acknowledged || acknowledgedIds.has(alert.id);
            return (
              <div
                key={alert.id}
                className="flex flex-wrap items-center gap-3 py-3 border-b border-gray-100 last:border-0"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} shrink-0`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color} shrink-0`}>
                  {cfg.label}
                </span>
                <span className="text-sm text-[#021422] font-medium flex-1">
                    — {alert.message}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                    <Eye size={12} />
                    View
                  </button>
                  {alert.severity !== "resolved" && !acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                    >
                      <Check size={12} />
                      Acknowledge
                    </button>
                  )}
                  {alert.severity === "insight" && (
                    <button className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                      <Plus size={12} />
                      Create Task
                    </button>
                  )}
                  {acknowledged && (
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">
                      ✓ Acknowledged
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-gray-100">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <Bell size={14} />
            View All Alerts ({alerts.length})
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#021422] bg-[#021422] text-white rounded hover:bg-gray-800 transition-colors">
            <Plus size={14} />
            Create New
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <Share2 size={14} />
            Share with Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default CriticalAlerts;
