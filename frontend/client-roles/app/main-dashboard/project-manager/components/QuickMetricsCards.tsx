"use client";

import React from "react";
import {
  BarChart3,
  Briefcase,
  DollarSign,
  AlertTriangle,
  Calendar,
  Users,
} from "lucide-react";

interface QuickMetricsCardsProps {
  projectProgress?: number;
  tasksCompleted?: number;
  tasksTotal?: number;
  budgetPercent?: number;
  budgetAmount?: string;
  risksOpen?: number;
  risksHigh?: number;
  deadlineDays?: number;
  deadlineDate?: string;
  teamActive?: number;
  teamTotal?: number;
}

const QuickMetricsCards: React.FC<QuickMetricsCardsProps> = ({
  projectProgress = 0,
  tasksCompleted = 0,
  tasksTotal = 0,
  budgetPercent = 0,
  budgetAmount = "—",
  risksOpen = 0,
  risksHigh = 0,
  deadlineDays = 0,
  deadlineDate = "—",
  teamActive = 0,
  teamTotal = 0,
}) => {
  const tasksPercent = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
  const teamPercent = teamTotal > 0 ? Math.round((teamActive / teamTotal) * 100) : 0;

  const cards = [
    {
      icon: <BarChart3 size={14} />,
      label: "PROJECT",
      line2: "PROGRESS",
      barPercent: projectProgress,
      barLabel: "",
      line4: `${projectProgress}%`,
    },
    {
      icon: <Briefcase size={14} />,
      label: "TASKS",
      line2: `${tasksCompleted}/${tasksTotal}`,
      barPercent: tasksPercent,
      barLabel: "COMPLETE",
      line4: `${tasksPercent}%`,
    },
    {
      icon: <DollarSign size={14} />,
      label: "BUDGET",
      line2: `${budgetPercent}% USED`,
      barPercent: budgetPercent,
      barLabel: "",
      line4: `${budgetAmount}/`,
    },
    {
      icon: <AlertTriangle size={14} />,
      label: "RISKS",
      line2: `${risksOpen} OPEN`,
      barPercent: risksOpen > 0 ? Math.min((risksHigh / risksOpen) * 100, 100) : 0,
      barLabel: "",
      line4: `${risksHigh} HIGH`,
    },
    {
      icon: <Calendar size={14} />,
      label: "DEADLINE",
      line2: `${deadlineDays} DAYS`,
      barPercent: 0,
      barLabel: "DAYS LEFT",
      line4: deadlineDate,
    },
    {
      icon: <Users size={14} />,
      label: "TEAM",
      line2: `${teamActive}/${teamTotal}`,
      barPercent: teamPercent,
      barLabel: "ACTIVE",
      line4: `${teamPercent}%`,
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-[#021422]" />
        <h2 className="text-sm font-bold text-[#021422] uppercase tracking-widest">
          QUICK METRICS CARDS
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-1.5 text-[#021422]">
              {card.icon}
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {card.label}
              </span>
            </div>

            <div className="text-sm font-bold text-[#021422]">
              {card.line2}
            </div>

            <div className="flex items-center gap-2">
              {card.barPercent > 0 && (
                <div className="flex-1 h-2 bg-gray-100 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-[#021422] transition-all duration-500"
                    style={{ width: `${Math.min(card.barPercent, 100)}%` }}
                  />
                </div>
              )}
              {card.barLabel && (
                <span className="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">
                  {card.barLabel}
                </span>
              )}
            </div>

            <div className="text-sm font-bold text-[#021422]">
              {card.line4}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickMetricsCards;
