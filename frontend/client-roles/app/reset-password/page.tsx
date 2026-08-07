"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/services";
import { forgotPasswordToken } from "@/lib/utils/authStorage";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(() => forgotPasswordToken.get());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!sessionToken) {
      setError("Session expired. Please request a new password reset.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await authService.forgotPasswordResetPassword(sessionToken, password);
      forgotPasswordToken.clear();
      setMessage(
        "Password reset successfully! Redirecting to sign in..."
      );
      setTimeout(() => router.push("/signin"), 2000);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          data?: {
            message?: string;
            error?: string;
            detail?: string;
            password?: string[];
          };
        };
      };
      const errorData = axiosErr.response?.data;
      let errorMessage = "Password reset failed";

      if (errorData?.password) {
        errorMessage = Array.isArray(errorData.password)
          ? errorData.password[0]
          : errorData.password;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side â€” Image panel */}
      <div
        className="hidden md:flex flex-1 bg-cover bg-center relative items-center justify-center text-white"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/depeqzb6z/image/upload/v1763210704/site_revqzy.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative text-center px-6 flex flex-col justify-center h-full py-12">
          <div className="flex-1 flex flex-col justify-center">
            <img
              src="/images/white_logo.svg"
              alt="Site Supervise"
              className="mx-auto mb-6 w-28 h-auto"
            />
            <h1 className="text-4xl font-extrabold mb-4">SITE SUPERVISE</h1>
          </div>
          <p className="text-xl max-w-lg mx-auto mt-auto font-semibold">
            Manage, monitor, and analyze every construction project — all from
            one platform.
          </p>
        </div>
      </div>

      {/* Right side â€” Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 md:px-16 py-12">
        <div className="max-w-lg w-full">
          {/* Mobile logo */}
          <div className="flex md:hidden flex-col items-center justify-center mb-8">
            <img
              src="/images/logo.png"
              alt="Site Supervise"
              className="w-16 h-16 mb-4"
            />
            <h1 className="text-2xl text-[#021422] font-extrabold text-center">
              SITE SUPERVISE
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-[#021422] mb-2">
            Reset Your Password
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            {email
              ? `Enter your new password for ${email}`
              : "Enter your new password below."}
          </p>

          {/* No session token guard */}
          {!sessionToken && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
              Session expired. Please request a new{" "}
              <Link href="/forgot-password" className="underline font-medium">
                password reset
              </Link>
              .
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* New password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full border border-gray-300 rounded-full px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            {/* Confirm password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full border border-gray-300 rounded-full px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            {message && (
              <div className="text-green-600 text-sm text-center bg-green-50 py-3 px-4 rounded-lg">
                {message}
              </div>
            )}
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !sessionToken}
              className="w-full bg-[#021422] text-white py-4 rounded-full font-semibold hover:bg-[#0F181F] transition disabled:opacity-50 text-sm"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="flex items-center justify-center">
              <Link
                href="/signin"
                className="text-sm font-bold underline text-[#021422] hover:text-[#0F181F] transition"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#021422]" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
