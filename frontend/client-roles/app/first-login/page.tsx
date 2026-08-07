"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { authService } from "@/lib/services";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

function FirstLoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    new_password: "",
    new_password_confirm: "",
  });
  const router = useRouter();
  const storeUser = useAuthStore((s) => s.user);
  const memberships = useAuthStore((s) => s.memberships);
  const updateUser = useAuthStore((s) => s.updateUser);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!storeUser?.email) {
      router.replace("/signin");
    }
  }, [_hasHydrated, storeUser, router]);

  const validatePassword = (): boolean => {
    if (formData.new_password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    // if (!/[A-Z]/.test(formData.new_password)) {
    //   setError("Password must contain at least one uppercase letter");
    //   return false;
    // }
    // if (!/[a-z]/.test(formData.new_password)) {
    //   setError("Password must contain at least one lowercase letter");
    //   return false;
    // }
    // if (!/[0-9]/.test(formData.new_password)) {
    //   setError("Password must contain at least one number");
    //   return false;
    // }
    if (formData.new_password !== formData.new_password_confirm) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const passwordMutation = useMutation({
    mutationFn: (data: { new_password: string; new_password_confirm: string }) =>
      authService.setInitialPassword(data),
    onSuccess: () => {
      updateUser({ must_change_password: false });
      setSuccess(true);
      toast.success("Password changed successfully!");

      setTimeout(() => {
        router.replace("/onboarding/complete-profile");
      }, 1500);
    },
    onError: (err: unknown) => {
      const axiosErr = err as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
            error?: string;
          };
        };
      };
      let errorMessage = "Failed to change password";
      if (axiosErr.response?.data) {
        const errorData = axiosErr.response.data;
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      setError(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validatePassword()) return;

    passwordMutation.mutate({
      new_password: formData.new_password,
      new_password_confirm: formData.new_password_confirm,
    });
  };

  if (!storeUser?.email) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Password Changed
          </h1>
          <p className="text-gray-600 mb-6">
            Your password has been updated successfully. Redirecting you to your
            dashboard...
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#021422]" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="max-w-md w-full">
          {/* Mobile logo */}
          <div className="md:hidden mb-8 text-center">
            <img
              src="/images/logo.png"
              alt="Site Supervise"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h1 className="text-xl font-bold text-[#021422]">
              Change Your Password
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Create a new secure password to continue
            </p>
          </div>

          {/* Lock icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#021422]/10 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#021422]" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#021422]">
              Create New Password
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Your new password must be different from the temporary password
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={formData.new_password}
                  onChange={(e) =>
                    setFormData({ ...formData, new_password: e.target.value })
                  }
                  autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.new_password_confirm}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      new_password_confirm: e.target.value,
                    })
                  }
                  autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#021422] text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <Eye size={20} />
                  ) : (
                    <EyeOff size={20} />
                  )}
                </button>
              </div>
            </div>
            {/*{/* Password Requirements
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Password requirements:
              </p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      formData.new_password.length >= 8
                        ? "bg-green-500 text-white"
                        : "bg-gray-300"
                    }`}
                  >
                    {formData.new_password.length >= 8 && (
                      <CheckCircle size={10} />
                    )}
                  </span>
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      /[A-Z]/.test(formData.new_password)
                        ? "bg-green-500 text-white"
                        : "bg-gray-300"
                    }`}
                  >
                    {/[A-Z]/.test(formData.new_password) && (
                      <CheckCircle size={10} />
                    )}
                  </span>
                  One uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      /[a-z]/.test(formData.new_password)
                        ? "bg-green-500 text-white"
                        : "bg-gray-300"
                    }`}
                  >
                    {/[a-z]/.test(formData.new_password) && (
                      <CheckCircle size={10} />
                    )}
                  </span>
                  One lowercase letter
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      /[0-9]/.test(formData.new_password)
                        ? "bg-green-500 text-white"
                        : "bg-gray-300"
                    }`}
                  >
                    {/[0-9]/.test(formData.new_password) && (
                      <CheckCircle size={10} />
                    )}
                  </span>
                  One number
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      formData.new_password === formData.new_password_confirm &&
                      formData.new_password_confirm.length > 0
                        ? "bg-green-500 text-white"
                        : "bg-gray-300"
                    }`}
                  >
                    {formData.new_password === formData.new_password_confirm &&
                      formData.new_password_confirm.length > 0 && (
                        <CheckCircle size={10} />
                      )}
                  </span>
                  Passwords match
                </li>
              </ul>
            </div>*/}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="w-full bg-[#021422] text-white py-4 rounded-xl font-semibold hover:bg-[#0F181F] transition disabled:opacity-50 text-sm"
            >
              {passwordMutation.isPending ? "Updating Password..." : "Update Password"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            After updating, you&apos;ll be redirected to your dashboard
          </p>
        </div>
      </div>

      {/* Right side - Info */}
      <div className="hidden md:flex flex-1 bg-[#021422] items-center justify-center text-white">
        <div className="max-w-md px-8">
          <img
            src="/images/white_logo.svg"
            alt="Site Supervise"
            className="mx-auto mb-8 w-32"
          />
          <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-center">
            Change Your Password
          </h1>
          <p className="text-gray-300 mb-6 text-center">
            You&apos;re using a temporary password. Please create a new, secure
            password to continue.
          </p>
          <div className="bg-white/10 rounded-xl p-4 space-y-3">
            <p className="text-sm text-gray-300">
              Logged in as:{" "}
              <span className="text-white font-medium">{storeUser?.email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FirstLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-12 h-12 animate-spin text-[#021422]" />
        </div>
      }
    >
      <FirstLoginContent />
    </Suspense>
  );
}
