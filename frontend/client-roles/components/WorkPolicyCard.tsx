"use client";

/* eslint-disable react-hooks/set-state-in-effect -- hydrate the form when the policy query resolves. */

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { useWorkPolicy, useUpdateWorkPolicy } from "@/lib/hooks/useWorkPolicy";

interface WorkPolicyCardProps {
  orgSlug: string;
}

const DAYS = [
  { key: "work_monday", label: "Mon" },
  { key: "work_tuesday", label: "Tue" },
  { key: "work_wednesday", label: "Wed" },
  { key: "work_thursday", label: "Thu" },
  { key: "work_friday", label: "Fri" },
  { key: "work_saturday", label: "Sat" },
  { key: "work_sunday", label: "Sun" },
] as const;

export default function WorkPolicyCard({ orgSlug }: WorkPolicyCardProps) {
  const { data: policy, isLoading } = useWorkPolicy(orgSlug);
  const updatePolicy = useUpdateWorkPolicy(orgSlug);

  const [form, setForm] = useState({
    work_monday: true,
    work_tuesday: true,
    work_wednesday: true,
    work_thursday: true,
    work_friday: true,
    work_saturday: false,
    work_sunday: false,
    default_start_time: "08:00",
    default_end_time: "17:00",
    late_grace_minutes: 0,
  });

  useEffect(() => {
    if (policy) {
      setForm({
        work_monday: policy.work_monday,
        work_tuesday: policy.work_tuesday,
        work_wednesday: policy.work_wednesday,
        work_thursday: policy.work_thursday,
        work_friday: policy.work_friday,
        work_saturday: policy.work_saturday,
        work_sunday: policy.work_sunday,
        default_start_time: policy.default_start_time?.slice(0, 5) ?? "08:00",
        default_end_time: policy.default_end_time?.slice(0, 5) ?? "17:00",
        late_grace_minutes: policy.late_grace_minutes ?? 0,
      });
    }
  }, [policy]);

  const toggleDay = (key: string) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSave = () => {
    updatePolicy.mutate({
      ...form,
      default_start_time: form.default_start_time + ":00",
      default_end_time: form.default_end_time + ":00",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#021422] p-5 text-center">
          <h2 className="text-white font-bold uppercase tracking-wider text-sm">
            Work Policy
          </h2>
        </div>
        <div className="p-8 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-[#0166B0]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-[#021422] p-5 text-center">
        <h2 className="text-white font-bold uppercase tracking-wider text-sm">
          Work Policy
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Working Days */}
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Working Days
          </span>
          <div className="flex gap-2 mt-3">
            {DAYS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleDay(key)}
                className={`w-12 h-10 rounded-lg text-xs font-bold transition-colors ${
                  form[key as keyof typeof form]
                    ? "bg-[#0166B0] text-white"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Default Shift Times */}
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Default Shift
          </span>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Start</label>
              <input
                type="time"
                value={form.default_start_time}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    default_start_time: e.target.value,
                  }))
                }
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0166B0]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">End</label>
              <input
                type="time"
                value={form.default_end_time}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    default_end_time: e.target.value,
                  }))
                }
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0166B0]"
              />
            </div>
          </div>
        </div>

        {/* Late Grace */}
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Late Grace Period
          </span>
          <div className="flex items-center gap-2 mt-3">
            <input
              type="number"
              min={0}
              value={form.late_grace_minutes}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  late_grace_minutes: Math.max(0, parseInt(e.target.value) || 0),
                }))
              }
              className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0166B0]"
            />
            <span className="text-xs text-gray-500">minutes after start time</span>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={updatePolicy.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-[#021422] text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {updatePolicy.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
