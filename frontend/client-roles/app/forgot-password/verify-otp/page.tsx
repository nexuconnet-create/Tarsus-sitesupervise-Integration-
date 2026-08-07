"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { authService } from "@/lib/services";
import { extractApiError } from "@/lib/error";
import { forgotPasswordToken } from "@/lib/utils/authStorage";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    setError("");
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      inputs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }

    const sessionToken = forgotPasswordToken.get();
    if (!sessionToken) {
      setError("Session expired. Please start again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authService.forgotPasswordVerifyOtp(sessionToken, code);
      const newSessionToken = response.data?.session_token;

      if (newSessionToken) {
        forgotPasswordToken.set(newSessionToken);
        router.push(
          `/reset-password?email=${encodeURIComponent(email)}`
        );
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          data?: {
            message?: string | Record<string, unknown>;
            otp_code?: string[];
            error?: string;
            detail?: string;
          };
        };
      };
      const errorData = axiosErr.response?.data;
      let errorMessage = "Verification failed. Please try again.";

      if (errorData?.otp_code) {
        errorMessage = Array.isArray(errorData.otp_code)
          ? errorData.otp_code[0]
          : String(errorData.otp_code);
      } else if (typeof errorData?.message === "string") {
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

  const handleResendOtp = async () => {
    const sessionToken = forgotPasswordToken.get();
    if (!sessionToken) {
      setError("Session expired. Please start again.");
      return;
    }

    setResending(true);
    setError("");
    startCooldown(120);

    try {
      const response = await authService.forgotPasswordResendOtp(sessionToken);
      const newSessionToken = response.data?.session_token;

      if (newSessionToken) {
        forgotPasswordToken.set(newSessionToken);
      }
    } catch (err: unknown) {
      const appError = extractApiError(err);

      if (appError.code === "RATE_LIMITED") {
        setError("Too many requests. Please try again later.");
      } else {
        setError(appError.message || "Failed to resend OTP");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
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

          {/* Desktop back button */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 hover:text-[#021422] transition"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Remember your password?
              </span>
              <Link
                href="/signin"
                className="border border-gray-800 px-5 py-2 rounded text-sm font-semibold hover:bg-gray-100 transition"
              >
                Sign In
              </Link>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-3 text-[#021422]">
            Verify One-Time Code
          </h2>
          <p className="text-sm text-gray-500 mb-10 leading-relaxed">
            {email
              ? `We sent a 6-digit code to ${email}`
              : "Enter the 6-digit code sent to your email"}
          </p>

          <form onSubmit={handleVerify}>
            {/* OTP Inputs */}
            <div
              className="flex items-center justify-between gap-3 mb-8"
              onPaste={handlePaste}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="flex-1 max-w-[60px] aspect-square text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#021422] focus:ring-2 focus:ring-[#021422]/20 transition text-[#021422]"
                />
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#021422] text-white py-4 rounded-full font-semibold hover:bg-[#0F181F] transition disabled:opacity-50 text-sm"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending || cooldown > 0}
              className="w-full mt-4 border border-gray-300 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-50 transition disabled:opacity-50 text-sm"
            >
              {resending
                ? "Resending..."
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend Code"}
            </button>
          </form>

          {/* Mobile links */}
          <div className="md:hidden flex flex-col items-center gap-4 mt-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Remember your password?
              </span>
              <Link
                href="/signin"
                className="text-sm font-bold text-[#021422] underline"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image Panel */}
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
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-[#021422]" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
