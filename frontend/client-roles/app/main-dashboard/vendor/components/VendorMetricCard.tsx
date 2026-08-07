"use client";

import React from "react";
import { motion } from "framer-motion";

interface VendorMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  bgColor?: string;
}

const VendorMetricCard: React.FC<VendorMetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendUp,
  bgColor = "bg-[#0D1B2A]",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-gray-100 text-[#0D1B2A]">{icon}</div>
        {trend && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              trendUp
                ? "bg-green-50 text-green-600"
                : "bg-yellow-50 text-yellow-600"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-lg font-bold text-[#0D1B2A]">{value}</p>
        <p className="text-xs text-gray-500 font-medium mt-0.5">{title}</p>
      </div>
    </motion.div>
  );
};

export default VendorMetricCard;
