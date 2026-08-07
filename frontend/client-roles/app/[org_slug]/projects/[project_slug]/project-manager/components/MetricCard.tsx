"use client";

import React from "react";
import { motion } from "framer-motion";

interface MetricCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    trend?: string;
    progress?: number;
    unit?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subValue,
    trend,
    progress,
    unit,
}) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2 w-full">
                {title}
            </h3>

            <div className="relative flex items-center justify-center mb-4">
                {progress !== undefined && (
                    <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="38"
                            stroke="#E5E7EB"
                            strokeWidth="6"
                            fill="transparent"
                        />
                        <motion.circle
                            cx="48"
                            cy="48"
                            r="38"
                            stroke="#0166B0"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={238.76}
                            initial={{ strokeDashoffset: 238.76 }}
                            animate={{ strokeDashoffset: 238.76 - (progress / 100) * 238.76 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </svg>
                )}
                <div className={`${progress !== undefined ? "absolute" : ""} flex flex-col items-center`}>
                    <span className="text-sm p-4 font-bold text-gray-800">
                        {value}
                        {unit && <span className="text-base font-normal ml-1">{unit}</span>}
                    </span>
                </div>
            </div>

            {subValue && <div className="text-sm text-gray-500 mb-1">{subValue}</div>}
            {trend && (
                <div className={`text-sm font-medium ${trend.startsWith('+') ? "text-green-600" : "text-red-500"}`}>
                    ({trend})
                </div>
            )}
        </div>
    );
};

export default MetricCard;
