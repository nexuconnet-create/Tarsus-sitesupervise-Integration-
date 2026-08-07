"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, ArrowLeft } from "lucide-react";
import { authService } from "@/lib/services";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirm: "",
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const toggleShow = (field: "current" | "new" | "confirm") => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.current_password) {
      toast.error("Current password is required");
      return;
    }
    if (formData.new_password.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (formData.new_password !== formData.new_password_confirm) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(formData);
      toast.success("Password changed successfully");
      setFormData({
        current_password: "",
        new_password: "",
        new_password_confirm: "",
      });
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          data?: {
            message?: string;
            error?: string;
            current_password?: string[];
            new_password?: string[];
          };
        };
      };
      const errorData = axiosErr.response?.data;
      let errorMessage = "Failed to change password";

      if (errorData?.current_password) {
        errorMessage = Array.isArray(errorData.current_password)
          ? errorData.current_password[0]
          : errorData.current_password;
      } else if (errorData?.new_password) {
        errorMessage = Array.isArray(errorData.new_password)
          ? errorData.new_password[0]
          : errorData.new_password;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#021422]">
                Change Password
              </h1>
              <p className="text-sm text-gray-500">
                Update your account password
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Password</p>
              <p className="text-sm text-gray-500">
                Choose a strong password you haven&apos;t used before
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={show.current ? "text" : "password"}
                  value={formData.current_password}
                  onChange={(e) =>
                    updateField("current_password", e.target.value)
                  }
                  autoComplete="current-password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleShow("current")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={show.new ? "text" : "password"}
                  value={formData.new_password}
                  onChange={(e) => updateField("new_password", e.target.value)}
                  autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleShow("new")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm new password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={show.confirm ? "text" : "password"}
                  value={formData.new_password_confirm}
                  onChange={(e) =>
                    updateField("new_password_confirm", e.target.value)
                  }
                  autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleShow("confirm")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#021422] text-white py-3.5 rounded-lg font-semibold hover:bg-[#0F181F] transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock size={16} />
                )}
                {loading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
