"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Phone, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { authService } from "@/lib/services";
import { useAuthStore } from "@/lib/stores/authStore";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => ({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone_number: user?.phone_number || "",
  }));

  useEffect(() => {
    if (!user?.email) {
      router.replace("/signin");
      return;
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setLoading(true);
    try {
      const payload: {
        first_name: string;
        last_name: string;
        phone_number?: string;
      } = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      };
      if (formData.phone_number.trim()) {
        payload.phone_number = formData.phone_number.trim();
      }

      await authService.patchProfile(payload);

      updateUser({
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone_number: payload.phone_number,
      });

      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user?.email) return null;

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
              <h1 className="text-2xl font-bold text-[#021422]">Profile</h1>
              <p className="text-sm text-gray-500">
                Update your personal information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          {/* Avatar placeholder */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 bg-[#021422]/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-[#021422]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {user.first_name || user.name || user.email}
              </p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  placeholder="+1 234 567 8900"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Link
                href="/settings/change-password"
                className="text-sm font-medium text-[#021422] underline hover:text-[#0F181F] transition"
              >
                Change password
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-[#021422] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0F181F] transition disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
