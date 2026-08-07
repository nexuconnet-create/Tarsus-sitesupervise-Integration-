"use client";

import React from "react";

type PillVariant = "success" | "danger" | "warning" | "info" | "default";

interface StatusPillProps {
  label: string;
  variant?: PillVariant;
  size?: "sm" | "md";
  className?: string;
}

const variantStyles: Record<PillVariant, { bg: string; text: string }> = {
  success: { bg: "bg-[#DCFCE7]", text: "text-[#16A34A]" },
  danger: { bg: "bg-[#FEE2E2]", text: "text-[#DC2626]" },
  warning: { bg: "bg-[#FEF3C7]", text: "text-[#D97706]" },
  info: { bg: "bg-[#DBEAFE]", text: "text-[#2563EB]" },
  default: { bg: "bg-gray-100", text: "text-gray-600" },
};

const StatusPill: React.FC<StatusPillProps> = ({
  label,
  variant = "default",
  size = "sm",
  className = "",
}) => {
  const s = variantStyles[variant];
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center font-bold uppercase rounded-full ${sizeClass} ${s.bg} ${s.text} ${className}`}
    >
      {label}
    </span>
  );
};

export default StatusPill;
