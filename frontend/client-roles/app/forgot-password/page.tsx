"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services";
import { forgotPasswordToken } from "@/lib/utils/authStorage";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authService.forgotPassword(email);
      const sessionToken = response.data?.session_token;

      if (sessionToken) {
        forgotPasswordToken.set(sessionToken);
        router.push(`/forgot-password/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setMessage(
          "If this email is registered, a password reset OTP has been sent."
        );
      }
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; error?: string; detail?: string } };
        message?: string;
      };
      const errorData = axiosErr.response?.data;
      setError(
        errorData?.message ||
          errorData?.error ||
          errorData?.detail ||
          axiosErr.message ||
          "Failed to send reset email"
      );
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
            Forgot Password
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Enter your email and we&apos;ll send you a one-time code to reset
            your password.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full border border-gray-300 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />

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
              disabled={loading}
              className="w-full bg-[#021422] text-white py-4 rounded-full font-semibold hover:bg-[#0F181F] transition disabled:opacity-50 text-sm"
            >
              {loading ? "Sending..." : "Send Reset Code"}
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
