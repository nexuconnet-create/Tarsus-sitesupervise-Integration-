"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { authService } from "@/lib/services";
import { pendingEmail } from "@/lib/utils/authStorage";

function TwoFactorContent() {
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState<string>(() => searchParams.get("email") || pendingEmail.get() || "");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const updated = [...otp];
    updated[index] = value.slice(-1); // only one digit
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
    if (!email) {
      setError("Email not found. Please login again.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await authService.verifyEmailOtp(email, code);
      
      // This endpoint returns only a message — no tokens
      // After email verification the user must sign in to get a session
      pendingEmail.clear();
      setSuccess("Email verified successfully!");

      setTimeout(() => {
        router.push("/signin");
      }, 1500);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error || 
                          err?.response?.data?.detail ||
                          "Verification failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError("Email not found. Please login again.");
      return;
    }
    setResending(true);
    setError("");
    setSuccess("");
    try {
      await authService.forgotPassword(email);
      setSuccess("OTP has been resent to your email.");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError("Failed to resend OTP. Please try again.");
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
            <img src="/images/logo.png" alt="Site Supervise" className="w-16 h-16 mb-4" />
            <h1 className="text-2xl text-[#021422] font-extrabold text-center">SITE SUPERVISE</h1>
          </div>

          {/* Desktop top right link */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 hover:text-[#021422] transition"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Don&apos;t Have an Account?</span>
              <Link href="/register" className="border border-gray-800 px-5 py-2 rounded text-sm font-semibold hover:bg-gray-100 transition">
                Register
              </Link>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-3 text-[#021422]">
            Verify Two-Factor Authentication
          </h2>
          <p className="text-sm text-gray-500 mb-10 leading-relaxed">
            Review SMS delivery status for two factor authentication assigned to the Project Manager, Site Supervisor, and Site Engineer.
          </p>

          <form onSubmit={handleVerify}>
            {/* OTP Inputs */}
            <div className="flex items-center justify-between gap-3 mb-8" onPaste={handlePaste}>
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

            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm text-center mb-4">{success}</p>}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#021422] text-white py-4 rounded-full font-semibold hover:bg-[#0F181F] transition disabled:opacity-50 text-sm"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="w-full mt-4 border border-gray-300 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-50 transition disabled:opacity-50 text-sm"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          </form>

          {/* Mobile links */}
          <div className="md:hidden flex flex-col items-center gap-4 mt-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Don&apos;t have an account?</span>
              <Link href="/register" className="text-sm font-bold text-[#021422] underline">Register</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image Panel */}
      <div
        className="hidden md:flex flex-1 bg-cover bg-center relative items-center justify-center text-white"
        style={{ backgroundImage: "url('https://res.cloudinary.com/depeqzb6z/image/upload/v1763210704/site_revqzy.png')" }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative text-center px-6 flex flex-col justify-center h-full py-12">
          <div className="flex-1 flex flex-col justify-center">
            <img src="/images/white_logo.svg" alt="Site Supervise" className="mx-auto mb-6 w-28 h-auto" />
            <h1 className="text-4xl font-extrabold mb-4">SITE SUPERVISE</h1>
          </div>
          <p className="text-xl max-w-lg mx-auto mt-auto font-semibold">
            Manage, monitor, and analyze every construction project — all from one platform.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#021422]"></div>
      </div>
    }>
      <TwoFactorContent />
    </Suspense>
  );
}